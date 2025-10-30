// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN FINAL - "INGENIERO DE SONIDO" ACTIVADO POR WEBHOOK

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { decode } from "https://deno.land/std@0.208.0/encoding/base64.ts";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;
const INTERNAL_SECRET = Deno.env.get("INTERNAL_WEBHOOK_SECRET");

const WebhookPayloadSchema = z.object({
  job_id: z.number(),
});

type ScriptLine = { speaker: string; line: string; };

serve(async (request: Request) => {
  if (request.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }
  
  let jobId: number | null = null;
  try {
    const internalSecretHeader = request.headers.get('x-internal-secret');
    if (!INTERNAL_SECRET || internalSecretHeader !== INTERNAL_SECRET) {
      return new Response(JSON.stringify({ error: "No autorizado." }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }
    
    const payload = await request.json();
    const { job_id } = WebhookPayloadSchema.parse(payload);
    jobId = job_id;

    const { data: jobData, error: jobError } = await supabaseAdmin.from('podcast_creation_jobs').select('micro_pod_id, payload').eq('id', job_id).single();
    if (jobError || !jobData || !jobData.micro_pod_id) {
      throw new Error(`Trabajo ${job_id} o podcast asociado no encontrado.`);
    }

    const podcastId = jobData.micro_pod_id;
    const inputs = jobData.payload.inputs;

    const { data: podcast, error: podcastError } = await supabaseAdmin.from('micro_pods').select('script_text, user_id').eq('id', podcastId).single();
    if (podcastError) throw new Error(`No se pudo encontrar el podcast: ${podcastError.message}`);
    if (!podcast.script_text) throw new Error("El guion de este podcast está vacío.");
    
    const scriptData = JSON.parse(podcast.script_text) as ScriptLine[];
    const scriptTextOnly = scriptData.map(line => line.line).join('\n\n');
    
    const ttsApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-tts-preview:synthesizeSpeech?key=${GOOGLE_API_KEY}`;
    
    const voiceDescription = `Una voz ${inputs.voiceGender}, con un tono ${inputs.voiceStyle} y un ritmo ${inputs.voicePace}.`;
    const metaPrompt = `<speak><prosody rate="${inputs.speakingRate}"><s>${voiceDescription}</s><break time="1s"/>${scriptTextOnly.replace(/\n\n/g, '<break time="800ms"/>')}</prosody></speak>`;

    const ttsResponse = await fetch(ttsApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        model: "models/gemini-2.5-pro-tts-preview",
        text: metaPrompt,
        audio_config: { audio_encoding: "MP3" }
      })
    });
    if (!ttsResponse.ok) throw new Error(`API de IA (Audio) falló: ${await ttsResponse.text()}`);

    const { audioContent } = await ttsResponse.json();
    if (!audioContent) throw new Error("La respuesta de la IA (Audio) no contenía audio.");

    const audioBuffer = decode(audioContent);
    const arrayBuffer = await (new Blob([audioBuffer], { type: 'audio/mpeg' })).arrayBuffer();

    const audioDuration = 0;

    const filePath = `public/${podcast.user_id}/${podcastId}-${Date.now()}.mp3`;
    const { error: storageError } = await supabaseAdmin.storage.from('podcasts').upload(filePath, arrayBuffer, { contentType: 'audio/mpeg' });
    if (storageError) throw new Error(`Fallo al subir el audio: ${storageError.message}`);

    const { data: publicUrlData } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);
    if (!publicUrlData) throw new Error("No se pudo obtener la URL pública del audio.");

    await supabaseAdmin.from('micro_pods').update({ 
        audio_url: publicUrlData.publicUrl,
        duration_seconds: audioDuration,
        status: 'published'
      }).eq('id', podcastId);
    
    await supabaseAdmin.from('podcast_creation_jobs').update({ status: 'completed' }).eq('id', job_id);

    return new Response(JSON.stringify({ success: true, message: `Trabajo de audio para podcast ${podcastId} completado.` }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});

  } catch (error) {
    console.error("Error en generate-audio-from-script:", error);
    const errorMessage = error instanceof Error ? error.message : "Error interno desconocido.";
    if (jobId) {
      await supabaseAdmin.from('podcast_creation_jobs').update({ status: 'failed', error_message: `Error en la generación de audio: ${errorMessage.substring(0, 255)}`}).eq('id', jobId);
    }
    const status = error instanceof ZodError ? 400 : 500;
    return new Response(JSON.stringify({ error: errorMessage }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
});