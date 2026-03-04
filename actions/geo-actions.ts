// actions/geo-actions.ts
// VERSIÓN: 3.0

"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * ---------------------------------------------------------------------------
 * I. CONTRATOS DE RESPUESTA (Standard Action Response)
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
 * Transmuta la evidencia visual del Administrador en binarios puros
 * para su persistencia en la Bóveda de Storage.
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
 * Misión: Asegurar las capturas visuales en el Storage antes del análisis IA.
 * ---------------------------------------------------------------------------
 */
export async function uploadGeoEvidence(
  heroImageBase64: string,
  ocrImageBase64?: string
): Promise<GeoUploadResponse> {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: "NO_AUTORIZADO", error: "Sesión no válida." };
  }

  // Validación de Rango: Solo el Admin puede sembrar activos físicos.
  const userRole = user.app_metadata?.user_role || user.app_metadata?.role || 'user';
  if (userRole !== 'admin') {
    return { success: false, message: "RANGO_INSUFICIENTE", error: "Privilegios insuficientes." };
  }

  try {
    const timestamp = Date.now();
    const uploadTasks = [];

    // Tarea 1: Imagen Hero (Vista monumental)
    const heroImg = decodeBase64ToBuffer(heroImageBase64);
    const heroPath = `geo-forge/${user.id}/${timestamp}_hero.jpg`;
    uploadTasks.push(
      supabase.storage.from('podcasts').upload(heroPath, heroImg.buffer, {
        contentType: heroImg.type,
        upsert: true,
        cacheControl: '31536000'
      })
    );

    // Tarea 2: Imagen OCR (Placas y textos)
    let ocrPath = "";
    if (ocrImageBase64) {
      const ocrImg = decodeBase64ToBuffer(ocrImageBase64);
      ocrPath = `geo-forge/${user.id}/${timestamp}_ocr.jpg`;
      uploadTasks.push(
        supabase.storage.from('podcasts').upload(ocrPath, ocrImg.buffer, {
          contentType: ocrImg.type,
          upsert: true
        })
      );
    }

    // Ejecución paralela para minimizar latencia en el terreno (4G/5G Optimizado)
    const results = await Promise.all(uploadTasks);
    for (const res of results) if (res.error) throw res.error;

    const heroUrl = supabase.storage.from('podcasts').getPublicUrl(heroPath).data.publicUrl;
    const ocrUrl = ocrPath ? supabase.storage.from('podcasts').getPublicUrl(ocrPath).data.publicUrl : undefined;

    return {
      success: true,
      message: "Evidencia visual sincronizada.",
      urls: { heroImageUrl: heroUrl, ocrImageUrl: ocrUrl }
    };

  } catch (error: any) {
    console.error("🔥 [Geo-Action][Upload]:", error.message);
    return { success: false, message: "Fallo en transferencia de activos.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * III. ACCIÓN: resolveLocationAction
 * [FIX TS2305]: Misión: Invocar el motor 'geo-resolve-location' (Fase 1).
 * ---------------------------------------------------------------------------
 */
export async function resolveLocationAction(
  latitude: number,
  longitude: number
): Promise<ActionResponse> {
  const supabase = createClient();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) throw new Error("CRITICAL: SERVICE_ROLE_KEY_MISSING");

  try {
    const { data, error: functionError } = await supabase.functions.invoke('geo-resolve-location', {
      body: { latitude, longitude },
      headers: {
        Authorization: `Bearer ${serviceKey}` // Salvoconducto para bypass de CPU overhead
      }
    });

    if (functionError) throw functionError;

    return {
      success: true,
      message: "Resonancia establecida.",
      data: data.data // Retorna place y weather
    };

  } catch (error: any) {
    console.error("🔥 [Geo-Action][Resolve]:", error.message);
    return { success: false, message: "Error al sintonizar nodo.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * IV. ACCIÓN: ingestContextAction
 * [FIX TS2305]: Misión: Invocar el motor analítico forense (Fase 2).
 * ---------------------------------------------------------------------------
 */
export async function ingestContextAction(params: {
  heroImageUrl: string;
  ocrImageUrl?: string;
  intent: string;
  location: { latitude: number; longitude: number; accuracy: number };
  categoryId: string;
  resonanceRadius: number;
}): Promise<ActionResponse> {
  const supabase = createClient();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const { data, error } = await supabase.functions.invoke('geo-ingest-context', {
      body: {
        heroImageUrl: params.heroImageUrl,
        ocrImageUrl: params.ocrImageUrl,
        location: params.location,
        intentText: params.intent,
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
      message: "Dossier visual procesado.",
      data // Retorna draftId y el análisis de Gemini Flash
    };

  } catch (error: any) {
    console.error("🔥 [Geo-Action][Ingest]:", error.message);
    return { success: false, message: "Fallo en análisis multimodal.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * V. ACCIÓN: generateGeoContentAction
 * [FIX TS2305]: Misión: Activar la síntesis narrativa final (Fase 3).
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
      message: "Crónica forjada con éxito.",
      data // Retorna el guion final
    };

  } catch (error: any) {
    console.error("🔥 [Geo-Action][Generate]:", error.message);
    return { success: false, message: "Fallo en forja narrativa.", error: error.message };
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Seguridad Atómica: El uso de 'use server' y la inyección manual de 
 *    la cabecera 'Authorization' es lo que permite que las Edge Functions 
 *    funcionen en el modo más rápido de Deno, evitando el 'CPU Time Exceeded'.
 * 2. Resolución de Build: Al exportar explícitamente ingestContextAction, 
 *    resolveLocationAction y generateGeoContentAction, el error TS2305 
 *    en 'use-geo-engine.ts' desaparecerá al guardar este archivo.
 * 3. Optimización de Red: Al subir las imágenes antes de las llamadas a la IA, 
 *    Gemini procesa URLs en lugar de streams de bytes pesados, garantizando 
 *    una respuesta de descubrimiento mucho más ágil.
 */