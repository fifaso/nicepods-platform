// supabase/functions/queue-podcast-job/index.ts
// VERSIÓN DE PRODUCCIÓN FINAL (ARQUITECTURA DE TRIGGER TRANSACCIONAL)

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
  // Manejo estándar de la petición pre-vuelo de CORS.
  if (request.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }

  try {
    // 1. AUTENTICACIÓN: Validar el token JWT del usuario.
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) { throw new Error("La cabecera de autorización es requerida."); }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authorizationHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "No autorizado." }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    // 2. VALIDACIÓN: Asegurar que el payload de la petición es correcto.
    const payload = await request.json();
    const validatedPayload = QueuePayloadSchema.parse(payload);

    // 3. LÓGICA DE NEGOCIO: Llamar a la función de la base de datos para encolar el trabajo.
    // Esta función RPC contiene la lógica de límites de plan y realiza el INSERT.
    const { data: newJobId, error: rpcError } = await supabaseClient
      .rpc('increment_jobs_and_queue', {
        p_user_id: user.id,
        p_payload: validatedPayload
      });

    // Si la función RPC devuelve un error (ej. límite alcanzado), lo lanzamos.
    if (rpcError) { throw new Error(rpcError.message); }

    // 4. RESPUESTA: Devolver éxito al usuario inmediatamente.
    // El trigger `on_new_job_created` en la base de datos se encargará de invocar
    // a `process-podcast-job` de forma asíncrona. Esta función ya cumplió su trabajo.
    return new Response(JSON.stringify({ 
      success: true, 
      job_id: newJobId,
      message: "El trabajo ha sido encolado y será procesado en breve."
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // 5. MANEJO DE ERRORES: Capturar cualquier fallo y devolver una respuesta de error adecuada.
    console.error("Error detallado en la función queue-podcast-job:", error);

    const errorMessage = error instanceof Error ? error.message : "Error interno desconocido.";
    // Si el error es de Zod, es un problema del cliente (400). Si no, es un problema del servidor (500).
    const status = error instanceof ZodError ? 400 : 500;
    
    return new Response(JSON.stringify({ error: errorMessage }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
});