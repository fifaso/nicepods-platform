// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 23.0 (Asynchronous Redactor - Master Orchestration & Realtime Sync)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AI_MODELS, buildPrompt, callGeminiMultimodal, generateEmbedding, parseAIJson } from "../_shared/ai.ts";

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

  try {
    const rawBody = await request.json();
    const { draft_id, internal_trigger } = rawBody;

    // --- ESCENARIO 1: LLAMADA INTERNA (FASE DE REDACCIÓN FINAL) ---
    if (internal_trigger && draft_id) {
      console.log(`✍️ [Draft][${correlationId}] Iniciando Redacción Pro con Gemini 2.5 Pro...`);

      const { data: draft } = await supabaseAdmin.from('podcast_drafts').select('*').eq('id', draft_id).single();
      if (!draft) throw new Error("DRAFT_NOT_FOUND");

      const dossier = draft.creation_data.dossier_cache;
      const { data: agentPrompt } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', 'script-architect-v1').single();

      const finalPrompt = buildPrompt(agentPrompt!.prompt_template, {
        dossier_json: JSON.stringify(dossier),
        style: draft.creation_data.agentName || "narrador",
        topic: draft.title,
        duration: draft.creation_data.duration || "Media"
      });

      // Razonamiento profundo sin límites de tiempo síncrono
      const scriptRaw = await callGeminiMultimodal(finalPrompt, draft.creation_data.imageContext, AI_MODELS.PRO, 0.7);
      const content = parseAIJson<{ title: string, script_body: string }>(scriptRaw);

      // Finalización del borrador: Ahora el Realtime del frontend verá el guion completo
      await supabaseAdmin.from('podcast_drafts').update({
        title: content.title,
        script_text: { script_body: content.script_body },
        creation_data: { ...draft.creation_data, status: 'ready' }
      }).eq('id', draft_id);

      return new Response(JSON.stringify({ success: true }));
    }

    // --- ESCENARIO 2: LLAMADA DEL USUARIO (INICIO DE CICLO) ---
    console.log(`🚀 [Draft][${correlationId}] Petición de usuario recibida. Iniciando Malla Asíncrona.`);

    // A. Identificación y Cuota
    const authHeader = request.headers.get('Authorization')!;
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) throw new Error("UNAUTHORIZED");

    const inputs = rawBody.inputs || rawBody;
    const baseTopic = inputs.solo_topic || inputs.question_to_answer || "Frecuencia NicePod";

    // B. Creación de ID de Seguimiento (Borrador inicial)
    const { data: newDraft } = await supabaseAdmin.from('podcast_drafts').insert({
      user_id: user.id,
      title: baseTopic,
      script_text: { script_body: "" },
      creation_data: { ...rawBody, status: 'researching' }
    }).select('id').single();

    // C. Disparo del Investigador (No bloqueante)
    const queryVector = await generateEmbedding(baseTopic);
    supabaseAdmin.functions.invoke('research-intelligence', {
      body: { topic: baseTopic, depth: inputs.narrativeDepth, queryVector, draft_id: newDraft.id }
    });

    // D. RESPUESTA INMEDIATA: "Estamos en ello"
    return new Response(JSON.stringify({
      success: true,
      draft_id: newDraft.id,
      message: "Investigación profunda iniciada."
    }), { status: 202, headers: { 'Content-Type': 'application/json' } });

  } catch (err: any) {
    console.error(`🔥 [Draft-Fatal]:`, err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
};

serve(handler);