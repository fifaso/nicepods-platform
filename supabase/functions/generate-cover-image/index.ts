// supabase/functions/generate-cover-image/index.ts
// VERSIÓN DE PRODUCCIÓN FINAL: Ahora es un trabajador especialista que lee prompts de la base de datos.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { create } from "https://deno.land/x/djwt@v2.2/mod.ts";

const GOOGLE_CLIENT_EMAIL = Deno.env.get("GOOGLE_CLIENT_EMAIL");
const GOOGLE_PRIVATE_KEY_RAW = Deno.env.get("GOOGLE_PRIVATE_KEY");
const GOOGLE_PROJECT_ID = Deno.env.get("GOOGLE_PROJECT_ID");

if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY_RAW || !GOOGLE_PROJECT_ID) {
  throw new Error("FATAL: Uno o más secretos de Google Cloud no están configurados.");
}

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const InvokePayloadSchema = z.object({
  job_id: z.number(),
  agent_name: z.string(),
});

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

function buildFinalPrompt(template: string, inputs: Record<string, any>): string {
  let finalPrompt = template;
  for (const key in inputs) {
    const value = String(inputs[key]);
    finalPrompt = finalPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return finalPrompt;
}

serve(async (request: Request) => {
  if (request.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }

  let jobId: number | null = null;
  try {
    const { job_id, agent_name } = InvokePayloadSchema.parse(await request.json());
    jobId = job_id;

    const { data: jobData } = await supabaseAdmin.from('podcast_creation_jobs').select('micro_pod_id').eq('id', jobId).single();
    if (!jobData || !jobData.micro_pod_id) throw new Error(`Podcast asociado al trabajo ${jobId} no encontrado.`);
    
    const podcastId = jobData.micro_pod_id;

    const { data: podcastData } = await supabaseAdmin.from('micro_pods').select('title, script_text, user_id').eq('id', podcastId).single();
    if (!podcastData) throw new Error(`Podcast con ID ${podcastId} no encontrado.`);

    const { data: promptData } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', agent_name).single();
    if (!promptData) throw new Error(`Agente de imagen '${agent_name}' no encontrado.`);

    const visualPrompt = buildFinalPrompt(promptData.prompt_template, {
      title: podcastData.title,
      script_summary: (podcastData.script_text || '').substring(0, 400).replace(/(\r\n|\n|\r)/gm, " "),
    });
    
    const accessToken = await getGoogleAccessToken();
    const imageUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${GOOGLE_PROJECT_ID}/locations/us-central1/publishers/google/models/imagegeneration:predict`;

    const imageResponse = await fetch(imageUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            instances: [{ "prompt": visualPrompt }],
            parameters: { "sampleCount": 1 }
        }),
    });
    
    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      throw new Error(`API de Imagen (Vertex AI) falló: ${errorText}`);
    }

    const responseData = await imageResponse.json();
    const imageBase64 = responseData.predictions[0]?.bytesBase64Encoded;
    if (!imageBase64) throw new Error("La respuesta de la IA no contenía datos de imagen.");
    
    const imageBuffer = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));

    const filePath = `public/${podcastData.user_id}/${podcastId}-cover.png`;
    await supabaseAdmin.storage.from('podcasts').upload(filePath, imageBuffer, { contentType: 'image/png', upsert: true });

    const { data: publicUrlData } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);
    if (!publicUrlData) throw new Error("No se pudo obtener la URL pública de la imagen.");

    await supabaseAdmin.from('micro_pods').update({ cover_image_url: publicUrlData.publicUrl }).eq('id', podcastId);

    return new Response(JSON.stringify({ success: true, imageUrl: publicUrlData.publicUrl }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});

  } catch (error) {
    console.error("Error en generate-cover-image:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
});