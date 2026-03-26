// hooks/use-sensor-authority.ts
// VERSIÓN: 2.1 (NicePod Sensor Authority - Edge Ingestion & Absolute Priority Edition)
// Misión: Captura pura de telemetría GPS con integración directa del Paracaídas Geo-IP.
// [NCIS DOGMA]: El Hardware y la Red son la única verdad. Eliminación de fallbacks hardcodeados en el render.

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { nicepodLog } from "@/lib/utils";
import { MADRID_SOL_COORDS } from "@/components/geo/map-constants";

/**
 * INTERFAZ: RawTelemetry
 * La verdad física capturada directamente del silicio o de la red (IP).
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
 * Permite que el Orquestador Superior inyecte la ubicación de IP de Vercel.
 */
interface SensorAuthorityProps {
  initialData?: { lat: number; lng: number; city: string; source: string; } | null;
}

/**
 * HOOK: useSensorAuthority
 * El único componente autorizado para dialogar con el chip GPS del hardware.
 */
export function useSensorAuthority({ initialData }: SensorAuthorityProps = {}) {
  
  // --- I. ESTADO SOBERANO CON HIDRATACIÓN T0 ---
  // Misión: El estado inicial se calcula sincrónicamente al montar el hook para evitar 
  // parpadeos (flickering) entre un estado null y la ubicación de rescate.
  const [telemetry, setTelemetry] = useState<RawTelemetry | null>(() => {
    if (typeof window === "undefined") return null;

    // 1. Prioridad A: Caché Local (Última ubicación conocida exacta)
    const cachedFix = localStorage.getItem('nicepod_last_known_fix');
    if (cachedFix) {
      try {
        const parsed = JSON.parse(cachedFix);
        nicepodLog("💾 [Sensor-Authority] Estado T0: Caché Local recuperado.");
        return { ...parsed, source: 'cache', timestamp: Date.now() };
      } catch (e) {
        nicepodLog("⚠️ [Sensor-Authority] Caché corrupto. Ignorando.", null, 'warn');
      }
    }

    // 2. Prioridad B: Paracaídas de Red (Vercel Edge Geo-IP)
    if (initialData) {
      nicepodLog(`🌐 [Sensor-Authority] Estado T0: Paracaídas de Red (${initialData.city}).`);
      return {
        latitude: initialData.lat,
        longitude: initialData.lng,
        accuracy: 5000, // Margen de error grande para indicar "Estimación"
        heading: null,
        speed: null,
        timestamp: Date.now(),
        source: 'ip-fallback'
      };
    }

    // 3. Fallback de Emergencia: Solo si todo lo demás falla.
    return null; 
  });

  const [isDenied, setIsDenied] = useState<boolean>(false);
  const [isAcquiring, setIsAcquiring] = useState<boolean>(false);

  // --- II. MEMORIA TÉCNICA (SINGLETON REFS) ---
  const watchIdRef = useRef<number | null>(null);
  const isHardwareIgnitedRef = useRef<boolean>(false);
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      nicepodLog("🆘 [Sensor-Authority] Hardware Stall detectado. Liberando cerrojo.");
      isHardwareIgnitedRef.current = false;
      setIsAcquiring(false);
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
  }, []);

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
    return () => {
      // Mantenemos el watch vivo durante la navegación SPA para fluidez.
      // Solo se limpiará si el Orquestador llama explícitamente a killHardwareWatch.
    };
  }, []);

  return {
    telemetry,
    isDenied,
    isAcquiring,
    startHardwareWatch,
    killHardwareWatch,
    /**
     * reSync: Fuerza un reinicio del bus de datos GPS pase lo que pase.
     */
    reSync: () => {
      nicepodLog("🔄 [Sensor-Authority] Re-sincronía forzada por el Voyager.");
      isHardwareIgnitedRef.current = false;
      startHardwareWatch();
    }
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.1):
 * 1. Materialización Síncrona: El estado 'telemetry' ahora nace inicializado con 
 *    los datos de Caché o Edge-IP. Esto elimina el 'efecto parpadeo' donde el 
 *    mapa intentaba renderizar Sol antes de corregirse.
 * 2. Integración de Red: Se añadió la interfaz 'SensorAuthorityProps' para que 
 *    el Orquestador Global (useGeoEngine) pueda inyectar el paracaídas de Vercel.
 * 3. Aislamiento de Errores: El Watchdog de 6s previene bloqueos eternos si el 
 *    usuario está en un túnel o interior sin señal satelital, permitiendo 
 *    que el botón de "Re-Sync" de la UI siempre funcione.
 */