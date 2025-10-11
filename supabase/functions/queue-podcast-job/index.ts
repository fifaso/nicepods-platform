// supabase/functions/queue-podcast-job/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, PostgrestError } from 'https://esm.sh/@supabase/supabase-js@2';
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from '@shared/cors.ts';

const QueuePayloadSchema = z.object({
  style: z.enum(['solo', 'link']),
  agentName: z.string().min(1, { message: "El 'agentName' es requerido." }),
  inputs: z.object({}).passthrough(),
});

serve(async (request: Request) => {
  if (request.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }

  try {
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

    const payload = await request.json();
    const validatedPayload = QueuePayloadSchema.parse(payload);

    const { data: newJobId, error: rpcError } = await supabaseClient
      .rpc('increment_jobs_and_queue', {
        p_user_id: user.id,
        p_payload: validatedPayload
      });

    if (rpcError) { throw new Error(rpcError.message); }

    // ================== INTERVENCIÓN QUIRÚRGICA: INVOCACIÓN DIRECTA ==================
    //
    // Volvemos a la arquitectura probada y fiable.
    // 1. Se crea un cliente de Supabase con permisos de administrador.
    // 2. Se invoca la función 'process-podcast-job' de forma asíncrona.
    // El '.catch()' asegura que si la invocación falla, no rompa esta función.
    //
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Este secreto DEBE estar en Settings > Functions
    );

    supabaseAdmin.functions.invoke('process-podcast-job', {
      body: { job_id: newJobId },
    }).catch(console.error);
    // ==================================================================================

    return new Response(JSON.stringify({ 
      success: true, 
      job_id: newJobId,
      message: "El trabajo ha sido encolado y el procesamiento ha comenzado." // El mensaje vuelve a ser inmediato.
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error detallado en la función queue-podcast-job:", error);

    const errorMessage = error instanceof Error ? error.message : "Error interno desconocido.";
    const status = error instanceof ZodError ? 400 : 500;
    
    return new Response(JSON.stringify({ error: errorMessage }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
});