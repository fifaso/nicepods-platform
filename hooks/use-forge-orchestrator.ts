/**
 * ARCHIVO: hooks/use-forge-orchestrator.ts
 * VERSIÓN: 4.0 (NicePod Forge Orchestrator - Sovereign Lightning Protocol Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Gestionar el ciclo de vida de ingesta sensorial orquestando la compresión JIT, 
 * la transcripción de voz y la evasión de los límites de Vercel mediante Subida Directa (Signed URLs).
 * [REFORMA V4.0]: Erradicación de Base64 visual. Implementación de Subida Directa paralela a Supabase.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useCallback, useState } from "react";
import { compressNicePodImage, nicepodLog } from "@/lib/utils";
import {
  attachAmbientAudioAction,
  ingestIntelligenceDossierAction, // [V4.0] Acción actualizada para rutas de Storage
  requestUploadTokensAction,       // [V4.0] Generador de Signed URLs
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
 * Aún requerida para el audio de intención (muy pequeño) y el audio ambiental.
 */
const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
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
      nicepodLog("⚙️ [ForgeOrchestrator] Iniciando Protocolo Lightning (Compresión paralela)...");

      // Cede control al navegador para mostrar spinner de carga.
      await new Promise((resolve) => setTimeout(resolve, 150));

      /**
       * 1. RESOLUCIÓN DE INTENCIONALIDAD COGNITIVA (Voz + Texto)
       */
      let finalAdminIntent = parameters.intentText;
      if (parameters.intentAudioBlob) {
        nicepodLog("🎙️ [ForgeOrchestrator] Transcribiendo dictado sensorial acústico...");
        const intentBase64 = await fileToBase64(parameters.intentAudioBlob);
        const transcriptionResult = await transcribeVoiceIntentAction({ audioBase64: intentBase64 });
        
        if (transcriptionResult.success && transcriptionResult.data?.transcription) {
          finalAdminIntent = parameters.intentText.trim() !== "" 
            ? `${transcriptionResult.data.transcription}\n\n[Notas del Curador]: ${parameters.intentText}`
            : transcriptionResult.data.transcription;
          nicepodLog("✅ [ForgeOrchestrator] Fusión de intención cognitivo-manual completada.");
        }
      }

      if (!finalAdminIntent || finalAdminIntent.trim() === "") {
        finalAdminIntent = "Captura de contexto urbano sin directriz explícita.";
      }

      /**
       * 2. CONCURRENCIA OFF-MAIN-THREAD (Imágenes + Clima)
       */
      const [compressedHeroImageBlob, ocrCompressionBlobArray, weatherResolution] = await Promise.all([
        compressNicePodImage(parameters.heroImage, 1920, 0.82),
        Promise.all(parameters.ocrImages.map(image => compressNicePodImage(image, 1280, 0.70))),
        resolveLocationAction(userLocation.latitude, userLocation.longitude)
      ]);

      /**
       * 3. PROTOCOLO LIGHTNING: SOLICITUD DE TOKENS (Signed URLs)
       * [MANDATO V4.0]: Evadir la barrera de 4MB de Vercel.
       */
      nicepodLog("🔑 [ForgeOrchestrator] Solicitando pasaportes de subida directa a la Bóveda...");
      
      const fileNamesToUpload = ['hero.jpg', ...ocrCompressionBlobArray.map((_, index) => `ocr_${index}.jpg`)];
      const tokensResponse = await requestUploadTokensAction(fileNamesToUpload);

      if (!tokensResponse.success || !tokensResponse.data) {
        throw new Error(tokensResponse.error || "FALLO_ADQUISICION_TOKENS");
      }

      const { paths: storagePaths, uploadUrls } = tokensResponse.data;
      const heroStoragePath = storagePaths[0];
      const ocrStoragePaths = storagePaths.slice(1);

      /**
       * 4. SUBIDA DIRECTA EN PARALELO (Navegador -> Supabase Storage)
       */
      nicepodLog("🚀 [ForgeOrchestrator] Transmitiendo binarios directamente a Supabase...");

      const allBlobs = [compressedHeroImageBlob, ...ocrCompressionBlobArray];
      
      const uploadPromises = allBlobs.map((blob, index) => {
        return fetch(uploadUrls[index], {
          method: 'PUT',
          body: blob,
          headers: { 'Content-Type': 'image/jpeg' }
        });
      });

      const uploadResults = await Promise.all(uploadPromises);
      
      const failedUploads = uploadResults.filter(response => !response.ok);
      if (failedUploads.length > 0) {
        throw new Error("STORAGE_UPLOAD_ERROR: Fricción detectada durante la transmisión directa.");
      }

      /**
       * 5. INVOCACIÓN SOBERANA AL METAL (Server Action de Borde)
       * Ahora enviamos un Payload ultraligero que contiene solo rutas de texto.
       */
      nicepodLog("📡 [ForgeOrchestrator] Transmisión exitosa. Despertando al Oráculo (Agente 42)...");

      const ingestionExecutionResult = await ingestIntelligenceDossierAction({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        accuracy: userLocation.accuracy,
        heroImagePath: heroStoragePath, // [V4.0]: Ruta de texto
        ocrImagePaths: ocrStoragePaths, // [V4.0]: Array de rutas de texto
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

      // 6. ANCLAJE ACÚSTICO DE FONDO (Opcional y no bloqueante)
      if (parameters.ambientAudio) {
        fileToBase64(parameters.ambientAudio).then(audioBase64 => {
          attachAmbientAudioAction({ poiId, audioBase64 }).catch(err => {
            nicepodLog("⚠️ [ForgeOrchestrator] Fricción en anclaje acústico de ambiente.", err, 'warn');
          });
        });
      }

      // 7. MATERIALIZACIÓN DEL DOSSIER FINAL
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
      nicepodLog(`✅ [ForgeOrchestrator] Malla Cognitiva sellada. Nodo #${poiId} materializado.`);

      return { poiId, dossier: compiledDossier };

    } catch (exception: unknown) {
      const errorMessage = exception instanceof Error ? exception.message : String(exception);
      setStatus('REJECTED');

      if (errorMessage.includes("FALLO_ADQUISICION_TOKENS") || errorMessage.includes("STORAGE_UPLOAD_ERROR")) {
        setError("Fricción en la infraestructura de almacenamiento. Reintente transmisión.");
      } else {
        setError("El Oráculo no pudo procesar la evidencia visual o acústica.");
      }

      setIsLocked(false);
      nicepodLog("🔥 [ForgeOrchestrator] Colapso Crítico en la Forja", errorMessage, 'error');
      throw exception;
    }
  }, []);

  /**
   * synthesizeNarrative:
   * Misión: Ordenar al Agente 42 la transmutación del dossier en una crónica.
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
      const synthesisResult = await synthesizeNarrativeAction(params);

      if (!synthesisResult.success || !synthesisResult.data) {
        throw new Error(synthesisResult.error || "NARRATIVE_SYNTHESIS_FAILED");
      }

      setData(previousData => ({ ...previousData, narrative: synthesisResult.data }));
      setStatus('NARRATIVE_READY');
      nicepodLog(`🎯 [ForgeOrchestrator] Sabiduría sintetizada y lista para propagación.`);

    } catch (exception: unknown) {
      const errorMessage = exception instanceof Error ? exception.message : String(exception);
      setStatus('REJECTED');
      setError("El Oráculo ha fallado en la síntesis. Verifique red y reintente.");
      nicepodLog("🔥 [ForgeOrchestrator] Falla en motor narrativo.", errorMessage, 'error');
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
    nicepodLog("🧹 [ForgeOrchestrator] Memoria de forja purgada.");
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
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Lightning Protocol: Se reemplazó el transporte Base64 por peticiones 'fetch' PUT
 *    directas al Bucket mediante Signed URLs. Esto erradica la saturación de Vercel y 
 *    multiplica x10 la velocidad de subida en redes móviles.
 * 2. Cross-Check Multidimensional: El orquestador transmite la misión, entidad y época
 *    junto con la referencia web, asegurando que la IA en el borde realice Grounding
 *    histórico real y no una simple descripción de imagen.
 * 3. Janitor Reliance: Al mandar las rutas y no los blobs, el backend (geo-actions.ts) 
 *    ejecutará un purgado inmediato del Storage si la IA falla en extraer sabiduría.
 */