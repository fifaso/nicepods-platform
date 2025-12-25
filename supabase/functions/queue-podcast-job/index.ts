// supabase/functions/queue-podcast-job/index.ts
// VERSIÓN: 12.3 (Robust Data Transit)

import { serve } from "std/http/server.ts";
import { createClient } from "supabase";
import { z, ZodError } from "zod";
import { guard } from "guard";

const QueuePayloadSchema = z.object({
  agentName: z.string().optional(),
  creation_mode: z.enum(['standard', 'remix']).default('standard'),
  parent_id: z.number().optional(),
  sources: z.array(z.any()).default([]), // <--- REFUERZO DE FUENTES
  inputs: z.object({}).catchall(z.unknown())
});

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const rawBody = await request.json();

  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace("Bearer ", "").split(".")[1];
    if (!token) throw new Error("Acceso denegado.");
    const { sub: userId } = JSON.parse(atob(token));

    const validatedPayload = QueuePayloadSchema.parse(rawBody);
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Operación Atómica
    const { data: jobId, error: rpcError } = await supabaseAdmin.rpc('increment_jobs_and_queue', {
        p_user_id: userId,
        p_payload: validatedPayload
    });

    if (rpcError) throw new Error(rpcError.message);

    supabaseAdmin.functions.invoke('process-podcast-job', {
      body: { job_id: jobId, trace_id: correlationId }
    });

    return new Response(JSON.stringify({ success: true, job_id: jobId, trace_id: correlationId }), { status: 202 });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Fallo en cola";
    return new Response(JSON.stringify({ error: msg }), { status: err instanceof ZodError ? 400 : 500 });
  }
};

serve(guard(handler));