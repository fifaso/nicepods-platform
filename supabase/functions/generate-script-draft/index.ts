// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 25.2 (Master Redactor - Async Architecture & Hybrid Flow Support)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importación unificada desde el núcleo compartido
import { AI_MODELS, buildPrompt, callGeminiMultimodal, generateEmbedding, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders, guard } from "../_shared/guard.ts";

const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

  try {
    // [SAFE PARSING]: Evitamos 'Unexpected end of JSON input'
    const rawText = await request.text();
    if (!rawText) throw new Error("EMPTY_REQUEST_BODY");

    const body = JSON.parse(rawText);
    const { draft_id, internal_trigger } = body;

    // --- ESCENARIO 1: AUTO-INVOCACIÓN (FASE FINAL DE REDACCIÓN) ---
    if (internal_trigger && draft_id) {
      console.log(`✍️ [Draft][${correlationId}] Fase: Redacción Pro con Gemini 2.5.`);

      const { data: draft } = await supabaseAdmin.from('podcast_drafts').select('*').eq('id', draft_id).single();
      if (!draft) throw new Error("DRAFT_NOT_FOUND");

      const dossier = draft.creation_data.dossier_cache;
      const { data: agent } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', 'script-architect-v1').single();

      const finalPrompt = buildPrompt(agent!.prompt_template, {
        dossier_json: JSON.stringify(dossier),
        style: draft.creation_data.agentName || "narrador",
        topic: draft.title,
        duration: draft.creation_data.duration || "Media"
      });

      // Síntesis Profunda (Sin limitaciones de tiempo síncronas)
      const scriptRaw = await callGeminiMultimodal(finalPrompt, draft.creation_data.imageContext, AI_MODELS.PRO, 0.7);
      const content = parseAIJson<{ title: string, script_body: string }>(scriptRaw);

      await supabaseAdmin.from('podcast_drafts').update({
        title: content.title,
        script_text: { script_body: content.script_body },
        creation_data: { ...draft.creation_data, status: 'ready' }
      }).eq('id', draft_id);

      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // --- ESCENARIO 2: SOLICITUD DEL USUARIO (INICIO DE CICLO) ---
    const authHeader = request.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("SESION_INVALIDA");

    const inputs = body.inputs || body;
    const isPulse = body.purpose === 'pulse';
    const baseTopic = inputs.solo_topic || inputs.question_to_answer || "Frecuencia NicePod";

    // 1. Persistencia Inicial (Estado: Researching)
    const { data: newDraft, error: insErr } = await supabaseAdmin.from('podcast_drafts').insert({
      user_id: user.id,
      title: baseTopic,
      script_text: { script_body: "" },
      creation_data: { ...body, status: 'researching' }
    }).select('id').single();

    if (insErr) throw new Error(`DB_INIT_FAIL: ${insErr.message}`);

    // 2. Disparo asíncrono de la Fase de Inteligencia (Research)
    // No usamos await para poder responder al usuario inmediatamente.
    const queryVector = await generateEmbedding(baseTopic);

    supabaseAdmin.functions.invoke('research-intelligence', {
      body: {
        topic: baseTopic,
        depth: inputs.narrativeDepth || "Medio",
        queryVector,
        draft_id: newDraft.id,
        is_pulse: isPulse,
        pulse_ids: isPulse ? body.pulse_source_ids : undefined
      }
    });

    // 3. Respuesta 202 (Aceptado): El Frontend salta al Loader.
    return new Response(JSON.stringify({
      success: true,
      draft_id: newDraft.id,
      message: "Orquestación de inteligencia profunda iniciada."
    }), { status: 202, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: any) {
    console.error(`🔥 [Draft-Error][${correlationId}]`, err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: corsHeaders
    });
  }
};

serve(guard(handler));