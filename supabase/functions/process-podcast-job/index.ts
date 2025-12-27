// supabase/functions/process-podcast-job/index.ts
// VERSIÓN: 24.0 (Data-Wealth Edition - Full Provenance & Meta Sync)

import { serve } from "std/http/server.ts";
import { createClient, SupabaseClient } from "supabase";
import { guard } from "guard";
import { AI_MODELS, callGemini, parseAIJson, buildPrompt } from "ai-core";

interface AIScriptLine { speaker: string; line: string; }
interface AIContentResponse { title?: string; suggested_title?: string; script_body?: string; script?: AIScriptLine[]; text?: string; ai_summary?: string; }

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

    const { data: job, error: jobErr } = await supabaseAdmin.from("podcast_creation_jobs").select("*").eq("id", currentJobId).single();
    if (jobErr || !job) throw new Error("Job no localizado.");

    const agentName = job.payload.agentName || (job.payload.creation_mode === "remix" ? "reply-synthesizer-v1" : "script-architect-v1");
    const { data: agent } = await supabaseAdmin.from("ai_prompts").select("prompt_template, model_identifier, version").eq("agent_name", agentName).single();
    if (!agent) throw new Error(`Agente ${agentName} no configurado.`);

    // 1. GENERACIÓN DE CONTENIDO (Gemini 2.0 Flash para Orquestación)
    const context = {
      ...job.payload.inputs,
      topic: job.payload.inputs?.topic || job.job_title,
      quote_context: job.payload.quote_context,
      user_reaction: job.payload.user_reaction,
      duration: job.payload.inputs?.duration || "Media",
      depth: job.payload.inputs?.depth || "Profunda"
    };

    const finalPrompt = buildPrompt(agent.prompt_template, context);
    const rawAiResponse = await callGemini(finalPrompt, agent.model_identifier || AI_MODELS.LATEST);
    const content: AIContentResponse = parseAIJson(rawAiResponse);

    // 2. NORMALIZACIÓN DE DATOS
    const scriptBody = content.script_body || content.text || (Array.isArray(content.script) ? content.script.map((s: AIScriptLine) => s.line).join("\n\n") : "");
    const finalDescription = content.ai_summary || job.payload.inputs?.motivation?.substring(0, 250);

    // 3. INSERCIÓN CON HUELLA DIGITAL 360 (FUENTES + METADATOS)
    const { data: pod, error: podErr } = await supabaseAdmin.from("micro_pods").insert({
        user_id: job.user_id,
        title: content.title || content.suggested_title || job.job_title,
        description: finalDescription, 
        script_text: JSON.stringify({ 
            script_body: scriptBody, 
            script_plain: scriptBody.replace(/<[^>]+>/g, " ").trim() 
        }),
        status: "pending_approval",
        creation_mode: job.payload.creation_mode,
        parent_id: job.payload.parent_id,
        agent_version: `${agentName}-v${agent.version || '1'}`,
        creation_data: job.payload, // Registro íntegro de la intención
        sources: job.payload.sources || [] // Registro íntegro de la investigación
      }).select("id").single();

    if (podErr) throw podErr;

    // 4. ATOMIC HANDSHAKE
    await supabaseAdmin.from("podcast_creation_jobs").update({ micro_pod_id: pod.id, status: "processing" }).eq("id", currentJobId);

    // 5. FAN-OUT PARALELO (Direct Injection)
    console.log(`📡 [${correlationId}] Disparando producción de activos para Pod: ${pod.id}`);
    await Promise.allSettled([
      supabaseAdmin.functions.invoke("generate-audio-from-script", { body: { job_id: job.id, podcast_id: pod.id, trace_id: correlationId } }),
      supabaseAdmin.functions.invoke("generate-cover-image", { body: { job_id: job.id, podcast_id: pod.id, agent_name: "cover-art-director-v1", trace_id: correlationId } }),
      supabaseAdmin.functions.invoke("generate-embedding", { body: { podcast_id: pod.id, trace_id: correlationId } })
    ]);

    await supabaseAdmin.from("podcast_creation_jobs").update({ status: "completed" }).eq("id", currentJobId);

    return new Response(JSON.stringify({ success: true, pod_id: pod.id }), { headers: { "Content-Type": "application/json" } });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    if (currentJobId) await supabaseAdmin.from("podcast_creation_jobs").update({ status: "failed", error_message: msg }).eq("id", currentJobId);
    return new Response(JSON.stringify({ success: false, error: msg }), { status: 500 });
  }
};

serve(guard(handler));