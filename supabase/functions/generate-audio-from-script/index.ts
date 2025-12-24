// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN: 11.0 (NicePod Engine Standard - High Fidelity Audio)

import { serve } from "std/http/server.ts";
import { createClient, SupabaseClient } from "supabase";
import { z } from "zod";
import { decode } from "std/encoding/base64.ts";
import { guard } from "guard";
import { corsHeaders } from "cors";
import { getGoogleAccessToken } from "google-auth";
import { VOICE_CONFIGS, SPEAKING_RATES, cleanTextForSpeech } from "ai-core";

const SAFE_CHUNK_LIMIT = 4500; // Límite de Google TTS por petición

const InvokePayloadSchema = z.object({
  job_id: z.number(),
  trace_id: z.string().optional()
});

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SERVICE_KEY);

  let currentJobId: number | null = null;

  try {
    const payload = await request.json();
    const { job_id } = InvokePayloadSchema.parse(payload);
    currentJobId = job_id;

    // 1. OBTENER DATOS (Gracias al Atomic Handshake, el micro_pod_id ya existe)
    const { data: job } = await supabaseAdmin.from('podcast_creation_jobs').select('micro_pod_id, payload').eq('id', job_id).single();
    if (!job?.micro_pod_id) throw new Error("Referencia de podcast no encontrada en el Job.");

    const { data: pod } = await supabaseAdmin.from('micro_pods').select('script_text, user_id').eq('id', job.micro_pod_id).single();
    if (!pod) throw new Error("Podcast no encontrado.");

    // 2. PREPARACIÓN DEL TEXTO
    const scriptData = JSON.parse(pod.script_text || "{}");
    const rawText = scriptData.script_body || pod.script_text;
    const cleanText = cleanTextForSpeech(rawText);

    if (cleanText.length < 5) throw new Error("Guion insuficiente para generar audio.");

    // 3. CONFIGURACIÓN DE VOZ (Desde AI-Core)
    const inputs = job.payload.inputs || {};
    const gender = inputs.voiceGender || "Masculino";
    const style = inputs.voiceStyle || "Calmado";
    const voiceName = VOICE_CONFIGS[gender]?.[style] || "es-US-Neural2-A";
    const rate = SPEAKING_RATES[inputs.voicePace] || 1.0;

    console.log(`🎙️ [${correlationId}] Iniciando TTS para Job ${job_id} (${cleanText.length} chars)`);

    // 4. GENERACIÓN POR FRAGMENTOS (Evita Timeouts)
    const chunks = cleanText.match(new RegExp(`.{1,${SAFE_CHUNK_LIMIT}}`, 'g')) || [cleanText];
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

      if (!response.ok) throw new Error(`Google TTS API Fail: ${await response.text()}`);
      const json = await response.json();
      audioBuffers.push(new Uint8Array(decode(json.audioContent).buffer));
    }

    // 5. ENSAMBLAJE BINARIO
    const totalLength = audioBuffers.reduce((acc, b) => acc + b.length, 0);
    const finalBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const buffer of audioBuffers) {
      finalBuffer.set(buffer, offset);
      offset += buffer.length;
    }

    // 6. STORAGE & DB UPDATE
    const filePath = `public/${pod.user_id}/${job.micro_pod_id}-audio.mp3`;
    const { error: uploadError } = await supabaseAdmin.storage.from('podcasts').upload(filePath, finalBuffer, {
      contentType: 'audio/mpeg',
      upsert: true
    });

    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);

    await supabaseAdmin.from('micro_pods').update({
      audio_url: publicUrl.publicUrl,
      status: 'pending_approval' // Mantenemos borrador para revisión
    }).eq('id', job.micro_pod_id);

    return new Response(JSON.stringify({ success: true, url: publicUrl.publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido en Audio Worker";
    console.error(`🔥 [${correlationId}] Error:`, msg);
    if (currentJobId) await supabaseAdmin.from('podcast_creation_jobs').update({ status: 'failed', error_message: msg }).eq('id', currentJobId);
    return new Response(JSON.stringify({ success: false, error: msg }), { status: 500 });
  }
};

serve(guard(handler));