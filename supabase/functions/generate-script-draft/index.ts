// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 22.0 (Master Ingestion Standard - Deep Academic Integration)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AI_MODELS, buildPrompt, callGeminiMultimodal, generateEmbedding, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders, guard } from "../_shared/guard.ts";

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

  try {
    const body = await request.json();
    const inputs = body.inputs || body;
    const { purpose, agentName, draft_id, pulse_source_ids } = body;

    // 1. SEGURIDAD Y CUOTA
    const authHeader = request.headers.get('Authorization')!;
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) throw new Error("UNAUTHORIZED");

    // 2. GESTIÓN DE FUENTES (ESTANDARIZACIÓN)
    let dossier = null;
    let sources = [];
    const baseTopic = inputs.solo_topic || inputs.question_to_answer || "Conocimiento NicePod";

    if (purpose === 'pulse' && pulse_source_ids?.length > 0) {
      // INGESTA PULSE: Directo desde el búfer local (Máxima Velocidad)
      const { data: pulseData } = await supabaseAdmin.from('pulse_staging').select('*').in('id', pulse_source_ids);
      dossier = {
        topic: baseTopic,
        key_findings: pulseData?.map(d => `[AUTORIDAD: ${d.authority_score}] ${d.title}: ${d.summary}`),
        technical_data: pulseData
      };
      sources = pulseData?.map(d => ({ title: d.title, url: d.url, origin: 'web' })) || [];
    } else {
      // INGESTA NORMAL: Investigación Híbrida
      console.log(`🧠 [Draft][${correlationId}] Invocando Inteligencia de Investigación...`);
      const queryVector = await generateEmbedding(baseTopic);
      const res = await supabaseAdmin.functions.invoke('research-intelligence', {
        body: { topic: baseTopic, depth: inputs.narrativeDepth || "Medio", queryVector }
      });
      if (res.error || !res.data?.success) throw new Error(`IA_RESEARCH_FAIL: ${res.data?.error || 'Worker Inaccesible'}`);
      dossier = res.data.dossier;
      sources = res.data.sources;
    }

    // 3. REDACCIÓN CON PERSONALIDAD (Gemini 2.5 Pro)
    const targetAgent = purpose === 'pulse' ? 'briefing-architect-v1' : 'script-architect-v1';
    const { data: agentPrompt } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', targetAgent).single();

    const finalPrompt = buildPrompt(agentPrompt?.prompt_template || "", {
      dossier_json: JSON.stringify(dossier),
      style: agentName, // Inyectamos la personalidad del actor
      topic: baseTopic,
      duration: inputs.duration
    });

    const scriptRaw = await callGeminiMultimodal(finalPrompt, inputs.imageContext, AI_MODELS.PRO);
    const content = parseAIJson<{ title: string, script_body: string }>(scriptRaw);

    // 4. PERSISTENCIA ATÓMICA
    const { data: draft, error: dbErr } = await supabaseAdmin.from('podcast_drafts').upsert({
      id: draft_id || undefined,
      user_id: user.id,
      title: content.title,
      script_text: { script_body: content.script_body },
      creation_data: body,
      sources: sources
    }).select('id').single();

    if (dbErr) throw dbErr;

    return new Response(JSON.stringify({ success: true, draft_id: draft.id, draft: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error(`🔥 [Draft-Fatal]:`, err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: corsHeaders });
  }
};

serve(guard(handler));