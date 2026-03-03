// actions/geo-actions.ts
// VERSIÓN: 2.0

"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * INTERFAZ: ActionResponse
 * Contrato de retorno unificado para la comunicación con el frontend.
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
    heroImageUrl?: string;
    ocrImageUrl?: string;
  };
  error?: string;
};

/**
 * UTILIDAD: decodeBase64 (Interna)
 */
function decodeBase64Image(dataString: string) {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Formato Base64 inválido.");
  }
  return {
    type: matches[1],
    buffer: Buffer.from(matches[2], 'base64')
  };
}

/**
 * 1. uploadGeoEvidence: Subida de activos al Storage.
 */
export async function uploadGeoEvidence(
  heroImageBase64: string,
  ocrImageBase64?: string
): Promise<GeoUploadResponse> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "No autorizado." };

  try {
    const uniqueId = Date.now();
    const heroImage = decodeBase64Image(heroImageBase64);
    const heroPath = `geo-evidence/${user.id}/${uniqueId}_hero.jpg`;

    const { error: heroErr } = await supabase.storage.from('podcasts').upload(heroPath, heroImage.buffer, {
      contentType: heroImage.type,
      upsert: true
    });
    if (heroErr) throw heroErr;

    let ocrUrl = undefined;
    if (ocrImageBase64) {
      const ocrImage = decodeBase64Image(ocrImageBase64);
      const ocrPath = `geo-evidence/${user.id}/${uniqueId}_ocr.jpg`;
      const { error: ocrErr } = await supabase.storage.from('podcasts').upload(ocrPath, ocrImage.buffer, {
        contentType: ocrImage.type,
        upsert: true
      });
      if (ocrErr) throw ocrErr;
      ocrUrl = supabase.storage.from('podcasts').getPublicUrl(ocrPath).data.publicUrl;
    }

    const heroUrl = supabase.storage.from('podcasts').getPublicUrl(heroPath).data.publicUrl;

    return {
      success: true,
      message: "Evidencia subida.",
      urls: { heroImageUrl: heroUrl, ocrImageUrl: ocrUrl }
    };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

/**
 * 2. ingestContextAction: Proxy para geo-ingest-context (Edge Function)
 * [NUEVO]: Resuelve el error de importación en use-geo-engine.
 */
export async function ingestContextAction(params: {
  heroImage: string;
  ocrImage?: string;
  intent: string;
  location: { latitude: number; longitude: number; accuracy: number };
  category: string;
  radius: number;
}): Promise<ActionResponse> {
  const supabase = createClient();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const { data, error } = await supabase.functions.invoke('geo-ingest-context', {
      body: {
        heroImageBase64: params.heroImage,
        ocrImageBase64: params.ocrImage,
        location: params.location,
        intentText: params.intent,
        categoryId: params.category,
        resonanceRadius: params.radius
      },
      headers: {
        Authorization: `Bearer ${serviceKey}`
      }
    });

    if (error) throw error;
    return { success: true, message: "Análisis completado.", data };
  } catch (e: any) {
    console.error("🔥 [Geo-Action] Ingest Error:", e.message);
    return { success: false, message: "Fallo en la ingesta.", error: e.message };
  }
}

/**
 * 3. generateGeoContentAction: Proxy para geo-generate-content (Edge Function)
 * [NUEVO]: Resuelve el error de importación en use-geo-engine.
 */
export async function generateGeoContentAction(params: {
  intent: string;
  draftId: string;
  depth: string;
  tone: string;
}): Promise<ActionResponse> {
  const supabase = createClient();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const { data, error } = await supabase.functions.invoke('geo-generate-content', {
      body: {
        finalIntent: params.intent,
        draftId: params.draftId,
        depth: params.depth,
        tone: params.tone
      },
      headers: {
        Authorization: `Bearer ${serviceKey}`
      }
    });

    if (error) throw error;
    return { success: true, message: "Crónica generada.", data };
  } catch (e: any) {
    console.error("🔥 [Geo-Action] Generate Error:", e.message);
    return { success: false, message: "Fallo en la forja.", error: e.message };
  }
}