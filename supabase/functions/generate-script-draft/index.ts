// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 25.3 (Final Architect - Pro Synthesis & Memory Injection)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AI_MODELS, buildPrompt, callGeminiMultimodal, parseAIJson } from "../_shared/ai.ts";

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

serve(async (req) => {
  let draftId: string | null = null;

  try {
    const payload = await req.json();
    draftId = payload.draft_id;

    // 1. Obtener Dossier y Metadata
    const { data: draft, error: fetchErr } = await supabaseAdmin.from('podcast_drafts').select('*').eq('id', draftId).single();
    if (fetchErr || !draft) throw new Error("DRAFT_NOT_FOUND");

    console.log(`✍️ [Redactor] Escribiendo guion para: ${draft.title}`);

    // 2. Redacción con Gemini Pro (Personalidad Inyectada)
    const { data: agent } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', 'script-architect-v1').single();
    if (!agent) throw new Error("PROMPT_MISSING");

    const finalPrompt = buildPrompt(agent.prompt_template, {
      dossier_json: JSON.stringify(draft.dossier_text),
      style: draft.creation_data.agentName || "narrador",
      topic: draft.title,
      duration: draft.creation_data.duration || "Media"
    });

    const scriptRaw = await callGeminiMultimodal(finalPrompt, draft.creation_data.imageContext, AI_MODELS.PRO, 0.7);
    const content = parseAIJson<{ title: string, script_body: string }>(scriptRaw);

    // 3. PERSISTENCIA FINAL Y LIBERACIÓN
    await supabaseAdmin.from('podcast_drafts').update({
      title: content.title,
      script_text: { script_body: content.script_body },
      status: 'ready'
    }).eq('id', draftId);

    // 4. APRENDIZAJE RECURSIVO (NKV Loop)
    // No esperamos esta llamada para no retrasar la percepción de 'ready'
    fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/vault-refinery`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Intel: ${content.title}`,
        text: JSON.stringify(draft.dossier_text),
        source_type: 'user_contribution',
        is_public: true,
        is_json: true
      })
    }).catch(() => { });

    return new Response("SUCCESS");

  } catch (e: any) {
    console.error(`🔥 [Redactor-Fatal]:`, e.message);
    if (draftId) {
      await supabaseAdmin.from('podcast_drafts').update({ status: 'failed' }).eq('id', draftId);
    }
    return new Response(e.message, { status: 500 });
  }
});