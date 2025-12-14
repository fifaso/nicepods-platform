// supabase/functions/queue-podcast-job/index.ts
// VERSIÓN: 6.0 (Strict Quota Enforcement & Monthly Reset)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Esquema de Validación (Permisivo para fuentes y edición)
const QueuePayloadSchema = z.object({
  purpose: z.string(),
  style: z.enum(['solo', 'link', 'archetype', 'legacy', 'qa']).optional(),
  agentName: z.string().min(1).optional(),
  final_title: z.string().optional(),
  final_script: z.string().optional(),
  sources: z.array(z.any()).optional(), 
  inputs: z.object({}).passthrough(),
});

serve(async (request: Request) => {
  // Manejo de CORS (Preflight)
  if (request.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }

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

    // --- 2. ZONA DE SEGURIDAD: CONTROL DE CUOTAS (NUEVO) ---
    // Usamos el cliente Admin para leer límites y escribir uso (saltándonos RLS si es necesario)
    const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // A. Obtener Configuración Global
    const { data: limits, error: limitError } = await supabaseAdmin
        .from('platform_limits')
        .select('*')
        .eq('key_name', 'free_tier')
        .single();
    
    // Fallback de seguridad por si la tabla está vacía
    const maxPodcasts = limits?.max_podcasts_per_month ?? 3;

    // B. Obtener Uso del Usuario
    const { data: usageData } = await supabaseAdmin
        .from('user_usage')
        .select('*')
        .eq('user_id', user.id)
        .single();

    // Inicializamos si es usuario nuevo
    let currentUsage = usageData || { 
        user_id: user.id, 
        podcasts_created_this_month: 0, 
        last_reset_date: new Date().toISOString() 
    };

    // C. Lógica de "Lazy Reset" (Reinicio Mensual Automático)
    const now = new Date();
    const lastResetDate = new Date(currentUsage.last_reset_date);
    
    // Si cambiamos de mes o año, reseteamos a 0
    if (now.getMonth() !== lastResetDate.getMonth() || now.getFullYear() !== lastResetDate.getFullYear()) {
        console.log(`[Quota] Nuevo mes detectado para usuario ${user.id}. Reseteando contador.`);
        currentUsage.podcasts_created_this_month = 0;
        currentUsage.last_reset_date = now.toISOString();
    }

    // D. Chequeo Final de Límite (Hard Stop)
    if (currentUsage.podcasts_created_this_month >= maxPodcasts) {
        throw new Error(`Has alcanzado tu límite mensual de ${maxPodcasts} podcasts. Podrás crear más el próximo mes.`);
    }

    // E. Actualizar Contador (+1)
    // Lo hacemos ANTES de crear el trabajo para asegurar el cobro del "token" (Cuota Estricta)
    const { error: updateError } = await supabaseAdmin
        .from('user_usage')
        .upsert({
            user_id: user.id,
            podcasts_created_this_month: currentUsage.podcasts_created_this_month + 1,
            last_reset_date: currentUsage.last_reset_date, // Mantiene fecha de reset o la nueva si cambió
            updated_at: new Date().toISOString()
        });

    if (updateError) {
        console.error("Error actualizando cuota:", updateError);
        throw new Error("Error interno gestionando tu cuota. Intenta de nuevo.");
    }

    console.log(`[Quota] Token consumido. Uso actual: ${currentUsage.podcasts_created_this_month + 1}/${maxPodcasts}`);

    // --- FIN ZONA DE SEGURIDAD ---

    // 3. PROCESAMIENTO DEL TRABAJO (Lógica Original)
    const payload = await request.json();
    const validatedPayload = QueuePayloadSchema.parse(payload);
    
    const { data: newJobId, error: rpcError } = await supabaseClient
      .rpc('increment_jobs_and_queue', {
        p_user_id: user.id,
        p_payload: validatedPayload
      });

    if (rpcError) throw new Error(`Fallo en RPC: ${rpcError.message}`);

    // 4. Invocación Asíncrona del Procesador
    console.log(`Trabajo ${newJobId} creado. Invocando a 'process-podcast-job'...`);
    
    supabaseAdmin.functions.invoke('process-podcast-job', {
      body: { job_id: newJobId }
    }).then(({ error: invokeError }) => {
      if (invokeError) {
        console.error(`Invocación asíncrona falló para job ${newJobId}:`, invokeError);
      }
    });

    return new Response(JSON.stringify({
      success: true,
      job_id: newJobId,
      message: "Trabajo encolado exitosamente."
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido.";
    console.error("Error en queue-podcast-job:", error);
    
    // Retornamos 403 si es error de cuota para que el Frontend sepa mostrar el mensaje correcto
    const status = errorMessage.includes("límite mensual") ? 403 : (error instanceof ZodError ? 400 : 500);

    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});