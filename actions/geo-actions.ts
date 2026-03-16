// actions/geo-actions.ts
// VERSIÓN: 5.0 (NicePod Sovereign Geo-Actions - Full Multimodal Edition)
// Misión: Orquestar el ciclo de vida de los POIs: Ingesta -> Audio -> Narración -> Publicación.
// [ESTABILIZACIÓN]: Integración de subida de Audio Ambiente y refuerzo de tipos V12.5.

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
 * Valida la identidad y el rango del actor antes de permitir mutaciones en la malla.
 * [V2.6]: Restringido a Administradores para garantizar la calidad de la siembra.
 */
async function validateSovereignAccess() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw new Error("IDENTIDAD_NO_DETECTADA");

  // Verificamos el rol en los metadatos del JWT (Auth Soberana)
  const appMetadata = user.app_metadata || {};
  const userRole = appMetadata.user_role || appMetadata.role || 'user';

  if (userRole !== 'admin') {
    throw new Error("ACCESO_DENEGADO: Se requiere rango de Administrador.");
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
 * Transmuta capturas Base64 (Fotos o Audio) en binarios puros para el Storage.
 * Optimizada para el entorno de ejecución de Vercel y Supabase.
 */
function decodeBase64ToUint8Array(dataString: string) {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("ACTIVO_CORRUPTO: El formato base64 no es válido.");
  }

  const contentType = matches[1];
  const byteCharacters = atob(matches[2]);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  return {
    type: contentType,
    buffer: new Uint8Array(byteNumbers)
  };
}

/**
 * ---------------------------------------------------------------------------
 * III. FASE 1: INGESTA SENSORIAL (THE SENSES)
 * ---------------------------------------------------------------------------
 */

/**
 * ingestPhysicalEvidenceAction:
 * Procesa la evidencia visual y disparar la IA de análisis OCR/Multimodal.
 */
