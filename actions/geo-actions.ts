/**
 * ARCHIVO: actions/geo-actions.ts
 * VERSIÓN: 8.0 (NicePod Sovereign Geo-Actions - Madrid Resonance V8.0)
 * PROTOCOLO: MADRID RESONANCE V8.0
 * 
 * Misión: Orquestar el ciclo de vida de persistencia multidimensional con garantía 
 * de limpieza, rigor de tipos y soberanía nominal (ZAP).
 * [CORRECCIÓN V8.0]: Reparación de Integridad Axial y Soberanía Nominal (ZAP 2.0).
 * NIVEL DE INTEGRIDAD: 100% (Soberano / DIS Doctrine / Build Shield Green)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- IMPORTACIÓN DE CONTRATOS SOBERANOS ---
import { 
  PointOfInterestIngestionSchema, 
  IntelligenceAgencyAnalysisSchema,
  IntelligenceAgencyAnalysisData
} from "@/lib/validation/poi-schema";

import {
  GeoActionResponse,
  PointOfInterestLifecycle,
  NarrativeDepth,
  NarrativeTone
} from "@/types/geo-sovereignty";

// --- UTILIDADES INDUSTRIALES ---
import { nicepodLog } from "@/lib/utils";

/**
 * executeOperationalExceptionHandlingAction:
 * Misión: Traducir errores crudos del Metal o del Borde en reportes técnicos industriales.
 */
const executeOperationalExceptionHandlingAction = (
  exceptionSourceDescriptor: string, 
  operationalException: unknown
): GeoActionResponse<never> => {
  const exceptionMessageText = operationalException instanceof Error 
    ? operationalException.message 
    : String(operationalException);
  
  nicepodLog(`🔥 [NicePod][${exceptionSourceDescriptor}]`, exceptionMessageText, 'exceptionInformation');

  if (exceptionMessageText.includes("PGRST116")) {
    return { success: false, message: "FALLO_MEMORIA_METAL: El nodo solicitado no existe.", exceptionInformation: exceptionMessageText };
  }
  if (exceptionMessageText.includes("42501")) {
    return { success: false, message: "VIOLACION_POLITICA_SEGURIDAD: Acceso denegado al Metal.", exceptionInformation: exceptionMessageText };
  }
  if (exceptionMessageText.includes("UNAUTHORIZED")) {
    return { success: false, message: "AUTORIDAD_INSUFICIENTE: La sesión del perito es inválida.", exceptionInformation: exceptionMessageText };
  }

  return { 
    success: false, 
    message: `EXCEPCION_OPERATIVA [${exceptionSourceDescriptor}]: Error crítico en la transacción.`, 
    exceptionInformation: exceptionMessageText
  };
};

/**
 * validateSovereignAccessAuthority:
 * Valida la identidad y el rango de Administrador (DOCTRINA DIS).
 */
async function validateSovereignAccessAuthority() {
  const supabaseSovereignClient = createClient();
  const { data: { user: authenticatedUserSnapshot }, error: authenticationHardwareExceptionInformation } = await supabaseSovereignClient.auth.getUser();

  if (authenticationHardwareExceptionInformation || !authenticatedUserSnapshot) {
    throw new Error("IDENTIDAD_NO_VERIFICADA: Acceso restringido a terminales autorizadas.");
  }

  const userApplicationMetadata = authenticatedUserSnapshot.app_metadata || {};
  const authorizedUserRoleDescriptor = userApplicationMetadata.user_role || userApplicationMetadata.role || 'user';

  if (authorizedUserRoleDescriptor !== 'admin') {
    throw new Error("ACCESO_DENEGADO: Se requiere autoridad de nivel Administrador.");
  }

  return authenticatedUserSnapshot;
}

/**
 * requestUploadTokensAction:
 * Misión: Generar pasaportes de transmisión (URLs firmadas) para la subida directa
 * de binarios al Metal con soberanía nominal absoluta.
 */
