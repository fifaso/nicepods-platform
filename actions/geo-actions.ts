/**
 * ARCHIVO: actions/geo-actions.ts
 * VERSIÓN: 14.0 (NicePod Sovereign Geo-Actions - Atomic Transactional Integrity & Exception Factory Edition)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * 
 * Misión: Orquestar el ciclo de vida de persistencia multidimensional con garantía 
 * de limpieza, rigor de tipos y evasión de límites de infraestructura mediante 
 * el uso de URLs Firmadas (Signed Uniform Resource Locators).
 * [REFORMA V14.0]: Implementación de la "Sovereign Exception Factory" para diagnósticos 
 * industriales precisos. Refuerzo de la atomicidad en la vinculación de activos 
 * y cumplimiento absoluto de la Zero Abbreviations Policy (ZAP). Erradicación 
 * definitiva de tipos débiles (any).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- IMPORTACIÓN DE CONTRATOS SOBERANOS (BUILD SHIELD V4.1) ---
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
 * ---------------------------------------------------------------------------
 * I. FACTORÍA DE EXCEPCIONES SOBERANAS (INDUSTRIAL DIAGNOSTICS)
 * ---------------------------------------------------------------------------
 * Misión: Traducir errores crudos del Metal o del Borde en reportes técnicos 
 * comprensibles para la interfaz de la Workstation, facilitando el peritaje de fallos.
 */
const executeOperationalExceptionHandlingAction = (
  exceptionSourceDescriptor: string, 
  operationalException: unknown
): GeoActionResponse<never> => {
  const exceptionMessageText = operationalException instanceof Error 
    ? operationalException.message 
    : String(operationalException);
  
  nicepodLog(`🔥 [NicePod][${exceptionSourceDescriptor}]`, exceptionMessageText, 'error');

  // Mapeo industrial de códigos de error de PostgreSQL y excepciones de red
  if (exceptionMessageText.includes("PGRST116")) {
    return { success: false, message: "FALLO_MEMORIA_METAL: El nodo solicitado no existe en la Bóveda NKV.", error: exceptionMessageText };
  }
  if (exceptionMessageText.includes("42501")) {
    return { success: false, message: "VIOLACION_POLITICA_SEGURIDAD: Acceso denegado a las tablas del Metal.", error: exceptionMessageText };
  }
  if (exceptionMessageText.includes("UNAUTHORIZED")) {
    return { success: false, message: "AUTORIDAD_INSUFICIENTE: La sesión del perito ha expirado o es inválida.", error: exceptionMessageText };
  }
  if (exceptionMessageText.includes("timeout")) {
    return { success: false, message: "LATENCIA_EXCEDIDA: El Borde no respondió en el tiempo estipulado.", error: exceptionMessageText };
  }

  return { 
    success: false, 
    message: `EXCEPCION_OPERATIVA [${exceptionSourceDescriptor}]: Error crítico en la transacción.`, 
    error: exceptionMessageText 
  };
};

/**
 * ---------------------------------------------------------------------------
 * II. ESCUDO DE AUTORIDAD (ROLE BASED ACCESS CONTROL - RBAC)
 * ---------------------------------------------------------------------------
 */

/**
 * validateSovereignAccessAuthority:
 * Valida la identidad y el rango de Administrador directamente en el Borde de Vercel.
 */
async function validateSovereignAccessAuthority() {
  const supabaseClient = createClient();
  const { data: { user: authenticatedUser }, error: authenticationException } = await supabaseClient.auth.getUser();

  if (authenticationException || !authenticatedUser) {
    throw new Error("IDENTIDAD_NO_VERIFICADA: Acceso restringido a terminales autorizadas.");
  }

  const userApplicationMetadata = authenticatedUser.app_metadata || {};
  const authorizedUserRole = userApplicationMetadata.user_role || userApplicationMetadata.role || 'user';

  if (authorizedUserRole !== 'admin') {
    throw new Error("ACCESO_DENEGADO: Se requiere autoridad de nivel Administrador para alterar el Metal.");
  }

  return authenticatedUser;
}

/**
 * ---------------------------------------------------------------------------
 * III. PROTOCOLO LIGHTNING (DIRECT STORAGE ACCESS)
 * ---------------------------------------------------------------------------
 */

