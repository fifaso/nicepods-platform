// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 27.1 (Architect-First Protocol - Stability Edition)
// Misión: Garantizar que la primera redacción use el cerebro del Arquitecto, ignorando agentes legacy.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AI_MODELS, buildPrompt, callGeminiMultimodal, cleanTextForSpeech, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let targetDraftId: string | null = null;

  try {
    const payload = await request.json();
    const { draft_id } = payload;
    if (!draft_id) throw new Error("DRAFT_ID_REQUIRED");
    targetDraftId = draft_id;

    // 1. RECUPERACIÓN DE SUMINISTRO
    const { data: draft, error: fetchErr } = await supabaseAdmin
      .from('podcast_drafts')
      .select('*')
      .eq('id', draft_id)
      .single();

    if (fetchErr || !draft) throw new Error("DRAFT_NOT_FOUND");

    console.log(`✍️ [Redactor][${correlationId}] Forjando borrador para: ${draft.title}`);

    // 2. POLÍTICA DE ARQUITECTO SOBERANO
    // [FIX]: Forzamos 'script-architect-v1' porque es el único que entiende el formato de sources actual.
    // El tono elegido se pasa como variable interna.
    const tone = draft.creation_data?.agentName || 'narrador';

    const { data: agent, error: agentErr } = await supabaseAdmin
      .from('ai_prompts')
      .select('prompt_template')
      .eq('agent_name', 'script-architect-v1')
      .single();

    if (agentErr || !agent) throw new Error("ARCHITECT_PROMPT_NOT_FOUND");

    // 3. CONSTRUCCIÓN DEL PROMPT (Usando fuentes crudas)
    const finalPrompt = buildPrompt(agent.prompt_template, {
      topic: draft.title,
      raw_sources: JSON.stringify(draft.sources),
      duration: draft.creation_data?.inputs?.duration || "Media (6-9 min)",
      depth: draft.creation_data?.inputs?.narrativeDepth || "Intermedia",
      tone: tone
    });

    // 4. SÍNTESIS CON MODELO PRO (Gemini 3.0 Flash Preview)
    const scriptRaw = await callGeminiMultimodal(
      finalPrompt,
      draft.creation_data?.inputs?.image_base64_reference,
      AI_MODELS.PRO,
      0.7
    );

    // El nuevo parseAIJson 11.7 se encargará de limpiar la respuesta
    const content = parseAIJson<{ title: string, script_body: string }>(scriptRaw);

    // 5. PERSISTENCIA FINAL
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

    return new Response(JSON.stringify({ success: true, trace_id: correlationId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [Redactor-Fatal][${correlationId}]:`, error.message);
    if (targetDraftId) {
      await supabaseAdmin.from('podcast_drafts').update({ status: 'failed' }).eq('id', targetDraftId);
    }
    return new Response(JSON.stringify({ error: error.message, trace_id: correlationId }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

serve(handler);