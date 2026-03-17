// actions/geo-actions.ts
// VERSIÓN: 5.1 (NicePod Sovereign Geo-Actions - Full Integrity Edition)
// Misión: Orquestar el ciclo de vida multimodal de los POIs con rigor industrial.
// [ESTABILIZACIÓN]: Restauración de resolveLocation, soporte para nombres manuales y tipado estricto.

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
    throw new Error("ACCESO_SOBERANO_REQUERIDO: Se requiere rango Administrador.");
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
    throw new Error("CAPTURA_CORRUPTA: El activo binario no es válido.");
  }

  const contentType = matches[1];
  const byteCharacters = atob(matches[2]);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  return { type: contentType, buffer: new Uint8Array(byteNumbers) };
}

/**
 * ---------------------------------------------------------------------------
 * III. FASE 0: RESOLUCIÓN AMBIENTAL (EL RADAR)
 * ---------------------------------------------------------------------------
 */

/**
 * resolveLocationAction:
 * Convierte coordenadas en identidad (Lugar + Clima) para el HUD del Step 1.
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
      message: "Radar sincronizado.",
      data: data.data
    };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][Resolve]:", error.message);
    return { success: false, message: "Error al identificar el nodo.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * IV. FASE 1: INGESTA SENSORIAL (THE SENSES)
 * ---------------------------------------------------------------------------
 */

export async function ingestPhysicalEvidenceAction(
  payload: POICreationPayload
): Promise<GeoActionResponse<{ poiId: number; analysis: any; location: any }>> {
  try {
    const user = await validateSovereignAccess();
    const validatedData = POIIngestionSchema.parse(payload);

    const supabase = createClient();
    const timestamp = Date.now();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 1. Transporte de Imagen Hero
    const heroImg = decodeBase64ToUint8Array(validatedData.heroImage);
    const heroPath = `poi-evidence/${user.id}/${timestamp}_hero.jpg`;

    const { error: heroError } = await supabase.storage
      .from('podcasts')
      .upload(heroPath, heroImg.buffer, { contentType: heroImg.type, upsert: true });

    if (heroError) throw heroError;

    // 2. Transporte de Imagen OCR
    let ocrUrl = undefined;
    if (validatedData.ocrImage) {
      const ocrImg = decodeBase64ToUint8Array(validatedData.ocrImage);
      const ocrPath = `poi-evidence/${user.id}/${timestamp}_ocr.jpg`;
      const { error: ocrError } = await supabase.storage
        .from('podcasts')
        .upload(ocrPath, ocrImg.buffer, { contentType: ocrImg.type, upsert: true });
      if (!ocrError) ocrUrl = supabase.storage.from('podcasts').getPublicUrl(ocrPath).data.publicUrl;
    }

    const heroUrl = supabase.storage.from('podcasts').getPublicUrl(heroPath).data.publicUrl;

    // 3. Invocación de la IA Sensorial
    const { data, error: functionError } = await supabase.functions.invoke('geo-sensor-ingestor', {
      body: { ...validatedData, heroImage: heroUrl, ocrImage: ocrUrl },
      headers: { Authorization: `Bearer ${serviceKey}` }
    });

    if (functionError) throw functionError;

    return {
      success: true,
      message: "Evidencia física procesada.",
      data: data.data
    };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][Ingest]:", error.message);
    return { success: false, message: "Fallo en la ingesta.", error: error.message };
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

    const { error: uploadError } = await supabase.storage
      .from('podcasts')
      .upload(audioPath, audioData.buffer, { contentType: audioData.type, upsert: true });

    if (uploadError) throw uploadError;

    const audioUrl = supabase.storage.from('podcasts').getPublicUrl(audioPath).data.publicUrl;

    const { error: dbError } = await supabase
      .from('points_of_interest')
      .update({ ambient_audio_url: audioUrl })
      .eq('id', params.poiId);

    if (dbError) throw dbError;

    return { success: true, message: "Audio ambiente anclado.", data: { audioUrl } };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][Audio]:", error.message);
    return { success: false, message: "Error en el activo acústico.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * VI. FASE 3: SÍNTESIS NARRATIVA (THE BRAIN)
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

    return { success: true, message: "Sabiduría sintetizada.", data: data.data };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][Narrative]:", error.message);
    return { success: false, message: "Fallo en la forja narrativa.", error: error.message };
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
    return { success: true, message: "Nodo ONLINE en la malla urbana." };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][Publish]:", error.message);
    return { success: false, message: "Fallo en el anclaje final.", error: error.message };
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.1):
 * 1. Recuperación de Radar: Se restauró 'resolveLocationAction' para que el 
 *    Step 1 pueda identificar el monumento antes de que el Admin pulse un botón.
 * 2. Cero Abreviaciones: Se han documentado todos los catch blocks con logs 
 *    específicos para auditoría forense en Vercel.
 * 3. Atomicidad Multimodal: Las funciones de subida de audio y fotos están 
 *    ahora preparadas para manejar fallos de red individuales sin corromper 
 *    el registro principal del POI.
 */