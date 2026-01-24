// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 23.0 (Master Redactor - Agnostic Payload & Direct Pulse Ingestion)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AI_MODELS, buildPrompt, callGeminiMultimodal, generateEmbedding, parseAIJson } from "../_shared/ai.ts";
import { guard } from "../_shared/guard.ts";

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

  try {
    const rawBody = await request.json();

    // [ESTRATEGIA]: Unificación de Payload (Aceptamos inputs: {} o body plano)
    const body = rawBody.inputs ? { ...rawBody.inputs, ...rawBody } : rawBody;
    const { purpose, agentName, draft_id, pulse_source_ids } = body;

    // 1. VALIDACIÓN DE IDENTIDAD
    const authHeader = request.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("UNAUTHORIZED_ACCESS");

    console.log(`✍️ [Draft][${correlationId}] Iniciando redacción estratégica para: ${purpose}`);

    // 2. GESTIÓN DE MATERIA PRIMA
    let dossier = null;
    let sources = [];
    const baseTopic = body.solo_topic || body.question_to_answer || "Nuevos Horizontes";

    if (purpose === 'pulse' && pulse_source_ids?.length > 0) {
      // VÍA PULSE: Ingesta directa de señales del Radar
      const { data: pulseData } = await supabaseAdmin.from('pulse_staging').select('*').in('id', pulse_source_ids);
      if (!pulseData || pulseData.length === 0) throw new Error("PULSE_SOURCES_NOT_FOUND");

      dossier = {
        topic: baseTopic,
        key_findings: pulseData.map(p => `[Autoridad: ${p.authority_score}] ${p.title}: ${p.summary}`),
        evidence_base: pulseData
      };
      sources = pulseData.map(p => ({ title: p.title, url: p.url, origin: 'web', source_name: p.source_name }));
    } else {
      // VÍA ESTÁNDAR: Invocación a Inteligencia de Investigación
      const queryVector = await generateEmbedding(baseTopic);
      const researchRes = await supabaseAdmin.functions.invoke('research-intelligence', {
        body: { topic: baseTopic, depth: body.narrativeDepth || "Medio", queryVector }
      });

      if (researchRes.error || !researchRes.data?.success) {
        throw new Error(`IA_RESEARCH_FAIL: ${researchRes.data?.error || 'Intelligence Node Unreachable'}`);
      }
      dossier = researchRes.data.dossier;
      sources = researchRes.data.sources;
    }

    // 3. FASE DE REDACCIÓN (Gemini 1.5 Pro)
    const agentSlug = purpose === 'pulse' ? 'briefing-architect-v1' : 'script-architect-v1';
    const { data: promptEntry } = await supabaseAdmin.from('ai_prompts')
      .select('prompt_template').eq('agent_name', agentSlug).single();

    if (!promptEntry) throw new Error(`PROMPT_MISSING: ${agentSlug}`);

    const finalPrompt = buildPrompt(promptEntry.prompt_template, {
      dossier_json: JSON.stringify(dossier),
      style: agentName || "narrador",
      topic: baseTopic,
      duration: body.duration || "Media"
    });

    const scriptRaw = await callGeminiMultimodal(finalPrompt, body.imageContext, AI_MODELS.PRO);
    const content = parseAIJson<{ title: string, script_body: string }>(scriptRaw);

    // 4. PERSISTENCIA EN BÓVEDA (Sincronización Atómica)
    const { data: draft, error: dbErr } = await supabaseAdmin.from('podcast_drafts').upsert({
      id: draft_id || undefined,
      user_id: user.id,
      title: content.title || baseTopic,
      script_text: { script_body: content.script_body },
      creation_data: body,
      sources: sources,
      updated_at: new Date().toISOString()
    }).select('id').single();

    if (dbErr) throw new Error(`VAULT_WRITE_FAIL: ${dbErr.message}`);

    // 5. APRENDIZAJE RECURSIVO (NKV Loop - Asíncrono)
    fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/vault-refinery`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: `Sabiduría: ${content.title}`, text: JSON.stringify(dossier), source_type: 'user_contribution', is_public: true, is_json: true })
    }).catch(() => { });

    return new Response(JSON.stringify({
      success: true,
      draft_id: draft.id,
      draft: { suggested_title: content.title, script_body: content.script_body, sources }
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err: any) {
    console.error(`🔥 [Draft-Final-Error]:`, err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
};

serve(guard(handler));