// supabase/functions/process-podcast-job/index.ts
// VERSIÓN DE PRODUCCIÓN FINAL (CON PARSING ROBUSTO Y VALIDACIÓN DE IA)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from "../_shared/cors.ts";

const MAX_RETRIES = 2;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

interface Job { /* ... */ }

function buildFinalPrompt(template: string, inputs: Record<string, any>): string { /* ... */ }

// [INTERVENCIÓN QUIRÚRGICA] Se añade la función de parsing robusto.
const parseJsonResponse = (text: string) => {
  const jsonMatch = text.match(/```json([\s\S]*?)```/);
  // Si no encuentra un bloque ```json, intenta parsear el texto completo.
  if (!jsonMatch || !jsonMatch) {
    try {
      // Intenta un parseo directo, por si la IA respondió solo con el JSON.
      return JSON.parse(text);
    } catch {
      // Si todo falla, lanza un error claro.
      throw new Error("La respuesta de la IA no contenía un bloque JSON válido y no era un JSON parseable directamente.");
    }
  }
  try {
    return JSON.parse(jsonMatch);
  } catch (error) {
    throw new Error(`No se pudo parsear el bloque JSON de la respuesta de la IA. Error: ${error.message}`);
  }
};

serve(async (request: Request) => {
  if (request.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }
  let job: Job | null = null;
  try {
    const { job_id } = await request.json();
    if (!job_id) { throw new Error("Se requiere un 'job_id' en el cuerpo de la solicitud."); }

    const { data: jobData, error: jobError } = await supabaseAdmin.from('podcast_creation_jobs').select('*').eq('id', job_id).single();
    if (jobError || !jobData) { throw new Error(`El trabajo con ID ${job_id} no fue encontrado: ${jobError?.message}`); }
    job = jobData as Job;

    await supabaseAdmin.from('podcast_creation_jobs').update({ status: 'processing', updated_at: new Date().toISOString() }).eq('id', job.id);
      
    const { agentName, inputs } = job.payload;
    if (!agentName) throw new Error(`El trabajo ${job.id} no tiene un 'agentName'.`);

    const { data: promptData, error: promptError } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', agentName).single();
    if (promptError || !promptData) { throw new Error(`Prompt para el agente '${agentName}' no encontrado.`); }

    const finalPrompt = buildFinalPrompt(promptData.prompt_template, inputs);
    
    const aiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_API_KEY}`;
    const aiResponse = await fetch(aiApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] }),
    });

    if (!aiResponse.ok) {
      const errorBody = await aiResponse.text();
      throw new Error(`La API de Google AI falló con el estado ${aiResponse.status}: ${errorBody}`);
    }
    
    const aiResult = await aiResponse.json();
    
    // [INTERVENCIÓN QUIRÚRGICA] Se reemplaza el parseo frágil por el robusto.
    const generatedText = aiResult.candidates.content.parts.text;
    const scriptJson = parseJsonResponse(generatedText);

    const { data: newPodcast, error: insertError } = await supabaseAdmin.from('micro_pods').insert({
      user_id: job.user_id,
      title: scriptJson.title,
      script_text: JSON.stringify(scriptJson.script),
      status: 'published',
    }).select('id').single();
    if (insertError) { throw new Error(`Fallo al guardar el podcast: ${insertError.message}`); }

    await supabaseAdmin.from('podcast_creation_jobs').update({ status: 'completed', micro_pod_id: newPodcast.id, error_message: null }).eq('id', job.id);

    return new Response(JSON.stringify({ success: true, message: `Trabajo ${job.id} completado.` }), { status: 200, headers: corsHeaders });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error interno desconocido.";
    console.error(`Error procesando el trabajo ${job?.id || 'webhook'}: ${errorMessage}`);
    if (job) {
      const newStatus = job.retry_count < MAX_RETRIES ? 'pending' : 'failed';
      const updatePayload = newStatus === 'pending' ? { status: "pending", retry_count: job.retry_count + 1, error_message: `Intento ${job.retry_count + 1} falló: ${errorMessage.substring(0, 255)}` } : { status: "failed", error_message: `Falló después de ${MAX_RETRIES + 1} intentos. Error final: ${errorMessage.substring(0, 255)}` };
      await supabaseAdmin.from('podcast_creation_jobs').update(updatePayload).eq('id', job.id);
    }
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: corsHeaders });
  }
});