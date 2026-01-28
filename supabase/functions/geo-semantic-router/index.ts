// supabase/functions/geo-suite/semantic-router/index.ts
// Misión: El "Iron Dome". Filtra contenido personal y clasifica el intento del usuario.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { MadridAIClient } from "../geo-shared/gemini-client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // Setup
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const ai = new MadridAIClient(Deno.env.get('GOOGLE_AI_API_KEY') ?? '');

    const { draft_id, user_intent_text } = await req.json();

    // 1. Recuperar contexto del Staging
    const { data: draft } = await supabase
      .from('geo_drafts_staging')
      .select('*')
      .eq('id', draft_id)
      .single();

    if (!draft) throw new Error('Draft not found');

    // 2. Construir Prompt del "Editor Urbano"
    const systemPrompt = `
      Eres el Editor Jefe de 'Madrid Resonance', una guía de audio geolocalizada.
      Tu misión es filtrar contenido rigurosamente.
      
      REGLAS DE ACEPTACIÓN:
      1. El contenido debe tratar sobre el LUGAR, la HISTORIA, la ARQUITECTURA o el AMBIENTE.
      2. RECHAZA diarios personales, quejas subjetivas sin contexto, o contenido irrelevante ("Hola probando").
      3. Si el usuario habla de sí mismo, solo acéptalo si lo conecta profundamente con el entorno (ej: "Este parque me recuerda a... porque su diseño...").
      
      CONTEXTO FÍSICO:
      Lugar: ${draft.detected_place_id}
      Clima: ${JSON.stringify(draft.weather_snapshot)}
      
      CLASIFICACIÓN (Si se acepta):
      - 'chronicle': Historia, leyenda, dato arquitectónico.
      - 'friend_tip': Recomendación práctica (comida, mejor hora para ir).
      - 'cultural_radar': Evento efímero o vibe actual.
      
      Responde SOLO en JSON.
    `;

    const userPrompt = `Input del Usuario: "${user_intent_text}"`;

    // 3. Juicio de la IA
    const decision = await ai.generate(systemPrompt, userPrompt, undefined, true);
    const result = decision.json; // { verdict: 'APPROVED'|'REJECTED', type: ..., reason: ... }

    // 4. Actuar según veredicto
    if (result.verdict === 'REJECTED') {
      await supabase
        .from('geo_drafts_staging')
        .update({ status: 'rejected', rejection_reason: result.reason })
        .eq('id', draft_id);

      return new Response(JSON.stringify({ success: false, reason: result.reason }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 5. Si es Aprobado, actualizamos estado
    await supabase
      .from('geo_drafts_staging')
      .update({ status: 'analyzing', rejection_reason: null }) // Listo para generar guion
      .eq('id', draft_id);

    return new Response(JSON.stringify({
      success: true,
      classification: result.type,
      feedback: result.reason
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});