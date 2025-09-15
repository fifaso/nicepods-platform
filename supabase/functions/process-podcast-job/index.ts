// supabase/functions/process-podcast-job/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// ========================================================================
// SETUP: Constantes y Tipos
// ========================================================================
const MAX_RETRIES = 2;

// Definición de la estructura de un trabajo obtenido de la base de datos
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
// FUNCIÓN PRINCIPAL
// ========================================================================
serve(async (_request: Request) => {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let job: Job | null = null;

  try {
    // ========================================================================
    // PASO 1: ADQUIRIR Y BLOQUEAR UN TRABAJO DE LA COLA
    // ========================================================================
    const { data: pendingJob, error: findError } = await supabaseAdmin
      .from('podcast_creation_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle<Job>();

    if (findError) throw new Error(`Error al buscar trabajos pendientes: ${findError.message}`);
    if (!pendingJob) {
      return new Response(JSON.stringify({ message: "No hay trabajos pendientes." }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    job = pendingJob;

    await supabaseAdmin
      .from('podcast_creation_jobs')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', job.id);
      
    // ========================================================================
    // PASO 2: EJECUTAR LA LÓGICA DE NEGOCIO (VALIDACIÓN Y GENERACIÓN)
    // ========================================================================

    // 2.1: Validar payload y extraer datos
    const { agentName, inputs } = job.payload;
    if (!agentName) throw new Error(`El trabajo ${job.id} no tiene un 'agentName'.`);

    // 2.2: Obtener plantilla de prompt
    const { data: promptData, error: promptError } = await supabaseAdmin
      .from('ai_prompts')
      .select('prompt_template')
      .eq('agent_name', agentName)
      .single();
    if (promptError || !promptData) throw new Error(`Prompt para el agente '${agentName}' no encontrado.`);

    // 2.3: Construir el prompt final
    const finalPrompt = buildFinalPrompt(promptData.prompt_template, inputs);

    // 2.4: Llamar a la API de Google AI
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!GOOGLE_API_KEY) throw new Error("La clave GOOGLE_AI_API_KEY no está configurada.");
    
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GOOGLE_API_KEY}`, {
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
    // PASO 3: PERSISTIR EL RESULTADO Y RESOLVER EL TRABAJO
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
    // PASO 4: MANEJO DE ERRORES (REINTENTO O FALLO PERMANENTE)
    // ========================================================================
    const errorMessage = error instanceof Error ? error.message : "Error interno desconocido.";
    console.error(`Error procesando el trabajo ${job?.id || 'desconocido'}: ${errorMessage}`);

    if (job && job.retry_count < MAX_RETRIES) {
      // Reintentar: Devolvemos el trabajo a 'pending' y aumentamos el contador.
      await supabaseAdmin
        .from("podcast_creation_jobs")
        .update({
          status: "pending",
          retry_count: job.retry_count + 1,
          error_message: `Intento ${job.retry_count + 1} falló: ${errorMessage.substring(0, 255)}`
        })
        .eq("id", job.id);
    } else if (job) {
      // Fallo permanente: Marcamos el trabajo como 'failed'.
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