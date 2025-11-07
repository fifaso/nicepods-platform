// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN DE LA VICTORIA ABSOLUTA: Simplificada, robusta y basada en la API de producción v1.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { decode } from "https://deno.land/std@0.208.0/encoding/base64.ts";
import { corsHeaders } from "../_shared/cors.ts";

// --- SECRETOS SIMPLIFICADOS ---
// Solo necesitamos la API Key, que ya está probada y funciona para la generación de guiones.
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");

if (!GOOGLE_API_KEY) {
  throw new Error("FATAL: GOOGLE_AI_API_KEY is not configured in Supabase secrets.");
}

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const InvokePayloadSchema = z.object({
  job_id: z.number(),
});

type ScriptLine = { speaker: string; line: string; };

serve(async (request: Request) => {
  if (request.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }
  
  let jobId: number | null = null;
  try {
    const { job_id } = InvokePayloadSchema.parse(await request.json());
    jobId = job_id;

    await supabaseAdmin.from('podcast_creation_jobs').update({ status: 'processing' }).eq('id', job_id);

    const { data: jobData } = await supabaseAdmin.from('podcast_creation_jobs').select('micro_pod_id, payload').eq('id', jobId).single();
    if (!jobData || !jobData.micro_pod_id) throw new Error(`Podcast asociado al trabajo ${jobId} no encontrado.`);

    const podcastId = jobData.micro_pod_id;
    const inputs = jobData.payload.inputs;

    const { data: podcastData } = await supabaseAdmin.from('micro_pods').select('script_text, user_id').eq('id', podcastId).single();
    if (!podcastData || !podcastData.script_text) throw new Error("Guion del podcast no encontrado o vacío.");
    
    const scriptData = JSON.parse(podcastData.script_text) as ScriptLine[];
    const scriptTextOnly = scriptData.map(line => line.line).join('\n\n');

    // [INTERVENCIÓN ESTRATÉGICA DE LA VICTORIA]
    // 1. Apuntamos al endpoint de producción v1, que es estable y fiable.
    const ttsApiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`;
    
    // 2. Simplificamos la selección de voz a una voz Neural2 de alta calidad, eliminando la complejidad del voiceMap.
    const voiceSelection = {
        languageCode: "es-US",
        // 'es-US-Neural2-B' es una voz masculina de estudio. 'es-US-Neural2-A' es femenina.
        name: "es-US-Neural2-B", 
    };

    const ttsResponse = await fetch(ttsApiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text: scriptTextOnly },
        voice: voiceSelection,
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: inputs.speakingRate || 1.0,
        }
      })
    });
    
    if (!ttsResponse.ok) {
        const errorText = await ttsResponse.text();
        throw new Error(`API de Cloud TTS (v1) falló con status ${ttsResponse.status}: ${errorText}`);
    }
    
    const responseData = await ttsResponse.json();
    const audioContent = responseData.audioContent;
    
    if (!audioContent) {
        throw new Error("La respuesta de la IA no contenía audio.");
    }

    const audioBuffer = decode(audioContent);
    const arrayBuffer = await (new Blob([audioBuffer], { type: 'audio/mpeg' })).arrayBuffer();

    const filePath = `public/${podcastData.user_id}/${podcastId}-audio.mp3`;
    await supabaseAdmin.storage.from('podcasts').upload(filePath, arrayBuffer, { contentType: 'audio/mpeg', upsert: true });

    const { data: publicUrlData } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);
    if (!publicUrlData) throw new Error("No se pudo obtener la URL pública de la imagen.");

    await supabaseAdmin.from('micro_pods').update({ 
        audio_url: publicUrlData.publicUrl,
        duration_seconds: 0,
        status: 'published'
      }).eq('id', podcastId);
    
    await supabaseAdmin.from('podcast_creation_jobs').update({ status: 'completed' }).eq('id', jobId);

    return new Response(JSON.stringify({ success: true, message: `Trabajo de audio para podcast ${podcastId} completado.` }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});

  } catch (error) {
    console.error("Error en generate-audio-from-script:", error);
    const errorMessage = error instanceof Error ? error.message : "Error interno desconocido.";
    if (jobId) {
      await supabaseAdmin.from('podcast_creation_jobs').update({ status: 'failed', error_message: `Error en la generación de audio: ${errorMessage.substring(0, 255)}`}).eq('id', jobId);
    }
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
});