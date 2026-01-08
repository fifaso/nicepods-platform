// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 14.4 (Master Standard - Multi-Key Extraction & Universal Deployment)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones con rutas relativas directas para evitar fallos de bundling en Dashboard
import { AI_MODELS, callGeminiMultimodal, parseAIJson, buildPrompt } from "../_shared/ai.ts";
import { guard } from "../_shared/guard.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface ResearchSource { title: string; url: string; snippet: string; }
interface TavilyResult { title: string; url: string; content: string; }

const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY") ?? "";
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

async function conductResearch(query: string, depth: string): Promise<ResearchSource[]> {
  if (!TAVILY_API_KEY) return [];
  const limit = depth === "Profundo" ? 10 : depth === "Medio" ? 5 : 3;
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: query,
        search_depth: depth === "Profundo" ? "advanced" : "basic",
        max_results: limit,
      }),
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.results.map((result: TavilyResult) => ({
      title: result.title,
      url: result.url,
      snippet: result.content.substring(0, 300) + "..."
    }));
  } catch (error) {
    console.error("Research Error:", error);
    return [];
  }
}

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

  try {
    const { purpose, agentName, inputs } = await request.json();
    if (!inputs) throw new Error("Objeto 'inputs' es obligatorio en el payload.");

    const baseTopic = inputs.solo_topic || inputs.question_to_answer || inputs.link_topicA || "Nuevo Conocimiento";
    const depth = inputs.narrativeDepth || "Medio";
    const selectedAgent = agentName || "script-architect-v1";

    // 1. Grounding (Investigación)
    const sources = await conductResearch(baseTopic, depth);

    // 2. Obtención de Prompt Maestro
    const { data: promptEntry, error: promptError } = await supabaseAdmin
      .from('ai_prompts')
      .select('prompt_template')
      .eq('agent_name', 'script-architect-v1')
      .single();

    if (promptError || !promptEntry) throw new Error("Prompt 'script-architect-v1' no encontrado en DB.");

    // 3. Prompt Building con Gemini 2.5 Pro
    const dossier = {
      sources: sources,
      key_facts: sources.map(s => s.snippet),
      situational_context: inputs.discovery_context || null
    };

    const finalPrompt = buildPrompt(promptEntry.prompt_template, {
      dossier_json: JSON.stringify(dossier),
      topic: baseTopic,
      duration: inputs.duration || "Media",
      depth: depth,
      style: selectedAgent,
      motivation: inputs.solo_motivation || inputs.archetype_goal || ""
    });

    console.log(`[Draft][${correlationId}] Procesando con Gemini 2.5 Pro`);

    const rawAiResponse = await callGeminiMultimodal(finalPrompt, inputs.imageContext, AI_MODELS.PRO);
    const content = parseAIJson(rawAiResponse) as any;

    // 4. EXTRACCIÓN ROBUSTA (Garantía de contenido visible)
    const finalText = content.script_body || content.text || content.script || content.content || "Error: El Agente no generó texto.";
    const finalTitle = content.title || content.suggested_title || baseTopic;

    return new Response(JSON.stringify({
      success: true,
      draft: {
        suggested_title: finalTitle,
        script_body: finalText,
        sources: sources
      },
      trace_id: correlationId
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error fatal en borrador";
    console.error(`🔥 [Draft][${correlationId}] Error:`, msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

serve(guard(handler));