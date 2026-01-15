// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Mezcla de clases Tailwind con soporte para variables condicionales.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea segundos a formato MM:SS
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00"
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

/**
 * PROTECCIÓN DE ASSETS: Garantiza que nunca se intente cargar un recurso inexistente.
 * Resuelve el error 404 placeholder-logo.svg
 */
export function getSafeAsset(path: string | null | undefined, type: 'avatar' | 'cover' | 'logo' = 'cover'): string {
  // Si el path es válido y no es el placeholder roto, lo devolvemos
  if (path && path.trim() !== "" && !path.includes('placeholder.svg')) {
    return path;
  }

  // Fallbacks estratégicos por tipo
  const fallbacks = {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NicePod",
    cover: "https://arbojlknwilqcszuqope.supabase.co/storage/v1/object/public/podcasts/system/default-cover.jpg",
    logo: "/nicepod-logo.png"
  };

  return fallbacks[type];
}

/**
 * SINGLETON AUDIO CONTEXT: Evita el error de "Too many AudioContexts".
 */
let sharedAudioCtx: AudioContext | null = null;
export function getSharedAudioCtx() {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return sharedAudioCtx;
}