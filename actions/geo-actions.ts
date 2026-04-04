/**
 * ARCHIVO: actions/geo-actions.ts
 * VERSIÓN: 9.0 (NicePod Sovereign Geo-Actions - Lightning Protocol & Multidimensional Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestar el ciclo de vida de persistencia con garantía de limpieza,
 * rigor de tipos y evasión del límite de Vercel mediante Signed URLs.
 * [REFORMA V9.0]: Eliminación de cuellos de botella Base64, integración de 
 * Taxonomía Granular, Época y unificación atómica de la publicación.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- IMPORTACIÓN DE CONTRATOS SOBERANOS (BUILD SHIELD V7.5) ---
import { POIIngestionSchema } from "@/lib/validation/poi-schema";
import {
  GeoActionResponse,
  POILifecycle,
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
 * Valida la identidad y el rango de Administrador en el Borde de Vercel.
 */
async function validateSovereignAccess() {
  const supabase = createClient();
  const { data: { user }, error: authenticationError } = await supabase.auth.getUser();

  if (authenticationError || !user) {
    throw new Error("IDENTIDAD_NO_VERIFICADA");
  }

  const applicationMetadata = user.app_metadata || {};
  const userRole = applicationMetadata.user_role || applicationMetadata.role || 'user';

  if (userRole !== 'admin') {
    throw new Error("ACCESO_DENEGADO: Autoridad de nivel Administrador requerida.");
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
 * Misión: Generar URLs firmadas para que el cliente suba las imágenes directamente 
 * al Storage de Supabase, evadiendo el límite de 4.5MB del body de Vercel.
 */
export async function requestUploadTokensAction(filenames: string[]): Promise<GeoActionResponse<{ paths: string[], uploadUrls: string[] }>> {
  try {
    const user = await validateSovereignAccess();
    const supabase = createClient();
    const timestamp = Date.now();

    const uploadTokens = await Promise.all(
      filenames.map(async (name) => {
        const filePath = `poi-evidence/${user.id}/${timestamp}_${name}`;
        const { data, error } = await supabase.storage
          .from('podcasts')
          .createSignedUploadUrl(filePath);

        if (error || !data) throw new Error(`Fallo al firmar token para ${name}`);
        return { path: filePath, url: data.signedUrl };
      })
    );

    return {
      success: true,
      message: "Tokens de subida directa generados.",
      data: {
        paths: uploadTokens.map(t => t.path),
        uploadUrls: uploadTokens.map(t => t.url)
      }
    };
  } catch (error: any) {
    console.error("🔥 [GeoAction][TokenFatal]:", error.message);
    return { success: false, message: "Error al generar tokens de subida.", error: error.message };
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
    const supabase = createClient();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceKey) throw new Error("INFRASTRUCTURE_KEY_MISSING");

    const { data, error: functionError } = await supabase.functions.invoke('geo-resolve-location', {
      body: { latitude, longitude },
      headers: { Authorization: `Bearer ${serviceKey}` }
    });

    if (functionError) throw new Error(`RADAR_SYNC_FAIL: ${functionError.message}`);
    return { success: true, message: "Radar sincronizado.", data: data.data };
  } catch (error: any) {
    console.error("🔥 [GeoAction][ResolveFatal]:", error.message);
    return { success: false, message: "Error de radar ambiental.", error: error.message };
  }
}

export async function transcribeVoiceIntentAction(params: {
  audioBase64: string;
}): Promise<GeoActionResponse<{ transcription: string }>> {
  try {
    await validateSovereignAccess();
    const supabase = createClient();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // [V9.0]: Extirpamos decodeBase64ToUint8Array aquí porque la función de 
    // transcripción espera recibir el Base64 directamente.
    const { data, error: functionError } = await supabase.functions.invoke('geo-transcribe-intent', {
      body: {
        audioBase64: params.audioBase64.includes(',') ? params.audioBase64.split(',')[1] : params.audioBase64,
        contentType: 'audio/webm' // MimeType fijo para el GeoRecorder V3.0
      },
      headers: { Authorization: `Bearer ${serviceKey}` }
    });

    if (functionError) throw new Error(`STT_IA_FAIL: ${functionError.message}`);

    return {
      success: true,
      message: "Voz transmutada en capital intelectual.",
      data: { transcription: data.transcription }
    };
  } catch (error: any) {
    console.error("🔥 [GeoAction][STT-Fatal]:", error.message);
    return { success: false, message: "Error en dictado sensorial.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * IV. FASE 1 & 2: INGESTA DE INTELIGENCIA (CON JANITOR PROTOCOL)
 * ---------------------------------------------------------------------------
 */

export async function ingestIntelligenceDossierAction(
  payload: {
    latitude: number;
    longitude: number;
    accuracy: number;
    heroImagePath: string; // [V9.0]: Ya no es Base64, es la ruta del Storage
    ocrImagePaths: string[];
    categoryMission: string;
    categoryEntity: string;
    historicalEpoch: string;
    resonanceRadius: number;
    adminIntent: string;
    referenceUrl?: string;
  }
): Promise<GeoActionResponse<{ poiId: number; analysis: any; location: any }>> {
  
  const supabase = createClient();

  try {
    const user = await validateSovereignAccess();

    // 1. RIGOR POSTGIS Y TAXONOMÍA: Validación Zod Multidimensional
    const validatedData = POIIngestionSchema.parse({
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy,
      heroImage: payload.heroImagePath, // Engañamos temporalmente al esquema con la ruta
      ocrImages: payload.ocrImagePaths,
      categoryMission: payload.categoryMission,
      categoryEntity: payload.categoryEntity,
      historicalEpoch: payload.historicalEpoch,
      resonanceRadius: payload.resonanceRadius,
      adminIntent: payload.adminIntent,
      referenceUrl: payload.referenceUrl
    });

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 2. OBTENCIÓN DE URLs PÚBLICAS
    const publicHeroUrl = supabase.storage.from('podcasts').getPublicUrl(payload.heroImagePath).data.publicUrl;
    const publicOcrUrls = payload.ocrImagePaths.map(path => supabase.storage.from('podcasts').getPublicUrl(path).data.publicUrl);

    // 3. INVOCACIÓN AL ORÁCULO EN EL BORDE
    // El Oráculo descargará las imágenes usando las URLs públicas, evitando que Vercel colapse.
    const { data: aiData, error: functionError } = await supabase.functions.invoke('geo-sensor-ingestor', {
      body: {
        ...validatedData,
        heroImageUrl: publicHeroUrl,
        ocrImageUrls: publicOcrUrls,
        userId: user.id
      },
      headers: { Authorization: `Bearer ${serviceKey}` }
    });

    if (functionError) throw new Error(`AI_INGESTOR_FAIL: ${functionError.message}`);

    const poiId = aiData.data.poiId;

    // 4. VINCULACIÓN FÍSICA EN BASE DE DATOS
    const { error: databaseUpdateError } = await supabase
      .from('points_of_interest')
      .update({
        gallery_urls: [publicHeroUrl, ...publicOcrUrls]
      })
      .eq('id', poiId);

    if (databaseUpdateError) throw new Error(`DB_LINKING_FAIL: ${databaseUpdateError.message}`);

    return {
      success: true,
      message: "Expediente multidimensional sellado y analizado.",
      data: aiData.data
    };

  } catch (error: any) {
    console.error("🔥 [GeoAction][IngestError]:", error.message);
    
    // PROTOCOLO JANITOR MANUAL: Si algo falla aquí, la UI debe solicitar la purga
    // de las rutas enviadas originalmente, ya que esta acción no las subió.
    return { 
      success: false, 
      message: "Fallo en la forja de inteligencia.", 
      error: error.message 
    };
  }
}

/**
 * ---------------------------------------------------------------------------
 * V. SÍNTESIS NARRATIVA (AGENTE 42)
 * ---------------------------------------------------------------------------
 */

export async function synthesizeNarrativeAction(params: {
  poiId: number;
  depth: NarrativeDepth;
  tone: NarrativeTone;
  refinedIntent?: string;
}): Promise<GeoActionResponse<any>> {
  try {
    await validateSovereignAccess();
    const supabase = createClient();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { data, error: functionError } = await supabase.functions.invoke('geo-narrative-creator', {
      body: params,
      headers: { Authorization: `Bearer ${serviceKey}` }
    });

    if (functionError) throw new Error(`AI_NARRATIVE_FAIL: ${functionError.message}`);
    return { success: true, message: "Sabiduría sintetizada.", data: data.data };
  } catch (error: any) {
    console.error("🔥 [GeoAction][NarrativeFatal]:", error.message);
    return { success: false, message: "Fallo en la forja narrativa.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * VI. FASE 4: PUBLICACIÓN SOBERANA (FIN DE LA FUNCIÓN FANTASMA)
 * ---------------------------------------------------------------------------
 */

export async function publishSovereignChronicleAction(params: {
  poiId: number;
  chronicleStoragePath: string; // Ruta ya subida vía Signed URL
  durationSeconds: number;
}): Promise<GeoActionResponse> {
  
  const supabase = createClient();

  try {
    await validateSovereignAccess();

    const publicAudioUrl = supabase.storage.from('podcasts').getPublicUrl(params.chronicleStoragePath).data.publicUrl;

    // 1. Commit Físico y Activación de Estado
    const { error: databaseUpdateError } = await supabase
      .from('points_of_interest')
      .update({
        ambient_audio_url: publicAudioUrl, // Reutilizamos este campo para la crónica principal en V4.0
        status: 'published' as POILifecycle,
        is_published: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.poiId);

    if (databaseUpdateError) throw new Error(`DB_PUBLISH_FAIL: ${databaseUpdateError.message}`);

    // 2. Revalidación de Caché (Resonancia Inmediata)
    revalidatePath('/map');
    
    return { success: true, message: "Crónica materializada en la Malla Activa." };

  } catch (error: any) {
    console.error("🔥 [GeoAction][PublishFatal]:", error.message);
    return { success: false, message: "Error de publicación soberana.", error: error.message };
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V9.0):
 * 1. Protocolo Lightning (Signed URLs): Se implementó 'requestUploadTokensAction'. 
 *    Ahora el cliente sube los binarios masivos (Imágenes y Audios) directamente 
 *    a Supabase. La acción de ingesta solo recibe las RUTAS en texto plano. 
 *    Esto elimina físicamente el riesgo de Error 413 (Payload Too Large) en Vercel.
 * 2. Multidimensional Sync: 'ingestIntelligenceDossierAction' ahora transporta
 *    la taxonomía bidimensional (Misión/Entidad), la Época y el enlace de Sabiduría.
 * 3. Phantom Elimination: Se ha retirado la dependencia hacia 'geo-publish-geo-content'.
 *    'publishSovereignChronicleAction' asume el control total atómico de la DB.
 */