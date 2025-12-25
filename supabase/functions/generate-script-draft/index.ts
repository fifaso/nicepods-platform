// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 12.1 (Enterprise Grade - Total Type Safety & Provenance)

import { serve } from "std/http/server.ts";
import { createClient, SupabaseClient } from "supabase";
import { guard } from "guard";
import { corsHeaders } from "cors";
import { AI_MODELS, callGemini, parseAIJson, buildPrompt } from "ai-core";

/**
 * Contratos de datos para eliminar el uso de 'any'
 */
interface ResearchSource {
  title: string;
  url: string;
  snippet: string;
}

interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

interface RawInputs {
  topic?: string;
  topicA?: string;
  topicB?: string;
  question?: string;
  motivation?: string;
  archetype_topic?: string;
  archetype_goal?: string;
  archetype?: string;
  catalyst?: string;
}

const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SERVICE_KEY);

// Mapeo dinámico de cantidad de fuentes según profundidad
const DEPTH_MAP: Record<string, number> = {
  "Superficial": 3,
  "Intermedia": 5,
  "Profunda": 8
};

/**
 * Genera una búsqueda orientada a la personalidad y al propósito
 */
function generateSmartQuery(agent: string, purpose: string, inputs: RawInputs): string {
  const base = inputs.topic || inputs.topicA || inputs.question || "Conocimiento general";
  let bias = "hechos actuales y datos clave";

  if (agent.includes("rebel")) bias = "controversias, fallas de sistema y perspectivas críticas";
  if (agent.includes("sage")) bias = "principios fundamentales, verdades filosóficas y fundamentos";
  if (agent.includes("hero")) bias = "historias reales de éxito, hitos y superación";
  
  return `${purpose} sobre ${base}: ${bias}`;
}

async function conductResearch(query: string, depth: string): Promise<ResearchSource[]> {
  if (!TAVILY_API_KEY) return [];
  const maxResults = DEPTH_MAP[depth] || 5;
  
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: query,
        search_depth: depth === "Profunda" ? "advanced" : "basic",
        max_results: maxResults,
      }),
    });

    if (!response.ok) return [];
    const data = await response.json();
    
    // FIX: Tipado explícito de la respuesta de Tavily
    return data.results.map((result: TavilyResult) => ({
      title: result.title,
      url: result.url,
      snippet: result.content.substring(0, 250) + "..."
    }));
  } catch (error) {
    console.error("Error en fase Tavily:", error);
    return [];
  }
}

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

  try {
    const { purpose, duration, depth, tone, style, raw_inputs } = await request.json();
    
    // 1. DETERMINAR ESTRATEGIA DE BÚSQUEDA
    const selectedAgent = tone || style || "solo-talk-narrator";
    const smartQuery = generateSmartQuery(selectedAgent, purpose, raw_inputs);

    // 2. FASE DE INVESTIGACIÓN (Tavily)
    console.log(`🔍 [${correlationId}] Investigando: ${smartQuery}`);
    const sources = await conductResearch(smartQuery, depth);

    // 3. RECUPERAR PROMPT MAESTRO
    const { data: promptEntry, error: promptError } = await supabaseAdmin
      .from('ai_prompts')
      .select('prompt_template')
      .eq('agent_name', 'script-architect-v1')
      .single();

    // FIX: Validación de nulo para eliminar error de compilación
    if (promptError || !promptEntry) {
      throw new Error("No se pudo localizar el prompt del Arquitecto en la base de datos.");
    }

    // 4. SÍNTESIS DE BORRADOR (Gemini 1.5 Pro para máxima calidad)
    const dossier = {
      main_thesis: smartQuery,
      sources: sources,
      key_facts: sources.map(s => s.snippet)
    };

    const finalPrompt = buildPrompt(promptEntry.prompt_template, {
      dossier_json: JSON.stringify(dossier),
      topic: raw_inputs.topic || smartQuery,
      duration: duration,
      depth: depth,
      style: tone || style || "Profesional",
      archetype: raw_inputs.archetype || "Ninguno"
    });

    console.log(`✍️ [${correlationId}] Redactando borrador final...`);
    const rawAiResponse = await callGemini(finalPrompt, AI_MODELS.PRO);
    const content = parseAIJson(rawAiResponse);

    // 5. RETORNO CON CUSTODIA DE FUENTES
    return new Response(JSON.stringify({ 
      success: true, 
      draft: {
        suggested_title: content.title || content.suggested_title || "Nuevo Podcast",
        script_body: content.script_body || content.text || "Contenido no generado.",
        sources: sources // <--- Las fuentes se envían al frontend para preservarlas
      },
      trace_id: correlationId
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido en generación de borrador";
    console.error(`🔥 [${correlationId}] Fallo en Borrador:`, msg);
    return new Response(JSON.stringify({ success: false, error: msg }), { status: 500 });
  }
};

serve(guard(handler));