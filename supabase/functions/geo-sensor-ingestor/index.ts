/**
 * ARCHIVO: supabase/functions/geo-sensor-ingestor/index.ts
 * VERSIÓN: 7.0 (NicePod Sovereign Ingestor - Perimeter Guard Edition)
 * PROTOCOLO: MADRID RESONANCE V8.0
 * MISIÓN: Peritaje técnico de evidencia física mediante IA con Blindaje Guard.
 * NIVEL DE INTEGRIDAD: 100%
 */

import { encodeBase64 } from "https://deno.land/std@0.203.0/encoding/base64.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AI_MODELS, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { guard, GuardContext } from "../_shared/guard.ts";

const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

const supabaseAdministrator: SupabaseClient = createClient(
  SUPABASE_URL ?? "",
  SUPABASE_SERVICE_ROLE_KEY ?? ""
);

/**
 * retrieveBinaryEvidenceAsBase64:
 * Misión: Recuperar binarios desde Storage y codificarlos para el Oráculo IA.
 */
async function retrieveBinaryEvidenceAsBase64(uniformResourceLocator: string): Promise<string> {
  const networkResponse = await fetch(uniformResourceLocator);
  if (!networkResponse.ok) throw new Error(`STORAGE_FETCH_FAILURE: ${uniformResourceLocator}`);
  const binaryArrayBuffer = await networkResponse.arrayBuffer();
  return encodeBase64(new Uint8Array(binaryArrayBuffer));
}

/**
 * executeSensorIngestionHandler:
 * Orquestador de peritaje de inteligencia urbana con protección perimetral.
 */
const executeSensorIngestionHandler = async (incomingRequest: Request, context: GuardContext): Promise<Response> => {
  const correlationIdentification = context.correlationIdentification;
  console.info(`🧠 [Sensor-Ingestor][${correlationIdentification}] Iniciando peritaje binario seguro.`);

  try {
    const expedientPayload = await incomingRequest.json();
    const {
      heroImageUniformResourceLocator,
      opticalCharacterRecognitionImageUniformResourceLocatorsCollection = [],
      administratorIntentText,
      categoryMission,
      categoryEntity,
      historicalEpoch,
      latitudeCoordinate,
      longitudeCoordinate,
      accuracyMeters,
      authenticatedUserIdentification
    } = expedientPayload;

    // VALIDACIÓN DE IDENTIDAD SOBERANA
    if (!context.isTrusted && !authenticatedUserIdentification) {
       throw new Error("IDENTITY_VERIFICATION_FAILED: Falta identificador de usuario.");
    }

    // EXTRACCIÓN BINARIA SEGURA
    const [heroBase64, ...opticalBase64Collection] = await Promise.all([
      retrieveBinaryEvidenceAsBase64(heroImageUniformResourceLocator),
      ...opticalCharacterRecognitionImageUniformResourceLocatorsCollection.map(retrieveBinaryEvidenceAsBase64)
    ]);

    const systemInstruction = `Actúa como Perito de Inteligencia Urbana. Responde solo en JSON. Misión: ${categoryMission}, Entidad: ${categoryEntity}, Época: ${historicalEpoch}.`;

    const geminiPartsCollection = [
      { text: systemInstruction },
      { inline_data: { mime_type: "image/jpeg", data: heroBase64 } }
    ];

    opticalBase64Collection.forEach(binaryData => {
      geminiPartsCollection.push({ inline_data: { mime_type: "image/jpeg", data: binaryData } });
    });

    const intelligenceResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.PRO}:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: geminiPartsCollection }],
          generationConfig: { temperature: 0.1, response_mime_type: "application/json" }
        })
      }
    );

    const resultData = await intelligenceResponse.json();
    const rawAnalysisText = resultData.candidates?.[0]?.content?.parts?.[0]?.text;
    const analysisResultsDossier = parseAIJson<any>(rawAnalysisText);

    const { data: pointOfInterestRecord, error: databaseHardwareException } = await supabaseAdministrator
      .from('points_of_interest')
      .insert({
        author_identification: authenticatedUserIdentification,
        name: analysisResultsDossier.officialName || "Nodo Detectado",
        category_mission: categoryMission,
        category_entity: categoryEntity,
        historical_epoch: historicalEpoch,
        geo_location: `POINT(${longitudeCoordinate} ${latitudeCoordinate})`,
        status: 'ingested',
        metadata: { grounding_summary: analysisResultsDossier.groundingVerification }
      })
      .select('id').single();

    if (databaseHardwareException) throw databaseHardwareException;

    await supabaseAdministrator.from('point_of_interest_ingestion_buffer').insert({
      point_of_interest_identification: pointOfInterestRecord.id,
      raw_ocr_text: analysisResultsDossier.historicalDossier,
      visual_analysis_dossier: { ...analysisResultsDossier, administrator_original_intent: administratorIntentText },
      sensor_accuracy: accuracyMeters,
      ingested_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({
      success: true,
      data: {
        pointOfInterestIdentification: pointOfInterestRecord.id,
        analysisResults: analysisResultsDossier
      },
      trace_identification: correlationIdentification
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (hardwareException: unknown) {
    const exceptionMessageText = hardwareException instanceof Error ? hardwareException.message : "Error desconocido";
    console.error(`🔥 [Sensor-Ingestor-Fatal][${correlationIdentification}]:`, exceptionMessageText);

    return new Response(JSON.stringify({
      success: false,
      error: exceptionMessageText,
      trace_identification: correlationIdentification
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

Deno.serve(guard(executeSensorIngestionHandler));
