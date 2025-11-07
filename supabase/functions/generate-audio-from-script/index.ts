// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN DE LA VICTORIA ABSOLUTA: Con personalización completa y mejoras de calidad.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { decode } from "https://deno.land/std@0.208.0/encoding/base64.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { create } from "https://deno.land/x/djwt@v2.2/mod.ts";

// --- VERIFICACIÓN DE SECRETOS AL INICIO ---
const GOOGLE_CLIENT_EMAIL = Deno.env.get("GOOGLE_CLIENT_EMAIL");
const GOOGLE_PRIVATE_KEY_RAW = Deno.env.get("GOOGLE_PRIVATE_KEY");

if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY_RAW) {
  throw new Error("FATAL: GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY is not configured in Supabase secrets.");
}

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const InvokePayloadSchema = z.object({
  job_id: z.number(),
});

type ScriptLine = { speaker: string; line: string; };

// [INTERVENCIÓN QUIRÚRGICA #1] Mapa de voces de producción, basado en el catálogo de Google Cloud Neural2.
const voiceMap = {
  "Masculino": {
    "Calmado": "es-US-Neural2-D",     // Tono más bajo y resonante
    "Energético": "es-US-Neural2-B",   // Tono estándar, claro y enérgico
    "Profesional": "es-US-Neural2-B", // La voz 'B' es ideal para un tono de noticias/profesional
    "Inspirador": "es-US-Neural2-D",  // La voz 'D' es buena para un tono de narración inspirador
  },
  "Femenino": {
    "Calmado": "es-US-Neural2-C",     // Tono más bajo y cálido
    "Energético": "es-US-Neural2-A",   // Tono estándar, claro y enérgico
    "Profesional": "es-US-Neural2-A", // La voz 'A' es la contraparte femenina de la 'B'
    "Inspirador": "es-US-Neural2-C",  // La voz 'C' es buena para un tono de narración inspirador
  }
};

// [INTERVENCIÓN ESTRATÉGICA #2] Mapa para la velocidad de habla.
const speakingRateMap = {
  "Lento": 0.9,
  "Moderado": 1.0,
  "Rápido": 1.1,
};


async function getGoogleAccessToken(): Promise<string> {
  const GOOGLE_PRIVATE_KEY = GOOGLE_PRIVATE_KEY_RAW.replace(/\\n/g, '\n');

  const jwt = await create({ alg: "RS256", typ: "JWT" }, {
    iss: GOOGLE_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  }, GOOGLE_PRIVATE_KEY);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Error al obtener el token de acceso de Google: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

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

    const accessToken = await getGoogleAccessToken();
    const ttsApiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize`;
    
    // [INTERVENCIÓN QUIRÚRGICA #3] Selección dinámica de voz y ritmo.
    const selectedVoiceGender = inputs.voiceGender as keyof typeof voiceMap;
    const selectedVoiceStyle = inputs.voiceStyle as keyof typeof voiceMap['Masculino'];
    const voiceName = voiceMap[selectedVoiceGender]?.[selectedVoiceStyle] || "es-US-Neural2-B"; // Fallback a una voz masculina profesional.

    const selectedVoicePace = inputs.voicePace as keyof typeof speakingRateMap;
    const speakingRate = speakingRateMap[selectedVoicePace] || 1.0; // Fallback a velocidad moderada.

    const ttsResponse = await fetch(ttsApiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        input: { text: scriptTextOnly },
        voice: { 
          languageCode: "es-US",
          name: voiceName
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: speakingRate,
          // [INTERVENCIÓN ESTRATÉGICA #4] Añadir perfil de efectos para mayor calidad.
          effectsProfileId: ["headphone-class-device"]
        }
      })
    });
    
    if (!ttsResponse.ok) {
        const errorText = await ttsResponse.text();
        throw new Error(`API de Cloud TTS falló con status ${ttsResponse.status}: ${errorText}`);
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