/**
 * ARCHIVO: hooks/use-sensor-authority.ts
 * VERSIÓN: 7.1 (NicePod Sensor Authority - T0 Instant Hydration & Elastic Stability Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Gobernar el enlace físico con el chip de posicionamiento global y el compás 
 * magnetométrico, actuando como la fuente única de verdad (SSoT) para la plataforma.
 * [REFORMA V7.1]: Implementación del Protocolo de Hidratación Instantánea. Se elimina 
 * el retardo de inicialización inyectando la Semilla T0 (Edge-IP) directamente en el 
 * estado inicial de React. Purificación absoluta de la Zero Abbreviations Policy (ZAP)
 * y blindaje del Build Shield (BSS) en las interfaces de entrada.
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
 * Misión: Persistir el estado del hardware fuera del árbol de componentes de React 
 * para evitar la redundancia de peticiones al Sistema Operativo y permitir la 
 * persistencia de la ubicación entre cambios de ruta.
 */
interface GlobalHardwareState {
  activeWatchIdentification: number | null;
  lastKnownTelemetry: UserLocation | null;
  isIgnited: boolean;
  subscribersCollection: Set<(telemetry: UserLocation) => void>;
}

const geodeticHardwareGlobalManager: GlobalHardwareState = {
  activeWatchIdentification: null,
  lastKnownTelemetry: null,
  isIgnited: false,
  subscribersCollection: new Set()
};

/**
 * CONFIGURACIÓN DE GOBERNANZA INDUSTRIAL
 */
const CACHE_TIME_TO_LIVE_MILLISECONDS = 15 * 60 * 1000;
const HARDWARE_WATCHDOG_THRESHOLD_MILLISECONDS = 8000;
const BASE_SMOOTHING_WINDOW_SIZE = 12;
const VELOCITY_THRESHOLD_FOR_ADAPTIVE_SMOOTHING = 2.0;

/**
 * INTERFAZ: SensorAuthorityProperties
 * [MANDATO ZAP]: Propiedades expandidas para cumplir con la soberanía nominal.
 */
interface SensorAuthorityProperties {
  /** initialData: Semilla de ubicación inyectada por el Middleware de Borde (T0). */
  initialData?: {
    latitudeCoordinate: number;
    longitudeCoordinate: number;
    cityName: string;
    geographicSource: string;
  } | null;
}

/**
 * HOOK: useSensorAuthority
 * Interfaz de software autorizada para el diálogo con los sensores físicos del dispositivo.
 */
