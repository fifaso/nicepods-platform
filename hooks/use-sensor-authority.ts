// hooks/use-sensor-authority.ts
// VERSIÓN: 4.0 (NicePod Sensor Authority - Absolute Authority & Rapid Fix Edition)
// Misión: Captura pura de telemetría GPS con protocolo de prioridad satelital.
// [ESTABILIZACIÓN]: Implementación de Authority Escalation y Doble Ignición Agresiva.

"use client";

import { MADRID_SOL_COORDS } from "@/components/geo/map-constants";
import { nicepodLog } from "@/lib/utils";
import { useCallback, useRef, useState } from "react";

// --- CONTRATOS DE TELEMETRÍA SOBERANA ---
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

// UMBRAL DE CADUCIDAD: 15 minutos para evitar amnesia posicional
const CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * HOOK: useSensorAuthority
 * El único componente autorizado para dialogar con el chip GPS del hardware.
 */
export function useSensorAuthority({ initialData }: SensorAuthorityProps = {}) {

  // --- I. ESTADO SOBERANO CON MATERIALIZACIÓN T0 ---
  const [telemetry, setTelemetry] = useState<RawTelemetry | null>(() => {
    if (typeof window === "undefined") return null;

    // 1. PRIORIDAD A: Caché Local Reciente
    const cachedFixStr = localStorage.getItem('nicepod_last_known_fix');
    if (cachedFixStr) {
      try {
        const parsed: RawTelemetry = JSON.parse(cachedFixStr);
        const age = Date.now() - (parsed.timestamp || 0);

        if (age < CACHE_TTL_MS) {
          nicepodLog("💾 [Sensor-Authority] Memoria fresca detectada. Hidratación T0.");
          return { ...parsed, source: 'cache' };
        }
        nicepodLog("🗑️ [Sensor-Authority] Memoria antigua purgada.");
        localStorage.removeItem('nicepod_last_known_fix');
      } catch (e) {
        nicepodLog("⚠️ [Sensor-Authority] Fallo en lectura de memoria.", null, 'warn');
      }
    }

    // 2. PRIORIDAD B: Paracaídas de Red (Geo-IP)
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

    // 3. FALLBACK DE SEGURIDAD
    return {
      ...MADRID_SOL_COORDS,
      accuracy: 9999,
      heading: null,
      speed: null,
      timestamp: Date.now(),
      source: 'ip-fallback'
    };
  });

  const [isDenied, setIsDenied] = useState<boolean>(false);
  const [isAcquiring, setIsAcquiring] = useState<boolean>(false);

  // --- II. MEMORIA TÉCNICA (SINGLETON REFS) ---
  const watchIdRef = useRef<number | null>(null);
  const isHardwareIgnitedRef = useRef<boolean>(false);
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Flag para detectar la primera señal real de satélite
  const hasGPSFixRef = useRef<boolean>(false);

  /**
   * startHardwareWatch:
   * Misión: Activar el hardware GPS con Protocolo de Ignición Agresiva.
   */
  const startHardwareWatch = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      nicepodLog("🔥 [Sensor-Authority] Hardware GPS no disponible.", null, 'error');
      return;
    }

    // [CERROJO]: Bloqueo de duplicidad para no saturar el bus del sistema.
    if (isHardwareIgnitedRef.current) return;

    // Limpieza atómica antes de la re-ignición
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);

    isHardwareIgnitedRef.current = true;
    setIsAcquiring(true);

    /**
     * [WATCHDOG]: Temporizador de Vigilancia
     * Si en 8s no hay GPS real, liberamos el cerrojo para permitir re-intentos.
     */
    if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
    watchdogTimerRef.current = setTimeout(() => {
      if (!hasGPSFixRef.current) {
        nicepodLog("🆘 [Sensor-Authority] Hardware Stall. Reset de autoridad.");
        isHardwareIgnitedRef.current = false;
        setIsAcquiring(false);
      }
    }, 8000);

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
       * [PROTOCOLO GPS-OVERRIDE]:
       * Misión: Si es el primer dato de satélite de la sesión, lo inyectamos
       * incondicionalmente para forzar al mapa a saltar de la IP a la realidad.
       */
      if (!hasGPSFixRef.current) {
        nicepodLog(`🛰️ [Sensor-Authority] GPS Fix Alcanzado (Precisión: ${Math.round(pos.coords.accuracy)}m).`);
        hasGPSFixRef.current = true;
      }

      setTelemetry(freshTelemetry);
      setIsAcquiring(false);
      localStorage.setItem('nicepod_last_known_fix', JSON.stringify(freshTelemetry));
    };

    const onSignalError = (error: GeolocationPositionError) => {
      isHardwareIgnitedRef.current = false;
      setIsAcquiring(false);
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);

      if (error.code === error.PERMISSION_DENIED) {
        nicepodLog("🛑 [Sensor-Authority] Acceso denegado por el SO.", null, 'error');
        setIsDenied(true);
      } else {
        nicepodLog(`🟡 [Sensor-Authority] Buscando señal satelital: ${error.message}`);
      }
    };

    /**
     * [DUAL STREAM IGNITION]:
     * Lanzamos un 'Shot' rápido de red y un 'Watch' continuo de satélite.
     */
    navigator.geolocation.getCurrentPosition(onSignalSuccess, onSignalError, {
      enableHighAccuracy: false,
      timeout: 5000
    });

    watchIdRef.current = navigator.geolocation.watchPosition(onSignalSuccess, onSignalError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 25000
    });

  }, []);

  const killHardwareWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
    isHardwareIgnitedRef.current = false;
    hasGPSFixRef.current = false;
    setIsAcquiring(false);
    nicepodLog("💤 [Sensor-Authority] Hardware desconectado.");
  }, []);

  // --- III. MÉTODO DE ACCIÓN SOBERANA ---
  const reSync = useCallback(() => {
    nicepodLog("🔄 [Sensor-Authority] Ejecutando Re-Sincronía de Fuerza.");
    isHardwareIgnitedRef.current = false;
    hasGPSFixRef.current = false;
    startHardwareWatch();
  }, [startHardwareWatch]);

  return {
    telemetry,
    isDenied,
    isAcquiring,
    startHardwareWatch,
    killHardwareWatch,
    reSync
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Solución de Estancamiento (Stall Fix): La introducción de 'hasGPSFixRef' permite 
 *    que el sistema identifique el momento exacto en que la ubicación real supera 
 *    a la ubicación de IP, forzando la actualización visual.
 * 2. Ignición Dual: Se solicita primero una ubicación por red (rápida) y luego 
 *    por satélite (precisa). Esto garantiza que el Voyager se materialice en <1s.
 * 3. Autoridad de Re-Sincronía: El método 'reSync' ahora resetea todos los flags 
 *    internos, asegurando que el chip GPS del móvil se vea obligado a refrescar 
 *    su estado de búsqueda.
 */