// supabase/functions/process-podcast-job/index.ts
// VERSIÓN: 29.0 (Master Journey Orchestrator - Gemini 3.0 Ready & Shielded Production)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones con rutas relativas para estabilidad total en despliegue Supabase
import { AI_MODELS, buildPrompt, callGeminiMultimodal, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders, guard } from "../_shared/guard.ts";

interface AIContentResponse {
  title?: string;
  suggested_title?: string;
  script_body?: string;
  text?: string;
  ai_summary?: string;
}

const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

  try {
    const payload = await request.json();
    const { job_id, podcast_id } = payload;

    let targetPodId = podcast_id;
    let finalScriptBody = "";
    let finalTitle = "";
    let needsGeneration = true;
    let jobData: any = null;

    // --- 1. RESOLUCIÓN DE ESTRATEGIA (HIDRATACIÓN) ---
    if (job_id) {
      // CASO A: Creación Estándar desde Cola (IA escribe el guion)
      const { data: job, error: jobErr } = await supabaseAdmin.from("podcast_creation_jobs").select("*").eq("id", job_id).single();
      if (jobErr || !job) throw new Error("JOB_NOT_FOUND: El trabajo no existe en la cola.");
      jobData = job;
    } else if (podcast_id) {
      // CASO B: Promoción Directa (Borrador/Remix con guion ya existente)
      const { data: pod, error: podErr } = await supabaseAdmin.from("micro_pods").select("*").eq("id", podcast_id).single();
      if (podErr || !pod) throw new Error("PODCAST_NOT_FOUND: El podcast de producción no existe.");

      if (pod.script_text) {
        console.log(`[Orchestrator][${correlationId}] Script detectado. Saltando a Fase A multimedia.`);
        needsGeneration = false;
        targetPodId = pod.id;
        finalTitle = pod.title;
        // Extracción segura del cuerpo del guion
        const parsed = typeof pod.script_text === 'string' ? JSON.parse(pod.script_text) : pod.script_text;
        finalScriptBody = parsed.script_body || String(parsed);
        jobData = { user_id: pod.user_id, payload: pod.creation_data };
      } else {
        jobData = { user_id: pod.user_id, payload: pod.creation_data };
      }
    } else {
      throw new Error("IDENTIFIER_MISSING: Se requiere job_id o podcast_id.");
    }

    // --- 2. FASE DE GENERACIÓN IA (Solo si el guion no existe) ---
    if (needsGeneration) {
      console.log(`[Orchestrator][${correlationId}] Generando narrativa neuronal con ${AI_MODELS.PRO}...`);
      const agentName = jobData.payload.agentName || "script-architect-v1";
      const { data: agent } = await supabaseAdmin.from("ai_prompts").select("prompt_template, version").eq("agent_name", agentName).single();

      if (!agent) throw new Error(`AGENT_NOT_CONFIGURED: ${agentName}`);

      const inputs = jobData.payload.inputs || {};
      const context = {
        ...inputs,
        topic: inputs.solo_topic || inputs.question_to_answer || jobData.payload.final_title || "Tema de Conocimiento",
        motivation: inputs.solo_motivation || "Generar valor cognitivo para la comunidad.",
        purpose: jobData.payload.purpose
      };

      const finalPrompt = buildPrompt(agent.prompt_template, context);

      // Llamada multimodal (soporta imagen de contexto si existe)
      const rawAiResponse = await callGeminiMultimodal(finalPrompt, inputs.imageContext, AI_MODELS.PRO);
      const content: AIContentResponse = parseAIJson(rawAiResponse);

      finalScriptBody = content.script_body || content.text || "";
      finalTitle = content.title || content.suggested_title || context.topic;

      // Persistencia inicial en la tabla de producción
      const { data: newPod, error: podErr } = await supabaseAdmin.from("micro_pods").insert({
        user_id: jobData.user_id,
        title: finalTitle,
        description: content.ai_summary || finalScriptBody.substring(0, 200),
        script_text: JSON.stringify({
          script_body: finalScriptBody,
          script_plain: finalScriptBody.replace(/<[^>]+>/g, " ").trim()
        }),
        status: "pending_approval",
        processing_status: "processing", // Estado para el Gatekeeper del Frontend
        creation_mode: jobData.payload.creation_mode || 'standard',
        agent_version: `${agentName}-v${agent.version || '1'}`,
        creation_data: jobData.payload,
        sources: jobData.payload.sources || []
      }).select("id").single();

      if (podErr) throw podErr;
      targetPodId = newPod.id;

      // Sincronización con el registro de la cola si aplica
      if (job_id) {
        await supabaseAdmin.from("podcast_creation_jobs").update({ micro_pod_id: targetPodId, status: "processing" }).eq("id", job_id);
      }
    }

    // --- 3. FASE A: PRODUCCIÓN MULTIMEDIA (BLOQUEANTE PARA EL USUARIO) ---
    console.log(`📡 [${correlationId}] Iniciando Fase A: Síntesis de Audio e Imagen.`);

    // Ejecutamos trabajadores críticos. Debemos esperar a que ambos terminen con éxito.
    const assetResults = await Promise.all([
      supabaseAdmin.functions.invoke("generate-audio-from-script", {
        body: { podcast_id: targetPodId }
      }),
      supabaseAdmin.functions.invoke("generate-cover-image", {
        body: { podcast_id: targetPodId }
      })
    ]);

    // Verificamos si alguno de los trabajadores críticos falló
    const hasFailures = assetResults.some(res => res.error || (res.data && res.data.success === false));
    if (hasFailures) {
      throw new Error("MULTIMEDIA_PHASE_FAILED: El audio o la imagen no pudieron ser generados.");
    }

    // --- 4. PUNTO DE LIBERACIÓN (HANDOVER) ---
    // Actualizamos el estado técnico para que el Frontend "abra la puerta" al usuario
    console.log(`🔓 [${correlationId}] Activos verificados. Liberando acceso al podcast.`);
    await supabaseAdmin.from("micro_pods").update({
      processing_status: 'completed',
      updated_at: new Date().toISOString()
    }).eq('id', targetPodId);

    // --- 5. FASE B: INTELIGENCIA DE FONDO (NO BLOQUEANTE) ---
    // Procesos recursivos que alimentan la memoria del sistema (NKV)
    console.log(`🧠 [${correlationId}] Iniciando Fase B: Refinería y Vectorización de Sabiduría.`);

    // Disparamos sin esperar (Background process) para optimizar el tiempo de respuesta final
    Promise.allSettled([
      supabaseAdmin.functions.invoke("generate-embedding", {
        body: { podcast_id: targetPodId }
      }),
      supabaseAdmin.functions.invoke("vault-refinery", {
        body: {
          title: `Sabiduría: ${finalTitle}`,
          text: finalScriptBody,
          source_type: 'user_contribution',
          is_public: true
        }
      })
    ]);

    // Cierre del Job legacy si existía
    if (job_id) {
      await supabaseAdmin.from("podcast_creation_jobs").update({ status: "completed" }).eq("id", job_id);
    }

    return new Response(JSON.stringify({
      success: true,
      pod_id: targetPodId,
      message: "Proceso de producción finalizado con éxito."
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido en el orquestador.";
    console.error(`🔥 [Orchestrator][${correlationId}] FATAL_ERROR:`, msg);

    // Salvaguarda: Marcar el podcast como fallido para que el usuario reciba feedback
    if (targetPodId) {
      await supabaseAdmin.from("micro_pods").update({
        processing_status: 'failed',
        admin_notes: `Fallo en fase crítica: ${msg}`
      }).eq('id', targetPodId);
    }

    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: corsHeaders
    });
  }
};

serve(guard(handler));