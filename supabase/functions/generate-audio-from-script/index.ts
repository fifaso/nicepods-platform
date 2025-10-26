// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN DE PRODUCCIÓN FINAL (CHIRP TTS)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { decode } from "https://deno.land/std@0.208.0/encoding/base64.ts";
import { corsHeaders } from "../_shared/cors.ts";
import * as mm from "https://esm.sh/music-metadata@7.14.0"; 

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;
const PROJECT_NUMBER = "716729888285"; // Tu ID de proyecto confirmado

const AudioPayloadSchema = z.object({
  podcastId: z.string(),
  voiceName: z.string(), // Ahora recibirá 'chirp-es-XXX'
  speakingRate: z.number(),
});

type ScriptLine = { speaker: string; line: string; };

function chunkScriptForTTS(script: ScriptLine[], limit = 4500): string[] {
  const chunks: string[] = [];
  let currentChunkLines: string[] = [];
  let currentByteLength = 0;
  const encoder = new TextEncoder();

  const speakTagStart = "<speak>";
  const speakTagEnd = "</speak>";
  const tagsByteLength = encoder.encode(speakTagStart + speakTagEnd).length;

  for (const line of script) {
    const lineSSML = `<p>${line.line}</p><break time="800ms"/>`;
    const lineByteLength = encoder.encode(lineSSML).length;

    if (currentByteLength + lineByteLength + tagsByteLength > limit && currentChunkLines.length > 0) {
      chunks.push(`${speakTagStart}${currentChunkLines.join('')}${speakTagEnd}`);
      currentChunkLines = [];
      currentByteLength = 0;
    }
    
    currentChunkLines.push(lineSSML);
    currentByteLength += lineByteLength;
  }

  if (currentChunkLines.length > 0) {
    chunks.push(`${speakTagStart}${currentChunkLines.join('')}${speakTagEnd}`);
  }
  
  return chunks;
}

serve(async (request: Request) => {
  if (request.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }
  try {
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) throw new Error("Cabecera de autorización requerida.");
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authorizationHeader } } });
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { return new Response(JSON.stringify({ error: "No autorizado." }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}); }
    
    const payload = await request.json();
    const { podcastId, voiceName, speakingRate } = AudioPayloadSchema.parse(payload);

    const { data: podcast, error: podcastError } = await supabaseAdmin.from('micro_pods').select('user_id, script_text').eq('id', podcastId).single();
    if (podcastError) throw new Error(`No se pudo encontrar el podcast: ${podcastError.message}`);
    if (podcast.user_id !== user.id) { return new Response(JSON.stringify({ error: "No tienes permiso para modificar este podcast." }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}); }
    if (!podcast.script_text) { throw new Error("El guion de este podcast está vacío."); }

    const scriptData = JSON.parse(podcast.script_text) as ScriptLine[];
    const ssmlChunks = chunkScriptForTTS(scriptData);

    // ================== INTERVENCIÓN QUIRÚRGICA: NUEVO ENDPOINT Y NOMBRE DE VOZ ==================
    // 1. Se apunta al endpoint `v1beta1` de la API de TTS.
    const ttsApiUrl = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${GOOGLE_API_KEY}`;
    
    // 2. Se construye el nombre de la voz con la ruta completa del recurso, como lo exige Chirp.
    const fullVoiceName = `projects/${PROJECT_NUMBER}/locations/us-central1/voices/${voiceName}`;
    
    const audioPromises = ssmlChunks.map(chunk => 
      fetch(ttsApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { ssml: chunk },
          voice: { name: fullVoiceName }, // Se usa el nombre completo del recurso
          audioConfig: { audioEncoding: 'MP3', speakingRate: speakingRate }
        })
      })
    );
    // ========================================================================================
    
    const responses = await Promise.all(audioPromises);

    const audioContents: string[] = [];
    for (const res of responses) {
      if (!res.ok) { throw new Error(`Una de las llamadas a la API de Google TTS falló: ${await res.text()}`); }
      const { audioContent } = await res.json();
      if (!audioContent) { throw new Error("Una de las respuestas de la API no contenía audio."); }
      audioContents.push(audioContent);
    }
    
    const audioBuffers = audioContents.map(content => decode(content));
    const combinedBlob = new Blob(audioBuffers, { type: 'audio/mpeg' });
    const combinedAudioBuffer = await combinedBlob.arrayBuffer();

    let audioDuration = 0;
    try {
      const metadata = await mm.parseBuffer(new Uint8Array(combinedAudioBuffer), 'audio/mpeg');
      audioDuration = metadata.format.duration ? Math.round(metadata.format.duration) : 0;
    } catch (e) {
      console.error("No se pudo parsear la duración del audio, se guardará como 0.", e);
    }

    const filePath = `public/${user.id}/${podcastId}-${Date.now()}.mp3`;
    const { error: storageError } = await supabaseAdmin.storage.from('podcasts').upload(filePath, combinedAudioBuffer, { contentType: 'audio/mpeg' });
    if (storageError) { throw new Error(`Fallo al subir el audio: ${storageError.message}`); }

    const { data: publicUrlData } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);
    if (!publicUrlData) { throw new Error("No se pudo obtener la URL pública del audio."); }

    const { error: updateError } = await supabaseAdmin
      .from('micro_pods')
      .update({ 
        audio_url: publicUrlData.publicUrl,
        duration_seconds: audioDuration
      })
      .eq('id', podcastId);
      
    if (updateError) { throw new Error(`Fallo al actualizar el podcast: ${updateError.message}`); }

    return new Response(JSON.stringify({ success: true, message: "Audio generado y guardado con éxito." }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error en generate-audio-from-script:", error);
    const errorMessage = error instanceof Error ? error.message : "Error interno desconocido.";
    const status = error instanceof ZodError ? 400 : 500;
    return new Response(JSON.stringify({ error: errorMessage }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
});