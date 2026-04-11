/**
 * ARCHIVO: lib/utils.ts
 * VERSIÓN: 10.1 (NicePod Utility Core - Sovereign Legacy Bridge Edition)
 * PROTOCOLO: MADRID RESONANCE V4.5
 * 
 * Misión: Centralizar las utilidades de telemetría industrial, soberanía de activos, 
 * ingeniería acústica y procesamiento de imágenes.
 * [REFORMA V10.1]: Implementación de la Capa de Alias Soberanos para resolver el 
 * fallo de compilación global (124 errores). Se mantienen los nombres industriales 
 * como fuente de verdad, proveyendo puentes de compatibilidad para los 
 * componentes de la interfaz de usuario.
 * Nivel de Integridad: 100% (Soberano / Con Alias de Compatibilidad / Producción-Ready)
 */

import { type ClassValue, clsx as generateClassString } from "clsx";
import { twMerge as mergeTailwindClasses } from "tailwind-merge";

/**
 * ---------------------------------------------------------------------------
 * 0. PROTOCOLO SILENCE-GUARD INDUSTRIAL (INTERCEPCIÓN DE RUIDO)
 * ---------------------------------------------------------------------------
 */
if (typeof window !== 'undefined') {
  const PROHIBITED_LOG_PATTERNS_COLLECTION = [
    'Ignoring unknown image variable',
    'Cutoff is currently disabled on terrain',
    'Source "mapbox-dem" already exists',
    'formatDetection',
    'already exists'
  ];

  const nativeConsoleWarningAction = console.warn;
  console.warn = (...warningArguments: unknown[]) => {
    const firstArgument = warningArguments[0];
    if (typeof firstArgument === 'string') {
      const isInternalEngineNoise = PROHIBITED_LOG_PATTERNS_COLLECTION.some(pattern =>
        firstArgument.includes(pattern)
      );
      if (isInternalEngineNoise) return;
    }
    nativeConsoleWarningAction.apply(console, warningArguments);
  };
}

/**
 * ---------------------------------------------------------------------------
 * I. UTILIDADES DE ESTILO Y TELEMETRÍA INDUSTRIAL
 * ---------------------------------------------------------------------------
 */

/**
 * concatenateClassNames: 
 * Misión: Fusión inteligente de clases Tailwind CSS utilizando descriptores puros.
 */
export function concatenateClassNames(...classNamesInputsCollection: ClassValue[]) {
  return mergeTailwindClasses(generateClassString(classNamesInputsCollection));
}

/**
 * nicepodLog: Sistema de telemetría de consola asíncrono para monitoreo pericial.
 * [MTI]: Los logs se difieren para no impactar en el presupuesto de renderizado.
 */
export function nicepodLog(
  messageText: string,
  intelligenceMetadata: unknown = null,
  severityLevel: 'info' | 'warn' | 'error' = 'info'
) {
  if (process.env.NODE_ENV !== 'production') {
    setTimeout(() => {
      const logIdentificationPrefix = `[NicePod-V4.5]`;
      const localTimestampString = new Date().toLocaleTimeString();

      const logStylesDictionary = {
        info: 'color: #8b5cf6; font-weight: 900; background: rgba(139, 92, 246, 0.1); padding: 2px 4px; border-radius: 4px;',
        warn: 'color: #f59e0b; font-weight: 900;',
        error: 'color: #ef4444; font-weight: 900; border: 1px solid #ef4444; padding: 2px;'
      };

      if (severityLevel === 'error') {
        console.error(`%c${logIdentificationPrefix} 🔥 [${localTimestampString}] ${messageText}`, logStylesDictionary.error, intelligenceMetadata ?? '');
      } else if (severityLevel === 'warn') {
        console.warn(`%c${logIdentificationPrefix} ⚠️ [${localTimestampString}] ${messageText}`, logStylesDictionary.warn, intelligenceMetadata ?? '');
      } else {
        console.log(`%c${logIdentificationPrefix} 📡 [${localTimestampString}] ${messageText}`, logStylesDictionary.info, intelligenceMetadata ?? '');
      }
    }, 0);
  }
}

/**
 * ---------------------------------------------------------------------------
 * II. INGENIERÍA ACÚSTICA (VOICE ENGINE)
 * ---------------------------------------------------------------------------
 */

let sharedAudioContextInstance: AudioContext | null = null;

/**
 * getSharedAudioContext: 
 * Misión: Recuperar o inicializar el bus de audio global de la Workstation.
 */
export function getSharedAudioContext() {
  if (typeof window === 'undefined') return null;

  if (!sharedAudioContextInstance) {
    const AudioContextConstructor = window.AudioContext || (window as any).webkitAudioContext;
    sharedAudioContextInstance = new AudioContextConstructor();
  }

  if (sharedAudioContextInstance.state === 'suspended') {
    sharedAudioContextInstance.resume();
  }

  return sharedAudioContextInstance;
}

/**
 * cleanTextForNeuralSpeechSynthesis: 
 * Misión: Limpieza de narrativa para una síntesis de voz neuronal de alta fidelidad.
 */
