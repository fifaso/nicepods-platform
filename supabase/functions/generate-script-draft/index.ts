// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 26.0 (Final Architect - Dynamic Persona & JSONB Integrity)
// Misión: Transmutar el dossier en narrativa profesional respetando la personalidad elegida y el rigor del esquema V2.5.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo NicePod (Nivel 1 de Estabilización)
import { AI_MODELS, buildPrompt, callGeminiMultimodal, cleanTextForSpeech, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders, guard } from "../_shared/guard.ts";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const handler = async (req: Request): Promise<Response> => {
  // Recuperamos el Correlation ID inyectado por nuestro Guard V5.0
  const correlationId = req.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let draftId: string | null = null;

  try {
    const payload = await req.json();
    draftId = payload.draft_id;

    if (!draftId) throw new Error("DRAFT_ID_REQUIRED");

    // 1. OBTENCIÓN DE DOSSIER Y METADATA (Fase II)
    const { data: draft, error: fetchErr } = await supabaseAdmin
      .from('podcast_drafts')
      .select('*')
      .eq('id', draftId)
      .single();

    if (fetchErr || !draft) throw new Error("DRAFT_NOT_FOUND");

    console.log(`✍️ [Redactor][${correlationId}] Forjando guion para: ${draft.title}`);

    // 2. RESOLUCIÓN DINÁMICA DE AGENTE (Personalidad de Fase III)
    // Priorizamos el agente elegido por el usuario; fallback al arquitecto base.
    const agentName = draft.creation_data?.agentName || 'script-architect-v1';

    const { data: agent, error: agentErr } = await supabaseAdmin
      .from('ai_prompts')
      .select('prompt_template, version')
      .eq('agent_name', agentName)
      .single();

    if (agentErr || !agent) throw new Error(`PROMPT_MISSING: ${agentName}`);

    // 3. CONSTRUCCIÓN DEL PROMPT MAESTRO (Sanitizado por buildPrompt V10.3)
    const finalPrompt = buildPrompt(agent.prompt_template, {
      dossier_json: JSON.stringify(draft.dossier_text),
      topic: draft.title,
      duration: draft.creation_data?.inputs?.duration || "Media",
      tone: draft.creation_data?.inputs?.tone || "Profesional"
    });

    // 4. INVOCACIÓN A GEMINI PRO (Fase III)
    const scriptRaw = await callGeminiMultimodal(
      finalPrompt,
      draft.creation_data?.inputs?.image_base64_reference,
      AI_MODELS.PRO,
      0.7
    );

    const content = parseAIJson<{ title: string, script_body: string }>(scriptRaw);

    if (!content.script_body) throw new Error("AI_GENERATION_EMPTY");

    // 5. PERSISTENCIA EN FORMATO JSONB (Sincronía con schema.sql)
    // Creamos la versión plain-text para el teleprompter y limpieza acústica.
    const plainText = cleanTextForSpeech(content.script_body);

    const { error: updateErr } = await supabaseAdmin
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
      .eq('id', draftId);

    if (updateErr) throw updateErr;

    // 6. APRENDIZAJE RECURSIVO (NKV Loop - Asíncrono)
    // Inyectamos el Correlation ID para trazabilidad total en el Vault.
    const refineryUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/vault-refinery`;

    fetch(refineryUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        'Content-Type': 'application/json',
        'x-correlation-id': correlationId
      },
      body: JSON.stringify({
        title: `Intel: ${content.title}`,
        text: JSON.stringify(draft.dossier_text),
        source_type: 'user_contribution',
        is_public: true,
        metadata: { draft_id: draftId, agent: agentName }
      })
    }).catch((e) => console.error(`⚠️ [NKV-Link-Fail]:`, e.message));

    return new Response(JSON.stringify({
      success: true,
      message: "Guion redactado y listo en Sala de Forja.",
      trace_id: correlationId
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (e: any) {
    console.error(`🔥 [Redactor-Fatal][${correlationId}]:`, e.message);

    if (draftId) {
      await supabaseAdmin.from('podcast_drafts').update({
        status: 'failed'
      }).eq('id', draftId);
    }

    return new Response(JSON.stringify({
      error: e.message,
      trace_id: correlationId
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

// Aplicamos el Guard Maestro V5.0
serve(guard(handler));