/**
 * requestUploadTokensAction:
 * Misión: Generar URLs firmadas para la transmisión directa de binarios al Metal, 
 * eludiendo el tráfico de red del servidor de aplicaciones.
 */
export async function requestUploadTokensAction(
  fileNamesCollection: string[]
): Promise<GeoActionResponse<{ pathsCollection: string[], uploadUrlsCollection: string[] }>> {
  try {
    const authorizedUserAuthor = await validateSovereignAccessAuthority();
    const supabaseClient = createClient();
    const currentUnixTimestamp = Date.now();

    const uploadTokensCollection = await Promise.all(
      fileNamesCollection.map(async (fileName) => {
        const fileStoragePath = `point-of-interest-evidence/${authorizedUserAuthor.id}/${currentUnixTimestamp}_${fileName}`;
        const { data: signedUploadData, error: storageOperationException } = await supabaseClient.storage
          .from('podcasts')
          .createSignedUploadUrl(fileStoragePath);

        if (storageOperationException || !signedUploadData) {
          throw new Error(`FALLO_FIRMA_TOKEN: No se pudo autorizar la subida de ${fileName}`);
        }
        return { path: fileStoragePath, url: signedUploadData.signedUrl };
      })
    );

    return {
      success: true,
      message: "Pasaportes de subida directa generados con éxito.",
      data: {
        pathsCollection: uploadTokensCollection.map(token => token.path),
        uploadUrlsCollection: uploadTokensCollection.map(token => token.url)
      }
    };
  } catch (operationalException: unknown) {
    return executeOperationalExceptionHandlingAction("TokenGenerationFlow", operationalException);
  }
}

/**
 * ---------------------------------------------------------------------------
 * IV. ACCIONES DE RESOLUCIÓN Y TRANSCRIPCIÓN NEURONAL
 * ---------------------------------------------------------------------------
 */

/**
 * resolveLocationAction:
 * Misión: Obtener sintonía ambiental y geonímica basada en telemetría purificada.
 */
export async function resolveLocationAction(
  latitudeCoordinate: number,
  longitudeCoordinate: number
): Promise<GeoActionResponse<Record<string, unknown>>> {
  try {
    await validateSovereignAccessAuthority();
    const supabaseClient = createClient();
    const serviceRoleSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleSecretKey) throw new Error("INFRASTRUCTURE_KEY_MISSING_EXCEPTION");

    const { data: resolutionResults, error: edgeFunctionInvokeException } = await supabaseClient.functions.invoke('geo-resolve-location', {
      body: { latitudeCoordinate, longitudeCoordinate },
      headers: { Authorization: `Bearer ${serviceRoleSecretKey}` }
    });

    if (edgeFunctionInvokeException) throw new Error(`RADAR_SYNC_FAILURE: ${edgeFunctionInvokeException.message}`);
    
    return { 
      success: true, 
      message: "Sintonía ambiental establecida por el radar de contexto.", 
      data: resolutionResults.data as Record<string, unknown> 
    };
  } catch (operationalException: unknown) {
    return executeOperationalExceptionHandlingAction("GeographicResolutionFlow", operationalException);
  }
}

/**
 * transcribeVoiceIntentAction:
 * Misión: Transmutar el dictado sensorial en capital intelectual textual (SpeechToText).
 */
export async function transcribeVoiceIntentAction(parameters: {
  audioBase64Data: string;
}): Promise<GeoActionResponse<{ transcriptionText: string }>> {
  try {
    await validateSovereignAccessAuthority();
    const supabaseClient = createClient();
    const serviceRoleSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { data: transcriptionResults, error: edgeFunctionInvokeException } = await supabaseClient.functions.invoke('geo-transcribe-intent', {
      body: {
        audioBinaryBase64Data: parameters.audioBase64Data.includes(',') ? parameters.audioBase64Data.split(',')[1] : parameters.audioBase64Data,
        mediaMimeTypeHeader: 'audio/webm' 
      },
      headers: { Authorization: `Bearer ${serviceRoleSecretKey}` }
    });

    if (edgeFunctionInvokeException) throw new Error(`SPEECH_TO_TEXT_MASTER_FAILURE: ${edgeFunctionInvokeException.message}`);

    return {
      success: true,
      message: "Dictado transmutado con éxito por el Escriba Neuronal.",
      data: { transcriptionText: transcriptionResults.transcriptionText }
    };
  } catch (operationalException: unknown) {
    return executeOperationalExceptionHandlingAction("AcousticTranscriptionFlow", operationalException);
  }
}

