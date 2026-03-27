//hooks/use-sensor-authority.ts
/**
 * NICEPOD V5.0 - SENSOR AUTHORITY (PROACTIVE SENTINEL)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * El único punto de contacto con el silicio.
 * Misión: Captura pura de telemetría con Auto-Ignición y Watchdog de Rescate.
 */

"use client";

import { MADRID_SOL_COORDS } from "@/components/geo/map-constants";
import { nicepodLog } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * INTERFAZ: RawTelemetry
 * Contrato de verdad física capturada directamente del hardware.
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

interface SensorAuthorityProps {
  initialData?: { lat: number; lng: number; city: string; source: string; } | null;
}

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos de memoria táctica
const WATCHDOG_THRESHOLD_MS = 8000;  // 8 segundos para el Hardware Stall

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
  const hasGPSFixRef = useRef<boolean>(false);

  /**
   * killHardwareWatch:
   * Misión: Liberar recursos y resetear el cerrojo de hardware.
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
    nicepodLog("💤 [Sensor-Authority] Hardware GPS liberado.");
  }, []);

  /**
   * startHardwareWatch:
   * Misión: Ignición agresiva del GPS.
   */
  const startHardwareWatch = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      nicepodLog("🔥 [Sensor-Authority] Hardware GPS no disponible.", null, 'error');
      return;
    }

    if (isHardwareIgnitedRef.current) return;

    isHardwareIgnitedRef.current = true;
    setIsAcquiring(true);

    // Watchdog de Stall
    if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
    watchdogTimerRef.current = setTimeout(() => {
      if (!hasGPSFixRef.current) {
        nicepodLog("🆘 [Sensor-Authority] Hardware Stall detectado. Re-armando cerrojo.");
        isHardwareIgnitedRef.current = false;
        setIsAcquiring(false);
      }
    }, WATCHDOG_THRESHOLD_MS);

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
        nicepodLog("🛑 [Sensor-Authority] Permiso Denegado.", null, 'error');
        setIsDenied(true);
        killHardwareWatch();
      } else {
        nicepodLog(`🟡 [Sensor-Authority] Señal débil: ${error.message}`);
      }
    };

    // Ignición Dual: Get (Rápido) + Watch (Continuo)
    navigator.geolocation.getCurrentPosition(onSignalSuccess, onSignalError, {
      enableHighAccuracy: false,
      timeout: 5000
    });

    watchIdRef.current = navigator.geolocation.watchPosition(onSignalSuccess, onSignalError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 20000
    });
  }, [killHardwareWatch]);

  const reSync = useCallback(() => {
    nicepodLog("🔄 [Sensor-Authority] Forzando Re-Sincronía.");
    killHardwareWatch();
    startHardwareWatch();
  }, [killHardwareWatch, startHardwareWatch]);

  // --- III. PROTOCOLOS PROACTIVOS (AUTO-IGNICIÓN Y RESURRECCIÓN) ---

  /**
   * PROTOCOLO 1: Ignición Silenciosa (Permissions API)
   * Si el usuario ya dio permiso, el GPS arranca solo al montar el componente.
   */
  useEffect(() => {
    const checkPermissionAndStart = async () => {
      if (typeof window !== "undefined" && "permissions" in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          if (result.state === 'granted') {
            nicepodLog("⚡ [Sensor-Authority] Autoridad previa detectada. Ignición silenciosa.");
            startHardwareWatch();
          }

          // Escuchar cambios en permisos en tiempo real
          result.onchange = () => {
            if (result.state === 'granted') startHardwareWatch();
            if (result.state === 'denied') setIsDenied(true);
          };
        } catch (e) {
          // Algunos navegadores no soportan query para geolocation
          nicepodLog("ℹ️ [Sensor-Authority] No se pudo interrogar permisos. Esperando gesto.");
        }
      }
    };

    checkPermissionAndStart();
  }, [startHardwareWatch]);

  /**
   * PROTOCOLO 2: Resurrección por Foco (Visibility API)
   * Si la app vuelve de segundo plano, refrescamos el sensor para evitar datos estancados.
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isHardwareIgnitedRef.current) {
        nicepodLog("👁️ [Sensor-Authority] Voyager ha vuelto. Refrescando sensor.");
        // Reset silencioso: clear y start sin cambiar estado de UI
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
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Proactive Silent Ignition: Se acabó la espera. Si el permiso existe, el GPS nace con la app.
 * 2. Visibility Sync: El sistema es consciente de cuándo el usuario mira o no la pantalla.
 * 3. Singleton Guard: El cerrojo isHardwareIgnitedRef protege el bus de datos del móvil.
 * 4. T0 Hydration: Mantiene la jerarquía Cache -> IP -> Default para Zero-Wait UI.
 */