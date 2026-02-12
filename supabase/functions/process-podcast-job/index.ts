// supabase/functions/process-podcast-job/index.ts
// VERSIÓN: 33.0 (Master Script Architect - JSONB Integrity & NKV Link Edition)
// Misión: Transformar intenciones creativas en podcasts reales, orquestando la inteligencia y delegando la multimedia.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo NicePod (Nivel 1 de Estabilización)
import { AI_MODELS, buildPrompt, callGeminiMultimodal, cleanTextForSpeech, parseAIJson } from "../_shared/ai.ts";
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
  // Recuperamos el Correlation ID de nuestro Guard V5.0 para trazabilidad total
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let targetPodId: number | null = null;

  try {
    const payload = await request.json();
    const { job_id, podcast_id } = payload;

    let jobData: any = null;

    console.log(`🎬 [Dispatcher][${correlationId}] Iniciando resolución de contexto.`);

    // --- 1. RESOLUCIÓN DE CONTEXTO OPERATIVO ---
    if (job_id) {
      const { data: job, error: jobErr } = await supabaseAdmin
        .from("podcast_creation_jobs")
        .select("*")
        .eq("id", job_id)
        .single();
      if (jobErr || !job) throw new Error("JOB_NOT_FOUND");
      jobData = job;
    } else if (podcast_id) {
      const { data: pod, error: podErr } = await supabaseAdmin
        .from("micro_pods")
        .select("*")
        .eq("id", podcast_id)
        .single();
      if (podErr || !pod) throw new Error("PODCAST_NOT_FOUND");

      targetPodId = pod.id;
      jobData = { user_id: pod.user_id, payload: pod.creation_data };

      // Si ya posee guion estructurado, evitamos la re-generación
      if (pod.script_text) {
        return new Response(JSON.stringify({
          success: true,
          message: "El guion ya existe. Los motores multimedia están en marcha."
        }), { status: 200, headers: corsHeaders });
      }
    } else {
      throw new Error("IDENTIFIER_MISSING: Se requiere job_id o podcast_id.");
    }

    // --- 2. FASE DE GENERACIÓN NARRATIVA (INTELIGENCIA PRO) ---
    const agentName = jobData.payload.agentName || "script-architect-v1";
    console.log(`🧠 [Dispatcher][${correlationId}] Invocando agente: ${agentName}`);

    const { data: agent, error: agentErr } = await supabaseAdmin
      .from("ai_prompts")
      .select("prompt_template, version")
      .eq("agent_name", agentName)
      .single();

    if (agentErr || !agent) throw new Error(`AGENT_NOT_CONFIGURED: ${agentName}`);

    const inputs = jobData.payload.inputs || {};
    const context = {
      ...inputs,
      topic: inputs.solo_topic || inputs.question_to_answer || jobData.payload.final_title || "Nueva Sabiduría",
      motivation: inputs.solo_motivation || "Generar valor cognitivo profundo.",
      purpose: jobData.payload.purpose || "learn"
    };

    // Construcción de prompt con escape de JSON robusto (buildPrompt V10.3)
    const finalPrompt = buildPrompt(agent.prompt_template, context);

    const rawAiResponse = await callGeminiMultimodal(
      finalPrompt,
      inputs.imageContext || inputs.image_base64_reference,
      AI_MODELS.PRO
    );

    const content: AIContentResponse = parseAIJson(rawAiResponse);

    const finalScriptBody = content.script_body || content.text || "";
    const finalTitle = content.title || content.suggested_title || context.topic;

    // --- 3. INSERCIÓN ATÓMICA CON FORMATO JSONB ---
    // Al insertar con processing_status = 'processing', el Trigger SQL 'tr_on_pod_created' 
    // disparará automáticamente los workers de Audio e Imagen en paralelo.

    const plainText = cleanTextForSpeech(finalScriptBody);

    const { data: newPod, error: podInsertErr } = await supabaseAdmin
      .from("micro_pods")
      .insert({
        user_id: jobData.user_id,
        title: finalTitle,
        description: content.ai_summary || plainText.substring(0, 200),
        script_text: {
          script_body: finalScriptBody,
          script_plain: plainText
        },
        status: "pending_approval",
        processing_status: "processing", // Gatillo multimedia
        creation_mode: jobData.payload.creation_mode || 'standard',
        agent_version: `${agentName}-v${agent.version || '1'}`,
        creation_data: jobData.payload,
        sources: jobData.payload.sources || [],
        audio_ready: false,
        image_ready: false,
        geo_location: jobData.payload.inputs?.location ?
          `POINT(${jobData.payload.inputs.location.longitude} ${jobData.payload.inputs.location.latitude})` : null
      })
      .select("id")
      .single();

    if (podInsertErr) throw podInsertErr;
    targetPodId = newPod.id;

    // Marcamos el Job como completado si el origen fue la cola de tareas
    if (job_id) {
      await supabaseAdmin.from("podcast_creation_jobs").update({
        micro_pod_id: targetPodId,
        status: "completed",
        updated_at: new Date().toISOString()
      }).eq("id", job_id);
    }

    // --- 4. APRENDIZAJE RECURSIVO (NKV REFINERY) ---
    // Despachamos la información a la Bóveda con trazabilidad total.
    const refineryUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/vault-refinery`;
    fetch(refineryUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        'Content-Type': 'application/json',
        'x-correlation-id': correlationId
      },
      body: JSON.stringify({
        title: `Génesis: ${finalTitle}`,
        text: finalScriptBody,
        source_type: 'user_contribution',
        is_public: true,
        metadata: { pod_id: targetPodId, correlation_id: correlationId }
      })
    }).catch((e) => console.error(`⚠️ [NKV-Link-Fail][${correlationId}]:`, e.message));

    console.log(`✅ [Dispatcher] Pod #${targetPodId} creado. Multimedia en manos de la DB.`);

    return new Response(JSON.stringify({
      success: true,
      pod_id: targetPodId,
      message: "Contenido generado exitosamente.",
      trace_id: correlationId
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error(`🔥 [Dispatcher-Fatal][${correlationId}] ERROR:`, err.message);

    // Rollback de estado para informar al usuario en la UI
    if (targetPodId) {
      await supabaseAdmin.from("micro_pods").update({
        processing_status: 'failed',
        admin_notes: `Error en orquestación: ${err.message} | Trace: ${correlationId}`
      }).eq('id', targetPodId);
    }

    return new Response(JSON.stringify({
      success: false,
      error: err.message,
      trace_id: correlationId
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

// Aplicamos el Guard Maestro V5.0 para blindar el orquestador
serve(guard(handler));