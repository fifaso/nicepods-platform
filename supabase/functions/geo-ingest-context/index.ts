// supabase/functions/geo-suite/ingest-context/index.ts
// Misión: Recibir coordenadas, consultar clima y mapas, preparar el terreno.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCurrentWeather } from "../geo-shared/open-meteo.ts";
import { ContextDossier } from "../geo-shared/types.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // 1. Setup
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 2. Parseo de Input (Validación estricta de coordenadas)
    const { lat, lng, heading, altitude, image_base64 } = await req.json();

    if (!lat || !lng) {
      return new Response(JSON.stringify({ error: "GPS Coordinates required for Local Mode" }), { status: 400, headers: corsHeaders });
    }

    // 3. Sensor Fusion (Paralelización de llamadas externas)
    // Lanzamos Clima y Mapas a la vez para velocidad.
    const [weather, placeData] = await Promise.all([
      getCurrentWeather(lat, lng),
      reverseGeocodeNominatim(lat, lng) // Usamos OSM (gratis) por ahora
    ]);

    // 4. Consulta a la Bóveda de Madrid (RAG Vectorial)
    // Buscamos si hay hechos históricos en un radio de 100m
    const { data: vaultFacts } = await supabase.rpc('search_madrid_vault', {
      query_embedding: [], // (TODO: Aquí iría el embedding del nombre del lugar)
      match_threshold: 0.7,
      match_count: 3
    });

    // 5. Construcción del Dossier
    const dossier: ContextDossier = {
      trace_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      user_id: "system_temp", // Se actualizará al guardar con el token real
      location: { lat, lng, altitude, heading },
      weather: weather,
      detected_place: {
        id: "osm_" + Date.now(),
        name: placeData.display_name,
        category: placeData.type,
        distance_meters: 0,
        confidence: 0.9
      },
      historical_facts: vaultFacts ? vaultFacts.map((f: any) => f.content) : [],
      active_events: [],
      stage: 'raw_ingest'
    };

    // 6. Guardado en Staging (La tabla que creamos en el SQL anterior)
    // Nota: Necesitamos el User ID del token JWT
    const authHeader = req.headers.get('Authorization')!;
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData } = await userClient.auth.getUser();
    if (userData.user) {
      dossier.user_id = userData.user.id;

      // Guardamos en la tabla SQL
      await supabase.from('geo_drafts_staging').insert({
        user_id: userData.user.id,
        location: `POINT(${lng} ${lat})`, // Formato PostGIS
        altitude: altitude,
        heading: heading,
        detected_place_id: dossier.detected_place.id,
        weather_snapshot: dossier.weather,
        status: 'scanning'
      });
    }

    return new Response(JSON.stringify({ success: true, dossier }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});

// Helper simple para OSM (Nominatim)
async function reverseGeocodeNominatim(lat: number, lng: number) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
      headers: { 'User-Agent': 'NicePod-GeoSuite/1.0' }
    });
    return await res.json();
  } catch {
    return { display_name: "Ubicación desconocida", type: "unknown" };
  }
}