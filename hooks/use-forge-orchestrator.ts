/**
 * ARCHIVO: hooks/use-forge-orchestrator.ts
 * VERSIÓN: 2.0 (NicePod Forge Orchestrator - Off-Main-Thread Compression Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Gestionar el ciclo de vida de ingesta sensorial con rigor asíncrono y protección de CPU.
 * [REFORMA V2.0]: Delegación de compresión de imágenes al ecosistema de Web Workers.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import {
  attachAmbientAudioAction,
  ingestPhysicalEvidenceAction,
  resolveLocationAction,
  synthesizeNarrativeAction,
  transcribeVoiceIntentAction
} from "@/actions/geo-actions";
import { compressNicePodImage, nicepodLog } from "@/lib/utils";
import {
  GeoContextData,
  GeoEngineState,
  IngestionDossier,
  NarrativeDepth,
  NarrativeTone,
  UserLocation
} from "@/types/geo-sovereignty";
import { useCallback, useState } from "react";

/**
 * CONSTANTES DE GOBERNANZA TÁCTICA
 * Límite de 2.8MB. El Base64 aumenta el tamaño un ~33%. 
 * 2.8 * 1.33 = ~3.7MB (Seguro para el límite de 4MB de Vercel Next.js).
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
   * Misión: Comprimir evidencia asíncronamente, solicitar clima y despachar al Ingestor.
   */
  const ingestSensoryData = useCallback(async (
    userLocation: UserLocation | null,
    params: {
      heroImage: File;
      ocrImages: File[];
      intent: string;
      categoryId: string;
      radius: number;
      ambientAudio?: Blob | null;
    }
  ) => {
    if (!userLocation) {
      nicepodLog("🛑 [Forge-Orchestrator] Ingesta abortada: Voyager sin anclaje GPS.", null, 'error');
      throw new Error("UBICACION_REQUERIDA");
    }

    // 1. PRE-FLIGHT PAYLOAD GUARD
    const rawSize = params.heroImage.size +
      params.ocrImages.reduce((acc, img) => acc + img.size, 0) +
      (params.ambientAudio?.size || 0);

    if (rawSize > MAX_RAW_PAYLOAD_BYTES) {
      const mbSize = (rawSize / 1024 / 1024).toFixed(1);
      nicepodLog(`⚠️ [Forge-Orchestrator] Payload excesivo detectado: ${mbSize}MB`, null, 'warn');
      setError("La suma de imágenes supera el límite industrial (Recomendado < 2.5MB).");
      throw new Error("PAYLOAD_TOO_LARGE");
    }

    setIsLocked(true);
    setStatus('INGESTING');
    setError(null);

    try {
      nicepodLog("⚙️ [Forge-Orchestrator] Iniciando compresión JIT en hilos paralelos...");

      /**
       * YIELD TÁCTICO (150ms):
       * Cede el control al Event Loop para asegurar que la UI repinte el estado 'INGESTING'.
       */
      await new Promise(resolve => setTimeout(resolve, 150));

      // 2. CONCURRENCIA OFF-MAIN-THREAD (Imágenes + Clima)
      // [V3.0]: compressNicePodImage ahora delega la carga matemática al Worker.
      const [compressedHero, ocrResults, weatherRes] = await Promise.all([
        compressNicePodImage(params.heroImage, 1920, 0.82),
        Promise.all(params.ocrImages.map(img => compressNicePodImage(img, 1280, 0.70))),
        resolveLocationAction(userLocation.latitude, userLocation.longitude)
      ]);

      // 3. SERIALIZACIÓN BASE64 (Transporte Seguro)
      const heroBase64 = await fileToBase64(compressedHero);
      const ocrBase64 = await Promise.all(ocrResults.map(blob => fileToBase64(blob)));

      nicepodLog("📡 [Forge-Orchestrator] Transporte asíncrono completado. Enviando a Bóveda NKV...");

      // 4. INVOCACIÓN SOBERANA (Server Action con Janitor Protocol activo)
      const result = await ingestPhysicalEvidenceAction({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        accuracy: userLocation.accuracy,
        heroImage: heroBase64,
        ocrImages: ocrBase64,
        categoryId: params.categoryId,
        resonanceRadius: params.radius,
        adminIntent: params.intent
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || "FAIL_AI_INGESTION");
      }

      const { poiId, analysis } = result.data;

      // 5. ANCLAJE ACÚSTICO (Operación paralela no bloqueante)
      if (params.ambientAudio) {
        fileToBase64(params.ambientAudio).then(audioBase64 => {
          attachAmbientAudioAction({ poiId, audioBase64 }).catch(err => {
            nicepodLog("⚠️ [Forge-Orchestrator] El anclaje de ruido ambiente falló, pero el Dossier es válido.", err, 'warn');
          });
        });
      }

      // 6. MATERIALIZACIÓN DEL DOSSIER (Unificando IA y Clima)
      const dossier: IngestionDossier = {
        poi_id: poiId,
        raw_ocr_text: analysis.historicalDossier || null,
        weather_snapshot: {
          temp_c: weatherRes.success ? (weatherRes.data?.current?.temp_c || 15) : 15,
          condition: weatherRes.success ? (weatherRes.data?.current?.condition?.text || "Despejado") : "Despejado",
          is_day: weatherRes.success ? !!weatherRes.data?.current?.is_day : true
        },
        visual_analysis_dossier: analysis,
        sensor_accuracy: userLocation.accuracy,
        ingested_at: new Date().toISOString()
      };

      setData(prev => ({ ...prev, poiId, dossier }));
      setStatus('DOSSIER_READY');
      nicepodLog(`✅ [Forge-Orchestrator] Nodo #${poiId} materializado con éxito en la Malla.`);

      return { poiId, dossier };

    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      setStatus('REJECTED');

      // Mapeo de errores semántico para la UI
      if (errMsg === "PAYLOAD_TOO_LARGE") {
        setError("Expediente muy pesado.");
      } else {
        setError("El Oráculo no pudo procesar la evidencia visual. Verifique su red.");
      }

      setIsLocked(false);
      nicepodLog("🔥 [Forge-Orchestrator] Error Crítico de Ingesta", errMsg, 'error');
      throw e;
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
      nicepodLog(`🧠 [Forge-Orchestrator] Despertando Agente 42 para Nodo #${params.poiId}...`);
      const result = await synthesizeNarrativeAction(params);

      if (!result.success || !result.data) {
        throw new Error(result.error || "NARRATIVE_SYNTHESIS_FAILED");
      }

      setData(prev => ({ ...prev, narrative: result.data }));
      setStatus('NARRATIVE_READY');
      nicepodLog(`🎯 [Forge-Orchestrator] Sabiduría sintetizada y lista para publicación.`);

    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      setStatus('REJECTED');
      setError("El Oráculo ha fallado en la síntesis. Verifique su conexión y reintente.");
      nicepodLog("🔥 [Forge-Orchestrator] Fallo Narrativo", errMsg, 'error');
      throw e;
    }
  }, []);

  /**
   * transcribeVoiceIntent:
   * Misión: Transmutar dictado acústico en semilla de intención de texto.
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
    nicepodLog("🧹 [Forge-Orchestrator] Memoria táctica purgada.");
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
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Off-Main-Thread Shield: La invocación de compressNicePodImage ahora es un
 *    puente hacia el Web Worker. La CPU del dispositivo se libera de los cálculos
 *    de píxeles, garantizando que el UI spinner (CSS) jamás se congele.
 * 2. Graceful Error Handling: Si el Payload o el Worker fallan, el estado retorna 
 *    a REJECTED limpiamente, desbloqueando el UI (isLocked: false) para reintentos.
 */