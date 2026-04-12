/**
 * ARCHIVO: hooks/geo-engine/telemetry-core.tsx
 * VERSIÓN: 5.0 (NicePod Sovereign Telemetry Core - Global Inheritance & Thermal Stewardship Edition)
 * PROTOCOLO: MADRID RESONANCE V4.8
 * 
 * Misión: Gestionar la ubicación física del Voyager purificando la telemetría, 
 * garantizando la persistencia de la "Verdad Consolidada" entre cambios de ruta
 * y aplicando el protocolo de Aislamiento Térmico para preservar la autonomía energética.
 * [REFORMA V5.0]: Implementación del Protocolo de Herencia Geodésica Activa. 
 * El núcleo se sincroniza con el Singleton de hardware global, eliminando la 
 * latencia de re-triangulación al navegar entre el Dashboard, el Mapa y la Forja. 
 * Cumplimiento absoluto de la Zero Abbreviations Policy (ZAP).
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
const EMISSION_THRESHOLD_METERS = 0.8;    // Escudo contra micro-vibraciones del hardware
const TELEPORT_THRESHOLD_METERS = 100.0;  // Detección de anomalías de salto cuántico
const SOVEREIGN_ACCURACY_THRESHOLD_METERS = 30; // Umbral para bloqueo satelital HD

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
 * Contrato nominal para la materialización T0 (Middleware).
 */
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
   * 1. CONSUMO DEL CENTINELA DE HARDWARE (NATIVO SINGLETON)
   * [SINCRO V5.0]: El hook useSensorAuthority gestiona la persistencia 
   * y el estado único del chip GPS fuera del ciclo de vida de React.
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
  // Heredamos la última ubicación conocida del gestor global si existe.
  const [userGeographicLocation, setUserGeographicLocation] = useState<UserLocation | null>(rawHardwareTelemetry);
  const [isGeographicallyTriangulated, setIsGeographicallyTriangulated] = useState<boolean>(
    !!initialGeographicData || !!rawHardwareTelemetry
  );
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
   * Misión: Apagar físicamente el hardware si la terminal NicePod pierde el foco visual.
   * [MANDATO]: Al estar centralizado en el layout, este efecto es el único guardián energético.
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
   * EFECTO: FILTRADO DE AUTORIDAD Y EMISIÓN CINEMÁTICA
   * Misión: Transformar la lectura cruda del Singleton en telemetría purificada.
   * [HERENCIA GEODÉSICA]: Evalúa si la nueva señal posee la calidad necesaria para la Malla.
   */
  useEffect(() => {
    // El anclaje manual (Fase 1 Forge) tiene prioridad absoluta de bloqueo.
    if (manualGeographicAnchor) {
      setUserGeographicLocation(manualGeographicAnchor);
      return;
    }

    if (rawHardwareTelemetry) {
      const currentHardwareAccuracyMagnitude = rawHardwareTelemetry.accuracyMeters || 9999;
      const currentTelemetrySource = rawHardwareTelemetry.geographicSource || 'internet-protocol-fallback';

      /**
       * PROTOCOLO DE SOBERANÍA:
       * Blindaje del sistema contra retrocesos a ubicaciones por IP una vez 
       * alcanzado el bloqueo HD satelital (Sovereign Accuracy Lock).
       */
      if (isSovereignAccuracyLockActiveReference.current && currentTelemetrySource === 'internet-protocol-fallback') {
        return;
      }

      if (currentTelemetrySource === 'global-positioning-system' && currentHardwareAccuracyMagnitude < SOVEREIGN_ACCURACY_THRESHOLD_METERS) {
        if (!isSovereignAccuracyLockActiveReference.current) {
          nicepodLog("🛡️ [TelemetryCore] Bloqueo Soberano satelital (GPS) activo en la Malla global.");
          isSovereignAccuracyLockActiveReference.current = true;
        }
      }

      let shouldEmitNewLocationToFacade = false;

      if (!lastEmittedGeographicLocationReference.current) {
        shouldEmitNewLocationToFacade = true;
      } else {
        // Cálculo de desplazamiento físico real desde la última emisión.
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
         * FILTRADO CINEMÁTICO: Solo emitimos cambios tangibles para optimizar 
         * el renderizado en el Hilo Principal (MTI).
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
   * API SOBERANA DE TELEMETRÍA (Contrato Unificado V5.0)
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Geodetic Inheritance: Al integrarse con el Singleton de hardware global, este núcleo 
 *    elimina la "amnesia geográfica" al navegar, permitiendo que la Forja y el Mapa 
 *    nazcan con telemetría de precisión (HD) ya establecida.
 * 2. Thermal Aisolation: El efecto de visibilidad del documento garantiza que el GPS 
 *    solo trabaje cuando el Voyager tiene la terminal en pantalla.
 * 3. Zero Abbreviations Policy (ZAP): Purificación nominal absoluta de todas las 
 *    variables (physicalMovementDistanceMagnitude, currentHardwareAccuracyMagnitude).
 */