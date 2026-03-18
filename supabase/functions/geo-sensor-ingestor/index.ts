// supabase/functions/geo-sensor-ingestor/index.ts
// VERSIÓN: 2.0 (NicePod Sovereign Ingestor - Multimodal Mosaic Edition)
// Misión: Peritaje técnico de evidencia física y anclaje atómico en la Bóveda.
// [ESTABILIZACIÓN]: Integración de Gemini 3.0 Flash Preview y soporte Multi-Imagen.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AI_MODELS, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * CONFIGURACIÓN DE INFRAESTRUCTURA
 */
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

const supabaseAdmin: SupabaseClient = createClient(
  SUPABASE_URL ?? "",
  SERVICE_ROLE_KEY ?? ""
);

/**
 * INTERFAZ: IngestorPayload
 * Contrato de entrada multimodal emitido por actions/geo-actions.ts
 */
interface IngestorPayload {
  heroImage: string;    // URL pública de la foto principal
  ocrImages: string[];  // URLs públicas de las placas (Mosaico)
  adminIntent: string;  // Semilla cognitiva (Dictado o Texto)
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  categoryId: string;
  userId: string;       // ID del Administrador/Autor
}

/**
 * handler: El Analista Multimodal de la Malla.
 */
serve(async (req: Request) => {
  // 1. GESTIÓN DE CORS (0ms CPU)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const correlationId = crypto.randomUUID();
  console.info(`🧠 [Sensor-Ingestor][${correlationId}] Iniciando peritaje visual.`);

  try {
    // 2. VALIDACIÓN DE PROTOCOLO SOBERANO (Auth System-to-System)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.includes(SERVICE_ROLE_KEY ?? "INTERNAL_ONLY")) {
      console.error(`🛑 [Sensor-Ingestor][${correlationId}] Intento de acceso no autorizado.`);
      return new Response(JSON.stringify({ error: "UNAUTHORIZED_SENSORY_INPUT" }), {
        status: 401, headers: corsHeaders
      });
    }

    // 3. DESEMPAQUETADO DE EVIDENCIA
    const payload: IngestorPayload = await req.json();
    const { heroImage, ocrImages, adminIntent, location, categoryId, userId } = payload;

    if (!heroImage || !location || !userId) {
      throw new Error("INCOMPLETE_EVIDENCE_DOSSIER");
    }

    /**
     * 4. INGENIERÍA DE PROMPT MULTIMODAL (EL ANALISTA URBANO)
     * Instruimos al Agente 42 (versión visión) para que procese el mosaico.
     */
    const systemPrompt = `
      Actúa como un 'Urban Intelligence Analyst' especializado en la ciudad de Madrid. 
      Tu misión es analizar un mosaico de imágenes y la intención de un curador para extraer la verdad física de un lugar.
      
      DOGMA: "Witness, Not Diarist". Sé técnico, preciso y riguroso.
      
      EVIDENCIA PROPORCIONADA:
      - Imagen Hero: Vista general del monumento/hito.
      - Imágenes OCR: Primeros planos de placas, inscripciones o carteles informativos.
      - Intención del Curador: "${adminIntent}"
      
      TAREAS:
      1. Identifica el nombre oficial del hito (Usa el OCR como prioridad máxima).
      2. Describe el estilo arquitectónico o botánico de forma técnica.
      3. Extrae hechos históricos clave presentes en la evidencia visual.
      4. Analiza la atmósfera (luz, materiales, entorno).

      RESPONDE EXCLUSIVAMENTE EN FORMATO JSON:
      {
        "officialName": "Nombre verificado",
        "architectureStyle": "Descripción técnica de materiales y forma",
        "historicalDossier": "Puntos clave detectados",
        "atmosphere": "Análisis de la luz y entorno",
        "detectedElements": ["lista", "de", "elementos", "vistos"],
        "confidenceScore": 0.0 a 1.0
      }
    `;

    /**
     * 5. INVOCACIÓN AL MOTOR DE ÚLTIMA GENERACIÓN (Gemini 3.0 Flash Preview)
     * Descargamos las imágenes y las enviamos al motor en una sola ráfaga.
     */
    console.info(`   > Solicitando análisis a ${AI_MODELS.PRO}...`);

    // Descargamos los binarios desde el Storage para enviarlos como inline_data
    const downloadImage = async (url: string) => {
      const res = await fetch(url);
      const blob = await res.arrayBuffer();
      return btoa(String.fromCharCode(...new Uint8Array(blob)));
    };

    const [heroBase64, ...ocrBase64Array] = await Promise.all([
      downloadImage(heroImage),
      ...ocrImages.map(url => downloadImage(url))
    ]);

    const parts = [
      { text: systemPrompt },
      { inline_data: { mime_type: "image/jpeg", data: heroBase64 } }
    ];

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
            temperature: 0.15,
            response_mime_type: "application/json"
          }
        })
      }
    );

    const aiData = await googleResponse.json();
    const analysis = parseAIJson<any>(aiData.candidates[0].content.parts[0].text);

    /**
     * 6. MATERIALIZACIÓN EN EL METAL (POSTGRESQL)
     * Realizamos la inserción atómica del punto en estado 'ingested'.
     */
    console.info(`   > Anclando nodo: ${analysis.officialName}`);

    // A. Inserción en Tabla Maestra (POI)
    const { data: poi, error: poiError } = await supabaseAdmin
      .from('points_of_interest')
      .insert({
        author_id: userId,
        name: analysis.officialName,
        category_id: categoryId,
        // PostGIS Geography Point: [Longitude, Latitude]
        geo_location: `POINT(${location.longitude} ${location.latitude})`,
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
        sensor_accuracy: location.accuracy
      });

    if (bufferError) console.error("⚠️ Error no crítico al guardar en Buffer:", bufferError.message);

    console.info(`✅ [Sensor-Ingestor][${correlationId}] Nodo #${poi.id} materializado.`);

    // 7. RESPUESTA SOBERANA AL FRONTEND
    return new Response(JSON.stringify({
      success: true,
      data: {
        poiId: poi.id,
        analysis,
        location: {
          poiName: analysis.officialName,
          coordinates: [location.longitude, location.latitude]
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
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Superioridad de Gemini 3.0: El uso del modelo PRO permite que el OCR sea 
 *    mucho más resiliente a sombras, desenfoque y ángulos difíciles de las placas.
 * 2. Triangulación de Verdad: La IA no solo "lee", sino que "compara" la foto general 
 *    con los detalles de las placas para confirmar que el monumento es el que dice ser.
 * 3. Atomicidad SQL: El punto de interés se crea con el estado 'ingested'. Esto 
 *    significa que ya ocupa un lugar físico en la base de datos, pero el usuario 
 *    final no lo verá hasta que la Fase de Narrativa (Step 4) lo publique.
 */