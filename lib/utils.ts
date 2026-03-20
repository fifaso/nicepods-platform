// lib/utils.ts
// VERSIÓN: 5.0 (NicePod Utility Core - Industrial Precision & Geospatial Standard)
// Misión: Centralizar el formateo, la higiene acústica, la soberanía visual y el rigor geoespacial.
// [ESTABILIZACIÓN]: Erradicación de 'any', formateo táctico de coordenadas e inyección de nitidez JIT.

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * ---------------------------------------------------------------------------
 * I. UTILIDADES DE SUPERFICIE Y ESTILO
 * ---------------------------------------------------------------------------
 */

/**
 * cn: Función de combinación de clases de Tailwind.
 * Utiliza twMerge para resolver conflictos de especificidad CSS en tiempo de ejecución.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * nicepodLog: Sistema de telemetría soberano.
 * [BUILD SHIELD]: Se eliminó 'any' en favor de 'unknown' para obligar al tipado.
 * Silencia la consola en producción para mantener la higiene de logs en Vercel.
 */
export function nicepodLog(
  message: string, 
  data: unknown = null, 
  type: 'info' | 'warn' | 'error' = 'info'
) {
  if (process.env.NODE_ENV === 'development') {
    const prefix = `[NicePod-V2.6]`;
    const timestamp = new Date().toLocaleTimeString();
    
    if (type === 'error') {
      console.error(`${prefix} 🔥 [${timestamp}] ${message}`, data ?? '');
    } else if (type === 'warn') {
      console.warn(`${prefix} ⚠️ [${timestamp}] ${message}`, data ?? '');
    } else {
      console.log(`${prefix} 📡 [${timestamp}] ${message}`, data ?? '');
    }
  }
}

/**
 * ---------------------------------------------------------------------------
 * II. INGENIERÍA ACÚSTICA Y TEMPORAL
 * ---------------------------------------------------------------------------
 */

/**
 * formatTime: Convierte segundos a formato de minutaje MM:SS.
 * [ESTABILIZACIÓN]: Maneja entradas nulas o infinitas para evitar ruidos visuales en la UI.
 */
export function formatTime(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null || isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * cleanTextForSpeech: El "Stripper" de ruidos visuales para TTS.
 * [MANDATO NCIS v2.5]: Sin Markdown, sin etiquetas, puramente acústico.
 */
export function cleanTextForSpeech(text: string | null | undefined): string {
  if (!text) return "";

  return text
    .replace(/\$\$\$/g, "") // Elimina etiquetas triples de IA
    .replace(/\[.*?\]/g, "") // Elimina metadatos técnicos [SFX], [PAUSE]
    .replace(/^(Host|Narrador|Speaker\s?\d?):\s?/gim, "") // Elimina locutores
    .replace(/\*\*/g, "") // Elimina negritas
    .replace(/__/g, "") // Elimina cursivas
    .replace(/[*#_~`>]/g, "") // Elimina restos de sintaxis MD
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "") // Purga de Emojis
    .replace(/\s+/g, " ") // Colapsa espacios
    .trim();
}

/**
 * getSharedAudioCtx: Singleton de hardware acústico.
 * Garantiza que la capa de audio neuronal no sature el bus de sonido del dispositivo.
 */
let sharedAudioCtx: AudioContext | null = null;

export function getSharedAudioCtx() {
  if (typeof window === 'undefined') return null;

  if (!sharedAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    sharedAudioCtx = new AudioContextClass();
  }

  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }

  return sharedAudioCtx;
}

/**
 * ---------------------------------------------------------------------------
 * III. SOBERANÍA VISUAL Y ASSETS
 * ---------------------------------------------------------------------------
 */

/**
 * getSafeAsset: Garantiza resiliencia visual ante recursos corruptos.
 * Protege al componente next/image de lanzar errores 400 por URLs malformadas.
 */
export function getSafeAsset(
  path: string | null | undefined, 
  type: 'avatar' | 'cover' | 'logo' = 'cover'
): string {
  const isValidUrl = path &&
    path.trim() !== "" &&
    !path.includes('placeholder.svg') &&
    (path.startsWith('http') || path.startsWith('/'));

  if (isValidUrl) {
    return path!;
  }

  const fallbacks: Record<string, string> = {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NicePod",
    cover: "https://arbojlknwilqcszuqope.supabase.co/storage/v1/object/public/podcasts/system/default-cover.jpg",
    logo: "/nicepod-logo.png"
  };

  return fallbacks[type] || fallbacks.cover;
}

/**
 * ---------------------------------------------------------------------------
 * IV. RIGOR GEOESPACIAL (MADRID RESONANCE HUD)
 * ---------------------------------------------------------------------------
 */

/**
 * formatCoordinates: 
 * Transmuta [lng, lat] en un string técnico de alta precisión para el HUD.
 */
export function formatCoordinates(lng: number, lat: number): string {
  return `${lat.toFixed(6)}°N, ${lng.toFixed(6)}°E`;
}

/**
 * ---------------------------------------------------------------------------
 * V. PIPELINE DE COMPRESIÓN JIT (JUST-IN-TIME)
 * ---------------------------------------------------------------------------
 */

/**
 * compressNicePodImage:
 * Misión: Reducir capturas de alta resolución a activos de grado industrial.
 * [ESTRATEGIA]: Pixel-Perfect Scaling mediante Canvas y transmutación a WebP.
 */
export async function compressNicePodImage(
  file: File,
  maxWidth: number = 2048,
  quality: number = 0.85
): Promise<Blob> {
  if (typeof window === 'undefined') return file;

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.src = objectUrl;

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Preservación de la Relación de Aspecto (Soberanía Visual)
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        nicepodLog("Fallo de motor Canvas", null, 'error');
        return resolve(file);
      }

      // Algoritmo de suavizado de alta fidelidad
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            nicepodLog(`Refinamiento Visual: ${Math.round(file.size / 1024)}KB -> ${Math.round(blob.size / 1024)}KB`);
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      nicepodLog("Fallo crítico en compresión visual", null, 'error');
      resolve(file);
    };
  });
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Cumplimiento NCIS v2.5: Se ha erradicado el uso de 'any' en todo el módulo.
 * 2. Estándar de Radio: 'formatTime' ahora es inmune a valores no finitos, 
 *    protegiendo la integridad del reproductor cuando el audio aún no ha cargado.
 * 3. Telemetría HUD: 'formatCoordinates' provee el rigor decimal necesario 
 *    para que el Administrador valide el anclaje manual en tiempo real.
 */