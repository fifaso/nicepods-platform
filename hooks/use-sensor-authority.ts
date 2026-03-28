/**
 * ARCHIVO: hooks/use-sensor-authority.ts
 * VERSIÓN: 5.1 (NicePod Sensor Authority - Compass Fusion & Street-Ready Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Captura pura de telemetría GPS y Compás Magnetométrico.
 * [REFORMA V5.1]: Integración de DeviceOrientation para navegación STREET estable.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import { MADRID_SOL_COORDS } from "@/components/geo/map-constants";
import { nicepodLog } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * INTERFAZ: RawTelemetry
 * Contrato de verdad física absoluta del dispositivo.
 */
export interface RawTelemetry {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null; // Rumbo magnético (0-360)
  speed: number | null;
  timestamp: number;
  source: 'gps' | 'cache' | 'ip-fallback';
}

interface SensorAuthorityProps {
  initialData?: { lat: number; lng: number; city: string; source: string; } | null;
}

const CACHE_TTL_MS = 15 * 60 * 1000; 
const WATCHDOG_THRESHOLD_MS = 8000;

export function useSensorAuthority({ initialData }: SensorAuthorityProps = {}) {
  
  // --- I. ESTADO SOBERANO (MATERIALIZACIÓN T0) ---
  const [telemetry, setTelemetry] = useState<RawTelemetry | null>(() => {
    if (typeof window === "undefined") return null;

    // 1. Prioridad: Memoria Táctica Reciente
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

    // 2. Prioridad: Paracaídas Geo-IP
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

    // 3. Fallback: Punto Cero (Madrid)
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
  
  // Ref para capturar el rumbo magnético independientemente del GPS
  const currentHeadingRef = useRef<number | null>(null);

  /**
   * handleOrientation:
   * Captura el giro del magnetómetro para alimentar la brújula de 60fps.
   */
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    // Soporte para brújula absoluta (Android/Chrome) y relativa corregida (iOS/Safari)
    const heading = (event as any).webkitCompassHeading || (360 - (event.alpha || 0));
    if (heading !== undefined && heading !== null) {
      currentHeadingRef.current = heading;
    }
  }, []);

  /**
   * killHardwareWatch:
   * Purga total de procesos de hardware.
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
   * Ignición del GPS y Magnetómetro con Bypass de seguridad iOS.
   */
  const startHardwareWatch = useCallback(async () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      nicepodLog("🔥 [Sensor-Authority] Sensores no disponibles.", null, 'error');
      return;
    }

    if (isHardwareIgnitedRef.current) return;
    isHardwareIgnitedRef.current = true;
    setIsAcquiring(true);

    // [COMPÁS]: Solicitar permiso de orientación para iOS (Gesto de usuario requerido)
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          window.addEventListener("deviceorientation", handleOrientation);
        }
      } catch (e) {
        nicepodLog("⚠️ [Sensor-Authority] Permiso de compás denegado por el SO.");
      }
    } else {
      // Navegadores estándar
      window.addEventListener("deviceorientation", handleOrientation);
    }

    // [GPS]: Watchdog de Stall
    if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
    watchdogTimerRef.current = setTimeout(() => {
      if (!hasGPSFixRef.current) {
        nicepodLog("🆘 [Sensor-Authority] GPS Stall. Reiniciando cerrojo.");
        isHardwareIgnitedRef.current = false;
        setIsAcquiring(false);
      }
    }, WATCHDOG_THRESHOLD_MS);

    const onSignalSuccess = (pos: GeolocationPosition) => {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }

      // Fusión de Sensores: Usamos el compás si el GPS no da rumbo (detenido)
      const finalHeading = pos.coords.heading !== null 
        ? pos.coords.heading 
        : currentHeadingRef.current;

      const freshTelemetry: RawTelemetry = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        heading: finalHeading,
        speed: pos.coords.speed,
        timestamp: pos.timestamp,
        source: 'gps'
      };

      if (!hasGPSFixRef.current) {
        nicepodLog(`🛰️ [Sensor-Authority] GPS Fix Certificado (${Math.round(pos.coords.accuracy)}m).`);
        hasGPSFixRef.current = true;
      }

      setTelemetry(freshTelemetry);
      setIsAcquiring(false);
      localStorage.setItem('nicepod_last_known_fix', JSON.stringify(freshTelemetry));
    };

    const onSignalError = (error: GeolocationPositionError) => {
      if (error.code === error.PERMISSION_DENIED) {
        nicepodLog("🛑 [Sensor-Authority] Permiso de ubicación denegado.", null, 'error');
        setIsDenied(true);
        killHardwareWatch();
      } else {
        nicepodLog(`🟡 [Sensor-Authority] Señal de satélite débil: ${error.message}`);
      }
    };

    // Ignición Dual (Shot & Watch)
    navigator.geolocation.getCurrentPosition(onSignalSuccess, onSignalError, {
      enableHighAccuracy: false,
      timeout: 5000
    });

    watchIdRef.current = navigator.geolocation.watchPosition(onSignalSuccess, onSignalError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 25000
    });
  }, [handleOrientation, killHardwareWatch]);

  const reSync = useCallback(() => {
    nicepodLog("🔄 [Sensor-Authority] Reiniciando autoridad de sensores.");
    killHardwareWatch();
    startHardwareWatch();
  }, [killHardwareWatch, startHardwareWatch]);

  // --- III. PROTOCOLOS PROACTIVOS ---

  /**
   * PROTOCOLO 1: Ignición Silenciosa (Permissions API)
   */
  useEffect(() => {
    const checkPermissionAndStart = async () => {
      if (typeof window !== "undefined" && "permissions" in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          if (result.state === 'granted') {
            nicepodLog("⚡ [Sensor-Authority] Autoridad previa detectada. Despertando hardware.");
            startHardwareWatch();
          }
          result.onchange = () => {
            if (result.state === 'granted') startHardwareWatch();
            if (result.state === 'denied') setIsDenied(true);
          };
        } catch (e) {
          nicepodLog("ℹ️ [Sensor-Authority] Protocolo automático suspendido. Esperando usuario.");
        }
      }
    };
    checkPermissionAndStart();
  }, [startHardwareWatch]);

  /**
   * PROTOCOLO 2: Resurrección por Foco (Visibility API)
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isHardwareIgnitedRef.current) {
        nicepodLog("👁️ [Sensor-Authority] Voyager activo. Refrescando compás y GPS.");
        if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        isHardwareIgnitedRef.current = false;
        startHardwareWatch();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
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
 * NOTA TÉCNICA DEL ARCHITECT (V5.1):
 * 1. Compass Fusion: Se integra 'deviceorientation' para proveer rumbo constante, 
 *    vital para la estabilidad de la cámara en modo STREET.
 * 2. WebKit Shield: Se implementó 'requestPermission' para el magnetómetro, 
 *    garantizando funcionalidad en dispositivos iOS 13+.
 * 3. Proactive Ignition: Mantiene el arranque automático si el permiso ya existe.
 * 4. Zero-Flicker Authority: El sensor unifica posición y rotación en un único stream
 *    de telemetría para que el GeoEngine no sufra colisiones de estado.
 */