// lib/utils.ts
// VERSIÓN: 3.0 (NicePod Utility Core - Resilient Data & Asset Standard)
// Misión: Centralizar el formateo, la higiene acústica y la sanitización de activos.
// [ESTABILIZACIÓN]: Implementación de lógica de fallback robusta y prevención de errores de red (400 Bad Request).

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
 * getSafeAsset: Garantiza resiliencia visual ante recursos inexistentes.
 * [CORRECCIÓN CRÍTICA]: Evita el error '400 Bad Request' de Next.js Image al validar URLs mal formadas.
 */
export function getSafeAsset(path: string | null | undefined, type: 'avatar' | 'cover' | 'logo' = 'cover'): string {
  // Validación estricta: Solo devolvemos la ruta si empieza por http (CDN externo) o / (interno)
  // y si no está vacía.
  const isValidUrl = path &&
    path.trim() !== "" &&
    !path.includes('placeholder.svg') &&
    (path.startsWith('http') || path.startsWith('/'));

  if (isValidUrl) {
    return path!;
  }

  // Fallbacks estratégicos de alta autoridad
  const fallbacks: Record<string, string> = {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NicePod",
    cover: "https://arbojlknwilqcszuqope.supabase.co/storage/v1/object/public/podcasts/system/default-cover.jpg",
    logo: "/nicepod-logo.png"
  };

  return fallbacks[type] || fallbacks.cover;
}

/**
 * getSharedAudioCtx: Singleton para evitar el error "Too many AudioContexts".
 * [ESTABILIZACIÓN]: Garantiza que la capa de audio neuronal no sature el navegador.
 */
let sharedAudioCtx: AudioContext | null = null;

export function getSharedAudioCtx() {
  if (typeof window === 'undefined') return null;

  if (!sharedAudioCtx) {
    // Soporte para navegadores modernos y legado WebKit
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    sharedAudioCtx = new AudioContextClass();
  }

  // Resumen de estado para evitar bloqueos
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }

  return sharedAudioCtx;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Sanitización de Imagen (getSafeAsset): La validación 'startsWith("http") || startsWith("/")' 
 *    es la solución definitiva para evitar que Next.js Image intente procesar 
 *    URLs vacías o mal formadas de la base de datos que causaban los errores 400.
 * 2. Gestión de AudioContext: Se ha añadido el 'resume()' automático para cumplir 
 *    con las políticas de autoplay de los navegadores modernos, evitando que 
 *    el motor neuronal se bloquee en dispositivos móviles.
 * 3. Integridad de Tipos: Se ha reforzado la firma de 'formatTime' para manejar 
 *    nulos de forma elegante, lo que evita errores en el renderizado de la UI cuando 
 *    los metadatos de duración están pendientes de sincronización.
 */