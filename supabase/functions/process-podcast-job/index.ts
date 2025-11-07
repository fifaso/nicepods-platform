// supabase/functions/process-podcast-job/index.ts
// VERSIÓN DE PRODUCCIÓN FINAL: Orquesta tareas paralelas y es resiliente a fallos de API.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

const MAX_RETRIES = 2;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

interface Job {
  id: number;
  user_id: string;
  payload: { agentName: string; inputs: Record<string, any>; style: string; };
  retry_count: number;
}

const WebhookPayloadSchema = z.object({
  job_id: z.number(),
});

function buildFinalPrompt(template: string, inputs: Record<string, any>): string {
  let finalPrompt = template;
  for (const key in inputs) {
    const value = typeof inputs[key] === 'object' ? JSON.stringify(inputs[key], null, 2) : String(inputs[key]);
    finalPrompt = finalPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return finalPrompt;
}

const parseJsonResponse = (text: string) => {
    const jsonMatch = text.match(/```json([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
        try { return JSON.parse(jsonMatch[1]); } catch (e) { /* Ignorar */ }
    }
    try { return JSON.parse(text); } catch (error) {
        throw new Error("La respuesta de la IA no contenía un formato JSON reconocible.");
    }
};

serve(async (request: Request) => {
  if (request.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }
  
  let job: Job | null = null;
  try {
    const { job_id } = WebhookPayloadSchema.parse(await request.json());
    
    const { data: jobData, error: jobError } = await supabaseAdmin.from('podcast_creation_jobs').select('*').eq('id', job_id).single();
    if (jobError || !jobData) throw new Error(`Trabajo ${job_id} no encontrado.`);
    job = jobData as Job;

    await supabaseAdmin.from('podcast_creation_jobs').update({ status: 'processing' }).eq('id', job.id);
      
    const { agentName, inputs } = job.payload;

    const { data: promptData } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', agentName).single();
    if (!promptData) throw new Error(`Prompt para '${agentName}' no encontrado.`);

    const finalPrompt = buildFinalPrompt(promptData.prompt_template, inputs);
    
    const scriptGenApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GOOGLE_API_KEY}`;
    
    const scriptResponse = await fetch(scriptGenApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] }),
    });
    if (!scriptResponse.ok) throw new Error(`API de IA (Guion) falló: ${await scriptResponse.text()}`);
    
    const scriptResult = await scriptResponse.json();
    const generatedText = scriptResult.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) throw new Error("La respuesta de la IA (Guion) no tiene la estructura esperada.");
    
    const scriptJson = parseJsonResponse(generatedText);

    const initialPodcastStatus = inputs.generateAudioDirectly ? 'pending_approval' : 'published';

    const { data: newPodcast, error: insertError } = await supabaseAdmin.from('micro_pods').insert({
      user_id: job.user_id,
      title: scriptJson.title,
      script_text: JSON.stringify(scriptJson.script),
      status: initialPodcastStatus,
      creation_data: job.payload,
    }).select('id').single();
      
    if (insertError || !newPodcast) throw new Error(`Fallo al guardar el guion: ${insertError?.message}`);

    const finalJobStatus = inputs.generateAudioDirectly ? 'pending_audio' : 'completed';
    
    await supabaseAdmin.from('podcast_creation_jobs').update({
      status: finalJobStatus,
      micro_pod_id: newPodcast.id,
      error_message: null
    }).eq('id', job.id);

    // Orquestación paralela
    console.log(`Lanzando generación de carátula para el trabajo ${job.id}...`);
    supabaseAdmin.functions.invoke('generate-cover-image', {
      body: { job_id: job.id }
    }).then(({ error }) => {
      if (error) console.error(`Invocación asíncrona a 'generate-cover-image' falló para el trabajo ${job.id}:`, error);
    });

    if (finalJobStatus === 'pending_audio') {
      console.log(`Lanzando generación de audio para el trabajo ${job.id}...`);
      supabaseAdmin.functions.invoke('generate-audio-from-script', {
        body: { job_id: job.id }
      }).then(({ error }) => {
        if (error) console.error(`Invocación asíncrona a 'generate-audio-from-script' falló para el trabajo ${job.id}:`, error);
      });
    }

    return new Response(JSON.stringify({ success: true, message: `Trabajo de guion ${job.id} completado. Tareas paralelas iniciadas.` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error interno desconocido.";
    console.error(`Error procesando trabajo ${job?.id || 'invocación'}: ${errorMessage}`);

    if (job) {
      if (errorMessage.includes("The model is overloaded") || errorMessage.includes("UNAVAILABLE") || errorMessage.includes("503")) {
        if (job.retry_count < MAX_RETRIES) {
          await supabaseAdmin.from('podcast_creation_jobs').update({
            status: "pending",
            retry_count: job.retry_count + 1,
            error_message: `Intento ${job.retry_count + 1} falló (transitorio): ${errorMessage.substring(0, 200)}`
          }).eq('id', job.id);
        } else {
          await supabaseAdmin.from('podcast_creation_jobs').update({
            status: "failed",
            error_message: `Falló después de ${MAX_RETRIES + 1} intentos. Error final (transitorio): ${errorMessage.substring(0, 200)}`
          }).eq('id', job.id);
        }
      } else {
        await supabaseAdmin.from('podcast_creation_jobs').update({
          status: "failed",
          error_message: `Error permanente: ${errorMessage.substring(0, 255)}`
        }).eq('id', job.id);
      }
    }
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
});