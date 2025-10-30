// supabase/functions/queue-podcast-job/index.ts
// VERSIÓN FINAL - SIMPLIFICADA Y DESACOPLADA

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Se mantiene el schema de validación para proteger la entrada
const QueuePayloadSchema = z.object({
  style: z.enum(['solo', 'link', 'archetype']),
  agentName: z.string().min(1),
  inputs: z.object({}).passthrough(),
});

serve(async (request: Request) => {
  if (request.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }
  try {
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) { throw new Error("Autorización requerida."); }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authorizationHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { return new Response(JSON.stringify({ error: "No autorizado." }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}); }

    const payload = await request.json();
    const validatedPayload = QueuePayloadSchema.parse(payload);
    
    // Su única responsabilidad es llamar al RPC que crea el trabajo.
    // El trigger de la base de datos se encargará de iniciar el procesamiento.
    const { data: newJobId, error: rpcError } = await supabaseClient
      .rpc('increment_jobs_and_queue', {
        p_user_id: user.id,
        p_payload: validatedPayload
      });

    if (rpcError) { throw new Error(rpcError.message); }

    return new Response(JSON.stringify({
      success: true,
      job_id: newJobId,
      message: "El trabajo ha sido encolado. El procesamiento comenzará en segundo plano."
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error interno desconocido.";
    const status = error instanceof ZodError ? 400 : 500;
    return new Response(JSON.stringify({ error: errorMessage }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
});