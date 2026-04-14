/**
 * ARCHIVO: hooks/geo-engine/telemetry-core.tsx
 * VERSIÓN: 6.1 (NicePod Sovereign Telemetry Core - Geodetic Auto-Ignition Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Gestionar la ubicación física del Voyager purificando la telemetría y 
 * garantizando la ignición automática de sensores para una sintonía de milisegundos.
 * [REFORMA V6.1]: Implementación del 'Auto-Ignition Protocol'. El núcleo dispara 
 * el enlace con el silicio de forma proactiva al montarse. Se refina la 
 * distinción entre Triangulación de Red (IP) y Triangulación de Hardware (GPS).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { calculateDistanceBetweenPoints } from "@/lib/geo-kinematics";
import { nicepodLog } from "@/lib/utils";
import { TelemetrySource, UserLocation } from "@/types/geo-sovereignty";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSensorAuthority } from "../use-sensor-authority";

/**
 * ---------------------------------------------------------------------------
 * I. PARÁMETROS DE GOBERNANZA TÁCTICA E HIGIENE TÉRMICA
 * ---------------------------------------------------------------------------
 */
const EMISSION_THRESHOLD_METERS = 0.8;
const TELEPORT_THRESHOLD_METERS = 100.0;
const SOVEREIGN_ACCURACY_THRESHOLD_METERS = 35;
const ACCEPTABLE_ACCURACY_THRESHOLD_METERS = 250;

/**
 * INTERFAZ: TelemetryCoreReturn
 */
interface TelemetryCoreReturn {
  userLocation: UserLocation | null;
  kineticSignalBus: EventTarget;

  isIgnited: boolean;
  isDenied: boolean;
  isTriangulated: boolean;
  isGlobalPositioningSystemLocked: boolean;
  telemetrySource: TelemetrySource | null;

  initializeHardwareSensors: () => void;
  terminateHardwareSensors: () => void;
  reSynchronizeSensors: () => void;
  setGeographicTriangulationState: (isTriangulatedValue: boolean) => void;
  setManualGeographicAnchor: (longitudeCoordinate: number, latitudeCoordinate: number) => void;
  clearManualGeographicAnchor: () => void;
}

const TelemetryContext = createContext<TelemetryCoreReturn | undefined>(undefined);

interface InitialGeographicDataContract {
  latitudeCoordinate: number;
  longitudeCoordinate: number;
  cityName: string;
  geographicSource: string;
}

/**
 * TelemetryProvider: El Reactor de Ubicación Primario Unificado.
 */
