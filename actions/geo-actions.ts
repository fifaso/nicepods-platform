// actions/geo-actions.ts
// VERSIÓN: 7.0 (NicePod Sovereign Geo-Actions - Circuit Breaker Edition)
// Misión: Orquestar el ciclo de vida multimodal con garantía de persistencia visual.
// [ESTABILIZACIÓN]: Implementación de Circuit Breaker para subidas críticas (Hero Image).

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- IMPORTACIÓN DE CONTRATOS SOBERANOS (BUILD SHIELD) ---
import {
  POIIngestionSchema
} from "@/lib/validation/poi-schema";
import {
  GeoActionResponse,
  POICreationPayload,
  POILifecycle
} from "@/types/geo-sovereignty";

/**
 * ---------------------------------------------------------------------------
 * I. ESCUDO DE AUTORIDAD (RBAC PROTOCOL)
 * ---------------------------------------------------------------------------
 */

/**
 * validateSovereignAccess:
 * Valida la identidad y el rango del actor directamente en el servidor de Vercel.
 */
async function validateSovereignAccess() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw new Error("IDENTIDAD_NO_VERIFICADA");

  const appMetadata = user.app_metadata || {};
  const userRole = appMetadata.user_role || appMetadata.role || 'user';

  if (userRole !== 'admin') {
    throw new Error("ACCESO_SENSORIAL_DENEGADO: Solo el Administrador puede sembrar memoria.");
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
 * Transmuta capturas Base64 en binarios puros para el Storage de Supabase.
 */
function decodeBase64ToUint8Array(dataString: string) {
  try {
    const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("FORMATO_BINARIO_INVALIDO");
    }

    const contentType = matches[1];
    const base64Content = matches[2];

    // Optimizamos el buffer utilizando la API nativa de Node.js en Vercel
    const buffer = Buffer.from(base64Content, 'base64');

    return { type: contentType, buffer: new Uint8Array(buffer) };
  } catch (e) {
    throw new Error("FALLO_DECODIFICACION: El activo físico está corrupto.");
  }
}

/**
 * ---------------------------------------------------------------------------
 * III. FASE 0: RESOLUCIÓN AMBIENTAL Y COGNITIVA
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

    const { data, error } = await supabase.functions.invoke('geo-resolve-location', {
      body: { latitude, longitude },
      headers: { Authorization: `Bearer ${serviceKey}` }
    });

    if (error) throw new Error(`RADAR_SYNC_FAIL: ${error.message}`);

    return { success: true, message: "Radar sincronizado.", data: data.data };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][Resolve-Fatal]:", error.message);
    return { success: false, message: "Error de radar.", error: error.message };
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

    const { data, error } = await supabase.functions.invoke('geo-transcribe-intent', {
      body: {
        audioBase64: params.audioBase64.split(',')[1],
        contentType: audioData.type
      },
      headers: { Authorization: `Bearer ${serviceKey}` }
    });

    if (error) throw new Error(`TRANSCRIPTION_IA_FAIL: ${error.message}`);

    return {
      success: true,
      message: "Voz transmutada en texto.",
      data: { transcription: data.transcription }
    };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][STT-Fatal]:", error.message);
    return { success: false, message: "Error al interpretar dictado.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * IV. FASE 1: INGESTA SENSORIAL (CIRCUIT BREAKER EDITION)
 * ---------------------------------------------------------------------------
 */

