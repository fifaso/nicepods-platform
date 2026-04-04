/**
 * ARCHIVO: supabase/functions/geo-sensor-ingestor/index.ts
 * VERSIÓN: 3.0 (NicePod Sovereign Ingestor - Multidimensional & Grounding Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Peritaje técnico de evidencia física mediante inteligencia artificial, 
 * realizando validación cruzada entre imágenes, épocas históricas y fuentes externas.
 * [REFORMA V3.0]: Integración de Taxonomía de 2 capas, Reloj Soberano, Grounding 
 * por URL y migración al Protocolo Lightning (Fetch de Binarios).
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

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

const supabaseAdministrator: SupabaseClient = createClient(
  SUPABASE_URL ?? "",
  SERVICE_ROLE_KEY ?? ""
);

/**
 * INTERFAZ: IngestorMultidimensionalPayload
 * El contrato de datos V4.0 para el peritaje urbano.
 */
interface IngestorMultidimensionalPayload {
  heroImageUrl: string;       // Ruta pública del binario principal
  ocrImageUrls: string[];     // Rutas públicas del mosaico de detalle
  adminIntent: string;        // Semilla cognitiva fusionada (Voz + Texto)
  categoryMission: string;    // Taxonomía Nivel 1 (Misión)
  categoryEntity: string;     // Taxonomía Nivel 2 (Entidad)
  historicalEpoch: string;    // Coordenada temporal
  referenceUrl?: string;      // Puente de Sabiduría (Grounding)
  latitude: number;           
  longitude: number;          
  accuracy: number;           
  userId: string;             // Autoridad de Siembra
}

/**
 * UTILIDAD: fetchImageAsBase64
 * Misión: Descargar los binarios desde el Storage para transmitirlos al Oráculo.
 */
async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`STORAGE_FETCH_FAIL: Imposible adquirir binario en ${imageUrl}`);
  const arrayBuffer = await response.arrayBuffer();
  // Convertimos a base64 puro para el payload de Gemini
  const binary = String.fromCharCode(...new Uint8Array(arrayBuffer));
  return btoa(binary);
}

/**
 * ---------------------------------------------------------------------------
 * II. MOTOR DE PERITAJE (EL HANDLER SOBERANO)
 * ---------------------------------------------------------------------------
 */
