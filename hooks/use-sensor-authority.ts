/**
 * ARCHIVO: hooks/use-sensor-authority.ts
 * VERSIÓN: 5.3 (NicePod Sensor Authority - Vectorial Logic Fix Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Captura pura de telemetría GPS y Compás Magnetométrico sin Jitter.
 * [REPARACIÓN V5.3]: Corrección de variable SMOOTHING_WINDOW_SIZE y blindaje de filtro.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import { MADRID_SOL_COORDS } from "@/components/geo/map-constants";
import { nicepodLog } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * INTERFAZ: RawTelemetry
 * La verdad física capturada directamente del silicio del dispositivo.
 */
export interface RawTelemetry {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null; // Rumbo purificado (0-360)
  speed: number | null;
  timestamp: number;
  source: 'gps' | 'cache' | 'ip-fallback';
}

interface SensorAuthorityProps {
  initialData?: { lat: number; lng: number; city: string; source: string; } | null;
}

const CACHE_TTL_MS = 15 * 60 * 1000; 
const WATCHDOG_THRESHOLD_MS = 8000;

// Configuración del Filtro de Purificación Vectorial (VAF)
const SMOOTHING_WINDOW_SIZE = 12; // Muestras para promediar el ruido magnético

/**
 * HOOK: useSensorAuthority
 * El único componente autorizado para dialogar con el hardware del dispositivo.
 */
