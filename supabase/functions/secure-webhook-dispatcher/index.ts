// supabase/functions/secure-webhook-dispatcher/index.ts
// VERSIÓN FINAL Y ROBUSTA: Usa un cliente admin para invocar a los trabajadores de forma segura.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from "../_shared/cors.ts";

// Creamos un cliente de Supabase con privilegios de administrador (service_role_key).
// Este cliente se utilizará para realizar invocaciones seguras de una función a otra.
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

console.log("Función 'secure-webhook-dispatcher' iniciada correctamente.");

serve(async (request: Request) => {
  // Manejo estándar de la solicitud pre-vuelo (preflight) de CORS.
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { target_webhook_url, job_id } = await request.json();

    // Validación estricta de la entrada para asegurar que tenemos todo lo necesario.
    if (!target_webhook_url || !job_id) {
      return new Response(JSON.stringify({ error: "Faltan 'target_webhook_url' o 'job_id' en el payload." }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extraemos el nombre de la función de la URL para usarlo en el método 'invoke'.
    // Ejemplo: 'https://.../functions/v1/process-podcast-job' -> 'process-podcast-job'
    const functionName = new URL(target_webhook_url).pathname.split('/').pop();

    if (!functionName) {
        throw new Error(`No se pudo extraer el nombre de la función de la URL: ${target_webhook_url}`);
    }
    
    console.log(`Dispatching job ${job_id} to function: ${functionName}`);

    // [INTERVENCIÓN QUIRÚRGICA] Reemplazamos el 'fetch' anónimo por 'supabaseAdmin.functions.invoke'.
    // Este método es la forma canónica y segura de llamar a otra Edge Function,
    // ya que automáticamente incluye la cabecera 'Authorization: Bearer <service_role_key>'.
    const { error: invokeError } = await supabaseAdmin.functions.invoke(functionName, {
      body: { 
        // El payload que espera la función de destino.
        job_id: job_id 
      },
    });

    if (invokeError) {
        // Si la invocación falla, lanzamos el error para que sea registrado en los logs.
        throw invokeError;
    }

    // Si la invocación es exitosa, devolvemos una respuesta clara.
    return new Response(JSON.stringify({
      dispatcher_status: 'success',
      dispatched_function: functionName,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error catastrófico en secure-webhook-dispatcher:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});