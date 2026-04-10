/**
 * ARCHIVO: hooks/geo-engine/telemetry-core.tsx
 * VERSIÓN: 4.3 (NicePod Sovereign Telemetry Core - Geodetic Inheritance & Anti-Amnesia Edition)
 * PROTOCOLO: MADRID RESONANCE V4.5
 * 
 * Misión: Gestionar la ubicación física del Voyager purificando la telemetría y 
 * garantizando la persistencia de la "Verdad Consolidada" entre cambios de ruta.
 * [REFORMA V4.3]: Implementación del Protocolo de Herencia Táctica. El núcleo 
 * ahora recupera instantáneamente el último bloqueo de precisión (GPS) capturado 
 * por la plataforma, eliminando la latencia de re-triangulación al entrar en 
 * la terminal de forja o el mapa.
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
const SOVEREIGN_ACCURACY_THRESHOLD_METERS = 30; // Precisión requerida para bloqueo satelital (HD)

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
 */
interface InitialGeographicDataContract {
  latitudeCoordinate: number; 
  longitudeCoordinate: number; 
  cityName: string; 
  geographicSource: string;
}

/**
 * TelemetryProvider: El Reactor de Ubicación Primario Unificado de NicePod.
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
   * El hook useSensorAuthority gestiona la persistencia en localStorage de la última 
   * ubicación conocida, lo que permite la hidratación instantánea al cambiar de ruta.
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
  // Inicializamos con rawHardwareTelemetry si el sensor ya tiene una caché válida.
  const [userGeographicLocation, setUserGeographicLocation] = useState<UserLocation | null>(rawHardwareTelemetry);
  const [isGeographicallyTriangulated, setIsGeographicallyTriangulated] = useState<boolean>(!!initialGeographicData || !!rawHardwareTelemetry);
  const [manualGeographicAnchor, setManualGeographicAnchorState] = useState<UserLocation | null>(null);

  // 3. MEMORIA TÁCTICA (REFERENCIAS MUTABLES)
  const lastEmittedGeographicLocationReference = useRef<UserLocation | null>(rawHardwareTelemetry);
  const isSovereignAccuracyLockActiveReference = useRef<boolean>(
    !!rawHardwareTelemetry && 
    rawHardwareTelemetry.geographicSource === 'global-positioning-system' && 
    rawHardwareTelemetry.accuracyMeters < SOVEREIGN_ACCURACY_THRESHOLD_METERS
  );

  /**
   * EFECTO: AISLAMIENTO TÉRMICO (SOBERANÍA DE BATERÍA - PILAR 2)
   * [SINCRO V4.3]: Al estar centralizado en el layout, este efecto sobrevive a 
   * la navegación, pero apaga el sensor si el Voyager sale del navegador.
   */
  useEffect(() => {
    const handleDocumentVisibilityChangeAction = () => {
      if (document.hidden) {
        nicepodLog("💤 [TelemetryCore] Workstation en segundo plano. Suspendiendo hardware sensorial.");
        terminateHardwareObservationAction();
      } else {
        if (isHardwareIgnited && !isHardwareAccessDenied) {
          nicepodLog("⚡ [TelemetryCore] Workstation recuperada. Restaurando enlace satelital.");
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
   * Misión: Transformar la lectura cruda de hardware en telemetría purificada.
   * [HERENCIA TÁCTICA]: Si rawHardwareTelemetry cambia, evaluamos su precisión.
   */
  useEffect(() => {
    // El anclaje manual prevalece sobre la telemetría de hardware.
    if (manualGeographicAnchor) {
      setUserGeographicLocation(manualGeographicAnchor);
      return;
    }

    if (rawHardwareTelemetry) {
      const currentHardwareAccuracyMagnitude = rawHardwareTelemetry.accuracyMeters || 9999;
      const currentTelemetrySource = rawHardwareTelemetry.geographicSource || 'internet-protocol-fallback';

      /**
       * PROTOCOLO DE SOBERANÍA:
       * Blindaje del sistema contra retrocesos a IP una vez alcanzado el bloqueo HD.
       */
      if (isSovereignAccuracyLockActiveReference.current && currentTelemetrySource === 'internet-protocol-fallback') {
        return;
      }

      if (currentTelemetrySource === 'global-positioning-system' && currentHardwareAccuracyMagnitude < SOVEREIGN_ACCURACY_THRESHOLD_METERS) {
        if (!isSovereignAccuracyLockActiveReference.current) {
          nicepodLog("🛡️ [TelemetryCore] Bloqueo Soberano satelital (GPS) detectado en la Malla.");
          isSovereignAccuracyLockActiveReference.current = true;
        }
      }

      let shouldEmitNewLocationToFacade = false;

      if (!lastEmittedGeographicLocationReference.current) {
        shouldEmitNewLocationToFacade = true;
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

        const headingAngularDifference = Math.abs(
            (rawHardwareTelemetry.headingDegrees || 0) - (lastEmittedGeographicLocationReference.current.headingDegrees || 0)
        );

        const isHardJumpDetected = physicalMovementDistanceMagnitude > TELEPORT_THRESHOLD_METERS;

        /**
         * FILTRADO CINEMÁTICO: Solo emitimos cambios tangibles para optimizar el Hilo Principal.
         */
        if (
          physicalMovementDistanceMagnitude > EMISSION_THRESHOLD_METERS || 
          headingAngularDifference > 1.5 || 
          currentTelemetrySource !== lastEmittedGeographicLocationReference.current.geographicSource ||
          isHardJumpDetected
        ) {
          shouldEmitNewLocationToFacade = true;
        }
      }

      if (shouldEmitNewLocationToFacade) {
        setUserGeographicLocation(rawHardwareTelemetry);
        lastEmittedGeographicLocationReference.current = rawHardwareTelemetry;
        
        if (!isGeographicallyTriangulated) {
          setIsGeographicallyTriangulated(true);
        }
      }
    }
  }, [rawHardwareTelemetry, manualGeographicAnchor, isGeographicallyTriangulated]);

  /**
   * API SOBERANA DE TELEMETRÍA (Contrato Unificado V4.3)
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
        geographicSource: 'manual-anchor' as TelemetrySource,
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
 * Punto de consumo único de la verdad física emanada del hardware unificado.
 */
export const useGeoTelemetry = () => {
  const telemetryContext = useContext(TelemetryContext);
  if (!telemetryContext) {
    throw new Error("CRITICAL_ERROR: 'useGeoTelemetry' invocado fuera del perímetro de su TelemetryProvider.");
  }
  return telemetryContext;
};