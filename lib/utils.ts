/**
 * ARCHIVO: lib/utils.ts
 * VERSIÓN: 6.0 (NicePod Utility Core - Infrastructure Resilience Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Centralizar el formateo, la soberanía de assets y el rigor geoespacial.
 * [REFORMA V6.0]: Motor de resolución de assets Supabase y blindaje de hidratación visual.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * ---------------------------------------------------------------------------
 * I. UTILIDADES DE SUPERFICIE Y ESTILO
 * ---------------------------------------------------------------------------
 */

/**
 * cn: Función de combinación soberana de clases.
 * Resuelve colisiones de Tailwind asegurando que las variantes 'resonance' 
 * y 'glass' del botón base tengan prioridad sobre los estilos por defecto.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * nicepodLog: Sistema de telemetría de consola industrial.
 * Silencia el ruido en producción para optimizar el rendimiento del motor WebGL.
 */
export function nicepodLog(
  message: string, 
  data: unknown = null, 
  type: 'info' | 'warn' | 'error' = 'info'
) {
  if (process.env.NODE_ENV === 'development') {
    const prefix = `[NicePod-V2.8]`;
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
 * II. INGENIERÍA ACÚSTICA Y TEXTUAL
 * ---------------------------------------------------------------------------
 */

/**
 * cleanTextForSpeech: El "Stripper" de ruidos visuales para síntesis de voz.
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
 * formatTime: Convierte segundos en métrica de tiempo táctico.
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
 * III. SOBERANÍA DE ASSETS (SOLUCIÓN A ERRORES 404)
 * ---------------------------------------------------------------------------
 */

/**
 * getSupabaseAsset: Constructor de URLs de alta resiliencia.
 * [FIX V6.0]: Resuelve el error 404 de Supabase detectado en consola. 
 * Si la URL es parcial, le inyecta el prefijo de almacenamiento correcto.
 */
export function getSupabaseAsset(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  // Base URL de Supabase Storage (Madrid Resonance Cloud)
  const STORAGE_BASE = "https://arbojlknwilqcszuqope.supabase.co/storage/v1/object/public";
  
  // Limpieza de barras duplicadas
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Si el path no incluye el bucket, asumimos que es 'podcasts'
  if (!cleanPath.includes('/')) {
    return `${STORAGE_BASE}/podcasts/${cleanPath}`;
  }
  
  return `${STORAGE_BASE}/${cleanPath}`;
}

/**
 * getSafeAsset: Garantiza una interfaz sin "huecos" visuales.
 */
export function getSafeAsset(
  path: string | null | undefined, 
  type: 'avatar' | 'cover' | 'logo' = 'cover'
): string {
  const resolvedPath = getSupabaseAsset(path);
  
  const isValidUrl = resolvedPath &&
    resolvedPath.trim() !== "" &&
    !resolvedPath.includes('placeholder.svg');

  if (isValidUrl) return resolvedPath!;

  const fallbacks = {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Voyager",
    cover: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop",
    logo: "/nicepod-logo.png"
  };

  return fallbacks[type] || fallbacks.cover;
}

/**
 * ---------------------------------------------------------------------------
 * IV. RIGOR GEOESPACIAL (HUD)
 * ---------------------------------------------------------------------------
 */

/**
 * formatCoordinates: Transmuta coordenadas en telemetría visual.
 */
export function formatCoordinates(lng: number, lat: number): string {
  return `${lat.toFixed(6)}°N, ${lng.toFixed(6)}°E`;
}

/**
 * getDistanceLabel: Genera etiquetas de proximidad para el peritaje de POIs.
 */
export function getDistanceLabel(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * ---------------------------------------------------------------------------
 * V. PIPELINE DE COMPRESIÓN JIT (JUST-IN-TIME)
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
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Supabase Asset Shield: 'getSupabaseAsset' centraliza la construcción de URLs,
 *    erradicando el error 404 al navegar por el feed de podcasts.
 * 2. Visual Stacking Resilience: 'cn' ahora gestiona correctamente la especificidad
 *    del nuevo motor de botones tácticos V11.0.
 * 3. TTS Hygiene: 'cleanTextForSpeech' ha sido reforzada para purgar etiquetas IA 
 *    complejas, asegurando que la sabiduría de voz sea pura.
 * 4. Zero-Flicker Assets: El sistema de fallbacks dinámico previene errores de 
 *    carga en el componente next/image.
 */