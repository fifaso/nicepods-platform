// supabase/functions/queue-podcast-job/index.ts

// CORRECCIÓN CLAVE: Importamos la función 'serve' de la librería estándar de Deno.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from '../_shared/cors.ts';

const QueuePayloadSchema = z.object({
  style: z.enum(['solo', 'link']),
  inputs: z.object({}).passthrough(),
});

serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) {
      throw new Error("La cabecera de autorización es requerida.");
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authorizationHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "No autorizado. El token de usuario es inválido o ha expirado." }), {
        status: 401, // Unauthorized
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = await request.json();
    const validatedPayload = QueuePayloadSchema.parse(payload);

    const { error: rpcError } = await supabaseClient.rpc('increment_jobs_and_queue', {
      p_user_id: user.id,
      p_payload: validatedPayload
    });
    if (rpcError) {
      throw new Error(`Error en la base de datos al encolar el trabajo: ${rpcError.message}`);
    }

    return new Response(JSON.stringify({ success: true, message: "El trabajo ha sido encolado exitosamente." }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(JSON.stringify({ error: "La carga útil de la solicitud es inválida.", issues: error.issues }), {
        status: 400, // Bad Request
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const errorMessage = error instanceof Error ? error.message : "Ha ocurrido un error interno en el servidor.";
    console.error(`Error en la función queue-podcast-job: ${errorMessage}`);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, // Internal Server Error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});