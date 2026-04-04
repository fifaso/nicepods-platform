/**
 * ARCHIVO: hooks/use-forge-orchestrator.ts
 * VERSIÓN: 5.0 (NicePod Forge Orchestrator - Lightning Protocol & Build Shield Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Gestionar el ciclo de vida de ingesta sensorial orquestando la compresión JIT, 
 * la transcripción de voz y la evasión de los límites de Vercel mediante Subida Directa.
 * [REFORMA V5.0]: Eliminación de acciones obsoletas (Vercel Fix), implementación de 
 * carga paralela lightning y purificación total de nomenclatura.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useCallback, useState } from "react";
import { compressNicePodImage, nicepodLog } from "@/lib/utils";
import {
  ingestIntelligenceDossierAction, 
  requestUploadTokensAction,       
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
 * UTILIDAD INTERNA: fileToBase64
 * Misión: Transmutar binarios de voz (pequeños) en cadenas seguras para transcripción.
 */
const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (exception) => reject(exception);
  });
};

/**
 * HOOK: useForgeOrchestrator
 * El reactor lógico para la creación de capital intelectual en el Borde.
 */
export function useForgeOrchestrator() {
  // --- I. ESTADO DE LA MÁQUINA DE FORJA ---
  const [status, setStatus] = useState<GeoEngineState>('IDLE');
  const [data, setData] = useState<GeoContextData>({});
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * ingestSensoryData:
   * Misión: Comprimir evidencia, realizar subida directa a Storage y despachar al Ingestor IA.
   */
  const ingestSensoryData = useCallback(async (
    userLocation: UserLocation | null,
    parameters: {
      heroImage: File;
      ocrImages: File[];
      ambientAudio?: Blob | null;
      intentText: string;
      intentAudioBlob?: Blob | null;
      categoryMission: CategoryMission;
      categoryEntity: CategoryEntity;
      historicalEpoch: HistoricalEpoch;
      resonanceRadius: number;
      referenceUrl?: string;
    }
  ) => {
    if (!userLocation) {
      nicepodLog("🛑 [ForgeOrchestrator] Ingesta abortada: Voyager sin anclaje GPS.", null, 'error');
      throw new Error("UBICACION_REQUERIDA");
    }

    setIsLocked(true);
    setStatus('INGESTING');
    setError(null);

    try {
      nicepodLog("⚙️ [ForgeOrchestrator] Iniciando Protocolo Lightning (Fase Concurrente)...");

      // Carga visual síncrona: Aseguramos que la UI repinte el estado de proceso.
      await new Promise((resolve) => setTimeout(resolve, 150));

      /**
       * 1. RESOLUCIÓN DE INTENCIONALIDAD COGNITIVA (Voz + Texto)
       * Misión: Fusionar el dictado acústico con las notas manuales antes de la ingesta visual.
       */
      let finalAdminIntent = parameters.intentText;
      if (parameters.intentAudioBlob) {
        nicepodLog("🎙️ [ForgeOrchestrator] Despachando dictado para transcripción neuronal...");
        const intentBase64 = await fileToBase64(parameters.intentAudioBlob);
        const transcriptionResults = await transcribeVoiceIntentAction({ audioBase64: intentBase64 });
        
        if (transcriptionResults.success && transcriptionResults.data?.transcription) {
          finalAdminIntent = parameters.intentText.trim() !== "" 
            ? `${transcriptionResults.data.transcription}\n\n[Notas Adicionales]: ${parameters.intentText}`
            : transcriptionResults.data.transcription;
          nicepodLog("✅ [ForgeOrchestrator] Fusión de inteligencia completada.");
        }
      }

      if (!finalAdminIntent || finalAdminIntent.trim() === "") {
        finalAdminIntent = "Captura de contexto urbano sin directriz explícita.";
      }

      /**
       * 2. CONCURRENCIA DE PREPARACIÓN DE ACTIVOS
       * Disparamos compresión de imágenes, sondeo de clima y solicitud de tokens de forma paralela.
       */
      const [
        compressedHeroImageBlob, 
        ocrCompressionBlobArray, 
        weatherResolution, 
        tokensResponse
      ] = await Promise.all([
        compressNicePodImage(parameters.heroImage, 1920, 0.82),
        Promise.all(parameters.ocrImages.map(image => compressNicePodImage(image, 1280, 0.70))),
        resolveLocationAction(userLocation.latitude, userLocation.longitude),
        requestUploadTokensAction([
          'hero.jpg', 
          ...parameters.ocrImages.map((_, index) => `ocr_${index}.jpg`)
        ])
      ]);

      if (!tokensResponse.success || !tokensResponse.data) {
        throw new Error(tokensResponse.error || "FALLO_ADQUISICION_TOKENS");
      }

      const { paths: storagePaths, uploadUrls } = tokensResponse.data;
      const heroStoragePath = storagePaths[0];
      const ocrStoragePaths = storagePaths.slice(1);

      /**
       * 3. TRANSMISIÓN DIRECTA A BÓVEDA (Lightning Protocol)
       * Misión: El navegador sube los binarios directamente a Supabase Storage.
       */
      nicepodLog("🚀 [ForgeOrchestrator] Transmitiendo binarios pesados al Storage Soberano...");

      const allBinaryBlobs = [compressedHeroImageBlob, ...ocrCompressionBlobArray];
      
      const uploadExecutionResults = await Promise.all(
        allBinaryBlobs.map((blob, index) => {
          return fetch(uploadUrls[index], {
            method: 'PUT',
            body: blob,
            headers: { 'Content-Type': 'image/jpeg' }
          });
        })
      );
      
      const hasFailedUploads = uploadExecutionResults.some(response => !response.ok);
      if (hasFailedUploads) {
        throw new Error("STORAGE_UPLOAD_ERROR: Fricción detectada durante la transmisión directa.");
      }

      /**
       * 4. INVOCACIÓN AL ORÁCULO DE BORDE (Agente 42)
       * Enviamos un payload ligero (solo rutas) evitando el colapso de Vercel.
       */
      nicepodLog("📡 [ForgeOrchestrator] Despertando inteligencia visual para peritaje...");

      const ingestionFinalResults = await ingestIntelligenceDossierAction({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        accuracy: userLocation.accuracy,
        heroImagePath: heroStoragePath,
        ocrImagePaths: ocrStoragePaths,
        categoryMission: parameters.categoryMission,
        categoryEntity: parameters.categoryEntity,
        historicalEpoch: parameters.historicalEpoch,
        resonanceRadius: parameters.resonanceRadius,
        adminIntent: finalAdminIntent,
        referenceUrl: parameters.referenceUrl
      });

      if (!ingestionFinalResults.success || !ingestionFinalResults.data) {
        throw new Error(ingestionFinalResults.error || "FAIL_AI_INGESTION");
      }

      const { poiId, analysis } = ingestionFinalResults.data;

      // 5. MATERIALIZACIÓN DEL DOSSIER FINAL PARA LA UI
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
      nicepodLog(`✅ [ForgeOrchestrator] Misión completada. Nodo #${poiId} anclado.`);

      return { poiId, dossier: compiledDossier };

    } catch (exception: unknown) {
      const errorMessage = exception instanceof Error ? exception.message : String(exception);
      setStatus('REJECTED');

      if (errorMessage.includes("STORAGE_UPLOAD_ERROR")) {
        setError("Fricción en la red de almacenamiento. Reintente el proceso.");
      } else {
        setError("El Oráculo no pudo procesar la evidencia. Verifique su sintonía.");
      }

      setIsLocked(false);
      nicepodLog("🔥 [ForgeOrchestrator] Colapso en el Pipeline de Ingesta.", errorMessage, 'error');
      throw exception;
    }
  }, []);

  /**
   * synthesizeNarrative:
   * Misión: Invocar la síntesis final de sabiduría anclada.
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
      nicepodLog(`🧠 [ForgeOrchestrator] Despertando Agente de Síntesis para Nodo #${params.poiId}...`);
      const results = await synthesizeNarrativeAction(params);

      if (!results.success || !results.data) {
        throw new Error(results.error || "NARRATIVE_SYNTHESIS_FAILED");
      }

      setData(previousData => ({ ...previousData, narrative: results.data }));
      setStatus('NARRATIVE_READY');
      nicepodLog(`🎯 [ForgeOrchestrator] Sabiduría sintetizada y lista para propagación.`);

    } catch (exception: unknown) {
      const errorMessage = exception instanceof Error ? exception.message : String(exception);
      setStatus('REJECTED');
      setError("El Oráculo ha fallado en la síntesis. Verifique su red.");
      nicepodLog("🔥 [ForgeOrchestrator] Falla en la forja narrativa.", errorMessage, 'error');
      throw exception;
    }
  }, []);

  const transcribeVoiceIntent = useCallback(async (audioBase64: string) => {
    return await transcribeVoiceIntentAction({ audioBase64 });
  }, []);

  const resetForge = useCallback(() => {
    setStatus('IDLE');
    setData({});
    setIsLocked(false);
    setError(null);
    nicepodLog("🧹 [ForgeOrchestrator] Memoria purgada.");
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