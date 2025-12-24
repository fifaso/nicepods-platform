// supabase/functions/queue-podcast-job/index.ts
// VERSIÓN: 11.3 (Deno v2 Standard - Immediate Body Consumption)

import { serve } from "std/http/server.ts";
import { createClient, SupabaseClient } from "supabase";
import { z, ZodError } from "zod";
import { guard } from "guard";

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
  
  // ESTRATEGIA: Consumir el body inmediatamente para evitar bloqueos de stream en Deno v2
  const rawBody = await request.json();
  console.log(`[Queue][${correlationId}] 1. Body recibido.`);

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? "";
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? "";

  try {
    // 1. VALIDACIÓN DE SESIÓN
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error("No Auth Header");

    const supabaseClient: SupabaseClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? "", {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error("Invalid Session");

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

    // 2. CONTROL DE CUOTAS
    console.log(`[Queue][${correlationId}] 2. Analizando cuota para ${user.id}`);

    const { data: usageData, error: usageErr } = await supabaseAdmin
        .from('user_usage')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

    if (usageErr) console.error("Error consultando cuota:", usageErr);

    const currentUsage = usageData ?? { 
        podcasts_created_this_month: 0, 
        last_reset_date: new Date().toISOString() 
    };

    const MAX_FREE_LIMIT = 3;
    if (currentUsage.podcasts_created_this_month >= MAX_FREE_LIMIT) {
        return new Response(JSON.stringify({ error: "Límite excedido", trace_id: correlationId }), { status: 403 });
    }

    // 3. VALIDACIÓN DE PAYLOAD
    const validatedPayload = QueuePayloadSchema.parse(rawBody);
    if (validatedPayload.creation_mode === 'remix' && !validatedPayload.agentName) {
        validatedPayload.agentName = 'reply-synthesizer-v1';
    }

    // 4. ENCOLADO
    console.log(`[Queue][${correlationId}] 3. Ejecutando RPC...`);
    const { data: jobId, error: rpcError } = await supabaseAdmin.rpc('increment_jobs_and_queue', {
        p_user_id: user.id,
        p_payload: validatedPayload
    });

    if (rpcError) throw new Error(`RPC Error: ${rpcError.message}`);

    // 5. DISPARO ASÍNCRONO
    console.log(`[Queue][${correlationId}] 4. Job ${jobId} creado. Invocando orquestador...`);
    supabaseAdmin.functions.invoke('process-podcast-job', {
      body: { job_id: jobId, trace_id: correlationId }
    });

    // 6. ACTUALIZAR USO
    await supabaseAdmin.from('user_usage').upsert({
        user_id: user.id,
        podcasts_created_this_month: (currentUsage.podcasts_created_this_month || 0) + 1,
        last_reset_date: currentUsage.last_reset_date,
        updated_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({ success: true, job_id: jobId, trace_id: correlationId }), { status: 202 });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Queue Error";
    console.error(`🔥 [Queue][${correlationId}] Fallo:`, msg);
    return new Response(JSON.stringify({ error: msg, trace_id: correlationId }), { 
      status: err instanceof ZodError ? 400 : 500 
    });
  }
};

serve(guard(handler));