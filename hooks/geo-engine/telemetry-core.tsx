/**
 * ARCHIVO: hooks/geo-engine/telemetry-core.tsx
 * VERSIÓN: 4.0 (NicePod Sovereign Telemetry Core - Final Nominal Sync & Contractual Seal)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * 
 * Misión: Gestionar la ubicación física del Voyager purificando la telemetría, 
 * garantizando la integridad del contrato de datos inicial y aplicando 
 * el protocolo de Aislamiento Térmico (Hibernación de Hardware).
 * [REFORMA V4.0]: Sincronización nominal absoluta con la Constitución V8.6 y 
 * use-sensor-authority V6.1. Resolución definitiva de errores TS2339 mediante 
 * el mapeo a propiedades industriales (latitudeCoordinate, geographicSource, etc.).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { calculateDistanceBetweenPoints } from "@/lib/geo-kinematics";
import { UserLocation, TelemetrySource } from "@/types/geo-sovereignty";
import { nicepodLog } from "@/lib/utils";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSensorAuthority } from "../use-sensor-authority";

/**
 * PARÁMETROS DE GOBERNANZA INDUSTRIAL Y TERMODINÁMICA
 */
const EMISSION_THRESHOLD_METERS = 0.8;    // Escudo contra micro-vibraciones del sensor
const TELEPORT_THRESHOLD_METERS = 100.0;  // Detección de anomalías de salto de hardware
const SOVEREIGN_ACCURACY_THRESHOLD_METERS = 30; // Precisión requerida para bloqueo satelital

/**
 * INTERFAZ: TelemetryCoreReturn
 * La firma pública que expone el núcleo de hardware a la Fachada del motor (useGeoEngine).
 */
