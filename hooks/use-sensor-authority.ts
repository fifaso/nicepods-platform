/**
 * ARCHIVO: hooks/use-sensor-authority.ts
 * VERSIÓN: 7.3 (NicePod Sensor Authority - Concurrent Auto-Sincro Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Gobernar el enlace físico con el chip de posicionamiento global y el compás 
 * magnetométrico, proveyendo un bus de datos de latencia cero y garantizando la 
 * idempotencia del hardware ante peticiones de auto-ignición concurrentes.
 * [REFORMA V7.3]: Implementación del 'Hardware Idempotency Protocol'. Se blinda el 
 * inicio de 'watchPosition' para evitar duplicidad de hilos durante la ignición 
 * proactiva del sistema. Sincronización nominal absoluta (ZAP) y BSS total.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { nicepodLog } from "@/lib/utils";
import { TelemetrySource, UserLocation } from "@/types/geo-sovereignty";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * ---------------------------------------------------------------------------
 * I. GESTOR GLOBAL DE SILICIO (GEODETIC HARDWARE GLOBAL MANAGER)
 * ---------------------------------------------------------------------------
 * Misión: Singleton de memoria física para persistir el enlace satelital.
 */
interface GlobalHardwareState {
  activeWatchIdentification: number | null;
  lastKnownTelemetry: UserLocation | null;
  isIgnited: boolean;
  reactSubscribersCollection: Set<(telemetry: UserLocation) => void>;
  kineticSignalBus: EventTarget;
}

const geodeticHardwareGlobalManager: GlobalHardwareState = {
  activeWatchIdentification: null,
  lastKnownTelemetry: null,
  isIgnited: false,
  reactSubscribersCollection: new Set(),
  kineticSignalBus: new EventTarget()
};

/**
 * CONSTANTE: GEODETIC_KINETIC_SIGNAL_EVENT_NAME
 */
export const GEODETIC_KINETIC_SIGNAL_EVENT_NAME = "nicepod_kinetic_telemetry_pulse";

/**
 * CONFIGURACIÓN DE GOBERNANZA INDUSTRIAL
 */
const CACHE_TIME_TO_LIVE_MILLISECONDS = 15 * 60 * 1000;
const HARDWARE_WATCHDOG_THRESHOLD_MILLISECONDS = 8000;
const BASE_SMOOTHING_WINDOW_SIZE = 12;
const VELOCITY_THRESHOLD_FOR_ADAPTIVE_SMOOTHING = 2.0;

interface SensorAuthorityProperties {
  initialData?: {
    latitudeCoordinate: number;
    longitudeCoordinate: number;
    cityName: string;
    geographicSource: string;
  } | null;
}

/**
 * HOOK: useSensorAuthority
 */
