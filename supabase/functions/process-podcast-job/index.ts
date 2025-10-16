// supabase/functions/process-podcast-job/index.ts
// ARQUITECTURA: "TOKEN DE INVOCACIÓN DE UN SOLO USO" - RECEPTOR

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from "../_shared/cors.ts";

const MAX_RETRIES = 2;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

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
  if (request.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }
  let job: Job | null = null;
  try {
    const { job_id, token } = await request.json();
    if (!job_id || !token) { throw new Error("Se requiere 'job_id' y 'token' en el cuerpo de la solicitud."); }

    // 1. AUTENTICACIÓN: Reclamar y anular el token de forma atómica.
    // Esta operación solo tendrá éxito si el job_id y el token coinciden,
    // y si el token no ha sido ya anulado (es decir, no es NULL).
    const { data: claimedJob, error: claimError } = await supabaseAdmin
      .from('podcast_creation_jobs')
      .update({ invocation_token: null }) // Anula el token para prevenir re-uso
      .eq('id', job_id)
      .eq('invocation_token', token)
      .select()
      .single();
      
    if (claimError || !claimedJob) {
      console.error("Fallo de autorización. Trabajo no encontrado, ya reclamado, o token inválido:", claimError?.message);
      throw new Error("Llamada no autorizada o trabajo inválido.");
    }
    job = claimedJob;

    // A partir de aquí, la llamada es 100% legítima.
    
    // 2. BLOQUEO DEL TRABAJO
    await supabaseAdmin
      .from('podcast_creation_jobs')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', job.id);
      
    const { agentName, inputs } = job.payload;
    if (!agentName) throw new Error(`El trabajo ${job.id} no tiene un 'agentName'.`);

    // 3. LÓGICA DE NEGOCIO
    const getPromptResponse = await fetch(`${SUPABASE_URL}/rest/v1/ai_prompts?agent_name=eq.${agentName}&select=prompt_template`, { headers: ADMIN_AUTH_HEADERS });
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
      throw new Error(`La API de Google AI falló con el estado ${aiResponse.status}: ${errorBody}`);
    }
    
    const aiResult = await aiResponse.json();
    const generatedText = aiResult.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
    const scriptJson = JSON.parse(generatedText);

    // 4. PERSISTENCIA
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
    if (!insertPodResponse.ok) throw new Error("Fallo al guardar el podcast.");
    const newPodcast = (await insertPodResponse.json())[0];

    // 5. FINALIZACIÓN
    await supabaseAdmin
      .from('podcast_creation_jobs')
      .update({ status: 'completed', micro_pod_id: newPodcast.id, error_message: null })
      .eq('id', job.id);

    return new Response(JSON.stringify({ success: true, message: `Trabajo ${job.id} completado.` }), { status: 200, headers: corsHeaders });

  } catch (error) {
    // 6. MANEJO DE ERRORES Y REINTENTOS
    const errorMessage = error instanceof Error ? error.message : "Error interno desconocido.";
    console.error(`Error procesando el trabajo ${job?.id || 'webhook'}: ${errorMessage}`);
    if (job) {
      const newStatus = job.retry_count < MAX_RETRIES ? 'pending' : 'failed';
      const updatePayload = newStatus === 'pending'
        ? { status: "pending", retry_count: job.retry_count + 1, error_message: `Intento ${job.retry_count + 1} falló: ${errorMessage.substring(0, 255)}`, invocation_token: crypto.randomUUID() } // Se genera un nuevo token para el reintento
        : { status: "failed", error_message: `Falló después de ${MAX_RETRIES + 1} intentos. Error final: ${errorMessage.substring(0, 255)}` };
      await supabaseAdmin.from('podcast_creation_jobs').update(updatePayload).eq('id', job.id);
    }
    const status = errorMessage.includes("Llamada no autorizada") ? 401 : 500;
    return new Response(JSON.stringify({ error: errorMessage }), { status, headers: corsHeaders });
  }
});