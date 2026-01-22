// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 20.0 (Master Redactor - Pulse Integration & Dual-Intelligence Handoff)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones con rutas relativas para estabilidad en el despliegue universal
import { AI_MODELS, buildPrompt, callGeminiMultimodal, generateEmbedding, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { guard } from "../_shared/guard.ts";

const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

  try {
    const body = await request.json();
    const { purpose, agentName, inputs, draft_id, pulse_source_ids } = body;

    if (!inputs) throw new Error("CONTENIDO_REQUERIDO: El objeto 'inputs' es obligatorio.");

    // 1. IDENTIFICACIÓN Y SEGURIDAD
    const authHeader = request.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("SESION_INVALIDA: Acceso denegado.");

    // 2. GOBERNANZA: Verificación de Cuota
    if (!draft_id) {
      const { data: quota, error: quotaErr } = await supabaseAdmin.rpc('check_draft_quota', { p_user_id: user.id });
      if (quotaErr || !quota.allowed) {
        return new Response(JSON.stringify({ success: false, error: quota?.reason || "Límite de cuota alcanzado." }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // 3. FASE DE INTELIGENCIA: BIFURCACIÓN DE FUENTES
    let dossier = null;
    let sources = [];
    const baseTopic = inputs.solo_topic || inputs.question_to_answer || inputs.link_topicA || "Nuevo Conocimiento";

    if (purpose === 'pulse' && pulse_source_ids?.length > 0) {
      // --- CASO PULSE: Recuperación de fuentes validadas en el Radar ---
      console.log(`📡 [Draft][${correlationId}] Recuperando fuentes de Actualidad del Radar...`);
      const { data: pulseData, error: pulseErr } = await supabaseAdmin
        .from('pulse_staging')
        .select('title, summary, url, source_name, content_type, authority_score')
        .in('id', pulse_source_ids);

      if (pulseErr || !pulseData) throw new Error("PULSE_DATA_MISSING: No se pudieron recuperar las fuentes del radar.");

      // Transformamos las señales en un dossier de inteligencia directo
      dossier = {
        topic: baseTopic,
        key_findings: pulseData.map(d => `${d.source_name} (${d.content_type}): ${d.summary}`),
        structured_knowledge: pulseData
      };
      sources = pulseData.map(d => ({
        title: d.title, url: d.url, origin: 'web', source_name: d.source_name
      }));

    } else {
      // --- CASO ESTÁNDAR: Investigación Híbrida (Web + NKV) ---
      console.log(`🔍 [Draft][${correlationId}] Iniciando Investigación Híbrida para: ${baseTopic}`);
      const queryVector = await generateEmbedding(baseTopic);
      const researchResponse = await supabaseAdmin.functions.invoke('research-intelligence', {
        body: {
          topic: baseTopic,
          depth: inputs.narrativeDepth || "Medio",
          queryVector
        }
      });

      if (researchResponse.error) throw new Error(`INVESTIGACION_FALLIDA: ${researchResponse.error.message}`);
      dossier = researchResponse.data.dossier;
      sources = researchResponse.data.sources;
    }

    // 4. FASE DE REDACCIÓN (Gemini 2.5 Pro)
    // Seleccionamos el agente según el flujo
    const targetAgent = purpose === 'pulse' ? 'briefing-architect-v1' : 'script-architect-v1';

    const { data: promptEntry, error: promptError } = await supabaseAdmin
      .from('ai_prompts')
      .select('prompt_template')
      .eq('agent_name', targetAgent)
      .single();

    if (promptError || !promptEntry) throw new Error(`CONFIG_ERROR: Agente [${targetAgent}] no configurado.`);

    const finalPrompt = buildPrompt(promptEntry.prompt_template, {
      dossier_json: JSON.stringify(dossier),
      style: agentName || "narrador",
      duration: inputs.duration || "Media",
      topic: baseTopic,
      motivation: inputs.solo_motivation || inputs.archetype_goal || "Briefing estratégico"
    });

    console.log(`✍️ [Draft][${correlationId}] Redactando con ${AI_MODELS.PRO}...`);
    const scriptRaw = await callGeminiMultimodal(finalPrompt, inputs.imageContext, AI_MODELS.PRO);
    const content = parseAIJson<{ title?: string, script_body?: string, summary?: string }>(scriptRaw);

    const finalText = content.script_body || "Error en síntesis narrativa.";
    const finalTitle = content.title || baseTopic;

    // 5. PERSISTENCIA EN BÓVEDA (Atomic Update)
    const draftRecord = {
      user_id: user.id,
      title: finalTitle,
      script_text: { script_body: finalText },
      creation_data: { ...body, inputs: { ...inputs, dossier_cache: dossier } }, // Guardamos el dossier para evitar re-investigar
      sources: sources,
      updated_at: new Date().toISOString()
    };

    let finalDraftId = draft_id;
    if (draft_id) {
      await supabaseAdmin.from('podcast_drafts').update(draftRecord).eq('id', draft_id).eq('user_id', user.id);
    } else {
      const { data: newDraft } = await supabaseAdmin.from('podcast_drafts').insert(draftRecord).select('id').single();
      finalDraftId = newDraft?.id;

      // Actualizar uso mensual
      const { data: usage } = await supabaseAdmin.from('user_usage').select('drafts_created_this_month').eq('user_id', user.id).single();
      await supabaseAdmin.from('user_usage').update({
        drafts_created_this_month: (usage?.drafts_created_this_month || 0) + 1
      }).eq('user_id', user.id);
    }

    // 6. APRENDIZAJE RECURSIVO (NKV Loop)
    // Inyectamos el dossier en la refinería para que otros usuarios se beneficien de la búsqueda
    fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/vault-refinery`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        'Content-Type': 'application/json',
        'x-correlation-id': correlationId
      },
      body: JSON.stringify({
        title: `Intel: ${finalTitle}`,
        text: JSON.stringify(dossier),
        source_type: 'user_contribution',
        is_public: true,
        is_json: true
      })
    }).catch((e) => console.error("NKV_SILENT_ERROR:", e));

    // 7. RESPUESTA AL CLIENTE
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
    const msg = err instanceof Error ? err.message : "Fallo en motor de redacción";
    console.error(`🔥 [Draft][${correlationId}] ERROR:`, msg);
    return new Response(JSON.stringify({ success: false, error: msg, trace_id: correlationId }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

serve(guard(handler));