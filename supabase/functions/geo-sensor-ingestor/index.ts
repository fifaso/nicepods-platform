// supabase/functions/geo-sensor-ingestor/index.ts
// VERSIÓN: 2.1 (NicePod Sovereign Ingestor - Tolerant & Multimodal Pro Edition)
// Misión: Peritaje técnico de evidencia física (Hero + OCR Opcional) y anclaje atómico.
// [ESTABILIZACIÓN]: Resolución de desalineación de Payload y soporte para Mosaico Vacío.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AI_MODELS, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * ---------------------------------------------------------------------------
 * I. CONFIGURACIÓN DE INFRAESTRUCTURA (EL METAL)
 * ---------------------------------------------------------------------------
 */
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

// Cliente con privilegios absolutos para inyectar datos ignorando RLS
const supabaseAdmin: SupabaseClient = createClient(
  SUPABASE_URL ?? "",
  SERVICE_ROLE_KEY ?? ""
);

/**
 * INTERFAZ: IngestorPayload (El Contrato V2.1)
 * [FIX CRÍTICO]: Se han aplanado las coordenadas para coincidir exactamente 
 * con la estructura que envía el `actions/geo-actions.ts`.
 */
interface IngestorPayload {
  heroImage: string;    // URL pública obligatoria
  ocrImages?: string[]; // Array opcional de URLs (Mosaico)
  adminIntent: string;  // Intención dictada o escrita
  latitude: number;     // Coordenada plana
  longitude: number;    // Coordenada plana
  accuracy: number;     // Precisión en metros
  categoryId: string;
  userId: string;       // Autoridad de Siembra
}

/**
 * ---------------------------------------------------------------------------
 * II. MOTOR DE PERITAJE (EL HANDLER)
 * ---------------------------------------------------------------------------
 */
