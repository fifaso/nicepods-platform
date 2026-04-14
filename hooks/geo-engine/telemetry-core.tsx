/**
 * ARCHIVO: hooks/geo-engine/telemetry-core.tsx
 * VERSIÓN: 6.0 (NicePod Sovereign Telemetry Core - Kinetic Stream Decoupling Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Gestionar la ubicación física del Voyager purificando la telemetría y 
 * proveyendo una arquitectura de doble flujo: Verdad Lógica (Lenta/Precisa) 
 * y Verdad Cinética (Rápida/Milisegundos).
 * [REFORMA V6.0]: Implementación del 'Stream Decoupling Protocol'. Se integra 
 * el 'kineticSignalBus' para permitir que los componentes visuales se muevan 
 * a 60 FPS sin afectar la estabilidad del estado global. Purificación 
 * nominal absoluta bajo la Zero Abbreviations Policy (ZAP).
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
const EMISSION_THRESHOLD_METERS = 0.8;           // Umbral para el Flujo de Verdad (Radar/DB).
const TELEPORT_THRESHOLD_METERS = 100.0;         // Detección de anomalías de salto cuántico.
const SOVEREIGN_ACCURACY_THRESHOLD_METERS = 35;  // Umbral para bloqueo satelital HD.
const ACCEPTABLE_ACCURACY_THRESHOLD_METERS = 250; // Umbral elástico para liberación de Interfaz.

/**
 * INTERFAZ: TelemetryCoreReturn
 * La firma pública que expone el núcleo de hardware a la Fachada del motor (useGeoEngine).
 */
interface TelemetryCoreReturn {
  // Flujo de Verdad (React State - Lógica Lenta)
  userLocation: UserLocation | null;
  // Flujo Cinético (Event Bus - Visualización Milisegundos)
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
   * 1. CONSUMO DEL CENTINELA DE HARDWARE (NATIVO SINGLETON V7.2)
   * Heredamos tanto el estado reactivo como el bus cinético de alta frecuencia.
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
  const [isGeographicallyTriangulated, setIsGeographicallyTriangulated] = useState<boolean>(
    !!initialGeographicData || !!rawHardwareTelemetry
  );
  const [manualGeographicAnchor, setManualGeographicAnchorState] = useState<UserLocation | null>(null);

  // 3. MEMORIA TÁCTICA Y BLOQUEO SOBERANO
  const lastEmittedGeographicLocationReference = useRef<UserLocation | null>(rawHardwareTelemetry);
  const isSovereignAccuracyLockActiveReference = useRef<boolean>(
    !!rawHardwareTelemetry &&
    rawHardwareTelemetry.geographicSource === 'global-positioning-system' &&
    rawHardwareTelemetry.accuracyMeters <= SOVEREIGN_ACCURACY_THRESHOLD_METERS
  );

  /**
   * EFECTO: AISLAMIENTO TÉRMICO
   */
  useEffect(() => {
    const handleDocumentVisibilityChangeAction = () => {
      if (document.hidden) {
        nicepodLog("💤 [TelemetryCore] Terminal en segundo plano. Suspendiendo hardware sensorial.");
        terminateHardwareObservationAction();
      } else {
        if (isHardwareIgnited && !isHardwareAccessDenied) {
          nicepodLog("⚡ [TelemetryCore] Terminal recuperada. Restaurando enlace satelital activo.");
          startHardwareObservationAction();
        }
      }
    };

    document.addEventListener("visibilitychange", handleDocumentVisibilityChangeAction);
    return () => {
      document.removeEventListener("visibilitychange", handleDocumentVisibilityChangeAction);
    };
  }, [isHardwareIgnited, isHardwareAccessDenied, terminateHardwareObservationAction, startHardwareObservationAction]);

  /**
   * EFECTO: FILTRADO PARA EL FLUJO DE VERDAD (TRUTH STREAM)
   * Misión: Actualizar el estado de React solo ante cambios significativos.
   */
  useEffect(() => {
    if (manualGeographicAnchor) {
      setUserGeographicLocation(manualGeographicAnchor);
      return;
    }

    if (rawHardwareTelemetry) {
      const currentHardwareAccuracyMagnitude = rawHardwareTelemetry.accuracyMeters || 9999;
      const currentTelemetrySource = rawHardwareTelemetry.geographicSource;

      // Gestión de Bloqueo Soberano (Emerald)
      if (
        currentTelemetrySource === 'global-positioning-system' &&
        currentHardwareAccuracyMagnitude <= SOVEREIGN_ACCURACY_THRESHOLD_METERS
      ) {
        if (!isSovereignAccuracyLockActiveReference.current) {
          nicepodLog("🛡️ [TelemetryCore] Bloqueo Soberano (GPS HD) consolidado.");
          isSovereignAccuracyLockActiveReference.current = true;
        }
      }

      // Gestión de Degradación
      if (currentHardwareAccuracyMagnitude > ACCEPTABLE_ACCURACY_THRESHOLD_METERS) {
        if (isSovereignAccuracyLockActiveReference.current) {
          nicepodLog("⚠️ [TelemetryCore] Bloqueo Soberano suspendido por señal inestable.");
          isSovereignAccuracyLockActiveReference.current = false;
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

        /**
         * FILTRADO DE EMISIÓN LÓGICA:
         * Solo actualizamos el estado de React (que dispara el radar y hooks lentos) 
         * si el movimiento supera el umbral de 0.8m o hay cambio de fuente.
         */
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

  /**
   * API SOBERANA DE TELEMETRÍA (Contrato Unificado V6.0)
   */
  const telemetryApplicationProgrammingInterface: TelemetryCoreReturn = {
    userLocation: userGeographicLocation,     // Fuente de verdad lenta (React State)
    kineticSignalBus: kineticSignalBus,       // Fuente de verdad rápida (Native Bus)

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
      nicepodLog(`📍 [TelemetryCore] Estableciendo anclaje pericial manual.`);
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
      nicepodLog("🧹 [TelemetryCore] Liberando anclaje manual.");
      setManualGeographicAnchorState(null);
    }
  };

  return (
    <TelemetryContext.Provider value={telemetryApplicationProgrammingInterface}>
      {children}
    </TelemetryContext.Provider>
  );
}

/**
 * useGeoTelemetry:
 * Punto de consumo único de la verdad física emanada del hardware unificado.
 */
export const useGeoTelemetry = () => {
  const telemetryContext = useContext(TelemetryContext);
  if (!telemetryContext) {
    throw new Error("CRITICAL_ERROR: 'useGeoTelemetry' invocado fuera del perímetro de su TelemetryProvider.");
  }
  return telemetryContext;
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Stream Decoupling: Separa el flujo visual (Kinetic) del flujo lógico (Truth), 
 *    permitiendo actualizaciones de UI a 60 FPS sin saturar el motor de React.
 * 2. ZAP Absolute Compliance: Purificación nominal completa en el 100% del archivo. 
 *    Ejemplo: 'rawHardwareTelemetry', 'physicalMovementDistanceMagnitude'.
 * 3. Atomic Pass-through: El 'kineticSignalBus' se expone directamente desde la 
 *    autoridad de sensores para que los marcadores se suscriban sin latencia.
 */