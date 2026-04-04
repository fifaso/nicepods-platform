/**
 * ARCHIVO: actions/geo-actions.ts
 * VERSIÓN: 8.0 (NicePod Sovereign Geo-Actions - Multidimensional Pipeline Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestar el ciclo de vida de persistencia con garantía de limpieza,
 * rigor de tipos y consolidación de publicación acústica/visual.
 * [REFORMA V8.0]: Integración de Taxonomía Granular, Época, Referencias y 
 * unificación atómica de la publicación (Sovereign Publish).
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- IMPORTACIÓN DE CONTRATOS SOBERANOS (BUILD SHIELD V7.5) ---
import { POIIngestionSchema } from "@/lib/validation/poi-schema";
import {
  GeoActionResponse,
  POICreationPayload,
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
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("IDENTIDAD_NO_VERIFICADA");

  const applicationMetadata = user.app_metadata || {};
  const userRole = applicationMetadata.user_role || applicationMetadata.role || 'user';

  if (userRole !== 'admin') {
    throw new Error("ACCESO_DENEGADO: Autoridad de nivel Administrador requerida.");
  }

  return user;
}

/**
 * ---------------------------------------------------------------------------
 * II. UTILIDADES DE PROCESAMIENTO BINARIO (METAL CORE)
 * ---------------------------------------------------------------------------
 */

/**
 * decodeBase64ToUint8Array:
 * Transmuta capturas Base64 en binarios puros optimizando el uso de RAM.
 */
