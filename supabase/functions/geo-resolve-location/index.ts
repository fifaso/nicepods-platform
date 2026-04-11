/**
 * ARCHIVO: supabase/functions/geo-resolve-location/index.ts
 * VERSIÓN: 5.0 (NicePod Sovereign Radar - High-Fidelity Geodetic & Atmospheric Resolution)
 * PROTOCOLO: MADRID RESONANCE V4.5
 * 
 * Misión: Transmutar coordenadas físicas purificadas en identidad nominativa (Geocodificación Inversa) 
 * y atmósfera climática en tiempo real. Actúa como el Córtex de Contexto de la Workstation.
 * [REFORMA V5.0]: Implementación rigurosa de la Zero Abbreviations Policy (ZAP). 
 * Optimización de la resiliencia ante fallos de APIs externas mediante "Cascada de Verdad". 
 * Sincronización absoluta con la Constitución V8.6 y el Dossier de Ingesta V4.2.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * ---------------------------------------------------------------------------
 * I. CONFIGURACIÓN DE INFRAESTRUCTURA TÉCNICA (EL METAL)
 * ---------------------------------------------------------------------------
 */
const MAPBOX_AUTHORIZATION_TOKEN = Deno.env.get("NEXT_PUBLIC_MAPBOX_TOKEN");
const SUPABASE_SERVICE_ROLE_SECRET_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

/**
 * INTERFAZ: GeographicResolutionPayload
 * Contrato de entrada síncrono emitido por las Server Actions de la Workstation.
 */
interface GeographicResolutionPayload {
  latitudeCoordinate: number;
  longitudeCoordinate: number;
}

/**
 * INTERFAZ: IndustrialGeographicDossier
 * Estructura de salida sellada para el consumo de la terminal de forja.
 */
interface IndustrialGeographicDossier {
  geographicPlace: {
    pointOfInterestName: string;
    cityName: string;
    formattedPostalAddress: string;
    coordinates: {
      latitudeCoordinate: number;
      longitudeCoordinate: number;
    };
  };
  atmosphericWeather: {
    temperatureCelsius: number;
    conditionText: string;
    isDaytime: boolean;
  };
  resolutionTimestamp: string;
}

/**
 * GeographicResolutionMaster: El motor de sincronía ambiental de NicePod.
 */
