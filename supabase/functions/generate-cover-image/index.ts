// supabase/functions/generate-cover-image/index.ts
// VERSIÓN: 3.0 (Standard Compliant - Vertex AI Imagen 3 Optimized)

import { serve } from "std/http/server.ts";
import { createClient, SupabaseClient } from "supabase";
import { z } from "zod";
import { guard } from "guard";
import { corsHeaders } from "cors";
import { getGoogleAccessToken } from "google-auth";
import { buildPrompt, cleanTextForSpeech } from "ai-core";

const InvokePayloadSchema = z.object({
  job_id: z.number(),
  agent_name: z.string(),
  trace_id: z.string().optional()
});

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const GOOGLE_PROJECT_ID = Deno.env.get("GOOGLE_PROJECT_ID") ?? "";

  const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SERVICE_KEY);
  let currentJobId: number | null = null;

  try {
    // 1. VALIDACIÓN DE ENTRADA
    const payload = await request.json();
    const { job_id, agent_name } = InvokePayloadSchema.parse(payload);
    currentJobId = job_id;

    console.log(`🎨 [${correlationId}] Iniciando generación de imagen para Job: ${job_id}`);

    // 2. HIDRATACIÓN DE DATOS (Podcast + Agente)
    const { data: job } = await supabaseAdmin.from('podcast_creation_jobs').select('micro_pod_id').eq('id', job_id).single();
    if (!job?.micro_pod_id) throw new Error("Referencia de podcast no encontrada.");

    const [podResult, agentResult] = await Promise.all([
      supabaseAdmin.from('micro_pods').select('title, script_text, user_id').eq('id', job.micro_pod_id).single(),
      supabaseAdmin.from('ai_prompts').select('prompt_template, model_identifier').eq('agent_name', agent_name).single()
    ]);

    if (!podResult.data || !agentResult.data) throw new Error("Datos de podcast o agente insuficientes.");

    const podcast = podResult.data;
    const agent = agentResult.data;

    // 3. CONSTRUCCIÓN DEL PROMPT VISUAL
    // Limpiamos el guion para usarlo como contexto semántico para la imagen
    const scriptSummary = cleanTextForSpeech(podcast.script_text || "").substring(0, 500);
    
    const visualPrompt = buildPrompt(agent.prompt_template, {
      title: podcast.title,
      script_summary: scriptSummary
    });

    // 4. GENERACIÓN EN VERTEX AI (Google Cloud)
    const accessToken = await getGoogleAccessToken();
    const modelId = agent.model_identifier || 'imagegeneration@006'; // Imagen 3 por defecto
    const vertexUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${GOOGLE_PROJECT_ID}/locations/us-central1/publishers/google/models/${modelId}:predict`;

    const imageResponse = await fetch(vertexUrl, {
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
          "outputOptions": {
            "mimeType": "image/jpeg",
            "compressionQuality": 80
          }
        }
      })
    });

    if (!imageResponse.ok) throw new Error(`Vertex AI Error: ${await imageResponse.text()}`);

    const vertexData = await imageResponse.json();
    const imageBase64 = vertexData.predictions?.[0]?.bytesBase64Encoded;
    if (!imageBase64) throw new Error("La IA no devolvió datos binarios de imagen.");

    // 5. PERSISTENCIA EN STORAGE
    const imageBuffer = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0));
    const filePath = `public/${podcast.user_id}/${job.micro_pod_id}-cover.jpg`;

    const { error: uploadError } = await supabaseAdmin.storage.from('podcasts').upload(filePath, imageBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
      cacheControl: '31536000' // 1 año de caché para optimizar PWA
    });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);

    // 6. ACTUALIZACIÓN FINAL
    await supabaseAdmin.from('micro_pods').update({
      cover_image_url: publicUrlData.publicUrl
    }).eq('id', job.micro_pod_id);

    return new Response(JSON.stringify({ success: true, url: publicUrlData.publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido en Imagen Worker";
    console.error(`🔥 [${correlationId}] Error Imagen:`, msg);
    
    // No marcamos el Job como fallido aquí porque el audio podría haber tenido éxito.
    // Solo logueamos el error para auditoría Admin.
    return new Response(JSON.stringify({ success: false, error: msg }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
};

serve(guard(handler));