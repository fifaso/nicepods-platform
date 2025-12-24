// supabase/functions/process-podcast-job/index.ts
import { serve } from "std/http/server.ts";
import { createClient, SupabaseClient } from "supabase";
import { guard } from "guard";
import { AI_MODELS, callGemini, parseAIJson, buildPrompt } from "ai-core";

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
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SERVICE_KEY);

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let currentJobId: number | null = null;

  try {
    const payload = await request.json();
    currentJobId = payload.job_id;

    // 1. HIDRATACIÓN DEL JOB
    const { data: job, error: jobErr } = await supabaseAdmin
      .from("podcast_creation_jobs")
      .select("*")
      .eq("id", currentJobId)
      .single();

    if (jobErr || !job) throw new Error(`Job ${currentJobId} no encontrado.`);

    console.log(`🚀 [${correlationId}] Iniciando Síntesis Creativa: ${job.job_title}`);
    await supabaseAdmin.from("podcast_creation_jobs").update({ status: "processing" }).eq("id", currentJobId);

    // 2. CONFIGURACIÓN DEL AGENTE
    const agentName = job.payload.agentName || 
                     (job.payload.creation_mode === "remix" ? "reply-synthesizer-v1" : "script-architect-v1");

    const { data: agent, error: agentErr } = await supabaseAdmin
      .from("ai_prompts")
      .select("prompt_template, model_identifier")
      .eq("agent_name", agentName)
      .single();

    if (agentErr || !agent) throw new Error(`Agente ${agentName} no disponible.`);

    // 3. GENERACIÓN NARRATIVA (Gemini 2.0 Flash)
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

    let scriptBody = content.script_body || content.text || "";
    if (!scriptBody && Array.isArray(content.script)) {
      scriptBody = content.script.map((s: AIScriptLine) => s.line).join("\n\n");
    }

    if (!scriptBody) throw new Error("La IA generó un guion vacío.");

    // 4. CREACIÓN ATÓMICA DEL PODCAST (Heredando metadatos para transparencia)
    const { data: pod, error: podErr } = await supabaseAdmin
      .from("micro_pods")
      .insert({
        user_id: job.user_id,
        title: content.title || content.suggested_title || job.job_title,
        script_text: JSON.stringify({ 
          script_body: scriptBody, 
          script_plain: scriptBody.replace(/<[^>]+>/g, " ").trim() 
        }),
        status: "pending_approval",
        creation_mode: job.payload.creation_mode,
        parent_id: job.payload.parent_id,
        agent_version: agentName,
        creation_data: job.payload, // Persistencia de transparencia
        sources: job.payload.sources || []
      })
      .select("id")
      .single();

    if (podErr) throw podErr;

    // 5. VÍNCULO DE SEGURIDAD
    // Actualizamos el Job con el ID del podcast ANTES de llamar a los workers
    await supabaseAdmin.from("podcast_creation_jobs").update({ 
        micro_pod_id: pod.id 
    }).eq("id", currentJobId);

    // 6. INVOCACIÓN EN PARALELO (Direct Injection)
    console.log(`📡 [${correlationId}] Fan-out: Inyectando Podcast ID ${pod.id}`);
    
    await Promise.allSettled([
      supabaseAdmin.functions.invoke("generate-audio-from-script", { 
        body: { job_id: job.id, podcast_id: pod.id, trace_id: correlationId } 
      }),
      supabaseAdmin.functions.invoke("generate-cover-image", { 
        body: { job_id: job.id, podcast_id: pod.id, agent_name: "cover-art-director-v1", trace_id: correlationId } 
      }),
      supabaseAdmin.functions.invoke("generate-embedding", { 
        body: { podcast_id: pod.id, trace_id: correlationId } 
      })
    ]);

    await supabaseAdmin.from("podcast_creation_jobs").update({ status: "completed" }).eq("id", currentJobId);

    return new Response(JSON.stringify({ success: true, pod_id: pod.id }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    if (currentJobId) await supabaseAdmin.from("podcast_creation_jobs").update({ status: "failed", error_message: msg }).eq("id", currentJobId);
    return new Response(JSON.stringify({ success: false, error: msg }), { status: 500 });
  }
};

serve(guard(handler));