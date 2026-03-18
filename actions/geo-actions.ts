// actions/geo-actions.ts
// VERSIÓN: 6.4 (NicePod Sovereign Geo-Actions - Full Resilience Edition)
// Misión: Orquestar el ciclo de vida multimodal incluyendo transcripción de voz (STT).
// [ESTABILIZACIÓN]: Soporte para mosaico OCR opcional y blindaje de inyección de userId.

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
 * Valida la identidad y el rango del actor directamente en el servidor.
 */
async function validateSovereignAccess() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw new Error("IDENTIDAD_NO_VERIFICADA");

  const appMetadata = user.app_metadata || {};
  const userRole = appMetadata.user_role || appMetadata.role || 'user';

  if (userRole !== 'admin') {
    throw new Error("ACCESO_SENSORIAL_DENEGADO: Autoridad insuficiente.");
  }

  return user;
}

/**
 * ---------------------------------------------------------------------------
 * II. UTILIDADES DE PROCESAMIENTO BINARIO (METAL CORE)
 * ---------------------------------------------------------------------------
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

/**
 * resolveLocationAction:
 * Identifica nombre y clima para el HUD inicial.
 */
export async function resolveLocationAction(
  latitude: number,
  longitude: number
): Promise<GeoActionResponse<any>> {
  try {
    await validateSovereignAccess();
    const supabase = createClient();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

/**
 * transcribeVoiceIntentAction (NUEVO V6.3):
 * Pasarela hacia la IA para convertir el dictado del Admin en texto editable.
 */
export async function transcribeVoiceIntentAction(params: {
  audioBase64: string;
}): Promise<GeoActionResponse<{ transcription: string }>> {
  try {
    await validateSovereignAccess();
    const supabase = createClient();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.info("🎙️ [Geo-Action] Solicitando transcripción neuronal de intención.");

    const audioData = decodeBase64ToUint8Array(params.audioBase64);

    const { data, error } = await supabase.functions.invoke('geo-transcribe-intent', {
      body: {
        audioBase64: params.audioBase64.split(',')[1], // Solo la data pura
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
 * IV. FASE 1: INGESTA SENSORIAL (MULTIMODAL PRO)
 * ---------------------------------------------------------------------------
 */

export async function ingestPhysicalEvidenceAction(
  payload: POICreationPayload & { ocrImages?: string[] } // [V6.4]: El array es opcional
): Promise<GeoActionResponse<{ poiId: number; analysis: any; location: any }>> {
  try {
    const user = await validateSovereignAccess();

    // Validamos estrictamente solo los campos que pide el esquema de Zod
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

    // 1. Hero Image
    const heroImg = decodeBase64ToUint8Array(payload.heroImage);
    const heroPath = `poi-evidence/${user.id}/${timestamp}_hero.jpg`;
    await supabase.storage.from('podcasts').upload(heroPath, heroImg.buffer, { contentType: heroImg.type, upsert: true });
    const heroUrl = supabase.storage.from('podcasts').getPublicUrl(heroPath).data.publicUrl;

    // 2. OCR Mosaico (Opcional)
    const ocrUrls: string[] = [];
    if (payload.ocrImages && payload.ocrImages.length > 0) {
      const uploadTasks = payload.ocrImages.map((base64, i) => {
        const img = decodeBase64ToUint8Array(base64);
        const path = `poi-evidence/${user.id}/${timestamp}_ocr_${i}.jpg`;
        return supabase.storage.from('podcasts').upload(path, img.buffer, { contentType: img.type, upsert: true });
      });
      const results = await Promise.all(uploadTasks);
      results.forEach((res, i) => {
        if (!res.error) ocrUrls.push(supabase.storage.from('podcasts').getPublicUrl(`poi-evidence/${user.id}/${timestamp}_ocr_${i}.jpg`).data.publicUrl);
      });
    }

    // 3. IA Sensorial (Ingestor)
    const { data, error } = await supabase.functions.invoke('geo-sensor-ingestor', {
      body: {
        ...validatedData,
        heroImage: heroUrl,
        ocrImages: ocrUrls, // Mosaico de URLs o vacío
        userId: user.id     // [MANDATO]: Inyección para anclaje PostGIS
      },
      headers: { Authorization: `Bearer ${serviceKey}` }
    });

    if (error) throw new Error(error.message);

    return { success: true, message: "Dossier capturado.", data: data.data };
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

    const { error } = await supabase.storage.from('podcasts').upload(audioPath, audioData.buffer, { contentType: audioData.type, upsert: true });
    if (error) throw error;

    const url = supabase.storage.from('podcasts').getPublicUrl(audioPath).data.publicUrl;
    await supabase.from('points_of_interest').update({ ambient_audio_url: url }).eq('id', params.poiId);

    return { success: true, message: "Audio anclado.", data: { url } };
  } catch (error: any) {
    return { success: false, message: "Fallo acústico.", error: error.message };
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

    if (error) throw error;
    return { success: true, message: "Crónica sintetizada.", data: data.data };
  } catch (error: any) {
    return { success: false, message: "Fallo narrativo.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * VII. FASE 4: PUBLICACIÓN FINAL
 * ---------------------------------------------------------------------------
 */

export async function publishPOIAction(poiId: number): Promise<GeoActionResponse> {
  try {
    await validateSovereignAccess();
    const supabase = createClient();

    const { error } = await supabase.from('points_of_interest').update({ status: 'published' as POILifecycle, is_published: true }).eq('id', poiId);
    if (error) throw error;

    revalidatePath('/map');
    return { success: true, message: "Nodo ONLINE." };
  } catch (error: any) {
    return { success: false, message: "Fallo en publicación.", error: error.message };
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.4):
 * 1. Resolución Zod: Al destrabar el esquema de validación y pasar explícitamente 
 *    los campos a POIIngestionSchema.parse, evitamos que Zod rechace un payload 
 *    perfectamente válido solo por contener el array de OCR extra.
 * 2. Inyección de Soberanía: 'userId' ha sido asegurado en el payload hacia 
 *    la Edge Function para garantizar el anclaje RLS en la base de datos.
 */