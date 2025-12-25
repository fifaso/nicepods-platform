// supabase/functions/process-podcast-job/index.ts
// VERSIÓN: 23.0 (Data Wealth & Full Provenance)

import { serve } from "std/http/server.ts";
import { createClient, SupabaseClient } from "supabase";
import { guard } from "guard";
import { AI_MODELS, callGemini, parseAIJson, buildPrompt } from "ai-core";

interface AIScriptLine { speaker: string; line: string; }
interface AIContentResponse { title?: string; suggested_title?: string; script_body?: string; script?: AIScriptLine[]; text?: string; ai_summary?: string; }

const supabaseAdmin: SupabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let currentJobId: number | null = null;

  try {
    const payload = await request.json();
    currentJobId = payload.job_id;

    const { data: job, error: jobErr } = await supabaseAdmin.from("podcast_creation_jobs").select("*").eq("id", currentJobId).single();
    if (jobErr || !job) throw new Error("Job no encontrado.");

    const agentName = job.payload.agentName || (job.payload.creation_mode === "remix" ? "reply-synthesizer-v1" : "script-architect-v1");
    const { data: agent } = await supabaseAdmin.from("ai_prompts").select("prompt_template, model_identifier").eq("agent_name", agentName).single();
    if (!agent) throw new Error(`Agente ${agentName} no configurado.`);

    const context = {
      ...job.payload.inputs,
      topic: job.payload.inputs?.topic || job.job_title,
      quote_context: job.payload.quote_context,
      user_reaction: job.payload.user_reaction
    };

    const finalPrompt = buildPrompt(agent.prompt_template, context);
    const rawAiResponse = await callGemini(finalPrompt, agent.model_identifier || AI_MODELS.LATEST);
    const content: AIContentResponse = parseAIJson(rawAiResponse);

    let scriptBody = content.script_body || content.text || "";
    if (!scriptBody && Array.isArray(content.script)) {
      scriptBody = content.script.map((s: AIScriptLine) => s.line).join("\n\n");
    }

    // 1. PERSISTENCIA CON CUSTODIA DE DATOS
    const { data: pod, error: podErr } = await supabaseAdmin.from("micro_pods").insert({
        user_id: job.user_id,
        title: content.title || content.suggested_title || job.job_title,
        description: content.ai_summary || job.payload.inputs?.motivation?.substring(0, 250),
        script_text: JSON.stringify({ script_body: scriptBody, script_plain: scriptBody.replace(/<[^>]+>/g, " ").trim() }),
        status: "pending_approval",
        creation_mode: job.payload.creation_mode,
        parent_id: job.payload.parent_id,
        agent_version: agentName,
        creation_data: job.payload, // Metadata para componente UI
        sources: job.payload.sources || [] // Fuentes de Tavily
      }).select("id").single();

    if (podErr) throw podErr;

    // 2. ACTUALIZACIÓN Y DISPARO PARALELO
    await supabaseAdmin.from("podcast_creation_jobs").update({ status: "processing", micro_pod_id: pod.id }).eq("id", currentJobId);

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