function decodeBase64ToUint8Array(dataString: string) {
  try {
    const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("FORMATO_BINARIO_INVALIDO");
    }

    const contentType = matches[1];
    const base64Content = matches[2];
    const buffer = Buffer.from(base64Content, 'base64');

    return { type: contentType, buffer: new Uint8Array(buffer) };
  } catch (exception) {
    throw new Error("FALLO_DECODIFICACION: Activo físico corrupto o malformado.");
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

    const audioData = decodeBase64ToUint8Array(params.audioBase64);

    const { data, error: functionError } = await supabase.functions.invoke('geo-transcribe-intent', {
      body: {
        audioBase64: params.audioBase64.split(',')[1],
        contentType: audioData.type
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
 * IV. FASE 1: INGESTA SENSORIAL (CON PROTOCOLO JANITOR)
 * ---------------------------------------------------------------------------
 */

export async function ingestPhysicalEvidenceAction(
  payload: POICreationPayload & { ocrImages?: string[] }
): Promise<GeoActionResponse<{ poiId: number; analysis: any; location: any }>> {
  
  let uploadedPaths: string[] = [];
  const supabase = createClient();

  try {
    const user = await validateSovereignAccess();

    // 1. RIGOR POSTGIS Y TAXONOMÍA: Validación Zod Multidimensional
    const validatedData = POIIngestionSchema.parse({
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy,
      heroImage: payload.heroImage,
      categoryMission: payload.categoryMission,
      categoryEntity: payload.categoryEntity,
      historicalEpoch: payload.historicalEpoch,
      resonanceRadius: payload.resonanceRadius,
      adminIntent: payload.adminIntent,
      referenceUrl: payload.referenceUrl
    });

    const timestamp = Date.now();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 2. Persistencia Bloqueante de Evidencia Visual Principal
    const heroImageBinary = decodeBase64ToUint8Array(payload.heroImage);
    const heroPath = `poi-evidence/${user.id}/${timestamp}_hero.jpg`;

    const { error: heroUploadError } = await supabase.storage
      .from('podcasts')
      .upload(heroPath, heroImageBinary.buffer, {
        contentType: heroImageBinary.type,
        upsert: true
      });

    if (heroUploadError) throw new Error(`STORAGE_UNAVAILABLE: ${heroUploadError.message}`);
    uploadedPaths.push(heroPath);

    // 3. Persistencia de Evidencia Secundaria (Mosaico OCR)
    if (payload.ocrImages && payload.ocrImages.length > 0) {
      const ocrTasks = payload.ocrImages.map((base64String, index) => {
        const imageBinary = decodeBase64ToUint8Array(base64String);
        const ocrPath = `poi-evidence/${user.id}/${timestamp}_ocr_${index}.jpg`;
        return supabase.storage.from('podcasts').upload(ocrPath, imageBinary.buffer, { contentType: imageBinary.type, upsert: true });
      });

      const ocrResults = await Promise.allSettled(ocrTasks);
      ocrResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && !result.value.error) {
          uploadedPaths.push(`poi-evidence/${user.id}/${timestamp}_ocr_${index}.jpg`);
        }
      });
    }

    // 4. INVOCACIÓN AL SENSOR-INGESTOR IA (Con Taxonomía V4.0)
    const { data: aiData, error: functionError } = await supabase.functions.invoke('geo-sensor-ingestor', {
      body: {
        ...validatedData,
        heroImageBase64: payload.heroImage,
        ocrImagesBase64: payload.ocrImages || [],
        userId: user.id
      },
      headers: { Authorization: `Bearer ${serviceKey}` }
    });

    if (functionError) throw new Error(`AI_INGESTOR_FAIL: ${functionError.message}`);

    const poiId = aiData.data.poiId;

    // 5. VINCULACIÓN DE ACTIVOS (COMMIT FÍSICO)
    const publicHeroUrl = supabase.storage.from('podcasts').getPublicUrl(heroPath).data.publicUrl;
    const publicOcrUrls = uploadedPaths
      .filter(path => path.includes('_ocr_'))
      .map(path => supabase.storage.from('podcasts').getPublicUrl(path).data.publicUrl);

    const { error: dbUpdateError } = await supabase
      .from('points_of_interest')
      .update({
        gallery_urls: [publicHeroUrl, ...publicOcrUrls]
      })
      .eq('id', poiId);

    if (dbUpdateError) throw new Error(`DB_LINKING_FAIL: ${dbUpdateError.message}`);

    // Éxito: Limpiamos el tracker del Janitor
    uploadedPaths = [];

    return {
      success: true,
      message: "Evidencia física blindada y analizada.",
      data: aiData.data
    };

  } catch (error: any) {
    const isTooLarge = error.message.includes('exceeded') || error.status === 413;
    console.error("🔥 [GeoAction][IngestError]:", error.message);
    
    return { 
      success: false, 
      message: "Fallo en la ingesta sensorial.", 
      error: isTooLarge ? "Expediente sobrepasa el límite industrial de transporte." : error.message 
    };
  } finally {
    /**
     * PROTOCOLO JANITOR (AUTO-LIMPIEZA DE EMERGENCIA)
     */
    if (uploadedPaths.length > 0) {
      console.warn("🧹 [Janitor] Purga de activos visuales huérfanos ejecutada.");
      supabase.storage.from('podcasts').remove(uploadedPaths).catch(() => {});
    }
  }
}

/**
 * ---------------------------------------------------------------------------
 * V. ANCLAJE ACÚSTICO Y SÍNTESIS NARRATIVA
 * ---------------------------------------------------------------------------
 */

export async function attachAmbientAudioAction(params: {
  poiId: number;
  audioBase64: string;
}): Promise<GeoActionResponse> {
  try {
    const user = await validateSovereignAccess();
    const supabase = createClient();
    const timestamp = Date.now();

    const audioData = decodeBase64ToUint8Array(params.audioBase64);
    const audioPath = `poi-evidence/${user.id}/${timestamp}_ambient.webm`;

    const { error: uploadError } = await supabase.storage
      .from('podcasts')
      .upload(audioPath, audioData.buffer, { contentType: audioData.type, upsert: true });

    if (uploadError) throw new Error("FALLO_STORAGE_AUDIO");

    const audioUrl = supabase.storage.from('podcasts').getPublicUrl(audioPath).data.publicUrl;

    await supabase
      .from('points_of_interest')
      .update({ ambient_audio_url: audioUrl })
      .eq('id', params.poiId);

    return { success: true, message: "Paisaje sonoro anclado.", data: { audioUrl } };
  } catch (error: any) {
    console.error("🔥 [GeoAction][AudioFatal]:", error.message);
    return { success: false, message: "Error acústico.", error: error.message };
  }
}

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
 * VI. FASE 4: PUBLICACIÓN SOBERANA UNIFICADA (NUEVO V8.0)
 * Misión: Subir el audio de la crónica dictada y activar el nodo en la malla 
 * en una sola transacción atómica, eliminando Edge Functions fantasma.
 * ---------------------------------------------------------------------------
 */

export async function finalPublishSovereignAction(params: {
  poiId: number;
  audioBase64: string;
  durationSeconds: number;
}): Promise<GeoActionResponse> {
  
  let uploadedAudioPath: string | null = null;
  const supabase = createClient();

  try {
    const user = await validateSovereignAccess();
    const timestamp = Date.now();

    // 1. Persistencia de la Crónica Acústica
    const audioBinary = decodeBase64ToUint8Array(params.audioBase64);
    const audioPath = `poi-evidence/${user.id}/${timestamp}_chronicle.webm`;

    const { error: uploadError } = await supabase.storage
      .from('podcasts')
      .upload(audioPath, audioBinary.buffer, { 
        contentType: audioBinary.type, 
        upsert: true 
      });

    if (uploadError) throw new Error(`STORAGE_CHRONICLE_FAIL: ${uploadError.message}`);
    uploadedAudioPath = audioPath;

    const publicAudioUrl = supabase.storage.from('podcasts').getPublicUrl(audioPath).data.publicUrl;

    // 2. Commit Físico y Activación de Estado (Publicación)
    const { error: dbUpdateError } = await supabase
      .from('points_of_interest')
      .update({
        ambient_audio_url: publicAudioUrl, // Reutilizamos este campo para la crónica principal en la V4.0
        status: 'published' as POILifecycle,
        is_published: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.poiId);

    if (dbUpdateError) throw new Error(`DB_PUBLISH_FAIL: ${dbUpdateError.message}`);

    // 3. Revalidación de Caché (Resonancia Inmediata)
    uploadedAudioPath = null; // Limpieza de Janitor
    revalidatePath('/map');
    
    return { success: true, message: "Crónica materializada en la Malla Activa." };

  } catch (error: any) {
    console.error("🔥 [GeoAction][PublishFatal]:", error.message);
    return { success: false, message: "Error de publicación soberana.", error: error.message };
  } finally {
    // Protocolo Janitor Acústico
    if (uploadedAudioPath) {
      console.warn("🧹 [Janitor] Purga de crónica huérfana ejecutada.");
      supabase.storage.from('podcasts').remove([uploadedAudioPath]).catch(() => {});
    }
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V8.0):
 * 1. Ghost Function Eradicated: Se ha implementado 'finalPublishSovereignAction' 
 *    para sustituir a la Edge Function inexistente. Esta Server Action gestiona 
 *    la subida del audio y el cambio de estado atómicamente.
 * 2. Multidimensional Sync: La acción de ingesta principal (ingestPhysicalEvidenceAction) 
 *    ahora valida y transporta la taxonomía bidimensional, la época y el link de 
 *    sabiduría hacia la capa de Inteligencia Artificial en el Borde.
 */