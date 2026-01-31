// supabase/functions/process-podcast-job/index.ts
// VERSIÓN: 31.0 (Master Dispatcher - Integrated Logic & Zero-Wait Architecture)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones con rutas relativas para estabilidad total
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
  let targetPodId: number | null = null;

  try {
    const payload = await request.json();
    const { job_id, podcast_id } = payload;

    let finalScriptBody = "";
    let finalTitle = "";
    let needsGeneration = true;
    let jobData: any = null;

    console.log(`🎬 [Dispatcher][${correlationId}] Iniciando orquestación.`);

    // --- 1. RESOLUCIÓN DE ESTRATEGIA DE HIDRATACIÓN ---
    if (job_id) {
      const { data: job, error: jobErr } = await supabaseAdmin.from("podcast_creation_jobs").select("*").eq("id", job_id).single();
      if (jobErr || !job) throw new Error("JOB_NOT_FOUND");
      jobData = job;
    } else if (podcast_id) {
      const { data: pod, error: podErr } = await supabaseAdmin.from("micro_pods").select("*").eq("id", podcast_id).single();
      if (podErr || !pod) throw new Error("PODCAST_NOT_FOUND");

      targetPodId = pod.id;
      if (pod.script_text) {
        needsGeneration = false;
        finalTitle = pod.title;
        const parsed = typeof pod.script_text === 'string' ? JSON.parse(pod.script_text) : pod.script_text;
        finalScriptBody = parsed.script_body || String(parsed);
        jobData = { user_id: pod.user_id, payload: pod.creation_data };
      } else {
        jobData = { user_id: pod.user_id, payload: pod.creation_data };
      }
    } else {
      throw new Error("IDENTIFIER_MISSING");
    }

    // --- 2. FASE DE GENERACIÓN NARRATIVA (SÍNCRONA PERO RÁPIDA) ---
    // Esta fase solo genera el texto, lo cual toma < 10s y no agota la CPU.
    if (needsGeneration) {
      console.log(`🧠 [Dispatcher] Generando guion maestro con ${AI_MODELS.PRO}...`);
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

      // Inserción inicial. audio_ready e image_ready inician en FALSE.
      const { data: newPod, error: podErr } = await supabaseAdmin.from("micro_pods").insert({
        user_id: jobData.user_id,
        title: finalTitle,
        description: content.ai_summary || finalScriptBody.substring(0, 200),
        script_text: JSON.stringify({ script_body: finalScriptBody, script_plain: finalScriptBody.replace(/<[^>]+>/g, " ").trim() }),
        status: "pending_approval",
        processing_status: "processing",
        creation_mode: jobData.payload.creation_mode || 'standard',
        agent_version: `${agentName}-v${agent.version || '1'}`,
        creation_data: jobData.payload,
        sources: jobData.payload.sources || [],
        audio_ready: false, // Control de Trigger
        image_ready: false  // Control de Trigger
      }).select("id").single();

      if (podErr) throw podErr;
      targetPodId = newPod.id;

      if (job_id) {
        await supabaseAdmin.from("podcast_creation_jobs").update({ micro_pod_id: targetPodId, status: "processing" }).eq("id", job_id);
      }
    }

    // --- 3. FASE DE DESPACHO ASÍNCRONO (SOLUCIÓN AL CPU TIME) ---
    // Invocamos a los trabajadores sin usar 'await'. 
    // La función principal termina y libera la CPU, mientras los workers corren en paralelo.
    console.log(`📡 [Dispatcher] Disparando Malla de Activos para Pod #${targetPodId}`);

    const workerPayload = {
      body: { podcast_id: targetPodId, trace_id: correlationId },
      method: 'POST'
    };

    // Estos procesos son lentos, por eso se ejecutan en el fondo
    supabaseAdmin.functions.invoke("generate-audio-from-script", workerPayload);
    supabaseAdmin.functions.invoke("generate-cover-image", workerPayload);
    supabaseAdmin.functions.invoke("generate-embedding", workerPayload);

    // Disparo de Refinería NKV para aprendizaje recursivo
    supabaseAdmin.functions.invoke("vault-refinery", {
      body: {
        title: `Sabiduría: ${finalTitle}`,
        text: finalScriptBody,
        source_type: 'user_contribution',
        is_public: true
      }
    });

    if (job_id) {
      await supabaseAdmin.from("podcast_creation_jobs").update({ status: "completed" }).eq("id", job_id);
    }

    // Respuesta inmediata al cliente
    return new Response(JSON.stringify({
      success: true,
      pod_id: targetPodId,
      message: "Orquestación activa. Los activos multimedia se sincronizarán al terminar."
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error(`🔥 [Dispatcher-Fatal][${correlationId}] ERROR:`, err.message);

    if (targetPodId) {
      await supabaseAdmin.from("micro_pods").update({
        processing_status: 'failed',
        admin_notes: `Error de despacho: ${err.message}`
      }).eq('id', targetPodId);
    }

    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
};

serve(guard(handler));