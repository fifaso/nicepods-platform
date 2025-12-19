// supabase/functions/queue-podcast-job/index.ts
// VERSIÓN: 9.0 (Support for Remix/Audio Threads + Dynamic Quotas)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { guard } from "../_shared/guard.ts"; 
import { corsHeaders } from "../_shared/cors.ts"; 

// [MODIFICACIÓN ESTRATÉGICA]: Esquema flexible para soportar tanto creación Estándar como Remix
const QueuePayloadSchema = z.object({
  // Campos Estándar (ahora opcionales porque Remix no los usa todos)
  purpose: z.string().optional(),
  style: z.enum(['solo', 'link', 'archetype', 'legacy', 'qa']).optional(),
  
  // Campos Comunes
  agentName: z.string().min(1).optional(),
  final_title: z.string().optional(),
  final_script: z.string().optional(),
  sources: z.array(z.any()).optional(), 
  inputs: z.object({}).passthrough(),

  // [NUEVO] Campos para Remix / Hilos
  creation_mode: z.enum(['standard', 'remix']).default('standard'),
  parent_id: z.number().optional(),     // ID del podcast al que respondemos
  root_id: z.number().optional(),       // ID del hilo original (opcional, el trigger lo puede deducir)
  user_reaction: z.string().optional(), // El texto/transcripción de la respuesta del usuario
  quote_context: z.string().optional(), // El fragmento de texto original citado
});

// --- LÓGICA DE NEGOCIO (HANDLER) ---
const handler = async (request: Request): Promise<Response> => {

  try {
    // 1. AUTENTICACIÓN
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) throw new Error("Autorización requerida.");

    const supabaseClient: SupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authorizationHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("No autorizado.");

    // --- 2. ZONA DE SEGURIDAD: CÁLCULO DE CUOTA DINÁMICA ---
    const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // PASO A: Determinar el Límite del Usuario
    let maxPodcasts = 3; 

    const { data: subscription } = await supabaseAdmin
        .from('subscriptions')
        .select(`status, plans ( monthly_creation_limit )`)
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .single();

    if (subscription && subscription.plans) {
        // @ts-ignore: Supabase join typing
        maxPodcasts = subscription.plans.monthly_creation_limit;
    } else {
        const { data: limits } = await supabaseAdmin
            .from('platform_limits')
            .select('max_podcasts_per_month')
            .eq('key_name', 'free_tier')
            .single();
        maxPodcasts = limits?.max_podcasts_per_month ?? 3;
    }

    // PASO B: Obtener Uso Actual
    const { data: usageData } = await supabaseAdmin
        .from('user_usage')
        .select('*')
        .eq('user_id', user.id)
        .single();

    let currentUsage = usageData || { 
        user_id: user.id, 
        podcasts_created_this_month: 0, 
        last_reset_date: new Date().toISOString() 
    };

    // PASO C: Lazy Reset
    const now = new Date();
    const lastResetDate = new Date(currentUsage.last_reset_date);
    
    if (now.getMonth() !== lastResetDate.getMonth() || now.getFullYear() !== lastResetDate.getFullYear()) {
        console.log(`[Quota] Reset mensual automático para usuario ${user.id}.`);
        currentUsage.podcasts_created_this_month = 0;
        currentUsage.last_reset_date = now.toISOString();
    }

    // PASO D: Validación Final (Hard Stop)
    // Nota: Los Remixes TAMBIÉN consumen cuota (decisión de negocio)
    if (currentUsage.podcasts_created_this_month >= maxPodcasts) {
        throw new Error(`Has alcanzado tu límite mensual de ${maxPodcasts} creaciones.`);
    }

    // PASO E: Consumir Token
    const { error: updateError } = await supabaseAdmin
        .from('user_usage')
        .upsert({
            user_id: user.id,
            podcasts_created_this_month: currentUsage.podcasts_created_this_month + 1,
            last_reset_date: currentUsage.last_reset_date,
            updated_at: new Date().toISOString()
        });

    if (updateError) {
        console.error("Error actualizando cuota:", updateError);
        throw new Error("Error interno gestionando tu cuota.");
    }

    // --- FIN ZONA DE SEGURIDAD ---

    // 3. PROCESAMIENTO DEL TRABAJO
    const payload = await request.json();
    const validatedPayload = QueuePayloadSchema.parse(payload);
    
    // [LÓGICA DE NEGOCIO REMIX]
    if (validatedPayload.creation_mode === 'remix') {
        // Validaciones específicas para Remix
        if (!validatedPayload.parent_id) throw new Error("Falta el ID del podcast original para el Remix.");
        if (!validatedPayload.user_reaction) throw new Error("Falta la reacción del usuario.");
        
        // Asignación automática del Agente de Debate si no viene definido
        if (!validatedPayload.agentName) {
            validatedPayload.agentName = 'reply-synthesizer-v1';
        }
        
        console.log(`[Queue] Iniciando REMIX para podcast padre ${validatedPayload.parent_id}`);
    }

    const { data: newJobId, error: rpcError } = await supabaseClient
      .rpc('increment_jobs_and_queue', {
        p_user_id: user.id,
        p_payload: validatedPayload
      });

    if (rpcError) throw new Error(`Fallo en RPC: ${rpcError.message}`);

    // 4. Invocación Asíncrona
    console.log(`Trabajo ${newJobId} creado (${validatedPayload.creation_mode}). Invocando worker...`);
    
    supabaseAdmin.functions.invoke('process-podcast-job', {
      body: { job_id: newJobId }
    }).then(({ error: invokeError }) => {
      if (invokeError) console.error(`Worker invoke fail job ${newJobId}:`, invokeError);
    });

    return new Response(JSON.stringify({
      success: true,
      job_id: newJobId,
      message: "Trabajo encolado exitosamente."
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido.";
    console.error("Error en queue-podcast-job:", error);
    
    if (errorMessage.includes("límite mensual")) {
        return new Response(JSON.stringify({ error: errorMessage }), { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    if (error instanceof ZodError) {
        return new Response(JSON.stringify({ error: errorMessage }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    if (errorMessage.includes("Autorización") || errorMessage.includes("No autorizado")) {
         return new Response(JSON.stringify({ error: errorMessage }), { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    throw error;
  }
};

serve(guard(handler));