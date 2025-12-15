// supabase/functions/generate-cover-image/index.ts
// VERSIÓN: 2.0 (Guard Integrated: Sentry + Arcjet + Vertex AI Cost Protection)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { create } from "https://deno.land/x/djwt@v2.2/mod.ts";
import { guard } from "../_shared/guard.ts"; // <--- INTEGRACIÓN DEL ESTÁNDAR
import { corsHeaders } from "../_shared/cors.ts";

const InvokePayloadSchema = z.object({
  job_id: z.number(),
  agent_name: z.string()
});

// --- UTILIDADES DE GOOGLE CLOUD ---

async function getGoogleAccessToken(clientEmail: string, privateKeyRaw: string) {
  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
  const jwt = await create({
    alg: "RS256",
    typ: "JWT"
  }, {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000)
  }, privateKey);

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

function hydratePrompt(template: string, variables: Record<string, string>) {
  let prompt = template;
  for (const [key, value] of Object.entries(variables)) {
    const cleanValue = value.replace(/(\r\n|\n|\r)/gm, " ").replace(/"/g, "'");
    prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), cleanValue);
  }
  return prompt;
}

// --- LOGICA DE NEGOCIO (HANDLER) ---
const handler = async (request: Request): Promise<Response> => {
  // El Guard maneja OPTIONS

  // 1. VALIDACIÓN DE ENTORNO (Dentro del handler para reporte Sentry)
  const GOOGLE_CLIENT_EMAIL = Deno.env.get("GOOGLE_CLIENT_EMAIL");
  const GOOGLE_PRIVATE_KEY_RAW = Deno.env.get("GOOGLE_PRIVATE_KEY");
  const GOOGLE_PROJECT_ID = Deno.env.get("GOOGLE_PROJECT_ID");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY_RAW || !GOOGLE_PROJECT_ID || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
     throw new Error("FATAL: Secretos de configuración incompletos en el servidor.");
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  let jobId = null;

  try {
    // 2. PARSEO INPUT
    const { job_id, agent_name } = InvokePayloadSchema.parse(await request.json());
    jobId = job_id;

    console.log(`[Cover] Iniciando generación para Job ${jobId}`);

    // 3. RECUPERACIÓN DE DATOS
    const { data: jobData } = await supabaseAdmin.from('podcast_creation_jobs').select('micro_pod_id').eq('id', jobId).single();
    if (!jobData?.micro_pod_id) throw new Error(`Job ${jobId} sin podcast asociado.`);
    
    const podcastId = jobData.micro_pod_id;
    const { data: podcastData } = await supabaseAdmin.from('micro_pods').select('title, script_text, user_id').eq('id', podcastId).single();
    if (!podcastData) throw new Error(`Podcast ${podcastId} no encontrado.`);

    // 4. RECUPERACIÓN AGENTE (PROMPT)
    const { data: promptData } = await supabaseAdmin.from('ai_prompts').select('prompt_template, model_identifier').eq('agent_name', agent_name).single();
    if (!promptData) throw new Error(`Agente '${agent_name}' no encontrado.`);

    // 5. CONSTRUCCIÓN PROMPT
    const scriptSummary = podcastData.script_text 
        ? podcastData.script_text.substring(0, 500) + "..." 
        : "Un podcast interesante sobre temas variados.";

    const visualPrompt = hydratePrompt(promptData.prompt_template, {
        title: podcastData.title || "Podcast",
        script_summary: scriptSummary
    });

    // 6. GENERACIÓN (VERTEX AI)
    const accessToken = await getGoogleAccessToken(GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY_RAW);
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
          "aspectRatio": "1:1",
          // Optimización de formato JPEG (Reduce peso y latencia)
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

    // 7. SUBIDA A STORAGE
    const imageBuffer = Uint8Array.from(atob(imageBase64), (c)=>c.charCodeAt(0));
    const filePath = `public/${podcastData.user_id}/${podcastId}-cover.jpg`;
    
    const { error: uploadError } = await supabaseAdmin.storage.from('podcasts').upload(filePath, imageBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
      cacheControl: '31536000'
    });

    if (uploadError) throw new Error(`Error subiendo imagen: ${uploadError.message}`);

    const { data: publicUrlData } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);
    
    // 8. GUARDADO FINAL
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
    // Los errores críticos suben al Guard para Sentry
    // Los errores de negocio (400) los atrapa el Guard automáticamente si lanzamos una instancia de Error
    throw error;
  }
};

// --- PUNTO DE ENTRADA PROTEGIDO ---
serve(guard(handler));