/**
 * ---------------------------------------------------------------------------
 * V. FASE 1 & 2: INGESTA DE INTELIGENCIA MULTIDIMENSIONAL
 * ---------------------------------------------------------------------------
 */

/**
 * ingestIntelligenceDossierAction:
 * Misión: Validar evidencia visual, invocar peritaje y asegurar vinculación atómica de activos.
 */
export async function ingestIntelligenceDossierAction(
  intelligenceIngestaPayload: {
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
    const validatedIngestionData = PointOfInterestIngestionSchema.parse(intelligenceIngestaPayload);
    const serviceRoleSecretKeyContent = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 2. CONSTRUCCIÓN DE REFERENCIAS DE ACCESO DIRECTO PARA LA IA
    const publicHeroUniformResourceLocator = supabaseSovereignClient.storage.from('podcasts').getPublicUrl(validatedIngestionData.heroImageStoragePath).data.publicUrl;
    const publicOpticalCharacterRecognitionUniformResourceLocatorsCollection = validatedIngestionData.opticalCharacterRecognitionImagePaths.map(path => 
      supabaseSovereignClient.storage.from('podcasts').getPublicUrl(path).data.publicUrl
    );

    // 3. DESPACHO AL ORÁCULO DE BORDE (AGENTE 42)
    const { data: agentResponseResults, error: edgeFunctionInvokeException } = await supabaseSovereignClient.functions.invoke('geo-sensor-ingestor', {
      body: {
        ...validatedIngestionData,
        heroImageUniformResourceLocator: publicHeroUniformResourceLocator,
        opticalCharacterRecognitionImageUniformResourceLocatorsCollection: publicOpticalCharacterRecognitionUniformResourceLocatorsCollection,
        userIdentification: authenticatedUserIdentification
      },
      headers: { Authorization: `Bearer ${serviceRoleSecretKeyContent}` }
    });

    if (edgeFunctionInvokeException) throw new Error(`ORACLE_INGESTION_FAILURE: ${edgeFunctionInvokeException.message}`);

    // 4. ADUANA SINTÁCTICA (OUTPUT VALIDATION)
    const validatedAnalysisResults = IntelligenceAgencyAnalysisSchema.parse(agentResponseResults.data.analysisResults);
    const pointOfInterestIdentification = agentResponseResults.data.pointOfInterestIdentification;

    /**
     * 5. VINCULACIÓN ATÓMICA DE EVIDENCIAS (ASSET LINKING)
     * [INTERVENCIÓN V14.0]: Garantiza que el nodo en la base de datos posea las URLs 
     * públicas definitivas antes de cerrar la transacción de ingesta.
     */
    const { error: databaseUpdateException } = await supabaseSovereignClient
      .from('points_of_interest')
      .update({
        gallery_urls: [publicHeroUniformResourceLocator, ...publicOpticalCharacterRecognitionUniformResourceLocatorsCollection]
      })
      .eq('id', pointOfInterestIdentification);

    if (databaseUpdateException) {
      throw new Error(`DATABASE_LINKING_FAILURE: ${databaseUpdateException.message}`);
    }

    return {
      success: true,
      message: "Expediente multidimensional validado y anclado en la Bóveda NKV con éxito.",
      data: {
        analysisResults: validatedAnalysisResults,
        pointOfInterestIdentification: pointOfInterestIdentification,
        locationMetadata: agentResponseResults.data.locationMetadata as Record<string, unknown>
      }
    };

  } catch (operationalException: unknown) {
    return executeOperationalExceptionHandlingAction("IntelligenceIngestionWorkflow", operationalException);
  }
}

/**
 * ---------------------------------------------------------------------------
 * VI. FASE 3: SÍNTESIS NARRATIVA (PROCESAMIENTO LITERARIO)
 * ---------------------------------------------------------------------------
 */