export function useSensorAuthority({ initialData }: SensorAuthorityProperties = {}) {

  // --- I. ESTADO REACTIVO LOCAL CON HIDRATACIÓN INSTANTÁNEA ---
  const [telemetry, setTelemetry] = useState<UserLocation | null>(() => {
    // 1. Prioridad Máxima: Telemetría ya activa en el Singleton Global (Continuidad).
    if (geodeticHardwareGlobalManager.lastKnownTelemetry) {
      return geodeticHardwareGlobalManager.lastKnownTelemetry;
    }

    // 2. Prioridad Secundaria: Semilla T0 inyectada por el Middleware (Materialización Instantánea).
    if (initialData) {
      const geodeticSeed: UserLocation = {
        latitudeCoordinate: initialData.latitudeCoordinate,
        longitudeCoordinate: initialData.longitudeCoordinate,
        accuracyMeters: 1000, // Magnitud de incertidumbre inicial para ubicación por IP.
        headingDegrees: null,
        speedMetersPerSecond: null,
        geographicSource: initialData.geographicSource as TelemetrySource,
        timestamp: Date.now()
      };

      // Sincronizamos el Singleton para que futuros consumidores hereden la semilla.
      geodeticHardwareGlobalManager.lastKnownTelemetry = geodeticSeed;
      return geodeticSeed;
    }

    return null;
  });

  const [isHardwareAccessDenied, setIsHardwareAccessDenied] = useState<boolean>(false);
  const [isAcquiringHardwareFix, setIsAcquiringHardwareFix] = useState<boolean>(false);

  // --- II. MEMORIA TÁCTICA (MUTABLE REFERENCES - PILAR 4) ---
  const watchdogTimerReference = useRef<NodeJS.Timeout | null>(null);
  const hasGlobalPositioningSystemFixReference = useRef<boolean>(false);
  const headingVectorHistoryReference = useRef<{ sine: number, cosine: number }[]>([]);

  /**
   * getPurifiedHeadingDegrees:
   * Misión: Filtrado vectorial VAF (Vector Average Filter) consciente de la dinámica.
   */
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
   * Misión: Desconexión física y liberación del bus de datos satelital (Hardware Hygiene).
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
   * Misión: Ignición única de sensores. Implementa la lógica de Singleton Geodésico.
   */
  const startHardwareWatch = useCallback(async () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;

    if (geodeticHardwareGlobalManager.isIgnited) {
      nicepodLog("🔌 [Sensor-Authority] Acoplamiento exitoso a instancia de hardware activa.");
      return;
    }

    geodeticHardwareGlobalManager.isIgnited = true;
    setIsAcquiringHardwareFix(true);

    if (watchdogTimerReference.current) clearTimeout(watchdogTimerReference.current);
    watchdogTimerReference.current = setTimeout(() => {
      if (!hasGlobalPositioningSystemFixReference.current) {
        geodeticHardwareGlobalManager.isIgnited = false;
        setIsAcquiringHardwareFix(false);
        nicepodLog("⚠️ [Sensor-Authority] Watchdog: Latencia de hardware detectada.");
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

      // Propagación de señal a todos los suscriptores activos del Singleton.
      geodeticHardwareGlobalManager.subscribersCollection.forEach(callback => callback(freshTelemetryFix));

      setIsAcquiringHardwareFix(false);
      localStorage.setItem('nicepod_last_known_geographic_fix', JSON.stringify(freshTelemetryFix));
    };

    const handleSignalErrorAction = (operationalHardwareException: GeolocationPositionError) => {
      if (operationalHardwareException.code === operationalHardwareException.PERMISSION_DENIED) {
        setIsHardwareAccessDenied(true);
        killHardwareWatch();
      }
      nicepodLog("🔥 [Sensor-Authority] Excepción de hardware:", operationalHardwareException.message, 'error');
    };

    geodeticHardwareGlobalManager.activeWatchIdentification = navigator.geolocation.watchPosition(
      handleSignalSuccessAction,
      handleSignalErrorAction,
      { enableHighAccuracy: true, maximumAge: 0, timeout: 25000 }
    );
  }, [killHardwareWatch, getPurifiedHeadingDegrees]);

  /**
   * EFECTO: SISTEMA DE SUSCRIPCIÓN GLOBAL
   * Misión: Mantener el estado local sincronizado con el Gestor Global (SSS).
   */
  useEffect(() => {
    const updateLocalTelemetryAction = (newTelemetry: UserLocation) => {
      setTelemetry(newTelemetry);
    };

    geodeticHardwareGlobalManager.subscribersCollection.add(updateLocalTelemetryAction);

    // Si el gestor global ya posee telemetría HD de otra ruta, la absorbemos.
    if (geodeticHardwareGlobalManager.lastKnownTelemetry) {
      setTelemetry(geodeticHardwareGlobalManager.lastKnownTelemetry);
    }

    return () => {
      geodeticHardwareGlobalManager.subscribersCollection.delete(updateLocalTelemetryAction);
    };
  }, []);

  /**
   * EFECTO: PROTOCOLO DE HIDRATACIÓN POR CACHÉ (FALLBACK)
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
 * NOTA TÉCNICA DEL ARCHITECT (V7.1):
 * 1. T0 Instant Hydration: Se ha modificado el 'useState' para inyectar la semilla 
 *    del Middleware en el primer frame, erradicando el loop de carga en Dashboard.
 * 2. ZAP Enforcement: Se purificó la interfaz 'initialData' eliminando lat/lng 
 *    en favor de 'latitudeCoordinate' y 'longitudeCoordinate'.
 * 3. Atomic Lock Resilience: El Singleton global ahora protege la ubicación 
 *    incluso ante micro-desconexiones del bus del GPS.
 */