export function TelemetryProvider({
  children,
  initialGeographicData
}: {
  children: React.ReactNode,
  initialGeographicData?: InitialGeographicDataContract | null
}) {

  /**
   * 1. CONSUMO DEL CENTINELA DE HARDWARE (SINGLETON V7.2)
   */
  const {
    telemetry: rawHardwareTelemetry,
    kineticSignalBus,
    isDenied: isHardwareAccessDenied,
    isIgnited: isHardwareIgnited,
    startHardwareWatch: startHardwareObservationAction,
    killHardwareWatch: terminateHardwareObservationAction,
    reSync: reSynchronizeHardwareAction
  } = useSensorAuthority({
    initialData: initialGeographicData ? {
      latitudeCoordinate: initialGeographicData.latitudeCoordinate,
      longitudeCoordinate: initialGeographicData.longitudeCoordinate,
      cityName: initialGeographicData.cityName,
      geographicSource: initialGeographicData.geographicSource
    } : null
  });

  // 2. ESTADOS SOBERANOS
  const [userGeographicLocation, setUserGeographicLocation] = useState<UserLocation | null>(rawHardwareTelemetry);
  const [isGeographicallyTriangulated, setIsGeographicallyTriangulated] = useState<boolean>(
    !!initialGeographicData || !!rawHardwareTelemetry
  );
  const [manualGeographicAnchor, setManualGeographicAnchorState] = useState<UserLocation | null>(null);

  // 3. MEMORIA TÁCTICA
  const lastEmittedGeographicLocationReference = useRef<UserLocation | null>(rawHardwareTelemetry);
  const isSovereignAccuracyLockActiveReference = useRef<boolean>(
    !!rawHardwareTelemetry &&
    rawHardwareTelemetry.geographicSource === 'global-positioning-system' &&
    rawHardwareTelemetry.accuracyMeters <= SOVEREIGN_ACCURACY_THRESHOLD_METERS
  );

  /**
   * [AUTO-IGNICIÓN V6.1]: PROTOCOLO DE ENLACE PROACTIVO
   * Misión: Activar el hardware en cuanto la Workstation entra en línea, 
   * eliminando la necesidad de interacción manual para obtener precisión.
   */
  useEffect(() => {
    if (!isHardwareIgnited && !isHardwareAccessDenied && typeof window !== 'undefined') {
      nicepodLog("⚡ [TelemetryCore] Ejecutando Auto-Ignición: Sincronizando con el silicio.");
      startHardwareObservationAction();
    }
  }, [isHardwareIgnited, isHardwareAccessDenied, startHardwareObservationAction]);

  /**
   * EFECTO: AISLAMIENTO TÉRMICO
   */
  useEffect(() => {
    const handleDocumentVisibilityChangeAction = () => {
      if (document.hidden) {
        nicepodLog("💤 [TelemetryCore] Suspensión térmica por invisibilidad.");
        terminateHardwareObservationAction();
      } else {
        // Al recuperar visibilidad, reactivamos automáticamente el enlace.
        if (!isHardwareAccessDenied) {
          startHardwareObservationAction();
        }
      }
    };

    document.addEventListener("visibilitychange", handleDocumentVisibilityChangeAction);
    return () => {
      document.removeEventListener("visibilitychange", handleDocumentVisibilityChangeAction);
    };
  }, [isHardwareAccessDenied, terminateHardwareObservationAction, startHardwareObservationAction]);

  /**
   * EFECTO: FILTRADO PARA EL FLUJO DE VERDAD (TRUTH STREAM)
   */
  useEffect(() => {
    if (manualGeographicAnchor) {
      setUserGeographicLocation(manualGeographicAnchor);
      return;
    }

    if (rawHardwareTelemetry) {
      const currentHardwareAccuracyMagnitude = rawHardwareTelemetry.accuracyMeters || 9999;
      const currentTelemetrySource = rawHardwareTelemetry.geographicSource;

      // Gestión de Bloqueo Soberano
      if (
        currentTelemetrySource === 'global-positioning-system' &&
        currentHardwareAccuracyMagnitude <= SOVEREIGN_ACCURACY_THRESHOLD_METERS
      ) {
        if (!isSovereignAccuracyLockActiveReference.current) {
          nicepodLog("🛡️ [TelemetryCore] Bloqueo Satelital de Alta Fidelidad consolidado.");
          isSovereignAccuracyLockActiveReference.current = true;
        }
      }

      let shouldUpdateTruthState = false;

      if (!lastEmittedGeographicLocationReference.current) {
        shouldUpdateTruthState = true;
      } else {
        const physicalMovementDistanceMagnitude = calculateDistanceBetweenPoints(
          {
            latitude: rawHardwareTelemetry.latitudeCoordinate,
            longitude: rawHardwareTelemetry.longitudeCoordinate
          },
          {
            latitude: lastEmittedGeographicLocationReference.current.latitudeCoordinate,
            longitude: lastEmittedGeographicLocationReference.current.longitudeCoordinate
          }
        );

        if (
          physicalMovementDistanceMagnitude > EMISSION_THRESHOLD_METERS ||
          currentTelemetrySource !== lastEmittedGeographicLocationReference.current.geographicSource
        ) {
          shouldUpdateTruthState = true;
        }
      }

      if (shouldUpdateTruthState) {
        setUserGeographicLocation(rawHardwareTelemetry);
        lastEmittedGeographicLocationReference.current = rawHardwareTelemetry;

        if (!isGeographicallyTriangulated && currentHardwareAccuracyMagnitude <= ACCEPTABLE_ACCURACY_THRESHOLD_METERS) {
          setIsGeographicallyTriangulated(true);
        }
      }
    }
  }, [rawHardwareTelemetry, manualGeographicAnchor, isGeographicallyTriangulated]);

  const telemetryApplicationProgrammingInterface: TelemetryCoreReturn = {
    userLocation: userGeographicLocation,
    kineticSignalBus: kineticSignalBus,
    isIgnited: isHardwareIgnited,
    isDenied: isHardwareAccessDenied,
    isTriangulated: isGeographicallyTriangulated,
    isGlobalPositioningSystemLocked: isSovereignAccuracyLockActiveReference.current,
    telemetrySource: userGeographicLocation?.geographicSource || null,

    initializeHardwareSensors: startHardwareObservationAction,
    terminateHardwareSensors: terminateHardwareObservationAction,
    reSynchronizeSensors: () => {
      isSovereignAccuracyLockActiveReference.current = false;
      reSynchronizeHardwareAction();
    },
    setGeographicTriangulationState: (isTriangulatedValue: boolean) => setIsGeographicallyTriangulated(isTriangulatedValue),
    setManualGeographicAnchor: (longitudeCoordinate: number, latitudeCoordinate: number) => {
      setManualGeographicAnchorState({
        latitudeCoordinate: latitudeCoordinate,
        longitudeCoordinate: longitudeCoordinate,
        accuracyMeters: 1,
        headingDegrees: null,
        speedMetersPerSecond: null,
        geographicSource: 'manual-anchor' as TelemetrySource,
        timestamp: Date.now()
      });
    },
    clearManualGeographicAnchor: () => {
      setManualGeographicAnchorState(null);
    }
  };

  return (
    <TelemetryContext.Provider value={telemetryApplicationProgrammingInterface}>
      {children}
    </TelemetryContext.Provider>
  );
}

export const useGeoTelemetry = () => {
  const telemetryContext = useContext(TelemetryContext);
  if (!telemetryContext) {
    throw new Error("CRITICAL_ERROR: 'useGeoTelemetry' fuera de TelemetryProvider.");
  }
  return telemetryContext;
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.1):
 * 1. Auto-Ignition: Se elimina la latencia de espera del usuario. El hardware se 
 *    activa proactivamente preservando la arquitectura Singleton.
 * 2. Visibility Stewardship: Se refuerza el ahorro energético; la terminal 
 *    no solo apaga el GPS al ocultarse, sino que lo re-enciende al ser visible.
 * 3. SSS Integrity: Garantiza que la Semilla T0 sea el puente temporal perfecto 
 *    hasta que el silicio entregue la precisión HD.
 */