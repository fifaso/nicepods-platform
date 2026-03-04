// supabase/functions/geo-resolve-location/index.ts
// VERSIÓN: 1.0

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * CONFIGURACIÓN DE INFRAESTRUCTURA
 * Recuperamos las llaves de sistema desde la Bóveda de Supabase (Vault).
 */
const MAPBOX_TOKEN = Deno.env.get("NEXT_PUBLIC_MAPBOX_TOKEN");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

/**
 * INTERFAZ: LocationPayload
 */
interface LocationPayload {
  latitude: number;
  longitude: number;
}

/**
 * handler: Ejecución determinista de alta velocidad.
 */
serve(async (req) => {
  // 1. PROTOCOLO CORS (Costo CPU: 0ms)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const correlationId = crypto.randomUUID();

  try {
    // 2. VALIDACIÓN DE SOBERANÍA (Lite Security)
    // Verificamos que la petición provenga de nuestra Server Action autorizada.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.includes(SERVICE_ROLE_KEY ?? "INTERNAL_ZONE")) {
      return new Response(JSON.stringify({ error: "Unauthorized access to Geo-Core" }), {
        status: 401,
        headers: corsHeaders
      });
    }

    // 3. DESEMPAQUETADO DE COORDENADAS
    const { latitude, longitude }: LocationPayload = await request.json();

    if (!latitude || !longitude) {
      throw new Error("COORDENADAS_INCOMPLETAS");
    }

    console.info(`🛰️ [Geo-Resolve][${correlationId}] Sintonizando Nodo en: ${latitude}, ${longitude}`);

    /**
     * 4. COSECHA DE DATOS EN PARALELO (CONCURRENCY)
     * Ejecutamos el Geocoding y el Clima simultáneamente para minimizar el TTFB.
     */
    const [geoRes, weatherRes] = await Promise.all([
      // A. Reverse Geocoding (Mapbox API)
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&types=poi,address,place&limit=1&language=es`),

      // B. Inteligencia Climática (Open-Meteo API - Free Tier Deterministic)
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,is_day,weather_code&timezone=auto`)
    ]);

    // 5. PROCESAMIENTO DE IDENTIDAD GEOGRÁFICA
    const geoData = await geoRes.json();
    const feature = geoData.features?.[0];

    const poiName = feature?.text || "Ubicación Desconocida";
    const fullAddress = feature?.place_name || "Madrid, España";
    const cityName = feature?.context?.find((c: any) => c.id.startsWith('place'))?.text || "Madrid";

    // 6. PROCESAMIENTO DE TELEMETRÍA CLIMÁTICA
    const weatherData = await weatherRes.json();
    const current = weatherData.current;

    /**
     * mapearEstadoClima:
     * Traduce los WMO Weather Codes a lenguaje natural para NicePod.
     */
    const weatherCondition = (code: number) => {
      if (code === 0) return "Cielo Despejado";
      if (code <= 3) return "Parcialmente Nublado";
      if (code <= 48) return "Niebla Atmosférica";
      if (code <= 67) return "Lluvia Ligera";
      return "Resonancia Pluvial";
    };

    const finalDossier = {
      place: {
        poiName,
        cityName,
        fullAddress,
      },
      weather: {
        temp_c: Math.round(current?.temperature_2m || 0),
        condition: weatherCondition(current?.weather_code || 0),
        is_day: current?.is_day === 1,
      },
      timestamp: new Date().toISOString(),
      trace_id: correlationId
    };

    console.info(`✅ [Geo-Resolve][${correlationId}] Nodo resuelto: ${poiName}`);

    // 7. RESPUESTA SOBERANA AL FRONTEND
    return new Response(JSON.stringify({
      success: true,
      status: 'LOCATION_RESOLVED',
      data: finalDossier
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error: any) {
    console.error(`🔥 [Geo-Resolve-Fatal][${correlationId}]:`, error.message);
    return new Response(JSON.stringify({
      error: error.message,
      trace_id: correlationId
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});