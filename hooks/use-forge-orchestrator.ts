/**
 * ARCHIVO: hooks/use-forge-orchestrator.ts
 * VERSIÓN: 3.0 (NicePod Forge Orchestrator - Multidimensional & Voice-Intent Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Gestionar el ciclo de vida de ingesta sensorial orquestando la 
 * validación de taxonomía, compresión JIT y transcripción de voz en paralelo.
 * [REFORMA V3.0]: Alineación con el Contrato Taxonómico V7.5 y fusión de intenciones (Voz+Texto).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useCallback, useState } from "react";
import { compressNicePodImage, nicepodLog } from "@/lib/utils";
import {
  attachAmbientAudioAction,
  ingestPhysicalEvidenceAction,
  resolveLocationAction,
  synthesizeNarrativeAction,
  transcribeVoiceIntentAction
} from "@/actions/geo-actions";
import {
  CategoryEntity,
  CategoryMission,
  GeoContextData,
  GeoEngineState,
  HistoricalEpoch,
  IngestionDossier,
  NarrativeDepth,
  NarrativeTone,
  UserLocation
} from "@/types/geo-sovereignty";

/**
 * CONSTANTES DE GOBERNANZA TÁCTICA
 * Límite de 2.8MB en origen para evitar rebasar los 4.5MB tras Base64 en Vercel.
 */
const MAX_RAW_PAYLOAD_BYTES = 2.8 * 1024 * 1024;

/**
 * UTILIDAD INTERNA: fileToBase64
 * Transmuta activos físicos en cadenas de texto para transporte JSON síncrono.
 */
const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * HOOK: useForgeOrchestrator
 * El motor lógico para la creación de capital intelectual en el Borde.
 */
