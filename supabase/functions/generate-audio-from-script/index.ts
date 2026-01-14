// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN: 20.0 (Master Integrity - Gemini 2.5 Flash TTS Binary Assembly)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

import { guard } from "../_shared/guard.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { callGeminiAudio, cleanTextForSpeech, createWavHeader } from "../_shared/ai.ts";
import { generateDirectorNote } from "../_shared/vocal-director-map.ts";

const MAX_CHUNK_SIZE = 5000;

const PayloadSchema = z.object({
  podcast_id: z.number()
});

const handler = async (request: Request): Promise<Response> => {
  const correlationId = crypto.randomUUID();
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  try {
    const { podcast_id } = PayloadSchema.parse(await request.json());
    console.log(`[Audio-Engine][${correlationId}] Procesando Podcast: ${podcast_id}`);

    // 1. Datos del Podcast
    const { data: pod, error } = await supabase.from('micro_pods').select('*').eq('id', podcast_id).single();
    if (error || !pod) throw new Error("PODCAST_NOT_FOUND");

    // 2. Limpieza de Guion
    const rawScript = typeof pod.script_text === 'string' ? JSON.parse(pod.script_text) : pod.script_text;
    const cleanText = cleanTextForSpeech(rawScript.script_body || pod.script_text);

    // 3. Dirección Actoral
    const inputs = (pod.creation_data as any)?.inputs || {};
    const voiceParams = { gender: inputs.voiceGender || "Masculino", style: inputs.voiceStyle || "Profesional" };
    const directorNote = generateDirectorNote(inputs.agentName || "narrador", voiceParams.gender, voiceParams.style, inputs.voicePace || "Moderado");

    // 4. Fragmentación
    const chunks = cleanText.match(new RegExp(`.{1,${MAX_CHUNK_SIZE}}(?=\\s|$)`, 'g')) || [cleanText];
    const audioBuffers: Uint8Array[] = [];

    // 5. Síntesis por Chunks
    for (let i = 0; i < chunks.length; i++) {
      console.log(`   > Bloque ${i + 1}/${chunks.length} via Gemini 2.5 TTS...`);
      const { data: base64Audio } = await callGeminiAudio(chunks[i], directorNote, voiceParams);
      audioBuffers.push(new Uint8Array(decode(base64Audio).buffer));
    }

    // 6. ENSAMBLAJE BINARIO CON CABECERA WAV
    // El modelo TTS de Gemini devuelve PCM lineal. Sin cabecera WAV, no suena.
    const rawDataLength = audioBuffers.reduce((acc, b) => acc + b.length, 0);
    const wavHeader = createWavHeader(rawDataLength, 24000); // 24kHz es el estándar de Gemini TTS

    const finalFile = new Uint8Array(wavHeader.length + rawDataLength);
    finalFile.set(wavHeader, 0);

    let offset = wavHeader.length;
    for (const b of audioBuffers) {
      finalFile.set(b, offset);
      offset += b.length;
    }

    // 7. Almacenamiento
    const filePath = `public/${pod.user_id}/${podcast_id}-audio.wav`;
    const { error: uploadError } = await supabase.storage.from('podcasts').upload(filePath, finalFile, {
      contentType: 'audio/wav',
      upsert: true
    });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('podcasts').getPublicUrl(filePath);

    // 8. Cierre de Job
    await supabase.from('micro_pods').update({
      audio_url: publicUrl,
      duration_seconds: Math.round(rawDataLength / (24000 * 2)), // Cálculo basado en 16-bit Mono 24kHz
      processing_status: 'completed'
    }).eq('id', podcast_id);

    return new Response(JSON.stringify({ success: true, url: publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error(`🔥 ERROR CRÍTICO AUDIO:`, err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

serve(guard(handler));