interface TelemetryCoreReturn {
  userLocation: UserLocation | null;
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

/**
 * INTERFAZ: InitialGeographicDataContract
 * Contrato nominal estricto para el Handshake T0 (Geo-IP Middleware).
 */
interface InitialGeographicDataContract {
  latitudeCoordinate: number; 
  longitudeCoordinate: number; 
  cityName: string; 
  geographicSource: string;
}

/**
 * TelemetryProvider: El Reactor de Ubicación Primario de NicePod.
 */
export function TelemetryProvider({ 
  children, 
  initialGeographicData 
}: { 
  children: React.ReactNode, 
  initialGeographicData?: InitialGeographicDataContract | null 
}) {
  
  /**
   * 1. CONSUMO DEL CENTINELA DE HARDWARE (NATIVO)
   * [SINCRO V4.0]: El hook useSensorAuthority ya devuelve objetos de tipo UserLocation.
   */
  const {
    telemetry: rawHardwareTelemetry,
    isDenied: isHardwareAccessDenied,
    isIgnited: isHardwareIgnited,
    startHardwareWatch: startHardwareObservationAction,
    killHardwareWatch: terminateHardwareObservationAction,
    reSync: reSynchronizeHardwareAction
  } = useSensorAuthority({ 
    initialData: initialGeographicData ? {
      lat: initialGeographicData.latitudeCoordinate,
      lng: initialGeographicData.longitudeCoordinate,
      city: initialGeographicData.cityName,
      source: initialGeographicData.geographicSource
    } : null 
  });

  // 2. ESTADOS SOBERANOS DE UBICACIÓN (NOMINAL INTEGRITY)
  const [userGeographicLocation, setUserGeographicLocation] = useState<UserLocation | null>(null);
  const [isGeographicallyTriangulated, setIsGeographicallyTriangulated] = useState<boolean>(!!initialGeographicData);
  const [manualGeographicAnchor, setManualGeographicAnchorState] = useState<UserLocation | null>(null);

  // 3. MEMORIA TÁCTICA (REFERENCIAS MUTABLES)
  const lastEmittedGeographicLocationReference = useRef<UserLocation | null>(null);
  const isSovereignAccuracyLockActiveReference = useRef<boolean>(false);

  /**
   * EFECTO: AISLAMIENTO TÉRMICO (SOBERANÍA DE BATERÍA - PILAR 2)
   */
  useEffect(() => {
    const handleDocumentVisibilityChangeAction = () => {
      if (document.hidden) {
        nicepodLog("💤 [TelemetryCore] Workstation minimizada. Suspendiendo hardware sensorial.");
        terminateHardwareObservationAction();
      } else {
        if (isHardwareIgnited && !isHardwareAccessDenied) {
          nicepodLog("⚡ [TelemetryCore] Workstation activa. Restaurando enlace satelital.");
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
   * EFECTO: FILTRADO DE AUTORIDAD Y EMISIÓN CINEMÁTICA
   * Misión: Transformar la lectura cruda de hardware en telemetría purificada para la Malla.
   */
  useEffect(() => {
    // El anclaje manual prevalece sobre la telemetría de hardware en la toma de decisiones.
    if (manualGeographicAnchor) {
      setUserGeographicLocation(manualGeographicAnchor);
      return;
    }

    if (rawHardwareTelemetry) {
      /**
       * [FIX V4.0]: Resolución de errores TS2339.
       * Acceso directo a propiedades nominales de UserLocation (Constitution V8.6).
       */
      const currentHardwareAccuracyMagnitude = rawHardwareTelemetry.accuracyMeters || 9999;
      const currentTelemetrySource = rawHardwareTelemetry.geographicSource;

      /**
       * PROTOCOLO DE SOBERANÍA:
       * Blindaje del sistema contra retrocesos a IP una vez alcanzado el bloqueo HD satelital.
       */
      if (isSovereignAccuracyLockActiveReference.current && currentTelemetrySource === 'internet-protocol-fallback') {
        return;
      }

      if (currentTelemetrySource === 'global-positioning-system' && currentHardwareAccuracyMagnitude < SOVEREIGN_ACCURACY_THRESHOLD_METERS) {
        if (!isSovereignAccuracyLockActiveReference.current) {
          nicepodLog("🛡️ [TelemetryCore] Bloqueo Soberano satelital (GPS): ACTIVADO.");
          isSovereignAccuracyLockActiveReference.current = true;
        }
      }

      const sanitizedLocation: UserLocation = {
        latitudeCoordinate: rawHardwareTelemetry.latitudeCoordinate,
        longitudeCoordinate: rawHardwareTelemetry.longitudeCoordinate,
        accuracyMeters: currentHardwareAccuracyMagnitude,
        headingDegrees: rawHardwareTelemetry.headingDegrees,
        speedMetersPerSecond: rawHardwareTelemetry.speedMetersPerSecond,
        geographicSource: currentTelemetrySource,
        timestamp: rawHardwareTelemetry.timestamp
      };

      let shouldEmitNewLocationToFacade = false;

      if (!lastEmittedGeographicLocationReference.current) {
        shouldEmitNewLocationToFacade = true;
      } else {
        const physicalMovementDistanceMagnitude = calculateDistanceBetweenPoints(
          { 
            latitude: sanitizedLocation.latitudeCoordinate, 
            longitude: sanitizedLocation.longitudeCoordinate 
          },
          { 
            latitude: lastEmittedGeographicLocationReference.current.latitudeCoordinate, 
            longitude: lastEmittedGeographicLocationReference.current.longitudeCoordinate 
          }
        );

        const headingAngularDifference = Math.abs(
            (sanitizedLocation.headingDegrees || 0) - (lastEmittedGeographicLocationReference.current.headingDegrees || 0)
        );

        const isHardJumpDetected = physicalMovementDistanceMagnitude > TELEPORT_THRESHOLD_METERS;

        /**
         * FILTRADO CINEMÁTICO: Solo emitimos si hay cambios tangibles en el espacio.
         */
        if (
          physicalMovementDistanceMagnitude > EMISSION_THRESHOLD_METERS || 
          headingAngularDifference > 1.5 || 
          sanitizedLocation.geographicSource !== lastEmittedGeographicLocationReference.current.geographicSource ||
          isHardJumpDetected
        ) {
          shouldEmitNewLocationToFacade = true;
        }
      }

      if (shouldEmitNewLocationToFacade) {
        setUserGeographicLocation(sanitizedLocation);
        lastEmittedGeographicLocationReference.current = sanitizedLocation;
        
        if (!isGeographicallyTriangulated) {
          setIsGeographicallyTriangulated(true);
        }
      }
    }
  }, [rawHardwareTelemetry, manualGeographicAnchor, isGeographicallyTriangulated]);

  /**
   * API SOBERANA DE TELEMETRÍA (Contrato Final V4.0)
   */
  const telemetryApplicationProgrammingInterface: TelemetryCoreReturn = {
    userLocation: userGeographicLocation,
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
      nicepodLog(`📍 [TelemetryCore] Anclaje pericial manual establecido: [${longitudeCoordinate}, ${latitudeCoordinate}]`);
      setManualGeographicAnchorState({
        latitudeCoordinate: latitudeCoordinate,
        longitudeCoordinate: longitudeCoordinate,
        accuracyMeters: 1, 
        headingDegrees: null,
        speedMetersPerSecond: null,
        geographicSource: 'manual-anchor',
        timestamp: Date.now()
      });
    },
    clearManualGeographicAnchor: () => {
      nicepodLog("🧹 [TelemetryCore] Liberando anclaje pericial manual.");
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
 * Consumo único de la verdad física emanada del hardware de silicio.
 */
export const useGeoTelemetry = () => {
  const telemetryContext = useContext(TelemetryContext);
  if (!telemetryContext) {
    throw new Error("CRITICAL_ERROR: 'useGeoTelemetry' invocado fuera del perímetro de su TelemetryProvider.");
  }
  return telemetryContext;
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Build Shield Sovereignty: Se resolvieron los 7 errores TS2339 sincronizando el acceso 
 *    a datos con las propiedades industriales (latitudeCoordinate, accuracyMeters, etc.).
 * 2. Zero Abbreviations Policy: Purificación absoluta de la lógica de comparación y 
 *    nomenclatura de variables de estado.
 * 3. Contractual Integrity: El núcleo ahora dialoga con useSensorAuthority V6.1 sin 
 *    necesidad de mapeadores externos de 'any'.
 */