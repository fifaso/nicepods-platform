// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 19.0 (Master Journey Orchestrator - Structured NKV Ingestion & Intelligence Handoff)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones con rutas relativas para estabilidad en el despliegue
import { AI_MODELS, callGeminiMultimodal, parseAIJson, buildPrompt, generateEmbedding } from "../_shared/ai.ts";
import { guard } from "../_shared/guard.ts";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

  try {
    const { purpose, agentName, inputs, draft_id } = await request.json();
    if (!inputs) throw new Error("CONTENIDO_REQUERIDO: El objeto 'inputs' es obligatorio.");

    // 1. IDENTIFICACIÓN Y SEGURIDAD (Validación de Sesión)
    const authHeader = request.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("SESION_INVALIDA: Acceso denegado.");

    // 2. GOBERNANZA: Verificación de Cuota (Protección Financiera)
    if (!draft_id) {
      const { data: quota, error: quotaErr } = await supabaseAdmin.rpc('check_draft_quota', { p_user_id: user.id });
      if (quotaErr || !quota.allowed) {
        return new Response(JSON.stringify({ success: false, error: quota?.reason || "Límite de cuota alcanzado." }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    const baseTopic = inputs.solo_topic || inputs.question_to_answer || inputs.link_topicA || "Nuevo Conocimiento";

    // 3. FASE DE INVESTIGACIÓN (Invocación al Agente Investigador)
    console.log(`🔍 [Draft][${correlationId}] Iniciando Fase de Investigación Híbrida...`);

    const queryVector = await generateEmbedding(baseTopic);
    const researchResponse = await supabaseAdmin.functions.invoke('research-intelligence', {
      body: {
        topic: baseTopic,
        depth: inputs.narrativeDepth || "Medio",
        queryVector
      }
    });

    if (researchResponse.error) throw new Error(`INVESTIGACION_FALLIDA: ${researchResponse.error.message}`);
    const { dossier, sources } = researchResponse.data;

    // 4. FASE DE REDACCIÓN (Gemini 2.5 Pro - Director Narrativo)
    const { data: promptEntry, error: promptError } = await supabaseAdmin
      .from('ai_prompts')
      .select('prompt_template')
      .eq('agent_name', 'script-architect-v1')
      .single();

    if (promptError || !promptEntry) throw new Error("CONFIG_ERROR: Prompt maestro no localizado.");

    const finalPrompt = buildPrompt(promptEntry.prompt_template, {
      dossier_json: JSON.stringify(dossier),
      style: agentName || "narrador",
      duration: inputs.duration || "Media",
      topic: baseTopic,
      motivation: inputs.solo_motivation || inputs.archetype_goal || ""
    });

    console.log(`✍️ [Draft][${correlationId}] Redactando con Gemini 2.5 Pro + Dossier Intelligence`);
    const scriptRaw = await callGeminiMultimodal(finalPrompt, inputs.imageContext, AI_MODELS.PRO);
    const content = parseAIJson(scriptRaw) as any;

    const finalText = content.script_body || content.text || content.content || "Error en síntesis.";
    const finalTitle = content.title || content.suggested_title || baseTopic;

    // 5. PERSISTENCIA EN BÓVEDA DE BORRADORES (Hidratación Atómica)
    let finalDraftId = draft_id;
    const draftRecord = {
      user_id: user.id,
      title: finalTitle,
      script_text: { script_body: finalText },
      creation_data: { purpose, agentName, inputs },
      sources: sources,
      updated_at: new Date().toISOString()
    };

    if (draft_id) {
      const { error: updateError } = await supabaseAdmin
        .from('podcast_drafts')
        .update(draftRecord)
        .eq('id', draft_id)
        .eq('user_id', user.id);
      if (updateError) throw new Error("DB_UPDATE_ERROR: Fallo al actualizar persistencia.");
    } else {
      const { data: newDraft, error: insertError } = await supabaseAdmin
        .from('podcast_drafts')
        .insert(draftRecord)
        .select('id')
        .single();

      if (insertError) throw new Error("DB_INSERT_ERROR: Fallo al crear persistencia.");
      finalDraftId = newDraft.id;

      // Actualizar uso mensual
      const { data: usage } = await supabaseAdmin.from('user_usage').select('drafts_created_this_month').eq('user_id', user.id).single();
      await supabaseAdmin.from('user_usage').update({
        drafts_created_this_month: (usage?.drafts_created_this_month || 0) + 1
      }).eq('user_id', user.id);
    }

    // 6. GATILLO DE APRENDIZAJE RECURSIVO (NKV Loop - Dossier Ingestion)
    // [DISRUPCIÓN]: Enviamos el Dossier estructurado en lugar de texto plano
    // Esto permite vectorizar 'Hechos Atómicos' ya procesados por la IA de investigación.
    console.log(`🧠 [Draft][${correlationId}] Inyectando inteligencia estructurada en el NKV...`);

    fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/vault-refinery`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        'Content-Type': 'application/json',
        'x-correlation-id': correlationId
      },
      body: JSON.stringify({
        title: `Inteligencia: ${finalTitle}`,
        text: dossier, // Enviamos el objeto JSON directamente
        source_type: 'user_contribution',
        is_public: true,
        is_json: true // Flag vital para saltar la extracción Flash y usar flattening
      })
    }).catch((e) => console.error("NKV_INGESTION_SILENT_ERROR:", e));

    // 7. RESPUESTA FINAL
    return new Response(JSON.stringify({
      success: true,
      draft_id: finalDraftId,
      draft: {
        suggested_title: finalTitle,
        script_body: finalText,
        sources: sources
      },
      trace_id: correlationId
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: any) {
    const msg = err instanceof Error ? err.message : "Error crítico en orquestador";
    console.error(`🔥 [Draft][${correlationId}] ERROR:`, msg);
    return new Response(JSON.stringify({ success: false, error: msg, trace_id: correlationId }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

serve(guard(handler));