// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN FINAL ROBUSTA: Soporta guiones Legacy (JSON) y Modernos (Texto Plano/Markdown).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { decode } from "https://deno.land/std@0.208.0/encoding/base64.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { create } from "https://deno.land/x/djwt@v2.2/mod.ts";

const GOOGLE_CLIENT_EMAIL = Deno.env.get("GOOGLE_CLIENT_EMAIL");
const GOOGLE_PRIVATE_KEY_RAW = Deno.env.get("GOOGLE_PRIVATE_KEY");

if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY_RAW) {
  throw new Error("FATAL: GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY is not configured.");
}

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const InvokePayloadSchema = z.object({
  job_id: z.number(),
});

// Mapa de voces validado (Intacto)
const voiceMap = {
  "Masculino": {
    "Calmado": "es-US-Neural2-B",
    "Energético": "es-US-Neural2-B",
    "Profesional": "es-US-Neural2-B",
    "Inspirador": "es-US-Neural2-B",
  },
  "Femenino": {
    "Energético": "es-US-Neural2-A",
    "Profesional": "es-US-Neural2-A",
    "Calmado": "es-US-Neural2-C",
    "Inspirador": "es-US-Neural2-C",
  }
};

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
  if (!response.ok) throw new Error(`Error token Google: ${JSON.stringify(data)}`);
  return data.access_token;
}

// [NUEVA FUNCIÓN]: Extractor Inteligente de Texto
function extractTextFromScript(rawScript: string): string {
  try {
    // 1. Intentamos parsear como JSON (Formato Legacy)
    const parsed = JSON.parse(rawScript);
    
    // Si es un array de objetos {line: string}, lo unimos
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].line) {
       return parsed.map((item: any) => item.line).join('\n\n');
    }
    // Si es un objeto con propiedad script_body (Formato intermedio)
    if (parsed.script_body) {
        return parsed.script_body;
    }
    
    // Si es JSON pero no tiene estructura conocida, lo tratamos como texto
    return String(rawScript);

  } catch (e) {
    // 2. Si falla el parseo, asumimos que es Texto Plano / Markdown (Formato Nuevo)
    // Limpieza básica de Markdown para que el TTS no lea asteriscos
    let cleanText = rawScript
        .replace(/\*\*/g, "") // Quitar negritas
        .replace(/##/g, "")   // Quitar headers
        .replace(/__ /g, ""); // Quitar itálicas
        
    return cleanText;
  }
}

serve(async (request: Request) => {
  if (request.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }
  
  let jobId: number | null = null;
  try {
    const { job_id } = InvokePayloadSchema.parse(await request.json());
    jobId = job_id;

    await supabaseAdmin.from('podcast_creation_jobs').update({ status: 'processing' }).eq('id', job_id);

    const { data: jobData } = await supabaseAdmin.from('podcast_creation_jobs').select('micro_pod_id, payload').eq('id', jobId).single();
    if (!jobData?.micro_pod_id) throw new Error(`Podcast asociado al trabajo ${jobId} no encontrado.`);

    const podcastId = jobData.micro_pod_id;
    const inputs = jobData.payload.inputs;

    const { data: podcastData } = await supabaseAdmin.from('micro_pods').select('script_text, user_id').eq('id', podcastId).single();
    if (!podcastData?.script_text) throw new Error("Guion del podcast no encontrado o vacío.");
    
    // [CAMBIO QUIRÚRGICO]: Usamos la función extractora inteligente
    const scriptTextOnly = extractTextFromScript(podcastData.script_text);

    // Validación de seguridad: Texto vacío
    if (!scriptTextOnly || scriptTextOnly.trim().length < 10) {
        throw new Error("El texto extraído del guion es demasiado corto para generar audio.");
    }

    const accessToken = await getGoogleAccessToken();
    const ttsApiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize`;
    
    const selectedVoiceGender = inputs.voiceGender as keyof typeof voiceMap;
    const selectedVoiceStyle = inputs.voiceStyle as keyof typeof voiceMap['Masculino'];
    const voiceName = voiceMap[selectedVoiceGender]?.[selectedVoiceStyle] || "es-US-Neural2-A"; 

    const selectedVoicePace = inputs.voicePace as keyof typeof speakingRateMap;
    const speakingRate = speakingRateMap[selectedVoicePace] || 1.0;

    // Llamada a Google TTS
    const ttsResponse = await fetch(ttsApiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        input: { text: scriptTextOnly },
        voice: { languageCode: "es-US", name: voiceName },
        audioConfig: { audioEncoding: "MP3", speakingRate: speakingRate, effectsProfileId: ["headphone-class-device"] }
      })
    });
    
    if (!ttsResponse.ok) {
        const errorText = await ttsResponse.text();
        throw new Error(`API de Cloud TTS falló (${ttsResponse.status}): ${errorText}`);
    }
    
    const responseData = await ttsResponse.json();
    if (!responseData.audioContent) throw new Error("Respuesta de TTS sin audio.");

    const audioBuffer = decode(responseData.audioContent);
    const arrayBuffer = await (new Blob([audioBuffer], { type: 'audio/mpeg' })).arrayBuffer();

    const filePath = `public/${podcastData.user_id}/${podcastId}-audio.mp3`;
    await supabaseAdmin.storage.from('podcasts').upload(filePath, arrayBuffer, { contentType: 'audio/mpeg', upsert: true });

    const { data: publicUrlData } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);
    
    // Actualización final en DB
    await supabaseAdmin.from('micro_pods').update({ 
        audio_url: publicUrlData.publicUrl,
        // Nota: duration_seconds se actualizará en el frontend al cargar el audio, 
        // o podríamos calcularlo aquí estimando bytes/bitrate, pero dejarlo en 0 es seguro.
        status: 'published'
      }).eq('id', podcastId);
    
    await supabaseAdmin.from('podcast_creation_jobs').update({ status: 'completed' }).eq('id', jobId);

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});

  } catch (error) {
    console.error("Error en generate-audio:", error);
    if (jobId) {
      await supabaseAdmin.from('podcast_creation_jobs').update({ status: 'failed', error_message: error.message.substring(0, 255) }).eq('id', jobId);
    }
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
});