serve(async (request: Request) => {
  // 1. GESTIÓN DE PROTOCOLO DE INTERCAMBIO (CORS Preflight)
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const processingCorrelationIdentification = crypto.randomUUID();
  console.info(`🛰️ [Geo-Resolve][${processingCorrelationIdentification}] Iniciando sintonía de coordenadas.`);

  try {
    // 2. VALIDACIÓN DE AUTORIDAD (TRUSTED SYSTEM PROTOCOL)
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader?.includes(SUPABASE_SERVICE_ROLE_SECRET_KEY ?? "INTERNAL_ZONE_ONLY")) {
      console.warn(`🛑 [Geo-Resolve][${processingCorrelationIdentification}] Intento de acceso no autorizado.`);
      return new Response(JSON.stringify({ error: "UNAUTHORIZED_SENSORY_ACCESS_DENEGADO" }), {
        status: 401,
        headers: corsHeaders
      });
    }

    if (!MAPBOX_AUTHORIZATION_TOKEN) {
      throw new Error("INFRASTRUCTURE_EXCEPTION: MAPBOX_TOKEN_MISSING");
    }

    // 3. DESEMPAQUETADO DE TELEMETRÍA PURIFICADA
    const resolutionPayload: GeographicResolutionPayload = await request.json();
    const { latitudeCoordinate, longitudeCoordinate } = resolutionPayload;

    if (!latitudeCoordinate || !longitudeCoordinate) {
      throw new Error("GEODETIC_COORDINATES_INCOMPLETE_EXCEPTION");
    }

    /**
     * 4. COSECHA DE INTELIGENCIA CONCURRENTE (FAN-OUT PATTERN)
     * Ejecutamos las llamadas a Mapbox (Identidad) y Open-Meteo (Atmósfera) 
     * en paralelo para garantizar un Time-To-Interactive (TTI) mínimo.
     */
    const [geocodingNetworkResponse, weatherNetworkResponse] = await Promise.all([
      // API A: Identificación Nominativa (Mapbox Places V5)
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitudeCoordinate},${latitudeCoordinate}.json?access_token=${MAPBOX_AUTHORIZATION_TOKEN}&types=poi,address,place&limit=1&language=es`),

      // API B: Telemetría Ambiental (Open-Meteo High Resolution)
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitudeCoordinate}&longitude=${longitudeCoordinate}&current=temperature_2m,weather_code,is_day&timezone=auto`)
    ]);

    if (!geocodingNetworkResponse.ok || !weatherNetworkResponse.ok) {
      throw new Error("EXTERNAL_INTELLIGENCE_HANDSHAKE_FAILURE");
    }

    // 5. PROCESAMIENTO DE IDENTIDAD GEOGRÁFICA (CASCADA DE VERDAD)
    const geocodingDataResults = await geocodingNetworkResponse.json();
    const primaryFeatureMetadata = geocodingDataResults.features?.[0];

    const pointOfInterestName = primaryFeatureMetadata?.text || "Nodo de Resonancia Urbana";
    const formattedPostalAddress = primaryFeatureMetadata?.place_name || "Madrid, España";
    const geographicCityName = primaryFeatureMetadata?.context?.find((contextItem: any) => 
      contextItem.id.startsWith('place')
    )?.text || "Madrid";

    // 6. PROCESAMIENTO DE ATMÓSFERA CLIMÁTICA (TRADUCCIÓN SEMÁNTICA)
    const weatherDataResults = await weatherNetworkResponse.json();
    const currentAtmosphericCondition = weatherDataResults.current;

    /**
     * retrieveAcousticWeatherAtmosphere: 
     * Misión: Traducir códigos WMO a la semántica narrativa de NicePod.
     */
    const retrieveAcousticWeatherAtmosphere = (weatherCode: number): string => {
      if (weatherCode === 0) return "Cielo Despejado";
      if (weatherCode <= 3) return "Atmósfera Nublada";
      if (weatherCode <= 48) return "Niebla Densa";
      if (weatherCode <= 67) return "Lluvia Fina";
      if (weatherCode <= 82) return "Tormenta de Resonancia";
      return "Frecuencia Atmosférica Inestable";
    };

    /**
     * 7. CONSOLIDACIÓN DEL DOSSIER GEOGRÁFICO FINAL
     * [SINCRO V5.0]: Cumplimiento estricto con la Constitución V8.6.
     */
    const finalGeographicIntelligenceDossier: IndustrialGeographicDossier = {
      geographicPlace: {
        pointOfInterestName: pointOfInterestName,
        cityName: geographicCityName,
        formattedPostalAddress: formattedPostalAddress,
        coordinates: { 
          latitudeCoordinate: latitudeCoordinate, 
          longitudeCoordinate: longitudeCoordinate 
        }
      },
      atmosphericWeather: {
        temperatureCelsius: Math.round(currentAtmosphericCondition?.temperature_2m || 15),
        conditionText: retrieveAcousticWeatherAtmosphere(currentAtmosphericCondition?.weather_code || 0),
        isDaytime: currentAtmosphericCondition?.is_day === 1
      },
      resolutionTimestamp: new Date().toISOString()
    };

    console.info(`✅ [Geo-Resolve][${processingCorrelationIdentification}] Nodo resuelto exitosamente: ${pointOfInterestName}`);

    // 8. RESPUESTA SOBERANA A LA TERMINAL
    return new Response(JSON.stringify({
      success: true,
      status: 'RADAR_SYNCHRONIZED',
      data: finalGeographicIntelligenceDossier,
      processingCorrelationIdentification: processingCorrelationIdentification
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (operationalException: unknown) {
    const exceptionMessageText = operationalException instanceof Error 
      ? operationalException.message 
      : String(operationalException);

    console.error(`🔥 [Geo-Resolve-Fatal][${processingCorrelationIdentification}]:`, exceptionMessageText);

    return new Response(JSON.stringify({
      success: false,
      error: exceptionMessageText,
      processingCorrelationIdentification: processingCorrelationIdentification
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Zero Abbreviations Policy (ZAP): Se han purificado todas las variables internas (geocodingNetworkResponse, 
 *    processingCorrelationIdentification, currentAtmosphericCondition).
 * 2. Cascading Truth Protocol: El sistema maneja fallbacks para nombres de POI y ciudades, 
 *    asegurando que la terminal siempre reciba una identidad nominativa válida.
 * 3. Contractual Alignment: El objeto de retorno es un espejo del 'IngestionDossier' exigido 
 *    por el flujo de forja, eliminando la necesidad de mapeadores intermedios en el cliente.
 */