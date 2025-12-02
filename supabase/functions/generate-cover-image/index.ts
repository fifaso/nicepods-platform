// supabase/functions/generate-cover-image/index.ts
// VERSIÓN FINAL PATCH: Corrige el error 400 eliminando el parámetro 'sampleImageSize' conflictivo.

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

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!, 
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const InvokePayloadSchema = z.object({
  job_id: z.number(),
  agent_name: z.string()
});

async function getGoogleAccessToken() {
  const GOOGLE_PRIVATE_KEY = GOOGLE_PRIVATE_KEY_RAW.replace(/\\n/g, '\n');
  const jwt = await create({
    alg: "RS256",
    typ: "JWT"
  }, {
    iss: GOOGLE_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000)
  }, GOOGLE_PRIVATE_KEY);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(`Error token Google: ${JSON.stringify(data)}`);
  return data.access_token;
}

// Función para hidratar el prompt con datos reales
function hydratePrompt(template: string, variables: Record<string, string>) {
  let prompt = template;
  for (const [key, value] of Object.entries(variables)) {
    const cleanValue = value.replace(/(\r\n|\n|\r)/gm, " ").replace(/"/g, "'");
    prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), cleanValue);
  }
  return prompt;
}

serve(async (request)=>{
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  let jobId = null;
  try {
    const { job_id, agent_name } = InvokePayloadSchema.parse(await request.json());
    jobId = job_id;

    // 1. Obtener datos del Job y Podcast
    const { data: jobData } = await supabaseAdmin.from('podcast_creation_jobs').select('micro_pod_id').eq('id', jobId).single();
    if (!jobData?.micro_pod_id) throw new Error(`Job ${jobId} sin podcast asociado.`);
    
    const podcastId = jobData.micro_pod_id;
    const { data: podcastData } = await supabaseAdmin.from('micro_pods').select('title, script_text, user_id').eq('id', podcastId).single();
    if (!podcastData) throw new Error(`Podcast ${podcastId} no encontrado.`);

    // 2. Obtener el Agente de la DB
    const { data: promptData } = await supabaseAdmin.from('ai_prompts').select('prompt_template, model_identifier').eq('agent_name', agent_name).single();
    if (!promptData) throw new Error(`Agente '${agent_name}' no encontrado.`);

    // 3. Construir Prompt
    const scriptSummary = podcastData.script_text 
        ? podcastData.script_text.substring(0, 500) + "..." 
        : "Un podcast interesante sobre temas variados.";

    const visualPrompt = hydratePrompt(promptData.prompt_template, {
        title: podcastData.title || "Podcast",
        script_summary: scriptSummary
    });

    console.log("Generando cover con prompt:", visualPrompt);

    // 4. Llamada a Vertex AI
    const accessToken = await getGoogleAccessToken();
    const modelId = promptData.model_identifier || 'imagegeneration@006';
    const imageUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${GOOGLE_PROJECT_ID}/locations/us-central1/publishers/google/models/${modelId}:predict`;
    
    const imageResponse = await fetch(imageUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instances: [{ "prompt": visualPrompt }],
        parameters: {
          "sampleCount": 1,
          // [CORRECCIÓN CRÍTICA]: Eliminamos "sampleImageSize".
          // Con "aspectRatio": "1:1", Imagen 2 genera automáticamente 1024x1024.
          "aspectRatio": "1:1",
          // Mantenemos la optimización de formato para reducir peso
          "outputOptions": {
             "mimeType": "image/jpeg",
             "compressionQuality": 80
          }
        }
      })
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      throw new Error(`Vertex AI Error (${imageResponse.status}): ${errorText}`);
    }

    const responseData = await imageResponse.json();
    const imageBase64 = responseData.predictions?.[0]?.bytesBase64Encoded;
    
    if (!imageBase64) {
      console.error("Vertex Response:", JSON.stringify(responseData, null, 2));
      throw new Error("La IA no devolvió datos de imagen.");
    }

    // 5. Subida a Supabase (Optimizada como JPEG)
    const imageBuffer = Uint8Array.from(atob(imageBase64), (c)=>c.charCodeAt(0));
    const filePath = `public/${podcastData.user_id}/${podcastId}-cover.jpg`;
    
    await supabaseAdmin.storage.from('podcasts').upload(filePath, imageBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
      cacheControl: '31536000'
    });

    const { data: publicUrlData } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);
    
    await supabaseAdmin.from('micro_pods').update({
      cover_image_url: publicUrlData.publicUrl
    }).eq('id', podcastId);

    return new Response(JSON.stringify({
      success: true,
      imageUrl: publicUrlData.publicUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`Error generate-cover-image Job ${jobId}:`, error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});