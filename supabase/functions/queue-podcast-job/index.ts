// supabase/functions/queue-podcast-job/index.ts
// VERSIÓN: 17.0 (NKV Standard - Atomic Draft Promotion Fix)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Importaciones con rutas relativas para compatibilidad total
import { guard } from "../_shared/guard.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * SCHEMA: QueuePayloadSchema
 * Sincronizado con PodcastCreationSchema v5.2
 */
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
    // 1. Identificación del Usuario
    const authHeader = request.headers.get('Authorization');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader?.replace("Bearer ", "") || ""
    );
    if (authError || !user) throw new Error("Sesión de usuario no válida.");

    const rawBody = await request.json();
    const validated = QueuePayloadSchema.parse(rawBody);

    let targetPodId: number;

    // 2. LÓGICA DE PROMOCIÓN (Draft Table -> Production Table)
    if (validated.draft_id) {
      console.log(`🚀 [Queue][${correlationId}] Promocionando borrador #${validated.draft_id} a producción.`);

      // A. Insertamos en micro_pods (Producción) con los datos finales del editor
      const { data: newPod, error: insertError } = await supabaseAdmin
        .from('micro_pods')
        .insert({
          user_id: user.id,
          title: validated.final_title,
          description: validated.final_title,
          script_text: JSON.stringify({
            script_body: validated.final_script,
            script_plain: validated.final_script.replace(/<[^>]+>/g, " ").trim()
          }),
          sources: validated.sources,
          creation_data: {
            purpose: validated.purpose,
            agentName: validated.agentName,
            inputs: validated.inputs
          },
          status: 'pending_approval' // Entra en fase de procesamiento
        })
        .select('id')
        .single();

      if (insertError) throw new Error(`Fallo al crear podcast desde borrador: ${insertError.message}`);
      targetPodId = newPod.id;

      // B. Limpieza de Bóveda (Eliminar el registro de podcast_drafts para liberar cuota)
      await supabaseAdmin
        .from('podcast_drafts')
        .delete()
        .eq('id', validated.draft_id)
        .eq('user_id', user.id);

    } else {
      // Caso: Creación directa sin pasar por borrador (Fallback de seguridad)
      const { data: directPod, error: directError } = await supabaseAdmin
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

      if (directError) throw directError;
      targetPodId = directPod.id;
    }

    // 3. DISPARAR ORQUESTADOR DE ACTIVOS
    // Ya no pasamos job_id (proceso legacy). Pasamos podcast_id directamente.
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
      trace_id: correlationId,
      message: "Podcast enviado a producción exitosamente."
    }), {
      status: 202,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Fallo en motor de promoción";
    console.error(`🔥 [Queue][${correlationId}] ERROR:`, msg);

    return new Response(JSON.stringify({
      error: msg,
      trace_id: correlationId
    }), {
      status: err instanceof ZodError ? 400 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

serve(guard(handler));