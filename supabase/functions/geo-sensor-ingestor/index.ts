/**
 * ARCHIVO: supabase/functions/geo-sensor-ingestor/index.ts
 * VERSIÓN: 7.0 (NicePod Sovereign Ingestor - Perimeter Guard Edition)
 * PROTOCOLO: MADRID RESONANCE V8.0
 * MISIÓN: Peritaje técnico de evidencia física mediante IA con Blindaje Guard.
 * NIVEL DE INTEGRIDAD: 100%
 */

import { encodeBase64 } from "https://deno.land/std@0.203.0/encoding/base64.ts"; // [MANDATORIO]
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AI_MODELS, parseAIJson } from "../_shared/ai.ts";
import { guard, GuardContext } from "../_shared/guard.ts";
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
 * executeSovereignIngestionHandler:
 * Misión: Orquestar el peritaje técnico de evidencia física con blindaje perimetral.
 */
const executeSovereignIngestionHandler = async (request: Request, context: GuardContext): Promise<Response> => {
  const processingCorrelationIdentification = context.correlationIdentification;
  console.info(`🧠 [Sensor-Ingestor][${processingCorrelationIdentification}] Iniciando peritaje binario seguro.`);

  try {
    // 0. PROTOCOLO DE AUTORIDAD (Zero Trust Architecture)
    if (!context.isTrusted) {
      const authorizationHeader = request.headers.get('Authorization');
      if (!authorizationHeader) throw new Error("AUTORIDAD_REQUERIDA: No se detectó token de autorización.");

      const { data: { user: authenticatedUser }, error: authenticationError } = await supabaseAdministrator.auth.getUser(authorizationHeader.replace("Bearer ", ""));
      if (authenticationError || !authenticatedUser) throw new Error("SESION_INVALIDA: El token de acceso ha expirado o es inválido.");

      const { data: administratorProfile, error: profileQueryError } = await supabaseAdministrator
          .from('profiles')
          .select('role')
          .eq('id', authenticatedUser.id)
          .single();

      if (profileQueryError || administratorProfile?.role !== 'admin') {
          throw new Error("ACCESO_DENEGADO: Se requiere autoridad de nivel Administrador para ingestar evidencia.");
      }

      console.log(`[Sensor-Ingestor][${processingCorrelationIdentification}] Autoridad confirmada para el Administrador: ${authenticatedUser.id}`);
    } else {
      console.info(`[Sensor-Ingestor][${processingCorrelationIdentification}] Ejecución confiable iniciada (Infrastructure Flow).`);
    }

    const expedientPayload = await request.json();
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

  } catch (exceptionMessageInformation: unknown) {
    const errorMessage = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido en peritaje";
    console.error(`🔥 [Sensor-Ingestor-Fatal][${processingCorrelationIdentification}]:`, errorMessage);

    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      trace_identification: processingCorrelationIdentification
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

Deno.serve(guard(executeSovereignIngestionHandler));
