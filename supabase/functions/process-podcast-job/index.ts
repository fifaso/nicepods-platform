// supabase/functions/process-podcast-job/index.ts
// Estrategia: "Desacoplación Total" y Validación de Rol Profesional por JWT.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as djwt from "https://deno.land/x/djwt@v3.0.1/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

const MAX_RETRIES = 2;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;
const JWT_SECRET = Deno.env.get("SUPABASE_JWT_SECRET")!;

// ================== INTERVENCIÓN QUIRÚRGICA: PREPARACIÓN DE LA CLAVE ==================
// La API de criptografía de Deno requiere que la clave para algoritmos simétricos (HS256)
// sea un objeto `CryptoKey`, no un simple string.
// Preparamos la clave una sola vez al iniciar la función para máxima eficiencia.

const encoder = new TextEncoder();
const keyData = encoder.encode(JWT_SECRET);
const cryptoKey = await crypto.subtle.importKey(
  "raw",
  keyData,
  { name: "HMAC", hash: "SHA-256" },
  false, // La clave no es extraíble
  ["verify"] // La clave solo se usará para verificar firmas
);
// =====================================================================================

interface Job {
  id: number;
  user_id: string;
  payload: { agentName: string; inputs: Record<string, any>; };
  retry_count: number;
}

function buildFinalPrompt(template: string, inputs: Record<string, any>): string {
    // ... (sin cambios en esta función)
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
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new Error("Cabecera de autorización inválida o faltante.");
    }
    const token = authorizationHeader.split(' ')[1];

    try {
      // [CORRECCIÓN] Ahora pasamos el objeto `cryptoKey` preparado en lugar del string.
      const payload = await djwt.verify(token, cryptoKey);
      if (payload.role !== 'service_role') {
        throw new Error("El rol del token no es 'service_role'.");
      }
    } catch (err) {
      console.error("Fallo de autorización:", err.message);
      throw new Error("Llamada no autorizada.");
    }
    
    // ... (el resto del código de la función no necesita cambios)
    const { job_id } = await request.json();
    if (!job_id) { throw new Error("Se requiere un 'job_id'."); }

    const getJobResponse = await fetch(`${SUPABASE_URL}/rest/v1/podcast_creation_jobs?id=eq.${job_id}&select=*`, {
      headers: ADMIN_AUTH_HEADERS
    });
    if (!getJobResponse.ok) throw new Error("Fallo al buscar el trabajo.");
    const jobs: Job[] = await getJobResponse.json();
    if (jobs.length === 0) throw new Error(`El trabajo con ID ${job_id} no fue encontrado.`);
    job = jobs[0];

    await fetch(`${SUPABASE_URL}/rest/v1/podcast_creation_jobs?id=eq.${job.id}`, {
      method: 'PATCH',
      headers: { ...ADMIN_AUTH_HEADERS, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ status: 'processing', updated_at: new Date().toISOString() })
    });
      
    const { agentName, inputs } = job.payload;
    if (!agentName) throw new Error(`El trabajo ${job.id} no tiene un 'agentName'.`);

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
      throw new Error(`La API de Google AI falló con el estado ${aiResponse.status}: ${errorBody}`);
    }
    
    const aiResult = await aiResponse.json();
    const generatedText = aiResult.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
    const scriptJson = JSON.parse(generatedText);

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