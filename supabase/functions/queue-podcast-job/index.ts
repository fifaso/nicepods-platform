// supabase/functions/queue-podcast-job/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, PostgrestError } from 'https://esm.sh/@supabase/supabase-js@2';
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from '../_shared/cors.ts';

const QueuePayloadSchema = z.object({
  style: z.enum(['solo', 'link']),
  agentName: z.string().min(1, { message: "El 'agentName' es requerido." }),
  inputs: z.object({}).passthrough(),
});

serve(async (request: Request) => {
  if (request.method === 'OPTIONS') { 
    return new Response('ok', { headers: corsHeaders }); 
  }

  try {
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) {
      return new Response(JSON.stringify({ success: false, error: { code: 'UNAUTHORIZED', message: 'Cabecera de autorización requerida.' } }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authorizationHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: { code: 'UNAUTHORIZED', message: 'Usuario no autenticado.' } }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    const payload = await request.json();
    const validatedPayload = QueuePayloadSchema.parse(payload);

    const { data: newJobId, error: rpcError } = await supabaseClient
      .rpc('increment_jobs_and_queue', {
        p_user_id: user.id,
        p_payload: validatedPayload
      });

    // ================== INTERVENCIÓN QUIRÚRGICA: MANEJO DE ERRORES DE NEGOCIO ==================
    //
    // Esta es la lógica definitiva. Si hay un rpcError, lo inspeccionamos.
    // Si es nuestro error de límite, devolvemos un status 200 OK con un cuerpo de error.
    // Para cualquier otro error de BD, también devolvemos un 200 OK con un cuerpo de error.
    // Esto asegura que el frontend SIEMPRE reciba los detalles en el objeto 'data'.
    //
    if (rpcError) {
      console.error("Error desde la RPC de la base de datos:", rpcError);
      
      if (rpcError instanceof PostgrestError && rpcError.code === 'P0001') {
        return new Response(JSON.stringify({
          success: false,
          error: {
            code: 'LIMIT_REACHED',
            message: 'Límite de creación mensual alcanzado.'
          }
        }), {
          status: 200, // Status 200 para asegurar que la respuesta llegue al objeto 'data' del cliente.
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Para cualquier otro error de la base de datos
      return new Response(JSON.stringify({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: rpcError.message
        }
      }), {
        status: 200, // Status 200 para asegurar la entrega en 'data'.
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // =========================================================================================

    // Si todo fue bien, devolvemos el éxito.
    return new Response(JSON.stringify({ 
      success: true, 
      job_id: newJobId
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // Este catch ahora solo maneja errores de infraestructura (parsing de JSON, Zod, etc.)
    // que ocurren ANTES de la llamada a la base de datos.
    console.error("Error de infraestructura en queue-podcast-job:", error);
    
    const status = error instanceof ZodError ? 400 : 500;
    const message = error instanceof Error ? error.message : "Error interno del servidor.";
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: {
        code: status === 400 ? 'INVALID_PAYLOAD' : 'INTERNAL_SERVER_ERROR',
        message: message
      }
    }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
});