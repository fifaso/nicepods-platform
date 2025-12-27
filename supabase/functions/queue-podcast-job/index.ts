// supabase/functions/queue-podcast-job/index.ts
// VERSIÓN: 13.0 (Atomic Transit - Secure Source Chain Validation)

import { serve } from "std/http/server.ts";
import { createClient } from "supabase";
import { z, ZodError } from "zod";
import { guard } from "guard";

const QueuePayloadSchema = z.object({
  agentName: z.string().min(1),
  creation_mode: z.enum(['standard', 'remix']).default('standard'),
  parent_id: z.number().optional().nullable(),
  // CONTRATO DE FUENTES: Validamos que sea un array de objetos con URL
  sources: z.array(z.object({
    title: z.string(),
    url: z.string().url(),
    snippet: z.string().optional()
  })).default([]),
  inputs: z.object({}).catchall(z.unknown())
});

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const rawBody = await request.json();

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? "", 
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""
  );

  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace("Bearer ", "").split(".")[1];
    if (!token) throw new Error("Fallo de autenticación.");
    const { sub: userId } = JSON.parse(atob(token));

    // VALIDACIÓN DE CONTRATO
    const validatedPayload = QueuePayloadSchema.parse(rawBody);

    console.log(`[Queue][${correlationId}] Encolando con ${validatedPayload.sources.length} fuentes.`);

    // OPERACIÓN ATÓMICA SQL
    const { data: jobId, error: rpcError } = await supabaseAdmin.rpc('increment_jobs_and_queue', {
        p_user_id: userId,
        p_payload: validatedPayload
    });

    if (rpcError) throw new Error(rpcError.message);

    // DISPARO ASÍNCRONO DEL ORQUESTADOR
    supabaseAdmin.functions.invoke('process-podcast-job', {
      body: { job_id: jobId, trace_id: correlationId }
    });

    return new Response(JSON.stringify({ success: true, job_id: jobId, trace_id: correlationId }), { 
        status: 202,
        headers: { "Content-Type": "application/json" } 
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error en motor de cola";
    console.error(`🔥 [Queue][${correlationId}] Error:`, msg);
    return new Response(JSON.stringify({ error: msg, trace_id: correlationId }), { 
      status: err instanceof ZodError ? 400 : 500 
    });
  }
};

serve(guard(handler));