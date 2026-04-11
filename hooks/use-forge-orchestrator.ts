/**
 * ARCHIVO: hooks/use-forge-orchestrator.ts
 * VERSIÓN: 9.0 (NicePod Forge Orchestrator - Network Resilience & Industrial Nominal Sync)
 * PROTOCOLO: MADRID RESONANCE V4.5
 * 
 * Misión: Gestionar el ciclo de vida de ingesta sensorial orquestando la compresión 
 * Just-In-Time (JIT), la transcripción de voz y la transmisión directa de binarios 
 * mediante el Protocolo Lightning (Signed Uniform Resource Locators).
 * [REFORMA V9.0]: Sincronización nominal total con la Constitución de Soberanía V8.6 
 * y las Acciones Geográficas V14.0. Resolución de "Uniones Débiles" mediante la 
 * eliminación del tipo 'any'. Implementación de resiliencia ante errores de 
 * desbordamiento de pila (Error 500) del Borde.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useCallback, useState } from "react";
import { executeAsynchronousImageCompression, nicepodLog } from "@/lib/utils";
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
 * INTERFAZ: WeatherIntelligenceResponse
 * Misión: Definir la estructura de los datos meteorológicos recolectados en el Borde.
 */
interface WeatherIntelligenceResponse {
  atmosphericWeather?: {
    temperatureCelsius: number;
    conditionText: string;
    isDaytime: boolean;
  };
}

/**
 * UTILIDAD INTERNA: transmuteFileToAudioBinaryBase64Data
 * Misión: Convertir binarios pequeños en cadenas seguras para transcripción neuronal.
 */
const transmuteFileToAudioBinaryBase64Data = (fileOrBlob: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(fileOrBlob);
    fileReader.onload = () => resolve(fileReader.result as string);
    fileReader.onerror = (hardwareException) => reject(hardwareException);
  });
};

/**
 * HOOK: useForgeOrchestrator
 * El reactor lógico para la creación de capital intelectual en la Workstation.
 */
