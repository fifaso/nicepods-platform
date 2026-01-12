// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN: 18.0 (Atomic Persistence & Optional Job Sync)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

import { guard } from "../_shared/guard.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { callGeminiAudio, cleanTextForSpeech } from "../_shared/ai.ts";
import { generateDirectorNote } from "../_shared/vocal-director-map.ts";

// [FIJO]: job_id ahora es opcional para permitir flujos de Bóveda (NKV)
const InvokePayloadSchema = z.object({
  job_id: z.number().optional().nullable(),
  podcast_id: z.number(),
  trace_id: z.string().optional()
});

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const supabaseAdmin: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const payload = await request.json();
    const { podcast_id } = InvokePayloadSchema.parse(payload);

    // 1. Obtención de datos con alta consistencia
    const { data: pod, error: podErr } = await supabaseAdmin
      .from('micro_pods')
      .select('script_text, user_id, creation_data')
      .eq('id', podcast_id)
      .single();

    if (podErr || !pod) throw new Error(`Podcast ${podcast_id} no accesible.`);

    // 2. Extracción de Guion
    let rawScript = "";
    try {
      const parsed = typeof pod.script_text === 'string' ? JSON.parse(pod.script_text) : pod.script_text;
      rawScript = parsed.script_body || pod.script_text;
    } catch { rawScript = pod.script_text; }

    const cleanText = cleanTextForSpeech(rawScript);
    if (!cleanText) throw new Error("Guion vacío.");

    // 3. Preparación de Dirección Vocal
    const inputs = (pod.creation_data as any)?.inputs || {};
    const directorNote = generateDirectorNote(
      inputs.agentName || "narrador",
      inputs.voiceGender || "Masculino",
      inputs.voiceStyle || "Profesional",
      inputs.voicePace || "Moderado"
    );

    console.log(`🎙️ [${correlationId}] Interpretando Audio para Pod: ${podcast_id}`);

    // 4. Generación Nativa Gemini 2.5 Pro Audio
    const base64Audio = await callGeminiAudio(cleanText, directorNote);
    if (!base64Audio) throw new Error("IA no generó binario de audio.");

    const audioBuffer = new Uint8Array(decode(base64Audio).buffer);

    // 5. Almacenamiento en Storage
    const filePath = `public/${pod.user_id}/${podcast_id}-audio.mp3`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('podcasts')
      .upload(filePath, audioBuffer, { contentType: 'audio/mpeg', upsert: true });

    if (uploadError) throw new Error(`Storage error: ${uploadError.message}`);

    const { data: publicUrl } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);

    // 6. Cierre de Ciclo en DB
    await supabaseAdmin.from('micro_pods').update({
      audio_url: publicUrl.publicUrl,
      duration_seconds: Math.round(audioBuffer.length / 14000)
    }).eq('id', podcast_id);

    return new Response(JSON.stringify({ success: true, url: publicUrl.publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error(`🔥 [Audio Worker Error]:`, err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: corsHeaders });
  }
};

serve(guard(handler));