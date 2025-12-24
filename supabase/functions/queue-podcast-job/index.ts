// supabase/functions/queue-podcast-job/index.ts
// VERSIÓN: 11.2 (Clean & Compliant - No Unused Vars)

import { serve } from "std/http/server.ts";
import { createClient, SupabaseClient } from "supabase";
import { z, ZodError } from "zod";
import { guard } from "guard";
// [ELIMINADO]: El import de corsHeaders ya no es necesario aquí.

const QueuePayloadSchema = z.object({
  agentName: z.string().optional(),
  creation_mode: z.enum(['standard', 'remix']).default('standard'),
  parent_id: z.number().optional(),
  user_reaction: z.string().optional(),
  quote_context: z.string().optional(),
  inputs: z.object({}).catchall(z.unknown())
});

const handler = async (request: Request): Promise<Response> => {
  // Intentamos recuperar el ID de seguimiento que el Guard inyecta o generamos uno
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? "";
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? "";

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error("Missing Authorization Header");

    const supabaseClient: SupabaseClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? "", {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error("Invalid User Session");

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

    // 1. ZONA DE CUOTAS
    console.log(`[Queue][${correlationId}] Analizando cuota para ${user.id}`);

    const { data: usageData } = await supabaseAdmin
        .from('user_usage')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

    const currentUsage = usageData ?? { 
        user_id: user.id, 
        podcasts_created_this_month: 0, 
        last_reset_date: new Date().toISOString() 
    };

    const MAX_FREE_LIMIT = 3;
    if (currentUsage.podcasts_created_this_month >= MAX_FREE_LIMIT) {
        return new Response(JSON.stringify({ 
            error: "Has alcanzado el límite gratuito mensual.",
            trace_id: correlationId
        }), { 
            status: 403, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }

    // 2. PROCESAMIENTO
    const body = await request.json();
    const validatedPayload = QueuePayloadSchema.parse(body);
    
    if (validatedPayload.creation_mode === 'remix' && !validatedPayload.agentName) {
        validatedPayload.agentName = 'reply-synthesizer-v1';
    }

    const { data: jobId, error: rpcError } = await supabaseAdmin.rpc('increment_jobs_and_queue', {
        p_user_id: user.id,
        p_payload: validatedPayload
    });

    if (rpcError) throw new Error(`RPC Error: ${rpcError.message}`);

    // Invocación asíncrona (Fire & Forget)
    supabaseAdmin.functions.invoke('process-podcast-job', {
      body: { job_id: jobId, trace_id: correlationId }
    });

    // Actualizar uso de forma optimista
    await supabaseAdmin.from('user_usage').upsert({
        user_id: user.id,
        podcasts_created_this_month: currentUsage.podcasts_created_this_month + 1,
        last_reset_date: currentUsage.last_reset_date,
        updated_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({ success: true, job_id: jobId, trace_id: correlationId }), { 
      status: 202,
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Queue Error";
    console.error(`🔥 [Queue][${correlationId}] Error:`, msg);
    
    return new Response(JSON.stringify({ error: msg, trace_id: correlationId }), {
      status: err instanceof ZodError ? 400 : 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

serve(guard(handler));