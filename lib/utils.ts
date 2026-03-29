/**
 * ARCHIVO: lib/utils.ts
 * VERSIÓN: 6.2 (NicePod Utility Core - Sovereign Security Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Centralizar el formateo, la soberanía de assets y la seguridad de red.
 * [PURGA DE SEGURIDAD]: Eliminación de toda referencia a repositorios no auditados.
 * Nivel de Integridad: 100% (Soberanía Total / Producción-Ready)
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * ---------------------------------------------------------------------------
 * I. UTILIDADES DE ESTILO (TAILWIND MERGE)
 * ---------------------------------------------------------------------------
 */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * nicepodLog: Telemetría de consola con identidad visual NicePod.
 */
export function nicepodLog(
  message: string, 
  data: unknown = null, 
  type: 'info' | 'warn' | 'error' = 'info'
) {
  if (process.env.NODE_ENV === 'development') {
    const prefix = `[NicePod-Sovereign]`;
    const timestamp = new Date().toLocaleTimeString();
    const styles = {
      info: 'color: #8b5cf6; font-weight: bold;',
      warn: 'color: #f59e0b; font-weight: bold;',
      error: 'color: #ef4444; font-weight: bold;'
    };
    
    if (type === 'error') {
      console.error(`%c${prefix} 🔥 [${timestamp}] ${message}`, styles.error, data ?? '');
    } else if (type === 'warn') {
      console.warn(`%c${prefix} ⚠️ [${timestamp}] ${message}`, styles.warn, data ?? '');
    } else {
      console.log(`%c${prefix} 📡 [${timestamp}] ${message}`, styles.info, data ?? '');
    }
  }
}

/**
 * ---------------------------------------------------------------------------
 * II. INGENIERÍA ACÚSTICA (VOICE ENGINE SUPPORT)
 * ---------------------------------------------------------------------------
 */

let sharedAudioCtx: AudioContext | null = null;

/**
 * getSharedAudioCtx: Garantiza el acceso al silicio de audio sin colisiones.
 * Indispensable para components/ui/voice-input.tsx.
 */
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
 * cleanTextForSpeech: Limpieza de ruidos visuales para TTS.
 */
export function cleanTextForSpeech(text: string | null | undefined): string {
  if (!text) return "";
  return text
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
 * formatTime: MM:SS industrial format.
 */
export function formatTime(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null || !isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * ---------------------------------------------------------------------------
 * III. GOBERNANZA DE ASSETS (SUPABASE SOBERANO)
 * ---------------------------------------------------------------------------
 */

/**
 * getSupabaseAsset: Resuelve URLs del Metal de Supabase.
 */
export function getSupabaseAsset(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  // URL ÚNICA DE NUESTRA INFRAESTRUCTURA (Madrid Resonance Cloud)
  const STORAGE_BASE = "https://arbojlknwilqcszuqope.supabase.co/storage/v1/object/public";
  
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Por defecto, redirigimos al bucket de podcasts si no hay contexto
  if (!cleanPath.includes('/')) {
    return `${STORAGE_BASE}/podcasts/${cleanPath}`;
  }
  
  return `${STORAGE_BASE}/${cleanPath}`;
}

/**
 * getSafeAsset: Blindaje visual contra recursos nulos o corruptos.
 * [ACTUALIZACIÓN V6.2]: Se eliminan todos los placeholders de terceros sospechosos.
 */
export function getSafeAsset(
  path: string | null | undefined, 
  type: 'avatar' | 'cover' | 'logo' = 'cover'
): string {
  const resolvedPath = getSupabaseAsset(path);
  
  if (resolvedPath && resolvedPath.trim() !== "" && !resolvedPath.includes('placeholder')) {
    return resolvedPath;
  }

  // Fallbacks verificados y auditados (CDNs corporativos masivos)
  const fallbacks = {
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=NicePod", // Bottts para look industrial
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop", // Espacio profundo
    logo: "/nicepod-logo.png" // Asset local soberano
  };

  return fallbacks[type] || fallbacks.cover;
}

/**
 * ---------------------------------------------------------------------------
 * IV. RIGOR GEOESPACIAL (HUD)
 * ---------------------------------------------------------------------------
 */

export function formatCoordinates(lng: number, lat: number): string {
  return `${lat.toFixed(6)}°N, ${lng.toFixed(6)}°E`;
}

export function getDistanceLabel(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${((meters / 1000).toFixed(1))}km`;
}

/**
 * ---------------------------------------------------------------------------
 * V. PIPELINE DE COMPRESIÓN IMAGEN JIT (CANVAS ENGINE)
 * ---------------------------------------------------------------------------
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

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(file);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        resolve(blob || file);
      }, 'image/webp', quality);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
  });
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.2):
 * 1. Security First: Se purgaron todas las referencias a repositorios externos 
 *    como 'the-sneaker' o placeholders no auditados.
 * 2. Audio Context Restored: Se mantiene la exportación de getSharedAudioCtx para
 *    sanar el error de build de Vercel detectado en los logs.
 * 3. Sovereign Fallbacks: Los assets de respaldo ahora usan CDNs masivos auditados
 *    (Unsplash/Dicebear) o rutas locales propias de NicePod.
 * 4. Zero Abbreviations: El archivo es un bloque de código completo y funcional.
 */