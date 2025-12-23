// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN: 10.0 (NicePod Engine v1.0 - Optimized Binaries & Resilience)

import { serve } from "std/http/server.ts";
import { createClient, SupabaseClient } from "supabase";
import { z } from "zod";
import { decode } from "std/encoding/base64.ts";
import { guard } from "guard";
import { corsHeaders } from "cors";
import { getGoogleAccessToken } from "../_shared/google-auth.ts";
import { VOICE_CONFIGS, SPEAKING_RATES } from "ai-core";

const SAFE_CHUNK_LIMIT = 4500; // Máximo permitido por petición TTS

const InvokePayloadSchema = z.object({
  job_id: z.number(),
  trace_id: z.string().optional()
});

// --- UTILIDADES DE AUDIO ---

function splitTextIntoSafeChunks(text: string): string[] {
  const words = text.split(' ');
  const chunks: string[] = [];
  let currentChunk = "";

  for (const word of words) {
    if ((currentChunk.length + word.length + 1) > SAFE_CHUNK_LIMIT) {
      chunks.push(currentChunk.trim());
      currentChunk = word;
    } else {
      currentChunk += (currentChunk ? " " : "") + word;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const supabaseAdmin: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let currentJobId: number | null = null;

  try {
    const payload = await request.json();
    const { job_id } = InvokePayloadSchema.parse(payload);
    currentJobId = job_id;

    // 1. OBTENER DATOS DEL PODCAST
    const { data: job } = await supabaseAdmin.from('podcast_creation_jobs').select('micro_pod_id, payload').eq('id', job_id).single();
    if (!job?.micro_pod_id) throw new Error("Referencia de podcast no encontrada.");

    const { data: pod } = await supabaseAdmin.from('micro_pods').select('script_text, user_id').eq('id', job.micro_pod_id).single();
    if (!pod) throw new Error("Podcast no encontrado en base de datos.");

    const scriptData = JSON.parse(pod.script_text || "{}");
    const textToSpeak = scriptData.script_body || pod.script_text;
    
    // Limpieza de caracteres que confunden al TTS
    const cleanText = textToSpeak.replace(/<[^>]+>/g, ' ').replace(/[\*_#`]/g, '').trim();

    // 2. CONFIGURACIÓN DE VOZ
    const inputs = job.payload.inputs || {};
    const gender = inputs.voiceGender || "Masculino";
    const style = inputs.voiceStyle || "Calmado";
    const voiceName = VOICE_CONFIGS[gender]?.[style] || "es-US-Neural2-A";
    const rate = SPEAKING_RATES[inputs.voicePace] || 1.0;

    console.log(`🎙️ [${correlationId}] Iniciando TTS: ${cleanText.length} caracteres.`);

    // 3. PROCESAMIENTO POR FRAGMENTOS
    const chunks = splitTextIntoSafeChunks(cleanText);
    const accessToken = await getGoogleAccessToken();
    const audioBuffers: Uint8Array[] = [];

    for (const chunk of chunks) {
      const response = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: chunk },
          voice: { languageCode: "es-US", name: voiceName },
          audioConfig: { audioEncoding: "MP3", speakingRate: rate }
        })
      });

      if (!response.ok) throw new Error(`Google TTS Error: ${await response.text()}`);

      const json = await response.json();
      audioBuffers.push(new Uint8Array(decode(json.audioContent).buffer));
    }

    // 4. ENSAMBLAJE FINAL
    const totalLength = audioBuffers.reduce((acc, b) => acc + b.length, 0);
    const finalBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const buffer of audioBuffers) {
      finalBuffer.set(buffer, offset);
      offset += buffer.length;
    }

    // 5. SUBIDA A STORAGE
    const filePath = `public/${pod.user_id}/${job.micro_pod_id}-audio.mp3`;
    const { error: uploadError } = await supabaseAdmin.storage.from('podcasts').upload(filePath, finalBuffer, {
      contentType: 'audio/mpeg',
      upsert: true
    });

    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);

    // 6. CIERRE DE CICLO
    await supabaseAdmin.from('micro_pods').update({
      audio_url: publicUrl.publicUrl,
      status: 'pending_approval' // Se queda en borrador para revisión del usuario
    }).eq('id', job.micro_pod_id);

    return new Response(JSON.stringify({ success: true, url: publicUrl.publicUrl }));

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido en Audio Worker";
    console.error(`🔥 [${correlationId}] Error Audio:`, msg);
    if (currentJobId) await supabaseAdmin.from('podcast_creation_jobs').update({ status: 'failed', error_message: msg }).eq('id', currentJobId);
    return new Response(JSON.stringify({ success: false, error: msg }), { status: 500 });
  }
};

serve(guard(handler));