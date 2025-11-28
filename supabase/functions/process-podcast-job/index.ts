// supabase/functions/process-podcast-job/index.ts
// VERSIÓN REFACTORIZADA: Soporte para "Bypass" de generación si el guion ya fue editado.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

const MAX_RETRIES = 2;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

const WebhookPayloadSchema = z.object({
  job_id: z.number()
});

function buildFinalPrompt(template: string, inputs: any) {
  let finalPrompt = template;
  for (const key in inputs) {
    if (Object.prototype.hasOwnProperty.call(inputs, key)) {
      const value = typeof inputs[key] === 'object' ? JSON.stringify(inputs[key], null, 2) : String(inputs[key]);
      finalPrompt = finalPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
  }
  return finalPrompt;
}

const parseJsonResponse = (text: string) => {
  const jsonMatch = text.match(/```json([\s\S]*?)```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) { /* Fallback */ }
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error("La respuesta de la IA no contenía un formato JSON reconocible.");
  }
};

async function notifyFollowers(creatorId: string, podcastId: number, podcastTitle: string) {
  try {
    const { data: creatorProfile } = await supabaseAdmin
      .from('profiles').select('full_name').eq('id', creatorId).single();
    if (!creatorProfile) return;

    const { data: followers } = await supabaseAdmin
      .from('followers').select('follower_id').eq('following_id', creatorId);
    if (!followers || followers.length === 0) return;

    const notifications = followers.map(f => ({
      user_id: f.follower_id,
      type: 'new_podcast_from_followed_user',
      data: { actor_id: creatorId, actor_name: creatorProfile.full_name, podcast_id: podcastId, podcast_title: podcastTitle }
    }));
    
    await supabaseAdmin.from('notifications').insert(notifications);
  } catch (error) {
    console.error("Error en fan-out:", error.message);
  }
}

serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let job: any = null;
  try {
    const { job_id } = WebhookPayloadSchema.parse(await request.json());
    const { data: jobData, error: jobError } = await supabaseAdmin.from('podcast_creation_jobs').select('*').eq('id', job_id).single();
    if (jobError || !jobData) throw new Error(`Trabajo ${job_id} no encontrado.`);
    job = jobData;

    await supabaseAdmin.from('podcast_creation_jobs').update({ status: 'processing' }).eq('id', job.id);
    
    // [MODIFICACIÓN ESTRATÉGICA]: Extraemos los nuevos campos del payload
    const { agentName, inputs, final_script, final_title } = job.payload;
    
    // Variable para unificar el resultado (sea generado o editado)
    let processedScriptData = { title: "", scriptBody: "" };

    // BIFURCACIÓN DE LÓGICA
    if (final_script && final_title) {
        // CAMINO A: El usuario ya editó el guion. Usamos esa "Verdad Absoluta".
        console.log(`Job ${job.id}: Usando guion pre-editado por el usuario.`);
        processedScriptData = {
            title: final_title,
            scriptBody: final_script // Esto ya viene como string (Markdown/HTML)
        };
    } else {
        // CAMINO B: Generación automática (Flujo Legacy)
        console.log(`Job ${job.id}: Generando guion desde cero con IA.`);
        
        const { data: promptData } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', agentName).single();
        if (!promptData) throw new Error(`Prompt para '${agentName}' no encontrado.`);

        const finalPrompt = buildFinalPrompt(promptData.prompt_template, inputs);
        const scriptGenApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GOOGLE_API_KEY}`;
        
        const scriptResponse = await fetch(scriptGenApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] }),
        });

        if (!scriptResponse.ok) {
            const errorText = await scriptResponse.text();
            throw new Error(`API de IA (Guion) falló: ${errorText}`);
        }

        const scriptResult = await scriptResponse.json();
        const generatedText = scriptResult.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!generatedText) throw new Error("La respuesta de la IA (Guion) no tiene la estructura esperada.");
        
        const scriptJson = parseJsonResponse(generatedText);
        
        processedScriptData = {
            title: scriptJson.title,
            // Mantenemos compatibilidad con agentes viejos que devuelven arrays o strings
            scriptBody: scriptJson.script 
        };
    }

    // PREPARACIÓN PARA BASE DE DATOS
    const initialPodcastStatus = inputs.generateAudioDirectly ? 'pending_approval' : 'published';
    
    // [AJUSTE DE DATOS]: Si scriptBody es string (nuevo editor), lo guardamos directo. 
    // Si es objeto/array (legacy), lo stringificamos.
    const scriptTextToSave = typeof processedScriptData.scriptBody === 'string' 
        ? processedScriptData.scriptBody 
        : JSON.stringify(processedScriptData.scriptBody);

    const { data: newPodcast, error: insertError } = await supabaseAdmin.from('micro_pods').insert({
      user_id: job.user_id,
      title: processedScriptData.title,
      script_text: scriptTextToSave,
      status: initialPodcastStatus,
      creation_data: job.payload // Guardamos el payload completo (incluyendo el borrador original si existía)
    }).select('id').single();
    
    if (insertError || !newPodcast) throw new Error(`Fallo al guardar el guion: ${insertError?.message}`);

    const finalJobStatus = inputs.generateAudioDirectly ? 'pending_audio' : 'completed';
    await supabaseAdmin.from('podcast_creation_jobs').update({
      status: finalJobStatus,
      micro_pod_id: newPodcast.id,
      error_message: null
    }).eq('id', job.id);

    // Detonación de Workers (Audio e Imagen)
    supabaseAdmin.functions.invoke('generate-cover-image', { body: { job_id: job.id, agent_name: 'cover-art-director-v1' } });
    
    if (finalJobStatus === 'pending_audio') {
      supabaseAdmin.functions.invoke('generate-audio-from-script', { body: { job_id: job.id } });
    }

    (async () => {
      await supabaseAdmin.from('notifications').insert({
        user_id: job.user_id,
        type: 'podcast_created_success',
        data: { podcast_id: newPodcast.id, podcast_title: processedScriptData.title }
      });
      await notifyFollowers(job.user_id, newPodcast.id, processedScriptData.title);
    })();
    
    return new Response(JSON.stringify({ success: true, message: `Trabajo de guion ${job.id} completado.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

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
          const finalErrorMessage = `Falló después de ${MAX_RETRIES + 1} intentos. Error final: ${errorMessage.substring(0, 200)}`;
          await supabaseAdmin.from('podcast_creation_jobs').update({ status: "failed", error_message: finalErrorMessage }).eq('id', job.id);
          
          await supabaseAdmin.from('notifications').insert({
            user_id: job.user_id,
            type: 'podcast_created_failure',
            data: { job_title: job.payload?.inputs?.topic || 'Tu Micro-Podcast', error_message: finalErrorMessage }
          });
        }
      } else {
        await supabaseAdmin.from('podcast_creation_jobs').update({
          status: "failed",
          error_message: `Error permanente: ${errorMessage.substring(0, 255)}`
        }).eq('id', job.id);
        
        await supabaseAdmin.from('notifications').insert({
          user_id: job.user_id,
          type: 'podcast_created_failure',
          data: { job_title: job.payload?.inputs?.topic || 'Tu Micro-Podcast', error_message: errorMessage.substring(0, 100) }
        });
      }
    }
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});