// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 41.0 (NicePod Redactor - Professional Studio Standard)
// Misión: Garantizar redacción de alta densidad sin riesgo de truncamiento.
// [ESTABILIZACIÓN]: Expansión masiva de tokens y recalibración de rangos de duración.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AI_MODELS, buildPrompt, cleanTextForSpeech } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * sovereignExtractor V3: Parser con soporte para variaciones de espacios en etiquetas.
 */
function sovereignExtractor(text: string, tag: string): string {
  const regex = new RegExp(`\\$\\$\\$${tag}_START\\$\\$\\$([\\s\\S]*?)(?:\\$\\$\\$${tag}_END\\$\\$\\$|$)`, "i");
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}

async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const correlationIdentification = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let targetDraft: any = null;

  try {
    const payload = await request.json();
    const { draft_id } = payload;
    if (!draft_id) throw new Error("DRAFT_ID_REQUIRED");

    const { data: draft, error: fetchError } = await supabaseAdmin.from('podcast_drafts').select('*').eq('id', draft_id).single();
    if (fetchError || !draft) throw new Error("DRAFT_NOT_FOUND");
    targetDraft = draft;

    const cData = draft.creation_data || {};
    const inputs = cData.inputs || {};
    const rawDuration = cData.duration || inputs.duration || "Entre 2 y 3 minutos";
    const agentName = cData.agentName || inputs.agentName || 'narrador';

    const { data: personality } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', agentName).single();
    const { data: architect } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', 'script-architect-v1').single();

    /**
     * CALIBRACIÓN DE TOKENS V41: 
     * Eliminamos la restricción agresiva. Damos un margen de 4000 tokens (aprox 3000 palabras)
     * para que la IA nunca se corte, delegando el control de longitud al prompt.
     */
    let temperature = 0.5;
    if (rawDuration === "Menos de 1 minuto") temperature = 0.2;

    const finalPrompt = buildPrompt(architect!.prompt_template, {
      topic: draft.title,
      raw_sources: JSON.stringify(draft.sources),
      duration: rawDuration,
      depth: cData.narrativeDepth || inputs.narrativeDepth || "Intermedia",
      tone_instructions: personality?.prompt_template || "Eres un redactor experto."
    });

    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    const uniformResourceLocator = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.PRO}:generateContent?key=${apiKey}`;

    console.info(`✍️ [Redactor-V41][${correlationIdentification}] Solicitando: ${rawDuration}`);

    const response = await fetch(uniformResourceLocator, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: finalPrompt }] }],
        generationConfig: {
          temperature: temperature,
          maxOutputTokens: 4000, // Margen industrial absoluto
          responseMimeType: "text/plain"
        }
      })
    });

    if (!response.ok) throw new Error(`API_FAIL: ${await response.text()}`);

    const aiData = await response.json();
    const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("IA_EMPTY_RESPONSE");

    const finalTitle = sovereignExtractor(rawText, 'TITLE') || draft.title;
    const finalBody = sovereignExtractor(rawText, 'SCRIPT');
    const citationsStr = sovereignExtractor(rawText, 'SOURCES');

    if (!finalBody) throw new Error("ERROR_ESTRUCTURA_IA");

    const plainText = cleanTextForSpeech(finalBody);

    const { error: updateError } = await supabaseAdmin.from('podcast_drafts').update({
      title: finalTitle,
      script_text: {
        script_body: finalBody,
        script_plain: plainText,
        citations: citationsStr.split(',').map(s => s.trim()).filter(Boolean)
      },
      status: 'ready',
      updated_at: new Date().toISOString()
    }).eq('id', draft_id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, trace_identification: correlationIdentification }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [Redactor-Fatal][${correlationIdentification}]:`, error.message);
    if (targetDraft) {
      await supabaseAdmin.from('podcast_drafts').update({
        status: 'failed',
        creation_data: { ...(targetDraft.creation_data || {}), last_error: error.message }
      }).eq('id', targetDraft.id);
    }
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
}

serve(handler);