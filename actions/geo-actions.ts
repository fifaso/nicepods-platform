// actions/geo-actions.ts
// VERSIÓN: 4.0 (NicePod V2.6 - Sovereign Geo-Actions Edition)
// Misión: Orquestar el ciclo de vida de los POIs: Ingesta -> Narración -> Publicación.
// [ESTABILIZACIÓN]: Implementación de RBAC estricto, separación de sentidos y cerebro.

"use server";

import { createClient } from "@/lib/supabase/server";
import {
  POIIngestionSchema
} from "@/lib/validation/poi-schema";
import {
  GeoActionResponse,
  POICreationPayload,
  POILifecycle
} from "@/types/geo-sovereignty";
import { revalidatePath } from "next/cache";

/**
 * ---------------------------------------------------------------------------
 * I. ESCUDO DE AUTORIDAD (RBAC PROTOCOL)
 * ---------------------------------------------------------------------------
 */

/**
 * validateSovereignAccess:
 * Valida que el actor posea los privilegios necesarios para alterar la malla urbana.
 * [V2.6]: Solo 'admin'.
 * [V2.7 PREP]: Listo para incluir 'pro_user'.
 */
async function validateSovereignAccess() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw new Error("IDENTIDAD_NO_VERIFICADA");

  const userRole = user.app_metadata.user_role || user.app_metadata.role;
  const isAdmin = userRole === 'admin';

  if (!isAdmin) {
    throw new Error("ACCESO_SOBERANO_DENEGADO: Se requiere rango Administrador.");
  }

  return user;
}

/**
 * ---------------------------------------------------------------------------
 * II. UTILIDADES BINARIAS (NICECORE NATIVE)
 * ---------------------------------------------------------------------------
 */

/**
 * decodeBase64ToUint8Array:
 * Transmuta strings Base64 de la cámara en binarios puros para el Storage.
 * Usamos Uint8Array para paridad total con el entorno Edge/Deno.
 */
function decodeBase64ToUint8Array(dataString: string) {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("CAPTURA_CORRUPTA: El activo visual no es válido.");
  }
  const binaryStr = atob(matches[2]);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return { type: matches[1], buffer: bytes };
}

/**
 * ---------------------------------------------------------------------------
 * III. FASE 1: INGESTA SENSORIAL (THE SENSES)
 * ---------------------------------------------------------------------------
 */

/**
 * ingestPhysicalEvidenceAction:
 * Recibe coordenadas y fotos, las ancla en el Storage e invoca al Ingestor Multimodal.
 * Es una operación atómica: Si la subida falla, la IA no se activa.
 */
export async function ingestPhysicalEvidenceAction(
  payload: POICreationPayload
): Promise<GeoActionResponse> {
  try {
    // 1. Validar Autoridad
    const user = await validateSovereignAccess();

    // 2. Validar Calidad de Ingesta (Zod Build Shield)
    const validatedData = POIIngestionSchema.parse(payload);

    const supabase = createClient();
    const timestamp = Date.now();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 3. Transporte de Evidencia al Storage
    console.info(`📦 [Geo-Action] Asegurando evidencia para usuario: ${user.id}`);

    const heroImg = decodeBase64ToUint8Array(validatedData.heroImage);
    const heroPath = `poi-evidence/${user.id}/${timestamp}_hero.jpg`;

    const { error: heroError } = await supabase.storage
      .from('podcasts') // Bucket unificado de activos
      .upload(heroPath, heroImg.buffer, {
        contentType: heroImg.type,
        upsert: true
      });

    if (heroError) throw heroError;

    let ocrPath = null;
    if (validatedData.ocrImage) {
      const ocrImg = decodeBase64ToUint8Array(validatedData.ocrImage);
      ocrPath = `poi-evidence/${user.id}/${timestamp}_ocr.jpg`;
      await supabase.storage.from('podcasts').upload(ocrPath, ocrImg.buffer, {
        contentType: ocrImg.type,
        upsert: true
      });
    }

    const heroUrl = supabase.storage.from('podcasts').getPublicUrl(heroPath).data.publicUrl;
    const ocrUrl = ocrPath ? supabase.storage.from('podcasts').getPublicUrl(ocrPath).data.publicUrl : undefined;

    // 4. Invocación del Motor de Ingesta (Edge Function)
    // Pasamos las URLs de Storage, no los Base64, para proteger la RAM del Edge.
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
      message: "Fase de Ingesta completada. Dossier de evidencia creado.",
      data: data.data // Contiene el poiId y el análisis inicial
    };

  } catch (error: any) {
    console.error("🔥 [Geo-Action][Ingest-Fatal]:", error.message);
    return { success: false, message: "Error en la captura física.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * IV. FASE 2: SÍNTESIS NARRATIVA (THE BRAIN)
 * ---------------------------------------------------------------------------
 */

/**
 * synthesizeNarrativeAction:
 * Toma un POI ya ingestada y despierta al Agente 38 para la forja del guion.
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

    console.info(`🧠 [Geo-Action] Sintetizando crónica para POI #${params.poiId}`);

    const { data, error } = await supabase.functions.invoke('geo-narrative-creator', {
      body: params,
      headers: { Authorization: `Bearer ${serviceKey}` }
    });

    if (error) throw error;

    return {
      success: true,
      message: "Crónica urbana sintetizada con éxito.",
      data: data.data
    };

  } catch (error: any) {
    console.error("🔥 [Geo-Action][Narrative-Fatal]:", error.message);
    return { success: false, message: "Fallo en la forja intelectual.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * V. FASE 3: PUBLICACIÓN Y ANCLAJE (THE COMMIT)
 * ---------------------------------------------------------------------------
 */

/**
 * publishPOIAction:
 * El acto final de soberanía. Mueve el POI a 'published' y lo hace visible en el Radar.
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

    // Sincronización de la Malla Urbana
    revalidatePath('/map');

    console.info(`✅ [Geo-Action] Nodo #${poiId} publicado oficialmente.`);

    return {
      success: true,
      message: "El nodo ya es parte de la Resonancia de Madrid."
    };

  } catch (error: any) {
    console.error("🔥 [Geo-Action][Publish-Fatal]:", error.message);
    return { success: false, message: "Error al publicar en la malla.", error: error.message };
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Eficiencia de RAM (Edge-Friendly): La acción de ingesta ahora envía URLs 
 *    públicas del Storage a las Edge Functions. Esto evita mover megabytes 
 *    de Base64 entre servidores, reduciendo la latencia y el consumo de memoria.
 * 2. Seguridad Atómica: Cada paso (Ingesta, Narración, Publicación) verifica 
 *    el rol del usuario, asegurando que nadie pueda "saltarse" el proceso de 
 *    calidad o inyectar datos falsos.
 * 3. Integridad SQL: El uso de 'revalidatePath' garantiza que el mapa del 
 *    usuario final se actualice instantáneamente tras la acción de publicación.
 */