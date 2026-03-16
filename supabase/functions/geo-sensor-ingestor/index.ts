// supabase/functions/geo-sensor-ingestor/index.ts
// VERSIÓN: 1.0 (NicePod V2.6 - Sovereign Ingestion Engine)
// Misión: Capturar y destilar evidencia física en la malla urbana de Madrid.
// [ESTABILIZACIÓN]: Separación total de la narrativa y optimización de RAM.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeaders } from "../_shared/cors.ts";

// --- CONFIGURACIÓN DE INTELIGENCIA INDUSTRIAL ---
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
const GEMINI_MODEL = "gemini-1.5-flash";
const MAPBOX_TOKEN = Deno.env.get("NEXT_PUBLIC_MAPBOX_TOKEN");

const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * INTERFAZ: IngestionPayload
 * Basada estrictamente en POIIngestionSchema (lib/validation/poi-schema.ts)
 */
interface IngestionPayload {
  latitude: number;
  longitude: number;
  accuracy: number;
  heroImage: string; // Base64
  ocrImage?: string; // Base64 opcional
  categoryId: string;
  resonanceRadius: number;
  adminIntent: string;
}

serve(async (req: Request) => {
  // 1. PROTOCOLO CORS
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const correlationId = crypto.randomUUID();
  console.info(`🛰️ [Sensor-Ingestor][${correlationId}] Iniciando captura multimodal.`);

  try {
    // 2. VALIDACIÓN DE AUTORIDAD (ADMIN ONLY)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("AUTH_HEADER_MISSING");

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user || user.app_metadata.user_role !== 'admin') {
      console.warn(`🛑 [Unauthorized Access Attempt]: ID ${user?.id || 'Unknown'}`);
      return new Response(JSON.stringify({ error: "SOVEREIGN_ACCESS_REQUIRED" }), {
        status: 403, headers: corsHeaders
      });
    }

    // 3. RECEPCIÓN Y SANEAMIENTO DE PAYLOAD
    const payload: IngestionPayload = await req.json();
    const { latitude, longitude, heroImage, ocrImage, adminIntent, categoryId, resonanceRadius } = payload;

    /**
     * 4. COSECHA DE INTELIGENCIA AMBIENTAL (PARALELA)
     */
    const [geoRes, weatherRes] = await Promise.all([
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&types=poi,address&limit=1&language=es`),
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,is_day,weather_code&timezone=auto`)
    ]);

    const geoData = await geoRes.json();
    const weatherData = await weatherRes.json();

    const detectedPlaceName = geoData.features?.[0]?.text || "Nodo de Resonancia Desconocido";
    const currentTemp = weatherData.current?.temperature_2m;
    const weatherCode = weatherData.current?.weather_code;

    /**
     * 5. AUDITORÍA VISUAL MULTIMODAL (IA)
     * Enviamos ambas imágenes para que la IA entienda la relación entre el lugar y la placa.
     */
    const prompt = `
      Actúa como un 'Ingeniero de Datos Urbanos'. Analiza la evidencia del lugar: "${detectedPlaceName}".
      
      DOGMA: "Witness, Not Diarist". Sé técnico y objetivo.
      
      REQUERIMIENTOS:
      1. Extrae TODO el texto de la placa (imagen OCR) con precisión quirúrgica.
      2. Analiza la imagen Hero para describir el estilo arquitectónico y elementos clave.
      3. Valida si la intención del administrador coincide con la evidencia: "${adminIntent}".
      
      RESPONDE ÚNICA Y EXCLUSIVAMENTE EN JSON:
      {
        "isValid": boolean,
        "ocrText": "string",
        "officialName": "string",
        "architectureStyle": "string",
        "atmosphere": "string",
        "detectedElements": ["string"]
      }
    `;

    const aiParts: any[] = [{ text: prompt }];
    aiParts.push({ inline_data: { mime_type: "image/jpeg", data: heroImage.split(",")[1] || heroImage } });
    if (ocrImage) {
      aiParts.push({ inline_data: { mime_type: "image/jpeg", data: ocrImage.split(",")[1] || ocrImage } });
    }

    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: aiParts }],
          generationConfig: { temperature: 0.1, response_mime_type: "application/json" }
        })
      }
    );

    const aiJson = await aiResponse.json();
    const analysis = JSON.parse(aiJson.candidates[0].content.parts[0].text);

    /**
     * 6. PERSISTENCIA EN EL METAL (TRANSACTION-LIKE)
     */
    const pointString = `POINT(${longitude} ${latitude})`;

    // A. Insertar POI Principal (Estado: Ingested)
    const { data: poi, error: poiError } = await supabaseAdmin
      .from('points_of_interest')
      .insert({
        author_id: user.id,
        name: analysis.officialName || detectedPlaceName,
        category_id: categoryId,
        geo_location: pointString,
        resonance_radius: resonanceRadius,
        status: 'ingested',
        is_published: false
      })
      .select('id')
      .single();

    if (poiError) throw poiError;

    // B. Llenar el Buffer de Ingesta con el Dossier
    const { error: bufferError } = await supabaseAdmin
      .from('poi_ingestion_buffer')
      .insert({
        poi_id: poi.id,
        raw_ocr_text: analysis.ocrText,
        sensor_accuracy: payload.accuracy,
        weather_snapshot: {
          temp_c: currentTemp,
          condition_code: weatherCode,
          is_day: weatherData.current?.is_day === 1
        },
        visual_analysis_dossier: {
          architecture: analysis.architectureStyle,
          atmosphere: analysis.atmosphere,
          elements: analysis.detectedElements,
          admin_original_intent: adminIntent
        }
      });

    if (bufferError) throw bufferError;

    console.info(`✅ [Sensor-Ingestor][${correlationId}] Nodo anclado exitosamente. POI ID: ${poi.id}`);

    // 7. RESPUESTA DE MISIÓN
    return new Response(JSON.stringify({
      success: true,
      message: "Captura sensorial finalizada. Dossier listo para narración.",
      data: {
        poiId: poi.id,
        analysis,
        location: { detectedPlaceName, currentTemp }
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error: any) {
    console.error(`🔥 [Sensor-Ingestor-Fatal][${correlationId}]:`, error.message);
    return new Response(JSON.stringify({ error: error.message, trace_id: correlationId }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Especialización: Esta función NO crea audios ni guiones. Se limita a 
 *    "mirar" y "anotar", lo que garantiza una latencia de respuesta mínima.
 * 2. Soberanía PostGIS: El uso de 'pointString' asegura que el dato entre 
 *    limpio al motor geográfico de la base de datos.
 * 3. Preparación para Auditoría Humana: El retorno del JSON permite que el 
 *    Administrador valide en el frontend si la IA leyó bien la placa antes 
 *    de pasar a la Fase de Creación Narrativa.
 */