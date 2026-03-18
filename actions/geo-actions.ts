// actions/geo-actions.ts
// VERSIÓN: 6.1 (NicePod Sovereign Geo-Actions - Multi-Evidence & Error Resilient)
// Misión: Orquestar el ciclo de vida multimodal con tolerancia a fallos y telemetría de errores.
// [ESTABILIZACIÓN]: Gestión de excepciones atómicas para evitar bloqueos en la UI del Admin.

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

/**
 * validateSovereignAccess:
 * Valida la identidad y el rango del actor directamente en el servidor.
 * Es la primera barrera del Build Shield.
 */
async function validateSovereignAccess() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw new Error("IDENTIDAD_NO_VERIFICADA");

  // Validación de Rango Admin innegociable para V2.6
  const appMetadata = user.app_metadata || {};
  const userRole = appMetadata.user_role || appMetadata.role || 'user';

  if (userRole !== 'admin') {
    throw new Error("ACCESO_DENEGADO: Se requiere autoridad de Administrador.");
  }

  return user;
}

/**
 * ---------------------------------------------------------------------------
 * II. UTILIDADES DE PROCESAMIENTO BINARIO (METAL)
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
    throw new Error("FALLO_DECODIFICACION_BINARIA: El activo está corrupto.");
  }
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

    if (!serviceKey) throw new Error("INFRASTRUCTURE_KEY_MISSING");

    const { data, error } = await supabase.functions.invoke('geo-resolve-location', {
      body: { latitude, longitude },
      headers: { Authorization: `Bearer ${serviceKey}` }
    });

    if (error) throw new Error(`EDGE_FUNCTION_FAIL: ${error.message}`);

    return {
      success: true,
      message: "Radar sincronizado con éxito.",
      data: data.data
    };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][Resolve-Error]:", error.message);
    return { success: false, message: "Error al identificar el nodo.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * IV. FASE 1: INGESTA SENSORIAL (MULTI-OCR PIPELINE)
 * ---------------------------------------------------------------------------
 */

export async function ingestPhysicalEvidenceAction(
  payload: POICreationPayload & { ocrImages: string[] }
): Promise<GeoActionResponse<{ poiId: number; analysis: any; location: any }>> {
  try {
    const user = await validateSovereignAccess();

    // Validación de contrato Zod antes de gastar recursos de Storage
    const validatedData = POIIngestionSchema.parse(payload);

    const supabase = createClient();
    const timestamp = Date.now();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 1. Transporte Atómico de Imagen Hero (Captura Principal)
    console.info(`📦 [Geo-Action] Subiendo Imagen Hero para usuario: ${user.id}`);
    const heroImg = decodeBase64ToUint8Array(payload.heroImage);
    const heroPath = `poi-evidence/${user.id}/${timestamp}_hero.jpg`;

    const { error: heroError } = await supabase.storage
      .from('podcasts')
      .upload(heroPath, heroImg.buffer, { contentType: heroImg.type, upsert: true });

    if (heroError) throw new Error(`STORAGE_HERO_FAIL: ${heroError.message}`);
    const heroUrl = supabase.storage.from('podcasts').getPublicUrl(heroPath).data.publicUrl;

    // 2. Transporte Paralelo de Mosaico OCR (Evidencia Secundaria)
    const ocrUrls: string[] = [];
    if (payload.ocrImages && payload.ocrImages.length > 0) {
      console.info(`📦 [Geo-Action] Subiendo mosaico de ${payload.ocrImages.length} fotos OCR.`);

      const uploadTasks = payload.ocrImages.map((base64, index) => {
        const img = decodeBase64ToUint8Array(base64);
        const path = `poi-evidence/${user.id}/${timestamp}_ocr_${index}.jpg`;
        return supabase.storage.from('podcasts').upload(path, img.buffer, {
          contentType: img.type,
          upsert: true
        });
      });

      const uploadResults = await Promise.all(uploadTasks);

      // Verificamos integridad del mosaico
      uploadResults.forEach((res, index) => {
        if (res.error) {
          console.warn(`⚠️ [Geo-Action] Foto OCR #${index} falló: ${res.error.message}`);
        } else {
          const url = supabase.storage.from('podcasts').getPublicUrl(`poi-evidence/${user.id}/${timestamp}_ocr_${index}.jpg`).data.publicUrl;
          ocrUrls.push(url);
        }
      });
    }

    // 3. Invocación del Cerebro Sensorial (Edge Function)
    console.info("🧠 [Geo-Action] Invocando Ingestor Multimodal en el Edge.");
    const { data, error: functionError } = await supabase.functions.invoke('geo-sensor-ingestor', {
      body: {
        ...validatedData,
        heroImage: heroUrl,
        ocrImages: ocrUrls
      },
      headers: { Authorization: `Bearer ${serviceKey}` }
    });

    if (functionError) throw new Error(`AI_INGEST_FAIL: ${functionError.message}`);

    return {
      success: true,
      message: "Expediente visual procesado correctamente.",
      data: data.data
    };

  } catch (error: any) {
    console.error("🔥 [Geo-Action][Ingest-Error]:", error.message);
    return { success: false, message: "Fallo en la ingesta multimodal.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * V. FASE 2: ANCLAJE ACÚSTICO (SOUNDSCAPE INTEGRITY)
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
      message: "Frecuencia ambiental anclada.",
      data: { audioUrl }
    };

  } catch (error: any) {
    console.error("🔥 [Geo-Action][Audio-Error]:", error.message);
    return { success: false, message: "Error al asegurar el activo acústico.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * VI. FASE 3: SÍNTESIS NARRATIVA (AGENTE 42)
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
      message: "Crónica de sabiduría sintetizada.",
      data: data.data
    };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][Narrative-Error]:", error.message);
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

    if (error) throw new Error(`DB_PUBLISH_FAIL: ${error.message}`);

    // Refresco global de la malla urbana
    revalidatePath('/map');

    return {
      success: true,
      message: "Nodo urbano sincronizado con la Bóveda Global."
    };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][Publish-Error]:", error.message);
    return { success: false, message: "Error al materializar el nodo.", error: error.message };
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.1):
 * 1. Mapeo de Errores Operativos: Cada bloque catch ahora devuelve un código de error 
 *    prefijado (ej. STORAGE_HERO_FAIL) para que el equipo de soporte pueda identificar 
 *    instantáneamente el punto de ruptura sin mirar el código.
 * 2. Robustez de Transporte: Se ha blindado la decodificación Base64 para evitar 
 *    que strings mal formateados por el hardware móvil bloqueen el servidor.
 * 3. Atomicidad Parcial: El mosaico de imágenes OCR ahora es resiliente; si una 
 *    foto falla pero las otras dos suben, el proceso continúa para no obligar 
 *    al Admin a repetir toda la captura.
 */