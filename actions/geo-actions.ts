// actions/geo-actions.ts
// VERSIÓN: 6.2 (NicePod Sovereign Geo-Actions - Payload Resilient Edition)
// Misión: Orquestar el ciclo de vida multimodal con tolerancia a fallos de red y tamaño.
// [ESTABILIZACIÓN]: Gestión de Error 413, subida paralela de mosaico y anclaje acústico.

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
 * Garantiza que solo el Administrador pueda inyectar datos en la Malla de Madrid.
 */
async function validateSovereignAccess() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw new Error("IDENTIDAD_NO_VERIFICADA");

  // Verificación estricta de Claims de JWT
  const appMetadata = user.app_metadata || {};
  const userRole = appMetadata.user_role || appMetadata.role || 'user';

  if (userRole !== 'admin') {
    throw new Error("ACCESO_SENSORIAL_DENEGADO: Autoridad insuficiente.");
  }

  return user;
}

/**
 * ---------------------------------------------------------------------------
 * II. UTILIDADES DE PROCESAMIENTO BINARIO (METAL)
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
    const binaryStr = atob(matches[2]);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    return { type: contentType, buffer: bytes };
  } catch (e) {
    throw new Error("FALLO_DECODIFICACION: El activo visual está incompleto o corrupto.");
  }
}

/**
 * ---------------------------------------------------------------------------
 * III. FASE 0: RESOLUCIÓN AMBIENTAL (EL RADAR)
 * ---------------------------------------------------------------------------
 */

/**
 * resolveLocationAction:
 * Identifica el nombre del lugar y el clima para alimentar el HUD del Step 1.
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

    return {
      success: true,
      message: "Radar sincronizado.",
      data: data.data
    };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][Resolve-Fatal]:", error.message);
    return { success: false, message: "Error al identificar el nodo.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * IV. FASE 1: INGESTA SENSORIAL (THE MULTIMODAL PIPELINE)
 * ---------------------------------------------------------------------------
 */

/**
 * ingestPhysicalEvidenceAction:
 * Transporta la captura monumental y el mosaico de placas al Storage y activa la IA.
 * [V6.2]: Manejo explícito de desbordamiento de carga (Error 413).
 */
export async function ingestPhysicalEvidenceAction(
  payload: POICreationPayload
): Promise<GeoActionResponse<{ poiId: number; analysis: any; location: any }>> {
  try {
    const user = await validateSovereignAccess();

    // 1. Validación de esquema Zod
    const validatedData = POIIngestionSchema.parse(payload);

    const supabase = createClient();
    const timestamp = Date.now();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.info(`📦 [Geo-Action] Iniciando despacho multimodal para usuario: ${user.id}`);

    // 2. Transporte de Imagen Hero
    const heroImg = decodeBase64ToUint8Array(payload.heroImage);
    const heroPath = `poi-evidence/${user.id}/${timestamp}_hero.jpg`;

    const { error: heroError } = await supabase.storage
      .from('podcasts')
      .upload(heroPath, heroImg.buffer, { contentType: heroImg.type, upsert: true });

    if (heroError) throw new Error(`STORAGE_HERO_FAIL: ${heroError.message}`);

    // 3. Transporte de Mosaico OCR (Array de imágenes)
    const ocrUrls: string[] = [];
    if (payload.ocrImages && payload.ocrImages.length > 0) {
      const uploadTasks = payload.ocrImages.map((base64, index) => {
        const img = decodeBase64ToUint8Array(base64);
        const path = `poi-evidence/${user.id}/${timestamp}_ocr_${index}.jpg`;
        return supabase.storage.from('podcasts').upload(path, img.buffer, {
          contentType: img.type,
          upsert: true
        });
      });

      const results = await Promise.all(uploadTasks);

      results.forEach((res, index) => {
        if (res.error) {
          console.warn(`⚠️ [Geo-Action] Fallo en foto OCR #${index}: ${res.error.message}`);
        } else {
          const url = supabase.storage.from('podcasts').getPublicUrl(`poi-evidence/${user.id}/${timestamp}_ocr_${index}.jpg`).data.publicUrl;
          ocrUrls.push(url);
        }
      });
    }

    const heroUrl = supabase.storage.from('podcasts').getPublicUrl(heroPath).data.publicUrl;

    // 4. Invocación de Ingestor Multimodal (Edge Function)
    const { data, error: functionError } = await supabase.functions.invoke('geo-sensor-ingestor', {
      body: {
        ...validatedData,
        heroImage: heroUrl,
        ocrImages: ocrUrls
      },
      headers: { Authorization: `Bearer ${serviceKey}` }
    });

    if (functionError) throw new Error(`AI_INGESTOR_FAIL: ${functionError.message}`);

    return {
      success: true,
      message: "Expediente visual asegurado.",
      data: data.data
    };

  } catch (error: any) {
    // [GESTIÓN DE DESBORDAMIENTO V6.2]:
    // Detectamos si el error proviene del límite de 1MB/4MB de la Server Action.
    const isTooLarge = error.message.includes('exceeded') || error.status === 413;
    const readableError = isTooLarge
      ? "Evidencia demasiado pesada (Límite 4MB). Por favor, use imágenes comprimidas."
      : error.message;

    console.error("🔥 [Geo-Action][Ingest-Fatal]:", error.message);
    return { success: false, message: "Fallo en la ingesta.", error: readableError };
  }
}

/**
 * ---------------------------------------------------------------------------
 * V. FASE 2: ANCLAJE ACÚSTICO (SOUNDSCAPE RECOVERY)
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

    return {
      success: true,
      message: "Paisaje sonoro anclado.",
      data: { audioUrl }
    };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][Audio-Fatal]:", error.message);
    return { success: false, message: "Error al asegurar el audio.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * VI. FASE 3: SÍNTESIS NARRATIVA (EL ORÁCULO)
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

    return {
      success: true,
      message: "Crónica forjada por el Agente 42.",
      data: data.data
    };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][Narrative-Fatal]:", error.message);
    return { success: false, message: "Fallo en la síntesis intelectual.", error: error.message };
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

    // Refresco global de la malla urbana
    revalidatePath('/map');

    return {
      success: true,
      message: "Nodo publicado exitosamente."
    };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][Publish-Fatal]:", error.message);
    return { success: false, message: "Fallo en la activación del nodo.", error: error.message };
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.2):
 * 1. Resiliencia de Carga: La Action es ahora consciente de los límites de 
 *    infraestructura (Vercel Action Body Limit). Captura el error 413 y lo 
 *    traduce para el Admin, evitando el "cuadro rojo de pánico" de Next.js.
 * 2. Cero Abreviaciones: Se ha mantenido el rigor en cada bloque de error 
 *    para garantizar que el sistema sea 100% auditable.
 * 3. Mosaico Multimodal Pro: El transporte paralelo de hasta 3 fotos OCR 
 *    maximiza la densidad de información que recibe el Agente 42, 
 *    sin penalizar el tiempo de respuesta.
 */