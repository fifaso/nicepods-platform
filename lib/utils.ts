/**
 * ARCHIVO: lib/utils.ts
 * VERSIÓN: 9.0 (NicePod Utility Core - Absolute Nominal Integrity & Off-Main-Thread Shield)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * 
 * Misión: Centralizar las utilidades de telemetría industrial, soberanía de activos, 
 * ingeniería acústica y procesamiento de imágenes, garantizando la protección absoluta 
 * del hilo principal (Main Thread Isolation) y la transparencia nominal total.
 * [REFORMA V9.0]: Implementación exhaustiva de la Zero Abbreviations Policy (ZAP). 
 * Centralización del motor de resolución de activos. Purificación de utilidades 
 * geoespaciales y consolidación del pipeline de compresión Just-In-Time.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * ---------------------------------------------------------------------------
 * 0. PROTOCOLO SILENCE-GUARD INDUSTRIAL (INTERCEPCIÓN DE RUIDO)
 * ---------------------------------------------------------------------------
 * Misión: Erradicar advertencias no críticas de motores externos (Mapbox Standard) 
 * que saturan la telemetría de desarrollo y consumen ciclos de la terminal.
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
 * combineClassNames: 
 * Misión: Fusión inteligente de clases Tailwind CSS utilizando clsx y tailwind-merge.
 */
export function cn(...classNamesInputsCollection: ClassValue[]) {
  return twMerge(clsx(classNamesInputsCollection));
}

/**
 * dispatchIndustrialTelemetryLog: 
 * Misión: Sistema de telemetría de consola asíncrono para monitoreo pericial.
 * [MTI]: Los logs se difieren al final del event loop para no impactar en 
 * el presupuesto de 16ms del frame de renderizado.
 */
