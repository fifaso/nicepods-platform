/**
 * ARCHIVO: hooks/use-forge-orchestrator.ts
 * VERSIÓN: 7.0 (NicePod Forge Orchestrator - Sovereign Nominal & Integrity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Gestionar el ciclo de vida de ingesta sensorial orquestando la compresión 
 * Just-In-Time (JIT), la transcripción de voz y la transmisión directa de binarios 
 * mediante el Protocolo Lightning (Signed Uniform Resource Locators).
 * [REFORMA V7.0]: Sincronización nominal absoluta con el Esquema de Validación V4.1 
 * y las Acciones Geográficas V12.0. Erradicación total de acrónimos (ZAP) y 
 * blindaje total contra el tipo 'any' (BSS).
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
import { IntelligenceAgencyAnalysisData } from "@/lib/validation/poi-schema";

/**
 * UTILIDAD INTERNA: transmuteFileToAudioBase64Data
 * Misión: Convertir binarios pequeños (voz) en cadenas seguras para transcripción neuronal.
 */
const transmuteFileToAudioBase64Data = (fileOrBlob: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(fileOrBlob);
    fileReader.onload = () => resolve(fileReader.result as string);
    fileReader.onerror = (exception) => reject(exception);
  });
};

/**
 * HOOK: useForgeOrchestrator
 * El reactor lógico para la creación de capital intelectual en el Borde de la Workstation.
 */
