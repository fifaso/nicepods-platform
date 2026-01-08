// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 16.0 (Master Persistence Standard - Dedicated Table & Atomic Hydration)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones con rutas relativas directas para estabilidad en despliegue
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

/**
 * conductResearch: Grounding de datos en tiempo real para evitar alucinaciones.
 */
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
    const { purpose, agentName, inputs, draft_id } = await request.json();
    if (!inputs) throw new Error("Objeto 'inputs' es obligatorio para la síntesis.");

    // 1. IDENTIFICACIÓN Y SEGURIDAD
    const authHeader = request.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("Acceso no autorizado.");

    // 2. GOBERNANZA: Chequeo de Cuota (Solo para nuevos borradores)
    if (!draft_id) {
      const { data: quota, error: quotaErr } = await supabaseAdmin.rpc('check_draft_quota', { p_user_id: user.id });
      if (quotaErr || !quota.allowed) {
        return new Response(JSON.stringify({ success: false, error: quota?.reason || "Límite de borradores alcanzado." }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // 3. PROCESAMIENTO DE TEMAS Y MOTIVACIÓN
    const baseTopic = inputs.solo_topic || inputs.question_to_answer || inputs.link_topicA || "Nuevo Conocimiento";
    const selectedAgent = agentName || "script-architect-v1";

    // 4. INVESTIGACIÓN Grounding
    const sources = await conductResearch(baseTopic, inputs.narrativeDepth || "Medio");

    // 5. REDACCIÓN CON GEMINI 2.5 PRO
    const { data: promptEntry, error: promptError } = await supabaseAdmin
      .from('ai_prompts')
      .select('prompt_template')
      .eq('agent_name', 'script-architect-v1')
      .single();

    if (promptError || !promptEntry) throw new Error("Configuración del Agente Arquitecto no localizada.");

    const finalPrompt = buildPrompt(promptEntry.prompt_template, {
      topic: baseTopic,
      duration: inputs.duration || "Media",
      depth: inputs.narrativeDepth || "Medio",
      motivation: inputs.solo_motivation || inputs.archetype_goal || ""
    });

    console.log(`[Draft][${correlationId}] Sintetizando guion con Gemini 2.5 Pro...`);
    const rawAiResponse = await callGeminiMultimodal(finalPrompt, inputs.imageContext, AI_MODELS.PRO);
    const content = parseAIJson(rawAiResponse) as any;

    const finalText = content.script_body || content.text || content.content || "Error en generación de contenido.";
    const finalTitle = content.title || content.suggested_title || baseTopic;

    // 6. PERSISTENCIA ATÓMICA (La clave de la Hidratación)
    let finalDraftId = draft_id;

    if (draft_id) {
      // MODO ACTUALIZACIÓN: Refinamos el borrador existente
      const { error: updateError } = await supabaseAdmin
        .from('podcast_drafts')
        .update({
          title: finalTitle,
          script_text: { script_body: finalText },
          creation_data: { purpose, agentName, inputs },
          sources: sources,
          updated_at: new Date().toISOString()
        })
        .eq('id', draft_id)
        .eq('user_id', user.id);

      if (updateError) throw new Error("Error al actualizar borrador en Bóveda.");
    } else {
      // MODO CREACIÓN: Insertamos nuevo registro en tabla dedicada
      const { data: newDraft, error: dbError } = await supabaseAdmin
        .from('podcast_drafts')
        .insert({
          user_id: user.id,
          title: finalTitle,
          script_text: { script_body: finalText },
          creation_data: { purpose, agentName, inputs },
          sources: sources
        })
        .select('id')
        .single();

      if (dbError) throw new Error("Error al crear registro en Bóveda de Borradores.");
      finalDraftId = newDraft.id;

      // ACTUALIZAR RASTREO DE USO MENSUAL
      // Nota: Solo incrementamos si es una creación nueva.
      const { data: usage } = await supabaseAdmin.from('user_usage').select('drafts_created_this_month').eq('user_id', user.id).single();
      await supabaseAdmin.from('user_usage').update({
        drafts_created_this_month: (usage?.drafts_created_this_month || 0) + 1
      }).eq('user_id', user.id);
    }

    // 7. RESPUESTA FINAL
    return new Response(JSON.stringify({
      success: true,
      draft_id: finalDraftId,
      draft: {
        suggested_title: finalTitle,
        script_body: finalText,
        sources: sources
      },
      trace_id: correlationId
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error fatal en motor de borrador";
    console.error(`🔥 [Draft][${correlationId}] Error:`, msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

serve(guard(handler));