export function useForgeOrchestrator() {
  // --- I. ESTADO DE LA MÁQUINA DE FORJA (NOMINAL INTEGRITY) ---
  const [forgeStatus, setForgeStatus] = useState<GeoEngineState>('IDLE');
  const [forgeMetadata, setForgeMetadata] = useState<GeoContextData>({});
  const [isForgeProcessLocked, setIsForgeProcessLocked] = useState<boolean>(false);
  const [forgeOperationalError, setForgeOperationalError] = useState<string | null>(null);

  /**
   * ingestSensoryData:
   * Misión: Comprimir evidencia, realizar subida directa a Storage y despachar al Oráculo.
   * [SINCRO V9.0]: Manejo estricto de la respuesta del peritaje sin tipos 'any'.
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
      nicepodLog("🛑 [ForgeOrchestrator] Ingesta abortada: Voyager sin anclaje geodésico.", null, 'error');
      throw new Error("UBICACION_GEOGRAFICA_REQUERIDA");
    }

    setIsForgeProcessLocked(true);
    setForgeStatus('INGESTING');
    setForgeOperationalError(null);

    try {
      nicepodLog("⚙️ [ForgeOrchestrator] Iniciando Protocolo Lightning (Fase Concurrente V9.0)...");

      // Latencia de estabilización visual para el repintado de la interfaz.
      await new Promise((resolve) => setTimeout(resolve, 150));

      /**
       * 1. RESOLUCIÓN DE INTENCIONALIDAD COGNITIVA
       */
      let finalAdministratorIntentText = parameters.administratorIntentText;
      
      if (parameters.intentAudioBlob) {
        nicepodLog("🎙️ [ForgeOrchestrator] Transmitiendo dictado sensorial al Escriba Neuronal...");
        const audioBinaryBase64Data = await transmuteFileToAudioBinaryBase64Data(parameters.intentAudioBlob);
        const speechToTextResults = await transcribeVoiceIntentAction({ audioBase64Data: audioBinaryBase64Data });
        
        if (speechToTextResults.success && speechToTextResults.data?.transcriptionText) {
          finalAdministratorIntentText = parameters.administratorIntentText.trim() !== "" 
            ? `${speechToTextResults.data.transcriptionText}\n\n[Notas]: ${parameters.administratorIntentText}`
            : speechToTextResults.data.transcriptionText;
          nicepodLog("✅ [ForgeOrchestrator] Fusión de inteligencia acústica completada.");
        }
      }

      if (!finalAdministratorIntentText || finalAdministratorIntentText.trim() === "") {
        finalAdministratorIntentText = "Captura de contexto urbano sin directriz explícita.";
      }

      /**
       * 2. CONCURRENCIA DE PREPARACIÓN DE ACTIVOS (MTI - PILAR 4)
       */
      const [
        compressedHeroImageBlob, 
        opticalCharacterRecognitionCompressionBlobCollection, 
        weatherResolutionResults, 
        uploadTokensResponse
      ] = await Promise.all([
        executeAsynchronousImageCompression(parameters.heroImage, 1920, 0.82),
        Promise.all(parameters.opticalCharacterRecognitionImages.map(image => executeAsynchronousImageCompression(image, 1280, 0.70))),
        resolveLocationAction(userGeographicLocation.latitudeCoordinate, userGeographicLocation.longitudeCoordinate),
        requestUploadTokensAction([
          'primary_hero_evidence.jpg', 
          ...parameters.opticalCharacterRecognitionImages.map((_, itemIndex) => `detail_evidence_${itemIndex}.jpg`)
        ])
      ]);

      if (!uploadTokensResponse.success || !uploadTokensResponse.data) {
        throw new Error(uploadTokensResponse.error || "FALLO_ADQUISICION_PASAPORTES_STORAGE");
      }

      const { pathsCollection, uploadUrlsCollection } = uploadTokensResponse.data;
      const heroImageStoragePath = pathsCollection[0];
      const opticalCharacterRecognitionStoragePathsCollection = pathsCollection.slice(1);

      /**
       * 3. TRANSMISIÓN DIRECTA (Protocolo Lightning V4.2)
       */
      nicepodLog("🚀 [ForgeOrchestrator] Transfiriendo binarios visuales al Almacenamiento...");

      const allBinaryBlobsCollection = [compressedHeroImageBlob, ...opticalCharacterRecognitionCompressionBlobCollection];
      
      const uploadExecutionResults = await Promise.all(
        allBinaryBlobsCollection.map((binaryBlob, itemIndex) => {
          return fetch(uploadUrlsCollection[itemIndex], {
            method: 'PUT',
            body: binaryBlob,
            headers: { 'Content-Type': 'image/jpeg' }
          });
        })
      );
      
      const hasFailedTransmissions = uploadExecutionResults.some(networkResponse => !networkResponse.ok);
      if (hasFailedTransmissions) {
        throw new Error("STORAGE_UPLOAD_CRITICAL_ERROR: El servidor rechazó los binarios visuales.");
      }

      /**
       * 4. INVOCACIÓN AL ORÁCULO (AGENTE 42)
       * [MANDATO BSS]: Sincronización con PointOfInterestIngestionSchema V4.1.
       */
      nicepodLog("📡 [ForgeOrchestrator] Dossier sellado. Solicitando peritaje al Borde...");

      const ingestionFinalResults = await ingestIntelligenceDossierAction({
        latitudeCoordinate: userGeographicLocation.latitudeCoordinate,
        longitudeCoordinate: userGeographicLocation.longitudeCoordinate,
        accuracyMeters: userGeographicLocation.accuracyMeters,
        heroImageStoragePath: heroImageStoragePath,
        opticalCharacterRecognitionImagePaths: opticalCharacterRecognitionStoragePathsCollection,
        categoryMission: parameters.categoryMission,
        categoryEntity: parameters.categoryEntity,
        historicalEpoch: parameters.historicalEpoch,
        resonanceRadiusMeters: parameters.resonanceRadiusMeters,
        administratorIntent: finalAdministratorIntentText,
        referenceUniformResourceLocator: parameters.referenceUniformResourceLocator
      });

      if (!ingestionFinalResults.success || !ingestionFinalResults.data) {
        // [RESILIENCIA]: Captura de errores 500 (Stack Overflow u otros fallos de Borde)
        throw new Error(ingestionFinalResults.message || "FAIL_INTELLIGENCE_AGENCY_INGESTION");
      }

      const { pointOfInterestIdentification, analysisResults } = ingestionFinalResults.data;
      const weatherDataMetadata = weatherResolutionResults.data as WeatherIntelligenceResponse | undefined;

      /**
       * 5. MATERIALIZACIÓN DEL DOSSIER DE INTELIGENCIA
       * [SINCRO V9.0]: Mapeo total al contrato de Constitución V8.6.
       */
      const compiledIntelligenceDossier: IngestionDossier = {
        point_of_interest_identification: pointOfInterestIdentification,
        raw_optical_character_recognition_text: analysisResults.historicalDossier || null,
        weather_snapshot: {
          temperatureCelsius: weatherDataMetadata?.atmosphericWeather?.temperatureCelsius || 15,
          conditionText: weatherDataMetadata?.atmosphericWeather?.conditionText || "Atmósfera Estable",
          isDaytime: weatherDataMetadata?.atmosphericWeather?.isDaytime ?? true
        },
        visual_analysis_dossier: {
          historicalDossier: analysisResults.historicalDossier,
          architectureStyle: analysisResults.architectureStyle,
          atmosphere: analysisResults.atmosphere,
          detectedElementsCollection: analysisResults.detectedElements,
          detectedOfficialName: analysisResults.detectedOfficialName,
          administratorOriginalIntent: finalAdministratorIntentText,
          groundingVerification: analysisResults.groundingVerification
        },
        hardware_sensor_accuracy: userGeographicLocation.accuracyMeters,
        ingested_at_timestamp: new Date().toISOString()
      };

      // 6. ACTUALIZACIÓN DEL ESTADO SOBERANO
      setForgeMetadata(previousMetadata => ({ 
        ...previousMetadata, 
        pointOfInterestIdentification, 
        dossier: compiledIntelligenceDossier 
      }));
      
      setForgeStatus('DOSSIER_READY');
      nicepodLog(`✅ [ForgeOrchestrator] Nodo #${pointOfInterestIdentification} anclado con integridad.`);

      return { pointOfInterestIdentification, dossier: compiledIntelligenceDossier };

    } catch (operationalHardwareException: unknown) {
      const exceptionMessageText = operationalHardwareException instanceof Error 
        ? operationalHardwareException.message 
        : String(operationalHardwareException);
      
      setForgeStatus('REJECTED');
      
      // Mapeo de errores industriales para la interfaz de usuario
      if (exceptionMessageText.includes("Maximum call stack size exceeded") || exceptionMessageText.includes("500")) {
        setForgeOperationalError("Límite de procesamiento de imagen excedido. Capture una evidencia de menor resolución.");
      } else {
        setForgeOperationalError("El Oráculo no pudo procesar el expediente. Verifique la sintonía sensorial.");
      }

      setIsForgeProcessLocked(false);
      nicepodLog("🔥 [ForgeOrchestrator] Colapso en el pipeline de forja.", exceptionMessageText, 'error');
      throw operationalHardwareException;
    }
  }, []);

  /**
   * synthesizeNarrative:
   * Misión: Ordenar a la IA la síntesis final de sabiduría basada en el dossier auditado.
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
        throw new Error(synthesisResults.error || "NARRATIVE_SYNTHESIS_MASTER_FAILURE");
      }

      setForgeMetadata(previousMetadata => ({ 
        ...previousMetadata, 
        narrative: synthesisResults.data as { title: string; hook: string; script: string } 
      }));
      
      setForgeStatus('NARRATIVE_READY');
      nicepodLog(`🎯 [ForgeOrchestrator] Sabiduría sintetizada y lista para propagación.`);

    } catch (operationalHardwareException: unknown) {
      const exceptionMessageText = operationalHardwareException instanceof Error 
        ? operationalHardwareException.message 
        : String(operationalHardwareException);
        
      setForgeStatus('REJECTED');
      setForgeOperationalError("Error crítico en la forja narrativa del hito. Reintente el proceso.");
      nicepodLog("🔥 [ForgeOrchestrator] Falla en el motor literario neuronal.", exceptionMessageText, 'error');
      throw operationalHardwareException;
    }
  }, []);

  const transcribeVoiceIntent = useCallback(async (audioBase64Data: string) => {
    return await transcribeVoiceIntentAction({ audioBase64Data });
  }, []);

  const resetForge = useCallback(() => {
    setForgeStatus('IDLE');
    setForgeMetadata({});
    setIsForgeProcessLocked(false);
    setForgeOperationalError(null);
    nicepodLog("🧹 [ForgeOrchestrator] Memoria táctica purgada.");
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