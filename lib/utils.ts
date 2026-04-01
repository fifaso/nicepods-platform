/**
 * ARCHIVO: lib/utils.ts
 * VERSIÓN: 7.0 (NicePod Utility Core - Off-Main-Thread Shield & Silence-Guard Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Centralizar telemetría, soberanía de assets y protección absoluta del hilo principal.
 * [REFORMA V7.0]: Integración de Web Workers para compresión asíncrona JIT con Fallback Táctico.
 * Nivel de Integridad: 100% (Soberanía Total / Producción-Ready)
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * ---------------------------------------------------------------------------
 * 0. PROTOCOLO SILENCE-GUARD PRO (INTERCEPCIÓN DE BAJO NIVEL)
 * ---------------------------------------------------------------------------
 * Misión: Erradicar el ruido de Mapbox Standard que bloquea el Main Thread.
 * El uso de un Set o Array constante permite comparaciones de alta velocidad.
 */
if (typeof window !== 'undefined') {
  const PROHIBITED_LOG_PATTERNS = [
    'Ignoring unknown image variable',
    'Cutoff is currently disabled on terrain',
    'Source "mapbox-dem" already exists',
    'formatDetection',
    'already exists'
  ];

  const nativeConsoleWarn = console.warn;
  console.warn = (...warnArguments: unknown[]) => {
    const firstArg = warnArguments[0];
    if (typeof firstArg === 'string') {
      // Búsqueda ultrarrápida de patrones de ruido
      const isInternalNoise = PROHIBITED_LOG_PATTERNS.some(pattern =>
        firstArg.includes(pattern)
      );
      if (isInternalNoise) return;
    }
    nativeConsoleWarn.apply(console, warnArguments);
  };
}

/**
 * ---------------------------------------------------------------------------
 * I. UTILIDADES DE ESTILO (SINTAXIS SOBERANA)
 * ---------------------------------------------------------------------------
 */

export function cn(...classInputs: ClassValue[]) {
  return twMerge(clsx(classInputs));
}

/**
 * nicepodLog: Telemetría de consola optimizada.
 * [V6.5]: Los logs operan asíncronamente para no bloquear el frame de la cámara.
 */
export function nicepodLog(
  message: string,
  data: unknown = null,
  severity: 'info' | 'warn' | 'error' = 'info'
) {
  if (process.env.NODE_ENV !== 'production') {
    // Deferimos el log al final del event loop para proteger los 60FPS
    setTimeout(() => {
      const prefix = `[NicePod-V3.0]`;
      const time = new Date().toLocaleTimeString();

      const styles = {
        info: 'color: #8b5cf6; font-weight: 900; background: rgba(139, 92, 246, 0.1); padding: 2px 4px; border-radius: 4px;',
        warn: 'color: #f59e0b; font-weight: 900;',
        error: 'color: #ef4444; font-weight: 900; border: 1px solid #ef4444; padding: 2px;'
      };

      if (severity === 'error') {
        console.error(`%c${prefix} 🔥 [${time}] ${message}`, styles.error, data ?? '');
      } else if (severity === 'warn') {
        console.warn(`%c${prefix} ⚠️ [${time}] ${message}`, styles.warn, data ?? '');
      } else {
        console.log(`%c${prefix} 📡 [${time}] ${message}`, styles.info, data ?? '');
      }
    }, 0);
  }
}

/**
 * ---------------------------------------------------------------------------
 * II. INGENIERÍA ACÚSTICA (VOICE ENGINE)
 * ---------------------------------------------------------------------------
 */

let sharedAudioContext: AudioContext | null = null;

export function getSharedAudioCtx() {
  if (typeof window === 'undefined') return null;

  if (!sharedAudioContext) {
    const AudioConstructor = window.AudioContext || (window as any).webkitAudioContext;
    sharedAudioContext = new AudioConstructor();
  }

  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume();
  }

  return sharedAudioContext;
}

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