export async function ingestPhysicalEvidenceAction(
  payload: POICreationPayload & { ocrImages?: string[] }
): Promise<GeoActionResponse<{ poiId: number; analysis: any; location: any }>> {
  try {
    const user = await validateSovereignAccess();

    // 1. Validación de Esquema Defensivo
    const validatedData = POIIngestionSchema.parse({
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy,
      heroImage: payload.heroImage,
      categoryId: payload.categoryId,
      resonanceRadius: payload.resonanceRadius,
      adminIntent: payload.adminIntent
    });

    const supabase = createClient();
    const timestamp = Date.now();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    /**
     * 2. CIRCUIT BREAKER: PERSISTENCIA FÍSICA BLOQUEANTE
     * [MANDATO]: No llamamos a la IA hasta que la evidencia esté en el Storage.
     */
    console.info(`🛡️ [Geo-Action] Asegurando evidencia Hero para: ${user.id}`);

    const heroImg = decodeBase64ToUint8Array(payload.heroImage);
    const heroPath = `poi-evidence/${user.id}/${timestamp}_hero.jpg`;

    // Subida BLOQUEANTE con await
    const { error: heroUploadError } = await supabase.storage
      .from('podcasts')
      .upload(heroPath, heroImg.buffer, {
        contentType: heroImg.type,
        upsert: true,
        cacheControl: '3600'
      });

    if (heroUploadError) {
      console.error("🛑 [Circuit-Breaker] Fallo crítico al subir Hero Image:", heroUploadError.message);
      throw new Error("STORAGE_UNAVAILABLE: No se pudo asegurar la evidencia visual principal. Ingesta abortada.");
    }

    /**
     * 3. GESTIÓN DE EVIDENCIA SECUNDARIA (OCR)
     * Usamos allSettled para no abortar si falla una placa OCR, pero registrar el evento.
     */
    let ocrPaths: string[] = [];
    if (payload.ocrImages && payload.ocrImages.length > 0) {
      const ocrTasks = payload.ocrImages.map((base64, i) => {
        const img = decodeBase64ToUint8Array(base64);
        const path = `poi-evidence/${user.id}/${timestamp}_ocr_${i}.jpg`;
        return supabase.storage.from('podcasts').upload(path, img.buffer, { contentType: img.type, upsert: true });
      });

      const ocrResults = await Promise.allSettled(ocrTasks);
      ocrResults.forEach((res, i) => {
        if (res.status === 'fulfilled' && !res.value.error) {
          ocrPaths.push(`poi-evidence/${user.id}/${timestamp}_ocr_${i}.jpg`);
        } else {
          console.warn(`⚠️ [Geo-Action] Fallo no crítico en placa OCR #${i}`);
        }
      });
    }

    /**
     * 4. INVOCACIÓN AL INGESTOR DE IA (ZERO-LOOPBACK)
     * Solo llegamos aquí si el Hero Image está a salvo.
     */
    const { data, error: functionError } = await supabase.functions.invoke('geo-sensor-ingestor', {
      body: {
        ...validatedData,
        heroImageBase64: payload.heroImage,
        ocrImagesBase64: payload.ocrImages || [],
        userId: user.id
      },
      headers: { Authorization: `Bearer ${serviceKey}` }
    });

    if (functionError) throw new Error(`AI_INGESTOR_FAIL: ${functionError.message}`);

    const poiId = data.data.poiId;

    /**
     * 5. VINCULACIÓN DE ACTIVOS EN EL METAL
     * Actualizamos el POI recién creado con las rutas físicas del Storage.
     */
    const publicHeroUrl = supabase.storage.from('podcasts').getPublicUrl(heroPath).data.publicUrl;
    const publicOcrUrls = ocrPaths.map(p => supabase.storage.from('podcasts').getPublicUrl(p).data.publicUrl);

    const { error: dbUpdateError } = await supabase
      .from('points_of_interest')
      .update({
        gallery_urls: [publicHeroUrl, ...publicOcrUrls]
      })
      .eq('id', poiId);

    if (dbUpdateError) console.error("⚠️ [Geo-Action] Error vinculando URLs a DB:", dbUpdateError.message);

    return {
      success: true,
      message: "Evidencia blindada y analizada.",
      data: data.data
    };

  } catch (error: any) {
    const isTooLarge = error.message.includes('exceeded') || error.status === 413;
    const msg = isTooLarge ? "Expediente muy pesado (Máx 4.5MB)." : error.message;
    console.error("🔥 [Geo-Action][Ingest-Error]:", error.message);
    return { success: false, message: "Fallo en la ingesta.", error: msg };
  }
}

/**
 * ---------------------------------------------------------------------------
 * V. FASE 2: ANCLAJE ACÚSTICO (BLOQUEANTE)
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

    // Subida bloqueante para asegurar la inmersión sonora
    const { error: uploadError } = await supabase.storage
      .from('podcasts')
      .upload(audioPath, audioData.buffer, { contentType: audioData.type, upsert: true });

    if (uploadError) throw new Error(`STORAGE_AUDIO_FAIL: No se pudo salvar el paisaje sonoro.`);

    const audioUrl = supabase.storage.from('podcasts').getPublicUrl(audioPath).data.publicUrl;

    const { error: dbError } = await supabase
      .from('points_of_interest')
      .update({ ambient_audio_url: audioUrl })
      .eq('id', params.poiId);

    if (dbError) throw new Error(`DB_AUDIO_LINK_FAIL: Fallo al anclar audio en el metal.`);

    return { success: true, message: "Audio asegurado.", data: { audioUrl } };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][Audio-Fatal]:", error.message);
    return { success: false, message: "Error crítico acústico.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * VI. FASE 3: SÍNTESIS NARRATIVA (ORÁCULO 42)
 * ---------------------------------------------------------------------------
 */

export async function synthesizeNarrativeAction(params: {
  poiId: number;
  depth: 'flash' | 'cronica' | 'inmersion';
  tone: string;
  refinedIntent?: string;
}): Promise<GeoActionResponse<any>> {
  try {
    await validateSovereignAccess();
    const supabase = createClient();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { data, error } = await supabase.functions.invoke('geo-narrative-creator', {
      body: params,
      headers: { Authorization: `Bearer ${serviceKey}` }
    });

    if (error) throw new Error(`AI_NARRATIVE_FAIL: ${error.message}`);
    return { success: true, message: "Crónica sintetizada.", data: data.data };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][Narrative-Fatal]:", error.message);
    return { success: false, message: "Fallo narrativo.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * VII. FASE 4: PUBLICACIÓN FINAL (THE COMMIT)
 * ---------------------------------------------------------------------------
 */

export async function publishPOIAction(poiId: number): Promise<GeoActionResponse> {
  try {
    await validateSovereignAccess();
    const supabase = createClient();

    const { error } = await supabase
      .from('points_of_interest')
      .update({
        status: 'published' as POILifecycle,
        is_published: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', poiId);

    if (error) throw new Error(`DB_PUBLISH_FAIL: ${error.message}`);

    revalidatePath('/map');
    return { success: true, message: "Nodo ONLINE." };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][Publish-Fatal]:", error.message);
    return { success: false, message: "Fallo en publicación.", error: error.message };
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V7.0):
 * 1. Circuit Breaker Industrial: La línea 161 es la barrera de seguridad. Si el 
 *    Storage falla, la función se detiene. No creamos datos incompletos.
 * 2. Optimización Buffer: Se migró de 'atob' a 'Buffer.from' (Línea 75) para 
 *    aprovechar el motor nativo de Node.js, reduciendo el uso de CPU en Vercel.
 * 3. Consistencia Atómica: La actualización de 'gallery_urls' (Línea 211) ocurre 
 *    inmediatamente tras la creación por la IA, cerrando el ciclo de vida del dato.
 */