export function useSensorAuthority({ initialData }: SensorAuthorityProperties = {}) {

  // --- I. ESTADO REACTIVO LOCAL (TRUTH STREAM) ---
  const [telemetry, setTelemetry] = useState<UserLocation | null>(() => {
    // 1. Prioridad: Continuidad de sesión global.
    if (geodeticHardwareGlobalManager.lastKnownTelemetry) {
      return geodeticHardwareGlobalManager.lastKnownTelemetry;
    }

    // 2. Prioridad: Semilla T0 (Edge-IP) para nacimiento instantáneo.
    if (initialData) {
      const geodeticSeed: UserLocation = {
        latitudeCoordinate: initialData.latitudeCoordinate,
        longitudeCoordinate: initialData.longitudeCoordinate,
        accuracyMeters: 1000,
        headingDegrees: null,
        speedMetersPerSecond: null,
        geographicSource: initialData.geographicSource as TelemetrySource,
        timestamp: Date.now()
      };
      geodeticHardwareGlobalManager.lastKnownTelemetry = geodeticSeed;
      return geodeticSeed;
    }
    return null;
  });

  const [isHardwareAccessDenied, setIsHardwareAccessDenied] = useState<boolean>(false);
  const [isAcquiringHardwareFix, setIsAcquiringHardwareFix] = useState<boolean>(false);

  // --- II. MEMORIA TÁCTICA (MUTABLE REFERENCES) ---
  const watchdogTimerReference = useRef<NodeJS.Timeout | null>(null);
  const hasGlobalPositioningSystemFixReference = useRef<boolean>(false);
  const headingVectorHistoryReference = useRef<{ sine: number, cosine: number }[]>([]);

  const getPurifiedHeadingDegrees = useCallback((rawHeadingDegrees: number, currentSpeedMetersPerSecond: number | null): number => {
    const headingRadians = (rawHeadingDegrees * Math.PI) / 180;
    const effectiveWindowSize = (currentSpeedMetersPerSecond && currentSpeedMetersPerSecond > VELOCITY_THRESHOLD_FOR_ADAPTIVE_SMOOTHING)
      ? Math.floor(BASE_SMOOTHING_WINDOW_SIZE / 2)
      : BASE_SMOOTHING_WINDOW_SIZE;

    headingVectorHistoryReference.current.push({
      sine: Math.sin(headingRadians),
      cosine: Math.cos(headingRadians)
    });

    if (headingVectorHistoryReference.current.length > effectiveWindowSize) {
      headingVectorHistoryReference.current.shift();
    }

    const sumSine = headingVectorHistoryReference.current.reduce((accumulator, value) => accumulator + value.sine, 0);
    const sumCosine = headingVectorHistoryReference.current.reduce((accumulator, value) => accumulator + value.cosine, 0);

    const averageRadians = Math.atan2(sumSine, sumCosine);
    const averageDegrees = (averageRadians * 180) / Math.PI;

    return (averageDegrees + 360) % 360;
  }, []);

  /**
   * killHardwareWatch:
   * Misión: Purga física de hilos y liberación del bus de datos satelital.
   */
  const killHardwareWatch = useCallback(() => {
    if (geodeticHardwareGlobalManager.activeWatchIdentification !== null) {
      navigator.geolocation.clearWatch(geodeticHardwareGlobalManager.activeWatchIdentification);
      geodeticHardwareGlobalManager.activeWatchIdentification = null;
    }

    if (watchdogTimerReference.current) {
      clearTimeout(watchdogTimerReference.current);
    }

    geodeticHardwareGlobalManager.isIgnited = false;
    hasGlobalPositioningSystemFixReference.current = false;
    setIsAcquiringHardwareFix(false);
    nicepodLog("💤 [Sensor-Authority] Hardware liberado atómicamente.");
  }, []);

  /**
   * startHardwareWatch:
   * Misión: Ignición del chip GPS con protección de concurrencia.
   */
  const startHardwareWatch = useCallback(async () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;

    /**
     * [IDEMPOTENCIA V7.3]: 
     * Si ya existe un identificador de seguimiento activo, abortamos la nueva 
     * petición para evitar la saturación del bus del sistema operativo.
     */
    if (geodeticHardwareGlobalManager.activeWatchIdentification !== null || geodeticHardwareGlobalManager.isIgnited) {
      return;
    }

    geodeticHardwareGlobalManager.isIgnited = true;
    setIsAcquiringHardwareFix(true);

    if (watchdogTimerReference.current) {
      clearTimeout(watchdogTimerReference.current);
    }

    watchdogTimerReference.current = setTimeout(() => {
      if (!hasGlobalPositioningSystemFixReference.current) {
        geodeticHardwareGlobalManager.isIgnited = false;
        setIsAcquiringHardwareFix(false);
        nicepodLog("⚠️ [Sensor-Authority] Latencia de hardware detectada.");
      }
    }, HARDWARE_WATCHDOG_THRESHOLD_MILLISECONDS);

    const handleSignalSuccessAction = (position: GeolocationPosition) => {
      if (watchdogTimerReference.current) {
        clearTimeout(watchdogTimerReference.current);
        watchdogTimerReference.current = null;
      }

      const authoritativeHeadingDegrees = (position.coords.speed && position.coords.speed > VELOCITY_THRESHOLD_FOR_ADAPTIVE_SMOOTHING && position.coords.heading !== null)
        ? getPurifiedHeadingDegrees(position.coords.heading, position.coords.speed)
        : (geodeticHardwareGlobalManager.lastKnownTelemetry?.headingDegrees || null);

      const freshTelemetryFix: UserLocation = {
        latitudeCoordinate: position.coords.latitude,
        longitudeCoordinate: position.coords.longitude,
        accuracyMeters: position.coords.accuracy,
        headingDegrees: authoritativeHeadingDegrees,
        speedMetersPerSecond: position.coords.speed,
        timestamp: position.timestamp,
        geographicSource: 'global-positioning-system' as TelemetrySource
      };

      hasGlobalPositioningSystemFixReference.current = true;
      geodeticHardwareGlobalManager.lastKnownTelemetry = freshTelemetryFix;

      // Despacho multicanal (MTI Architecture)
      geodeticHardwareGlobalManager.kineticSignalBus.dispatchEvent(
        new CustomEvent(GEODETIC_KINETIC_SIGNAL_EVENT_NAME, { detail: freshTelemetryFix })
      );

      geodeticHardwareGlobalManager.reactSubscribersCollection.forEach(callback => callback(freshTelemetryFix));

      setIsAcquiringHardwareFix(false);
      localStorage.setItem('nicepod_last_known_geographic_fix', JSON.stringify(freshTelemetryFix));
    };

    const handleSignalErrorAction = (operationalHardwareException: GeolocationPositionError) => {
      if (operationalHardwareException.code === operationalHardwareException.PERMISSION_DENIED) {
        setIsHardwareAccessDenied(true);
        killHardwareWatch();
      }
    };

    geodeticHardwareGlobalManager.activeWatchIdentification = navigator.geolocation.watchPosition(
      handleSignalSuccessAction,
      handleSignalErrorAction,
      { enableHighAccuracy: true, maximumAge: 0, timeout: 25000 }
    );
  }, [killHardwareWatch, getPurifiedHeadingDegrees]);

  /**
   * EFECTO: SISTEMA DE SUSCRIPCIÓN GLOBAL (SSS)
   */
  useEffect(() => {
    const updateLocalTelemetryAction = (newTelemetry: UserLocation) => {
      setTelemetry(newTelemetry);
    };

    geodeticHardwareGlobalManager.reactSubscribersCollection.add(updateLocalTelemetryAction);

    if (geodeticHardwareGlobalManager.lastKnownTelemetry) {
      setTelemetry(geodeticHardwareGlobalManager.lastKnownTelemetry);
    }

    return () => {
      geodeticHardwareGlobalManager.reactSubscribersCollection.delete(updateLocalTelemetryAction);
    };
  }, []);

  /**
   * EFECTO: PROTOCOLO DE HIDRATACIÓN POR CACHÉ
   */
  useEffect(() => {
    if (!telemetry && typeof window !== "undefined") {
      const cachedGeographicFixString = localStorage.getItem('nicepod_last_known_geographic_fix');
      if (cachedGeographicFixString) {
        try {
          const parsedTelemetry: UserLocation = JSON.parse(cachedGeographicFixString);
          const geographicFixAgeMagnitude = Date.now() - (parsedTelemetry.timestamp || 0);

          if (geographicFixAgeMagnitude < CACHE_TIME_TO_LIVE_MILLISECONDS) {
            setTelemetry({ ...parsedTelemetry, geographicSource: 'cache' as TelemetrySource });
          }
        } catch (exception) {
          localStorage.removeItem('nicepod_last_known_geographic_fix');
        }
      }
    }
  }, [telemetry]);

  return {
    telemetry,
    kineticSignalBus: geodeticHardwareGlobalManager.kineticSignalBus,
    isDenied: isHardwareAccessDenied,
    isAcquiring: isAcquiringHardwareFix,
    isIgnited: geodeticHardwareGlobalManager.isIgnited,
    startHardwareWatch,
    killHardwareWatch,
    reSync: () => {
      killHardwareWatch();
      startHardwareWatch();
    }
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V7.3):
 * 1. Hardware Idempotency: Se ha blindado 'startHardwareWatch' para evitar que 
 *    múltiples llamadas proactivas (Auto-Ignition) generen hilos duplicados.
 * 2. T0/HD Synchronization: El Singleton global se sincroniza con la Semilla T0 
 *    desde el nacimiento, asegurando que no haya parpadeos de ubicación.
 * 3. ZAP Absolute Compliance: Purificación total de descriptores técnicos: 
 *    'isHookMounted' -> 'isProviderMounted' (no presente aquí pero verificado en contexto).
 */