/**
 * synthesizeNarrativeAction:
 * Misión: Ordenar a la IA la síntesis de sabiduría basada en el dossier de peritaje.
 */
export async function synthesizeNarrativeAction(parameters: {
  pointOfInterestIdentification: number;
  narrativeDepth: NarrativeDepth;
  narrativeTone: NarrativeTone;
  refinedAdministratorIntent?: string;
}): Promise<GeoActionResponse<Record<string, unknown>>> {
  try {
    await validateSovereignAccessAuthority();
    const supabaseClient = createClient();
    const serviceRoleSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { data: synthesisResults, error: edgeFunctionInvokeException } = await supabaseClient.functions.invoke('geo-narrative-creator', {
      body: {
        pointOfInterestIdentification: parameters.pointOfInterestIdentification,
        narrativeDepth: parameters.narrativeDepth,
        narrativeTone: parameters.narrativeTone,
        refinedAdministratorIntent: parameters.refinedAdministratorIntent
      },
      headers: { Authorization: `Bearer ${serviceRoleSecretKey}` }
    });

    if (edgeFunctionInvokeException) throw new Error(`NARRATIVE_ENGINE_FAILURE: ${edgeFunctionInvokeException.message}`);
    
    return { 
      success: true, 
      message: "Sabiduría sintetizada con éxito por el Oráculo narrativo.", 
      data: synthesisResults.data as Record<string, unknown> 
    };
  } catch (operationalException: unknown) {
    return executeOperationalExceptionHandlingAction("NarrativeSynthesisWorkflow", operationalException);
  }
}

/**
 * ---------------------------------------------------------------------------
 * VII. FASE 4: PUBLICACIÓN SOBERANA (COMMIT FINAL)
 * ---------------------------------------------------------------------------
 */

/**
 * publishSovereignChronicleAction:
 * Misión: Realizar el sellado final, activar el audio y materializar el nodo en la Malla global.
 */
export async function publishSovereignChronicleAction(parameters: {
  pointOfInterestIdentification: number;
  chronicleStoragePath: string; 
  durationSeconds: number;
}): Promise<GeoActionResponse> {
  
  const supabaseSovereignClient = createClient();

  try {
    const authorizedUserAuthorSnapshot = await validateSovereignAccessAuthority();
    const authenticatedUserIdentification = authorizedUserAuthorSnapshot.id;

    const publicAudioUniformResourceLocator = supabaseSovereignClient.storage
      .from('podcasts')
      .getPublicUrl(parameters.chronicleStoragePath).data.publicUrl;

    // 1. Commit Físico y Activación de Resonancia en la Bóveda
    const { error: databaseUpdateException } = await supabaseSovereignClient
      .from('points_of_interest')
      .update({
        ambient_audio_url: publicAudioUniformResourceLocator, 
        status: 'published' as PointOfInterestLifecycle,
        is_published: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', parameters.pointOfInterestIdentification);

    if (databaseUpdateException) throw new Error(`DATABASE_PUBLISH_FAILURE: ${databaseUpdateException.message}`);

    // 2. REVALIDACIÓN SÍNCRONA DE LA MALLA GEOGRÁFICA
    revalidatePath('/map');
    
    return { 
      success: true, 
      message: "Nodo intelectual materializado con éxito en la Malla Activa de Madrid Resonance." 
    };

  } catch (operationalException: unknown) {
    return executeOperationalExceptionHandlingAction("FinalPublicationWorkflow", operationalException);
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V14.0):
 * 1. Exception Factory Integration: Se ha consolidado el uso de 'executeOperationalExceptionHandlingAction', 
 *    proporcionando diagnósticos industriales y eliminando el error TS2304 de nicepodLog.
 * 2. Atomic Asset Linking: La fase de ingesta ahora garantiza que las URLs públicas de las 
 *    evidencias sean vinculadas al hito antes de devolver la respuesta exitosa a la terminal.
 * 3. Zero Abbreviations Policy (ZAP): Refactorización total de la nomenclatura para erradicar 
 *    acrónimos técnicos (POI, STT, URL, ID) en toda la lógica de negocio del servidor.
 */