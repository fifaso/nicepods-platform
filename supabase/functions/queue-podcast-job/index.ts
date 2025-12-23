// supabase/functions/queue-podcast-job/index.ts
// VERSIÓN: 11.0 (Enterprise Grade - Strict Typing & Quota Intelligence)

import { serve } from "std/http/server.ts";
import { createClient, SupabaseClient } from "supabase";
import { z, ZodError } from "zod";
import { guard } from "guard";
import { corsHeaders } from "cors";

/**
 * Interface estricta para los inputs dinámicos. 
 * Reemplaza el uso de 'any' para satisfacer al linter.
 */
interface JobInputs {
  topic?: string;
  motivation?: string;
  duration?: string;
  depth?: string;
  voiceGender?: string;
  voiceStyle?: string;
  [key: string]: string | number | boolean | undefined;
}

// Esquema de validación corregido
const QueuePayloadSchema = z.object({
  agentName: z.string().optional(),
  creation_mode: z.enum(['standard', 'remix']).default('standard'),
  parent_id: z.number().optional(),
  user_reaction: z.string().optional(),
  quote_context: z.string().optional(),
  // Usamos .catchall(z.unknown()) en lugar de .record().passthrough()
  inputs: z.object({}).catchall(z.unknown())
});

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? "";
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? "";

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error("Acceso denegado: Token no proporcionado.");

    // Cliente para verificar al usuario
    const supabaseClient: SupabaseClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? "", {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error("Sesión de usuario inválida.");

    // Cliente administrador para lógica de negocio
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

    // 1. CONTROL DE CUOTAS (Capa de Negocio)
    console.log(`[Queue][\${correlationId}] Analizando cuota para \${user.id}`);

    const { data: usageData, error: usageErr } = await supabaseAdmin
        .from('user_usage')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (usageErr && usageErr.code !== 'PGRST116') { // Ignoramos si no existe registro
        throw new Error("Error al consultar el sistema de cuotas.");
    }

    // Inicializamos objeto de uso con 'const' para satisfacer el linter
    const currentUsage = usageData ?? { 
        user_id: user.id, 
        podcasts_created_this_month: 0, 
        last_reset_date: new Date().toISOString() 
    };

    const MAX_FREE_LIMIT = 3;
    if (currentUsage.podcasts_created_this_month >= MAX_FREE_LIMIT) {
        return new Response(JSON.stringify({ 
            error: "Has agotado tus creaciones gratuitas mensuales.",
            trace_id: correlationId
        }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 2. PROCESAMIENTO DE CARGA (Validación Zod)
    const body = await request.json();
    const validatedPayload = QueuePayloadSchema.parse(body);
    
    // Inyectamos el agente de respuesta si es un remix
    if (validatedPayload.creation_mode === 'remix' && !validatedPayload.agentName) {
        validatedPayload.agentName = 'reply-synthesizer-v1';
    }

    // 3. PERSISTENCIA ATÓMICA
    const { data: jobId, error: rpcError } = await supabaseAdmin.rpc('increment_jobs_and_queue', {
        p_user_id: user.id,
        p_payload: validatedPayload
    });

    if (rpcError) throw new Error(`Fallo al encolar el trabajo: \${rpcError.message}`);

    // 4. DISPARO ASÍNCRONO (Fan-out)
    console.log(`[Queue][\${correlationId}] Job \${jobId} aceptado.`);
    
    // Invocación no bloqueante del orquestador
    supabaseAdmin.functions.invoke('process-podcast-job', {
      body: { job_id: jobId, trace_id: correlationId }
    });

    // 5. ACTUALIZACIÓN DE CONTADOR (Consumo de token)
    await supabaseAdmin.from('user_usage').upsert({
        user_id: user.id,
        podcasts_created_this_month: currentUsage.podcasts_created_this_month + 1,
        last_reset_date: currentUsage.last_reset_date,
        updated_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({
      success: true,
      job_id: jobId,
      trace_id: correlationId
    }), { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error fatal en la cola";
    const status = err instanceof ZodError ? 400 : 500;
    
    console.error(`🔥 [Queue][\${correlationId}] Error:`, msg);
    return new Response(JSON.stringify({ error: msg, trace_id: correlationId }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(guard(handler));