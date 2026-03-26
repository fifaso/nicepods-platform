// hooks/use-sensor-authority.ts
// VERSIÓN: 2.0 (NicePod Sensor Authority - Aggressive Ignition & Watchdog Edition)
// Misión: Captura pura de telemetría GPS/Heading con protocolo de re-intento por estancamiento.
// [NCIS DOGMA]: El hardware debe responder o ser reiniciado. Cero bloqueos silenciosos.

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { nicepodLog } from "@/lib/utils";
import { MADRID_SOL_COORDS } from "@/components/geo/map-constants";

/**
 * INTERFAZ: RawTelemetry
 * La verdad física capturada directamente del silicio del dispositivo.
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
 * HOOK: useSensorAuthority
 * El único componente autorizado para dialogar con el chip GPS del hardware.
 */
export function useSensorAuthority() {
  // --- I. ESTADO SOBERANO ---
  const [telemetry, setTelemetry] = useState<RawTelemetry | null>(null);
  const [isDenied, setIsDenied] = useState<boolean>(false);
  const [isAcquiring, setIsAcquiring] = useState<boolean>(false);

  // --- II. MEMORIA TÉCNICA (SINGLETON REFS) ---
  const watchIdRef = useRef<number | null>(null);
  const isHardwareIgnitedRef = useRef<boolean>(false);
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * hydrateInitialPosition:
   * Misión: Materialización instantánea antes de la señal satelital.
   */
  const hydrateInitialPosition = useCallback(() => {
    if (telemetry) return;

    // 1. Intento de recuperación desde LocalStorage (Memoria de Sesión)
    const cachedFix = typeof window !== "undefined" ? localStorage.getItem('nicepod_last_known_fix') : null;
    
    if (cachedFix) {
      try {
        const parsed = JSON.parse(cachedFix);
        nicepodLog("💾 [Sensor-Authority] Hidratación por Caché Local.");
        setTelemetry({
          ...parsed,
          source: 'cache',
          timestamp: Date.now()
        });
        return;
      } catch (e) {
        nicepodLog("⚠️ [Sensor-Authority] Fallo en lectura de caché.", null, 'warn');
      }
    }

    // 2. Fallback de Seguridad: Punto Zero (Madrid Sol)
    setTelemetry({
      latitude: MADRID_SOL_COORDS.latitude,
      longitude: MADRID_SOL_COORDS.longitude,
      accuracy: 9999,
      heading: null,
      speed: null,
      timestamp: Date.now(),
      source: 'ip-fallback'
    });
  }, [telemetry]);

  /**
   * startHardwareWatch:
   * Misión: Activar el stream de datos con Protocolo de Ignición Agresiva.
   */
  const startHardwareWatch = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      nicepodLog("🔥 [Sensor-Authority] Hardware GPS no detectado.", null, 'error');
      return;
    }

    // [BLOQUEO DE SEGURIDAD]: Si ya está encendido, ignoramos para no saturar el bus.
    if (isHardwareIgnitedRef.current) {
      nicepodLog("📡 [Sensor-Authority] Hardware ya se encuentra en ignición.");
      return;
    }

    // PROTOCOLO DE RE-IGNICIÓN: Limpiamos cualquier rastro previo de búsqueda.
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    isHardwareIgnitedRef.current = true;
    setIsAcquiring(true);

    /**
     * [WATCHDOG]: Temporizador de Vigilancia (6 segundos)
     * Si el hardware no entrega datos reales en este tiempo, reseteamos el cerrojo
     * para permitir un nuevo intento manual o automático.
     */
    if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
    watchdogTimerRef.current = setTimeout(() => {
      if (isAcquiring) {
        nicepodLog("🆘 [Sensor-Authority] Hardware Stall detectado. Liberando cerrojo.");
        isHardwareIgnitedRef.current = false;
        setIsAcquiring(false);
      }
    }, 6000);

    const onSignalSuccess = (pos: GeolocationPosition) => {
      // Limpiamos el Watchdog al recibir señal real
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
        nicepodLog(`🟡 [Sensor-Authority] Estabilidad de señal: ${error.message}`);
      }
    };

    // Configuración de Alta Fidelidad para Malla Pokémon GO
    const options: PositionOptions = {
      enableHighAccuracy: true, 
      maximumAge: 0,            
      timeout: 20000            
    };

    nicepodLog("📡 [Sensor-Authority] Ejecutando Gesto de Ignición Agresiva.");
    watchIdRef.current = navigator.geolocation.watchPosition(onSignalSuccess, onSignalError, options);
  }, [isAcquiring]);

  /**
   * killHardwareWatch:
   * Misión: Liberar los recursos del chip GPS y resetear estados.
   */
  const killHardwareWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
    isHardwareIgnitedRef.current = false;
    setIsAcquiring(false);
    nicepodLog("💤 [Sensor-Authority] Hardware GPS desconectado.");
  }, []);

  // --- III. CICLO DE VIDA ---
  useEffect(() => {
    hydrateInitialPosition();
    return () => {
      // Mantenemos el watch vivo durante la navegación SPA para fluidez
    };
  }, [hydrateInitialPosition]);

  return {
    telemetry,
    isDenied,
    isAcquiring,
    startHardwareWatch,
    killHardwareWatch,
    /**
     * reSync:
     * Fuerza un reinicio del bus de datos GPS pase lo que pase.
     */
    reSync: () => {
      nicepodLog("🔄 [Sensor-Authority] Re-sincronía forzada por el Voyager.");
      isHardwareIgnitedRef.current = false;
      startHardwareWatch();
    }
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Watchdog Protocol: Se resolvió el problema del 'Stall' de hardware. Si el GPS no 
 *    devuelve coordenadas en 6s, el sistema permite re-intentar, eliminando la espera infinita.
 * 2. Ignición Agresiva: El uso de 'clearWatch' antes de un nuevo 'watchPosition' 
 *    garantiza que el navegador no ignore la petición por considerarla duplicada.
 * 3. Hot-Fix de Interactividad: Al exponer el método 'reSync', permitimos que los 
 *    botones del HUD de NicePod tengan la autoridad real para despertar al GPS.
 */