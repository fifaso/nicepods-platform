// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 17.0 (Master Persistence & NKV Hybrid Integration)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones con rutas relativas directas (Alineadas con v7.0 de ai.ts)
import { AI_MODELS, callGeminiMultimodal, parseAIJson, buildPrompt, generateEmbedding } from "../_shared/ai.ts";
import { guard } from "../_shared/guard.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface ResearchSource { title: string; url: string; snippet: string; origin?: 'vault' | 'web'; }
interface TavilyResult { title: string; url: string; content: string; }

const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY") ?? "";
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * conductResearch: Grounding dual (Vault + Web)
 */
async function conductResearch(query: string, depth: string, queryVector: number[]): Promise<ResearchSource[]> {
  let vaultSources: ResearchSource[] = [];
  let webSources: ResearchSource[] = [];

  // 1. CONSULTA AL KNOWLEDGE VAULT (Costo $0 - Sabiduría Interna)
  try {
    const { data: vaultData } = await supabaseAdmin.rpc('search_knowledge_vault', {
      query_embedding: queryVector,
      match_threshold: 0.78,
      match_count: 5
    });
    if (vaultData) {
      vaultSources = vaultData.map((v: any) => ({
        title: v.title,
        url: v.url || "#",
        snippet: v.content,
        origin: 'vault' // Sello de Sabiduría Comunitaria
      }));
    }
  } catch (e) {
    console.error("Vault Search Bypass:", e.message);
  }

  // 2. CONSULTA A INTERNET (Tavily - Actualidad)
  if (TAVILY_API_KEY) {
    const limit = depth === "Profundo" ? 6 : 3;
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
      if (response.ok) {
        const data = await response.json();
        webSources = data.results.map((result: TavilyResult) => ({
          title: result.title,
          url: result.url,
          snippet: result.content.substring(0, 400) + "...",
          origin: 'web'
        }));
      }
    } catch (e) {
      console.error("Web Search Bypass:", e);
    }
  }

  return [...vaultSources, ...webSources];
}

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

  try {
    const { purpose, agentName, inputs, draft_id } = await request.json();
    if (!inputs) throw new Error("Inputs obligatorios.");

    // 1. IDENTIFICACIÓN Y GOBERNANZA
    const authHeader = request.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("No autorizado.");

    if (!draft_id) {
      const { data: quota } = await supabaseAdmin.rpc('check_draft_quota', { p_user_id: user.id });
      if (!quota?.allowed) throw new Error(quota?.reason || "Límite de cuota.");
    }

    const baseTopic = inputs.solo_topic || inputs.question_to_answer || inputs.link_topicA || "Conocimiento NicePod";

    // 2. GENERACIÓN DE VECTOR PARA BÚSQUEDA SEMÁNTICA
    const queryVector = await generateEmbedding(baseTopic);

    // 3. INVESTIGACIÓN HÍBRIDA (NKV + TAVILY)
    const sources = await conductResearch(baseTopic, inputs.narrativeDepth || "Medio", queryVector);

    // 4. SÍNTESIS CREATIVA (Gemini 2.5 Pro)
    const { data: promptEntry } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', 'script-architect-v1').single();

    const finalPrompt = buildPrompt(promptEntry?.prompt_template || "", {
      topic: baseTopic,
      dossier_json: JSON.stringify(sources), // Inyectamos fuentes etiquetadas
      duration: inputs.duration || "Media",
      depth: inputs.narrativeDepth || "Medio",
      motivation: inputs.solo_motivation || ""
    });

    console.log(`[Draft][${correlationId}] Sintetizando con Gemini 2.5 Pro + NKV Grounding`);
    const rawAiResponse = await callGeminiMultimodal(finalPrompt, inputs.imageContext, AI_MODELS.PRO);
    const content = parseAIJson(rawAiResponse) as any;

    const scriptBody = content.script_body || content.text || "Error en generación.";
    const finalTitle = content.title || content.suggested_title || baseTopic;

    // 5. PERSISTENCIA EN BÓVEDA DE BORRADORES
    let finalDraftId = draft_id;
    const draftData = {
      user_id: user.id,
      title: finalTitle,
      script_text: { script_body: scriptBody },
      creation_data: { purpose, agentName, inputs },
      sources: sources, // Guardamos con el flag de origen (vault/web)
      updated_at: new Date().toISOString()
    };

    if (draft_id) {
      await supabaseAdmin.from('podcast_drafts').update(draftData).eq('id', draft_id);
    } else {
      const { data: newDraft } = await supabaseAdmin.from('podcast_drafts').insert(draftData).select('id').single();
      finalDraftId = newDraft?.id;

      // Registro de uso mensual (solo si es nuevo)
      const { data: usage } = await supabaseAdmin.from('user_usage').select('drafts_created_this_month').eq('user_id', user.id).single();
      await supabaseAdmin.from('user_usage').update({ drafts_created_this_month: (usage?.drafts_created_this_month || 0) + 1 }).eq('user_id', user.id);
    }

    // 6. GATILLO DE APRENDIZAJE ASÍNCRONO (NKV Feedback Loop)
    // Solo enviamos a la refinería fuentes que vienen de la WEB (para no duplicar el Vault)
    const webSources = sources.filter(s => s.origin === 'web');
    if (webSources.length > 0) {
      webSources.forEach(s => {
        fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/vault-refinery`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: s.title,
            text: s.snippet,
            url: s.url,
            source_type: 'web',
            is_public: true
          })
        }).catch(() => { }); // Fire and forget
      });
    }

    return new Response(JSON.stringify({
      success: true,
      draft_id: finalDraftId,
      draft: { suggested_title: finalTitle, script_body: scriptBody, sources: sources },
      trace_id: correlationId
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error en motor de borrador";
    console.error(`🔥 [Draft][${correlationId}] Error:`, msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

serve(guard(handler));