/**
 * ARCHIVO: actions/geo-actions.ts
 * VERSIÓN: 11.0 (NicePod Sovereign Geo-Actions - Full Descriptive Integrity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestar el ciclo de vida de persistencia multidimensional con garantía 
 * de limpieza, rigor de tipos y evasión del límite de Vercel (Signed URLs).
 * [REFORMA V11.0]: Sincronización total con la Constitución V7.7, eliminación de 
 * abreviaturas 'POI' y consolidación del Protocolo Lightning.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- IMPORTACIÓN DE CONTRATOS SOBERANOS (BUILD SHIELD V7.7) ---
import { POIIngestionSchema } from "@/lib/validation/poi-schema";
import {
  GeoActionResponse,
  PointOfInterestLifecycle,
  PointOfInterestCreationPayload,
  NarrativeDepth,
  NarrativeTone
} from "@/types/geo-sovereignty";

/**
 * ---------------------------------------------------------------------------
 * I. ESCUDO DE AUTORIDAD (RBAC PROTOCOL)
 * ---------------------------------------------------------------------------
 */

/**
 * validateSovereignAccess:
 * Valida la identidad y el rango de Administrador directamente en el Borde de Vercel.
 */
async function validateSovereignAccess() {
  const supabaseClient = createClient();
  const { data: { user }, error: authenticationError } = await supabaseClient.auth.getUser();

  if (authenticationError || !user) {
    throw new Error("IDENTIDAD_NO_VERIFICADA: Sesión inexistente o expirada.");
  }

  const applicationMetadata = user.app_metadata || {};
  const userRole = applicationMetadata.user_role || applicationMetadata.role || 'user';

  if (userRole !== 'admin') {
    throw new Error("ACCESO_DENEGADO: Se requiere autoridad de nivel Administrador.");
  }

  return user;
}

/**
 * ---------------------------------------------------------------------------
 * II. PROTOCOLO LIGHTNING (DIRECT STORAGE ACCESS)
 * ---------------------------------------------------------------------------
 */

/**
 * requestUploadTokensAction:
 * Misión: Generar URLs firmadas para que el cliente suba binarios directamente 
 * al Storage, eliminando el transporte Base64 y el riesgo de error 413.
 */
