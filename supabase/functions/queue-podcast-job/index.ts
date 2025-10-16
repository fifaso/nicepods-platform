// supabase/functions/queue-podcast-job/index.ts
// ARQUITECTURA: "TOKEN DE INVOCACIÓN DE UN SOLO USO" - EMISOR

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
  if (request.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }
  try {
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) { throw new Error("La cabecera de autorización es requerida."); }
    
    // [CAMBIO ARQUITECTÓNICO #1] Se necesita un cliente de admin para poder
    // actualizar la tabla de trabajos con el token de invocación.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Se mantiene el cliente en el contexto del usuario para la autenticación y la llamada RPC.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authorizationHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { return new Response(JSON.stringify({ error: "No autorizado." }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}); }

    const payload = await request.json();
    const validatedPayload = QueuePayloadSchema.parse(payload);
    
    // 1. Encolar el trabajo (Lógica original, no se toca).
    const { data: newJobId, error: rpcError } = await supabaseClient
      .rpc('increment_jobs_and_queue', { p_user_id: user.id, p_payload: validatedPayload });
    if (rpcError) { throw new Error(rpcError.message); }

    // [CAMBIO ARQUITECTÓNICO #2] Generar y guardar el token de invocación de un solo uso.
    const invocationToken = crypto.randomUUID();
    const { error: updateError } = await supabaseAdmin
      .from('podcast_creation_jobs')
      .update({ invocation_token: invocationToken })
      .eq('id', newJobId);
    if (updateError) { throw new Error(`Fallo al guardar el token de invocación: ${updateError.message}`); }

    // 3. Invocar al trabajador con el ID y el token. Sin headers de autenticación.
    const functionUrl = `${Deno.env.get('SUPABASE_URL')!}/functions/v1/process-podcast-job`;
    fetch(functionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: newJobId, token: invocationToken }),
    }).catch(err => {
      console.error(`Error crítico al invocar 'process-podcast-job' para el trabajo ${newJobId}:`, err);
    });

    return new Response(JSON.stringify({ success: true, job_id: newJobId, message: "El trabajo ha sido encolado y el procesamiento ha comenzado." }), {
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