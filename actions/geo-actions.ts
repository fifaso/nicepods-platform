// actions/geo-actions.ts
// VERSIÓN: 3.0

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
 * UTILIDAD PRIVADA: decodeBase64ToBuffer
 * Misión: Transmutar la captura visual del Administrador en binarios puros
 * para su almacenamiento soberano, reduciendo el overhead de memoria en el Edge.
 */
function decodeBase64ToBuffer(dataString: string) {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("ESTRUCTURA_BASE64_CORRUPTA: El activo visual no es válido.");
  }
  return {
    type: matches[1],
    buffer: Buffer.from(matches[2], 'base64')
  };
}

/**
 * ---------------------------------------------------------------------------
 * II. ACCIÓN: uploadGeoEvidence
 * Misión: Asegurar la evidencia visual en el Storage de Supabase.
 * ---------------------------------------------------------------------------
 */
export async function uploadGeoEvidence(
  heroImageBase64: string,
  ocrImageBase64?: string
): Promise<GeoUploadResponse> {
  const supabase = createClient();

  // Handshake de Autoridad: Solo el Admin puede subir evidencia de campo.
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, message: "NO_AUTORIZADO", error: "Sesión no verificada." };
  }

  const userRole = user.app_metadata?.user_role || user.app_metadata?.role || 'user';
  if (userRole !== 'admin') {
    return { success: false, message: "RANGO_INSUFICIENTE", error: "Se requieren privilegios de administración." };
  }

  try {
    const timestamp = Date.now();
    const uploadTasks = [];

    // 1. Procesamiento de Hero Image (Imagen Monumental)
    const heroImg = decodeBase64ToBuffer(heroImageBase64);
    const heroPath = `geo-evidence/${user.id}/${timestamp}_hero.jpg`;

    uploadTasks.push(
      supabase.storage.from('podcasts').upload(heroPath, heroImg.buffer, {
        contentType: heroImg.type,
        upsert: true,
        cacheControl: '31536000' // Cache eterna para activos históricos.
      })
    );

    // 2. Procesamiento de OCR Image (Evidencia de Placa/Texto)
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

    // Ejecución Concurrente para minimizar el tiempo de espera en el parque.
    const results = await Promise.all(uploadTasks);
    for (const res of results) if (res.error) throw res.error;

    // Generación de Enlaces Públicos
    const heroUrl = supabase.storage.from('podcasts').getPublicUrl(heroPath).data.publicUrl;
    const ocrUrl = ocrPath ? supabase.storage.from('podcasts').getPublicUrl(ocrPath).data.publicUrl : undefined;

    return {
      success: true,
      message: "Evidencia visual asegurada en la Bóveda de Storage.",
      urls: { heroImageUrl: heroUrl, ocrImageUrl: ocrUrl }
    };

  } catch (error: any) {
    console.error("🔥 [Geo-Action][Upload]:", error.message);
    return { success: false, message: "Fallo al transferir activos.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * III. ACCIÓN: resolveLocationAction
 * Misión: Invocar el motor ligero 'geo-resolve-location' (Fase 1).
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
        Authorization: `Bearer ${serviceKey}` // Inyectamos el salvoconducto.
      }
    });

    if (functionError) throw functionError;

    return {
      success: true,
      message: "Resonancia de ubicación establecida.",
      data: data.data // Contiene POI y Clima resueltos.
    };

  } catch (error: any) {
    console.error("🔥 [Geo-Action][Resolve]:", error.message);
    return { success: false, message: "Error al sintonizar nodo.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * IV. ACCIÓN: analyzeMultimodalAction
 * Misión: Invocar al motor analítico forense (Fase 2).
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
        heroImageBase64: params.heroImageUrl, // La función espera la URL o el base64 según la versión Lite
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
      message: "Dossier de inteligencia visual completado.",
      data // Devuelve draftId y el análisis técnico.
    };

  } catch (error: any) {
    console.error("🔥 [Geo-Action][Analyze]:", error.message);
    return { success: false, message: "Fallo en el análisis multimodal.", error: error.message };
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
      message: "Crónica de sabiduría generada y lista para grabación.",
      data // Devuelve el script para el teleprompter.
    };

  } catch (error: any) {
    console.error("🔥 [Geo-Action][Generate]:", error.message);
    return { success: false, message: "Fallo en la forja de contenido.", error: error.message };
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Seguridad Blindada: Esta es la única vía de comunicación autorizada para la forja GEO.
 *    Al usar 'use server', protegemos las peticiones contra 'Middle-Man Attacks' en el cliente.
 * 2. Optimización de Memoria: 'uploadGeoEvidence' permite que el resto del flujo 
 *    utilice punteros de URL en lugar de saturar el buffer de Deno con imágenes pesadas.
 * 3. Consistencia de Respuesta: Se utiliza el tipo 'ActionResponse' para que la 
 *    interfaz del Administrador (ScannerUI) pueda proyectar estados de carga y 
 *    error con rigor profesional.
 */