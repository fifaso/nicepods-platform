// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 26.2 (Fast Scriptwriter - Direct Execution Edition)
// Misión: Transmutar el dossier en narrativa profesional respetando la personalidad elegida.
// [OPTIMIZACIÓN]: Ejecución directa sin Guard para asegurar la disponibilidad total de CPU.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo NicePod (Sincronizadas con Nivel 1)
import { AI_MODELS, buildPrompt, callGeminiMultimodal, cleanTextForSpeech, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * CLIENTE SUPABASE ADMIN:
 * Persistente en el contexto de ejecución de la Edge Function.
 */
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * handler: Generación de guion maestro.
 */
async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let currentDraftId: string | null = null;

  try {
    const payload = await request.json();
    const { draft_id } = payload;

    if (!draft_id) throw new Error("DRAFT_ID_REQUIRED");
    currentDraftId = draft_id;

    // 1. RECUPERACIÓN DE CONTEXTO (Dossier e Intención)
    const { data: draft, error: fetchErr } = await supabaseAdmin
      .from('podcast_drafts')
      .select('*')
      .eq('id', draft_id)
      .single();

    if (fetchErr || !draft) throw new Error("DRAFT_NOT_FOUND");

    console.log(`✍️ [Redactor][${correlationId}] Iniciando redacción para: ${draft.title}`);

    // 2. RESOLUCIÓN DINÁMICA DE AGENTE
    const agentName = draft.creation_data?.agentName || 'script-architect-v1';
    const { data: agent, error: agentErr } = await supabaseAdmin
      .from('ai_prompts')
      .select('prompt_template')
      .eq('agent_name', agentName)
      .single();

    if (agentErr || !agent) throw new Error(`PROMPT_MISSING: ${agentName}`);

    // 3. CONSTRUCCIÓN DEL PROMPT NARRATIVO
    const finalPrompt = buildPrompt(agent.prompt_template, {
      dossier_json: JSON.stringify(draft.dossier_text),
      topic: draft.title,
      duration: draft.creation_data?.inputs?.duration || "Media",
      tone: draft.creation_data?.inputs?.tone || "Profesional"
    });

    // 4. GENERACIÓN CON GEMINI 3.0 FLASH (Modo Pro)
    const scriptRaw = await callGeminiMultimodal(
      finalPrompt,
      draft.creation_data?.inputs?.image_base64_reference,
      AI_MODELS.PRO,
      0.7
    );

    const content = parseAIJson<{ title: string, script_body: string }>(scriptRaw);

    if (!content.script_body) throw new Error("AI_OUTPUT_EMPTY");

    // 5. PERSISTENCIA EN FORMATO JSONB (Sincronía con schema.sql)
    // Generamos la versión limpia para el motor de audio y teleprompter
    const plainText = cleanTextForSpeech(content.script_body);

    const { error: updateError } = await supabaseAdmin
      .from('podcast_drafts')
      .update({
        title: content.title || draft.title,
        script_text: {
          script_body: content.script_body,
          script_plain: plainText
        },
        status: 'ready',
        updated_at: new Date().toISOString()
      })
      .eq('id', draft_id);

    if (updateError) throw updateError;

    console.log(`✅ [Redactor][${correlationId}] Guion listo.`);

    return new Response(JSON.stringify({
      success: true,
      message: "Guion generado y sanitizado.",
      trace_id: correlationId
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [Redactor-Fatal][${correlationId}]:`, error.message);

    if (currentDraftId) {
      await supabaseAdmin.from('podcast_drafts').update({
        status: 'failed',
        creation_data: { last_error: error.message, trace: correlationId }
      }).eq('id', currentDraftId);
    }

    return new Response(JSON.stringify({ error: error.message, trace_id: correlationId }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

serve(handler);