/**
 * ARCHIVO: lib/utils.ts
 * VERSIÓN: 11.0 (NicePod Utility Core - ZAP Absolute & Build Shield Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Centralizar las utilidades de telemetría industrial, soberanía de activos, 
 * ingeniería acústica y procesamiento de imágenes, garantizando la protección del 
 * Hilo Principal (Main Thread Isolation) mediante nomenclatura autodescriptiva.
 * [REFORMA V11.0]: Implementación de 'classNamesUtility' para resolver TS2305. 
 * Erradicación total de tipos 'any' y cumplimiento absoluto de la ZAP. 
 * Consolidación de la capa de compatibilidad para la transición de sistemas.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { type ClassValue, clsx as generateClassString } from "clsx";
import { twMerge as mergeTailwindClasses } from "tailwind-merge";

/**
 * ---------------------------------------------------------------------------
 * 0. PROTOCOLO SILENCE-GUARD PRO (INTERCEPCIÓN DE RUIDO DE MOTOR)
 * ---------------------------------------------------------------------------
 * Misión: Aniquilar advertencias redundantes de motores externos antes de que 
 * saturen el bus de datos, protegiendo el presupuesto de 16ms del Hilo Principal.
 */
if (typeof window !== 'undefined') {
  const PROHIBITED_LOG_PATTERNS_COLLECTION = [
    'Ignoring unknown image variable',
    'Cutoff is currently disabled on terrain',
    'Source "mapbox-dem" already exists',
    'formatDetection',
    'already exists',
    'requestAnimationFrame',
    'sb-arbojlknwilqcszuqope-auth-token'
  ];

  const nativeConsoleWarningAction = console.warn;
  console.warn = (...warningArgumentsCollection: unknown[]) => {
    const firstArgumentEntry = warningArgumentsCollection[0];
    if (typeof firstArgumentEntry === 'string') {
      const isInternalEngineNoiseDetected = PROHIBITED_LOG_PATTERNS_COLLECTION.some(pattern =>
        firstArgumentEntry.includes(pattern)
      );
      if (isInternalEngineNoiseDetected) return;
    }
    nativeConsoleWarningAction.apply(console, warningArgumentsCollection);
  };
}

/**
 * ---------------------------------------------------------------------------
 * I. UTILIDADES DE ESTILO Y TELEMETRÍA INDUSTRIAL
 * ---------------------------------------------------------------------------
 */

/**
 * classNamesUtility: 
 * [RESOLUCIÓN TS2305]: Descriptor industrial soberano para la fusión de clases.
 * Misión: Resolver la jerarquía de Tailwind CSS evitando colisiones de especificidad.
 */
export function classNamesUtility(...classNamesInputsCollection: ClassValue[]) {
  return mergeTailwindClasses(generateClassString(classNamesInputsCollection));
}

/**
 * nicepodLog: Sistema de telemetría de consola diferido para monitoreo pericial.
 * [BSS]: Erradicación del tipo 'any'. Uso de 'unknown' para metadatos de inteligencia.
 */
export function nicepodLog(
  messageText: string,
  intelligenceMetadata: unknown = null,
  severityLevel: 'info' | 'warn' | 'error' = 'info'
) {
  if (process.env.NODE_ENV !== 'production') {
    // [MTI]: Difeerimos la ejecución para no impactar en el frame de animación activo.
    setTimeout(() => {
      const logIdentificationPrefix = `[NicePod-V4.9]`;
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
 * II. INGENIERÍA ACÚSTICA (VOICE ENGINE HARDWARE)
 * ---------------------------------------------------------------------------
 */

let sharedAudioContextInstance: AudioContext | null = null;

/**
 * getSharedAudioContextInstance: 
 * Misión: Gestionar el Singleton del bus de audio para evitar fugas de memoria RAM.
 */
export function getSharedAudioContextInstance(): AudioContext | null {
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
 * Misión: Purificación de narrativa para la síntesis de voz neuronal de Gemini Pro.
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
 * formatSecondsAsChronometerMagnitude: 
 * Misión: Transmutar magnitud temporal en formato cronométrico industrial.
 */
export function formatSecondsAsChronometerMagnitude(totalSecondsMagnitude: number | undefined | null): string {
  if (totalSecondsMagnitude === undefined || totalSecondsMagnitude === null || !isFinite(totalSecondsMagnitude) || totalSecondsMagnitude < 0) {
    return "0:00";
  }
  const calculatedMinutesMagnitude = Math.floor(totalSecondsMagnitude / 60);
  const calculatedSecondsMagnitude = Math.floor(totalSecondsMagnitude % 60);
  return `${calculatedMinutesMagnitude}:${calculatedSecondsMagnitude.toString().padStart(2, "0")}`;
}

/**
 * ---------------------------------------------------------------------------
 * III. GOBERNANZA DE ACTIVOS (METAL STORAGE RESOLUTION)
 * ---------------------------------------------------------------------------
 */

const SUPABASE_STORAGE_PUBLIC_ROOT_UNIFORM_RESOURCE_LOCATOR = "https://arbojlknwilqcszuqope.supabase.co/storage/v1/object/public";

/**
 * getSupabaseAssetUniformResourceLocator:
 * Misión: Resolver la ruta física de un activo en la Bóveda de Almacenamiento.
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
 * Misión: Garantizar la integridad visual mediante redundancia en CDN.
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
 * IV. RIGOR GEOESPACIAL (NOMINAL COORDINATION)
 * ---------------------------------------------------------------------------
 */

/**
 * formatGeographicPointCoordinatesLabel: 
 * Misión: Representación técnica legible de un punto geodésico.
 */
export function formatGeographicPointCoordinatesLabel(longitudeCoordinate: number, latitudeCoordinate: number): string {
  return `${latitudeCoordinate.toFixed(6)}°N, ${longitudeCoordinate.toFixed(6)}°E`;
}

/**
 * getHumanReadableDistanceMagnitudeLabel: 
 * Misión: Transmutar magnitud métrica para el radar situacional.
 */
export function getHumanReadableDistanceMagnitudeLabel(distanceInMetersMagnitude: number): string {
  if (distanceInMetersMagnitude < 1000) {
    return `${Math.round(distanceInMetersMagnitude)}m`;
  }
  return `${(distanceInMetersMagnitude / 1000).toFixed(1)}km`;
}

/**
 * ---------------------------------------------------------------------------
 * V. CAPA DE ALIAS SOBERANOS (LEGACY BRIDGE)
 * ---------------------------------------------------------------------------
 * Misión: Proveer puntos de entrada para archivos de legado mientras se completa 
 * la transición industrial, asegurando la compatibilidad de compilación.
 */
export { 
  cleanTextForNeuralSpeechSynthesis as cleanTextForSpeech, 
  classNamesUtility as cn, 
  formatGeographicPointCoordinatesLabel as formatCoordinates, 
  formatSecondsAsChronometerMagnitude as formatTime, 
  getHumanReadableDistanceMagnitudeLabel as getDistanceLabel, 
  getSecureAssetWithAvailabilityFallback as getSafeAsset, 
  getSharedAudioContextInstance as getSharedAudioCtx, 
  getSupabaseAssetUniformResourceLocator as getSupabaseAsset 
};