export function nicepodLog(
  messageText: string,
  intelligenceMetadata: unknown = null,
  severityLevel: 'info' | 'warn' | 'error' = 'info'
) {
  if (process.env.NODE_ENV !== 'production') {
    setTimeout(() => {
      const logIdentificationPrefix = `[NicePod-V4.2]`;
      const localTimestamp = new Date().toLocaleTimeString();

      const logStylesDictionary = {
        info: 'color: #8b5cf6; font-weight: 900; background: rgba(139, 92, 246, 0.1); padding: 2px 4px; border-radius: 4px;',
        warn: 'color: #f59e0b; font-weight: 900;',
        error: 'color: #ef4444; font-weight: 900; border: 1px solid #ef4444; padding: 2px;'
      };

      if (severityLevel === 'error') {
        console.error(`%c${logIdentificationPrefix} 🔥 [${localTimestamp}] ${messageText}`, logStylesDictionary.error, intelligenceMetadata ?? '');
      } else if (severityLevel === 'warn') {
        console.warn(`%c${logIdentificationPrefix} ⚠️ [${localTimestamp}] ${messageText}`, logStylesDictionary.warn, intelligenceMetadata ?? '');
      } else {
        console.log(`%c${logIdentificationPrefix} 📡 [${localTimestamp}] ${messageText}`, logStylesDictionary.info, intelligenceMetadata ?? '');
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
 * getSharedAudioContextInstance: 
 * Misión: Recuperar o inicializar el bus de audio global de la Workstation.
 */
export function getSharedAudioCtx() {
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
 * sanitizeTextForNeuralSynthesis: 
 * Misión: Limpieza exhaustiva de narrativa para una síntesis neuronal fluida.
 */
export function cleanTextForSpeech(rawNarrativeContent: string | null | undefined): string {
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
 * formatDurationAsChronometer: 
 * Misión: Transmuta segundos en formato cronométrico industrial (Minutos:Segundos).
 */
export function formatTime(totalSecondsMagnitude: number | undefined | null): string {
  if (totalSecondsMagnitude === undefined || totalSecondsMagnitude === null || !isFinite(totalSecondsMagnitude) || totalSecondsMagnitude < 0) {
    return "0:00";
  }
  const calculatedMinutes = Math.floor(totalSecondsMagnitude / 60);
  const calculatedSeconds = Math.floor(totalSecondsMagnitude % 60);
  return `${calculatedMinutes}:${calculatedSeconds.toString().padStart(2, "0")}`;
}

/**
 * ---------------------------------------------------------------------------
 * III. GOBERNANZA DE ACTIVOS (SUPABASE STORAGE PERSISTENCE)
 * ---------------------------------------------------------------------------
 */

const SUPABASE_STORAGE_PUBLIC_ROOT_UNIFORM_RESOURCE_LOCATOR = "https://arbojlknwilqcszuqope.supabase.co/storage/v1/object/public";

/**
 * resolveSupabaseStorageUniformResourceLocator:
 * Misión: Resolver la dirección física de un activo en el Almacenamiento del Metal.
 */
export function getSupabaseAsset(assetStoragePath: string | null | undefined): string | null {
  if (!assetStoragePath) return null;
  if (assetStoragePath.startsWith('http')) return assetStoragePath;

  const sanitizedAssetPath = assetStoragePath.startsWith('/') ? assetStoragePath.substring(1) : assetStoragePath;

  // Resolución por defecto hacia el cubo 'podcasts' si no se especifica jerarquía.
  if (!sanitizedAssetPath.includes('/')) {
    return `${SUPABASE_STORAGE_PUBLIC_ROOT_UNIFORM_RESOURCE_LOCATOR}/podcasts/${sanitizedAssetPath}`;
  }

  return `${SUPABASE_STORAGE_PUBLIC_ROOT_UNIFORM_RESOURCE_LOCATOR}/${sanitizedAssetPath}`;
}

/**
 * getSecureAssetWithAvailabilityFallback:
 * Misión: Garantizar una visualización válida mediante fallbacks de alta disponibilidad (CDN).
 */
export function getSafeAsset(
  assetStoragePath: string | null | undefined,
  assetCategoryType: 'avatar' | 'cover' | 'logo' = 'cover'
): string {
  const resolvedAssetUniformResourceLocator = getSupabaseAsset(assetStoragePath);

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
 * Misión: Representación técnica legible de un punto geodésico en el espacio.
 */
export function formatCoordinates(longitudeCoordinate: number, latitudeCoordinate: number): string {
  return `${latitudeCoordinate.toFixed(6)}°N, ${longitudeCoordinate.toFixed(6)}°E`;
}

/**
 * getHumanReadableDistanceLabel: 
 * Misión: Métrica de proximidad para el radar de la terminal (m o km).
 */
export function getDistanceLabel(distanceInMetersMagnitude: number): string {
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
 * Misión: Motor de respaldo atómico si el entorno no soporta Web Workers o OffscreenCanvas.
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
 * Misión: Director de orquesta de la compresión asíncrona Just-In-Time.
 * [PILAR 4]: Exilia la carga computacional pesada fuera del Hilo Principal.
 */
export async function compressNicePodImage(
  sourceImageFile: File,
  maximumWidthPixels: number = 2048,
  compressionQualityFactor: number = 0.85
): Promise<Blob> {
  if (typeof window === 'undefined') return sourceImageFile;

  // ESCUDO DE COMPATIBILIDAD TÁCTICA (Safari/iOS Legacy Check)
  if (!window.Worker || !window.OffscreenCanvas) {
    nicepodLog("⚠️ [Compression] OffscreenCanvas no detectado. Utilizando Hilo Principal.");
    return executeCompressionOnMainThreadFallback(sourceImageFile, maximumWidthPixels, compressionQualityFactor);
  }

  return new Promise((resolve) => {
    try {
      // Instanciación Segura del Trabajador (Web Worker) utilizando Path raíz.
      const compressionWorkerInstance = new Worker(
        new URL('./workers/compression.worker.ts', import.meta.url), 
        { type: 'module' }
      );

      compressionWorkerInstance.onmessage = (messageEvent: MessageEvent) => {
        if (messageEvent.data.success) {
          resolve(messageEvent.data.blob);
        } else {
          nicepodLog("⚠️ [Worker] Fallo en proceso secundario. Activando paracaídas principal.", messageEvent.data.error, "warn");
          resolve(executeCompressionOnMainThreadFallback(sourceImageFile, maximumWidthPixels, compressionQualityFactor));
        }
        // [HIGIENE DE HARDWARE]: Destrucción atómica para liberar memoria del proceso.
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
      nicepodLog("🔥 [Worker] Imposible instanciar bus de datos secundario. Activando respaldo.");
      resolve(executeCompressionOnMainThreadFallback(sourceImageFile, maximumWidthPixels, compressionQualityFactor));
    }
  });
}