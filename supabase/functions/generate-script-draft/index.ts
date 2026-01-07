// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 14.0 (Master Research Standard - Structured Inputs & Gemini 2.5 Pro)

import { serve } from "std/http/server.ts";
import { createClient, SupabaseClient } from "supabase";
import { guard, corsHeaders } from "guard";
import { AI_MODELS, callGeminiMultimodal, parseAIJson, buildPrompt } from "ai-core";

interface ResearchSource { title: string; url: string; snippet: string; }
interface TavilyResult { title: string; url: string; content: string; }

const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY") ?? "";
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "", 
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * Refina la búsqueda según la personalidad para un grounding preciso.
 */
function getAgentBiasQuery(agent: string, topic: string): string {
  const lowAgent = agent.toLowerCase();
  if (lowAgent.includes("rebel")) return `controversias y fallas de sistema sobre ${topic}`;
  if (lowAgent.includes("sage")) return `principios fundamentales y ética sobre ${topic}`;
  if (lowAgent.includes("hero")) return `historias de superación y éxito sobre ${topic}`;
  if (lowAgent.includes("analyst")) return `datos técnicos y estadísticas de ${topic}`;
  return `${topic} análisis profundo y contexto actual`;
}

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

    if (!response.ok) throw new Error("Tavily unreachable");
    const data = await response.json();
    return data.results.map((result: TavilyResult) => ({
      title: result.title,
      url: result.url,
      snippet: result.content.substring(0, 300) + "..."
    }));
  } catch (error) {
    console.error("Investigación fallida, usando conocimiento interno:", error);
    return [];
  }
}

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

  try {
    // 1. EXTRACCIÓN DEL NUEVO PAYLOAD ESTRUCTURADO (v5.0 Frontend)
    const { purpose, agentName, inputs } = await request.json();
    if (!inputs) throw new Error("Objeto 'inputs' requerido.");

    // Mapeo de variables internas desde el objeto estructurado
    const duration = inputs.duration || "Corta";
    const depth = inputs.narrativeDepth || "Medio";
    const selectedAgent = agentName || "script-architect-v1";
    
    // Resolución dinámica del tema semilla según la rama
    const baseTopic = 
        inputs.solo_topic || 
        (inputs.link_topicA ? `${inputs.link_topicA} + ${inputs.link_topicB}` : null) ||
        inputs.question_to_answer ||
        inputs.legacy_lesson ||
        "Conocimiento general";

    // 2. INVESTIGACIÓN CON Grounding (Tavily)
    const smartQuery = getAgentBiasQuery(selectedAgent, baseTopic);
    console.log(`🔍 [${correlationId}] Investigando: ${smartQuery}`);
    const sources = await conductResearch(smartQuery, depth);

    // 3. RECUPERACIÓN DE PROMPT MAESTRO
    const { data: promptEntry, error: promptError } = await supabaseAdmin
      .from('ai_prompts')
      .select('prompt_template')
      .eq('agent_name', 'script-architect-v1')
      .single();

    if (promptError || !promptEntry) throw new Error("Prompt maestro no encontrado.");

    // 4. SÍNTESIS CREATIVA (Gemini 2.5 Pro)
    const dossier = {
      main_thesis: smartQuery,
      sources: sources,
      key_facts: sources.map(s => s.snippet),
      situational_context: inputs.discovery_context || null
    };

    const finalPrompt = buildPrompt(promptEntry.prompt_template, {
      dossier_json: JSON.stringify(dossier),
      topic: baseTopic,
      duration: duration,
      depth: depth,
      style: selectedAgent,
      motivation: inputs.solo_motivation || inputs.archetype_goal || "Aportar valor masivo."
    });

    console.log(`✍️ [${correlationId}] Redactando borrador multimodal...`);
    
    // Usamos callGeminiMultimodal para soportar análisis de imagen si viene en el input
    const rawAiResponse = await callGeminiMultimodal(
        finalPrompt, 
        inputs.imageContext, 
        AI_MODELS.PRO
    );
    
    const content = parseAIJson(rawAiResponse) as any;

    // 5. RETORNO CON CUSTODIA DE DATOS
    return new Response(JSON.stringify({ 
      success: true, 
      draft: {
        suggested_title: content.title || content.suggested_title || baseTopic,
        script_body: content.script_body || content.text || "Error en generación de texto.",
        sources: sources 
      },
      trace_id: correlationId
    }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido en borrador";
    console.error(`🔥 [${correlationId}] Fallo en Draft:`, msg);
    return new Response(JSON.stringify({ success: false, error: msg }), { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

serve(guard(handler));