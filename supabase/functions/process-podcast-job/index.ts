// supabase/functions/process-podcast-job/index.ts
// VERSIÓN: 25.0 (Journey Master Orchestrator - Dynamic Context & Vision Support)

import { serve } from "std/http/server.ts";
import { createClient, SupabaseClient } from "supabase";
import { guard, corsHeaders } from "guard";
import {
  AI_MODELS,
  callGeminiMultimodal,
  parseAIJson,
  buildPrompt
} from "ai-core";

// --- INTERFACES DE CONTRATO ---
interface AIScriptLine {
  speaker: string;
  line: string;
}

interface AIContentResponse {
  title?: string;
  suggested_title?: string;
  script_body?: string;
  script?: AIScriptLine[];
  text?: string;
  ai_summary?: string;
}

const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let currentJobId: number | null = null;

  try {
    const payload = await request.json();
    currentJobId = payload.job_id;

    // 1. RECUPERACIÓN DEL TRABAJO (Full Metadata Payload)
    const { data: job, error: jobErr } = await supabaseAdmin
      .from("podcast_creation_jobs")
      .select("*")
      .eq("id", currentJobId)
      .single();

    if (jobErr || !job) throw new Error("Job no localizado en la cola.");

    // 2. SELECCIÓN DE AGENTE Y PROMPT
    const agentName = job.payload.agentName || "script-architect-v1";
    const { data: agent } = await supabaseAdmin
      .from("ai_prompts")
      .select("prompt_template, model_identifier, version")
      .eq("agent_name", agentName)
      .single();

    if (!agent) throw new Error(`Agente [${agentName}] no configurado en la base de datos.`);

    // 3. NORMALIZACIÓN DINÁMICA DEL CONTEXTO (Data Provenance)
    // Extraemos la materia prima según la rama del formulario v5.0
    const inputs = job.payload.inputs || {};

    const topicSemilla =
      inputs.solo_topic ||
      (inputs.link_topicA ? `${inputs.link_topicA} y ${inputs.link_topicB}` : null) ||
      inputs.question_to_answer ||
      inputs.legacy_lesson ||
      "Tema General";

    const motivationSemilla =
      inputs.solo_motivation ||
      inputs.archetype_goal ||
      inputs.link_selectedNarrative?.thesis ||
      "Crear una pieza de alto valor.";

    const context = {
      ...inputs,
      topic: topicSemilla,
      motivation: motivationSemilla,
      purpose: job.payload.purpose,
      duration: inputs.duration || "Corta",
      depth: inputs.narrativeDepth || "Equilibrada",
      // Contexto situacional para local_soul
      discovery_dossier: inputs.discovery_context ? JSON.stringify(inputs.discovery_context) : null
    };

    // 4. GENERACIÓN DE CONTENIDO (IA Multimodal)
    console.log(`[Orchestrator][${correlationId}] Procesando "${topicSemilla}" con Agente ${agentName}`);

    const finalPrompt = buildPrompt(agent.prompt_template, context);

    // Invocamos multimodal para soportar imágenes en modo situacional
    const rawAiResponse = await callGeminiMultimodal(
      finalPrompt,
      inputs.imageContext, // Si hay base64 de foto, Gemini la procesará
      agent.model_identifier || AI_MODELS.PRO
    );

    const content: AIContentResponse = parseAIJson(rawAiResponse);

    // 5. CONSOLIDACIÓN DEL GUION
    const scriptBody =
      content.script_body ||
      content.text ||
      (Array.isArray(content.script) ? content.script.map((s: AIScriptLine) => s.line).join("\n\n") : "");

    const finalTitle = content.title || content.suggested_title || topicSemilla;
    const aiSummary = content.ai_summary || scriptBody.substring(0, 200) + "...";

    // 6. INSERCIÓN ATÓMICA EN MICRO_PODS (La Huella Digital)
    const { data: pod, error: podErr } = await supabaseAdmin.from("micro_pods").insert({
      user_id: job.user_id,
      title: finalTitle,
      description: aiSummary,
      script_text: JSON.stringify({
        script_body: scriptBody,
        script_plain: scriptBody.replace(/<[^>]+>/g, " ").trim()
      }),
      status: "pending_approval",
      creation_mode: job.payload.creation_mode,
      parent_id: job.payload.parent_id,
      agent_version: `${agentName}-v${agent.version || '1'}`,
      creation_data: job.payload, // Registro íntegro para transparencia
      sources: job.payload.sources || [] // Registro de investigación bibliográfica
    }).select("id").single();

    if (podErr) throw podErr;

    // 7. ACTUALIZACIÓN DE HANDSHAKE
    await supabaseAdmin
      .from("podcast_creation_jobs")
      .update({ micro_pod_id: pod.id, status: "processing" })
      .eq("id", currentJobId);

    // 8. DISPARO DE WORKERS (Fan-Out Paralelo)
    // Usamos Promise.allSettled para que un error en la imagen no detenga el audio
    await Promise.allSettled([
      supabaseAdmin.functions.invoke("generate-audio-from-script", {
        body: { podcast_id: pod.id, trace_id: correlationId }
      }),
      supabaseAdmin.functions.invoke("generate-cover-image", {
        body: { podcast_id: pod.id, trace_id: correlationId }
      }),
      supabaseAdmin.functions.invoke("generate-embedding", {
        body: { podcast_id: pod.id, trace_id: correlationId }
      })
    ]);

    // 9. FINALIZACIÓN DEL JOB
    await supabaseAdmin
      .from("podcast_creation_jobs")
      .update({ status: "completed" })
      .eq("id", currentJobId);

    return new Response(
      JSON.stringify({ success: true, pod_id: pod.id, trace_id: correlationId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error crítico en orquestador";
    console.error(`🔥 [Orchestrator][${correlationId}] Error:`, msg);

    if (currentJobId) {
      await supabaseAdmin
        .from("podcast_creation_jobs")
        .update({ status: "failed", error_message: msg })
        .eq("id", currentJobId);
    }

    return new Response(
      JSON.stringify({ success: false, error: msg, trace_id: correlationId }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(guard(handler));