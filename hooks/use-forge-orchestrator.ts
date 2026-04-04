/**
 * ARCHIVO: hooks/use-forge-orchestrator.ts
 * VERSIÓN: 6.0 (NicePod Forge Orchestrator - Sovereign Integrity & Lightning Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Gestionar el ciclo de vida de ingesta sensorial orquestando la compresión JIT, 
 * la transcripción de voz y la transmisión directa de binarios (Lightning Protocol).
 * [REFORMA V6.0]: Sincronización total con la Constitución V7.7 y las Acciones V11.0, 
 * eliminando abreviaturas y garantizando la integridad del contrato industrial.
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
 * UTILIDAD INTERNA: transmutarArchivoABase64
 * Misión: Convertir binarios pequeños (voz) en cadenas seguras para transcripción.
 */
const transmutarArchivoABase64 = (archivo: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.readAsDataURL(archivo);
    lector.onload = () => resolve(lector.result as string);
    lector.onerror = (exception) => reject(exception);
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
      nicepodLog("⚙️ [ForgeOrchestrator] Iniciando Protocolo Lightning (Fase Concurrente V4.0)...");

      // Carga visual síncrona: Aseguramos que la interfaz repinte el estado de proceso.
      await new Promise((resolve) => setTimeout(resolve, 150));

      /**
       * 1. RESOLUCIÓN DE INTENCIONALIDAD COGNITIVA (Voz + Texto)
       * Misión: Fusionar el dictado acústico con las notas manuales.
       */
      let finalAdminIntentText = parameters.intentText;
      if (parameters.intentAudioBlob) {
        nicepodLog("🎙️ [ForgeOrchestrator] Transcribiendo intención dictada...");
        const audioBase64 = await transmutarArchivoABase64(parameters.intentAudioBlob);
        const transcriptionResults = await transcribeVoiceIntentAction({ audioBase64 });
        
        if (transcriptionResults.success && transcriptionResults.data?.transcription) {
          finalAdminIntentText = parameters.intentText.trim() !== "" 
            ? `${transcriptionResults.data.transcription}\n\n[Notas Adicionales]: ${parameters.intentText}`
            : transcriptionResults.data.transcription;
          nicepodLog("✅ [ForgeOrchestrator] Fusión de inteligencia completada.");
        }
      }

      if (!finalAdminIntentText || finalAdminIntentText.trim() === "") {
        finalAdminIntentText = "Captura de contexto urbano sin directriz explícita.";
      }

      /**
       * 2. CONCURRENCIA DE PREPARACIÓN DE ACTIVOS (OFF-MAIN-THREAD)
       * Misión: Procesar imágenes y sondeo climático mientras se autoriza la subida.
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
      const heroImageStoragePath = storagePaths[0];
      const ocrImageStoragePaths = storagePaths.slice(1);

      /**
       * 3. TRANSMISIÓN DIRECTA (Protocolo Lightning V4.0)
       * Misión: El navegador sube los binarios directamente a Supabase.
       */
      nicepodLog("🚀 [ForgeOrchestrator] Transfiriendo binarios pesados a la Bóveda...");

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
      
      const hasFailedTransmissions = uploadExecutionResults.some(response => !response.ok);
      if (hasFailedTransmissions) {
        throw new Error("STORAGE_UPLOAD_ERROR: Fricción detectada durante la transmisión directa.");
      }

      /**
       * 4. INVOCACIÓN AL ORÁCULO DE BORDE (Agente 42)
       * Misión: Peritaje multidimensional basado en las rutas del Storage.
       */
      nicepodLog("📡 [ForgeOrchestrator] Expediente visual sellado. Solicitando peritaje...");

      const ingestionResults = await ingestIntelligenceDossierAction({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        accuracy: userLocation.accuracy,
        heroImageStoragePath: heroImageStoragePath,
        ocrImageStoragePaths: ocrImageStoragePaths,
        categoryMission: parameters.categoryMission,
        categoryEntity: parameters.categoryEntity,
        historicalEpoch: parameters.historicalEpoch,
        resonanceRadius: parameters.resonanceRadius,
        adminIntent: finalAdminIntentText,
        referenceUrl: parameters.referenceUrl
      });

      if (!ingestionResults.success || !ingestionResults.data) {
        throw new Error(ingestionResults.error || "FAIL_AI_INGESTION");
      }

      const { pointOfInterestIdentification, analysis } = ingestionResults.data;

      // 5. MATERIALIZACIÓN DEL DOSSIER FINAL
      const compiledDossier: IngestionDossier = {
        point_of_interest_id: pointOfInterestIdentification,
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

      setData(previousData => ({ 
        ...previousData, 
        pointOfInterestIdentification, 
        dossier: compiledDossier 
      }));
      
      setStatus('DOSSIER_READY');
      nicepodLog(`✅ [ForgeOrchestrator] Nodo #${pointOfInterestIdentification} anclado con éxito.`);

      return { pointOfInterestIdentification, dossier: compiledDossier };

    } catch (exception: unknown) {
      const errorMessage = exception instanceof Error ? exception.message : String(exception);
      setStatus('REJECTED');

      if (errorMessage.includes("STORAGE_UPLOAD_ERROR")) {
        setError("Fricción en la red de almacenamiento. Reintente la captura.");
      } else {
        setError("El Oráculo no pudo procesar la evidencia. Verifique su sintonía.");
      }

      setIsLocked(false);
      nicepodLog("🔥 [ForgeOrchestrator] Colapso crítico en el Pipeline.", errorMessage, 'error');
      throw exception;
    }
  }, []);

  /**
   * synthesizeNarrative:
   * Misión: Ordenar al Agente 42 la síntesis final de sabiduría.
   */
  const synthesizeNarrative = useCallback(async (parameters: {
    pointOfInterestIdentification: number;
    depth: NarrativeDepth;
    tone: NarrativeTone;
    refinedIntent?: string;
  }) => {
    setStatus('SYNTHESIZING');
    setError(null);

    try {
      nicepodLog(`🧠 [ForgeOrchestrator] Despertando Agente de Síntesis para Nodo #${parameters.pointOfInterestIdentification}...`);
      const results = await synthesizeNarrativeAction(parameters);

      if (!results.success || !results.data) {
        throw new Error(results.error || "NARRATIVE_SYNTHESIS_FAILED");
      }

      setData(previousData => ({ ...previousData, narrative: results.data }));
      setStatus('NARRATIVE_READY');
      nicepodLog(`🎯 [ForgeOrchestrator] Sabiduría sintetizada y lista para propagación.`);

    } catch (exception: unknown) {
      const errorMessage = exception instanceof Error ? exception.message : String(exception);
      setStatus('REJECTED');
      setError("El Oráculo ha fallado en la síntesis narrativa. Reintente.");
      nicepodLog("🔥 [ForgeOrchestrator] Falla en motor de crónica.", errorMessage, 'error');
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
    nicepodLog("🧹 [ForgeOrchestrator] Memoria de forja purificada.");
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