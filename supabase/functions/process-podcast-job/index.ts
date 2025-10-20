// supabase/functions/process-podcast-job/index.ts
// VERSIÓN DE PRODUCCIÓN FINAL (CON GUARDADO DE METADATOS DE CREACIÓN)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
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
        try { return JSON.parse(jsonMatch[1]); } catch (e) { /* Fall through */ }
    }
    try { return JSON.parse(text); } catch (error) {
        throw new Error("La respuesta de la IA no contenía un formato JSON reconocible.");
    }
};

serve(async (request: Request) => {
  if (request.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }

  let job: Job | null = null;

  try {
    const { job_id } = await request.json();
    if (!job_id) { throw new Error("Se requiere un 'job_id' en el cuerpo de la solicitud."); }

    const { data: jobData, error: jobError } = await supabaseAdmin
      .from('podcast_creation_jobs')
      .select('*')
      .eq('id', job_id)
      .single();
    
    if (jobError || !jobData) { throw new Error(`El trabajo con ID ${job_id} no fue encontrado o hubo un error: ${jobError?.message}`); }
    job = jobData as Job;

    await supabaseAdmin
      .from('podcast_creation_jobs')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', job.id);
      
    const { agentName, inputs } = job.payload;
    if (!agentName) throw new Error(`El trabajo ${job.id} no tiene un 'agentName'.`);

    console.log(`Job ${job.id}: Agent='${agentName}', Inputs='${JSON.stringify(inputs)}'`);

    const { data: promptData, error: promptError } = await supabaseAdmin
      .from('ai_prompts')
      .select('prompt_template')
      .eq('agent_name', agentName)
      .single();

    if (promptError || !promptData) { throw new Error(`Prompt para el agente '${agentName}' no encontrado.`); }

    const finalPrompt = buildFinalPrompt(promptData.prompt_template, inputs);

    if (!finalPrompt || finalPrompt.trim() === "") {
      console.error("Error: El prompt final generado está vacío.");
      throw new Error("El prompt final generado está vacío, no se puede llamar a la IA.");
    }

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
    
    if (!aiResult.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("La respuesta de la API de Google AI no tiene la estructura esperada.");
    }
    const generatedText = aiResult.candidates[0].content.parts[0].text;
    
    const scriptJson = parseJsonResponse(generatedText);

    const { data: newPodcast, error: insertError } = await supabaseAdmin
      .from('micro_pods')
      .insert({
        user_id: job.user_id,
        title: scriptJson.title,
        script_text: JSON.stringify(scriptJson.script),
        status: 'published',
        creation_data: job.payload
      })
      .select('id')
      .single();
      
    if (insertError) { throw new Error(`Fallo al guardar el podcast: ${insertError.message}`); }

    await supabaseAdmin
      .from('podcast_creation_jobs')
      .update({ status: 'completed', micro_pod_id: newPodcast.id, error_message: null })
      .eq('id', job.id);

    return new Response(JSON.stringify({ success: true, message: `Trabajo ${job.id} completado.` }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error interno desconocido.";
    console.error(`Error procesando el trabajo ${job?.id || 'webhook'}: ${errorMessage}`);
    if (job) {
      const newStatus = job.retry_count < MAX_RETRIES ? 'pending' : 'failed';
      const updatePayload = newStatus === 'pending'
        ? { status: "pending", retry_count: job.retry_count + 1, error_message: `Intento ${job.retry_count + 1} falló: ${errorMessage.substring(0, 255)}` }
        : { status: "failed", error_message: `Falló después de ${MAX_RETRIES + 1} intentos. Error final: ${errorMessage.substring(0, 255)}` };
      await supabaseAdmin.from('podcast_creation_jobs').update(updatePayload).eq('id', job.id);
    }
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
});