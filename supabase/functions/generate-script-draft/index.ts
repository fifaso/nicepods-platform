// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 13.0 (Master Research Standard - Agent-Centric & Gemini 2.5 Pro)

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

/**
 * Refina la búsqueda según la personalidad del agente para un grounding más preciso.
 */
function getAgentBiasQuery(agent: string, topic: string): string {
  const lowAgent = agent.toLowerCase();
  if (lowAgent.includes("rebel")) return `controversias, fallas de sistema, críticas y paradojas sobre ${topic}`;
  if (lowAgent.includes("sage")) return `principios fundamentales, verdades científicas, ética y tesis sobre ${topic}`;
  if (lowAgent.includes("hero")) return `historias reales de superación, hitos históricos y éxitos sobre ${topic}`;
  if (lowAgent.includes("analyst")) return `datos técnicos, estadísticas, cronología y estructura detallada de ${topic}`;
  if (lowAgent.includes("explorer")) return `descubrimientos recientes, fronteras del conocimiento y misterios de ${topic}`;
  return `${topic} análisis profundo, hechos verificados y contexto actual`;
}

async function conductResearch(query: string, depth: string): Promise<ResearchSource[]> {
  if (!TAVILY_API_KEY) return [];
  // Cantidad de fuentes según profundidad: Superficial (3), Intermedia (5), Profunda (10)
  const limit = depth === "Profunda" ? 10 : depth === "Intermedia" ? 5 : 3;
  
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

    if (!response.ok) throw new Error("Tavily unreachable");
    const data = await response.json();
    return data.results.map((result: TavilyResult) => ({
      title: result.title,
      url: result.url,
      snippet: result.content.substring(0, 250) + "..."
    }));
  } catch (error) {
    console.error("Fase de investigación fallida, procediendo con conocimiento interno:", error);
    return [];
  }
}

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

  try {
    const { purpose, duration, depth, tone, style, raw_inputs } = await request.json();
    
    // 1. INVESTIGACIÓN ORIENTADA AL AGENTE
    const selectedAgent = tone || style || "solo-talk-narrator";
    const baseTopic = raw_inputs.topic || raw_inputs.topicA || raw_inputs.question || "Conocimiento general";
    const smartQuery = getAgentBiasQuery(selectedAgent, baseTopic);

    console.log(`🔍 [${correlationId}] Investigando con sesgo: ${selectedAgent}`);
    const sources = await conductResearch(smartQuery, depth);

    // 2. RECUPERACIÓN DE PROMPT MAESTRO
    const { data: promptEntry, error: promptError } = await supabaseAdmin
      .from('ai_prompts')
      .select('prompt_template')
      .eq('agent_name', 'script-architect-v1')
      .single();

    if (promptError || !promptEntry) throw new Error("Configuración de Arquitecto no encontrada.");

    // 3. SÍNTESIS CREATIVA (Gemini 2.5 Pro para redacción de élite)
    const dossier = {
      main_thesis: smartQuery,
      sources: sources,
      key_facts: sources.map(s => s.snippet)
    };

    const finalPrompt = buildPrompt(promptEntry.prompt_template, {
      dossier_json: JSON.stringify(dossier),
      topic: baseTopic,
      duration: duration || "Media",
      depth: depth || "Intermedia",
      style: tone || style || "Profesional",
      archetype: raw_inputs.archetype || "Ninguno"
    });

    console.log(`✍️ [${correlationId}] Redactando borrador con Gemini 2.5 Pro...`);
    const rawAiResponse = await callGemini(finalPrompt, AI_MODELS.PRO);
    const content = parseAIJson(rawAiResponse);

    // 4. RETORNO CON CUSTODIA DE FUENTES
    return new Response(JSON.stringify({ 
      success: true, 
      draft: {
        suggested_title: content.title || content.suggested_title || "Nuevo Podcast",
        script_body: content.script_body || content.text || "Contenido no generado.",
        sources: sources 
      },
      trace_id: correlationId
    }), { headers: { "Content-Type": "application/json" } });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error en borrador";
    console.error(`🔥 [${correlationId}] Fallo en Draft:`, msg);
    return new Response(JSON.stringify({ success: false, error: msg }), { status: 500 });
  }
};

serve(guard(handler));