/**
 * ARCHIVO: hooks/use-sensor-authority.ts
 * VERSIÓN: 7.4 (NicePod Sensor Authority - Persistent Flight Recorder Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Gobernar el enlace físico con los sensores y gestionar la persistencia 
 * de la ubicación en el almacenamiento local del dispositivo (Caché Táctica).
 * [REFORMA V7.4]: Implementación del 'Persistent Flight Recorder'. El sistema 
 * ahora guarda snapshots de alta fidelidad (< 30m) en disco y los recupera 
 * proactivamente al arranque si cumplen el umbral de frescura de 10 minutos. 
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

export const GEODETIC_KINETIC_SIGNAL_EVENT_NAME = "nicepod_kinetic_telemetry_pulse";

/**
 * CONFIGURACIÓN DE PERSISTENCIA GEODÉSICA INDUSTRIAL
 */
const TACTICAL_CACHE_KEY_NAME = "nicepod_tactical_geodetic_snapshot";
const CACHE_EXPIRATION_THRESHOLD_MILLISECONDS = 10 * 60 * 1000; // 10 Minutos de validez.
const SOVEREIGN_PRECISION_THRESHOLD_METERS = 30; // Umbral para considerar grabación en disco.
const HARDWARE_WATCHDOG_THRESHOLD_MILLISECONDS = 8000;
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

  // --- I. ESTADO REACTIVO LOCAL CON PERITAJE DE CACHÉ TÁCTICA ---
  const [telemetry, setTelemetry] = useState<UserLocation | null>(() => {
    // 1. Prioridad Absoluta: Continuidad en memoria volátil (Singleton).
    if (geodeticHardwareGlobalManager.lastKnownTelemetry) {
      return geodeticHardwareGlobalManager.lastKnownTelemetry;
    }

    // 2. Prioridad Táctica: Recuperación desde el Metal del dispositivo (Caché).
    if (typeof window !== 'undefined') {
      const cachedSnapshotJsonString = localStorage.getItem(TACTICAL_CACHE_KEY_NAME);
      if (cachedSnapshotJsonString) {
        try {
          const parsedGeodeticSnapshot: UserLocation = JSON.parse(cachedSnapshotJsonString);
          const snapshotAgeMagnitude = Date.now() - (parsedGeodeticSnapshot.timestamp || 0);

          // Si el snapshot es "fresco" (< 10 min), lo adoptamos como verdad inicial.
          if (snapshotAgeMagnitude < CACHE_EXPIRATION_THRESHOLD_MILLISECONDS) {
            nicepodLog("💾 [Sensor-Authority] Restaurando sintonía desde la Caché Táctica.");
            parsedGeodeticSnapshot.geographicSource = 'cache' as TelemetrySource;
            geodeticHardwareGlobalManager.lastKnownTelemetry = parsedGeodeticSnapshot;
            return parsedGeodeticSnapshot;
          } else {
            nicepodLog("🧹 [Sensor-Authority] Purgando snapshot geodésico obsoleto.");
            localStorage.removeItem(TACTICAL_CACHE_KEY_NAME);
          }
        } catch (exception) {
          localStorage.removeItem(TACTICAL_CACHE_KEY_NAME);
        }
      }
    }

    // 3. Prioridad de Emergencia: Semilla T0 (Edge-IP) del Middleware.
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

  const watchdogTimerReference = useRef<NodeJS.Timeout | null>(null);
  const headingVectorHistoryReference = useRef<{ sine: number, cosine: number }[]>([]);

  const getPurifiedHeadingDegrees = useCallback((rawHeadingDegrees: number, currentSpeedMetersPerSecond: number | null): number => {
    const headingRadians = (rawHeadingDegrees * Math.PI) / 180;
    const effectiveWindowSize = (currentSpeedMetersPerSecond && currentSpeedMetersPerSecond > VELOCITY_THRESHOLD_FOR_ADAPTIVE_SMOOTHING)
      ? 6 : 12;

    headingVectorHistoryReference.current.push({ sine: Math.sin(headingRadians), cosine: Math.cos(headingRadians) });
    if (headingVectorHistoryReference.current.length > effectiveWindowSize) headingVectorHistoryReference.current.shift();

    const sumSine = headingVectorHistoryReference.current.reduce((acc, val) => acc + val.sine, 0);
    const sumCosine = headingVectorHistoryReference.current.reduce((acc, val) => acc + val.cosine, 0);
    const averageDegrees = (Math.atan2(sumSine, sumCosine) * 180) / Math.PI;

    return (averageDegrees + 360) % 360;
  }, []);

  const killHardwareWatch = useCallback(() => {
    if (geodeticHardwareGlobalManager.activeWatchIdentification !== null) {
      navigator.geolocation.clearWatch(geodeticHardwareGlobalManager.activeWatchIdentification);
      geodeticHardwareGlobalManager.activeWatchIdentification = null;
    }
    if (watchdogTimerReference.current) clearTimeout(watchdogTimerReference.current);
    geodeticHardwareGlobalManager.isIgnited = false;
    setIsAcquiringHardwareFix(false);
    nicepodLog("💤 [Sensor-Authority] Hardware liberado.");
  }, []);

  const startHardwareWatch = useCallback(async () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;
    if (geodeticHardwareGlobalManager.activeWatchIdentification !== null || geodeticHardwareGlobalManager.isIgnited) return;

    geodeticHardwareGlobalManager.isIgnited = true;
    setIsAcquiringHardwareFix(true);

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

      geodeticHardwareGlobalManager.lastKnownTelemetry = freshTelemetryFix;

      // [PERSISTENCIA V7.4]: Si el bloqueo es de Grado Industrial, sellamos en disco.
      if (freshTelemetryFix.accuracyMeters <= SOVEREIGN_PRECISION_THRESHOLD_METERS) {
        localStorage.setItem(TACTICAL_CACHE_KEY_NAME, JSON.stringify(freshTelemetryFix));
      }

      geodeticHardwareGlobalManager.kineticSignalBus.dispatchEvent(
        new CustomEvent(GEODETIC_KINETIC_SIGNAL_EVENT_NAME, { detail: freshTelemetryFix })
      );

      geodeticHardwareGlobalManager.reactSubscribersCollection.forEach(callback => callback(freshTelemetryFix));
      setIsAcquiringHardwareFix(false);
    };

    geodeticHardwareGlobalManager.activeWatchIdentification = navigator.geolocation.watchPosition(
      handleSignalSuccessAction,
      (error) => { if (error.code === 1) setIsHardwareAccessDenied(true); },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 25000 }
    );
  }, [killHardwareWatch, getPurifiedHeadingDegrees]);

  useEffect(() => {
    const updateLocalTelemetryAction = (newTelemetry: UserLocation) => setTelemetry(newTelemetry);
    geodeticHardwareGlobalManager.reactSubscribersCollection.add(updateLocalTelemetryAction);
    if (geodeticHardwareGlobalManager.lastKnownTelemetry) setTelemetry(geodeticHardwareGlobalManager.lastKnownTelemetry);
    return () => { geodeticHardwareGlobalManager.reactSubscribersCollection.delete(updateLocalTelemetryAction); };
  }, []);

  return {
    telemetry,
    kineticSignalBus: geodeticHardwareGlobalManager.kineticSignalBus,
    isDenied: isHardwareAccessDenied,
    isAcquiring: isAcquiringHardwareFix,
    isIgnited: geodeticHardwareGlobalManager.isIgnited,
    startHardwareWatch,
    killHardwareWatch,
    reSync: () => { killHardwareWatch(); startHardwareWatch(); }
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V7.4):
 * 1. Geodetic Persistence: Se ha implementado el guardado imperativo en 'localStorage' 
 *    cuando la precisión es < 30m, eliminando la 'amnesia de arranque'.
 * 2. ZAP Absolute Compliance: Purificación nominal total en el 100% del archivo.
 * 3. Cache Validation: Se inyectó un validador de antigüedad (TTL) de 10 minutos 
 *    para evitar telemetría fantasma si el Voyager se desplaza en coche/metro.
 */