serve(async (req: Request) => {
  // 1. GESTIÓN DE PROTOCOLO CORS (Preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const correlationId = crypto.randomUUID();
  console.info(`🧠 [Sensor-Ingestor][${correlationId}] Iniciando peritaje visual.`);

  try {
    // 2. VALIDACIÓN DE AUTORIDAD (Trusted System Protocol)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.includes(SERVICE_ROLE_KEY ?? "INTERNAL_ZONE_ONLY")) {
      console.warn(`🛑 [Sensor-Ingestor][${correlationId}] Intento de acceso no autorizado.`);
      return new Response(JSON.stringify({ error: "UNAUTHORIZED_SENSORY_INPUT" }), {
        status: 401, headers: corsHeaders
      });
    }

    if (!GOOGLE_API_KEY) throw new Error("GOOGLE_AI_API_KEY_MISSING");

    // 3. DESEMPAQUETADO TOLERANTE DE EVIDENCIA
    const payloadText = await req.text();
    if (!payloadText) throw new Error("EMPTY_PAYLOAD");

    const payload: IngestorPayload = JSON.parse(payloadText);
    const {
      heroImage,
      ocrImages = [], // Fallback a array vacío si no se envían placas
      adminIntent,
      latitude,
      longitude,
      accuracy,
      categoryId,
      userId
    } = payload;

    // [VALIDACIÓN ESTRICTA V2.1]: Solo exigimos lo vital.
    if (!heroImage || !latitude || !longitude || !userId) {
      console.error(`📦 Payload recibido:`, JSON.stringify(payload));
      throw new Error("INCOMPLETE_EVIDENCE_DOSSIER: Faltan coordenadas, autor o imagen principal.");
    }

    /**
     * 4. INGENIERÍA DE PROMPT MULTIMODAL (EL ANALISTA URBANO)
     * Instruimos al Agente 42 (Versión Visión) para que sea tolerante.
     */
    const systemPrompt = `
      Actúa como un Analista de Inteligencia Urbana especializado en Madrid. 
      Tu misión es extraer la verdad física de este lugar basándote en las imágenes y la intención del curador.
      
      EVIDENCIA PROPORCIONADA:
      - Imagen Principal (Hero): Vista general del hito.
      - Imágenes de Detalle (OCR): [${ocrImages.length > 0 ? "Sí" : "No"}] (Placas o inscripciones si existen).
      - Intención del Curador: "${adminIntent}"
      
      TAREAS DE PERITAJE:
      1. Identifica el nombre del hito. Si hay texto legible en las imágenes, úsalo. Si no, deduce el nombre por el estilo arquitectónico o el contexto de la intención.
      2. Describe el estilo arquitectónico o los elementos botánicos de forma técnica.
      3. Extrae hechos históricos o datos clave presentes en la evidencia visual.
      4. Analiza la atmósfera (luz, materiales, entorno).

      RESPONDE EXCLUSIVAMENTE EN ESTE FORMATO JSON:
      {
        "officialName": "Nombre verificado",
        "architectureStyle": "Descripción técnica de materiales y forma",
        "historicalDossier": "Puntos clave detectados en la imagen o el texto",
        "atmosphere": "Análisis de la luz y entorno",
        "detectedElements": ["lista", "de", "elementos", "vistos"],
        "confidenceScore": 0.0 a 1.0
      }
    `;

    /**
     * 5. INVOCACIÓN AL MOTOR DE ÚLTIMA GENERACIÓN (Gemini 3.0 Flash Preview)
     * Descargamos las URLs del Storage para enviarlas como Base64 al modelo.
     */
    console.info(`   > Mosaico detectado: 1 Hero + ${ocrImages.length} Detalles. Solicitando análisis a ${AI_MODELS.PRO}...`);

    const downloadImage = async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`STORAGE_FETCH_FAIL: No se pudo leer la imagen de Supabase (${res.status})`);
      const blob = await res.arrayBuffer();
      return btoa(String.fromCharCode(...new Uint8Array(blob)));
    };

    // Descarga paralela de todas las evidencias disponibles
    const [heroBase64, ...ocrBase64Array] = await Promise.all([
      downloadImage(heroImage),
      ...ocrImages.map(url => downloadImage(url))
    ]);

    // Ensamblaje del Payload Multimodal
    const parts: any[] = [
      { text: systemPrompt },
      { inline_data: { mime_type: "image/jpeg", data: heroBase64 } }
    ];

    // Inyectamos las fotos de placas solo si existen
    ocrBase64Array.forEach(data => {
      parts.push({ inline_data: { mime_type: "image/jpeg", data } });
    });

    const googleResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.PRO}:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.15, // Baja temperatura para análisis forense estricto
            response_mime_type: "application/json"
          }
        })
      }
    );

    if (!googleResponse.ok) {
      const errorDetail = await googleResponse.text();
      throw new Error(`AI_VISION_FAIL: ${googleResponse.status} - ${errorDetail}`);
    }

    const aiData = await googleResponse.json();
    if (!aiData.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("AI_RESPONSE_EMPTY: El modelo de visión no devolvió datos.");
    }

    // Utilizamos nuestra utilidad centralizada para extraer el JSON seguro
    const analysis = parseAIJson<any>(aiData.candidates[0].content.parts[0].text);

    /**
     * 6. MATERIALIZACIÓN EN EL METAL (POSTGRESQL)
     * Realizamos la inserción atómica del punto en estado 'ingested'.
     */
    console.info(`   > Análisis exitoso. Anclando nodo: ${analysis.officialName}`);

    // A. Inserción en Tabla Maestra (POI)
    const { data: poi, error: poiError } = await supabaseAdmin
      .from('points_of_interest')
      .insert({
        author_id: userId,
        name: analysis.officialName || "Nodo No Identificado",
        category_id: categoryId,
        geo_location: `POINT(${longitude} ${latitude})`, // Rigor PostGIS
        status: 'ingested',
        gallery_urls: [heroImage, ...ocrImages],
        importance_score: 1
      })
      .select('id')
      .single();

    if (poiError) throw new Error(`DB_POI_INSERT_FAIL: ${poiError.message}`);

    // B. Inserción en Buffer de Ingesta (Detalle Técnico)
    const { error: bufferError } = await supabaseAdmin
      .from('poi_ingestion_buffer')
      .insert({
        poi_id: poi.id,
        raw_ocr_text: analysis.historicalDossier,
        visual_analysis_dossier: {
          ...analysis,
          admin_original_intent: adminIntent
        },
        sensor_accuracy: accuracy
      });

    if (bufferError) console.error("⚠️ [Sensor-Ingestor] Error no crítico al guardar en Buffer:", bufferError.message);

    console.info(`✅ [Sensor-Ingestor][${correlationId}] Misión de Ingesta Completada. Nodo #${poi.id}`);

    // 7. RESPUESTA SOBERANA AL FRONTEND
    return new Response(JSON.stringify({
      success: true,
      data: {
        poiId: poi.id,
        analysis,
        location: {
          poiName: analysis.officialName,
          coordinates: [longitude, latitude] // Devolvemos para verificación en UI
        }
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error: any) {
    console.error(`🔥 [Sensor-Ingestor-Fatal][${correlationId}]:`, error.message);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      trace_id: correlationId
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.1):
 * 1. Resiliencia de Payload: Al aplanar 'latitude' y 'longitude' en la raíz 
 *    del payload, eliminamos la fragilidad del objeto anidado 'location' que 
 *    causaba el error INCOMPLETE_EVIDENCE_DOSSIER.
 * 2. Tolerancia Cero-OCR: La línea 64 asigna un array vacío por defecto a 
 *    'ocrImages'. Si el Administrador no sube placas, el sistema no falla, 
 *    simplemente omite ese paso en la inyección multimodal.
 * 3. Descarga Segura: Se ha añadido un control de errores (res.ok) en la 
 *    descarga de imágenes desde Supabase Storage para evitar que URLs muertas 
 *    corrompan la invocación de Gemini.
 */