// hooks/use-forge-orchestrator.ts
// VERSIÓN: 1.0 (NicePod Forge Orchestrator - Async AI Intelligence Edition)
// Misión: Gestionar el ciclo de vida de la ingesta sensorial e inteligencia narrativa.
// [NCIS DOGMA]: Soberanía del Hilo Principal. Las tareas pesadas no bloquean el movimiento.

"use client";

import {
  attachAmbientAudioAction,
  ingestPhysicalEvidenceAction,
  synthesizeNarrativeAction,
  transcribeVoiceIntentAction
} from "@/actions/geo-actions";
import { compressNicePodImage, nicepodLog } from "@/lib/utils";
import {
  GeoContextData,
  GeoEngineState,
  IngestionDossier,
  UserLocation
} from "@/types/geo-sovereignty";
import { useCallback, useState } from "react";

/**
 * UTILIDAD INTERNA: fileToBase64
 * Transmuta archivos binarios en strings para el puente hacia las Edge Functions.
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
 * El motor lógico para la creación de capital intelectual en NicePod.
 */
export function useForgeOrchestrator() {
  // --- I. ESTADO DE LA MISIÓN ---
  const [status, setStatus] = useState<GeoEngineState>('IDLE');
  const [data, setData] = useState<GeoContextData>({});
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * ingestSensoryData:
   * Misión: Comprimir evidencia física, convertir a Base64 e invocar al Ingestor.
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
      nicepodLog("🛑 [Forge-Orchestrator] Fallo de Ingesta: Voyager no localizado.", null, 'error');
      throw new Error("UBICACION_REQUERIDA");
    }

    setIsLocked(true);
    setStatus('INGESTING');
    setError(null);

    try {
      nicepodLog("⚙️ [Forge-Orchestrator] Refinando activos visuales...");

      /**
       * [YIELD]: Pausa táctica de 100ms.
       * Permite que el navegador respire y React actualice la UI al modo 'INGESTING'
       * antes de que el proceso de compresión Canvas sature el Main Thread.
       */
      await new Promise(resolve => setTimeout(resolve, 100));

      // 1. Compresión JIT (Hardware Accelerated Canvas)
      const [compressedHero, ...compressedOcr] = await Promise.all([
        compressNicePodImage(params.heroImage, 2048, 0.85),
        ...params.ocrImages.map(img => compressNicePodImage(img, 1600, 0.75))
      ]);

      // 2. Transmutación a Base64 para transporte
      const heroBase64 = await fileToBase64(compressedHero);
      const ocrBase64 = await Promise.all(compressedOcr.map(blob => fileToBase64(blob)));

      // 3. Ingesta Soberana vía Server Action
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
        throw new Error(result.error || "FAIL_SENSORY_INGESTION");
      }

      const { poiId, analysis } = result.data;

      // 4. Anclaje de Audio Ambiente (Opcional)
      if (params.ambientAudio) {
        const audioBase64 = await fileToBase64(params.ambientAudio);
        await attachAmbientAudioAction({ poiId, audioBase64 });
      }

      // 5. Construcción del Dossier de Inteligencia
      const dossier: IngestionDossier = {
        poi_id: poiId,
        raw_ocr_text: analysis.historicalDossier || null,
        weather_snapshot: { temp_c: 0, condition: "Sincronizado", is_day: true }, // Placeholder hasta resolución
        visual_analysis_dossier: analysis,
        sensor_accuracy: userLocation.accuracy,
        ingested_at: new Date().toISOString()
      };

      setData(prev => ({ ...prev, poiId, dossier }));
      setStatus('DOSSIER_READY');
      nicepodLog(`✅ [Forge-Orchestrator] Ingesta exitosa para Nodo #${poiId}`);

      return { poiId, dossier };

    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      setStatus('REJECTED');
      setError(errMsg);
      setIsLocked(false);
      nicepodLog("🔥 [Forge-Orchestrator] Error Crítico de Ingesta", errMsg, 'error');
      throw e;
    }
  }, []);

  /**
   * synthesizeNarrative:
   * Misión: Invocar al Agente 42 para forjar la crónica de voz.
   */
  const synthesizeNarrative = useCallback(async (params: {
    poiId: number;
    depth: 'flash' | 'cronica' | 'inmersion';
    tone: string;
    refinedIntent?: string;
  }) => {
    setStatus('SYNTHESIZING');
    try {
      const result = await synthesizeNarrativeAction(params);

      if (!result.success || !result.data) {
        throw new Error(result.error || "FAIL_NARRATIVE_SYNTHESIS");
      }

      setData(prev => ({ ...prev, narrative: result.data }));
      setStatus('NARRATIVE_READY');
      nicepodLog(`🎯 [Forge-Orchestrator] Crónica forjada para Nodo #${params.poiId}`);

    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      setStatus('REJECTED');
      setError(errMsg);
      nicepodLog("🔥 [Forge-Orchestrator] Error en Síntesis Narrativa", errMsg, 'error');
      throw e;
    }
  }, []);

  /**
   * transcribeVoiceIntent:
   * Misión: Transmutar audio de voz en semilla de intención de texto.
   */
  const transcribeVoiceIntent = useCallback(async (audioBase64: string) => {
    return await transcribeVoiceIntentAction({ audioBase64 });
  }, []);

  /**
   * resetForge:
   * Limpia la memoria volátil del proceso de forja.
   */
  const resetForge = useCallback(() => {
    setStatus('IDLE');
    setData({});
    setIsLocked(false);
    setError(null);
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
 * NOTA TÉCNICA DEL ARCHITECT (V1.0):
 * 1. Desacoplo Cognitivo: Este hook centraliza la 'Fuerza Bruta' de la aplicación. 
 *    Al estar separado del GPS, garantizamos que el hardware sensorial respire 
 *    mientras el software procesa imágenes de 12MB a través de Canvas.
 * 2. Robustez ante Fallos: El estado 'REJECTED' preserva los datos de error, 
 *    permitiendo que la UI de ScannerUI (Step 2) ofrezca un reintento limpio 
 *    sin perder el contexto de la captura.
 * 3. Preparado para Vercel: Uso estricto de Server Actions y transporte Base64, 
 *    cumpliendo con el 'bodySizeLimit' de 4MB configurado en next.config.mjs.
 */