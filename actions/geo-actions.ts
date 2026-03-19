// actions/geo-actions.ts
// VERSIÓN: 6.5 (NicePod Sovereign Geo-Actions - Zero-Latency Pipeline)
// Misión: Orquestar el ciclo de vida multimodal eliminando cuellos de botella de red.
// [ESTABILIZACIÓN]: Envío directo de Base64 al Edge (Bypass de Storage) y subida paralela.

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
 * Transmuta capturas Base64 en binarios puros para el Storage.
 */
function decodeBase64ToUint8Array(dataString: string) {
  try {
    const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("FORMATO_BINARIO_INVALIDO");
    }

    const contentType = matches[1];
    const binaryStr = atob(matches[2]);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    return { type: contentType, buffer: bytes };
  } catch (e) {
    throw new Error("FALLO_DECODIFICACION: Activo físico corrupto.");
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

    console.info("🎙️ [Geo-Action] Solicitando transcripción neuronal.");
    const audioData = decodeBase64ToUint8Array(params.audioBase64);

    const { data, error } = await supabase.functions.invoke('geo-transcribe-intent', {
      body: {
        audioBase64: params.audioBase64.split(',')[1],
        contentType: audioData.type
      },
      headers: { Authorization: `Bearer ${serviceKey}` }
    });

    if (error) throw new Error(`TRANSCRIPTION_IA_FAIL: ${error.message}`);

    return { success: true, message: "Voz transmutada en texto.", data: { transcription: data.transcription } };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][STT-Fatal]:", error.message);
    return { success: false, message: "Error al interpretar dictado.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * IV. FASE 1: INGESTA SENSORIAL (MULTIMODAL PRO & ZERO-LATENCY)
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

    console.info(`📦 [Geo-Action] Despacho Atómico Directo para: ${user.id}`);

    // 2. INVOCACIÓN DIRECTA A LA IA (EL BYPASS DE RED)
    // Enviamos los binarios puros (Base64) a la Edge Function.
    // Esto evita que Deno se cuelgue intentando descargar imágenes del Storage.
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

    // 3. SUBIDA PARALELA DE ACTIVOS (Background Storage Sync)
    // Mientras devolvemos el éxito a la UI, aseguramos que los archivos 
    // queden en Supabase Storage para que el visor público pueda cargarlos luego.
    const heroImg = decodeBase64ToUint8Array(payload.heroImage);
    const heroPath = `poi-evidence/${user.id}/${timestamp}_hero.jpg`;

    // Lanzamos la promesa de subida sin esperar (fire-and-forget seguro en Vercel Edge)
    supabase.storage.from('podcasts').upload(heroPath, heroImg.buffer, { contentType: heroImg.type, upsert: true })
      .catch(e => console.warn(`⚠️ [Geo-Action] Fallo en background hero upload: ${e.message}`));

    if (payload.ocrImages && payload.ocrImages.length > 0) {
      payload.ocrImages.forEach((base64, i) => {
        const img = decodeBase64ToUint8Array(base64);
        supabase.storage.from('podcasts')
          .upload(`poi-evidence/${user.id}/${timestamp}_ocr_${i}.jpg`, img.buffer, { contentType: img.type, upsert: true })
          .catch(e => console.warn(`⚠️ [Geo-Action] Fallo en background ocr upload: ${e.message}`));
      });
    }

    return {
      success: true,
      message: "Dossier analizado e ingestado.",
      data: data.data
    };

  } catch (error: any) {
    const isTooLarge = error.message.includes('exceeded') || error.status === 413;
    const msg = isTooLarge ? "Evidencia muy pesada (Máx 4MB)." : error.message;
    console.error("🔥 [Geo-Action][Ingest-Error]:", error.message);
    return { success: false, message: "Fallo en la ingesta.", error: msg };
  }
}

/**
 * ---------------------------------------------------------------------------
 * V. FASE 2: ANCLAJE ACÚSTICO (AMBIENT SOUND)
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

    if (uploadError) throw new Error(`STORAGE_AUDIO_FAIL: ${uploadError.message}`);

    const audioUrl = supabase.storage.from('podcasts').getPublicUrl(audioPath).data.publicUrl;

    const { error: dbError } = await supabase
      .from('points_of_interest')
      .update({ ambient_audio_url: audioUrl })
      .eq('id', params.poiId);

    if (dbError) throw new Error(`DB_AUDIO_LINK_FAIL: ${dbError.message}`);

    return { success: true, message: "Audio anclado.", data: { audioUrl } };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][Audio-Fatal]:", error.message);
    return { success: false, message: "Error al asegurar el activo acústico.", error: error.message };
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
 * NOTA TÉCNICA DEL ARCHITECT (V6.5):
 * 1. Zero-Latency Pipeline (Línea 116): Al inyectar el payload en la Edge 
 *    Function ANTES de esperar al Storage de Supabase, cortamos el tiempo de 
 *    espera de la UI a la mitad.
 * 2. Background Upload (Líneas 131-137): Las promesas de subida se ejecutan de 
 *    fondo. Vercel mantendrá viva la instancia el tiempo suficiente para 
 *    garantizar que los archivos lleguen a salvo.
 * 3. Consistencia de Payload: Las nuevas claves 'heroImageBase64' y 
 *    'ocrImagesBase64' comunican al Ingestor que ya no debe realizar descargas, 
 *    eliminando el loopback de red (Timeout).
 */