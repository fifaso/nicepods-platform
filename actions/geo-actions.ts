// actions/geo-actions.ts
// VERSIÓN: 1.0

"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * INTERFAZ: GeoUploadResponse
 * Contrato de retorno para la pasarela de subida de activos.
 */
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
 * UTILIDAD PRIVADA: decodeBase64Image
 * Transmuta una cadena Base64 del cliente (ej. data:image/jpeg;base64,/9j/...)
 * en un Buffer binario puro listo para el Storage de Supabase.
 */
function decodeBase64Image(dataString: string) {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Estructura de archivo Base64 inválida o corrupta.");
  }
  return {
    type: matches[1],
    buffer: Buffer.from(matches[2], 'base64')
  };
}

/**
 * FUNCIÓN MAESTRA: uploadGeoEvidence
 * Misión: Subir las fotos capturadas en el Retiro al Storage Oficial antes de 
 * invocar la IA, aligerando el payload de la red.
 * 
 * [PROTOCOLOS DE SEGURIDAD]:
 * 1. Solo un usuario con sesión válida puede ejecutar esto.
 * 2. Se verifica el rol 'admin' para impedir que Voyagers saturen el Storage.
 * 
 * @param heroImageBase64 - La imagen principal del Punto de Interés (Obligatoria).
 * @param ocrImageBase64 - La imagen de detalle para extracción de texto (Opcional).
 */
export async function uploadGeoEvidence(
  heroImageBase64: string,
  ocrImageBase64?: string
): Promise<GeoUploadResponse> {

  // 1. HANDSHAKE DE IDENTIDAD Y SEGURIDAD SOBERANA
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: "ERROR_AUTORIZACIÓN: Enlace perdido." };
  }

  const userRole = user.app_metadata?.user_role || user.app_metadata?.role || 'user';
  if (userRole !== 'admin') {
    console.warn(`🛡️ [Geo-Bridge] Intento de subida ilegal detectado por: ${user.email}`);
    return { success: false, message: "ERROR_RANGO: Operación reservada para Administración." };
  }

  console.info(`📦 [Geo-Bridge] Iniciando subida de evidencia para Admin: ${user.email}`);

  try {
    const uploadTasks = [];
    let heroPath = "";
    let ocrPath = "";

    // 2. PREPARACIÓN DE ACTIVOS FÍSICOS (Decodificación)
    // Generamos un timestamp único para evitar colisiones de archivos.
    const uniqueId = Date.now();

    // Tarea 1: Hero Image (Prioridad 0)
    const heroImage = decodeBase64Image(heroImageBase64);
    heroPath = `geo-evidence/${user.id}/${uniqueId}_hero.jpg`;

    uploadTasks.push(
      supabase.storage.from('podcasts').upload(heroPath, heroImage.buffer, {
        contentType: heroImage.type,
        upsert: true,
        cacheControl: '31536000' // Cache máxima, la evidencia histórica no muta.
      })
    );

    // Tarea 2: OCR Image (Opcional)
    if (ocrImageBase64) {
      const ocrImage = decodeBase64Image(ocrImageBase64);
      ocrPath = `geo-evidence/${user.id}/${uniqueId}_ocr.jpg`;

      uploadTasks.push(
        supabase.storage.from('podcasts').upload(ocrPath, ocrImage.buffer, {
          contentType: ocrImage.type,
          upsert: true,
          cacheControl: '31536000'
        })
      );
    }

    /**
     * 3. EJECUCIÓN PARALELA DE E/S (Input/Output)
     * Subimos ambas fotos al mismo tiempo. En una conexión 4G en medio del parque,
     * esto reduce el tiempo de espera del Admin a la mitad.
     */
    console.info(`   > Transfiriendo ${uploadTasks.length} activos visuales al Storage...`);
    const results = await Promise.all(uploadTasks);

    // Verificamos si alguna de las promesas falló
    for (const result of results) {
      if (result.error) {
        throw new Error(`STORAGE_UPLOAD_FAIL: ${result.error.message}`);
      }
    }

    /**
     * 4. GENERACIÓN DE ENLACES PÚBLICOS
     * Transformamos las rutas internas en URLs legibles por Gemini y el Frontend.
     */
    const { data: heroUrlData } = supabase.storage.from('podcasts').getPublicUrl(heroPath);
    let finalOcrUrl = undefined;

    if (ocrPath) {
      const { data: ocrUrlData } = supabase.storage.from('podcasts').getPublicUrl(ocrPath);
      finalOcrUrl = ocrUrlData.publicUrl;
    }

    console.info(`✅ [Geo-Bridge] Evidencia asegurada en la Bóveda.`);

    // 5. ENTREGA SOBERANA AL CLIENTE
    return {
      success: true,
      message: "Activos subidos correctamente.",
      urls: {
        heroImageUrl: heroUrlData.publicUrl,
        ocrImageUrl: finalOcrUrl
      }
    };

  } catch (error: any) {
    console.error("🔥 [Geo-Bridge-Fatal]:", error.message);
    return {
      success: false,
      message: "Fallo estructural al subir la evidencia al Storage.",
      error: error.message
    };
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Optimización LCP: Al usar la carpeta 'podcasts' (que ya tenemos configurada como pública),
 *    no necesitamos crear buckets nuevos ni gestionar políticas de CORS complejas.
 * 2. Diseño Inmutable: El uso de 'cacheControl: 31536000' (1 año) es la regla de oro para
 *    activos fotográficos. Una vez que el Admin sube la foto de una estatua, esa foto 
 *    no cambiará, por lo que el CDN de Vercel puede guardarla eternamente.
 * 3. Prevención de Timeouts: Separar la subida de imágenes de la llamada a la Edge Function
 *    evita que la API de Supabase se caiga por "Request Payload Too Large".
 */