export function useForgeOrchestrator() {
  // --- I. ESTADO DE LA MÁQUINA DE FORJA ---
  const [status, setStatus] = useState<GeoEngineState>('IDLE');
  const [data, setData] = useState<GeoContextData>({});
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * ingestSensoryData:
   * Misión: Comprimir evidencia, transcribir voz, solicitar clima y despachar al Ingestor.
   */
  const ingestSensoryData = useCallback(async (
    userLocation: UserLocation | null,
    parameters: {
      heroImage: File;
      ocrImages: File[];
      ambientAudio?: Blob | null;
      intentText: string;
      intentAudioBlob?: Blob | null; // [V3.0]: Soporte para Dictado Sensorial
      categoryMission: CategoryMission;
      categoryEntity: CategoryEntity;
      historicalEpoch: HistoricalEpoch;
      resonanceRadius: number;
      referenceUrl?: string; // [V3.0]: Puente de Sabiduría (URL)
    }
  ) => {
    if (!userLocation) {
      nicepodLog("🛑 [ForgeOrchestrator] Ingesta abortada: Voyager sin anclaje GPS.", null, 'error');
      throw new Error("UBICACION_REQUERIDA");
    }

    // 1. PRE-FLIGHT PAYLOAD GUARD
    // Calculamos el peso total de los binarios visuales y acústicos
    const rawSize = parameters.heroImage.size +
      parameters.ocrImages.reduce((accumulated, image) => accumulated + image.size, 0) +
      (parameters.ambientAudio?.size || 0) +
      (parameters.intentAudioBlob?.size || 0);

    if (rawSize > MAX_RAW_PAYLOAD_BYTES) {
      const megabytesSize = (rawSize / 1024 / 1024).toFixed(1);
      nicepodLog(`⚠️ [ForgeOrchestrator] Payload excesivo detectado: ${megabytesSize}MB`, null, 'warn');
      setError("La evidencia física supera el límite industrial de transporte (< 2.8MB).");
      throw new Error("PAYLOAD_TOO_LARGE");
    }

    setIsLocked(true);
    setStatus('INGESTING');
    setError(null);

    try {
      nicepodLog("⚙️ [ForgeOrchestrator] Iniciando protocolo de concurrencia multimodal...");

      /**
       * YIELD TÁCTICO (150ms):
       * Cede el control al Event Loop para asegurar que la UI repinte el estado 'INGESTING'.
       */
      await new Promise(resolve => setTimeout(resolve, 150));

      /**
       * 2. RESOLUCIÓN DE INTENCIONALIDAD (V3.0)
       * Misión: Si existe un dictado por voz, transcribirlo y fusionarlo con el texto manual.
       */
      let finalAdminIntent = parameters.intentText;
      if (parameters.intentAudioBlob) {
        nicepodLog("🎙️ [ForgeOrchestrator] Transcribiendo dictado sensorial...");
        const intentBase64 = await fileToBase64(parameters.intentAudioBlob);
        const transcriptionResult = await transcribeVoiceIntentAction({ audioBase64: intentBase64 });
        
        if (transcriptionResult.success && transcriptionResult.data?.transcription) {
          // Fusionamos el texto dictado con las notas manuales (si las hay)
          finalAdminIntent = parameters.intentText.trim() !== "" 
            ? `${transcriptionResult.data.transcription}\n\n[Notas del Curador]: ${parameters.intentText}`
            : transcriptionResult.data.transcription;
          nicepodLog("✅ [ForgeOrchestrator] Fusión de intención completada.");
        } else {
          nicepodLog("⚠️ [ForgeOrchestrator] Fallo en transcripción de voz. Usando intención manual.", null, 'warn');
        }
      }

      // Si después de la fusión la intención sigue vacía, inyectamos un fallback seguro.
      if (!finalAdminIntent || finalAdminIntent.trim() === "") {
        finalAdminIntent = "Captura de contexto urbano sin directriz explícita.";
      }

      /**
       * 3. CONCURRENCIA OFF-MAIN-THREAD (Imágenes + Clima)
       * El Worker procesa los píxeles mientras el servidor resuelve la atmósfera.
       */
      const [compressedHeroImage, ocrCompressionResults, weatherResolution] = await Promise.all([
        compressNicePodImage(parameters.heroImage, 1920, 0.82),
        Promise.all(parameters.ocrImages.map(image => compressNicePodImage(image, 1280, 0.70))),
        resolveLocationAction(userLocation.latitude, userLocation.longitude)
      ]);

      // 4. SERIALIZACIÓN BASE64 (Transporte al Borde)
      const heroBase64 = await fileToBase64(compressedHeroImage);
      const ocrBase64Array = await Promise.all(ocrCompressionResults.map(blob => fileToBase64(blob)));

      nicepodLog("📡 [ForgeOrchestrator] Empaquetado finalizado. Invocando Oráculo (Edge)...");

      /**
       * 5. INVOCACIÓN SOBERANA AL METAL (Server Action)
       * [MANDATO V4.0]: Transmisión de la taxonomía completa y el enlace de sabiduría.
       */
      const ingestionExecutionResult = await ingestPhysicalEvidenceAction({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        accuracy: userLocation.accuracy,
        heroImage: heroBase64,
        ocrImages: ocrBase64Array,
        categoryMission: parameters.categoryMission,
        categoryEntity: parameters.categoryEntity,
        historicalEpoch: parameters.historicalEpoch,
        resonanceRadius: parameters.resonanceRadius,
        adminIntent: finalAdminIntent,
        referenceUrl: parameters.referenceUrl
      });

      if (!ingestionExecutionResult.success || !ingestionExecutionResult.data) {
        throw new Error(ingestionExecutionResult.error || "FAIL_AI_INGESTION");
      }

      const { poiId, analysis } = ingestionExecutionResult.data;

      // 6. ANCLAJE ACÚSTICO (Operación paralela no bloqueante)
      if (parameters.ambientAudio) {
        fileToBase64(parameters.ambientAudio).then(audioBase64 => {
          attachAmbientAudioAction({ poiId, audioBase64 }).catch(err => {
            nicepodLog("⚠️ [ForgeOrchestrator] El anclaje del ruido ambiente falló (No crítico).", err, 'warn');
          });
        });
      }

      // 7. MATERIALIZACIÓN DEL DOSSIER (Unificando IA y Clima para la UI)
      const compiledDossier: IngestionDossier = {
        poi_id: poiId,
        raw_ocr_text: analysis.historicalDossier || null,
        weather_snapshot: {
          temp_c: weatherResolution.success ? (weatherResolution.data?.current?.temp_c || 15) : 15,
          condition: weatherResolution.success ? (weatherResolution.data?.current?.condition?.text || "Despejado") : "Despejado",
          is_day: weatherResolution.success ? !!weatherResolution.data?.current?.is_day : true
        },
        visual_analysis_dossier: analysis,
        sensor_accuracy: userLocation.accuracy,
        ingested_at: new Date().toISOString()
      };

      setData(previousData => ({ ...previousData, poiId, dossier: compiledDossier }));
      setStatus('DOSSIER_READY');
      nicepodLog(`✅ [ForgeOrchestrator] Nodo #${poiId} materializado en la Malla.`);

      return { poiId, dossier: compiledDossier };

    } catch (exception: unknown) {
      const errorMessage = exception instanceof Error ? exception.message : String(exception);
      setStatus('REJECTED');

      // Mapeo semántico de errores para la UI
      if (errorMessage === "PAYLOAD_TOO_LARGE") {
        setError("El expediente excede el peso permitido. Intente eliminar imágenes OCR.");
      } else {
        setError("El Oráculo no pudo procesar la evidencia. Verifique su red.");
      }

      setIsLocked(false);
      nicepodLog("🔥 [ForgeOrchestrator] Error Crítico en la forja.", errorMessage, 'error');
      throw exception;
    }
  }, []);

  /**
   * synthesizeNarrative:
   * Misión: Invocar al Agente 42 para la redacción final de la crónica.
   */
  const synthesizeNarrative = useCallback(async (params: {
    poiId: number;
    depth: NarrativeDepth;
    tone: NarrativeTone;
    refinedIntent?: string;
  }) => {
    setStatus('SYNTHESIZING');
    setError(null);

    try {
      nicepodLog(`🧠 [ForgeOrchestrator] Despertando Agente 42 para Nodo #${params.poiId}...`);
      const synthesisResult = await synthesizeNarrativeAction(params);

      if (!synthesisResult.success || !synthesisResult.data) {
        throw new Error(synthesisResult.error || "NARRATIVE_SYNTHESIS_FAILED");
      }

      setData(previousData => ({ ...previousData, narrative: synthesisResult.data }));
      setStatus('NARRATIVE_READY');
      nicepodLog(`🎯 [ForgeOrchestrator] Sabiduría sintetizada y lista para publicación.`);

    } catch (exception: unknown) {
      const errorMessage = exception instanceof Error ? exception.message : String(exception);
      setStatus('REJECTED');
      setError("El Oráculo ha fallado en la síntesis. Reintente la operación.");
      nicepodLog("🔥 [ForgeOrchestrator] Fallo en la fase narrativa.", errorMessage, 'error');
      throw exception;
    }
  }, []);

  /**
   * transcribeVoiceIntent:
   * Exposición directa de la transcripción para usos fuera de la ingesta principal.
   */
  const transcribeVoiceIntent = useCallback(async (audioBase64: string) => {
    return await transcribeVoiceIntentAction({ audioBase64 });
  }, []);

  /**
   * resetForge:
   * Limpia el búfer de memoria sin destruir la telemetría GPS persistente.
   */
  const resetForge = useCallback(() => {
    setStatus('IDLE');
    setData({});
    setIsLocked(false);
    setError(null);
    nicepodLog("🧹 [ForgeOrchestrator] Memoria táctica purgada.");
  }, []);

  return {
    forgeStatus: status,
    forgeData: data,
    isForgeLocked: isLocked,
    forgeError: error,
    ingestSensoryData,
    synthesizeNarrative,
    transcribeVoiceIntent,
    resetForge
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Cognitive Fusion: Si el Voyager dicta una intención (intentAudioBlob) y también 
 *    escribe (intentText), el orquestador fusiona ambos datos. Esto permite un peritaje 
 *    en dos niveles: dictado fluido en la calle + precisiones técnicas en texto.
 * 2. Multidimensional Routing: El paso de CategoryMission y HistoricalEpoch asegura 
 *    que el Agente 42 no "alucine" la funcionalidad o la antigüedad del hito.
 * 3. Atomic Fallbacks: Si la transcripción por voz falla por error de red, el sistema 
 *    no se detiene; utiliza el texto manual (si lo hay) o un fallback de seguridad 
 *    y continúa la ingesta visual.
 */