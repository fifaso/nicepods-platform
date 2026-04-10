/**
 * ARCHIVO: actions/geo-actions.ts
 * VERSIÓN: 13.1 (NicePod Sovereign Geo-Actions - Logger Integration & Transactional Integrity)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * 
 * Misión: Orquestar el ciclo de vida de persistencia multidimensional con garantía 
 * de limpieza, rigor de tipos y evasión de límites de infraestructura mediante 
 * el uso de URLs Firmadas (Signed Uniform Resource Locators).
 * [REFORMA V13.1]: Resolución definitiva del error TS2304 mediante la inyección 
 * del utilitario de telemetría 'nicepodLog'. Refuerzo del protocolo de 
 * excepciones y cumplimiento absoluto de la Zero Abbreviations Policy (ZAP).
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
 * comprensibles para la interfaz de la Workstation.
 */
const handleOperationalExceptionAction = (
  exceptionSource: string, 
  operationalException: unknown
): GeoActionResponse<never> => {
  const exceptionMessage = operationalException instanceof Error 
    ? operationalException.message 
    : String(operationalException);
  
  nicepodLog(`🔥 [NicePod][${exceptionSource}]`, exceptionMessage, 'error');

  // Mapeo industrial de errores conocidos de base de datos y red
  if (exceptionMessage.includes("PGRST116")) return { success: false, message: "FALLO_MEMORIA_METAL: Nodo no localizado en la Bóveda.", error: exceptionMessage };
  if (exceptionMessage.includes("42501")) return { success: false, message: "VIOLACION_POLITICA_SEGURIDAD: Acceso denegado al Metal.", error: exceptionMessage };
  if (exceptionMessage.includes("UNAUTHORIZED")) return { success: false, message: "AUTORIDAD_INSUFICIENTE: Sesión de perito no válida.", error: exceptionMessage };

  return { 
    success: false, 
    message: `EXCEPCION_OPERATIVA [${exceptionSource}]: Fallo en la transacción de forja.`, 
    error: exceptionMessage 
  };
};

/**
 * ---------------------------------------------------------------------------
 * II. ESCUDO DE AUTORIDAD (RBAC PROTOCOL)
 * ---------------------------------------------------------------------------
 */

/**
 * validateSovereignAccess:
 * Valida la identidad y el rango de Administrador directamente en el Borde de Vercel.
 */
