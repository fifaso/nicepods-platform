// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 31.0 (NicePod Redactor - Absolute Length Control & Thermal Logic)
// Misión: Forzar el cumplimiento de duración mediante restricciones físicas de API y Prompt Engineering.
// [ESTABILIZACIÓN]: Implementación de parámetros dinámicos (Tokens/Temp) para erradicar la verbosidad.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AI_MODELS, buildPrompt, cleanTextForSpeech, parseAIJson } from "../_shared/ai.ts";
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

    // 1. RECUPERACIÓN DEL SUMINISTRO (Dato Maestro)
    const { data: draft, error: fetchErr } = await supabaseAdmin.from('podcast_drafts').select('*').eq('id', draft_id).single();
    if (fetchErr || !draft) throw new Error("DRAFT_NOT_FOUND");

    const agentName = draft.creation_data?.agentName || 'narrador';
    const { data: personality } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', agentName).single();
    const { data: architect } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', 'script-architect-v1').single();

    if (!architect) throw new Error("ARCHITECT_PROMPT_NOT_FOUND");

    // 2. LÓGICA DE CALIBRACIÓN DE HARDWARE (Dinamismo por Duración)
    const rawDuration = draft.creation_data?.inputs?.duration || "Entre 2 y 3 minutos";

    /**
     * CONFIGURACIÓN DE LÍMITES FÍSICOS
     * targetWords: Referencia para el prompt.
     * maxTokens: Límite duro en la API (1 token ≈ 0.75 palabras).
     * temperature: Grado de 'divagación' (0.1 = Robot obediente, 0.7 = Creativo).
     */
    let targetWords = 350;
    let maxTokens = 600;
    let temperature = 0.4;

    if (rawDuration === "Menos de 1 minuto") {
      targetWords = 100;
      maxTokens = 200; // Bloqueo físico de expansión
      temperature = 0.1; // Determinismo puro
    } else if (rawDuration === "Entre 2 y 3 minutos") {
      targetWords = 350;
      maxTokens = 650;
      temperature = 0.3;
    } else if (rawDuration === "Hasta 5 minutos") {
      targetWords = 650;
      maxTokens = 1100;
      temperature = 0.6;
    }

    // 3. CONSTRUCCIÓN DEL PROMPT SOBERANO
    const finalPrompt = buildPrompt(architect.prompt_template, {
      topic: draft.title,
      raw_sources: JSON.stringify(draft.sources),
      duration: rawDuration,
      target_words: targetWords,
      depth: draft.creation_data?.inputs?.narrativeDepth || "Intermedia",
      tone_instructions: personality?.prompt_template || "Eres un redactor profesional."
    });

    // 4. INVOCACIÓN DIRECTA A GEMINI (Bypass de _shared para control total)
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.PRO}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: finalPrompt },
            ...(draft.creation_data?.inputs?.image_base64_reference ? [{
              inline_data: {
                mime_type: "image/jpeg",
                data: draft.creation_data.inputs.image_base64_reference.split(",")[1]
              }
            }] : [])
          ]
        }],
        generationConfig: {
          temperature: temperature,
          maxOutputTokens: maxTokens,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) throw new Error(`AI_API_ERROR: ${await response.text()}`);

    const aiData = await response.json();
    const scriptRaw = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

    // Parseo y Saneamiento
    const content = parseAIJson<{ title: string, script_body: string, citations_used?: string[] }>(scriptRaw);
    const plainText = cleanTextForSpeech(content.script_body);

    // 5. PERSISTENCIA EN BÓVEDA STAGING
    await supabaseAdmin.from('podcast_drafts').update({
      title: content.title || draft.title,
      script_text: {
        script_body: content.script_body,
        script_plain: plainText,
        citations: content.citations_used || []
      },
      status: 'ready',
      updated_at: new Date().toISOString()
    }).eq('id', draft_id);

    console.info(`✅ [Redactor][${correlationId}] Forja finalizada. Longitud: ${plainText.split(' ').length} palabras.`);

    return new Response(JSON.stringify({ success: true, trace_id: correlationId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [Redactor-Fatal][${correlationId}]:`, error.message);
    if (targetDraftId) await supabaseAdmin.from('podcast_drafts').update({ status: 'failed' }).eq('id', targetDraftId);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
}

serve(handler);