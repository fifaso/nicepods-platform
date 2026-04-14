/**
 * ARCHIVO: hooks/geo-engine/telemetry-core.tsx
 * VERSIÓN: 6.3 (NicePod Sovereign Telemetry Core - Logic Guard & Cache Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Gestionar la ubicación física del Voyager purificando la telemetría, 
 * orquestando el flujo dual (Verdad/Cinética) y garantizando que la caché táctica 
 * sea tratada como una fuente de verdad inmediata para el arranque.
 * [REFORMA V6.3]: Resolución definitiva del error TS2339 (Type Never). Se ha 
 * simplificado la lógica de triangulación eliminando redundancias booleanas. 
 * Sincronización nominal absoluta (ZAP) y sellado de integridad del 
 * Build Shield Sovereignty (BSS).
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
   * 1. CONSUMO DEL CENTINELA DE HARDWARE (REGISTRADOR DE VUELO V7.4)
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

  // 2. ESTADOS SOBERANOS (TRUTH STREAM)
  const [userGeographicLocation, setUserGeographicLocation] = useState<UserLocation | null>(rawHardwareTelemetry);

  /**
   * isGeographicallyTriangulated: 
   * [FIX V6.3]: Resolución de error 'type never'. 
   * Misión: El sistema se considera triangulado si existe una Semilla T0 
   * o si el hardware (GPS/Caché) ya ha entregado un objeto de telemetría válido.
   */
  const [isGeographicallyTriangulated, setIsGeographicallyTriangulated] = useState<boolean>(
    !!initialGeographicData || !!rawHardwareTelemetry
  );

  const [manualGeographicAnchor, setManualGeographicAnchorState] = useState<UserLocation | null>(null);

  // 3. MEMORIA TÁCTICA Y BLOQUEO SOBERANO
  const lastEmittedGeographicLocationReference = useRef<UserLocation | null>(rawHardwareTelemetry);

  const isSovereignAccuracyLockActiveReference = useRef<boolean>(
    !!rawHardwareTelemetry &&
    (rawHardwareTelemetry.geographicSource === 'global-positioning-system' || rawHardwareTelemetry.geographicSource === 'cache') &&
    rawHardwareTelemetry.accuracyMeters <= SOVEREIGN_ACCURACY_THRESHOLD_METERS
  );

  /**
   * EFECTO: AUTO-IGNICIÓN PROACTIVA
   */
  useEffect(() => {
    if (!isHardwareIgnited && !isHardwareAccessDenied && typeof window !== 'undefined') {
      startHardwareObservationAction();
    }
  }, [isHardwareIgnited, isHardwareAccessDenied, startHardwareObservationAction]);

  /**
   * EFECTO: AISLAMIENTO TÉRMICO
   */
  useEffect(() => {
    const handleDocumentVisibilityChangeAction = () => {
      if (document.hidden) {
        terminateHardwareObservationAction();
      } else {
        if (!isHardwareAccessDenied) {
          startHardwareObservationAction();
        }
      }
    };
    document.addEventListener("visibilitychange", handleDocumentVisibilityChangeAction);
    return () => document.removeEventListener("visibilitychange", handleDocumentVisibilityChangeAction);
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
        (currentTelemetrySource === 'global-positioning-system' || currentTelemetrySource === 'cache') &&
        currentHardwareAccuracyMagnitude <= SOVEREIGN_ACCURACY_THRESHOLD_METERS
      ) {
        if (!isSovereignAccuracyLockActiveReference.current) {
          nicepodLog(`🛡️ [TelemetryCore] Bloqueo Soberano Activo (Fuente: ${currentTelemetrySource}).`);
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
      localStorage.removeItem("nicepod_tactical_geodetic_snapshot");
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
 * NOTA TÉCNICA DEL ARCHITECT (V6.3):
 * 1. Logic Hardening: Se eliminó la redundancia booleana que causaba el error 
 *    de inferencia 'never' en el compilador.
 * 2. ZAP Compliance: Purificación nominal total. Descriptores como 'acc' o 'src' 
 *    han sido erradicados del núcleo de decisión.
 * 3. MTI Architecture: Se mantiene el despacho multicanal para visualización 
 *    a 60 FPS sin comprometer la integridad del estado de React.
 */