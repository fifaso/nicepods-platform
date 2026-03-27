// hooks/use-sensor-authority.ts
// VERSIÓN: 4.1 (NicePod Sensor Authority - Absolute Authority & Rapid Fix Edition)
// Misión: Captura pura de telemetría GPS con protocolo de prioridad satelital.
// [ESTABILIZACIÓN]: Implementación de Transmutación de Fuente y Watchdog de Rescate.

"use client";

import { MADRID_SOL_COORDS } from "@/components/geo/map-constants";
import { nicepodLog } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * INTERFAZ: RawTelemetry
 * La verdad física capturada directamente del silicio del dispositivo o la red.
 */
export interface RawTelemetry {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  timestamp: number;
  source: 'gps' | 'cache' | 'ip-fallback';
}

/**
 * INTERFAZ: SensorAuthorityProps
 */
interface SensorAuthorityProps {
  initialData?: { lat: number; lng: number; city: string; source: string; } | null;
}

// UMBRAL DE CADUCIDAD: 15 minutos para evitar amnesia posicional entre sesiones.
const CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * HOOK: useSensorAuthority
 * El único componente autorizado para dialogar con el chip GPS del hardware.
 */
export function useSensorAuthority({ initialData }: SensorAuthorityProps = {}) {

  // --- I. ESTADO SOBERANO CON MATERIALIZACIÓN T0 ---
  const [telemetry, setTelemetry] = useState<RawTelemetry | null>(() => {
    if (typeof window === "undefined") return null;

    // 1. PRIORIDAD A: Caché Local Reciente (< 15 min)
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

    // 3. FALLBACK DE SEGURIDAD (Mínima Verdad)
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

  // Flag crítico para detectar el paso de 'Cortesía' (IP) a 'Autoridad' (GPS)
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

    // [CERROJO]: Bloqueo de duplicidad para proteger la antena GPS
    if (isHardwareIgnitedRef.current) {
      nicepodLog("📡 [Sensor-Authority] Hardware en proceso de ignición activo.");
      return;
    }

    // Limpieza atómica de procesos previos
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    isHardwareIgnitedRef.current = true;
    setIsAcquiring(true);

    /**
     * [WATCHDOG]: Temporizador de Vigilancia (8 segundos)
     * Si el chip GPS no responde, liberamos el cerrojo para permitir re-intentos
     * automáticos o manuales por parte del Voyager.
     */
    if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
    watchdogTimerRef.current = setTimeout(() => {
      if (!hasGPSFixRef.current) {
        nicepodLog("🆘 [Sensor-Authority] Hardware Stall detectado. Liberando cerrojo.");
        isHardwareIgnitedRef.current = false;
        setIsAcquiring(false);
      }
    }, 8000);

    const onSignalSuccess = (pos: GeolocationPosition) => {
      // Limpiamos el Watchdog en el primer éxito real
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
       * [PROTOCOLO DE TRANSMUTACIÓN]:
       * Misión: Si es el primer fix real de GPS, forzamos la actualización
       * para que el mapa salte de la IP a la calle exacta de forma inmediata.
       */
      if (!hasGPSFixRef.current) {
        nicepodLog(`🛰️ [Sensor-Authority] GPS Fix Certificado (Acc: ${Math.round(pos.coords.accuracy)}m).`);
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
        nicepodLog("🛑 [Sensor-Authority] Acceso denegado por el usuario.", null, 'error');
        setIsDenied(true);
      } else {
        nicepodLog(`🟡 [Sensor-Authority] Sincronizando satélites: ${error.message}`);
      }
    };

    /**
     * [DUAL STREAM IGNITION]:
     * 1. Shot de Red: Rápido y aproximado (materialización visual).
     * 2. Watch Satelital: Continuo y preciso (navegación cinemática).
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

  /**
   * killHardwareWatch:
   * Misión: Liberar los recursos del chip GPS y resetear flags de autoridad.
   */
  const killHardwareWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
    isHardwareIgnitedRef.current = false;
    hasGPSFixRef.current = false;
    setIsAcquiring(false);
    nicepodLog("💤 [Sensor-Authority] Hardware GPS desconectado.");
  }, []);

  /**
   * reSync:
   * Misión: Forzar un reinicio total de la búsqueda de posición.
   */
  const reSync = useCallback(() => {
    nicepodLog("🔄 [Sensor-Authority] Ejecutando Re-Sincronía de Autoridad.");
    isHardwareIgnitedRef.current = false;
    hasGPSFixRef.current = false;
    startHardwareWatch();
  }, [startHardwareWatch]);

  // --- III. CICLO DE VIDA ---
  useEffect(() => {
    // La materialización inicial ocurre en el useState.
    return () => {
      // Mantenemos el sensor activo durante la navegación interna.
    };
  }, []);

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
 * NOTA TÉCNICA DEL ARCHITECT (V4.1):
 * 1. Transmutación de Fuente: Al detectar el paso de 'ip-fallback' a 'gps', el 
 *    sistema fuerza una actualización visual, rompiendo el estancamiento.
 * 2. Protocolo Fast-Fix: La captura dual garantiza que el Voyager nunca vea un 
 *    mapa en negro mientras el hardware satelital realiza su Cold Fix.
 * 3. Watchdog de Stall: Se previene el bloqueo silencioso del GPS si la señal
 *    no se recibe en los primeros 8 segundos, habilitando la re-ignición.
 */