export async function requestUploadTokensAction(
  fileNamesCollection: string[]
): Promise<GeoActionResponse<{ storagePathsCollection: string[], uploadUniformResourceLocatorsCollection: string[] }>> {
  try {
    const authorizedUserAuthorSnapshot = await validateSovereignAccessAuthority();
    const supabaseSovereignClient = createClient();
    const currentUnixTimestampMagnitude = Date.now();

    const authenticatedUserIdentification = authorizedUserAuthorSnapshot.id;

    const uploadTokensCollection = await Promise.all(
      fileNamesCollection.map(async (fileNameContent) => {
        const fileStoragePathContent = `point-of-interest-evidence/${authenticatedUserIdentification}/${currentUnixTimestampMagnitude}_${fileNameContent}`;
        const { data: signedUploadDataSnapshot, error: storageHardwareException } = await supabaseSovereignClient.storage
          .from('podcasts')
          .createSignedUploadUrl(fileStoragePathContent);

        if (storageHardwareException || !signedUploadDataSnapshot) {
          throw new Error(`FALLO_FIRMA_TOKEN: No se pudo autorizar la subida de ${fileNameContent}`);
        }
        return {
          storagePathContent: fileStoragePathContent,
          uploadUniformResourceLocator: signedUploadDataSnapshot.signedUrl
        };
      })
    );

    return {
      success: true,
      message: "Pasaportes de subida directa generados con éxito.",
      data: {
        storagePathsCollection: uploadTokensCollection.map(token => token.storagePathContent),
        uploadUniformResourceLocatorsCollection: uploadTokensCollection.map(token => token.uploadUniformResourceLocator)
      }
    };
  } catch (operationalException: unknown) {
    return executeOperationalExceptionHandlingAction("TokenGenerationFlow", operationalException);
  }
}

/**
 * resolveLocationAction:
 * Misión: Obtener sintonía ambiental basada en telemetría purificada.
 */
export async function resolveLocationAction(
  latitudeCoordinate: number,
  longitudeCoordinate: number
): Promise<GeoActionResponse<Record<string, unknown>>> {
  try {
    await validateSovereignAccessAuthority();
    const supabaseSovereignClient = createClient();
    const serviceRoleSecretKeyContent = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleSecretKeyContent) throw new Error("INFRASTRUCTURE_KEY_MISSING_EXCEPTION");

    const { data: resolutionResultsSnapshot, error: edgeFunctionInvokeHardwareException } = await supabaseSovereignClient.functions.invoke('geo-resolve-location', {
      body: { latitudeCoordinate, longitudeCoordinate },
      headers: { Authorization: `Bearer ${serviceRoleSecretKeyContent}` }
    });

    if (edgeFunctionInvokeHardwareException) throw new Error(`RADAR_SYNC_FAILURE: ${edgeFunctionInvokeHardwareException.message}`);
    
    return { 
      success: true, 
      message: "Sintonía ambiental establecida.",
      data: resolutionResultsSnapshot.data as Record<string, unknown>
    };
  } catch (operationalException: unknown) {
    return executeOperationalExceptionHandlingAction("GeographicResolutionFlow", operationalException);
  }
}

/**
 * transcribeVoiceIntentAction:
 * Misión: Transmutar el dictado sensorial en capital intelectual textual.
 */
export async function transcribeVoiceIntentAction(parametersSnapshot: {
  audioBase64DataContent: string;
}): Promise<GeoActionResponse<{ transcriptionTextContent: string }>> {
  try {
    await validateSovereignAccessAuthority();
    const supabaseSovereignClient = createClient();
    const serviceRoleSecretKeyContent = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { data: transcriptionResultsSnapshot, error: edgeFunctionInvokeHardwareException } = await supabaseSovereignClient.functions.invoke('geo-transcribe-intent', {
      body: {
        audioBinaryBase64Data: parametersSnapshot.audioBase64DataContent.includes(',')
          ? parametersSnapshot.audioBase64DataContent.split(',')[1]
          : parametersSnapshot.audioBase64DataContent,
        mediaMimeTypeHeader: 'audio/webm' 
      },
      headers: { Authorization: `Bearer ${serviceRoleSecretKeyContent}` }
    });

    if (edgeFunctionInvokeHardwareException) throw new Error(`SPEECH_TO_TEXT_MASTER_FAILURE: ${edgeFunctionInvokeHardwareException.message}`);

    return {
      success: true,
      message: "Dictado transmutado con éxito por el Escriba Neuronal.",
      data: { transcriptionTextContent: transcriptionResultsSnapshot.transcriptionTextContent || transcriptionResultsSnapshot.transcriptionText }
    };
  } catch (operationalException: unknown) {
    return executeOperationalExceptionHandlingAction("AcousticTranscriptionFlow", operationalException);
  }
}