serve(async (request: Request) => {
  // 1. GESTIÓN DE PROTOCOLO CORS
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const correlationId = crypto.randomUUID();
  console.info(`🧠 [Sensor-Ingestor][${correlationId}] Iniciando peritaje multidimensional V4.0.`);

  try {
    // 2. VALIDACIÓN DE AUTORIDAD
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader?.includes(SERVICE_ROLE_KEY ?? "INTERNAL_ZONE_ONLY")) {
      return new Response(JSON.stringify({ error: "UNAUTHORIZED_SENSORY_INPUT" }), {
        status: 401, headers: corsHeaders
      });
    }

    if (!GOOGLE_API_KEY) throw new Error("GOOGLE_AI_API_KEY_MISSING");

    // 3. DESEMPAQUETADO DEL EXPEDIENTE
    const payload: IngestorMultidimensionalPayload = await request.json();
    const {
      heroImageUrl,
      ocrImageUrls = [],
      adminIntent,
      categoryMission,
      categoryEntity,
      historicalEpoch,
      referenceUrl,
      latitude,
      longitude,
      accuracy,
      userId
    } = payload;

    // 4. ADQUISICIÓN DE BINARIOS (Protocolo Lightning)
    console.info(`   > Adquiriendo binarios visuales para análisis forense...`);
    const [heroBase64, ...ocrBase64Array] = await Promise.all([
      fetchImageAsBase64(heroImageUrl),
      ...ocrImageUrls.map(url => fetchImageAsBase64(url))
    ]);

    /**
     * 5. INGENIERÍA DE PROMPT MULTIDIMENSIONAL
     * Instruimos al Agente 42 para realizar una validación cruzada total.
     */
    const systemInstruction = `
      Actúa como un Perito de Inteligencia Urbana especializado en Madrid. 
      Tu misión es extraer la Verdad Física y el Capital Intelectual de este lugar.
      
      DOGMA: "Witness, Not Diarist". Sé técnico, preciso y riguroso.
      
      CONTEXTO SOBERANO:
      - Misión del Nodo: ${categoryMission.replace('_', ' ')}
      - Entidad Clasificada: ${categoryEntity.replace('_', ' ')}
      - Época Histórica de Referencia: ${historicalEpoch.replace('_', ' ')}
      - Fuente de Verdad Externa: ${referenceUrl || "No proporcionada"}
      - Intención del Curador: "${adminIntent}"
      
      TAREAS DE PERITAJE:
      1. Identifica el nombre oficial verificado del hito (Usa el OCR como autoridad).
      2. Valida si la arquitectura/entorno coincide con la Época Histórica proporcionada.
      3. Si hay una Fuente de Verdad (URL), contrasta la evidencia visual con los hechos conocidos de ese link.
      4. Describe el estilo técnico, materiales y atmósfera urbana.
      5. Genera un "Resumen de Grounding" indicando si la evidencia confirma o contradice la intención del curador.

      RESPONDE EXCLUSIVAMENTE EN ESTE FORMATO JSON:
      {
        "officialName": "Nombre verificado",
        "architectureStyle": "Descripción técnica de materiales, forma y estilo",
        "historicalDossier": "Puntos clave detectados sintonizados con la época",
        "atmosphere": "Análisis de la luz y resonancia del entorno",
        "detectedElements": ["lista", "de", "elementos", "vistos"],
        "groundingVerification": "Resumen de validación entre foto, época y link",
        "confidenceScore": 0.0 a 1.0
      }
    `;

    // 6. ENSAMBLAJE MULTIMODAL (Gemini 3.0 Flash Preview)
    const geminiParts = [
      { text: systemInstruction },
      { inline_data: { mime_type: "image/jpeg", data: heroBase64 } }
    ];

    ocrBase64Array.forEach((base64Data) => {
      geminiParts.push({ inline_data: { mime_type: "image/jpeg", data: base64Data } });
    });

    /**
     * 7. INVOCACIÓN AL ORÁCULO
     */
    console.info(`   > Despertando Oráculo: ${AI_MODELS.PRO}. Procesando Malla V4.0...`);

    const googleAIResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.PRO}:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: geminiParts }],
          generationConfig: {
            temperature: 0.12, // Rigor pericial máximo
            response_mime_type: "application/json"
          }
        })
      }
    );

    if (!googleAIResponse.ok) {
      const errorText = await googleAIResponse.text();
      throw new Error(`AI_GATEWAY_FAILURE: ${googleAIResponse.status} - ${errorText}`);
    }

    const aiData = await googleAIResponse.json();
    const rawAnalysisText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawAnalysisText) throw new Error("AI_RESPONSE_EMPTY");

    const analysis = parseAIJson<any>(rawAnalysisText);

    /**
     * 8. MATERIALIZACIÓN EN EL METAL (POSTGRESQL)
     * Realizamos la siembra atómica del nodo con su nueva taxonomía.
     */
    console.info(`   > Análisis validado. Anclando sabiduría en Bóveda: ${analysis.officialName}`);

    // Inserción en Tabla Maestra (POI) con soporte V4.0
    const { data: pointOfInterest, error: pointOfInterestError } = await supabaseAdministrator
      .from('points_of_interest')
      .insert({
        author_id: userId,
        name: analysis.officialName || "Nodo No Identificado",
        category_mission: categoryMission, // Nueva Taxonomía
        category_entity: categoryEntity,   // Nueva Taxonomía
        historical_epoch: historicalEpoch, // Coordenada Temporal
        geo_location: `POINT(${longitude} ${latitude})`,
        status: 'ingested',
        importance_score: Math.round(analysis.confidenceScore * 10) || 1,
        metadata: {
          external_source_url: referenceUrl,
          grounding_summary: analysis.groundingVerification
        }
      })
      .select('id')
      .single();

    if (pointOfInterestError) throw new Error(`DB_POI_INSERT_FAIL: ${pointOfInterestError.message}`);

    // Registro en el Buffer de Ingesta para trazabilidad de auditoría
    await supabaseAdministrator
      .from('poi_ingestion_buffer')
      .insert({
        poi_id: pointOfInterest.id,
        raw_ocr_text: analysis.historicalDossier,
        visual_analysis_dossier: {
          ...analysis,
          admin_original_intent: adminIntent,
          processing_trace_id: correlationId
        },
        sensor_accuracy: accuracy
      });

    console.info(`✅ [Sensor-Ingestor] Misión Completada. Nodo #${pointOfInterest.id} sintonizado.`);

    // 9. RESPUESTA SOBERANA AL FRONTEND
    return new Response(JSON.stringify({
      success: true,
      data: {
        poiId: pointOfInterest.id,
        analysis,
        location: {
          poiName: analysis.officialName,
          coordinates: [longitude, latitude]
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
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Grounding Sovereignty: La IA ya no solo describe lo que ve, sino que valida 
 *    la coherencia entre la imagen y la época histórica reportada, actuando como 
 *    un perito real que previene "anacronismos" en la Bóveda NKV.
 * 2. Payload Optimization: Al mover el 'fetch' de las imágenes a la Edge Function, 
 *    hemos liberado el ancho de banda del Voyager, permitiendo una experiencia 
 *    de carga instantánea en el dispositivo móvil.
 * 3. Structured Data: La inyección de category_mission y category_entity en la DB 
 *    habilita filtros de búsqueda avanzada en el Radar (Fase 6).
 */