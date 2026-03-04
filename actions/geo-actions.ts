// actions/geo-actions.ts
// VERSIÓN: 3.1

"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * ---------------------------------------------------------------------------
 * I. CONTRATOS DE RESPUESTA (ACTION RESPONSE STANDARD)
 * ---------------------------------------------------------------------------
 */

export type ActionResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};

export type GeoUploadResponse = {
  success: boolean;
  message: string;
  urls?: {
    heroImageUrl: string;
    ocrImageUrl?: string;
  };
  error?: string;
};

/**
 * UTILIDAD: decodeBase64ToBuffer
 * Misión: Transmutar la captura visual del Administrador en binarios puros
 * para su almacenamiento soberano en Supabase Storage.
 */
function decodeBase64ToBuffer(dataString: string) {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("ESTRUCTURA_BASE64_CORRUPTA: El activo no es válido.");
  }
  return {
    type: matches[1],
    buffer: Buffer.from(matches[2], 'base64')
  };
}

/**
 * ---------------------------------------------------------------------------
 * II. ACCIÓN: uploadGeoEvidence
 * Misión: Subir las fotos capturadas al Storage de Supabase.
 * ---------------------------------------------------------------------------
 */
export async function uploadGeoEvidence(
  heroImageBase64: string,
  ocrImageBase64?: string
): Promise<GeoUploadResponse> {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, message: "NO_AUTORIZADO", error: "Sesión no válida" };

  try {
    const timestamp = Date.now();
    const uploadTasks = [];

    // 1. Procesamiento de Hero Image
    const heroImg = decodeBase64ToBuffer(heroImageBase64);
    const heroPath = `geo-evidence/${user.id}/${timestamp}_hero.jpg`;

    uploadTasks.push(
      supabase.storage.from('podcasts').upload(heroPath, heroImg.buffer, {
        contentType: heroImg.type,
        upsert: true,
        cacheControl: '31536000'
      })
    );

    // 2. Procesamiento de OCR Image (Evidencia Histórica)
    let ocrPath = "";
    if (ocrImageBase64) {
      const ocrImg = decodeBase64ToBuffer(ocrImageBase64);
      ocrPath = `geo-evidence/${user.id}/${timestamp}_ocr.jpg`;
      uploadTasks.push(
        supabase.storage.from('podcasts').upload(ocrPath, ocrImg.buffer, {
          contentType: ocrImg.type,
          upsert: true
        })
      );
    }

    const results = await Promise.all(uploadTasks);
    for (const res of results) if (res.error) throw res.error;

    const heroUrl = supabase.storage.from('podcasts').getPublicUrl(heroPath).data.publicUrl;
    const ocrUrl = ocrPath ? supabase.storage.from('podcasts').getPublicUrl(ocrPath).data.publicUrl : undefined;

    return {
      success: true,
      message: "Evidencia visual asegurada.",
      urls: { heroImageUrl: heroUrl, ocrImageUrl: ocrUrl }
    };

  } catch (error: any) {
    console.error("🔥 [Geo-Action][Upload]:", error.message);
    return { success: false, message: "Fallo al subir activos.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * III. ACCIÓN: resolveLocationAction
 * Misión: Invocar el motor 'geo-resolve-location' (Fase 1).
 * ---------------------------------------------------------------------------
 */
export async function resolveLocationAction(
  latitude: number,
  longitude: number
): Promise<ActionResponse> {
  const supabase = createClient();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) throw new Error("INFRASTRUCTURE_KEY_MISSING");

  try {
    const { data, error: functionError } = await supabase.functions.invoke('geo-resolve-location', {
      body: { latitude, longitude },
      headers: {
        Authorization: `Bearer ${serviceKey}`
      }
    });

    if (functionError) throw functionError;

    return {
      success: true,
      message: "Ubicación resuelta.",
      data: data.data
    };

  } catch (error: any) {
    console.error("🔥 [Geo-Action][Resolve]:", error.message);
    return { success: false, message: "Error al sintonizar ubicación.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * IV. ACCIÓN: analyzeMultimodalAction
 * [FIX TS2305]: Renombrado de ingestContextAction a analyzeMultimodalAction
 * para coincidir exactamente con lo que el hook use-geo-engine.ts espera.
 * ---------------------------------------------------------------------------
 */
export async function analyzeMultimodalAction(params: {
  heroImageUrl: string;
  ocrImageUrl?: string;
  placeName: string;
  intent: string;
  location: { latitude: number; longitude: number; accuracy: number };
  categoryId: string;
  resonanceRadius: number;
}): Promise<ActionResponse> {
  const supabase = createClient();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const { data, error } = await supabase.functions.invoke('geo-analyze-multimodal', {
      body: {
        heroImageBase64: params.heroImageUrl,
        ocrImageBase64: params.ocrImageUrl,
        placeName: params.placeName,
        intentText: params.intent,
        location: params.location,
        categoryId: params.categoryId,
        resonanceRadius: params.resonanceRadius
      },
      headers: {
        Authorization: `Bearer ${serviceKey}`
      }
    });

    if (error) throw error;

    return {
      success: true,
      message: "Dossier analítico completado.",
      data
    };

  } catch (error: any) {
    console.error("🔥 [Geo-Action][Analyze]:", error.message);
    return { success: false, message: "Fallo en el análisis IA.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * V. ACCIÓN: generateGeoContentAction
 * Misión: Activar la síntesis narrativa del Agente 38 (Fase 3).
 * ---------------------------------------------------------------------------
 */
export async function generateGeoContentAction(params: {
  draftId: string;
  intent: string;
  depth: string;
  tone: string;
  categoryId: string;
  historicalFact: string;
}): Promise<ActionResponse> {
  const supabase = createClient();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const { data, error } = await supabase.functions.invoke('geo-generate-content', {
      body: {
        draftId: params.draftId,
        finalIntent: params.intent,
        depth: params.depth,
        tone: params.tone,
        categoryId: params.categoryId,
        historicalFact: params.historicalFact
      },
      headers: {
        Authorization: `Bearer ${serviceKey}`
      }
    });

    if (error) throw error;

    return {
      success: true,
      message: "Crónica de sabiduría forjada.",
      data
    };

  } catch (error: any) {
    console.error("🔥 [Geo-Action][Generate]:", error.message);
    return { success: false, message: "Fallo en forja narrativa.", error: error.message };
  }
}