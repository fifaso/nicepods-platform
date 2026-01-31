// supabase/functions/process-podcast-job/index.ts
// VERSIÓN: 30.0 (Master Journey Orchestrator - Quota-Resilience & Universal Integrity)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones con rutas relativas para estabilidad total y despliegue universal
import { AI_MODELS, buildPrompt, callGeminiMultimodal, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders, guard } from "../_shared/guard.ts";

/**
 * Interfaces para el manejo de respuestas de inteligencia
 */
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

  // [SISTEMA]: Declaración en scope superior para garantizar acceso en bloque catch
  let targetPodId: number | null = null;

  try {
    const payload = await request.json();
    const { job_id, podcast_id } = payload;

    let finalScriptBody = "";
    let finalTitle = "";
    let needsGeneration = true;
    let jobData: any = null;

    console.log(`🎬 [Orchestrator][${correlationId}] Iniciando orquestación de producción.`);

    // --- 1. RESOLUCIÓN DE ESTRATEGIA DE DATOS ---
    if (job_id) {
      // Caso A: Creación desde Cola (Requiere fase de redacción IA)
      const { data: job, error: jobErr } = await supabaseAdmin.from("podcast_creation_jobs").select("*").eq("id", job_id).single();
      if (jobErr || !job) throw new Error("JOB_NOT_FOUND: El trabajo no existe en la cola.");
      jobData = job;
    } else if (podcast_id) {
      // Caso B: Promoción Directa (Borrador/Remix con script ya validado)
      const { data: pod, error: podErr } = await supabaseAdmin.from("micro_pods").select("*").eq("id", podcast_id).single();
      if (podErr || !pod) throw new Error("PODCAST_NOT_FOUND: Recurso no localizado.");

      targetPodId = pod.id;
      finalTitle = pod.title;

      if (pod.script_text) {
        console.log(`[Orchestrator] Script detectado. Saltando a Fase A multimedia.`);
        needsGeneration = false;
        // Extraemos el cuerpo del guion para enviarlo a los workers
        const parsed = typeof pod.script_text === 'string' ? JSON.parse(pod.script_text) : pod.script_text;
        finalScriptBody = parsed.script_body || String(parsed);
        jobData = { user_id: pod.user_id, payload: pod.creation_data };
      } else {
        jobData = { user_id: pod.user_id, payload: pod.creation_data };
      }
    } else {
      throw new Error("IDENTIFIER_MISSING: No se proporcionó ID de job ni de podcast.");
    }

    // --- 2. FASE DE GENERACIÓN NARRATIVA (Si el guion no existe) ---
    if (needsGeneration) {
      console.log(`🧠 [Orchestrator] Generando guion maestro con ${AI_MODELS.PRO}...`);
      const agentName = jobData.payload.agentName || "script-architect-v1";
      const { data: agent } = await supabaseAdmin.from("ai_prompts").select("prompt_template, version").eq("agent_name", agentName).single();

      if (!agent) throw new Error(`AGENT_NOT_CONFIGURED: ${agentName}`);

      const inputs = jobData.payload.inputs || {};
      const context = {
        ...inputs,
        topic: inputs.solo_topic || inputs.question_to_answer || jobData.payload.final_title || "Tema Estratégico",
        motivation: inputs.solo_motivation || "Generar valor cognitivo.",
        purpose: jobData.payload.purpose
      };

      const finalPrompt = buildPrompt(agent.prompt_template, context);
      const rawAiResponse = await callGeminiMultimodal(finalPrompt, inputs.imageContext, AI_MODELS.PRO);
      const content: AIContentResponse = parseAIJson(rawAiResponse);

      finalScriptBody = content.script_body || content.text || "";
      finalTitle = content.title || content.suggested_title || context.topic;

      // Inserción inicial en tabla de producción con bloqueo multimedia
      const { data: newPod, error: podErr } = await supabaseAdmin.from("micro_pods").insert({
        user_id: jobData.user_id,
        title: finalTitle,
        description: content.ai_summary || finalScriptBody.substring(0, 200),
        script_text: JSON.stringify({
          script_body: finalScriptBody,
          script_plain: finalScriptBody.replace(/<[^>]+>/g, " ").trim()
        }),
        status: "pending_approval",
        processing_status: "processing",
        creation_mode: jobData.payload.creation_mode || 'standard',
        agent_version: `${agentName}-v${agent.version || '1'}`,
        creation_data: jobData.payload,
        sources: jobData.payload.sources || []
      }).select("id").single();

      if (podErr) throw podErr;
      targetPodId = newPod.id;

      if (job_id) {
        await supabaseAdmin.from("podcast_creation_jobs").update({ micro_pod_id: targetPodId, status: "processing" }).eq("id", job_id);
      }
    }

    // --- 3. FASE A: PRODUCCIÓN MULTIMEDIA (BLOQUEANTE) ---
    console.log(`📡 [${correlationId}] Forjando activos multimedia para Pod #${targetPodId}`);

    const [audioRes, imageRes] = await Promise.all([
      supabaseAdmin.functions.invoke("generate-audio-from-script", {
        body: { podcast_id: targetPodId, trace_id: correlationId }
      }),
      supabaseAdmin.functions.invoke("generate-cover-image", {
        body: { podcast_id: targetPodId, trace_id: correlationId }
      })
    ]);

    // [VALIDACIÓN DE CUOTA]: Detección de saturación en Google Cloud
    if (audioRes.error || imageRes.error) {
      const err = audioRes.error || imageRes.error;
      if (err.message?.includes("Quota exceeded") || err.status === 403) {
        throw new Error("IA_INFRASTRUCTURE_SATURATED: Cuota de Google Cloud agotada temporalmente.");
      }
      throw new Error(`ASSET_WORKER_ERROR: ${err.message || 'Error en síntesis multimedia'}`);
    }

    // --- 4. PUNTO DE LIBERACIÓN (HANDOVER) ---
    console.log(`🔓 [${correlationId}] Activos validados. Liberando acceso al usuario.`);
    await supabaseAdmin.from("micro_pods").update({
      processing_status: 'completed',
      updated_at: new Date().toISOString()
    }).eq('id', targetPodId);

    // --- 5. FASE B: PROCESAMIENTO DE FONDO (NO BLOQUEANTE) ---
    console.log(`🧠 [${correlationId}] Iniciando Fase B: Memoria Semántica.`);

    // Invocamos sin esperar (await) para cerrar la respuesta al cliente lo antes posible
    Promise.allSettled([
      supabaseAdmin.functions.invoke("generate-embedding", {
        body: { podcast_id: targetPodId, trace_id: correlationId }
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

    // Cierre de job legacy
    if (job_id) {
      await supabaseAdmin.from("podcast_creation_jobs").update({ status: "completed" }).eq("id", job_id);
    }

    return new Response(JSON.stringify({
      success: true,
      pod_id: targetPodId,
      message: "Producción finalizada y entregada con éxito."
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Fallo en la malla de funciones";
    console.error(`🔥 [Orchestrator][${correlationId}] ERROR:`, msg);

    // [RECOVERY]: Marcamos el podcast como fallido para que el Frontend detenga el spinner
    if (targetPodId) {
      const isQuota = msg.includes("IA_INFRASTRUCTURE_SATURATED");
      await supabaseAdmin.from("micro_pods").update({
        processing_status: 'failed',
        admin_notes: isQuota
          ? "Error: Servidores de Google saturados. Por favor, re-intenta en 15 minutos."
          : `Error en fase crítica: ${msg}`
      }).eq('id', targetPodId);
    }

    return new Response(JSON.stringify({ success: false, error: msg, trace_id: correlationId }), {
      status: 500,
      headers: corsHeaders
    });
  }
};

serve(guard(handler));