// supabase/functions/queue-podcast-job/index.ts
// Estrategia: Desacoplación Total.
// Se limita el uso de `supabase-js` a la validación de JWT.
// Todas las demás interacciones con la API de Supabase se realizan
// mediante llamadas `fetch` directas para evitar conflictos en la librería.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

const QueuePayloadSchema = z.object({
  style: z.enum(['solo', 'link']),
  agentName: z.string().min(1, { message: "El 'agentName' es requerido." }),
  inputs: z.object({}).passthrough(),
});

serve(async (request: Request) => {
  // Manejo estándar de CORS preflight.
  if (request.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }

  try {
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) { throw new Error("La cabecera de autorización es requerida."); }

    // Paso 1: Usar `supabase-js` únicamente para su propósito más crítico:
    // validar el JWT y obtener el objeto de usuario de forma segura.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authorizationHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      // Si el token no es válido, `user` será null. Devolvemos 401.
      return new Response(JSON.stringify({ error: "No autorizado." }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    const payload = await request.json();
    const validatedPayload = QueuePayloadSchema.parse(payload);

    // Paso 2: Ejecutar la función de la base de datos (RPC) manualmente.
    // Esto evita usar `supabaseClient.rpc()` y previene posibles conflictos de estado.
    const rpcUrl = `${Deno.env.get('SUPABASE_URL')!}/rest/v1/rpc/increment_jobs_and_queue`;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const rpcResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // La `apikey` es necesaria para pasar la API Gateway de Supabase.
        'apikey': anonKey,
        // El `Authorization` header propaga el token del usuario para que PostgREST
        // ejecute la función con los permisos de dicho usuario (respetando RLS).
        'Authorization': authorizationHeader
      },
      body: JSON.stringify({
        p_user_id: user.id,
        p_payload: validatedPayload
      })
    });

    // Manejo de errores robusto para la llamada RPC.
    if (!rpcResponse.ok) {
      const errorBody = await rpcResponse.text();
      console.error("Error en la llamada RPC a la base de datos:", errorBody);
      throw new Error(`Fallo al encolar el trabajo en la base de datos. Status: ${rpcResponse.status}`);
    }

    // El resultado de una función RPC que devuelve un solo valor es el valor mismo.
    const newJobId = await rpcResponse.json();

    // Paso 3: Invocar la siguiente función de forma asíncrona ("fire and forget").
    // Usamos `fetch` con la `service_role_key` para obtener privilegios de administrador.
    const functionUrl = `${Deno.env.get('SUPABASE_URL')!}/functions/v1/process-podcast-job`;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`
      },
      body: JSON.stringify({ job_id: newJobId }),
    }).catch(err => {
      // Si esta llamada falla, solo lo registramos. No afectará la respuesta al usuario.
      console.error(`Error crítico al invocar 'process-podcast-job' para el trabajo ${newJobId}:`, err);
    });

    // Si todo ha ido bien, devolvemos una respuesta exitosa al usuario inmediatamente.
    return new Response(JSON.stringify({ 
      success: true, 
      job_id: newJobId,
      message: "El trabajo ha sido encolado y el procesamiento ha comenzado."
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // Capturador de errores global para cualquier fallo inesperado.
    console.error("Error detallado en la función queue-podcast-job:", error);

    const errorMessage = error instanceof Error ? error.message : "Error interno desconocido.";
    const status = error instanceof ZodError ? 400 : 500;
    
    return new Response(JSON.stringify({ error: errorMessage }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
});