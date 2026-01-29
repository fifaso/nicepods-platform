// supabase/functions/geo-semantic-router/index.ts
// VERSIÓN: 3.0 (Madrid Resonance - Clean Sync & Nicepod Standard)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AI_MODELS, buildPrompt, callGeminiMultimodal, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { draft_id, user_intent_text } = await req.json();

    if (!draft_id || !user_intent_text) throw new Error("Faltan parámetros críticos (draft_id o user_intent_text)");

    // 1. Obtener contexto del borrador y el Agente desde DB
    const [draftReq, agentReq] = await Promise.all([
      supabase.from('geo_drafts_staging').select('*').eq('id', draft_id).single(),
      supabase.from('ai_prompts').select('*').eq('agent_name', 'geo-urban-gatekeeper-v1').single()
    ]);

    if (draftReq.error || !draftReq.data) throw new Error("No se encontró el borrador geoespacial en staging.");
    if (agentReq.error || !agentReq.data) throw new Error("Agente 'geo-urban-gatekeeper-v1' no encontrado en ai_prompts.");

    // 2. Construir Prompt usando el estándar Nicepod
    const fullPrompt = buildPrompt(agentReq.data.prompt_template, {
      place: draftReq.data.detected_place_id,
      weather: draftReq.data.weather_snapshot?.condition || "desconocido",
      user_intent: user_intent_text
    });

    // 3. Invocación centralizada usando el modelo FLASH
    const aiResponse = await callGeminiMultimodal(fullPrompt, undefined, AI_MODELS.FLASH);
    const result = parseAIJson<any>(aiResponse);

    // 4. Persistencia de estado según veredicto
    await supabase.from('geo_drafts_staging').update({
      status: result.verdict === 'APPROVED' ? 'analyzing' : 'rejected',
      rejection_reason: result.reason
    }).eq('id', draft_id);

    return new Response(JSON.stringify({
      success: result.verdict === 'APPROVED',
      reason: result.reason,
      classification: result.classification
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error: any) {
    console.error("Critical Error [geo-semantic-router]:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
});