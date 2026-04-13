// supabase/functions/get-local-discovery/index.ts
// VERSIÓN: 1.1 (Stable - No Errors & Fully Typed)

import { serve } from "std/http/server.ts";
import { createClient, SupabaseClient } from "supabase";
import { z } from "zod";
import { guard } from "guard";
import { corsHeaders } from "cors";
import { AI_MODELS, callGeminiMultimodal, parseAIJson, buildPrompt } from "ai-core";
import { getPlaceFromCoordinates } from "location";

interface TavilySource {
  title: string;
  uniformResourceLocator: string;
  content: string;
}

const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY") ?? "";
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "", 
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const DiscoveryPayloadSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  lens: z.enum(['Tesoros Ocultos', 'Historias de Pasillo', 'Sabor Local', 'Qué hacer ahora']),
  image_base64: z.string().optional()
});

const handler = async (request: Request): Promise<Response> => {
  const correlationIdentification = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

  try {
    const body = await request.json();
    const { latitude, longitude, lens, image_base64 } = DiscoveryPayloadSchema.parse(body);

    // 1. LOCALIZACIÓN HUMANIZADA
    const locationData = await getPlaceFromCoordinates(latitude, longitude);

    // 2. INTERPRETACIÓN VISUAL
    let detectedPointOfInterest = locationData.placeName;
    let visualContext = "Vista de calle estándar.";

    if (image_base64) {
      const { data: agent } = await supabaseAdmin
        .from('ai_prompts')
        .select('prompt_template')
        .eq('agent_name', 'visual-interpreter-v1')
        .single();

      if (agent) {
        const visionPrompt = buildPrompt(agent.prompt_template, { latitude, longitude });
        const visionRes = await callGeminiMultimodal(visionPrompt, image_base64, AI_MODELS.FLASH);
        const visionData = parseAIJson(visionRes);
        detectedPointOfInterest = visionData.detected_poi || detectedPointOfInterest;
        visualContext = visionData.visual_summary || visualContext;
      }
    }

    // 3. INVESTIGACIÓN GROUNDED (Tavily)
    const query = `Secretos y recomendaciones de ${lens} en ${detectedPointOfInterest}, ${locationData.cityName}`;
    const tavilyRes = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: TAVILY_API_KEY, query, max_results: 5 })
    });
    
    const research = await tavilyRes.json();
    const results: TavilySource[] = research.results || [];

    // 4. SÍNTESIS DEL CONCIERGE (Gemini 2.5 Pro)
    const { data: prompt } = await supabaseAdmin
      .from('ai_prompts')
      .select('prompt_template')
      .eq('agent_name', 'local-concierge-v1')
      .single();

    if (!prompt) throw new Error("Configuración de Concierge no encontrada.");

    const finalPrompt = buildPrompt(prompt.prompt_template, {
      detected_poi: detectedPointOfInterest,
      city: locationData.cityName,
      lens: lens,
      research_data: JSON.stringify(results),
      visual_context: visualContext
    });

    const conciergeRes = await callGeminiMultimodal(finalPrompt, undefined, AI_MODELS.PRO);
    const dossier = parseAIJson(conciergeRes);

    return new Response(JSON.stringify({
      success: true,
      trace_identification: correlationIdentification,
      dossier,
      sources: results.map((s: TavilySource) => ({ title: s.title, uniformResourceLocator: s.uniformResourceLocator }))
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Discovery failure";
    console.error(`🔥 [${correlationIdentification}] Error:`, msg);
    return new Response(JSON.stringify({ success: false, error: msg }), { status: 500 });
  }
};

serve(guard(handler));