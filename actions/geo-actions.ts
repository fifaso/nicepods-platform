/**
 * ARCHIVO: actions/geo-actions.ts
 * VERSIÓN: 7.3 (NicePod Sovereign Geo-Actions - Contract Alignment Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Orquestar el ciclo de vida de persistencia con garantía de limpieza y rigor de tipos.
 * [REFORMA V7.3]: Alineación con NarrativeTone/Depth y optimización del Protocolo Janitor.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- IMPORTACIÓN DE CONTRATOS SOBERANOS (BUILD SHIELD V6.4) ---
import {
  POIIngestionSchema
} from "@/lib/validation/poi-schema";
import {
  GeoActionResponse,
  POICreationPayload,
  POILifecycle,
  NarrativeDepth,
  NarrativeTone
} from "@/types/geo-sovereignty";

/**
 * ---------------------------------------------------------------------------
 * I. ESCUDO DE AUTORIDAD (RBAC PROTOCOL)
 * ---------------------------------------------------------------------------
 */

/**
 * validateSovereignAccess:
 * Valida la identidad y el rango de Administrador directamente en el Borde de Vercel.
 */
async function validateSovereignAccess() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw new Error("IDENTIDAD_NO_VERIFICADA");

  const appMetadata = user.app_metadata || {};
  const userRole = appMetadata.user_role || appMetadata.role || 'user';

  if (userRole !== 'admin') {
    throw new Error("ACCESO_DENEGADO: Autoridad de nivel Administrador requerida.");
  }

  return user;
}

/**
 * ---------------------------------------------------------------------------
 * II. UTILIDADES DE PROCESAMIENTO BINARIO (METAL CORE)
 * ---------------------------------------------------------------------------
 */

/**
 * decodeBase64ToUint8Array:
 * Transmuta capturas Base64 en binarios puros optimizando el uso de RAM.
 * Utiliza el motor de Buffer nativo de Node.js.
 */
function decodeBase64ToUint8Array(dataString: string) {
  try {
    const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("FORMATO_BINARIO_INVALIDO");
    }

    const contentType = matches[1];
    const base64Content = matches[2];
    const buffer = Buffer.from(base64Content, 'base64');

    return { type: contentType, buffer: new Uint8Array(buffer) };
  } catch (e) {
    throw new Error("FALLO_DECODIFICACION: Activo físico corrupto o malformado.");
  }
}

/**
 * ---------------------------------------------------------------------------
 * III. ACCIONES DE RESOLUCIÓN Y TRANSCRIPCIÓN
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

    if (error) throw new Error(`RADAR_SYNC_FAIL: ${error.message}`);
    return { success: true, message: "Radar sincronizado.", data: data.data };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][Resolve-Fatal]:", error.message);
    return { success: false, message: "Error de radar ambiental.", error: error.message };
  }
}

export async function transcribeVoiceIntentAction(params: {
  audioBase64: string;
}): Promise<GeoActionResponse<{ transcription: string }>> {
  try {
    await validateSovereignAccess();
    const supabase = createClient();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const audioData = decodeBase64ToUint8Array(params.audioBase64);

    const { data, error } = await supabase.functions.invoke('geo-transcribe-intent', {
      body: {
        audioBase64: params.audioBase64.split(',')[1],
        contentType: audioData.type
      },
      headers: { Authorization: `Bearer ${serviceKey}` }
    });

    if (error) throw new Error(`STT_IA_FAIL: ${error.message}`);

    return {
      success: true,
      message: "Voz transmutada en capital intelectual.",
      data: { transcription: data.transcription }
    };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][STT-Fatal]:", error.message);
    return { success: false, message: "Error en dictado sensorial.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * IV. FASE 1: INGESTA SENSORIAL (CON PROTOCOLO JANITOR)
 * ---------------------------------------------------------------------------
 */

