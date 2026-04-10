/**
 * ARCHIVO: lib/utils.ts
 * VERSIÓN: 8.0 (NicePod Utility Core - Absolute Nominal Integrity & Off-Main-Thread Shield)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * 
 * Misión: Centralizar utilidades de telemetría, soberanía de activos, ingeniería 
 * acústica y procesamiento de imágenes, garantizando la protección absoluta 
 * del hilo principal (Main Thread Isolation) y la transparencia nominal.
 * [REFORMA V8.0]: Implementación integral de la Zero Abbreviations Policy (ZAP). 
 * Centralización de la infraestructura de almacenamiento (Storage Root). 
 * Purificación de utilidades geoespaciales y consolidación del pipeline de 
 * compresión Just-In-Time mediante Web Workers.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * ---------------------------------------------------------------------------
 * 0. PROTOCOLO SILENCE-GUARD INDUSTRIAL (INTERCEPCIÓN DE RUIDO)
 * ---------------------------------------------------------------------------
 * Misión: Erradicar advertencias no críticas de motores externos (Mapbox) 
 * que saturan la telemetría de desarrollo y consumen ciclos de consola.
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
 * I. UTILIDADES DE ESTILO Y TELEMETRÍA
 * ---------------------------------------------------------------------------
 */

/**
 * cn: Fusión inteligente de clases Tailwind CSS.
 */
export function cn(...classInputsCollection: ClassValue[]) {
  return twMerge(clsx(classInputsCollection));
}

/**
 * nicepodLog: Sistema de telemetría de consola asíncrono.
 * [MTI]: Los logs se difieren para no impactar en el frame de renderizado de la GPU.
 */
