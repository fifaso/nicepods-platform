// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN DE PRODUCCIÓN FINAL (ARQUITECTURA DE CHUNKING)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { decode } from "https://deno.land/std@0.208.0/encoding/base64.ts";
import * as mm from "https://esm.sh/music-metadata-browser@2.5.10";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;

const AudioPayloadSchema = z.object({
  podcastId: z.string(),
  voiceName: z.string(),
  speakingRate: z.number(),
});

type ScriptLine = { speaker: string; line: string; };

// ================== INTERVENCIÓN QUIRÚRGICA #1: EL DIVISOR DE GUIONES (CHUNKER) ==================
// Esta función toma el guion y lo divide en trozos más pequeños,
// asegurando que ninguno supere el límite de 5000 bytes de la API.
function chunkScriptForTTS(script: ScriptLine[], limit = 4800): string[] {
  const chunks: string[] = [];
  let currentChunk: ScriptLine[] = [];
  let currentLength = 0;

  for (const line of script) {
    const lineSSML = `<p>${line.line}</p><break time="800ms"/>`;
    const lineLength = new TextEncoder().encode(lineSSML).length;

    if (currentLength + lineLength > limit && currentChunk.length > 0) {
      chunks.push(`<speak>${currentChunk.map(item => `<p>${item.line}</p>`).join('<break time="800ms"/>')}</speak>`);
      currentChunk = [];
      currentLength = 0;
    }
    
    currentChunk.push(line);
    currentLength += lineLength;
  }

  if (currentChunk.length > 0) {
    chunks.push(`<speak>${currentChunk.map(item => `<p>${item.line}</p>`).join('<break time="800ms"/>')}</speak>`);
  }
  
  return chunks;
}
// ==============================================================================================

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

    const ttsApiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`;
    const languageCode = voiceName.split('-').slice(0, 2).join('-');
    
    // ================== INTERVENCIÓN QUIRÚRGICA #2: LLAMADAS EN PARALELO ==================
    // Se llama a la API para cada trozo, y se espera a que todas las promesas se resuelvan.
    const audioPromises = ssmlChunks.map(chunk => 
      fetch(ttsApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { ssml: chunk },
          voice: { languageCode: languageCode, name: voiceName },
          audioConfig: { audioEncoding: 'MP3', speakingRate: speakingRate }
        })
      })
    );
    const responses = await Promise.all(audioPromises);
    // =====================================================================================

    const audioContents: string[] = [];
    for (const res of responses) {
      if (!res.ok) { throw new Error(`Una de las llamadas a la API de Google TTS falló: ${await res.text()}`); }
      const { audioContent } = await res.json();
      if (!audioContent) { throw new Error("Una de las respuestas de la API no contenía audio."); }
      audioContents.push(audioContent);
    }
    
    // ================== INTERVENCIÓN QUIRÚRGICA #3: CONCATENACIÓN DE AUDIO ==================
    // Se decodifican todos los trozos de Base64 y se unen en un único archivo binario.
    const audioBlobs = audioContents.map(content => new Blob([decode(content)]));
    const combinedBlob = new Blob(audioBlobs, { type: 'audio/mpeg' });
    const combinedAudioBuffer = await combinedBlob.arrayBuffer();
    // ======================================================================================

    let audioDuration = 0;
    try {
      const metadata = await mm.parseBlob(combinedBlob);
      audioDuration = metadata.format.duration ? Math.round(metadata.format.duration) : 0;
    } catch (e) {
      console.error("No se pudo parsear la duración del audio.", e);
    }

    const filePath = `public/${user.id}/${podcastId}-${Date.now()}.mp3`;
    const { error: storageError } = await supabaseAdmin.storage.from('podcasts').upload(filePath, combinedAudioBuffer, { contentType: 'audio/mpeg' });
    if (storageError) { throw new Error(`Fallo al subir el audio: ${storageError.message}`); }

    const { data: publicUrlData } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);
    if (!publicUrlData) { throw new Error("No se pudo obtener la URL pública del audio."); }

    const { error: updateError } = await supabaseAdmin.from('micro_pods').update({ 
      audio_url: publicUrlData.publicUrl,
      duration_seconds: audioDuration
    }).eq('id', podcastId);
    if (updateError) { throw new Error(`Fallo al actualizar el podcast: ${updateError.message}`); }

    return new Response(JSON.stringify({ success: true, message: "Audio generado con éxito." }), {
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