export function formatTime(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null || !isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * ---------------------------------------------------------------------------
 * III. GOBERNANZA DE ASSETS (RESILIENCIA SUPABASE)
 * ---------------------------------------------------------------------------
 */

export function getSupabaseAsset(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;

  const STORAGE_ROOT = "https://arbojlknwilqcszuqope.supabase.co/storage/v1/object/public";
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;

  if (!cleanPath.includes('/')) {
    return `${STORAGE_ROOT}/podcasts/${cleanPath}`;
  }

  return `${STORAGE_ROOT}/${cleanPath}`;
}

export function getSafeAsset(
  path: string | null | undefined,
  type: 'avatar' | 'cover' | 'logo' = 'cover'
): string {
  const resolved = getSupabaseAsset(path);

  const isOk = resolved &&
    resolved.trim() !== "" &&
    resolved.indexOf('placeholder') === -1;

  if (isOk) return resolved as string;

  const cdns = {
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=NicePodCurator",
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
    logo: "/nicepod-logo.png"
  };

  return cdns[type] || cdns.cover;
}

/**
 * ---------------------------------------------------------------------------
 * IV. RIGOR GEOESPACIAL (HUD TÁCTICO)
 * ---------------------------------------------------------------------------
 */

export function formatCoordinates(lng: number, lat: number): string {
  return `${lat.toFixed(6)}°N, ${lng.toFixed(6)}°E`;
}

export function getDistanceLabel(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * ---------------------------------------------------------------------------
 * V. PIPELINE DE COMPRESIÓN IMAGEN JIT (HYBRID SHIELD)
 * ---------------------------------------------------------------------------
 * [MANDATO V3.0]: La compresión pesada delega a un Web Worker. Si el dispositivo
 * es legado (ej. Safari sin OffscreenCanvas), activa el fallback atómico.
 */

/**
 * compressOnMainThread: 
 * El motor original de la V2.8. Actúa como paracaídas si el Worker falla.
 */
async function compressOnMainThread(
  file: File,
  maxWidth: number,
  quality: number
): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let w = img.width;
      let h = img.height;

      if (w > maxWidth) {
        h = (maxWidth / w) * h;
        w = maxWidth;
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(file);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob((blob) => {
        resolve(blob || file);
      }, 'image/webp', quality);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
  });
}

/**
 * compressNicePodImage:
 * Director de orquesta de la compresión. Desvía la carga fuera del Main Thread.
 */
export async function compressNicePodImage(
  file: File,
  maxWidth: number = 2048,
  quality: number = 0.85
): Promise<Blob> {
  if (typeof window === 'undefined') return file;

  // ESCUDO DE COMPATIBILIDAD (Fallback Táctico para Safari/iOS Legacy)
  if (!window.Worker || !window.OffscreenCanvas) {
    nicepodLog("⚠️ [Compression] OffscreenCanvas no soportado. Usando Main Thread.", null, "warn");
    return compressOnMainThread(file, maxWidth, quality);
  }

  return new Promise((resolve) => {
    try {
      // Instanciación Segura en Next.js (Webpack 5)
      const worker = new Worker(new URL('./workers/compression.worker.ts', import.meta.url), { type: 'module' });

      worker.onmessage = (e: MessageEvent) => {
        if (e.data.success) {
          resolve(e.data.blob);
        } else {
          nicepodLog("⚠️ [Worker] Fallo interno en hilo secundario. Activando paracaídas.", e.data.error, "warn");
          resolve(compressOnMainThread(file, maxWidth, quality));
        }
        // [HIGIENE DE RAM]: Destrucción física del hilo tras cumplir su misión.
        worker.terminate();
      };

      worker.onerror = (error) => {
        nicepodLog("🔥 [Worker] Error crítico de ejecución. Activando paracaídas.", error.message, "error");
        resolve(compressOnMainThread(file, maxWidth, quality));
        worker.terminate();
      };

      // Transferencia al hilo secundario. File es Clonable por el Structured Clone Algorithm.
      worker.postMessage({ file, maxWidth, quality });

    } catch (err) {
      nicepodLog("🔥 [Worker] Imposible instanciar hilo. Activando paracaídas.", null, "error");
      resolve(compressOnMainThread(file, maxWidth, quality));
    }
  });
}