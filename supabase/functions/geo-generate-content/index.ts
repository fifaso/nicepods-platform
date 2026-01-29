// supabase/functions/geo-generate-content/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AI_MODELS, buildPrompt, callGeminiMultimodal, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { draft_id, classification } = await req.json();

    const [draftReq, agentReq] = await Promise.all([
      supabase.from('geo_drafts_staging').select('*').eq('id', draft_id).single(),
      supabase.from('ai_prompts').select('*').eq('agent_name', 'geo-storyteller-v1').single()
    ]);

    if (!draftReq.data || !agentReq.data) throw new Error("Recursos no encontrados.");

    const weather = draftReq.data.weather_snapshot;
    const mood = weather.condition.toLowerCase().includes('rain')
      ? "Lluvioso, melancólico y cinematográfico"
      : "Soleado, vibrante y lleno de vida";

    // Inyectamos todas las variables en la plantilla de la base de datos
    const finalPrompt = buildPrompt(agentReq.data.prompt_template, {
      type: classification,
      place: draftReq.data.detected_place_id,
      weather: `${weather.temp_c}°C, ${weather.condition}`,
      mood: mood,
      inspiration: draftReq.data.rejection_reason || "la atmósfera del lugar"
    });

    // Invocación usando el modelo PRO (Estándar de oro)
    const aiResponse = await callGeminiMultimodal(finalPrompt, undefined, AI_MODELS.PRO);
    const result = parseAIJson<any>(aiResponse);

    return new Response(JSON.stringify({
      success: true,
      script: result.script
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});