// lib/utils.ts
// VERSIÓN: 4.0 (NicePod Utility Core - Vision Compression & Asset Integrity Edition)
// Misión: Centralizar el formateo, la higiene acústica y el procesamiento visual JIT.
// [ESTABILIZACIÓN]: Inyección de compressNicePodImage para neutralizar errores 413.

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * ---------------------------------------------------------------------------
 * I. UTILIDADES DE SUPERFICIE Y ESTILO
 * ---------------------------------------------------------------------------
 */

/**
 * cn: Función de combinación de clases de Tailwind.
 * Utiliza twMerge para resolver conflictos de especificidad CSS en tiempo de compilación.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * nicepodLog: Sistema de telemetría de desarrollo.
 * [ESTABILIZACIÓN]: Silencia la consola en producción para mantener la integridad de los logs en Vercel.
 */
export function nicepodLog(message: string, data?: any, type: 'info' | 'warn' | 'error' = 'info') {
  if (process.env.NODE_ENV === 'development') {
    const prefix = `[NicePod-Core]`;
    if (type === 'error') console.error(prefix, message, data ?? '');
    else if (type === 'warn') console.warn(prefix, message, data ?? '');
    else console.log(prefix, message, data ?? '');
  }
}

/**
 * ---------------------------------------------------------------------------
 * II. INGENIERÍA ACÚSTICA Y TEMPORAL
 * ---------------------------------------------------------------------------
 */

/**
 * formatTime: Convierte segundos a formato de minutaje MM:SS.
 * [ESTABILIZACIÓN]: Maneja entradas nulas o negativas para evitar visualización errónea en la UI.
 */
export function formatTime(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null || isNaN(seconds) || seconds < 0) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * cleanTextForSpeech: El "Stripper" de ruidos visuales.
 * Sanitiza el texto de Markdown, emojis y etiquetas para la API de Gemini TTS.
 */
export function cleanTextForSpeech(text: string | null | undefined): string {
  if (!text) return "";

  return text
    .replace(/\[.*?\]/g, "") // Elimina etiquetas técnicas como [SFX] o [MUSIC]
    .replace(/^(Host|Narrador|Speaker\s?\d?):\s?/gim, "") // Elimina etiquetas de locutor
    .replace(/\*\*/g, "") // Elimina negritas de Markdown
    .replace(/__/g, "") // Elimina cursivas de Markdown
    .replace(/[*#_~`>]/g, "") // Elimina restos de Markdown (títulos, citas, etc)
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "") // Elimina Emojis
    .replace(/\s+/g, " ") // Normaliza espacios múltiples
    .trim();
}

/**
 * getSharedAudioCtx: Singleton para evitar el error "Too many AudioContexts".
 * [ESTABILIZACIÓN]: Garantiza que la capa de audio neuronal no sature el navegador.
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
 * III. GESTIÓN DE ASSETS Y SOBERANÍA VISUAL
 * ---------------------------------------------------------------------------
 */

/**
 * getSafeAsset: Garantiza resiliencia visual ante recursos inexistentes.
 * [CORRECCIÓN CRÍTICA]: Evita el error '400 Bad Request' de Next.js Image al validar URLs mal formadas.
 */
export function getSafeAsset(path: string | null | undefined, type: 'avatar' | 'cover' | 'logo' = 'cover'): string {
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
 * IV. PIPELINE DE COMPRESIÓN JIT (JUST-IN-TIME)
 * ---------------------------------------------------------------------------
 */

/**
 * compressNicePodImage:
 * Misión: Reducir capturas de alta resolución a activos industriales optimizados.
 * 
 * [ESTRATEGIA TÁCTICA]:
 * 1. Usa HTML5 Canvas para redimensionamiento por hardware.
 * 2. Transmuta cualquier formato a WebP (Calidad 0.8).
 * 3. Techo Resolutivo: 2048px (Equilibrio perfecto entre OCR y Ancho de Banda).
 * 4. Higiene de Memoria: Limpieza inmediata de punteros Blob.
 */
export async function compressNicePodImage(
  file: File,
  maxWidth: number = 2048,
  quality: number = 0.8
): Promise<Blob> {
  // Guardia de SSR: El canvas solo existe en el cliente.
  if (typeof window === 'undefined') return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.src = objectUrl;

    img.onload = () => {
      // Liberamos el puntero original inmediatamente para recuperar RAM.
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Cálculo de Proporciones Tácticas (Aspect Ratio Preservation)
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        nicepodLog("Fallo de Contexto Canvas", null, 'error');
        return resolve(file); // Fallback al archivo original si el hardware falla
      }

      // Renderizado de alta fidelidad
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Transmutación a binario optimizado
      canvas.toBlob(
        (blob) => {
          if (blob) {
            nicepodLog(`Compresión Exitosa: ${Math.round(file.size / 1024)}KB -> ${Math.round(blob.size / 1024)}KB`);
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = (error) => {
      URL.revokeObjectURL(objectUrl);
      nicepodLog("Error en el motor de compresión visual", error, 'error');
      resolve(file); // Resiliencia: Si falla, enviamos el original.
    };
  });
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Aniquilación del Error 413: 'compressNicePodImage' es la pieza final que permite
 *    que dossiers de 20MB viajen como paquetes de 1.5MB hacia Vercel.
 * 2. Higiene de Memoria JIT: El uso sistemático de 'URL.revokeObjectURL' asegura
 *    que los dispositivos móviles no sufran crashes de RAM durante la captura.
 * 3. Fallback Resiliente: Si el navegador del usuario no soporta Canvas o WebP, 
 *    el sistema devuelve el archivo original silenciosamente, priorizando la 
 *    captura de la memoria urbana sobre la optimización.
 */