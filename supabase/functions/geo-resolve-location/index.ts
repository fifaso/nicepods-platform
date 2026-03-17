// supabase/functions/geo-resolve-location/index.ts
// VERSIÓN: 3.0 (NicePod Sovereign Radar - Auto-Resolver Edition)
// Misión: Sintonía de telemetría física (Coordenadas -> Identidad & Clima).
// [ESTABILIZACIÓN]: Paralelismo de APIs externas y sanitización de respuesta para HUD V2.6.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * CONFIGURACIÓN DE INFRAESTRUCTURA TÉCNICA
 * Los tokens deben estar configurados en el Dashboard de Supabase (Edge Functions > Secrets).
 */
const MAPBOX_TOKEN = Deno.env.get("NEXT_PUBLIC_MAPBOX_TOKEN");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

/**
 * INTERFAZ: LocationPayload
 * Contrato de entrada estricto emitido por geo-actions.ts
 */
interface LocationPayload {
  latitude: number;
  longitude: number;
}

/**
 * handler: El motor de resolución geoespacial (Fase 0).
 */
serve(async (req: Request) => {
  // 1. PROTOCOLO DE NEGOCIACIÓN CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const correlationId = crypto.randomUUID();
  console.info(`🛰️ [Geo-Resolve][${correlationId}] Iniciando Triangulación de Radar.`);

  try {
    // 2. BLINDAJE SOBERANO (LITE-SECURITY)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.includes(SERVICE_ROLE_KEY ?? "SECURE_ZONE")) {
      console.warn(`🛑 [Geo-Resolve][${correlationId}] Acceso perimetral denegado.`);
      return new Response(JSON.stringify({ error: "UNAUTHORIZED_RADAR_ACCESS" }), {
        status: 401, headers: corsHeaders
      });
    }

    if (!MAPBOX_TOKEN) {
      throw new Error("MAPBOX_TOKEN_MISSING: El motor cartográfico está ciego.");
    }

    // 3. DESEMPAQUETADO DE PAYLOAD
    const payloadText = await req.text();
    if (!payloadText) throw new Error("PAYLOAD_EMPTY");

    const { latitude, longitude }: LocationPayload = JSON.parse(payloadText);

    if (!latitude || !longitude) {
      throw new Error("COORDINATES_MISSING: La telemetría GPS está corrupta.");
    }

    /**
     * 4. FAN-OUT SENSORIAL (Ejecución Concurrente)
     * Optimizamos el TTFB disparando las peticiones externas al unísono.
     */
    console.info(`   > Mapeando coordenadas: [${longitude.toFixed(4)}, ${latitude.toFixed(4)}]`);

    const [geoRes, weatherRes] = await Promise.all([
      // API 1: Identidad Cartográfica (Mapbox Reverse Geocoding)
      // Buscamos prioritariamente 'poi' (Puntos de Interés) o 'address'.
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&types=poi,address,place&limit=1&language=es`),

      // API 2: Atmósfera Física (Open-Meteo V1)
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,is_day,weather_code&timezone=auto`)
    ]);

    if (!geoRes.ok) throw new Error(`MAPBOX_FAIL: ${geoRes.statusText}`);
    if (!weatherRes.ok) throw new Error(`METEO_FAIL: ${weatherRes.statusText}`);

    // 5. EXTRACCIÓN DE IDENTIDAD NOMINATIVA
    const geoData = await geoRes.json();
    const feature = geoData.features?.[0];

    // Lógica de cascada para asegurar que el HUD siempre tenga un nombre útil
    const poiName = feature?.text || "Desconocido (Anclaje Manual Requerido)";
    const fullAddress = feature?.place_name || "Coordenadas Nómadas";
    const cityName = feature?.context?.find((c: any) => c.id.startsWith('place'))?.text || "Madrid";

    // 6. EXTRACCIÓN DE VIBE ATMOSFÉRICO
    const weatherData = await weatherRes.json();
    const current = weatherData.current;

    // Traducción de código WMO a sintaxis NicePod
    const getAtmosphereVibe = (code: number) => {
      if (code === 0) return "Cielo Despejado";
      if (code <= 3) return "Nubes Bajas";
      if (code <= 48) return "Bruma";
      if (code <= 67) return "Lluvia Fina";
      if (code <= 82) return "Tormenta";
      return "Atmósfera Densa";
    };

    // 7. ENSAMBLAJE DE DOSSIER (FASE 0)
    const initialDossier = {
      place: {
        poiName,
        cityName,
        fullAddress,
        coordinates: { lat: latitude, lng: longitude }
      },
      weather: {
        temp_c: current?.temperature_2m ? Math.round(current.temperature_2m) : undefined,
        condition: getWeatherVibe(current?.weather_code || 0),
        is_day: current?.is_day === 1,
      },
      timestamp: new Date().toISOString()
    };

    console.info(`✅ [Geo-Resolve][${correlationId}] Identidad resuelta: ${poiName}`);

    // 8. RETORNO SOBERANO
    return new Response(JSON.stringify({
      success: true,
      status: 'RADAR_SYNCED',
      data: initialDossier
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Eficiencia Cero-Estado: Esta función no toca la base de datos de Supabase. 
 *    Simplemente actúa como un traductor entre las coordenadas crudas y las 
 *    APIs de servicios, manteniendo su consumo de RAM y CPU al mínimo absoluto.
 * 2. Fallbacks de Autoridad: Si Mapbox devuelve un lugar sin nombre ('text' vacío), 
 *    el sistema devuelve 'Desconocido (Anclaje Manual Requerido)'. Esto es vital 
 *    para que la interfaz del Step 1 alerte al Admin de que debe usar el 
 *    'Manual Name Override' que implementamos.
 */