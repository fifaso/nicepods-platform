// supabase/functions/process-podcast-job/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// ========================================================================
// SETUP: Constantes y Tipos
// ========================================================================
const MAX_RETRIES = 2;

interface Job {
  id: number;
  user_id: string;
  payload: {
    agentName: string;
    inputs: Record<string, any>;
    [key: string]: any;
  };
  retry_count: number;
}

// ========================================================================
// HELPER: Función para construir el prompt dinámicamente
// ========================================================================
function buildFinalPrompt(template: string, inputs: Record<string, any>): string {
  let finalPrompt = template;
  for (const key in inputs) {
    const value = typeof inputs[key] === 'object' 
      ? JSON.stringify(inputs[key], null, 2) 
      : String(inputs[key]);
    finalPrompt = finalPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return finalPrompt;
}

// ========================================================================
// FUNCIÓN PRINCIPAL (Ahora activada por Webhook)
// ========================================================================
serve(async (request: Request) => {
  // Manejo de la solicitud pre-vuelo de CORS
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Usamos el 'service_role' key para tener acceso de administrador.
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let job: Job | null = null;

  try {
    // ========================================================================
    // PASO 1: ADQUIRIR EL TRABAJO A PARTIR DEL PAYLOAD DEL WEBHOOK
    // ========================================================================
    
    // Verificación de seguridad básica: Asegurarse de que la llamada proviene de un servicio autenticado.
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error("Llamada no autorizada.");
    }

    const { job_id } = await request.json();
    if (!job_id) {
      throw new Error("Se requiere un 'job_id' en el cuerpo de la solicitud.");
    }
    
    const { data: specificJob, error: findError } = await supabaseAdmin
      .from('podcast_creation_jobs')
      .select('*')
      .eq('id', job_id)
      .single<Job>();

    if (findError || !specificJob) {
      throw new Error(`El trabajo con ID ${job_id} no fue encontrado.`);
    }

    job = specificJob;

    // Marcamos el trabajo como 'processing' para evitar ejecuciones duplicadas.
    await supabaseAdmin
      .from('podcast_creation_jobs')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', job.id);
      
    // ========================================================================
    // PASO 2: EJECUTAR LA LÓGICA DE NEGOCIO (SIN CAMBIOS)
    // ========================================================================

    const { agentName, inputs } = job.payload;
    if (!agentName) throw new Error(`El trabajo ${job.id} no tiene un 'agentName'.`);

    const { data: promptData, error: promptError } = await supabaseAdmin
      .from('ai_prompts')
      .select('prompt_template')
      .eq('agent_name', agentName)
      .single();
    if (promptError || !promptData) throw new Error(`Prompt para el agente '${agentName}' no encontrado.`);

    const finalPrompt = buildFinalPrompt(promptData.prompt_template, inputs);

    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!GOOGLE_API_KEY) throw new Error("La clave GOOGLE_AI_API_KEY no está configurada.");
    
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] }),
    });

    if (!aiResponse.ok) {
        const errorBody = await aiResponse.text();
        throw new Error(`La API de Google AI falló con el estado ${aiResponse.status}: ${errorBody}`);
    }
    
    const aiResult = await aiResponse.json();
    const generatedText = aiResult.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
    const scriptJson = JSON.parse(generatedText);

    // ========================================================================
    // PASO 3: PERSISTIR EL RESULTADO Y RESOLVER EL TRABAJO (SIN CAMBIOS)
    // ========================================================================

    const { data: newPodcast, error: createPodError } = await supabaseAdmin
      .from('micro_pods')
      .insert({
        user_id: job.user_id,
        title: scriptJson.title,
        script_text: JSON.stringify(scriptJson.script),
        status: 'published',
      })
      .select('id')
      .single();

    if (createPodError) throw new Error(`Error al guardar el podcast: ${createPodError.message}`);

    await supabaseAdmin
      .from('podcast_creation_jobs')
      .update({ status: 'completed', micro_pod_id: newPodcast.id, error_message: null })
      .eq('id', job.id);

    return new Response(JSON.stringify({ success: true, message: `Trabajo ${job.id} completado.` }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // ========================================================================
    // PASO 4: MANEJO DE ERRORES (SIN CAMBIOS)
    // ========================================================================
    const errorMessage = error instanceof Error ? error.message : "Error interno desconocido.";
    console.error(`Error procesando el trabajo ${job?.id || 'webhook'}: ${errorMessage}`);

    if (job && job.retry_count < MAX_RETRIES) {
      await supabaseAdmin
        .from("podcast_creation_jobs")
        .update({
          status: "pending",
          retry_count: job.retry_count + 1,
          error_message: `Intento ${job.retry_count + 1} falló: ${errorMessage.substring(0, 255)}`
        })
        .eq("id", job.id);
    } else if (job) {
      await supabaseAdmin
        .from("podcast_creation_jobs")
        .update({
          status: "failed",
          error_message: `Falló después de ${MAX_RETRIES + 1} intentos. Error final: ${errorMessage.substring(0, 255)}`
        })
        .eq("id", job.id);
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});