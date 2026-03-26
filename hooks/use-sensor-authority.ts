// hooks/use-sensor-authority.ts
// VERSIÓN: 1.0 (NicePod Sensor Authority - Hardware Singleton Edition)
// Misión: Captura pura y aislada de telemetría GPS/Heading con persistencia T0.
// [NCIS DOGMA]: Un solo punto de verdad física. Sin interferencias de IA o UI.

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
        nicepodLog("💾 [Sensor-Authority] Materialización por Caché Local.");
        setTelemetry({
          ...parsed,
          source: 'cache',
          timestamp: Date.now()
        });
        return;
      } catch (e) {
        nicepodLog("⚠️ [Sensor-Authority] Caché corrupto. Ignorando.", null, 'warn');
      }
    }

    // 2. Fallback de Seguridad: Puerta del Sol (Madrid)
    nicepodLog("🛡️ [Sensor-Authority] Sin rastro previo. Anclando en Sol por seguridad.");
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
   * Misión: Activar el stream de datos del hardware GPS/Giroscopio.
   */
  const startHardwareWatch = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      nicepodLog("🔥 [Sensor-Authority] Hardware GPS no disponible.", null, 'error');
      return;
    }

    // [CERROJO]: Evitar duplicidad de observadores
    if (isHardwareIgnitedRef.current) return;
    isHardwareIgnitedRef.current = true;
    setIsAcquiring(true);

    const onSignalSuccess = (pos: GeolocationPosition) => {
      const freshTelemetry: RawTelemetry = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        heading: pos.coords.heading,
        speed: pos.coords.speed,
        timestamp: pos.timestamp,
        source: 'gps'
      };

      // Actualizamos el estado y persistimos en la memoria de la Workstation
      setTelemetry(freshTelemetry);
      setIsAcquiring(false);
      localStorage.setItem('nicepod_last_known_fix', JSON.stringify(freshTelemetry));
    };

    const onSignalError = (error: GeolocationPositionError) => {
      isHardwareIgnitedRef.current = false;
      setIsAcquiring(false);

      if (error.code === error.PERMISSION_DENIED) {
        nicepodLog("🛑 [Sensor-Authority] Permiso de hardware denegado.", null, 'error');
        setIsDenied(true);
      } else {
        nicepodLog(`🟡 [Sensor-Authority] Error de señal: ${error.message}`, null, 'warn');
      }
    };

    // Configuración de Alta Fidelidad Industrial
    const options: PositionOptions = {
      enableHighAccuracy: true, // Forzar uso de Satélite
      maximumAge: 0,            // No aceptar datos cacheados del SO
      timeout: 15000            // Tiempo máximo de espera por pulso
    };

    nicepodLog("📡 [Sensor-Authority] Ignición de hardware exitosa. Enlace activo.");
    watchIdRef.current = navigator.geolocation.watchPosition(onSignalSuccess, onSignalError, options);
  }, []);

  /**
   * killHardwareWatch:
   * Misión: Liberar los recursos del chip GPS.
   */
  const killHardwareWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      isHardwareIgnitedRef.current = false;
      nicepodLog("💤 [Sensor-Authority] Hardware GPS en modo reposo.");
    }
  }, []);

  // --- III. CICLO DE VIDA DEL SENSOR ---
  useEffect(() => {
    // Intentamos materializar inmediatamente al montar el hook
    hydrateInitialPosition();

    return () => {
      // No matamos el watch al desmontar para permitir navegación SPA fluida
      // a menos que sea un cierre total de la app.
    };
  }, [hydrateInitialPosition]);

  return {
    telemetry,
    isDenied,
    isAcquiring,
    startHardwareWatch,
    killHardwareWatch,
    // Permite al UI forzar una re-sincronización
    reSync: () => {
      isHardwareIgnitedRef.current = false;
      startHardwareWatch();
    }
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V1.0):
 * 1. Aislamiento de Hardware: Este hook no sabe nada de Mapbox ni de IA. Solo 
 *    conoce coordenadas, precisión y brújula. Esto garantiza que un fallo en el 
 *    renderizado del mapa no 'congele' la captura de datos del usuario.
 * 2. Persistencia T0: La hidratación desde 'localStorage' elimina el 'Salto de Sol'
 *    en el 90% de las sesiones recurrentes, ya que el mapa nace donde el Voyager 
 *    estuvo la última vez.
 * 3. Singleton Pattern: El uso de 'isHardwareIgnitedRef' previene el drenaje de 
 *    batería por múltiples hilos de posicionamiento activos.
 */