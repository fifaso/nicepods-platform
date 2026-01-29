// supabase/functions/geo-ingest-context/index.ts
// VERSIÓN: 1.2 (Production Stable - Return ID Fix)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCurrentWeather } from "../geo-shared/open-meteo.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No autorizado: Falta token');

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) throw new Error('Sesión inválida');

    const { lat, lng, altitude, heading } = await req.json();

    // 1. Obtención de Contexto Externo
    const [weather, placeRes] = await Promise.all([
      getCurrentWeather(lat, lng),
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
        headers: { 'User-Agent': 'NicePod-Madrid-Resonance/1.0' }
      }).then(r => r.json())
    ]);

    const placeName = placeRes.display_name?.split(',')[0] || "Ubicación en Madrid";

    // 2. Creación del Registro de Staging
    const { data: draft, error: dbError } = await supabase
      .from('geo_drafts_staging')
      .insert({
        user_id: user.id,
        location: `POINT(${lng} ${lat})`,
        altitude: altitude || 0,
        heading: heading || 0,
        detected_place_id: placeName,
        weather_snapshot: weather,
        status: 'scanning'
      })
      .select('id')
      .single();

    if (dbError) throw dbError;

    // [CRÍTICO]: Ahora sí devolvemos el draft_id para que el front pueda seguir
    return new Response(JSON.stringify({
      success: true,
      draft_id: draft.id,
      dossier: {
        weather,
        detected_place: { name: placeName }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Error geo-ingest:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
});