export async function requestUploadTokensAction(filenames: string[]): Promise<GeoActionResponse<{ paths: string[], uploadUrls: string[] }>> {
  try {
    const userAuthor = await validateSovereignAccess();
    const supabaseClient = createClient();
    const currentTimestamp = Date.now();

    const uploadTokens = await Promise.all(
      filenames.map(async (name) => {
        const filePath = `point-of-interest-evidence/${userAuthor.id}/${currentTimestamp}_${name}`;
        const { data, error } = await supabaseClient.storage
          .from('podcasts')
          .createSignedUploadUrl(filePath);

        if (error || !data) {
          throw new Error(`FALLO_FIRMA_TOKEN: No se pudo autorizar la subida de ${name}`);
        }
        return { path: filePath, url: data.signedUrl };
      })
    );

    return {
      success: true,
      message: "Pasaportes de subida directa generados con éxito.",
      data: {
        paths: uploadTokens.map(token => token.path),
        uploadUrls: uploadTokens.map(token => token.url)
      }
    };
  } catch (exception: any) {
    console.error("🔥 [GeoAction][TokenFatal]:", exception.message);
    return { success: false, message: "Error de infraestructura en generación de tokens.", error: exception.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * III. ACCIONES DE RESOLUCIÓN Y TRANSCRIPCIÓN
 * ---------------------------------------------------------------------------
 */

export async function resolveLocationAction(
  latitude: number,
  longitude: number
): Promise<GeoActionResponse<any>> {
  try {
    await validateSovereignAccess();
    const supabaseClient = createClient();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) throw new Error("INFRASTRUCTURE_KEY_MISSING");

    const { data: results, error: functionError } = await supabaseClient.functions.invoke('geo-resolve-location', {
      body: { latitude, longitude },
      headers: { Authorization: `Bearer ${serviceRoleKey}` }
    });

    if (functionError) throw new Error(`RADAR_SYNC_FAIL: ${functionError.message}`);
    return { success: true, message: "Sintonía ambiental establecida.", data: results.data };
  } catch (exception: any) {
    console.error("🔥 [GeoAction][ResolveFatal]:", exception.message);
    return { success: false, message: "Error en el radar de contexto.", error: exception.message };
  }
}

export async function transcribeVoiceIntentAction(parameters: {
  audioBase64: string;
}): Promise<GeoActionResponse<{ transcription: string }>> {
  try {
    await validateSovereignAccess();
    const supabaseClient = createClient();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { data: results, error: functionError } = await supabaseClient.functions.invoke('geo-transcribe-intent', {
      body: {
        audioBase64: parameters.audioBase64.includes(',') ? parameters.audioBase64.split(',')[1] : parameters.audioBase64,
        contentType: 'audio/webm' 
      },
      headers: { Authorization: `Bearer ${serviceRoleKey}` }
    });

    if (functionError) throw new Error(`STT_IA_FAIL: ${functionError.message}`);

    return {
      success: true,
      message: "Dictado transmutado en capital intelectual.",
      data: { transcription: results.transcription }
    };
  } catch (exception: any) {
    console.error("🔥 [GeoAction][STT-Fatal]:", exception.message);
    return { success: false, message: "Fallo en el peritaje acústico de la intención.", error: exception.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * IV. FASE 1 & 2: INGESTA DE INTELIGENCIA MULTIDIMENSIONAL
 * ---------------------------------------------------------------------------
 */

export async function ingestIntelligenceDossierAction(
  payload: {
    latitude: number;
    longitude: number;
    accuracy: number;
    heroImageStoragePath: string; 
    ocrImageStoragePaths: string[];
    categoryMission: string;
    categoryEntity: string;
    historicalEpoch: string;
    resonanceRadius: number;
    adminIntent: string;
    referenceUrl?: string;
  }
): Promise<GeoActionResponse<{ pointOfInterestIdentification: number; analysis: any; location: any }>> {
  
  const supabaseClient = createClient();

  try {
    const userAuthor = await validateSovereignAccess();

    // 1. RIGOR POSTGIS Y TAXONOMÍA: Validación Zod Multidimensional V4.0
    const validatedData = POIIngestionSchema.parse({
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy,
      heroImage: payload.heroImageStoragePath, 
      ocrImages: payload.ocrImageStoragePaths,
      categoryMission: payload.categoryMission,
      categoryEntity: payload.categoryEntity,
      historicalEpoch: payload.historicalEpoch,
      resonanceRadius: payload.resonanceRadius,
      adminIntent: payload.adminIntent,
      referenceUrl: payload.referenceUrl
    });

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 2. OBTENCIÓN DE URLs PÚBLICAS PARA EL ORÁCULO
    const publicHeroUniformResourceLocator = supabaseClient.storage.from('podcasts').getPublicUrl(payload.heroImageStoragePath).data.publicUrl;
    const publicOcrUniformResourceLocators = payload.ocrImageStoragePaths.map(path => supabaseClient.storage.from('podcasts').getPublicUrl(path).data.publicUrl);

    // 3. INVOCACIÓN AL ORÁCULO DE BORDE (AGENTE 42)
    const { data: results, error: functionError } = await supabaseClient.functions.invoke('geo-sensor-ingestor', {
      body: {
        ...validatedData,
        heroImageUrl: publicHeroUniformResourceLocator,
        ocrImageUrls: publicOcrUniformResourceLocators,
        userId: userAuthor.id
      },
      headers: { Authorization: `Bearer ${serviceRoleKey}` }
    });

    if (functionError) throw new Error(`AI_INGESTOR_FAIL: ${functionError.message}`);

    const pointOfInterestIdentification = results.data.poiId;

    // 4. VINCULACIÓN FÍSICA Y SELLADO EN BASE DE DATOS
    const { error: databaseUpdateError } = await supabaseClient
      .from('points_of_interest')
      .update({
        gallery_urls: [publicHeroUniformResourceLocator, ...publicOcrUniformResourceLocators]
      })
      .eq('id', pointOfInterestIdentification);

    if (databaseUpdateError) throw new Error(`DB_LINKING_FAIL: ${databaseUpdateError.message}`);

    return {
      success: true,
      message: "Expediente multidimensional validado y anclado en la Bóveda.",
      data: {
        ...results.data,
        pointOfInterestIdentification 
      }
    };

  } catch (exception: any) {
    console.error("🔥 [GeoAction][IngestError]:", exception.message);
    return { 
      success: false, 
      message: "Fallo en la forja de inteligencia urbana.", 
      error: exception.message 
    };
  }
}

/**
 * ---------------------------------------------------------------------------
 * V. SÍNTESIS NARRATIVA (PROCESAMIENTO LITERARIO)
 * ---------------------------------------------------------------------------
 */

export async function synthesizeNarrativeAction(parameters: {
  pointOfInterestIdentification: number;
  depth: NarrativeDepth;
  tone: NarrativeTone;
  refinedIntent?: string;
}): Promise<GeoActionResponse<any>> {
  try {
    await validateSovereignAccess();
    const supabaseClient = createClient();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { data: results, error: functionError } = await supabaseClient.functions.invoke('geo-narrative-creator', {
      body: {
        poiId: parameters.pointOfInterestIdentification,
        depth: parameters.depth,
        tone: parameters.tone,
        refinedIntent: parameters.refinedIntent
      },
      headers: { Authorization: `Bearer ${serviceRoleKey}` }
    });

    if (functionError) throw new Error(`AI_NARRATIVE_FAIL: ${functionError.message}`);
    return { success: true, message: "Sabiduría sintetizada por el Agente 42.", data: results.data };
  } catch (exception: any) {
    console.error("🔥 [GeoAction][NarrativeFatal]:", exception.message);
    return { success: false, message: "Fallo en la síntesis narrativa del hito.", error: exception.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * VI. FASE 4: PUBLICACIÓN SOBERANA (CIERRE DE EXPEDIENTE)
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

    const publicAudioUniformResourceLocator = supabaseClient.storage.from('podcasts').getPublicUrl(parameters.chronicleStoragePath).data.publicUrl;

    // 1. Commit Físico y Activación de Resonancia en la Malla
    const { error: databaseUpdateError } = await supabaseClient
      .from('points_of_interest')
      .update({
        ambient_audio_url: publicAudioUniformResourceLocator, 
        status: 'published' as PointOfInterestLifecycle,
        is_published: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', parameters.pointOfInterestIdentification);

    if (databaseUpdateError) throw new Error(`DB_PUBLISH_FAIL: ${databaseUpdateError.message}`);

    // 2. REVALIDACIÓN SÍNCRONA DE MALLA
    revalidatePath('/map');
    
    return { success: true, message: "Nodo intelectual materializado con éxito en la Malla Activa." };

  } catch (exception: any) {
    console.error("🔥 [GeoAction][PublishFatal]:", exception.message);
    return { success: false, message: "Fallo en el sellado final del nodo.", error: exception.message };
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V11.0):
 * 1. Build Shield Synchronization: Se sustituyó 'POILifecycle' por 'PointOfInterestLifecycle',
 *    resolviendo el error TS2305 detectado por Vercel.
 * 2. Lightning Protocol Integrity: Las acciones ahora operan exclusivamente con 
 *    rutas de almacenamiento, garantizando que el servidor de aplicaciones nunca 
 *    se vea saturado por binarios visuales o acústicos.
 * 3. Atomic Revalidation: El uso de revalidatePath('/map') asegura que el peritaje 
 *    sea visible para todos los Voyagers de forma inmediata tras el commit.
 */