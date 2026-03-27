// hooks/use-sensor-authority.ts
// VERSIÓN: 3.0 (NicePod Sensor Authority - TTL Cache & Fast-Fix Edition)
// Misión: Captura pura de telemetría GPS con purga de caché y aceptación incondicional T0.
// [ESTABILIZACIÓN]: Implementación de Caducidad de 15 min y Dual Stream de Ignición.

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { nicepodLog } from "@/lib/utils";

// --- CONTRATOS DE AUTORIDAD ---
export interface RawTelemetry {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  timestamp: number;
  source: 'gps' | 'cache' | 'ip-fallback';
}

interface SensorAuthorityProps {
  initialData?: { lat: number; lng: number; city: string; source: string; } | null;
}

// UMBRAL DE CADUCIDAD: 15 minutos en milisegundos
const CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * HOOK: useSensorAuthority
 * El único componente autorizado para dialogar con el chip GPS del hardware.
 */
export function useSensorAuthority({ initialData }: SensorAuthorityProps = {}) {
  
  // --- I. ESTADO SOBERANO CON HIDRATACIÓN INTELIGENTE ---
  const [telemetry, setTelemetry] = useState<RawTelemetry | null>(() => {
    if (typeof window === "undefined") return null;

    // 1. PRIORIDAD A: Caché Local (Solo si está fresco)
    const cachedFixStr = localStorage.getItem('nicepod_last_known_fix');
    if (cachedFixStr) {
      try {
        const parsed: RawTelemetry = JSON.parse(cachedFixStr);
        const age = Date.now() - parsed.timestamp;
        
        // [MANDATO V2.7]: Purga de Amnesia. Si el dato es viejo, lo incineramos.
        if (age < CACHE_TTL_MS) {
          nicepodLog("💾 [Sensor-Authority] Caché válido. Hidratación T0.");
          return { ...parsed, source: 'cache' };
        } else {
          nicepodLog("🗑️ [Sensor-Authority] Caché caducado. Purgando memoria.");
          localStorage.removeItem('nicepod_last_known_fix');
        }
      } catch (e) {
        nicepodLog("⚠️ [Sensor-Authority] Caché corrupto. Ignorando.", null, 'warn');
      }
    }

    // 2. PRIORIDAD B: Paracaídas de Red (Vercel Edge Geo-IP)
    if (initialData) {
      nicepodLog(`🌐 [Sensor-Authority] Materialización T0 por IP (${initialData.city}).`);
      return {
        latitude: initialData.lat,
        longitude: initialData.lng,
        accuracy: 5000, 
        heading: null,
        speed: null,
        timestamp: Date.now(),
        source: 'ip-fallback'
      };
    }

    return null; 
  });

  const [isDenied, setIsDenied] = useState<boolean>(false);
  const [isAcquiring, setIsAcquiring] = useState<boolean>(false);

  // --- II. MEMORIA TÉCNICA (SINGLETON REFS) ---
  const watchIdRef = useRef<number | null>(null);
  const isHardwareIgnitedRef = useRef<boolean>(false);
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);

  // [FLAG TÁCTICO]: Identifica si es el primer pulso del hardware en esta sesión
  const isFirstHardwarePing = useRef<boolean>(true);

  /**
   * startHardwareWatch:
   * Misión: Activar el stream de datos con Dual Stream (Red -> Satélite).
   */
  const startHardwareWatch = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      nicepodLog("🔥 [Sensor-Authority] Hardware GPS no detectado.", null, 'error');
      return;
    }

    if (isHardwareIgnitedRef.current) return;
    
    // Limpieza de procesos zombie
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    isHardwareIgnitedRef.current = true;
    setIsAcquiring(true);
    isFirstHardwarePing.current = true;

    // [WATCHDOG]: 6 segundos de gracia antes de liberar el cerrojo
    if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
    watchdogTimerRef.current = setTimeout(() => {
      nicepodLog("🆘 [Sensor-Authority] Hardware Stall detectado. Liberando cerrojo.");
      isHardwareIgnitedRef.current = false;
      setIsAcquiring(false);
    }, 6000);

    const onSignalSuccess = (pos: GeolocationPosition) => {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }

      const freshTelemetry: RawTelemetry = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        heading: pos.coords.heading,
        speed: pos.coords.speed,
        timestamp: pos.timestamp,
        source: 'gps'
      };

      /**
       * [PROTOCOLO FAST-FIX]: Aceptación Incondicional.
       * Si es el primer latido del hardware, lo aceptamos sea como sea. 
       * Esto fuerza a la UI a salir del modo 'Estimando por IP' al instante.
       */
      if (isFirstHardwarePing.current) {
        nicepodLog("⚡ [Sensor-Authority] Primer Ping de Hardware aceptado incondicionalmente.");
        isFirstHardwarePing.current = false;
        setTelemetry(freshTelemetry);
        setIsAcquiring(false);
        localStorage.setItem('nicepod_last_known_fix', JSON.stringify(freshTelemetry));
        return;
      }

      // Si ya no es el primer ping, actualizamos normalmente.
      // (El filtrado de 5m y 3° ocurrirá un nivel más arriba en el use-geo-engine).
      setTelemetry(freshTelemetry);
      setIsAcquiring(false);
      localStorage.setItem('nicepod_last_known_fix', JSON.stringify(freshTelemetry));
    };

    const onSignalError = (error: GeolocationPositionError) => {
      isHardwareIgnitedRef.current = false;
      setIsAcquiring(false);
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);

      if (error.code === error.PERMISSION_DENIED) {
        nicepodLog("🛑 [Sensor-Authority] Permiso denegado por el Voyager.", null, 'error');
        setIsDenied(true);
      } else {
        nicepodLog(`🟡 [Sensor-Authority] Retraso de señal: ${error.message}`);
      }
    };

    /**
     * [DUAL STREAM IGNITION]
     * 1. Pedimos un 'shot' rápido usando antenas de red (Baja precisión, alta velocidad).
     * 2. Inmediatamente encendemos el stream Satelital para la precisión fina.
     */
    navigator.geolocation.getCurrentPosition(onSignalSuccess, onSignalError, {
      enableHighAccuracy: false, 
      timeout: 3000,
      maximumAge: 0
    });

    watchIdRef.current = navigator.geolocation.watchPosition(onSignalSuccess, onSignalError, {
      enableHighAccuracy: true, 
      maximumAge: 0,            
      timeout: 15000            
    });

  }, []);

  const killHardwareWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
    isHardwareIgnitedRef.current = false;
    setIsAcquiring(false);
    nicepodLog("💤 [Sensor-Authority] Hardware GPS en reposo.");
  }, []);

  useEffect(() => {
    return () => {
      // Mantenemos el watch vivo durante la navegación SPA.
    };
  }, []);

  return {
    telemetry,
    isDenied,
    isAcquiring,
    startHardwareWatch,
    killHardwareWatch,
    reSync: () => {
      nicepodLog("🔄 [Sensor-Authority] Re-sincronía forzada (Force Overide).");
      isHardwareIgnitedRef.current = false;
      startHardwareWatch();
    }
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Protocolo Anti-Amnesia (TTL): Se implementó la purga de caché de 15 minutos. 
 *    Esto evita que el mapa nazca en la ubicación de ayer, forzando al sistema a 
 *    utilizar la IP o buscar señal fresca si el dato es viejo.
 * 2. Dual Stream Ignition: Al lanzar un 'getCurrentPosition' en baja precisión seguido
 *    de un 'watchPosition' en alta precisión, logramos que el usuario se materialice
 *    en menos de 1 segundo (usando WiFi/Celdas) mientras el Satélite calienta.
 * 3. Fast-Fix Acceptance: La inyección incondicional del primer ping garantiza que 
 *    el sistema nunca se auto-bloquee descartando la primera señal de hardware.
 */