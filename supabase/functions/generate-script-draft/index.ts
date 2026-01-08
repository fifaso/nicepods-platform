// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 15.0 (Persistence Hub - Full Savvy Draft & Quota Shield)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones con rutas relativas directas
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
 * conductResearch: Grounding vía Tavily
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
    const { purpose, agentName, inputs } = await request.json();
    if (!inputs) throw new Error("Objeto 'inputs' es obligatorio.");

    // 1. IDENTIFICACIÓN DEL USUARIO (Vía JWT)
    const authHeader = request.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("No autorizado.");

    // 2. GOBERNANZA: Verificación de Cuota de Borradores
    const { data: quota, error: quotaErr } = await supabaseAdmin.rpc('check_draft_quota', { p_user_id: user.id });
    if (quotaErr || !quota.allowed) {
      return new Response(JSON.stringify({ success: false, error: quota?.reason || "Límite de borradores alcanzado." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 3. PROCESAMIENTO DE TEMAS
    const baseTopic = inputs.solo_topic || inputs.question_to_answer || inputs.link_topicA || "Nuevo Conocimiento";
    const selectedAgent = agentName || "script-architect-v1";

    // 4. INVESTIGACIÓN (Grounding)
    const sources = await conductResearch(baseTopic, inputs.narrativeDepth || "Medio");

    // 5. REDACCIÓN CON GEMINI 2.5 PRO
    const { data: promptEntry } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', 'script-architect-v1').single();
    const finalPrompt = buildPrompt(promptEntry?.prompt_template || "", {
      topic: baseTopic,
      duration: inputs.duration || "Media",
      depth: inputs.narrativeDepth || "Medio",
      motivation: inputs.solo_motivation || inputs.archetype_goal || ""
    });

    const rawAiResponse = await callGeminiMultimodal(finalPrompt, inputs.imageContext, AI_MODELS.PRO);
    const content = parseAIJson(rawAiResponse) as any;

    const finalText = content.script_body || content.text || content.content || "Error en generación.";
    const finalTitle = content.title || content.suggested_title || baseTopic;

    // 6. PERSISTENCIA ATÓMICA (Custodia de Datos)
    // Guardamos el borrador para que el usuario pueda retomarlo después.
    const { data: draftPod, error: dbError } = await supabaseAdmin
      .from('micro_pods')
      .insert({
        user_id: user.id,
        title: finalTitle,
        description: content.ai_summary || finalText.substring(0, 200),
        script_text: JSON.stringify({
          script_body: finalText,
          script_plain: finalText.replace(/<[^>]+>/g, " ").trim()
        }),
        status: 'draft',
        creation_data: { purpose, agentName, inputs }, // Meta-data íntegra para hidratación
        sources: sources
      })
      .select('id')
      .single();

    if (dbError) throw new Error("Error al persistir borrador.");

    // 7. ACTUALIZAR RASTREO DE USO
    await supabaseAdmin.from('user_usage').update({
      drafts_created_this_month: (await supabaseAdmin.from('user_usage').select('drafts_created_this_month').eq('user_id', user.id).single()).data.drafts_created_this_month + 1
    }).eq('user_id', user.id);

    return new Response(JSON.stringify({
      success: true,
      draft_id: draftPod.id,
      draft: { suggested_title: finalTitle, script_body: finalText, sources: sources },
      trace_id: correlationId
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error fatal";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

serve(guard(handler));