// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 27.0 (Architect Sovereign - Unified Narrative Engine)
// Misión: Transmutar fuentes crudas en narrativa final aplicando personalidad dinámica.
// [ESTRATEGIA]: Consolidación en Agente 38 para eliminar errores de contexto y ahorrar CPU.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo NicePod sincronizado (v11.6+)
import { AI_MODELS, buildPrompt, callGeminiMultimodal, cleanTextForSpeech, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * CLIENTE SUPABASE ADMIN:
 * Persistente para optimizar Warm-starts en la infraestructura Edge.
 */
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * handler: Orquestador de la Redacción de Guiones.
 */
async function handler(request: Request): Promise<Response> {
  // Protocolo rápido de CORS para permitir tráfico interno y externo controlado
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let targetDraftId: string | null = null;

  try {
    // 1. RECEPCIÓN DE INTENCIÓN
    const payload = await request.json();
    const { draft_id } = payload;

    if (!draft_id) throw new Error("IDENTIFICADOR_DRAFT_REQUERIDO");
    targetDraftId = draft_id;

    // 2. RECUPERACIÓN DE DATOS (Papers Recolectados en Fase II)
    // Extraemos las fuentes crudas (sources) y la metadata de creación.
    const { data: draft, error: fetchErr } = await supabaseAdmin
      .from('podcast_drafts')
      .select('*')
      .eq('id', draft_id)
      .single();

    if (fetchErr || !draft) throw new Error("BORRADOR_NO_ENCONTRADO");

    // Verificación de integridad de suministro
    if (!draft.sources || draft.sources.length === 0) {
      throw new Error("SUMINISTRO_VACIO: No hay fuentes disponibles para redactar.");
    }

    console.log(`✍️ [Redactor][${correlationId}] Iniciando forja para: ${draft.title}`);

    // 3. RESOLUCIÓN DE PERSONALIDAD (Mapeo de Tono)
    // El usuario eligió un tono en el frontend (esceptico, mentor, etc.). 
    // El Agente 38 usará esta variable para adaptar su "logical_blueprint".
    const userSelectedTone = draft.creation_data?.agentName || 'narrador';

    // 4. INVOCACIÓN AL AGENTE ARQUITECTO (ID 38)
    // Obtenemos el prompt maestro que ya actualizamos con soporte para {{tone}}.
    const { data: agent, error: agentErr } = await supabaseAdmin
      .from('ai_prompts')
      .select('prompt_template')
      .eq('agent_name', 'script-architect-v1')
      .single();

    if (agentErr || !agent) throw new Error("PROMPT_ARCHITECT_MISSING");

    // 5. CONSTRUCCIÓN DE PROMPT DE ALTA DENSIDAD
    // buildPrompt O(n) inyecta las fuentes crudas y la personalidad.
    const finalPrompt = buildPrompt(agent.prompt_template, {
      topic: draft.title,
      raw_sources: JSON.stringify(draft.sources),
      duration: draft.creation_data?.inputs?.duration || "Media (6-9 min)",
      depth: draft.creation_data?.inputs?.narrativeDepth || "Intermedia",
      tone: userSelectedTone
    });

    // 6. SÍNTESIS NARRATIVA (Gemini 3.0 Flash Preview)
    // Usamos la bestia 3.0 para una redacción técnica y fluida.
    const scriptRaw = await callGeminiMultimodal(
      finalPrompt,
      draft.creation_data?.inputs?.image_base64_reference, // Contexto visual si existe
      AI_MODELS.PRO,
      0.7 // Temperatura equilibrada para creatividad controlada
    );

    const content = parseAIJson<{ title: string, script_body: string, citations_used: string[] }>(scriptRaw);

    if (!content.script_body) throw new Error("ERROR_SINTESIS_IA: El guion generado está vacío.");

    // 7. HIGIENE ACÚSTICA Y PERSISTENCIA (JSONB Standard)
    // Generamos la versión 'script_plain' eliminando ruidos visuales para el TTS.
    const plainText = cleanTextForSpeech(content.script_body);

    const { error: updateError } = await supabaseAdmin
      .from('podcast_drafts')
      .update({
        title: content.title || draft.title,
        script_text: {
          script_body: content.script_body,
          script_plain: plainText
        },
        status: 'ready', // LIBERA EL BORRADOR PARA EL USUARIO
        updated_at: new Date().toISOString()
      })
      .eq('id', draft_id);

    if (updateError) throw new Error(`DB_UPDATE_FAIL: ${updateError.message}`);

    console.log(`✅ [Redactor][${correlationId}] Misión completada. Guion en estado 'ready'.`);

    return new Response(JSON.stringify({
      success: true,
      message: "Guion forjado bajo estándar Architect-Only.",
      trace_id: correlationId
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [Redactor-Fatal][${correlationId}]:`, error.message);

    // Marcamos el fallo para que el frontend detenga el loader
    if (targetDraftId) {
      await supabaseAdmin.from('podcast_drafts').update({
        status: 'failed',
        creation_data: {
          ...((await supabaseAdmin.from('podcast_drafts').select('creation_data').eq('id', targetDraftId).single()).data?.creation_data || {}),
          last_error: error.message,
          correlation_id: correlationId
        }
      }).eq('id', targetDraftId);
    }

    return new Response(JSON.stringify({
      error: error.message,
      trace_id: correlationId
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

serve(handler);