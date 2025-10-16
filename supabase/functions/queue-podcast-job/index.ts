// supabase/functions/queue-podcast-job/index.ts
// ARQUITECTURA FINAL: INVOCACIÓN NATIVA (`invoke`)

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
    
    // Se crea un cliente de admin, que es necesario para invocar otra función con privilegios de servicio.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authorizationHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { return new Response(JSON.stringify({ error: "No autorizado." }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}); }

    const payload = await request.json();
    const validatedPayload = QueuePayloadSchema.parse(payload);
    
    const { data: newJobId, error: rpcError } = await supabaseClient
      .rpc('increment_jobs_and_queue', { p_user_id: user.id, p_payload: validatedPayload });
    if (rpcError) { throw new Error(rpcError.message); }

    // ================== INTERVENCIÓN QUIRÚRGICA FINAL ==================
    // Se reemplaza `fetch` por el método oficial y robusto `invoke`.
    // El cliente de admin se encarga de añadir los headers de autenticación correctos.
    const { error: invokeError } = await supabaseAdmin.functions.invoke('process-podcast-job', {
      body: { job_id: newJobId },
    });

    if (invokeError) {
      // Si la invocación falla, lo registramos, pero no rompemos la respuesta al usuario.
      console.error(`Error invocando 'process-podcast-job' para el trabajo ${newJobId}:`, invokeError);
    }
    // ================================================================

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