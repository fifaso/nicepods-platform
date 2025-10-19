// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN DE PRODUCCIÓN FINAL (CON CÁLCULO DE DURACIÓN ROBUSTO)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { decode } from "https://deno.land/std@0.208.0/encoding/base64.ts";
import { corsHeaders } from "../_shared/cors.ts";
import * as mm from "https://esm.sh/music-metadata@7.14.0"; 

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;

const AudioPayloadSchema = z.object({
  podcastId: z.string(),
  voiceName: z.string(),
  speakingRate: z.number(),
});

type ScriptLine = { speaker: string; line: string; };

function transformScriptToSSML(scriptText: string): string {
  try {
    const scriptData = JSON.parse(scriptText) as ScriptLine[];
    const lines = scriptData.map(item => `<p>${item.line}</p>`).join('<break time="800ms"/>');
    return `<speak>${lines}</speak>`;
  } catch (error) {
    console.error("Error al transformar el guion a SSML:", error);
    throw new Error("El formato del guion es inválido y no se pudo procesar.");
  }
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

    const ssmlText = transformScriptToSSML(podcast.script_text);
    const languageCode = voiceName.split('-').slice(0, 2).join('-');
    
    const ttsResponse = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { ssml: ssmlText },
        voice: { languageCode: languageCode, name: voiceName },
        audioConfig: { audioEncoding: 'MP3', speakingRate: speakingRate }
      })
    });
    if (!ttsResponse.ok) { throw new Error(`La API de Google TTS falló: ${await ttsResponse.text()}`); }

    const { audioContent } = await ttsResponse.json();
    if (!audioContent) { throw new Error("La respuesta de la API de Google TTS no contenía audio."); }

    const decodedAudio = decode(audioContent);
    
    let audioDuration = 0;
    try {
      const metadata = await mm.parseBuffer(decodedAudio, 'audio/mpeg');
      audioDuration = metadata.format.duration ? Math.round(metadata.format.duration) : 0;
    } catch (e) {
      console.error("No se pudo parsear la duración del audio, se guardará como 0.", e);
    }

    const filePath = `public/${user.id}/${podcastId}-${Date.now()}.mp3`;
    const { error: storageError } = await supabaseAdmin.storage.from('podcasts').upload(filePath, decodedAudio, { contentType: 'audio/mpeg' });
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