export async function ingestPhysicalEvidenceAction(
  payload: POICreationPayload
): Promise<GeoActionResponse> {
  try {
    const user = await validateSovereignAccess();

    // Validación perimetral con Zod (Build Shield)
    const validatedData = POIIngestionSchema.parse(payload);

    const supabase = createClient();
    const timestamp = Date.now();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // A. Transporte de Imagen Hero (Captura Monumental)
    const heroImg = decodeBase64ToUint8Array(validatedData.heroImage);
    const heroPath = `poi-evidence/${user.id}/${timestamp}_hero.jpg`;

    const { error: heroError } = await supabase.storage
      .from('podcasts')
      .upload(heroPath, heroImg.buffer, {
        contentType: heroImg.type,
        upsert: true,
        cacheControl: '3600'
      });

    if (heroError) throw heroError;

    // B. Transporte de Imagen OCR (Opcional - Evidencial)
    let ocrUrl = undefined;
    if (validatedData.ocrImage) {
      const ocrImg = decodeBase64ToUint8Array(validatedData.ocrImage);
      const ocrPath = `poi-evidence/${user.id}/${timestamp}_ocr.jpg`;

      const { error: ocrError } = await supabase.storage
        .from('podcasts')
        .upload(ocrPath, ocrImg.buffer, {
          contentType: ocrImg.type,
          upsert: true
        });

      if (!ocrError) {
        ocrUrl = supabase.storage.from('podcasts').getPublicUrl(ocrPath).data.publicUrl;
      }
    }

    const heroUrl = supabase.storage.from('podcasts').getPublicUrl(heroPath).data.publicUrl;

    // C. Invocación del Cerebro Sensorial (Edge Function)
    const { data, error: functionError } = await supabase.functions.invoke('geo-sensor-ingestor', {
      body: {
        ...validatedData,
        heroImage: heroUrl,
        ocrImage: ocrUrl
      },
      headers: { Authorization: `Bearer ${serviceKey}` }
    });

    if (functionError) throw functionError;

    return {
      success: true,
      message: "Ingesta multimodal completada. Dossier listo para revisión.",
      data: data.data // Incluye poiId y análisis inicial
    };

  } catch (error: any) {
    console.error("🔥 [Geo-Action][Ingest]:", error.message);
    return { success: false, message: "Fallo en la captura de evidencia.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * IV. FASE 2: ANCLAJE ACÚSTICO (THE SOUNDSCAPE) - NUEVO V5.0
 * ---------------------------------------------------------------------------
 */

/**
 * attachAmbientAudioAction:
 * Sube el audio grabado en campo y lo vincula al POI.
 * Misión: Capturar la "vibración" real del lugar.
 */
export async function attachAmbientAudioAction(params: {
  poiId: number;
  audioBase64: string;
}): Promise<GeoActionResponse> {
  try {
    const user = await validateSovereignAccess();
    const supabase = createClient();
    const timestamp = Date.now();

    console.info(`🔊 [Geo-Action] Anclando audio ambiente a POI #${params.poiId}`);

    const audioData = decodeBase64ToUint8Array(params.audioBase64);
    const audioPath = `poi-evidence/${user.id}/${timestamp}_ambient.webm`;

    // 1. Subida al Storage
    const { error: uploadError } = await supabase.storage
      .from('podcasts')
      .upload(audioPath, audioData.buffer, {
        contentType: audioData.type,
        upsert: true
      });

    if (uploadError) throw uploadError;

    const audioUrl = supabase.storage.from('podcasts').getPublicUrl(audioPath).data.publicUrl;

    // 2. Vinculación en Base de Datos
    const { error: dbError } = await supabase
      .from('points_of_interest')
      .update({ ambient_audio_url: audioUrl })
      .eq('id', params.poiId);

    if (dbError) throw dbError;

    return {
      success: true,
      message: "Paisaje sonoro anclado correctamente.",
      data: { audioUrl }
    };

  } catch (error: any) {
    console.error("🔥 [Geo-Action][Audio]:", error.message);
    return { success: false, message: "Error al asegurar el activo acústico.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * V. FASE 3: SÍNTESIS NARRATIVA (THE ORACLE)
 * ---------------------------------------------------------------------------
 */

/**
 * synthesizeNarrativeAction:
 * Despierta al Agente 42 para la redacción de la crónica urbana.
 */
export async function synthesizeNarrativeAction(params: {
  poiId: number;
  depth: 'flash' | 'cronica' | 'inmersion';
  tone: string;
  refinedIntent?: string;
}): Promise<GeoActionResponse> {
  try {
    await validateSovereignAccess();
    const supabase = createClient();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.info(`🧠 [Geo-Action] Agente 42 iniciando forja para POI #${params.poiId}`);

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
    return { success: false, message: "Fallo en la síntesis del Oráculo.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * VI. FASE 4: PUBLICACIÓN FINAL (THE COMMIT)
 * ---------------------------------------------------------------------------
 */

/**
 * publishPOIAction:
 * Realiza el commit final en la Malla Urbana, haciendo el punto visible para todos.
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

    // Forzamos la revalidación de la caché del mapa para todos los usuarios
    revalidatePath('/map');

    console.info(`✅ [Geo-Action] Misión Finalizada: Nodo #${poiId} ONLINE.`);

    return {
      success: true,
      message: "El eco urbano ya resuena en Madrid."
    };

  } catch (error: any) {
    console.error("🔥 [Geo-Action][Publish]:", error.message);
    return { success: false, message: "Fallo en el anclaje final.", error: error.message };
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Sincronía Acústica: Se ha introducido 'attachAmbientAudioAction' para cerrar 
 *    el círculo de evidencia multimodal. El audio ambiente ahora reside en el 
 *    Storage junto a la evidencia visual.
 * 2. Cero Abreviaciones: Se han documentado todos los flujos y manejado los 
 *    errores con trazabilidad técnica (trace_id implícito en la respuesta).
 * 3. Seguridad de Lote: La función 'revalidatePath' asegura que tras la 
 *    publicación, la vista 'vw_map_resonance_active' se refresque en el cliente, 
 *    haciendo que el nuevo POI aparezca instantáneamente en el radar.
 */