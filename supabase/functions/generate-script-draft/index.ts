// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 24.0 (Agnostic Redactor - Zero-Crash Logic)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AI_MODELS, buildPrompt, callGeminiMultimodal, generateEmbedding, parseAIJson } from "../_shared/ai.ts";
import { guard } from "../_shared/guard.ts";

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const handler = async (request: Request): Promise<Response> => {
  try {
    const rawText = await request.text();
    if (!rawText) throw new Error("BODY_MISSING");

    const rawBody = JSON.parse(rawText);
    const { draft_id, internal_trigger } = rawBody;

    // ESCENARIO ASÍNCRONO INTERNO (REDACCIÓN)
    if (internal_trigger && draft_id) {
      const { data: draft } = await supabaseAdmin.from('podcast_drafts').select('*').eq('id', draft_id).single();
      const dossier = draft.creation_data.dossier_cache;
      const { data: agent } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', 'script-architect-v1').single();

      const finalPrompt = buildPrompt(agent!.prompt_template, {
        dossier_json: JSON.stringify(dossier),
        style: draft.creation_data.agentName || "narrador",
        topic: draft.title,
        duration: draft.creation_data.duration || "Media"
      });

      const scriptRaw = await callGeminiMultimodal(finalPrompt, draft.creation_data.imageContext, AI_MODELS.PRO, 0.7);
      const content = parseAIJson<{ title: string, script_body: string }>(scriptRaw);

      await supabaseAdmin.from('podcast_drafts').update({
        title: content.title,
        script_text: { script_body: content.script_body },
        creation_data: { ...draft.creation_data, status: 'ready' }
      }).eq('id', draft_id);

      return new Response(JSON.stringify({ success: true }));
    }

    // ESCENARIO INICIAL (USUARIO)
    const authHeader = request.headers.get('Authorization')!;
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) throw new Error("UNAUTHORIZED");

    const inputs = rawBody.inputs || rawBody;
    const baseTopic = inputs.solo_topic || inputs.question_to_answer || "Frecuencia NicePod";

    const { data: newDraft } = await supabaseAdmin.from('podcast_drafts').insert({
      user_id: user.id,
      title: baseTopic,
      script_text: { script_body: "" },
      creation_data: { ...rawBody, status: 'researching' }
    }).select('id').single();

    const queryVector = await generateEmbedding(baseTopic);
    supabaseAdmin.functions.invoke('research-intelligence', {
      body: { topic: baseTopic, depth: inputs.narrativeDepth, queryVector, draft_id: newDraft.id }
    });

    return new Response(JSON.stringify({ success: true, draft_id: newDraft.id }), { status: 202 });

  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
};

serve(guard(handler));