export function nicepodLog(
  messageText: string,
  intelligenceMetadata: unknown = null,
  severityLevel: 'info' | 'warn' | 'error' = 'info'
) {
  if (process.env.NODE_ENV !== 'production') {
    setTimeout(() => {
      const logPrefix = `[NicePod-V4.2]`;
      const localTimestamp = new Date().toLocaleTimeString();

      const logStylesDictionary = {
        info: 'color: #8b5cf6; font-weight: 900; background: rgba(139, 92, 246, 0.1); padding: 2px 4px; border-radius: 4px;',
        warn: 'color: #f59e0b; font-weight: 900;',
        error: 'color: #ef4444; font-weight: 900; border: 1px solid #ef4444; padding: 2px;'
      };

      if (severityLevel === 'error') {
        console.error(`%c${logPrefix} 🔥 [${localTimestamp}] ${messageText}`, logStylesDictionary.error, intelligenceMetadata ?? '');
      } else if (severityLevel === 'warn') {
        console.warn(`%c${logPrefix} ⚠️ [${localTimestamp}] ${messageText}`, logStylesDictionary.warn, intelligenceMetadata ?? '');
      } else {
        console.log(`%c${logPrefix} 📡 [${localTimestamp}] ${messageText}`, logStylesDictionary.info, intelligenceMetadata ?? '');
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
 * getSharedAudioContextInstance: Recupera o inicializa el bus de audio global.
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
 * cleanTextForSpeech: Saneamiento de narrativa para síntesis neuronal.
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
 * formatTimeDuration: Transmuta segundos en formato cronométrico industrial (MM:SS).
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
 * III. GOBERNANZA DE ACTIVOS (SUPABASE STORAGE)
 * ---------------------------------------------------------------------------
 */

const SUPABASE_STORAGE_PUBLIC_ROOT_URL = "https://arbojlknwilqcszuqope.supabase.co/storage/v1/object/public";

/**
 * getSupabaseAssetUniformResourceLocator:
 * Misión: Resolver la ruta física de un activo en el Almacenamiento del Metal.
 */
export function getSupabaseAsset(assetStoragePath: string | null | undefined): string | null {
  if (!assetStoragePath) return null;
  if (assetStoragePath.startsWith('http')) return assetStoragePath;

  const sanitizedPath = assetStoragePath.startsWith('/') ? assetStoragePath.substring(1) : assetStoragePath;

  // Si el path no incluye el bucket, asumimos el bucket 'podcasts' por defecto.
  if (!sanitizedPath.includes('/')) {
    return `${SUPABASE_STORAGE_PUBLIC_ROOT_URL}/podcasts/${sanitizedPath}`;
  }

  return `${SUPABASE_STORAGE_PUBLIC_ROOT_URL}/${sanitizedPath}`;
}

/**
 * getSafeAssetUniformResourceLocator:
 * Misión: Garantizar una visualización válida mediante fallbacks de alta disponibilidad.
 */
export function getSafeAsset(
  assetStoragePath: string | null | undefined,
  assetCategoryType: 'avatar' | 'cover' | 'logo' = 'cover'
): string {
  const resolvedAssetUrl = getSupabaseAsset(assetStoragePath);

  const isResolutionValid = resolvedAssetUrl &&
    resolvedAssetUrl.trim() !== "" &&
    resolvedAssetUrl.indexOf('placeholder') === -1;

  if (isResolutionValid) return resolvedAssetUrl as string;

  const contentDeliveryNetworkFallbacksDictionary = {
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=NicePodCurator",
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
    logo: "/nicepod-logo.png"
  };

  return contentDeliveryNetworkFallbacksDictionary[assetCategoryType] || contentDeliveryNetworkFallbacksDictionary.cover;
}

/**
 * ---------------------------------------------------------------------------
 * IV. RIGOR GEOESPACIAL (NOMINAL SYNC)
 * ---------------------------------------------------------------------------
 */

/**
 * formatGeographicCoordinates: Representación técnica de un punto geodésico.
 */
export function formatCoordinates(longitudeCoordinate: number, latitudeCoordinate: number): string {
  return `${latitudeCoordinate.toFixed(6)}°N, ${longitudeCoordinate.toFixed(6)}°E`;
}

/**
 * getDistanceLabel: Métrica de proximidad para el radar de la terminal.
 */
export function getDistanceLabel(distanceInMeters: number): string {
  if (distanceInMeters < 1000) return `${Math.round(distanceInMeters)}m`;
  return `${(distanceInMeters / 1000).toFixed(1)}km`;
}

/**
 * ---------------------------------------------------------------------------
 * V. PIPELINE DE COMPRESIÓN IMAGEN JIT (HYBRID SHIELD)
 * ---------------------------------------------------------------------------
 */

/**
 * compressOnMainThread: 
 * El motor de respaldo atómico si el entorno de ejecución es hostil a Web Workers.
 */
async function compressOnMainThread(
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
      let targetWidth = htmlImageElement.width;
      let targetHeight = htmlImageElement.height;

      if (targetWidth > maximumWidthPixels) {
        targetHeight = (maximumWidthPixels / targetWidth) * targetHeight;
        targetWidth = maximumWidthPixels;
      }

      canvasElement.width = targetWidth;
      canvasElement.height = targetHeight;
      const canvasRenderingContext = canvasElement.getContext('2d');
      
      if (!canvasRenderingContext) return resolve(sourceImageFile);

      canvasRenderingContext.imageSmoothingEnabled = true;
      canvasRenderingContext.imageSmoothingQuality = 'high';
      canvasRenderingContext.drawImage(htmlImageElement, 0, 0, targetWidth, targetHeight);

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
 * compressNicePodImage:
 * Director de orquesta de la compresión asíncrona.
 * [PILAR 4]: Desvía la carga computacional fuera del Hilo Principal.
 */
export async function compressNicePodImage(
  sourceImageFile: File,
  maximumWidthPixels: number = 2048,
  compressionQualityFactor: number = 0.85
): Promise<Blob> {
  if (typeof window === 'undefined') return sourceImageFile;

  // ESCUDO DE COMPATIBILIDAD (Fallback Táctico para Safari/iOS Legacy)
  if (!window.Worker || !window.OffscreenCanvas) {
    nicepodLog("⚠️ [Compression] OffscreenCanvas no soportado. Delegando al Main Thread.", null, "warn");
    return compressOnMainThread(sourceImageFile, maximumWidthPixels, compressionQualityFactor);
  }

  return new Promise((resolve) => {
    try {
      // Instanciación Segura del Trabajador (Web Worker)
      const compressionWorkerInstance = new Worker(
        new URL('./workers/compression.worker.ts', import.meta.url), 
        { type: 'module' }
      );

      compressionWorkerInstance.onmessage = (messageEvent: MessageEvent) => {
        if (messageEvent.data.success) {
          resolve(messageEvent.data.blob);
        } else {
          nicepodLog("⚠️ [Worker] Fallo interno en hilo secundario. Activando paracaídas.", messageEvent.data.error, "warn");
          resolve(compressOnMainThread(sourceImageFile, maximumWidthPixels, compressionQualityFactor));
        }
        // [HIGIENE DE HARDWARE]: Destrucción atómica del hilo tras la misión.
        compressionWorkerInstance.terminate();
      };

      compressionWorkerInstance.onerror = (operationalException) => {
        nicepodLog("🔥 [Worker] Error crítico de ejecución. Activando paracaídas.", operationalException.message, "error");
        resolve(compressOnMainThread(sourceImageFile, maximumWidthPixels, compressionQualityFactor));
        compressionWorkerInstance.terminate();
      };

      compressionWorkerInstance.postMessage({ 
        file: sourceImageFile, 
        maxWidth: maximumWidthPixels, 
        quality: compressionQualityFactor 
      });

    } catch (operationalException) {
      nicepodLog("🔥 [Worker] Imposible instanciar hilo secundario. Activando paracaídas.", null, "error");
      resolve(compressOnMainThread(sourceImageFile, maximumWidthPixels, compressionQualityFactor));
    }
  });
}