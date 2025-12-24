// supabase/functions/process-podcast-job/index.ts
// VERSIÓN: 21.0 (Enterprise Standard - Full Transparency & Strict Typing)

import { serve } from "std/http/server.ts";
import { createClient, SupabaseClient } from "supabase";
import { guard } from "guard";
import { AI_MODELS, callGemini, parseAIJson, buildPrompt } from "ai-core";

/**
 * Interfaces para eliminar advertencias de 'any' y asegurar contratos de datos
 */
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

// Inicialización del cliente administrador
const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SERVICE_KEY);

const handler = async (request: Request): Promise<Response> => {
  // TraceID para seguimiento holístico de la petición
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let currentJobId: number | null = null;

  try {
    const payload = await request.json();
    currentJobId = payload.job_id;

    // 1. HIDRATACIÓN DEL TRABAJO
    const { data: job, error: jobErr } = await supabaseAdmin
      .from("podcast_creation_jobs")
      .select("*")
      .eq("id", currentJobId)
      .single();

    if (jobErr || !job) {
      throw new Error(`Imposible localizar el Job con ID: ${currentJobId}`);
    }

    console.log(`🚀 [${correlationId}] Procesando metadatos para: ${job.job_title}`);

    // Marcamos el inicio del procesamiento
    await supabaseAdmin
      .from("podcast_creation_jobs")
      .update({ status: "processing" })
      .eq("id", currentJobId);

    // 2. SELECCIÓN DINÁMICA DEL AGENTE
    const agentName = job.payload.agentName || 
                     (job.payload.creation_mode === "remix" ? "reply-synthesizer-v1" : "script-architect-v1");

    const { data: agent, error: agentErr } = await supabaseAdmin
      .from("ai_prompts")
      .select("prompt_template, model_identifier")
      .eq("agent_name", agentName)
      .single();

    // FIX: Validación de existencia del agente para eliminar el error 'possibly null'
    if (agentErr || !agent) {
      throw new Error(`El Agente Inteligente '${agentName}' no está configurado en la base de datos.`);
    }

    // 3. GENERACIÓN DE INTELIGENCIA NARRATIVA
    const contextData = {
      ...job.payload.inputs,
      topic: job.payload.inputs?.topic || job.job_title,
      quote_context: job.payload.quote_context,
      user_reaction: job.payload.user_reaction,
      duration: job.payload.inputs?.duration || "Media",
      depth: job.payload.inputs?.depth || "Profunda"
    };

    const finalPrompt = buildPrompt(agent.prompt_template, contextData);
    const modelToUse = agent.model_identifier || AI_MODELS.LATEST;
    
    const rawAiResponse = await callGemini(finalPrompt, modelToUse);
    const content: AIContentResponse = parseAIJson(rawAiResponse);

    // 4. NORMALIZACIÓN DEL GUION (Cero 'any')
    let finalScriptBody = "";
    if (content.script_body) {
      finalScriptBody = content.script_body;
    } else if (Array.isArray(content.script)) {
      finalScriptBody = content.script.map((item: AIScriptLine) => item.line).join("\n\n");
    } else if (content.text) {
      finalScriptBody = content.text;
    }

    if (!finalScriptBody || finalScriptBody.length < 10) {
      throw new Error("Fallo en la síntesis: El guion generado no tiene la longitud mínima requerida.");
    }

    // 5. REGISTRO DEL PODCAST (HUELLA DIGITAL COMPLETA)
    const { data: newPodcast, error: dbInsertError } = await supabaseAdmin
      .from("micro_pods")
      .insert({
        user_id: job.user_id,
        title: content.title || content.suggested_title || job.job_title,
        script_text: JSON.stringify({ 
          script_body: finalScriptBody,
          script_plain: finalScriptBody.replace(/<[^>]+>/g, " ").trim() 
        }),
        status: "pending_approval",
        creation_mode: job.payload.creation_mode,
        parent_id: job.payload.parent_id,
        agent_version: agentName,
        // PERSISTENCIA 360: Guardamos el payload y las fuentes para transparencia total
        creation_data: job.payload,
        sources: job.payload.sources || []
      })
      .select("id")
      .single();

    if (dbInsertError) throw dbInsertError;

    // 6. DISPARO DE WORKERS ASÍNCRONOS (FAN-OUT)
    console.log(`📡 [${correlationId}] Disparando producción de activos para Pod: ${newPodcast.id}`);
    
    const workerPromises = [
      supabaseAdmin.functions.invoke("generate-audio-from-script", { 
        body: { job_id: job.id, trace_id: correlationId } 
      }),
      supabaseAdmin.functions.invoke("generate-cover-image", { 
        body: { job_id: job.id, agent_name: "cover-art-director-v1", trace_id: correlationId } 
      }),
      supabaseAdmin.functions.invoke("generate-embedding", { 
        body: { podcast_id: newPodcast.id, trace_id: correlationId } 
      })
    ];

    // No bloqueamos el proceso, permitimos que los workers trabajen en paralelo
    await Promise.allSettled(workerPromises);

    // 7. CIERRE DEL TRABAJO
    await supabaseAdmin
      .from("podcast_creation_jobs")
      .update({ 
        status: "completed", 
        micro_pod_id: newPodcast.id 
      })
      .eq("id", currentJobId);

    return new Response(JSON.stringify({ 
      success: true, 
      podcast_id: newPodcast.id,
      trace_id: correlationId 
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Error desconocido en el orquestador";
    console.error(`🔥 [${correlationId}] Fallo en Orquestación:`, errorMessage);

    if (currentJobId) {
      await supabaseAdmin
        .from("podcast_creation_jobs")
        .update({ 
          status: "failed", 
          error_message: errorMessage 
        })
        .eq("id", currentJobId);
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage,
      trace_id: correlationId 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

serve(guard(handler));