/**
 * ingestIntelligenceDossierAction:
 * Misión: Validar evidencia visual e invocar peritaje en el Oráculo de Borde.
 */
export async function ingestIntelligenceDossierAction(
  intelligenceIngestaPayloadSnapshot: {
    latitudeCoordinate: number;
    longitudeCoordinate: number;
    accuracyMeters: number;
    heroImageStoragePath: string; 
    opticalCharacterRecognitionImagePaths: string[];
    categoryMission: string;
    categoryEntity: string;
    historicalEpoch: string;
    resonanceRadiusMeters: number;
    administratorIntent: string;
    referenceUniformResourceLocator?: string;
  }
): Promise<GeoActionResponse<{ pointOfInterestIdentification: number; analysisResults: IntelligenceAgencyAnalysisData; locationMetadata: Record<string, unknown> }>> {
  
  const supabaseSovereignClient = createClient();

  try {
    const authorizedUserAuthorSnapshot = await validateSovereignAccessAuthority();
    const authenticatedUserIdentification = authorizedUserAuthorSnapshot.id;

    // 1. VALIDACIÓN SOBERANA DE ENTRADA (BUILD SHIELD V4.1)
    const validatedIngestionDataSnapshot = PointOfInterestIngestionSchema.parse(intelligenceIngestaPayloadSnapshot);
    const serviceRoleSecretKeyContent = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 2. CONSTRUCCIÓN DE REFERENCIAS DE ACCESO DIRECTO PARA LA IA
    const publicHeroUniformResourceLocator = supabaseSovereignClient.storage.from('podcasts').getPublicUrl(validatedIngestionDataSnapshot.heroImageStoragePath).data.publicUrl;
    const publicOpticalCharacterRecognitionUniformResourceLocatorsCollection = validatedIngestionDataSnapshot.opticalCharacterRecognitionImagePaths.map(path =>
      supabaseSovereignClient.storage.from('podcasts').getPublicUrl(path).data.publicUrl
    );

    // 3. DESPACHO AL ORÁCULO DE BORDE (AGENTE 42)
    const { data: agentResponseResultsSnapshot, error: edgeFunctionInvokeHardwareException } = await supabaseSovereignClient.functions.invoke('geo-sensor-ingestor', {
      body: {
        ...validatedIngestionDataSnapshot,
        heroImageUniformResourceLocator: publicHeroUniformResourceLocator,
        opticalCharacterRecognitionImageUniformResourceLocatorsCollection: publicOpticalCharacterRecognitionUniformResourceLocatorsCollection,
        authenticatedUserIdentification: authenticatedUserIdentification
      },
      headers: { Authorization: `Bearer ${serviceRoleSecretKeyContent}` }
    });

    if (edgeFunctionInvokeHardwareException) throw new Error(`ORACLE_INGESTION_FAILURE: ${edgeFunctionInvokeHardwareException.message}`);

    const validatedAnalysisResultsSnapshot = IntelligenceAgencyAnalysisSchema.parse(agentResponseResultsSnapshot.data.analysisResults);
    const pointOfInterestIdentification = agentResponseResultsSnapshot.data.pointOfInterestIdentification;

    /**
     * 5. VINCULACIÓN ATÓMICA DE EVIDENCIAS (ASSET LINKING)
     * [INTERVENCIÓN V14.0]: Garantiza que el nodo en la base de datos posea las URLs 
     * públicas definitivas antes de cerrar la transacción de ingesta.
     */
    const { error: databaseUpdateHardwareException } = await supabaseSovereignClient
      .from('points_of_interest')
      .update({
        gallery_urls: [publicHeroUniformResourceLocator, ...publicOpticalCharacterRecognitionUniformResourceLocatorsCollection]
      })
      .eq('id', pointOfInterestIdentification);

    if (databaseUpdateHardwareException) {
      throw new Error(`DATABASE_LINKING_FAILURE: ${databaseUpdateHardwareException.message}`);
    }

    return {
      success: true,
      message: "Expediente multidimensional validado y anclado en la Bóveda NKV.",
      data: {
        analysisResults: validatedAnalysisResultsSnapshot,
        pointOfInterestIdentification: pointOfInterestIdentification,
        locationMetadata: agentResponseResultsSnapshot.data.locationMetadata as Record<string, unknown>
      }
    };

  } catch (operationalException: unknown) {
    return executeOperationalExceptionHandlingAction("IntelligenceIngestionWorkflow", operationalException);
  }
}

