// actions/geo-actions.ts
// VERSIÓN: 6.0 (NicePod Sovereign Geo-Actions - Multi-Evidence Pro)
// Misión: Orquestar el ciclo de vida multimodal con soporte para colecciones de evidencia.
// [ESTABILIZACIÓN]: Implementación de subida múltiple OCR, anclaje acústico y tipado estricto.

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- IMPORTACIÓN DE CONTRATOS SOBERANOS ---
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
 * II. UTILIDADES BINARIAS (METAL CORE)
 * ---------------------------------------------------------------------------
 */

function decodeBase64ToUint8Array(dataString: string) {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("CAPTURA_CORRUPTA: Formato binario no reconocido.");
  }

  const contentType = matches[1];
  const binaryStr = atob(matches[2]);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  return { type: contentType, buffer: bytes };
}

/**
 * ---------------------------------------------------------------------------
 * III. FASE 0: RESOLUCIÓN AMBIENTAL (EL RADAR)
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

    const { data, error } = await supabase.functions.invoke('geo-resolve-location', {
      body: { latitude, longitude },
      headers: { Authorization: `Bearer ${serviceKey}` }
    });

    if (error) throw error;

    return {
      success: true,
      message: "Radar sincronizado con éxito.",
      data: data.data
    };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][Resolve]:", error.message);
    return { success: false, message: "Error al identificar el nodo.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * IV. FASE 1: INGESTA SENSORIAL (THE SENSES - MULTI-OCR)
 * ---------------------------------------------------------------------------
 */

export async function ingestPhysicalEvidenceAction(
  payload: POICreationPayload & { ocrImages: string[] } // [V6.0]: Array de imágenes Base64
): Promise<GeoActionResponse<{ poiId: number; analysis: any; location: any }>> {
  try {
    const user = await validateSovereignAccess();

    // [RIGOR]: Validación de esquema antes de iniciar transporte pesado.
    const validatedData = POIIngestionSchema.parse(payload);

    const supabase = createClient();
    const timestamp = Date.now();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 1. Transporte Atómico de Imagen Hero
    const heroImg = decodeBase64ToUint8Array(payload.heroImage);
    const heroPath = `poi-evidence/${user.id}/${timestamp}_hero.jpg`;

    const { error: heroError } = await supabase.storage
      .from('podcasts')
      .upload(heroPath, heroImg.buffer, { contentType: heroImg.type, upsert: true });

    if (heroError) throw heroError;
    const heroUrl = supabase.storage.from('podcasts').getPublicUrl(heroPath).data.publicUrl;

    // 2. Transporte Paralelo de Colección OCR (Mosaico de Evidencia)
    const ocrUrls: string[] = [];
    if (payload.ocrImages && payload.ocrImages.length > 0) {
      const uploadTasks = payload.ocrImages.map((base64, index) => {
        const img = decodeBase64ToUint8Array(base64);
        const path = `poi-evidence/${user.id}/${timestamp}_ocr_${index}.jpg`;
        return supabase.storage.from('podcasts').upload(path, img.buffer, { contentType: img.type, upsert: true });
      });

      const uploadResults = await Promise.all(uploadTasks);

      // Recuperamos las URLs públicas de las subidas exitosas
      uploadResults.forEach((res, index) => {
        if (!res.error) {
          const url = supabase.storage.from('podcasts').getPublicUrl(`poi-evidence/${user.id}/${timestamp}_ocr_${index}.jpg`).data.publicUrl;
          ocrUrls.push(url);
        }
      });
    }

    // 3. Invocación del Ingestor Multimodal (Entrega de Mosaico)
    const { data, error: functionError } = await supabase.functions.invoke('geo-sensor-ingestor', {
      body: {
        ...validatedData,
        heroImage: heroUrl,
        ocrImages: ocrUrls // Enviamos el array completo de URLs
      },
      headers: { Authorization: `Bearer ${serviceKey}` }
    });

    if (functionError) throw functionError;

    return {
      success: true,
      message: "Expediente visual procesado.",
      data: data.data
    };

  } catch (error: any) {
    console.error("🔥 [Geo-Action][Ingest]:", error.message);
    return { success: false, message: "Fallo en la ingesta multimodal.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * V. FASE 2: ANCLAJE ACÚSTICO (THE SOUNDSCAPE)
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

    // 1. Subida Segura al Storage
    const { error: uploadError } = await supabase.storage
      .from('podcasts')
      .upload(audioPath, audioData.buffer, { contentType: audioData.type, upsert: true });

    if (uploadError) throw uploadError;

    const audioUrl = supabase.storage.from('podcasts').getPublicUrl(audioPath).data.publicUrl;

    // 2. Anclaje en la Bóveda Principal
    const { error: dbError } = await supabase
      .from('points_of_interest')
      .update({ ambient_audio_url: audioUrl })
      .eq('id', params.poiId);

    if (dbError) throw dbError;

    return {
      success: true,
      message: "Frecuencia ambiental anclada.",
      data: { audioUrl }
    };

  } catch (error: any) {
    console.error("🔥 [Geo-Action][Audio]:", error.message);
    return { success: false, message: "Error al asegurar el activo acústico.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * VI. FASE 3: SÍNTESIS NARRATIVA (THE ORACLE)
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

    return {
      success: true,
      message: "Crónica de sabiduría sintetizada.",
      data: data.data
    };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][Narrative]:", error.message);
    return { success: false, message: "Fallo en la forja intelectual.", error: error.message };
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

    if (error) throw error;

    revalidatePath('/map');

    return {
      success: true,
      message: "Nodo urbano activo en la frecuencia global."
    };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][Publish]:", error.message);
    return { success: false, message: "Error al materializar el nodo.", error: error.message };
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Mosaico de Evidencia: La Action ahora soporta el envío de múltiples URLs 
 *    de placas al Ingestor Multimodal, permitiendo una extracción de datos 
 *    mucho más rica desde diferentes ángulos físicos.
 * 2. Rendimiento SSR: El uso de 'uploadTasks' con Promise.all() garantiza que 
 *    el Admin no perciba una suma de latencias; la subida de 3 fotos tarda 
 *    prácticamente lo mismo que la subida de una sola.
 * 3. Seguridad de Metal: El chequeo de 'userRole' contra 'app_metadata' es 
 *    imperativo para proteger el bucket de Storage contra usuarios malintencionados.
 */