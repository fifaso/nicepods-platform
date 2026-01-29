// supabase/functions/geo-ingest-context/index.ts
// VERSIÓN: 2.0 (Privacy-Guard & Visual Discovery)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AI_MODELS, callGeminiMultimodal, parseAIJson } from "../_shared/ai.ts";
import { getCurrentWeather } from "../geo-shared/open-meteo.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Auth Check
    const authHeader = req.headers.get('Authorization');
    const { data: { user } } = await supabase.auth.getUser(authHeader?.replace('Bearer ', '') || '');
    if (!user) throw new Error('Unauthorized');

    const { lat, lng, image_base64 } = await req.json();

    // 1. Sensores Físicos (Clima y GPS)
    const [weather, placeRes] = await Promise.all([
      getCurrentWeather(lat, lng),
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`).then(r => r.json())
    ]);

    const placeName = placeRes.display_name?.split(',')[0] || "Madrid";

    // 2. [NUEVO]: Análisis Visual y Filtro de Privacidad
    let visualContext = "";
    if (image_base64) {
      const privacyPrompt = `
        Analiza esta imagen para una plataforma de urbanismo.
        REGLA CRÍTICA: Si hay rostros de personas identificables o primeros planos de gente, responde {"status": "REJECTED", "reason": "Faces detected"}.
        Si la imagen es solo de la ciudad, monumentos o paisajes urbanos, responde {"status": "APPROVED", "summary": "Descripción corta de lo que ves"}.
        Responde SOLO en JSON.
      `;

      const aiResponse = await callGeminiMultimodal(privacyPrompt, image_base64, AI_MODELS.FLASH);
      const privacyCheck = parseAIJson<any>(aiResponse);

      if (privacyCheck.status === 'REJECTED') {
        return new Response(JSON.stringify({
          success: false,
          error: "PRIVACY_VIOLATION",
          reason: "La imagen contiene rostros humanos. Por favor, captura solo el entorno urbano."
        }), { status: 403, headers: corsHeaders });
      }
      visualContext = privacyCheck.summary;
    }

    // 3. Persistencia en Staging
    const { data: draft } = await supabase.from('geo_drafts_staging').insert({
      user_id: user.id,
      location: `POINT(${lng} ${lat})`,
      detected_place_id: placeName,
      weather_snapshot: weather,
      vision_analysis: { summary: visualContext },
      status: 'scanning'
    }).select('id').single();

    return new Response(JSON.stringify({
      success: true,
      draft_id: draft?.id,
      dossier: { weather, detected_place: { name: placeName }, visual_summary: visualContext }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});