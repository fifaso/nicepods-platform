// supabase/functions/queue-podcast-job/index.ts
// VERSIÓN: 14.0 (Atomic Transit - Multi-Mode & Situational Support)

import { serve } from "std/http/server.ts";
import { createClient } from "supabase";
import { z, ZodError } from "zod";
import { guard, corsHeaders } from "guard"; // [SISTEMA]: Uso de alias legal y re-export de headers

/**
 * SCHEMA DE ENTRADA: QueuePayloadSchema
 * Sincronizado 1:1 con PodcastCreationSchema v5.0 del Frontend.
 */
const QueuePayloadSchema = z.object({
  agentName: z.string().min(1, "agentName es requerido"),
  purpose: z.enum(['learn', 'inspire', 'explore', 'reflect', 'answer', 'freestyle', 'local_soul']),
  creation_mode: z.enum(['standard', 'remix', 'situational']).default('standard'), // [FIJO]: Añadido situational
  parent_id: z.number().optional().nullable(),

  // CUSTODIA DE FUENTES: Validamos integridad bibliográfica
  sources: z.array(z.object({
    title: z.string(),
    url: z.string().url("URL de fuente inválida"),
    snippet: z.string().optional()
  })).default([]),

  // MATERIA PRIMA (ENCAPSULADA):
  // No validamos campos internos aquí para mantener la función agnóstica al propósito,
  // pero obligamos a que sea un objeto no vacío.
  inputs: z.record(z.unknown()).refine((obj) => Object.keys(obj).length > 0, {
    message: "El objeto 'inputs' no puede estar vacío"
  })
});

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

  // 1. Obtención Segura del Cliente Admin
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? "",
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""
  );

  try {
    // 2. Extracción de Identidad del Token JWT
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error("Cabecera de autorización ausente.");

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) throw new Error("Sesión inválida o expirada.");

    // 3. VALIDACIÓN DE CONTRATO (QUIRÚRGICA)
    const rawBody = await request.json();
    const validatedPayload = QueuePayloadSchema.parse(rawBody);

    console.log(`[Queue][${correlationId}] Usuario ${user.id} encolando modo ${validatedPayload.creation_mode}`);

    // 4. OPERACIÓN ATÓMICA EN BASE DE DATOS
    // La función RPC 'increment_jobs_and_queue' debe:
    // a. Validar cuota del usuario.
    // b. Insertar en la tabla 'podcast_creation_jobs'.
    const { data: jobId, error: rpcError } = await supabaseAdmin.rpc('increment_jobs_and_queue', {
      p_user_id: user.id,
      p_payload: validatedPayload // Incluye el nuevo objeto 'inputs' estructurado
    });

    if (rpcError) throw new Error(`Error de cuota o base de datos: ${rpcError.message}`);

    // 5. DISPARO DEL ORQUESTADOR (Fire & Forget)
    // Invocamos a 'process-podcast-job' pasando el ID del registro y el trace ID para logs.
    supabaseAdmin.functions.invoke('process-podcast-job', {
      body: {
        job_id: jobId,
        trace_id: correlationId
      }
    });

    // 6. RESPUESTA DE ACEPTACIÓN (HTTP 202 Accepted)
    return new Response(
      JSON.stringify({
        success: true,
        job_id: jobId,
        trace_id: correlationId,
        message: "Trabajo encolado exitosamente"
      }),
      {
        status: 202,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (err: unknown) {
    let errorMessage = "Error interno en el motor de cola";
    let statusCode = 500;

    if (err instanceof ZodError) {
      errorMessage = `Error de contrato: ${err.errors.map(e => `${e.path}: ${e.message}`).join(", ")}`;
      statusCode = 400;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    console.error(`🔥 [Queue][${correlationId}] Error:`, errorMessage);

    return new Response(
      JSON.stringify({
        error: errorMessage,
        trace_id: correlationId
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
};

// [SISTEMA]: El 'guard' ya maneja los preflights y la seguridad Arcjet inicial.
serve(guard(handler));