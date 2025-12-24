// supabase/functions/generate-audio-from-script/index.ts
import { serve } from "std/http/server.ts";
import { createClient, SupabaseClient } from "supabase";
import { z } from "zod";
import { decode } from "std/encoding/base64.ts";
import { guard } from "guard";
import { corsHeaders } from "cors";
import { getGoogleAccessToken } from "google-auth";
import { VOICE_CONFIGS, SPEAKING_RATES, cleanTextForSpeech } from "ai-core";

const SAFE_CHUNK_LIMIT = 4500;

const InvokePayloadSchema = z.object({
  job_id: z.number(),
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
    const { job_id, podcast_id } = InvokePayloadSchema.parse(payload);

    // 1. OBTENCIÓN DIRECTA (Usamos el ID inyectado, no buscamos en Jobs)
    const { data: pod, error: podErr } = await supabaseAdmin
      .from('micro_pods')
      .select('script_text, user_id, creation_data')
      .eq('id', podcast_id)
      .single();

    if (podErr || !pod) throw new Error(`Podcast ${podcast_id} no accesible.`);

    // 2. PROCESAMIENTO DE TEXTO
    const scriptData = typeof pod.script_text === 'string' ? JSON.parse(pod.script_text) : pod.script_text;
    const cleanText = cleanTextForSpeech(scriptData.script_body || pod.script_text);

    // 3. CONFIGURACIÓN DE VOZ
    const inputs = (pod.creation_data as any)?.inputs || {};
    const gender = inputs.voiceGender || "Masculino";
    const style = inputs.voiceStyle || "Calmado";
    const voiceName = VOICE_CONFIGS[gender]?.[style] || "es-US-Neural2-B";
    const rate = SPEAKING_RATES[inputs.voicePace] || 1.0;

    console.log(`🎙️ [${correlationId}] Generando Audio para Pod: ${podcast_id}`);

    // 4. SÍNTESIS POR FRAGMENTOS
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

      if (!response.ok) throw new Error(`Google TTS Error: ${await response.text()}`);
      const json = await response.json();
      audioBuffers.push(new Uint8Array(decode(json.audioContent).buffer));
    }

    // 5. ENSAMBLAJE Y CARGA
    const totalLength = audioBuffers.reduce((acc, b) => acc + b.length, 0);
    const finalBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const buffer of audioBuffers) {
      finalBuffer.set(buffer, offset);
      offset += buffer.length;
    }

    const filePath = `public/${pod.user_id}/${podcast_id}-audio.mp3`;
    await supabaseAdmin.storage.from('podcasts').upload(filePath, finalBuffer, {
      contentType: 'audio/mpeg',
      upsert: true
    });

    const { data: publicUrl } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);

    // 6. ACTUALIZACIÓN FINAL
    await supabaseAdmin.from('micro_pods').update({
      audio_url: publicUrl.publicUrl,
      duration_seconds: Math.round(totalLength / 12000) // Estimación de duración
    }).eq('id', podcast_id);

    return new Response(JSON.stringify({ success: true, url: publicUrl.publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: unknown) {
    console.error(`🔥 [Audio Error]:`, err);
    return new Response(JSON.stringify({ success: false, error: err instanceof Error ? err.message : "Audio Fail" }), { status: 500 });
  }
};

serve(guard(handler));