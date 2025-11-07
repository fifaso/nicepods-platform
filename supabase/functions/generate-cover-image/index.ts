// supabase/functions/generate-cover-image/index.ts
// VERSIÓN DE LA VICTORIA: Utiliza la autenticación profesional de Cuenta de Servicio para Vertex AI.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from "../_shared/cors.ts";
import { create } from "https://deno.land/x/djwt@v2.2/mod.ts";

// --- CONFIGURACIÓN Y SECRETOS ---
const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const GOOGLE_SERVICE_ACCOUNT = JSON.parse(Deno.env.get("GOOGLE_SERVICE_ACCOUNT")!);
const GOOGLE_PROJECT_ID = Deno.env.get("GOOGLE_PROJECT_ID")!;

// --- FUNCIÓN DE AUTENTICACIÓN (REUTILIZADA) ---
async function getGoogleAccessToken(): Promise<string> {
  const GOOGLE_PRIVATE_KEY = GOOGLE_SERVICE_ACCOUNT.private_key.replace(/\\n/g, '\n');
  const jwt = await create({ alg: "RS256", typ: "JWT" }, {
    iss: GOOGLE_SERVICE_ACCOUNT.client_email,
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

// --- FUNCIONES DE AYUDA ---
const createVisualPrompt = (title: string, scriptText: string): string => {
    const style = "digital art, cinematic lighting, high detail, epic, abstract conceptual";
    const theme = `An artwork for a podcast cover titled: "${title}".`;
    const context = scriptText.substring(0, 400).replace(/(\r\n|\n|\r)/gm, " ");
    return `${theme} The podcast explores these ideas: "${context}...". Style must be: ${style}.`;
};

// --- SERVIDOR DE LA FUNCIÓN ---
serve(async (request: Request) => {
  if (request.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }

  let jobId: number | null = null;
  try {
    const { job_id } = await request.json();
    jobId = job_id;

    const { data: jobData } = await supabaseAdmin.from('podcast_creation_jobs').select('micro_pod_id').eq('id', jobId).single();
    if (!jobData || !jobData.micro_pod_id) throw new Error(`Podcast asociado al trabajo ${jobId} no encontrado.`);
    
    const podcastId = jobData.micro_pod_id;

    const { data: podcastData } = await supabaseAdmin.from('micro_pods').select('title, script_text, user_id').eq('id', podcastId).single();
    if (!podcastData) throw new Error(`Podcast con ID ${podcastId} no encontrado.`);

    const visualPrompt = createVisualPrompt(podcastData.title, podcastData.script_text || '');

    // [INTERVENCIÓN QUIRÚRGICA DE LA VICTORIA]
    // 1. Obtener un token de acceso válido.
    const accessToken = await getGoogleAccessToken();

    // 2. Usar el token para la autenticación Bearer, que es lo que Vertex AI espera.
    const imageUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${GOOGLE_PROJECT_ID}/locations/us-central1/publishers/google/models/imagegeneration:predict`;

    const imageResponse = await fetch(imageUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`, // <-- LA CORRECCIÓN CLAVE
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            instances: [{ "prompt": visualPrompt }],
            parameters: { "sampleCount": 1 }
        }),
    });
    
    const responseData = await imageResponse.json();
    if (!imageResponse.ok) {
        throw new Error(`API de Imagen (Vertex AI) falló: ${JSON.stringify(responseData)}`);
    }

    const imageBase64 = responseData.predictions[0]?.bytesBase64Encoded;
    if (!imageBase64) throw new Error("La respuesta de la IA no contenía datos de imagen.");
    
    const imageBuffer = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));

    const filePath = `public/${podcastData.user_id}/${podcastId}-cover.png`;
    await supabaseAdmin.storage.from('podcasts').upload(filePath, imageBuffer, { contentType: 'image/png', upsert: true });

    const { data: publicUrlData } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);
    if (!publicUrlData) throw new Error("No se pudo obtener la URL pública de la imagen.");

    await supabaseAdmin.from('micro_pods').update({ cover_image_url: publicUrlData.publicUrl }).eq('id', podcastId);

    return new Response(JSON.stringify({ success: true, imageUrl: publicUrlData.publicUrl }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});

  } catch (error)
 {
    console.error("Error en generate-cover-image:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
});