export function useForgeOrchestrator() {
  // --- I. ESTADO DE LA MÁQUINA DE FORJA (NOMINAL INTEGRITY) ---
  const [forgeStatus, setForgeStatus] = useState<GeoEngineState>('IDLE');
  const [forgeMetadata, setForgeMetadata] = useState<GeoContextData>({});
  const [isForgeProcessLocked, setIsForgeProcessLocked] = useState<boolean>(false);
  const [forgeOperationalError, setForgeOperationalError] = useState<string | null>(null);

  /**
   * ingestSensoryData:
   * Misión: Comprimir evidencia, realizar subida directa a Storage (Lightning) 
   * y despachar al Ingestor de Inteligencia del Borde.
   */
  const ingestSensoryData = useCallback(async (
    userGeographicLocation: UserLocation | null,
    parameters: {
      heroImage: File;
      opticalCharacterRecognitionImages: File[];
      ambientAudioBlob?: Blob | null;
      administratorIntentText: string;
      intentAudioBlob?: Blob | null;
      categoryMission: CategoryMission;
      categoryEntity: CategoryEntity;
      historicalEpoch: HistoricalEpoch;
      resonanceRadiusMeters: number;
      referenceUniformResourceLocator?: string;
    }
  ) => {
    if (!userGeographicLocation) {
      nicepodLog("🛑 [ForgeOrchestrator] Ingesta abortada: Voyager sin anclaje de posicionamiento global.", null, 'error');
      throw new Error("UBICACION_GEOGRAFICA_REQUERIDA");
    }

    setIsForgeProcessLocked(true);
    setForgeStatus('INGESTING');
    setForgeOperationalError(null);

    try {
      nicepodLog("⚙️ [ForgeOrchestrator] Iniciando Protocolo Lightning (Fase Concurrente V7.0)...");

      // Latencia de estabilización visual para asegurar el repintado de la interfaz de usuario.
      await new Promise((resolve) => setTimeout(resolve, 150));

      /**
       * 1. RESOLUCIÓN DE INTENCIONALIDAD COGNITIVA (Voz + Texto)
       */
      let finalAdministratorIntentText = parameters.administratorIntentText;
      
      if (parameters.intentAudioBlob) {
        nicepodLog("🎙️ [ForgeOrchestrator] Despachando dictado sensorial para transcripción neuronal...");
        const audioBase64Data = await transmuteFileToAudioBase64Data(parameters.intentAudioBlob);
        const speechToTextResults = await transcribeVoiceIntentAction({ audioBase64Data });
        
        if (speechToTextResults.success && speechToTextResults.data?.transcriptionText) {
          finalAdministratorIntentText = parameters.administratorIntentText.trim() !== "" 
            ? `${speechToTextResults.data.transcriptionText}\n\n[Notas Adicionales]: ${parameters.administratorIntentText}`
            : speechToTextResults.data.transcriptionText;
          nicepodLog("✅ [ForgeOrchestrator] Fusión de inteligencia acústica completada.");
        }
      }

      if (!finalAdministratorIntentText || finalAdministratorIntentText.trim() === "") {
        finalAdministratorIntentText = "Captura de contexto urbano sin directriz explícita del curador.";
      }

      /**
       * 2. CONCURRENCIA DE PREPARACIÓN DE ACTIVOS (OFF-MAIN-THREAD ISOLATION)
       */
      const [
        compressedHeroImageBlob, 
        opticalCharacterRecognitionCompressionBlobArray, 
        weatherResolutionResults, 
        uploadTokensResponse
      ] = await Promise.all([
        compressNicePodImage(parameters.heroImage, 1920, 0.82),
        Promise.all(parameters.opticalCharacterRecognitionImages.map(image => compressNicePodImage(image, 1280, 0.70))),
        resolveLocationAction(userGeographicLocation.latitude, userGeographicLocation.longitude),
        requestUploadTokensAction([
          'hero_primary_evidence.jpg', 
          ...parameters.opticalCharacterRecognitionImages.map((_, itemIndex) => `optical_character_recognition_evidence_${itemIndex}.jpg`)
        ])
      ]);

      if (!uploadTokensResponse.success || !uploadTokensResponse.data) {
        throw new Error(uploadTokensResponse.error || "FALLO_ADQUISICION_TOKENS_STORAGE");
      }

      const { pathsCollection, uploadUrlsCollection } = uploadTokensResponse.data;
      const heroImageStoragePath = pathsCollection[0];
      const opticalCharacterRecognitionStoragePaths = pathsCollection.slice(1);

      /**
       * 3. TRANSMISIÓN DIRECTA (Protocolo Lightning V4.0)
       * Misión: Eludir el hilo de ejecución de Vercel transmitiendo directamente al Metal.
       */
      nicepodLog("🚀 [ForgeOrchestrator] Transfiriendo binarios visuales pesados a la Bóveda...");

      const allBinaryBlobsCollection = [compressedHeroImageBlob, ...opticalCharacterRecognitionCompressionBlobArray];
      
      const uploadExecutionResults = await Promise.all(
        allBinaryBlobsCollection.map((binaryBlob, itemIndex) => {
          return fetch(uploadUrlsCollection[itemIndex], {
            method: 'PUT',
            body: binaryBlob,
            headers: { 'Content-Type': 'image/jpeg' }
          });
        })
      );
      
      const hasFailedTransmissions = uploadExecutionResults.some(response => !response.ok);
      if (hasFailedTransmissions) {
        throw new Error("STORAGE_UPLOAD_ERROR: Fricción crítica detectada durante la transmisión directa al Metal.");
      }

      /**
       * 4. INVOCACIÓN AL ORÁCULO DE INTELIGENCIA (Agente 42)
       * [MANDATO BSS]: Despachamos parámetros tipados según el esquema de validación V4.1.
       */
      nicepodLog("📡 [ForgeOrchestrator] Expediente visual sellado. Solicitando peritaje al Oráculo...");

      const ingestionFinalResults = await ingestIntelligenceDossierAction({
        latitudeCoordinate: userGeographicLocation.latitude,
        longitudeCoordinate: userGeographicLocation.longitude,
        accuracyMeters: userGeographicLocation.accuracy,
        heroImageStoragePath: heroImageStoragePath,
        opticalCharacterRecognitionImagePaths: opticalCharacterRecognitionStoragePaths,
        categoryMission: parameters.categoryMission,
        categoryEntity: parameters.categoryEntity,
        historicalEpoch: parameters.historicalEpoch,
        resonanceRadiusMeters: parameters.resonanceRadiusMeters,
        administratorIntent: finalAdministratorIntentText,
        referenceUniformResourceLocator: parameters.referenceUniformResourceLocator
      });

      if (!ingestionFinalResults.success || !ingestionFinalResults.data) {
        throw new Error(ingestionFinalResults.error || "FAIL_INTELLIGENCE_AGENCY_INGESTION");
      }

      const { pointOfInterestIdentification, analysisResults } = ingestionFinalResults.data;

      /**
       * 5. MATERIALIZACIÓN DEL DOSSIER DE INTELIGENCIA FINAL
       * [MANDATO BSS]: Se utiliza tipado estricto IntelligenceAgencyAnalysisData para el análisis.
       */
      const compiledIntelligenceDossier: IngestionDossier = {
        point_of_interest_identification: pointOfInterestIdentification,
        raw_ocr_text: analysisResults.historicalDossier || null,
        weather_snapshot: {
          temp_c: weatherResolutionResults.success ? (weatherResolutionResults.data?.current?.temp_c || 15) : 15,
          condition: weatherResolutionResults.success ? (weatherResolutionResults.data?.current?.condition?.text || "Despejado") : "Despejado",
          is_day: weatherResolutionResults.success ? !!weatherResolutionResults.data?.current?.is_day : true
        },
        visual_analysis_dossier: {
          ...analysisResults,
          grounding_verification: analysisResults.groundingVerification
        },
        sensor_accuracy: userGeographicLocation.accuracy,
        ingested_at: new Date().toISOString()
      };

      // 6. ACTUALIZACIÓN DEL ESTADO GLOBAL DE LA FORJA
      setForgeMetadata(previousMetadata => ({ 
        ...previousMetadata, 
        pointOfInterestIdentification, 
        dossier: compiledIntelligenceDossier 
      }));
      
      setForgeStatus('DOSSIER_READY');
      nicepodLog(`✅ [ForgeOrchestrator] Nodo de inteligencia #${pointOfInterestIdentification} anclado con éxito.`);

      return { pointOfInterestIdentification, dossier: compiledIntelligenceDossier };

    } catch (operationalException: unknown) {
      const exceptionMessage = operationalException instanceof Error ? operationalException.message : String(operationalException);
      setForgeStatus('REJECTED');

      if (exceptionMessage.includes("STORAGE_UPLOAD_ERROR")) {
        setForgeOperationalError("Fricción en la red de almacenamiento perimetral. Reintente la captura de evidencia.");
      } else {
        setForgeOperationalError("El Oráculo de Inteligencia no pudo procesar la evidencia visual. Verifique su sintonía.");
      }

      setIsForgeProcessLocked(false);
      nicepodLog("🔥 [ForgeOrchestrator] Colapso crítico en el pipeline de forja.", exceptionMessage, 'error');
      throw operationalException;
    }
  }, []);

  /**
   * synthesizeNarrative:
   * Misión: Ordenar al motor de inteligencia la síntesis final de sabiduría basada en el dossier.
   */
  const synthesizeNarrative = useCallback(async (parameters: {
    pointOfInterestIdentification: number;
    narrativeDepth: NarrativeDepth;
    narrativeTone: NarrativeTone;
    refinedAdministratorIntent?: string;
  }) => {
    setForgeStatus('SYNTHESIZING');
    setForgeOperationalError(null);

    try {
      nicepodLog(`🧠 [ForgeOrchestrator] Despertando Agente de Síntesis para el Nodo #${parameters.pointOfInterestIdentification}...`);
      const synthesisResults = await synthesizeNarrativeAction(parameters);

      if (!synthesisResults.success || !synthesisResults.data) {
        throw new Error(synthesisResults.error || "NARRATIVE_SYNTHESIS_FAILED");
      }

      setForgeMetadata(previousMetadata => ({ 
        ...previousMetadata, 
        narrative: synthesisResults.data as { title: string; hook: string; script: string } 
      }));
      
      setForgeStatus('NARRATIVE_READY');
      nicepodLog(`🎯 [ForgeOrchestrator] Sabiduría sintetizada y lista para la propagación acústica.`);

    } catch (operationalException: unknown) {
      const exceptionMessage = operationalException instanceof Error ? operationalException.message : String(operationalException);
      setForgeStatus('REJECTED');
      setForgeOperationalError("El Oráculo ha fallado en la síntesis narrativa del hito. Reintente el proceso.");
      nicepodLog("🔥 [ForgeOrchestrator] Falla en el motor de crónica narrativa.", exceptionMessage, 'error');
      throw operationalException;
    }
  }, []);

  /**
   * transcribeVoiceIntent:
   * Misión: Fachada reactiva para la transmutación de voz a texto.
   */
  const transcribeVoiceIntent = useCallback(async (audioBase64Data: string) => {
    return await transcribeVoiceIntentAction({ audioBase64Data });
  }, []);

  /**
   * resetForge:
   * Misión: Purga absoluta de la memoria táctica y liberación del bloqueo de proceso.
   */
  const resetForge = useCallback(() => {
    setForgeStatus('IDLE');
    setForgeMetadata({});
    setIsForgeProcessLocked(false);
    setForgeOperationalError(null);
    nicepodLog("🧹 [ForgeOrchestrator] Memoria de la forja purgada íntegramente.");
  }, []);

  return {
    forgeStatus,
    forgeData: forgeMetadata,
    isForgeLocked: isForgeProcessLocked,
    forgeError: forgeOperationalError,
    ingestSensoryData,
    synthesizeNarrative,
    transcribeVoiceIntent,
    resetForge
  };
}