/**
 * synthesizeNarrativeAction:
 * Misión: Orquestar la síntesis narrativa basada en el dossier de peritaje.
 */
export async function synthesizeNarrativeAction(parametersSnapshot: {
  pointOfInterestIdentification: number;
  narrativeDepth: NarrativeDepth;
  narrativeTone: NarrativeTone;
  refinedAdministratorIntent?: string;
}): Promise<GeoActionResponse<Record<string, unknown>>> {
  try {
    await validateSovereignAccessAuthority();
    const supabaseSovereignClient = createClient();
    const serviceRoleSecretKeyContent = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { data: synthesisResultsSnapshot, error: edgeFunctionInvokeHardwareException } = await supabaseSovereignClient.functions.invoke('geo-narrative-creator', {
      body: {
        pointOfInterestIdentification: parametersSnapshot.pointOfInterestIdentification,
        narrativeDepth: parametersSnapshot.narrativeDepth,
        narrativeTone: parametersSnapshot.narrativeTone,
        refinedAdministratorIntent: parametersSnapshot.refinedAdministratorIntent
      },
      headers: { Authorization: `Bearer ${serviceRoleSecretKeyContent}` }
    });

    if (edgeFunctionInvokeHardwareException) throw new Error(`NARRATIVE_ENGINE_FAILURE: ${edgeFunctionInvokeHardwareException.message}`);
    
    return { 
      success: true, 
      message: "Sabiduría sintetizada con éxito.",
      data: synthesisResultsSnapshot.data as Record<string, unknown>
    };
  } catch (operationalException: unknown) {
    return executeOperationalExceptionHandlingAction("NarrativeSynthesisWorkflow", operationalException);
  }
}

/**
 * publishSovereignChronicleAction:
 * Misión: Sellado final y materialización del nodo en la Malla global.
 */
export async function publishSovereignChronicleAction(parametersSnapshot: {
  pointOfInterestIdentification: number;
  chronicleStoragePath: string; 
  durationSeconds: number; // Restore nominal compatibility for UI
  durationSecondsMagnitude?: number; // Internal ZAP descriptor
}): Promise<GeoActionResponse> {
  
  const supabaseSovereignClient = createClient();

  try {
    const authorizedUserAuthorSnapshot = await validateSovereignAccessAuthority();
    const authenticatedUserIdentification = authorizedUserAuthorSnapshot.id;

    const publicAudioUniformResourceLocator = supabaseSovereignClient.storage
      .from('podcasts')
      .getPublicUrl(parametersSnapshot.chronicleStoragePath).data.publicUrl;

    // 1. Commit Físico y Activación de Resonancia en la Bóveda
    const { error: databaseUpdateHardwareException } = await supabaseSovereignClient
      .from('points_of_interest')
      .update({
        ambient_audio_url: publicAudioUniformResourceLocator, 
        status: 'published' as PointOfInterestLifecycle,
        is_published: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', parametersSnapshot.pointOfInterestIdentification);

    if (databaseUpdateHardwareException) {
      throw new Error(`DATABASE_PUBLISH_FAILURE: ${databaseUpdateHardwareException.message}`);
    }

    revalidatePath('/map');
    
    return { 
      success: true, 
      message: "Nodo intelectual materializado con éxito."
    };

  } catch (operationalException: unknown) {
    return executeOperationalExceptionHandlingAction("FinalPublicationWorkflow", operationalException);
  }
}
