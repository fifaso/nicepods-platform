// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 25.1 (Master Redactor - Fixed Internal Trigger & Robust Scoping)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AI_MODELS, buildPrompt, callGeminiMultimodal, generateEmbedding, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders, guard } from "../_shared/guard.ts";

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

  try {
    const rawText = await request.text();
    if (!rawText) throw new Error("EMPTY_BODY_RECEIVED");

    const body = JSON.parse(rawText);
    const { draft_id, internal_trigger } = body;

    // --- ESCENARIO 1: FASE DE REDACCIÓN (AUTO-INVOCACIÓN ASÍNCRONA) ---
    if (internal_trigger && draft_id) {
      console.log(`✍️ [Draft][${correlationId}] Iniciando Fase de Redacción con Gemini Pro.`);

      const { data: draft, error: fetchErr } = await supabaseAdmin.from('podcast_drafts').select('*').eq('id', draft_id).single();
      if (fetchErr || !draft) throw new Error("DRAFT_NOT_FOUND");

      const dossier = draft.creation_data.dossier_cache;
      const { data: agent } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', 'script-architect-v1').single();
      if (!agent) throw new Error("PROMPT_CONFIG_MISSING");

      const finalPrompt = buildPrompt(agent.prompt_template, {
        dossier_json: JSON.stringify(dossier),
        style: draft.creation_data.agentName || "narrador",
        topic: draft.title,
        duration: draft.creation_data.duration || "Media"
      });

      // Redacción profunda con Gemini 1.5 Pro
      const scriptRaw = await callGeminiMultimodal(finalPrompt, draft.creation_data.imageContext, AI_MODELS.PRO, 0.7);
      const content = parseAIJson<{ title: string, script_body: string }>(scriptRaw);

      // Finalización del borrador: Cambiamos estado a 'ready' para el Realtime
      await supabaseAdmin.from('podcast_drafts').update({
        title: content.title,
        script_text: { script_body: content.script_body },
        creation_data: { ...draft.creation_data, status: 'ready' }
      }).eq('id', draft_id);

      return new Response(JSON.stringify({ success: true }));
    }

    // --- ESCENARIO 2: PETICIÓN INICIAL DEL USUARIO (FAST RESPONSE) ---
    console.log(`🚀 [Draft][${correlationId}] Nueva misión de inteligencia recibida.`);

    const authHeader = request.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("UNAUTHORIZED");

    const inputs = body.inputs || body;
    const baseTopic = inputs.solo_topic || inputs.question_to_answer || "Briefing Estratégico";

    // A. Inserción del borrador en estado 'researching'
    const { data: newDraft, error: insErr } = await supabaseAdmin.from('podcast_drafts').insert({
      user_id: user.id,
      title: baseTopic,
      script_text: { script_body: "" },
      creation_data: { ...body, status: 'researching' }
    }).select('id').single();

    if (insErr) throw insErr;

    // B. Disparo asíncrono de la fase de investigación (Deep Research)
    const queryVector = await generateEmbedding(baseTopic);

    // Llamada fire-and-forget: No esperamos (await) para responder rápido al cliente
    supabaseAdmin.functions.invoke('research-intelligence', {
      body: {
        topic: baseTopic,
        depth: inputs.narrativeDepth || "Medio",
        queryVector,
        draft_id: newDraft.id
      }
    });

    // C. Respuesta de aceptación inmediata (202 Accepted)
    return new Response(JSON.stringify({
      success: true,
      draft_id: newDraft.id,
      message: "Malla de inteligencia profunda activada."
    }), { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err: any) {
    console.error(`🔥 [Draft-Fatal][${correlationId}]`, err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: corsHeaders
    });
  }
};

serve(guard(handler));