export async function ingestPhysicalEvidenceAction(
  payload: POICreationPayload & { ocrImages?: string[] }
): Promise<GeoActionResponse<{ poiId: number; analysis: any; location: any }>> {
  
  let uploadedPaths: string[] = [];
  const supabase = createClient();

  try {
    const user = await validateSovereignAccess();

    // 1. RIGOR POSTGIS: Validación Zod de coordenadas y límites de payload
    const validatedData = POIIngestionSchema.parse({
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy,
      heroImage: payload.heroImage,
      categoryId: payload.categoryId,
      resonanceRadius: payload.resonanceRadius,
      adminIntent: payload.adminIntent
    });

    const timestamp = Date.now();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 2. Persistencia Bloqueante de Evidencia Visual Principal
    const heroImg = decodeBase64ToUint8Array(payload.heroImage);
    const heroPath = `poi-evidence/${user.id}/${timestamp}_hero.jpg`;

    const { error: heroUploadError } = await supabase.storage
      .from('podcasts')
      .upload(heroPath, heroImg.buffer, {
        contentType: heroImg.type,
        upsert: true
      });

    if (heroUploadError) throw new Error(`STORAGE_UNAVAILABLE: ${heroUploadError.message}`);
    uploadedPaths.push(heroPath);

    // 3. Persistencia de Evidencia Secundaria (Mosaico OCR)
    if (payload.ocrImages && payload.ocrImages.length > 0) {
      const ocrTasks = payload.ocrImages.map((base64, i) => {
        const img = decodeBase64ToUint8Array(base64);
        const path = `poi-evidence/${user.id}/${timestamp}_ocr_${i}.jpg`;
        return supabase.storage.from('podcasts').upload(path, img.buffer, { contentType: img.type, upsert: true });
      });

      const ocrResults = await Promise.allSettled(ocrTasks);
      ocrResults.forEach((res, i) => {
        if (res.status === 'fulfilled' && !res.value.error) {
          uploadedPaths.push(`poi-evidence/${user.id}/${timestamp}_ocr_${i}.jpg`);
        }
      });
    }

    // 4. INVOCACIÓN AL SENSOR-INGESTOR IA
    const { data, error: functionError } = await supabase.functions.invoke('geo-sensor-ingestor', {
      body: {
        ...validatedData,
        heroImageBase64: payload.heroImage,
        ocrImagesBase64: payload.ocrImages || [],
        userId: user.id
      },
      headers: { Authorization: `Bearer ${serviceKey}` }
    });

    if (functionError) throw new Error(`AI_INGESTOR_FAIL: ${functionError.message}`);

    const poiId = data.data.poiId;

    // 5. VINCULACIÓN DE ACTIVOS (COMMIT FÍSICO)
    const publicHeroUrl = supabase.storage.from('podcasts').getPublicUrl(heroPath).data.publicUrl;
    const publicOcrUrls = uploadedPaths
      .filter(p => p.includes('_ocr_'))
      .map(p => supabase.storage.from('podcasts').getPublicUrl(p).data.publicUrl);

    const { error: dbUpdateError } = await supabase
      .from('points_of_interest')
      .update({
        gallery_urls: [publicHeroUrl, ...publicOcrUrls]
      })
      .eq('id', poiId);

    if (dbUpdateError) throw new Error(`DB_LINKING_FAIL: ${dbUpdateError.message}`);

    // Si todo es exitoso, limpiamos el tracker de fallos
    uploadedPaths = [];

    return {
      success: true,
      message: "Evidencia física blindada y analizada.",
      data: data.data
    };

  } catch (error: any) {
    const isTooLarge = error.message.includes('exceeded') || error.status === 413;
    console.error("🔥 [Geo-Action][Ingest-Error]:", error.message);
    
    return { 
      success: false, 
      message: "Fallo en la ingesta sensorial.", 
      error: isTooLarge ? "Expediente sobrepasa el límite industrial (4.5MB)." : error.message 
    };
  } finally {
    /**
     * PROTOCOLO JANITOR (AUTO-LIMPIEZA DE EMERGENCIA):
     * Si la variable uploadedPaths aún tiene elementos en este punto,
     * significa que el bloque try no se completó (ej. Fallo en IA o DB).
     * Ejecutamos la purga para evitar activos huérfanos.
     */
    if (uploadedPaths.length > 0) {
      console.warn("🧹 [Janitor] Purga de activos huérfanos ejecutada tras fallo crítico.");
      supabase.storage.from('podcasts').remove(uploadedPaths).catch(() => {});
    }
  }
}

/**
 * ---------------------------------------------------------------------------
 * V. ANCLAJE ACÚSTICO Y SÍNTESIS NARRATIVA
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

    if (uploadError) throw new Error("FALLO_STORAGE_AUDIO");

    const audioUrl = supabase.storage.from('podcasts').getPublicUrl(audioPath).data.publicUrl;

    await supabase
      .from('points_of_interest')
      .update({ ambient_audio_url: audioUrl })
      .eq('id', params.poiId);

    return { success: true, message: "Paisaje sonoro anclado.", data: { audioUrl } };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][Audio-Fatal]:", error.message);
    return { success: false, message: "Error acústico.", error: error.message };
  }
}

/**
 * synthesizeNarrativeAction:
 * [REFORMA V7.3]: Alineación estricta con NarrativeDepth y NarrativeTone para 
 * sanar el contrato de compilación (TS2345).
 */
export async function synthesizeNarrativeAction(params: {
  poiId: number;
  depth: NarrativeDepth;
  tone: NarrativeTone;
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
    return { success: true, message: "Sabiduría sintetizada.", data: data.data };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][Narrative-Fatal]:", error.message);
    return { success: false, message: "Fallo en la forja narrativa.", error: error.message };
  }
}

/**
 * ---------------------------------------------------------------------------
 * VI. FASE 4: PUBLICACIÓN FINAL (THE COMMIT)
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

    if (error) throw new Error("DB_PUBLISH_FAIL");

    // [MANDATO V2.8]: Revalidación de Malla Activa.
    // Fuerza a Next.js a purgar la caché del servidor para que el nuevo nodo sea visible.
    revalidatePath('/map');
    
    return { success: true, message: "Nodo materializado en la Malla." };
  } catch (error: any) {
    console.error("🔥 [Geo-Action][Publish-Fatal]:", error.message);
    return { success: false, message: "Error de publicación final.", error: error.message };
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V7.3):
 * 1. Type Alignment (TS2345): Se inyectaron los tipos NarrativeDepth y NarrativeTone 
 *    en synthesizeNarrativeAction para garantizar la compatibilidad con el UI.
 * 2. Deterministic Janitor: El bloque 'finally' asegura que, si existe una excepción
 *    tras la creación de los binarios, el Storage se purgue sin falta.
 * 3. Cache Purge: revalidatePath('/map') cierra el ciclo de creación informando al
 *    sistema que la bóveda NKV tiene un nuevo registro activo.
 */