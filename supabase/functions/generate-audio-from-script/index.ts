// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN: 6.0 (Security Hardened & Cost Controlled)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { decode } from "https://deno.land/std@0.208.0/encoding/base64.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { create } from "https://deno.land/x/djwt@v2.2/mod.ts";

// --- CONFIGURACIÓN & SECRETOS ---
const GOOGLE_CLIENT_EMAIL = Deno.env.get("GOOGLE_CLIENT_EMAIL");
const GOOGLE_PRIVATE_KEY_RAW = Deno.env.get("GOOGLE_PRIVATE_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY_RAW || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Faltan variables de entorno críticas.");
}

const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const InvokePayloadSchema = z.object({
  job_id: z.number(),
});

// --- CONSTANTES DE INGENIERÍA ---

// [SEGURIDAD] HARD LIMIT DE PRESUPUESTO
// 25,000 caracteres son aprox 15-20 minutos de audio.
// Evita que un error o ataque drene la cuota de Google Cloud.
const HARD_LIMIT_CHARS = 25000; 

// Google límite por request: 5000 bytes.
// Usamos 4000 para margen de seguridad (UTF-8 multibyte).
const SAFE_CHUNK_LIMIT = 4000; 

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

// --- UTILIDADES DE TEXTO BLINDADAS ---

function cleanScriptText(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/<[^>]+>/g, ' ') // Elimina HTML
    .replace(/[\*_#`]/g, '')  // Elimina Markdown chars
    .replace(/\s+/g, ' ')     // Colapsa espacios
    .trim();
}

// ALGORITMO DE CHUNKING AGRESIVO
function splitTextIntoSafeChunks(text: string, limit: number): string[] {
  const words = text.split(' ');
  const chunks: string[] = [];
  let currentChunk = "";

  for (const word of words) {
    if ((currentChunk.length + word.length + 1) > limit) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = word;
    } else {
      currentChunk += (currentChunk ? " " : "") + word;
    }
  }
  
  if (currentChunk) chunks.push(currentChunk.trim());

  return chunks.flatMap(c => {
      if (c.length <= limit) return [c];
      console.warn("Detectado bloque masivo indivisible. Cortando a la fuerza.");
      return c.match(new RegExp(`.{1,${limit}}`, 'g')) || [c];
  });
}

function concatenateAudioBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
  const totalLength = buffers.reduce((acc, b) => acc + b.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const buffer of buffers) {
    result.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }
  return result.buffer;
}

// --- CLIENTE GOOGLE ---

async function getGoogleAccessToken(): Promise<string> {
  const GOOGLE_PRIVATE_KEY = GOOGLE_PRIVATE_KEY_RAW!.replace(/\\n/g, '\n');
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
  if (!response.ok) throw new Error(`Error Auth Google: ${JSON.stringify(data)}`);
  return data.access_token;
}

// --- MAIN ---

serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  
  let jobId: number | null = null;

  try {
    const { job_id } = InvokePayloadSchema.parse(await request.json());
    jobId = job_id;

    console.log(`[Audio] Iniciando Job ${jobId}`);

    // Recuperar datos
    const { data: jobData } = await supabaseAdmin.from('podcast_creation_jobs').select('micro_pod_id, payload').eq('id', jobId).single();
    if (!jobData?.micro_pod_id) throw new Error("Job sin micro_pod_id asociado");

    const podcastId = jobData.micro_pod_id;
    const inputs = jobData.payload.inputs || {};

    const { data: podcastData } = await supabaseAdmin.from('micro_pods').select('script_text, user_id').eq('id', podcastId).single();
    
    // Extracción robusta del texto
    let rawText = "";
    if (typeof podcastData?.script_text === 'string') {
        try {
            const parsed = JSON.parse(podcastData.script_text);
            rawText = parsed.script_body || parsed.text || podcastData.script_text;
        } catch {
            rawText = podcastData.script_text;
        }
    } else if (typeof podcastData?.script_text === 'object') {
        rawText = (podcastData.script_text as any).script_body || JSON.stringify(podcastData.script_text);
    }

    const cleanText = cleanScriptText(rawText);
    
    // [SEGURIDAD] CHECKPOINT CRÍTICO: HARD LIMIT
    if (cleanText.length > HARD_LIMIT_CHARS) {
        throw new Error(`[SEGURIDAD] El guion excede el límite permitido. Longitud: ${cleanText.length} (Máx: ${HARD_LIMIT_CHARS}). Por favor, reduce la duración.`);
    }

    if (cleanText.length < 5) throw new Error("El guion está vacío o es ilegible.");

    console.log(`[Audio] Longitud Texto: ${cleanText.length} caracteres (Aprobado).`);

    // CHUNKING
    const chunks = splitTextIntoSafeChunks(cleanText, SAFE_CHUNK_LIMIT);
    console.log(`[Audio] Dividido en ${chunks.length} bloques seguros.`);

    // PREPARACIÓN GOOGLE TTS
    const accessToken = await getGoogleAccessToken();
    const ttsApiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize`;
    
    const gender = (inputs.voiceGender as keyof typeof voiceMap) || "Masculino";
    const style = (inputs.voiceStyle as string) || "Calmado";
    const voiceName = voiceMap[gender]?.[style as any] || "es-US-Neural2-A"; 
    const paceKey = (inputs.voicePace as keyof typeof speakingRateMap) || "Moderado";
    const rate = speakingRateMap[paceKey] || 1.0;

    const audioBuffers: ArrayBuffer[] = [];

    // PROCESAMIENTO SECUENCIAL
    for (const [i, chunk] of chunks.entries()) {
        console.log(`[Audio] Procesando chunk ${i+1}/${chunks.length} (${chunk.length} chars)`);
        
        let retries = 0;
        let success = false;
        
        while(retries < 2 && !success) {
            try {
                const response = await fetch(ttsApiUrl, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        input: { text: chunk },
                        voice: { languageCode: "es-US", name: voiceName },
                        audioConfig: { audioEncoding: "MP3", speakingRate: rate }
                    })
                });

                if (!response.ok) {
                    const errorTxt = await response.text();
                    throw new Error(`Google API Error: ${errorTxt}`);
                }

                const json = await response.json();
                if (!json.audioContent) throw new Error("Respuesta vacía de Google");
                
                audioBuffers.push(decode(json.audioContent).buffer);
                success = true;

            } catch (e) {
                retries++;
                console.error(`[Audio] Error en chunk ${i+1}, intento ${retries}:`, e);
                if (retries >= 2) throw e;
                await new Promise(r => setTimeout(r, 1000));
            }
        }
        
        if (i < chunks.length - 1) await new Promise(r => setTimeout(r, 100));
    }

    console.log("[Audio] Uniendo buffers...");
    const finalBuffer = concatenateAudioBuffers(audioBuffers);

    // SUBIDA
    const filePath = `public/${podcastData.user_id}/${podcastId}-audio.mp3`;
    console.log(`[Audio] Subiendo ${finalBuffer.byteLength} bytes a ${filePath}`);
    
    const { error: uploadError } = await supabaseAdmin.storage.from('podcasts').upload(filePath, finalBuffer, { 
        contentType: 'audio/mpeg', 
        upsert: true 
    });
    
    if (uploadError) throw new Error(`Error Storage: ${uploadError.message}`);

    const { data: publicUrlData } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);

    // FINALIZACIÓN
    await supabaseAdmin.from('micro_pods').update({ 
        audio_url: publicUrlData.publicUrl,
        status: 'published'
    }).eq('id', podcastId);
    
    await supabaseAdmin.from('podcast_creation_jobs').update({ status: 'completed' }).eq('id', jobId);

    return new Response(JSON.stringify({ success: true }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error("CRITICAL FAILURE:", error);
    if (jobId) {
        await supabaseAdmin.from('podcast_creation_jobs').update({ 
            status: 'failed', 
            error_message: error instanceof Error ? error.message : String(error)
        }).eq('id', jobId);
    }
    return new Response(JSON.stringify({ error: String(error) }), { 
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});