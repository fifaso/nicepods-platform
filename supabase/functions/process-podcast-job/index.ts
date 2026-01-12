// supabase/functions/process-podcast-job/index.ts
// VERSIÓN: 26.0 (Journey Master Orchestrator - Recursive Wisdom & NKV Integration)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones con rutas relativas directas para estabilidad total en despliegues
import { AI_MODELS, callGeminiMultimodal, parseAIJson, buildPrompt } from "../_shared/ai.ts";
import { guard } from "../_shared/guard.ts";
import { corsHeaders } from "../_shared/cors.ts";

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

    if (jobErr || !job) throw new Error("CRITICAL: Job no localizado en la cola de producción.");

    // 2. SELECCIÓN DE AGENTE Y PROMPT
    const agentName = job.payload.agentName || "script-architect-v1";
    const { data: agent } = await supabaseAdmin
      .from("ai_prompts")
      .select("prompt_template, model_identifier, version")
      .eq("agent_name", agentName)
      .single();

    if (!agent) throw new Error(`CONFIG_ERROR: Agente [${agentName}] no configurado.`);

    // 3. NORMALIZACIÓN DEL CONTEXTO (Data Provenance)
    const inputs = job.payload.inputs || {};

    const topicSemilla =
      inputs.solo_topic ||
      (inputs.link_topicA ? `${inputs.link_topicA} y ${inputs.link_topicB}` : null) ||
      inputs.question_to_answer ||
      inputs.legacy_lesson ||
      job.job_title ||
      "Tema General";

    const motivationSemilla =
      inputs.solo_motivation ||
      inputs.archetype_goal ||
      inputs.link_selectedNarrative?.thesis ||
      "Crear una pieza de alto valor educativo.";

    const context = {
      ...inputs,
      topic: topicSemilla,
      motivation: motivationSemilla,
      purpose: job.payload.purpose,
      duration: inputs.duration || "Media",
      depth: inputs.narrativeDepth || "Equilibrada"
    };

    // 4. GENERACIÓN DE CONTENIDO (Gemini 2.5 Pro - Razonamiento de Élite)
    console.log(`[Orchestrator][${correlationId}] Redactando "${topicSemilla}" con Agente ${agentName}`);

    const finalPrompt = buildPrompt(agent.prompt_template, context);

    const rawAiResponse = await callGeminiMultimodal(
      finalPrompt,
      inputs.imageContext, // Soporte multimodal nativo
      AI_MODELS.PRO
    );

    const content: AIContentResponse = parseAIJson(rawAiResponse);

    // 5. CONSOLIDACIÓN DEL GUION
    const scriptBody =
      content.script_body ||
      content.text ||
      (Array.isArray(content.script) ? content.script.map((s: AIScriptLine) => s.line).join("\n\n") : "");

    const finalTitle = content.title || content.suggested_title || topicSemilla;
    const aiSummary = content.ai_summary || scriptBody.substring(0, 250) + "...";

    // 6. INSERCIÓN ATÓMICA EN MICRO_PODS (Registro de Propiedad Intelectual)
    const { data: pod, error: podErr } = await supabaseAdmin.from("micro_pods").insert({
      user_id: job.user_id,
      title: finalTitle,
      description: aiSummary,
      script_text: JSON.stringify({
        script_body: scriptBody,
        script_plain: scriptBody.replace(/<[^>]+>/g, " ").trim()
      }),
      status: "pending_approval",
      creation_mode: job.payload.creation_mode || 'standard',
      parent_id: job.payload.parent_id,
      agent_version: `${agentName}-v${agent.version || '1'}`,
      creation_data: job.payload,
      sources: job.payload.sources || []
    }).select("id").single();

    if (podErr) throw podErr;

    // 7. ACTUALIZACIÓN DE HANDSHAKE (Vínculo Job -> Pod)
    await supabaseAdmin
      .from("podcast_creation_jobs")
      .update({ micro_pod_id: pod.id, status: "processing" })
      .eq("id", currentJobId);

    // 8. FAN-OUT PARALELO: Producción de Activos y APRENDIZAJE RECURSIVO
    console.log(`[Orchestrator][${correlationId}] Disparando trabajadores y NKV Loop...`);

    await Promise.allSettled([
      // A. Trabajadores de Activos
      supabaseAdmin.functions.invoke("generate-audio-from-script", {
        body: { podcast_id: pod.id, trace_id: correlationId }
      }),
      supabaseAdmin.functions.invoke("generate-cover-image", {
        body: { podcast_id: pod.id, trace_id: correlationId }
      }),
      supabaseAdmin.functions.invoke("generate-embedding", {
        body: { podcast_id: pod.id, trace_id: correlationId }
      }),

      // B. [NKV RECURSIVE WISDOM]: El sistema aprende de su propio guion de alta calidad.
      supabaseAdmin.functions.invoke("vault-refinery", {
        body: {
          title: `Síntesis: ${finalTitle}`,
          text: scriptBody,
          source_type: 'user_contribution',
          is_public: true,
          metadata: {
            original_podcast_id: pod.id,
            purpose: job.payload.purpose
          }
        }
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
    const msg = err instanceof Error ? err.message : "Error desconocido en el motor de orquestación.";
    console.error(`🔥 [Orchestrator][${correlationId}] ERROR:`, msg);

    if (currentJobId) {
      await supabaseAdmin
        .from("podcast_creation_jobs")
        .update({ status: "failed", error_message: msg })
        .eq("id", currentJobId);
    }

    return new Response(
      JSON.stringify({ success: false, error: msg, trace_id: correlationId }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
};

serve(guard(handler));