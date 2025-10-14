// supabase/functions/process-podcast-job/index.ts
// VERSIÓN DE PRODUCCIÓN FINAL (ARQUITECTURA DE INVOCACIÓN DIRECTA Y CONTROL EXPLÍCITO)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const MAX_RETRIES = 2;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;
const INTERNAL_WEBHOOK_SECRET = Deno.env.get("INTERNAL_WEBHOOK_SECRET")!;

interface Job {
  id: number;
  user_id: string;
  payload: { agentName: string; inputs: Record<string, any>; };
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

const ADMIN_AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`
};

serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let job: Job | null = null;

  try {
    // 1. AUTENTICACIÓN: Validación de la llamada interna mediante un secreto compartido.
    // Este método es más rápido, simple y robusto que la validación de JWT para este caso de uso.
    const receivedSecret = request.headers.get('x-internal-secret');
    if (!receivedSecret || receivedSecret !== INTERNAL_WEBHOOK_SECRET) {
      console.error("Fallo de autorización: El secreto interno no coincide o falta.");
      throw new Error("Llamada no autorizada.");
    }

    // 2. OBTENCIÓN DEL TRABAJO: Extraer el ID del trabajo y obtener sus detalles.
    const { job_id } = await request.json();
    if (!job_id) { throw new Error("Se requiere un 'job_id' en el cuerpo de la solicitud."); }

    const getJobResponse = await fetch(`${SUPABASE_URL}/rest/v1/podcast_creation_jobs?id=eq.${job_id}&select=*`, {
      headers: ADMIN_AUTH_HEADERS
    });
    if (!getJobResponse.ok) throw new Error(`Fallo al buscar el trabajo. Status: ${getJobResponse.status}`);
    const jobs: Job[] = await getJobResponse.json();
    if (jobs.length === 0) throw new Error(`El trabajo con ID ${job_id} no fue encontrado.`);
    job = jobs[0];

    // 3. BLOQUEO DEL TRABAJO: Marcar el trabajo como 'processing' para evitar ejecuciones duplicadas.
    await fetch(`${SUPABASE_URL}/rest/v1/podcast_creation_jobs?id=eq.${job.id}`, {
      method: 'PATCH',
      headers: { ...ADMIN_AUTH_HEADERS, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ status: 'processing', updated_at: new Date().toISOString() })
    });
      
    const { agentName, inputs } = job.payload;
    if (!agentName) throw new Error(`El trabajo ${job.id} no tiene un 'agentName'.`);

    // 4. LÓGICA DE NEGOCIO: Obtener el prompt y llamar a la IA para generar el guion.
    const getPromptResponse = await fetch(`${SUPABASE_URL}/rest/v1/ai_prompts?agent_name=eq.${agentName}&select=prompt_template`, {
      headers: ADMIN_AUTH_HEADERS
    });
    if (!getPromptResponse.ok) throw new Error(`Prompt para el agente '${agentName}' no encontrado.`);
    const prompts = await getPromptResponse.json();
    if (prompts.length === 0) throw new Error(`Prompt para el agente '${agentName}' no encontrado.`);
    const promptData = prompts[0];

    const finalPrompt = buildFinalPrompt(promptData.prompt_template, inputs);
    
    const aiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_API_KEY}`;
    const aiResponse = await fetch(aiApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] }),
    });

    if (!aiResponse.ok) {
      const errorBody = await aiResponse.text();
      console.error(`Error de la API de Google (${aiResponse.status}):`, errorBody);
      throw new Error(`La API de Google AI falló con el estado ${aiResponse.status}.`);
    }
    
    const aiResult = await aiResponse.json();
    const generatedText = aiResult.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
    const scriptJson = JSON.parse(generatedText);

    // 5. PERSISTENCIA: Guardar el guion generado en la tabla `micro_pods`.
    const insertPodResponse = await fetch(`${SUPABASE_URL}/rest/v1/micro_pods`, {
      method: 'POST',
      headers: { ...ADMIN_AUTH_HEADERS, 'Prefer': 'return=representation' },
      body: JSON.stringify({
        user_id: job.user_id,
        title: scriptJson.title,
        script_text: JSON.stringify(scriptJson.script),
        status: 'published',
      })
    });
    if (!insertPodResponse.ok) {
      const errorBody = await insertPodResponse.text();
      throw new Error(`Fallo al guardar el podcast: ${errorBody}`);
    }
    const newPodcast = (await insertPodResponse.json())[0];

    // 6. FINALIZACIÓN: Marcar el trabajo como 'completed'.
    await fetch(`${SUPABASE_URL}/rest/v1/podcast_creation_jobs?id=eq.${job.id}`, {
      method: 'PATCH',
      headers: { ...ADMIN_AUTH_HEADERS, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ status: 'completed', micro_pod_id: newPodcast.id, error_message: null })
    });

    return new Response(JSON.stringify({ success: true, message: `Trabajo ${job.id} completado.` }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // 7. MANEJO DE ERRORES Y REINTENTOS: Si algo falla, se captura aquí.
    const errorMessage = error instanceof Error ? error.message : "Error interno desconocido.";
    console.error(`Error procesando el trabajo ${job?.id || 'webhook'}: ${errorMessage}`);

    if (job) {
      const newStatus = job.retry_count < MAX_RETRIES ? 'pending' : 'failed';
      const updatePayload = newStatus === 'pending'
        ? { status: "pending", retry_count: job.retry_count + 1, error_message: `Intento ${job.retry_count + 1} falló: ${errorMessage.substring(0, 255)}` }
        : { status: "failed", error_message: `Falló después de ${MAX_RETRIES + 1} intentos. Error final: ${errorMessage.substring(0, 255)}` };
      
      await fetch(`${SUPABASE_URL}/rest/v1/podcast_creation_jobs?id=eq.${job.id}`, {
        method: 'PATCH',
        headers: { ...ADMIN_AUTH_HEADERS, 'Prefer': 'return=minimal' },
        body: JSON.stringify(updatePayload)
      });
    }

    const status = errorMessage === "Llamada no autorizada." ? 401 : 500;
    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});