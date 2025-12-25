// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 12.2 (Final Stable - Gemini 2.5 Pro & Research Provenance)

import { serve } from "std/http/server.ts";
import { createClient, SupabaseClient } from "supabase";
import { guard } from "guard";
import { corsHeaders } from "cors";
import { AI_MODELS, callGemini, parseAIJson, buildPrompt } from "ai-core";

interface ResearchSource { title: string; url: string; snippet: string; }
interface TavilyResult { title: string; url: string; content: string; }

const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY") ?? "";
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "", 
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

async function conductResearch(query: string, depth: string): Promise<ResearchSource[]> {
  if (!TAVILY_API_KEY) return [];
  const limit = depth === "Profunda" ? 8 : depth === "Intermedia" ? 5 : 3;
  
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: query,
        search_depth: depth === "Profunda" ? "advanced" : "basic",
        max_results: limit,
      }),
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.results.map((r: TavilyResult) => ({
      title: r.title,
      url: r.url,
      snippet: r.content.substring(0, 250) + "..."
    }));
  } catch {
    return [];
  }
}

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

  try {
    const { purpose, duration, depth, tone, style, raw_inputs } = await request.json();
    
    // 1. INVESTIGACIÓN INTELIGENTE
    const baseTopic = raw_inputs.topic || raw_inputs.topicA || "Conocimiento general";
    const smartQuery = `${purpose} sobre ${baseTopic}: hechos y datos clave`;
    const sources = await conductResearch(smartQuery, depth);

    // 2. RECUPERACIÓN DE PROMPT
    const { data: promptEntry, error: promptError } = await supabaseAdmin
      .from('ai_prompts')
      .select('prompt_template')
      .eq('agent_name', 'script-architect-v1')
      .single();

    if (promptError || !promptEntry) throw new Error("Prompt maestro no localizado.");

    // 3. GENERACIÓN CON GEMINI 2.5 PRO (Via AI-Core)
    const finalPrompt = buildPrompt(promptEntry.prompt_template, {
      dossier_json: JSON.stringify({ main_thesis: smartQuery, sources }),
      topic: baseTopic,
      duration,
      depth,
      style: tone || style || "Profesional",
      archetype: raw_inputs.archetype || "Ninguno"
    });

    console.log(`✍️ [${correlationId}] Redactando borrador con Gemini 2.5 Pro...`);
    const rawAiResponse = await callGemini(finalPrompt, AI_MODELS.PRO);
    const content = parseAIJson(rawAiResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      draft: {
        suggested_title: content.title || content.suggested_title,
        script_body: content.script_body || content.text,
        sources: sources 
      },
      trace_id: correlationId
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error en borrador";
    console.error(`🔥 [${correlationId}] Error:`, msg);
    return new Response(JSON.stringify({ success: false, error: msg }), { status: 500 });
  }
};

serve(guard(handler));