// supabase/functions/queue-podcast-job/index.ts
// VERSIÓN: 7.0 (Guard Integration: Sentry + Arcjet + Strict Quota)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { guard } from "../_shared/guard.ts"; // <--- INTEGRACIÓN DEL ESTÁNDAR

// Mantenemos corsHeaders para las respuestas explícitas de éxito/negocio dentro del handler
import { corsHeaders } from "../_shared/cors.ts"; 

const QueuePayloadSchema = z.object({
  purpose: z.string(),
  style: z.enum(['solo', 'link', 'archetype', 'legacy', 'qa']).optional(),
  agentName: z.string().min(1).optional(),
  final_title: z.string().optional(),
  final_script: z.string().optional(),
  sources: z.array(z.any()).optional(), 
  inputs: z.object({}).passthrough(),
});

// --- LÓGICA DE NEGOCIO (HANDLER) ---
const handler = async (request: Request): Promise<Response> => {
  // El Guard ya maneja OPTIONS (CORS Preflight), así que vamos directo al grano.

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

    // --- 2. ZONA DE SEGURIDAD: CONTROL DE CUOTAS ---
    const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // A. Obtener Configuración Global
    const { data: limits } = await supabaseAdmin
        .from('platform_limits')
        .select('*')
        .eq('key_name', 'free_tier')
        .single();
    
    const maxPodcasts = limits?.max_podcasts_per_month ?? 3;

    // B. Obtener Uso del Usuario
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

    // C. Lazy Reset
    const now = new Date();
    const lastResetDate = new Date(currentUsage.last_reset_date);
    
    if (now.getMonth() !== lastResetDate.getMonth() || now.getFullYear() !== lastResetDate.getFullYear()) {
        console.log(`[Quota] Reset mensual para usuario ${user.id}.`);
        currentUsage.podcasts_created_this_month = 0;
        currentUsage.last_reset_date = now.toISOString();
    }

    // D. Chequeo Final de Límite (Hard Stop)
    if (currentUsage.podcasts_created_this_month >= maxPodcasts) {
        // Lanzamos error específico que atraparemos abajo para devolver 403
        throw new Error(`Has alcanzado tu límite mensual de ${maxPodcasts} podcasts. Podrás crear más el próximo mes.`);
    }

    // E. Actualizar Contador (+1)
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

    console.log(`[Quota] Token consumido. Uso: ${currentUsage.podcasts_created_this_month + 1}/${maxPodcasts}`);

    // 3. PROCESAMIENTO DEL TRABAJO
    const payload = await request.json();
    const validatedPayload = QueuePayloadSchema.parse(payload);
    
    const { data: newJobId, error: rpcError } = await supabaseClient
      .rpc('increment_jobs_and_queue', {
        p_user_id: user.id,
        p_payload: validatedPayload
      });

    if (rpcError) throw new Error(`Fallo en RPC: ${rpcError.message}`);

    // 4. Invocación Asíncrona
    console.log(`Trabajo ${newJobId} creado. Invocando worker...`);
    
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
    
    // LÓGICA DE FILTRADO PARA SENTRY:
    
    // Caso 1: Error de Cuota (403)
    if (errorMessage.includes("límite mensual")) {
        return new Response(JSON.stringify({ error: errorMessage }), { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // Caso 2: Error de Validación (400)
    if (error instanceof ZodError) {
        return new Response(JSON.stringify({ error: errorMessage }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // Caso 3: Error de Auth (401/403)
    if (errorMessage.includes("Autorización") || errorMessage.includes("No autorizado")) {
         return new Response(JSON.stringify({ error: errorMessage }), { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // Caso 4: Error Crítico de Sistema (500) -> SE LO PASAMOS AL GUARD
    // Al hacer 'throw', el Guard (guard.ts) lo captura, lo manda a Sentry y devuelve el 500.
    throw error;
  }
};

// --- PUNTO DE ENTRADA PROTEGIDO ---
serve(guard(handler));