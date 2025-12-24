// supabase/functions/queue-podcast-job/index.ts
// VERSIÓN: 12.1 (Atomic DB Integration - Clean & No Unused Vars)

import { serve } from "std/http/server.ts";
import { createClient } from "supabase";
import { z, ZodError } from "zod";
import { guard } from "guard";

/**
 * Esquema de validación para asegurar integridad de datos de entrada
 */
const QueuePayloadSchema = z.object({
  agentName: z.string().optional(),
  creation_mode: z.enum(['standard', 'remix']).default('standard'),
  parent_id: z.number().optional(),
  user_reaction: z.string().optional(),
  quote_context: z.string().optional(),
  inputs: z.object({}).catchall(z.unknown())
});

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  
  // ESTRATEGIA: Consumir el body inmediatamente para liberar el stream en Deno v2
  const rawBody = await request.json();

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? "";
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? "";
  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    // 1. OBTENER IDENTIDAD (Desde el Header inyectado por el Guard)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error("Acceso denegado: Sesión no encontrada.");

    // Decodificación rápida del JWT para identificar al usuario
    const token = authHeader.replace("Bearer ", "").split(".")[1];
    const { sub: userId } = JSON.parse(atob(token));

    console.log(`[Queue][${correlationId}] Operación atómica para usuario: ${userId}`);

    // 2. VALIDACIÓN DE CARGA
    const validatedPayload = QueuePayloadSchema.parse(rawBody);
    
    // Fallback de agente para hilos
    if (validatedPayload.creation_mode === 'remix' && !validatedPayload.agentName) {
        validatedPayload.agentName = 'reply-synthesizer-v1';
    }

    // 3. OPERACIÓN ATÓMICA (Validar cuota e insertar en un solo viaje SQL)
    const { data: jobId, error: rpcError } = await supabaseAdmin.rpc('increment_jobs_and_queue', {
        p_user_id: userId,
        p_payload: validatedPayload
    });

    if (rpcError) {
      const isQuotaError = rpcError.message.includes('Límite mensual');
      console.warn(`[Queue][${correlationId}] Rechazado por DB: ${rpcError.message}`);
      return new Response(JSON.stringify({ 
        error: rpcError.message, 
        trace_id: correlationId 
      }), { 
        status: isQuotaError ? 403 : 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. DISPARO DE WORKERS (Fan-out)
    console.log(`[Queue][${correlationId}] Job ${jobId} aceptado.`);
    
    supabaseAdmin.functions.invoke('process-podcast-job', {
      body: { job_id: jobId, trace_id: correlationId }
    });

    // 5. REGISTRO DE ACTIVIDAD (Upsert de uso para inicialización si no existe)
    await supabaseAdmin.from('user_usage').upsert({
        user_id: userId,
        updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    return new Response(JSON.stringify({ 
      success: true, 
      job_id: jobId, 
      trace_id: correlationId 
    }), { status: 202, headers: { 'Content-Type': 'application/json' } });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido en el motor de cola";
    const status = err instanceof ZodError ? 400 : 500;
    
    console.error(`🔥 [Queue][${correlationId}] Fallo Crítico:`, msg);
    return new Response(JSON.stringify({ error: msg, trace_id: correlationId }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

serve(guard(handler));