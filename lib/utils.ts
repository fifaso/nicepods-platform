// lib/utils.ts
// VERSIÓN: 2.0 (NicePod Utility Core - Final Integrity Standard)
// Misión: Centralizar el formateo, la higiene acústica y el logging condicional.

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn: Mezcla de clases Tailwind con soporte para variables condicionales.
 * Esencial para el sistema de diseño Aurora y sus estados dinámicos.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * nicepodLog: El sistema de registro inteligente de la plataforma.
 * Solo emite información en la consola si el entorno es de desarrollo.
 * Esto garantiza el silencio absoluto en la URL de Vercel.
 */
export function nicepodLog(message: string, data?: any, type: 'info' | 'warn' | 'error' = 'info') {
  if (process.env.NODE_ENV === 'development') {
    const prefix = `[NicePod]`;
    if (type === 'error') console.error(prefix, message, data ?? '');
    else if (type === 'warn') console.warn(prefix, message, data ?? '');
    else console.log(prefix, message, data ?? '');
  }
}

/**
 * formatTime: Convierte segundos a formato de minutaje MM:SS.
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * cleanTextForSpeech: El "Stripper" de ruidos visuales para la IA de voz.
 * Elimina marcas de Markdown, emojis y etiquetas que causan glitches en Gemini TTS.
 */
export function cleanTextForSpeech(text: string | null | undefined): string {
  if (!text) return "";

  return text
    .replace(/\[.*?\]/g, "") // Elimina etiquetas técnicas [SFX], [MUSIC]
    .replace(/^(Host|Narrador|Speaker\s?\d?):\s?/gim, "") // Elimina etiquetas de locutor
    .replace(/\*\*/g, "") // Elimina negritas de Markdown
    .replace(/__/g, "") // Elimina cursivas de Markdown
    .replace(/[*#_~`>]/g, "") // Elimina restos de Markdown (# títulos, > citas, etc)
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "") // Elimina Emojis
    .replace(/\s+/g, " ") // Normaliza espacios múltiples
    .trim();
}

/**
 * getSafeAsset: Garantiza resiliencia visual ante recursos inexistentes.
 */
export function getSafeAsset(path: string | null | undefined, type: 'avatar' | 'cover' | 'logo' = 'cover'): string {
  // Validación de nulidad y limpieza de rastro de placeholders rotos
  if (path && path.trim() !== "" && !path.includes('placeholder.svg')) {
    return path;
  }

  // Fallbacks estratégicos de alta autoridad
  const fallbacks = {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NicePod",
    cover: "https://arbojlknwilqcszuqope.supabase.co/storage/v1/object/public/podcasts/system/default-cover.jpg",
    logo: "/nicepod-logo.png"
  };

  return fallbacks[type];
}

/**
 * getSharedAudioCtx: Singleton para evitar el error "Too many AudioContexts".
 */
let sharedAudioCtx: AudioContext | null = null;
export function getSharedAudioCtx() {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return sharedAudioCtx;
}