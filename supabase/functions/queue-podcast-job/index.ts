// supabase/functions/queue-podcast-job/index.ts
// VERSIÓN: 16.0 (Atomic Promotion - Draft Integration & Direct Relative Imports)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Importaciones con rutas relativas para compatibilidad móvil/dashboard
import { guard } from "../_shared/guard.ts";
import { corsHeaders } from "../_shared/cors.ts";

const QueuePayloadSchema = z.object({
  draft_id: z.number().optional().nullable(),
  purpose: z.string(),
  agentName: z.string(),
  final_title: z.string(),
  final_script: z.string(),
  sources: z.array(z.any()).default([]),
  inputs: z.record(z.unknown())
});

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

  const supabaseAdmin: SupabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? "",
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""
  );

  try {
    const authHeader = request.headers.get('Authorization');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader?.replace("Bearer ", "") || ""
    );
    if (authError || !user) throw new Error("No autorizado.");

    const rawBody = await request.json();
    const validated = QueuePayloadSchema.parse(rawBody);

    let targetPodId: number;

    // 1. DETERMINAR ESTRATEGIA (ACTUALIZAR BORRADOR O INSERTAR NUEVO)
    if (validated.draft_id) {
      console.log(`[Queue][${correlationId}] Promocionando borrador #${validated.draft_id}`);

      const { data: updatedPod, error: updateError } = await supabaseAdmin
        .from('micro_pods')
        .update({
          status: 'pending_approval', // Sube de 'draft' a producción
          title: validated.final_title,
          script_text: JSON.stringify({
            script_body: validated.final_script,
            script_plain: validated.final_script.replace(/<[^>]+>/g, " ").trim()
          }),
          sources: validated.sources,
          updated_at: new Date().toISOString()
        })
        .eq('id', validated.draft_id)
        .eq('user_id', user.id) // Seguridad: solo borra lo propio
        .select('id')
        .single();

      if (updateError) throw new Error(`Fallo en promoción: ${updateError.message}`);
      targetPodId = updatedPod.id;
    } else {
      // Caso: El usuario no generó borrador previo (no debería pasar con el nuevo flujo)
      const { data: newPod, error: insertError } = await supabaseAdmin
        .from('micro_pods')
        .insert({
          user_id: user.id,
          title: validated.final_title,
          status: 'pending_approval',
          creation_data: validated.inputs,
          sources: validated.sources
        })
        .select('id')
        .single();

      if (insertError) throw insertError;
      targetPodId = newPod.id;
    }

    // 2. DISPARAR PROCESAMIENTO (AUDIO/IMAGEN/VECTOR)
    // El orquestador 'process-podcast-job' toma el podcast y dispara los workers
    supabaseAdmin.functions.invoke('process-podcast-job', {
      body: {
        job_id: null,
        podcast_id: targetPodId,
        trace_id: correlationId
      }
    });

    return new Response(JSON.stringify({
      success: true,
      pod_id: targetPodId,
      trace_id: correlationId
    }), {
      status: 202,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    console.error(`🔥 [Queue][${correlationId}] Error:`, msg);
    return new Response(JSON.stringify({ error: msg, trace_id: correlationId }), {
      status: err instanceof ZodError ? 400 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

serve(guard(handler));