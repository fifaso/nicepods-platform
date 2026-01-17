// supabase/functions/process-podcast-job/index.ts
// VERSIÓN: 28.0 (Master Journey Orchestrator - Shielded Production & Sequential Handover)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones con rutas relativas para estabilidad total y despliegue universal
import { AI_MODELS, buildPrompt, callGeminiMultimodal, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders, guard } from "../_shared/cors.ts";

interface AIScriptLine { speaker: string; line: string; }
interface AIContentResponse { title?: string; suggested_title?: string; script_body?: string; script?: AIScriptLine[]; text?: string; ai_summary?: string; }

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
      // CASO A: Creación Estándar desde Cola de Jobs (IA genera el guion)
      const { data: job, error: jobErr } = await supabaseAdmin.from("podcast_creation_jobs").select("*").eq("id", job_id).single();
      if (jobErr || !job) throw new Error("Job no localizado en la cola.");
      jobData = job;
    } else if (podcast_id) {
      // CASO B: Promoción Directa (Borrador/Remix con guion ya editado)
      const { data: pod, error: podErr } = await supabaseAdmin.from("micro_pods").select("*").eq("id", podcast_id).single();
      if (podErr || !pod) throw new Error("Podcast no localizado en producción.");

      if (pod.script_text) {
        console.log(`[Orchestrator][${correlationId}] Script detectado. Saltando a validación de activos.`);
        needsGeneration = false;
        targetPodId = pod.id;
        finalTitle = pod.title;
        // Extracción segura del cuerpo del guion para los trabajadores
        const parsed = typeof pod.script_text === 'string' ? JSON.parse(pod.script_text) : pod.script_text;
        finalScriptBody = parsed.script_body || String(parsed);
        jobData = { user_id: pod.user_id, payload: pod.creation_data };
      } else {
        jobData = { user_id: pod.user_id, payload: pod.creation_data };
      }
    } else {
      throw new Error("Identificador (job_id o podcast_id) ausente.");
    }

    // --- 2. FASE DE GENERACIÓN IA (Solo si el guion no existe) ---
    if (needsGeneration) {
      console.log(`[Orchestrator][${correlationId}] Generando narrativa maestra...`);
      const agentName = jobData.payload.agentName || "script-architect-v1";
      const { data: agent } = await supabaseAdmin.from("ai_prompts").select("prompt_template, model_identifier, version").eq("agent_name", agentName).single();
      if (!agent) throw new Error(`Agente [${agentName}] no configurado.`);

      const inputs = jobData.payload.inputs || {};
      const context = {
        ...inputs,
        topic: inputs.solo_topic || inputs.question_to_answer || jobData.payload.final_title || "Tema General",
        motivation: inputs.solo_motivation || "Generar valor cognitivo.",
        purpose: jobData.payload.purpose
      };

      const finalPrompt = buildPrompt(agent.prompt_template, context);
      const rawAiResponse = await callGeminiMultimodal(finalPrompt, inputs.imageContext, AI_MODELS.PRO);
      const content: AIContentResponse = parseAIJson(rawAiResponse);

      finalScriptBody = content.script_body || content.text || "";
      finalTitle = content.title || content.suggested_title || context.topic;

      // Inserción inicial en producción
      const { data: newPod, error: podErr } = await supabaseAdmin.from("micro_pods").insert({
        user_id: jobData.user_id,
        title: finalTitle,
        description: content.ai_summary || finalScriptBody.substring(0, 200),
        script_text: JSON.stringify({
          script_body: finalScriptBody,
          script_plain: finalScriptBody.replace(/<[^>]+>/g, " ").trim()
        }),
        status: "pending_approval",
        processing_status: "processing", // Iniciamos fase de activos
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

    // --- 3. FASE A: PRODUCCIÓN CRÍTICA (BLOQUEANTE) ---
    // El usuario NO puede acceder hasta que Audio e Imagen estén listos.
    console.log(`📡 [${correlationId}] Iniciando Fase A: Generación de Activos Multimedia.`);

    const assetResults = await Promise.all([
      supabaseAdmin.functions.invoke("generate-audio-from-script", {
        body: { podcast_id: targetPodId, trace_id: correlationId }
      }),
      supabaseAdmin.functions.invoke("generate-cover-image", {
        body: { podcast_id: targetPodId, trace_id: correlationId }
      })
    ]);

    // Validación de integridad de los activos generados
    const hasFailures = assetResults.some(res => res.error || (res.data && res.data.success === false));
    if (hasFailures) {
      throw new Error("Fallo crítico en la generación de activos multimedia (Audio o Imagen).");
    }

    // --- 4. PUNTO DE ENTREGA (HANDOVER) ---
    // Marcamos como completado para liberar el acceso en el Frontend
    console.log(`🔓 [${correlationId}] Activos validados. Liberando acceso al usuario.`);
    await supabaseAdmin.from("micro_pods").update({
      processing_status: 'completed',
      updated_at: new Date().toISOString()
    }).eq('id', targetPodId);

    // --- 5. FASE B: PROCESAMIENTO DE FONDO (NO BLOQUEANTE) ---
    // Inteligencia recursiva y memoria semántica
    console.log(`🧠 [${correlationId}] Iniciando Fase B: Refinería de conocimiento y vectores.`);

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

    // Cierre de trazabilidad del Job legacy si aplica
    if (job_id) {
      await supabaseAdmin.from("podcast_creation_jobs").update({ status: "completed" }).eq("id", job_id);
    }

    return new Response(JSON.stringify({
      success: true,
      pod_id: targetPodId,
      message: "Producción completada y entregada."
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Fallo en orquestación";
    console.error(`🔥 [Orchestrator][${correlationId}] ERROR:`, msg);

    // En caso de fallo, intentamos marcar el podcast como fallido para el usuario
    if (payload?.podcast_id || targetPodId) {
      await supabaseAdmin.from("micro_pods").update({
        processing_status: 'failed',
        admin_notes: `Error en fase crítica: ${msg}`
      }).eq('id', payload?.podcast_id || targetPodId);
    }

    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: corsHeaders
    });
  }
};

serve(guard(handler));