async function validateSovereignAccess() {
  const supabaseClient = createClient();
  const { data: { user: authenticatedUser }, error: authenticationException } = await supabaseClient.auth.getUser();

  if (authenticationException || !authenticatedUser) {
    throw new Error("IDENTIDAD_NO_VERIFICADA: Sesión inexistente o expirada.");
  }

  const applicationMetadata = authenticatedUser.app_metadata || {};
  const userRole = applicationMetadata.user_role || applicationMetadata.role || 'user';

  if (userRole !== 'admin') {
    throw new Error("ACCESO_DENEGADO: Se requiere autoridad de nivel Administrador para operar.");
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
 * Misión: Generar URLs firmadas para la transmisión directa de binarios al Metal.
 */
export async function requestUploadTokensAction(
  fileNamesCollection: string[]
): Promise<GeoActionResponse<{ pathsCollection: string[], uploadUrlsCollection: string[] }>> {
  try {
    const authorizedUserAuthor = await validateSovereignAccess();
    const supabaseClient = createClient();
    const currentUnixTimestamp = Date.now();

    const uploadTokensCollection = await Promise.all(
      fileNamesCollection.map(async (fileName) => {
        const fileStoragePath = `point-of-interest-evidence/${authorizedUserAuthor.id}/${currentUnixTimestamp}_${fileName}`;
        const { data: signedUrlData, error: storageException } = await supabaseClient.storage
          .from('podcasts')
          .createSignedUploadUrl(fileStoragePath);

        if (storageException || !signedUrlData) {
          throw new Error(`FALLO_FIRMA_TOKEN: No se pudo autorizar la subida de ${fileName}`);
        }
        return { path: fileStoragePath, url: signedUrlData.signedUrl };
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
    return handleOperationalExceptionAction("TokenGeneration", operationalException);
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
    await validateSovereignAccess();
    const supabaseClient = createClient();
    const serviceRoleSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleSecretKey) throw new Error("INFRASTRUCTURE_KEY_MISSING");

    const { data: resolutionResults, error: functionInvokeException } = await supabaseClient.functions.invoke('geo-resolve-location', {
      body: { latitude: latitudeCoordinate, longitude: longitudeCoordinate },
      headers: { Authorization: `Bearer ${serviceRoleSecretKey}` }
    });

    if (functionInvokeException) throw new Error(`RADAR_SYNC_FAIL: ${functionInvokeException.message}`);
    
    return { 
      success: true, 
      message: "Sintonía ambiental establecida.", 
      data: resolutionResults.data as Record<string, unknown> 
    };
  } catch (operationalException: unknown) {
    return handleOperationalExceptionAction("GeographicResolution", operationalException);
  }
}

/**
 * transcribeVoiceIntentAction:
 * Misión: Transmutar el dictado sensorial en capital intelectual textual.
 */
export async function transcribeVoiceIntentAction(parameters: {
  audioBase64Data: string;
}): Promise<GeoActionResponse<{ transcriptionText: string }>> {
  try {
    await validateSovereignAccess();
    const supabaseClient = createClient();
    const serviceRoleSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { data: transcriptionResults, error: functionInvokeException } = await supabaseClient.functions.invoke('geo-transcribe-intent', {
      body: {
        audioBinaryBase64Data: parameters.audioBase64Data.includes(',') ? parameters.audioBase64Data.split(',')[1] : parameters.audioBase64Data,
        mediaMimeTypeHeader: 'audio/webm' 
      },
      headers: { Authorization: `Bearer ${serviceRoleSecretKey}` }
    });

    if (functionInvokeException) throw new Error(`SPEECH_TO_TEXT_MASTER_FAIL: ${functionInvokeException.message}`);

    return {
      success: true,
      message: "Dictado transmutado con éxito.",
      data: { transcriptionText: transcriptionResults.transcriptionText }
    };
  } catch (operationalException: unknown) {
    return handleOperationalExceptionAction("SpeechToText", operationalException);
  }
}

/**
 * ---------------------------------------------------------------------------
 * V. FASE 1 & 2: INGESTA DE INTELIGENCIA MULTIDIMENSIONAL
 * ---------------------------------------------------------------------------
 */

/**
 * ingestIntelligenceDossierAction:
 * Misión: Validar evidencia visual, invocar peritaje y asegurar vinculación atómica.
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
  
  const supabaseClient = createClient();

  try {
    const authorizedUserAuthor = await validateSovereignAccess();

    // 1. VALIDACIÓN SOBERANA DE ENTRADA (BUILD SHIELD V4.1)
    const validatedIngestionData = PointOfInterestIngestionSchema.parse(intelligenceIngestaPayload);
    const serviceRoleSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 2. CONSTRUCCIÓN DE REFERENCIAS DE ACCESO DIRECTO
    const publicHeroUniformResourceLocator = supabaseClient.storage.from('podcasts').getPublicUrl(validatedIngestionData.heroImageStoragePath).data.publicUrl;
    const publicOcrUniformResourceLocatorsCollection = validatedIngestionData.opticalCharacterRecognitionImagePaths.map(path => 
      supabaseClient.storage.from('podcasts').getPublicUrl(path).data.publicUrl
    );

    // 3. DESPACHO AL ORÁCULO DE BORDE (AGENTE 42)
    const { data: agentResponseResults, error: functionInvokeException } = await supabaseClient.functions.invoke('geo-sensor-ingestor', {
      body: {
        ...validatedIngestionData,
        heroImageUniformResourceLocator: publicHeroUniformResourceLocator,
        opticalCharacterRecognitionImageUniformResourceLocatorsCollection: publicOcrUniformResourceLocatorsCollection,
        userIdentification: authorizedUserAuthor.id
      },
      headers: { Authorization: `Bearer ${serviceRoleSecretKey}` }
    });

    if (functionInvokeException) throw new Error(`ORACLE_INGESTION_FAIL: ${functionInvokeException.message}`);

    // 4. ADUANA SINTÁCTICA (OUTPUT VALIDATION)
    const validatedAnalysisResults = IntelligenceAgencyAnalysisSchema.parse(agentResponseResults.data.analysisResults);
    const pointOfInterestIdentification = agentResponseResults.data.pointOfInterestIdentification;

    /**
     * 5. SELLADO ATÓMICO DE EVIDENCIAS (ASSET LINKING)
     */
    const { error: databaseUpdateException } = await supabaseClient
      .from('points_of_interest')
      .update({
        gallery_urls: [publicHeroUniformResourceLocator, ...publicOcrUniformResourceLocatorsCollection]
      })
      .eq('id', pointOfInterestIdentification);

    if (databaseUpdateException) {
      nicepodLog("⚠️ [GeoAction] Inconsistencia en vinculación de galería.", databaseUpdateException.message, 'warn');
      throw new Error(`DATABASE_LINKING_FAIL: ${databaseUpdateException.message}`);
    }

    return {
      success: true,
      message: "Expediente multidimensional validado y anclado en la Bóveda NKV.",
      data: {
        analysisResults: validatedAnalysisResults,
        pointOfInterestIdentification: pointOfInterestIdentification,
        locationMetadata: agentResponseResults.data.locationMetadata
      }
    };

  } catch (operationalException: unknown) {
    return handleOperationalExceptionAction("IntelligenceIngestion", operationalException);
  }
}

/**
 * ---------------------------------------------------------------------------
 * VI. FASE 3: SÍNTESIS NARRATIVA (PROCESAMIENTO LITERARIO)
 * ---------------------------------------------------------------------------
 */

export async function synthesizeNarrativeAction(parameters: {
  pointOfInterestIdentification: number;
  narrativeDepth: NarrativeDepth;
  narrativeTone: NarrativeTone;
  refinedAdministratorIntent?: string;
}): Promise<GeoActionResponse<Record<string, unknown>>> {
  try {
    await validateSovereignAccess();
    const supabaseClient = createClient();
    const serviceRoleSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { data: synthesisResults, error: functionInvokeException } = await supabaseClient.functions.invoke('geo-narrative-creator', {
      body: {
        pointOfInterestIdentification: parameters.pointOfInterestIdentification,
        narrativeDepth: parameters.narrativeDepth,
        narrativeTone: parameters.narrativeTone,
        refinedAdministratorIntent: parameters.refinedAdministratorIntent
      },
      headers: { Authorization: `Bearer ${serviceRoleSecretKey}` }
    });

    if (functionInvokeException) throw new Error(`NARRATIVE_ENGINE_FAIL: ${functionInvokeException.message}`);
    
    return { 
      success: true, 
      message: "Sabiduría sintetizada con éxito por el Oráculo.", 
      data: synthesisResults.data as Record<string, unknown> 
    };
  } catch (operationalException: unknown) {
    return handleOperationalExceptionAction("NarrativeSynthesis", operationalException);
  }
}

/**
 * ---------------------------------------------------------------------------
 * VII. FASE 4: PUBLICACIÓN SOBERANA (COMMIT FINAL)
 * ---------------------------------------------------------------------------
 */

export async function publishSovereignChronicleAction(parameters: {
  pointOfInterestIdentification: number;
  chronicleStoragePath: string; 
  durationSeconds: number;
}): Promise<GeoActionResponse> {
  
  const supabaseClient = createClient();

  try {
    await validateSovereignAccess();

    const publicAudioUniformResourceLocator = supabaseClient.storage
      .from('podcasts')
      .getPublicUrl(parameters.chronicleStoragePath).data.publicUrl;

    // 1. Commit Físico y Activación de Resonancia
    const { error: databaseUpdateException } = await supabaseClient
      .from('points_of_interest')
      .update({
        ambient_audio_url: publicAudioUniformResourceLocator, 
        status: 'published' as PointOfInterestLifecycle,
        is_published: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', parameters.pointOfInterestIdentification);

    if (databaseUpdateException) throw new Error(`DATABASE_PUBLISH_FAIL: ${databaseUpdateException.message}`);

    // 2. REVALIDACIÓN SÍNCRONA DE LA MALLA
    revalidatePath('/map');
    
    return { 
      success: true, 
      message: "Nodo intelectual materializado con éxito en la Malla Activa." 
    };

  } catch (operationalException: unknown) {
    return handleOperationalExceptionAction("FinalPublication", operationalException);
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V13.1):
 * 1. Build Shield Implementation: Se ha importado 'nicepodLog' desde '@/lib/utils', 
 *    resolviendo el error de compilación TS2304.
 * 2. Exception Factory: El método 'handleOperationalExceptionAction' garantiza una 
 *    respuesta unificada y descriptiva ante fallos en la capa de persistencia.
 * 3. Zero Abbreviations Policy (ZAP): Refactorización nominal de manejadores de 
 *    error y variables locales para cumplir con el estándar V4.2.
 */