export function useSensorAuthority({ initialData }: SensorAuthorityProps = {}) {
  
  // --- I. ESTADO SOBERANO (MATERIALIZACIÓN T0) ---
  const [telemetry, setTelemetry] = useState<RawTelemetry | null>(() => {
    if (typeof window === "undefined") return null;

    // 1. Prioridad: Memoria Táctica Reciente (< 15 min)
    const cachedFixStr = localStorage.getItem('nicepod_last_known_fix');
    if (cachedFixStr) {
      try {
        const parsed: RawTelemetry = JSON.parse(cachedFixStr);
        const age = Date.now() - (parsed.timestamp || 0);
        if (age < CACHE_TTL_MS) {
          nicepodLog("💾 [Sensor-Authority] Hidratación por memoria táctica.");
          return { ...parsed, source: 'cache' };
        }
        localStorage.removeItem('nicepod_last_known_fix');
      } catch (e) {
        nicepodLog("⚠️ [Sensor-Authority] Fallo en lectura de caché.", null, 'warn');
      }
    }

    // 2. Prioridad: Paracaídas de Red (Geo-IP)
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

    // 3. Fallback: Madrid Sol (Último recurso)
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
  const hasGPSFixRef = useRef<boolean>(false);
  
  // Buffer para el Filtro de Media Vectorial (VAF)
  // Almacenamos los componentes Seno y Coseno para evitar errores de promedio en el Norte (0/360).
  const headingHistoryRef = useRef<{sin: number, cos: number}[]>([]);

  /**
   * getPurifiedHeading:
   * [FIX V5.3]: Sincronización de constante SMOOTHING_WINDOW_SIZE.
   * Transmuta el ruido del magnetómetro en un rumbo estable para la cámara.
   */
  const getPurifiedHeading = useCallback((rawHeading: number): number => {
    const rad = (rawHeading * Math.PI) / 180;
    
    // Inserción en el buffer circular de la Malla
    headingHistoryRef.current.push({ sin: Math.sin(rad), cos: Math.cos(rad) });
    if (headingHistoryRef.current.length > SMOOTHING_WINDOW_SIZE) {
      headingHistoryRef.current.shift();
    }

    // Cálculo de la resultante vectorial media
    const sumSin = headingHistoryRef.current.reduce((acc, val) => acc + val.sin, 0);
    const sumCos = headingHistoryRef.current.reduce((acc, val) => acc + val.cos, 0);
    
    const avgRad = Math.atan2(sumSin, sumCos);
    const avgDeg = (avgRad * 180) / Math.PI;
    
    // Normalización de rango (0 - 360)
    return (avgDeg + 360) % 360;
  }, []);

  /**
   * handleOrientation:
   * Captura el giro físico y aplica el filtro antes de actualizar la telemetría.
   */
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    // Soporte multiplataforma (iOS CompassHeading vs Android Alpha)
    const rawHeading = (event as any).webkitCompassHeading || (360 - (event.alpha || 0));
    
    if (rawHeading !== undefined && rawHeading !== null) {
      const purifiedHeading = getPurifiedHeading(rawHeading);
      
      setTelemetry(prev => {
        if (!prev) return null;
        // Throttling de renderizado: Ignoramos cambios menores a 0.2 grados para ahorrar CPU.
        if (prev.heading !== null && Math.abs(purifiedHeading - prev.heading) < 0.2) return prev;
        return { ...prev, heading: purifiedHeading };
      });
    }
  }, [getPurifiedHeading]);

  /**
   * killHardwareWatch:
   * Desconexión atómica de sensores y liberación del bus de datos.
   */
  const killHardwareWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("deviceorientation", handleOrientation);
    }
    if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
    
    isHardwareIgnitedRef.current = false;
    hasGPSFixRef.current = false;
    setIsAcquiring(false);
    nicepodLog("💤 [Sensor-Authority] Hardware liberado.");
  }, [handleOrientation]);

  /**
   * startHardwareWatch:
   * Ignición sincronizada de GPS de alta precisión y Magnetómetro.
   */
  const startHardwareWatch = useCallback(async () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;
    if (isHardwareIgnitedRef.current) return;
    
    isHardwareIgnitedRef.current = true;
    setIsAcquiring(true);

    // Protocolo de seguridad WebKit (iOS 13+) para Brújula
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          window.addEventListener("deviceorientation", handleOrientation, true);
        }
      } catch (e) {
        nicepodLog("⚠️ [Sensor-Authority] Permiso de magnetómetro denegado.", null, 'warn');
      }
    } else {
      window.addEventListener("deviceorientation", handleOrientation, true);
    }

    // Watchdog de Stall: Reinicia el cerrojo si el chip GPS no responde en 8s.
    if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
    watchdogTimerRef.current = setTimeout(() => {
      if (!hasGPSFixRef.current) {
        nicepodLog("🆘 [Sensor-Authority] GPS Stall detectado.");
        isHardwareIgnitedRef.current = false;
        setIsAcquiring(false);
      }
    }, WATCHDOG_THRESHOLD_MS);

    const onSignalSuccess = (pos: GeolocationPosition) => {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }

      // El rumbo del GPS es más preciso a alta velocidad (> 2m/s)
      const finalHeading = (pos.coords.speed && pos.coords.speed > 2 && pos.coords.heading !== null)
        ? pos.coords.heading
        : (telemetry?.heading || null);

      const freshTelemetry: RawTelemetry = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        heading: finalHeading,
        speed: pos.coords.speed,
        timestamp: pos.timestamp,
        source: 'gps'
      };

      hasGPSFixRef.current = true;
      setTelemetry(freshTelemetry);
      setIsAcquiring(false);
      localStorage.setItem('nicepod_last_known_fix', JSON.stringify(freshTelemetry));
    };

    const onSignalError = (error: GeolocationPositionError) => {
      if (error.code === error.PERMISSION_DENIED) {
        setIsDenied(true);
        killHardwareWatch();
      }
    };

    // Ignición Dual: Shot de Red (Rápido) + Watch Satelital (Preciso)
    navigator.geolocation.getCurrentPosition(onSignalSuccess, onSignalError, {
      enableHighAccuracy: false,
      timeout: 5000
    });

    watchIdRef.current = navigator.geolocation.watchPosition(onSignalSuccess, onSignalError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 25000
    });
  }, [handleOrientation, killHardwareWatch, telemetry?.heading]);

  const reSync = useCallback(() => {
    nicepodLog("🔄 [Sensor-Authority] Reiniciando autoridad física.");
    isHardwareIgnitedRef.current = false;
    startHardwareWatch();
  }, [startHardwareWatch]);

  // --- III. PROTOCOLOS PROACTIVOS (AUTO-IGNICIÓN Y VISIBILITY) ---

  useEffect(() => {
    if (typeof window !== "undefined" && "permissions" in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (result.state === 'granted') startHardwareWatch();
        result.onchange = () => { if (result.state === 'granted') startHardwareWatch(); };
      });
    }
  }, [startHardwareWatch]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isHardwareIgnitedRef.current) {
        if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        isHardwareIgnitedRef.current = false;
        startHardwareWatch();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [startHardwareWatch]);

  return {
    telemetry,
    isDenied,
    isAcquiring,
    isIgnited: isHardwareIgnitedRef.current,
    startHardwareWatch,
    killHardwareWatch,
    reSync
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.3):
 * 1. Bug Sanity Check: Se corrigió la referencia a SMOOTHING_WINDOW_SIZE, eliminando
 *    el error de compilación TS2552.
 * 2. Vectorial Resilience: La brújula ahora utiliza promedios vectoriales, 
 *    eliminando los movimientos laterales y ladeos erráticos de la cámara.
 * 3. Mobile Performance: El throttling de 0.2° reduce la carga del Main Thread
 *    al evitar re-renders innecesarios por ruido magnético despreciable.
 * 4. Production Ready: El archivo es un bloque íntegro listo para despliegue.
 */
