// hooks/use-forge-orchestrator.ts
// VERSIÓN: 1.1 (NicePod Forge Orchestrator - Industrial Hardening Edition)
// Misión: Gestionar el ciclo de vida de la ingesta sensorial e inteligencia narrativa.
// [NCIS DOGMA]: Soberanía del Hilo Principal. Las tareas pesadas no bloquean el movimiento.

"use client";

import { useCallback, useState } from "react";
import { compressNicePodImage, nicepodLog } from "@/lib/utils";
import {
  attachAmbientAudioAction,
  ingestPhysicalEvidenceAction,
  synthesizeNarrativeAction,
  transcribeVoiceIntentAction
} from "@/actions/geo-actions";
import {
  GeoContextData,
  GeoEngineState,
  IngestionDossier,
  UserLocation
} from "@/types/geo-sovereignty";

/**
 * UTILIDAD INTERNA: fileToBase64
 * Transmuta archivos binarios en strings para el puente hacia las Edge Functions.
 * Garantiza que el Payload no corrompa el transporte JSON.
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
      nicepodLog(`🧠 [Forge-Orchestrator] Invocando al Oráculo 42 para Nodo #${params.poiId}...`);
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
   * Limpia la memoria volátil del proceso de forja sin afectar el GPS.
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
 * NOTA TÉCNICA DEL ARCHITECT (V1.1):
 * 1. Desacoplo Cognitivo (Dual Brain): Al separar este hook del 'SensorAuthority', 
 *    garantizamos que las operaciones de 'Canvas API' (compresión de imágenes 4K) 
 *    no bloqueen el callback de 'watchPosition' del hardware GPS, manteniendo 
 *    el seguimiento del avatar 100% fluido en la malla.
 * 2. Robustez de Transporte (Build Shield): Uso estricto de Server Actions y 
 *    transporte Base64. Alineado con el 'bodySizeLimit' de 4MB de next.config.mjs 
 *    para evitar fallos de payload (HTTP 413) en la nube de Vercel.
 * 3. Fallback Seguro: Se captura rigurosamente cualquier excepción de la API de IA 
 *    pasando a estado 'REJECTED'. Esto permite a la 'ScannerUI' mantener el 
 *    formulario abierto y ofrecer un botón de reintento sin perder la foto.
 */