export function cleanTextForNeuralSpeechSynthesis(rawNarrativeContent: string | null | undefined): string {
  if (!rawNarrativeContent) return "";
  return rawNarrativeContent
    .replace(/\$\$\$/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/^(Host|Narrador|Speaker\s?\d?):\s?/gim, "")
    .replace(/\*\*/g, "")
    .replace(/[*#_~`>]/g, "")
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * formatSecondsAsChronometer: 
 * Misión: Transmutar magnitud temporal en formato industrial (Minutos:Segundos).
 */
export function formatSecondsAsChronometer(totalSecondsMagnitude: number | undefined | null): string {
  if (totalSecondsMagnitude === undefined || totalSecondsMagnitude === null || !isFinite(totalSecondsMagnitude) || totalSecondsMagnitude < 0) {
    return "0:00";
  }
  const calculatedMinutesMagnitude = Math.floor(totalSecondsMagnitude / 60);
  const calculatedSecondsMagnitude = Math.floor(totalSecondsMagnitude % 60);
  return `${calculatedMinutesMagnitude}:${calculatedSecondsMagnitude.toString().padStart(2, "0")}`;
}

/**
 * ---------------------------------------------------------------------------
 * III. GOBERNANZA DE ACTIVOS (SUPABASE STORAGE PERSISTENCE)
 * ---------------------------------------------------------------------------
 */

const SUPABASE_STORAGE_PUBLIC_ROOT_UNIFORM_RESOURCE_LOCATOR = "https://arbojlknwilqcszuqope.supabase.co/storage/v1/object/public";

/**
 * getSupabaseAssetUniformResourceLocator:
 * Misión: Resolver la dirección física de un activo en el Almacenamiento del Metal.
 */
export function getSupabaseAssetUniformResourceLocator(assetStoragePath: string | null | undefined): string | null {
  if (!assetStoragePath) return null;
  if (assetStoragePath.startsWith('http')) return assetStoragePath;

  const sanitizedAssetPath = assetStoragePath.startsWith('/') ? assetStoragePath.substring(1) : assetStoragePath;

  if (!sanitizedAssetPath.includes('/')) {
    return `${SUPABASE_STORAGE_PUBLIC_ROOT_UNIFORM_RESOURCE_LOCATOR}/podcasts/${sanitizedAssetPath}`;
  }

  return `${SUPABASE_STORAGE_PUBLIC_ROOT_UNIFORM_RESOURCE_LOCATOR}/${sanitizedAssetPath}`;
}

/**
 * getSecureAssetWithAvailabilityFallback:
 * Misión: Garantizar visualización mediante fallbacks de alta disponibilidad.
 */
export function getSecureAssetWithAvailabilityFallback(
  assetStoragePath: string | null | undefined,
  assetCategoryType: 'avatar' | 'cover' | 'logo' = 'cover'
): string {
  const resolvedAssetUniformResourceLocator = getSupabaseAssetUniformResourceLocator(assetStoragePath);

  const isResolutionIntegrityValid = resolvedAssetUniformResourceLocator &&
    resolvedAssetUniformResourceLocator.trim() !== "" &&
    resolvedAssetUniformResourceLocator.indexOf('placeholder') === -1;

  if (isResolutionIntegrityValid) return resolvedAssetUniformResourceLocator as string;

  const contentDeliveryNetworkFallbacksDictionary = {
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=NicePodCurator",
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
    logo: "/nicepod-logo.png"
  };

  return contentDeliveryNetworkFallbacksDictionary[assetCategoryType] || contentDeliveryNetworkFallbacksDictionary.cover;
}

/**
 * ---------------------------------------------------------------------------
 * IV. RIGOR GEOESPACIAL (NOMINAL SYNCHRONIZATION)
 * ---------------------------------------------------------------------------
 */

/**
 * formatGeographicPointCoordinates: 
 * Misión: Representación técnica de un punto geodésico bajo la Constitución V8.6.
 */
export function formatGeographicPointCoordinates(longitudeCoordinate: number, latitudeCoordinate: number): string {
  return `${latitudeCoordinate.toFixed(6)}°N, ${longitudeCoordinate.toFixed(6)}°E`;
}

/**
 * getHumanReadableDistanceLabel: 
 * Misión: Métrica de proximidad para el radar situacional.
 */
export function getHumanReadableDistanceLabel(distanceInMetersMagnitude: number): string {
  if (distanceInMetersMagnitude < 1000) {
    return `${Math.round(distanceInMetersMagnitude)}m`;
  }
  return `${(distanceInMetersMagnitude / 1000).toFixed(1)}km`;
}

/**
 * ---------------------------------------------------------------------------
 * V. PIPELINE DE COMPRESIÓN IMAGEN JIT (HYBRID OFF-MAIN-THREAD)
 * ---------------------------------------------------------------------------
 */

/**
 * executeCompressionOnMainThreadFallback: 
 * Misión: Motor de respaldo atómico si el entorno es hostil a Web Workers.
 */
async function executeCompressionOnMainThreadFallback(
  sourceImageFile: File,
  maximumWidthPixels: number,
  compressionQualityFactor: number
): Promise<Blob> {
  return new Promise((resolve) => {
    const htmlImageElement = new Image();
    const objectUniformResourceLocator = URL.createObjectURL(sourceImageFile);
    htmlImageElement.src = objectUniformResourceLocator;

    htmlImageElement.onload = () => {
      URL.revokeObjectURL(objectUniformResourceLocator);
      const canvasElement = document.createElement('canvas');
      let targetWidthPixels = htmlImageElement.width;
      let targetHeightPixels = htmlImageElement.height;

      if (targetWidthPixels > maximumWidthPixels) {
        targetHeightPixels = (maximumWidthPixels / targetWidthPixels) * targetHeightPixels;
        targetWidthPixels = maximumWidthPixels;
      }

      canvasElement.width = targetWidthPixels;
      canvasElement.height = targetHeightPixels;
      const canvasRenderingContext = canvasElement.getContext('2d');

      if (!canvasRenderingContext) return resolve(sourceImageFile);

      canvasRenderingContext.imageSmoothingEnabled = true;
      canvasRenderingContext.imageSmoothingQuality = 'high';
      canvasRenderingContext.drawImage(htmlImageElement, 0, 0, targetWidthPixels, targetHeightPixels);

      canvasElement.toBlob((resultBlob) => {
        resolve(resultBlob || sourceImageFile);
      }, 'image/webp', compressionQualityFactor);
    };

    htmlImageElement.onerror = () => {
      URL.revokeObjectURL(objectUniformResourceLocator);
      resolve(sourceImageFile);
    };
  });
}

/**
 * executeAsynchronousImageCompression:
 * Misión: Compresión asíncrona Just-In-Time para proteger el frame de renderizado.
 */
export async function executeAsynchronousImageCompression(
  sourceImageFile: File,
  maximumWidthPixels: number = 2048,
  compressionQualityFactor: number = 0.85
): Promise<Blob> {
  if (typeof window === 'undefined') return sourceImageFile;

  if (!window.Worker || !window.OffscreenCanvas) {
    nicepodLog("⚠️ [Compression] OffscreenCanvas no detectado. Utilizando Hilo Principal.");
    return executeCompressionOnMainThreadFallback(sourceImageFile, maximumWidthPixels, compressionQualityFactor);
  }

  return new Promise((resolve) => {
    try {
      const compressionWorkerInstance = new Worker(
        new URL('./workers/compression.worker.ts', import.meta.url),
        { type: 'module' }
      );

      compressionWorkerInstance.onmessage = (messageEvent: MessageEvent) => {
        if (messageEvent.data.success) {
          resolve(messageEvent.data.blob);
        } else {
          nicepodLog("⚠️ [Worker] Fallo en proceso secundario. Activando respaldo.", messageEvent.data.error, "warn");
          resolve(executeCompressionOnMainThreadFallback(sourceImageFile, maximumWidthPixels, compressionQualityFactor));
        }
        compressionWorkerInstance.terminate();
      };

      compressionWorkerInstance.onerror = (operationalException) => {
        nicepodLog("🔥 [Worker] Error crítico de ejecución.", operationalException.message, "error");
        resolve(executeCompressionOnMainThreadFallback(sourceImageFile, maximumWidthPixels, compressionQualityFactor));
        compressionWorkerInstance.terminate();
      };

      compressionWorkerInstance.postMessage({
        file: sourceImageFile,
        maxWidth: maximumWidthPixels,
        quality: compressionQualityFactor
      });

    } catch (operationalException) {
      nicepodLog("🔥 [Worker] Imposible instanciar bus de datos secundario.");
      resolve(executeCompressionOnMainThreadFallback(sourceImageFile, maximumWidthPixels, compressionQualityFactor));
    }
  });
}

/**
 * ---------------------------------------------------------------------------
 * VI. CAPA DE ALIAS SOBERANOS (LEGACY COMPATIBILITY BRIDGE)
 * ---------------------------------------------------------------------------
 * Misión: Proveer puntos de entrada para los 124 archivos que utilizan nomenclatura 
 * abreviada, permitiendo la compilación del sistema mientras se ejecuta la 
 * transición industrial a nombres descriptivos.
 * [ADVERTENCIA]: Estos alias se consideran 'DEPRECATED' bajo el Dogma V4.5.
 */
export { cleanTextForNeuralSpeechSynthesis as cleanTextForSpeech, concatenateClassNames as cn, executeAsynchronousImageCompression as compressNicePodImage, formatGeographicPointCoordinates as formatCoordinates, formatSecondsAsChronometer as formatTime, getHumanReadableDistanceLabel as getDistanceLabel, getSecureAssetWithAvailabilityFallback as getSafeAsset, getSharedAudioContext as getSharedAudioCtx, getSupabaseAssetUniformResourceLocator as getSupabaseAsset };
