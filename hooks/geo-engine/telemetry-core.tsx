/**
 * ARCHIVO: hooks/geo-engine/telemetry-core.tsx
 * VERSIÓN: 2.1 (NicePod Sovereign Telemetry - Kinematic Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Gestionar la ubicación física del Voyager purificando la telemetría, 
 * garantizando la integridad del contrato de datos inicial y aplicando 
 * el protocolo de Aislamiento Térmico (Hibernación de Hardware).
 * [REFORMA V2.1]: Sincronización nominal total con KinematicEngine V3.0, 
 * resolución de error TS2305 y cumplimiento estricto de la Zero Abbreviations Policy.
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
const EMISSION_THRESHOLD_METERS = 0.8;    // Escudo de micro-vibraciones
const TELEPORT_THRESHOLD_METERS = 100.0;  // Detección de salto cuántico
const SOVEREIGN_ACCURACY_THRESHOLD = 30;  // Precisión mínima para bloqueo GPS (metros)

/**
 * INTERFAZ: TelemetryCoreReturn
 * La firma pública que expone el núcleo de hardware a la Fachada del motor.
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
  
  // 1. CONSUMO DEL CENTINELA DE HARDWARE
  const {
    telemetry: rawHardwareTelemetry,
    isDenied: isHardwareAccessDenied,
    isIgnited: isHardwareIgnited,
    startHardwareWatch: startHardwareObservationAction,
    killHardwareWatch: terminateHardwareObservationAction,
    reSync: reSynchronizeHardwareAction
  } = useSensorAuthority({ initialData: initialGeographicData as any });

  // 2. ESTADOS SOBERANOS DE UBICACIÓN
  const [userGeographicLocation, setUserGeographicLocation] = useState<UserLocation | null>(null);
  const [isGeographicallyTriangulated, setIsGeographicallyTriangulated] = useState<boolean>(!!initialGeographicData);
  const [manualGeographicAnchor, setManualGeographicAnchorState] = useState<UserLocation | null>(null);

  // 3. MEMORIA TÁCTICA (REFERENCIAS MUTABLES)
  const lastEmittedGeographicLocationReference = useRef<UserLocation | null>(null);
  const isSovereignAccuracyLockActiveReference = useRef<boolean>(false);

  /**
   * EFECTO: AISLAMIENTO TÉRMICO (SOBERANÍA DE BATERÍA)
   * Misión: Apagar la antena GPS si la aplicación pierde el foco visual del usuario.
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
   * Misión: Decidir si la lectura de hardware entrante posee la calidad necesaria para la Malla.
   */
  useEffect(() => {
    const effectiveGeographicLocation = manualGeographicAnchor || rawHardwareTelemetry;

    if (effectiveGeographicLocation) {
      const currentTelemetrySource = (effectiveGeographicLocation.source as TelemetrySource) || 'ip-fallback';
      const currentHardwareAccuracyMagnitude = effectiveGeographicLocation.accuracy || 9999;

      /**
       * PROTOCOLO DE SOBERANÍA:
       * Blindaje del sistema contra retrocesos a ubicaciones por IP una vez alcanzado el bloqueo HD.
       */
      if (isSovereignAccuracyLockActiveReference.current && currentTelemetrySource === 'ip-fallback') {
        return;
      }

      if (currentTelemetrySource === 'gps' && currentHardwareAccuracyMagnitude < SOVEREIGN_ACCURACY_THRESHOLD) {
        if (!isSovereignAccuracyLockActiveReference.current) {
          nicepodLog("🛡️ [TelemetryCore] Bloqueo Soberano GPS: ACTIVADO.");
          isSovereignAccuracyLockActiveReference.current = true;
        }
      }

      let shouldEmitNewLocationToFacade = false;

      if (!lastEmittedGeographicLocationReference.current) {
        shouldEmitNewLocationToFacade = true;
      } else {
        // [FIX V2.1]: Sincronía con calculateDistanceBetweenPoints (V3.0)
        const physicalMovementDistanceMagnitude = calculateDistanceBetweenPoints(
          { 
            latitude: effectiveGeographicLocation.latitude, 
            longitude: effectiveGeographicLocation.longitude 
          },
          { 
            latitude: lastEmittedGeographicLocationReference.current.latitude, 
            longitude: lastEmittedGeographicLocationReference.current.longitude 
          }
        );

        const headingAngularDifference = Math.abs(
            (effectiveGeographicLocation.heading || 0) - (lastEmittedGeographicLocationReference.current.heading || 0)
        );

        const isHardJumpDetected = physicalMovementDistanceMagnitude > TELEPORT_THRESHOLD_METERS;

        if (
          physicalMovementDistanceMagnitude > EMISSION_THRESHOLD_METERS || 
          headingAngularDifference > 1.5 || 
          currentTelemetrySource !== lastEmittedGeographicLocationReference.current.source ||
          isHardJumpDetected
        ) {
          shouldEmitNewLocationToFacade = true;
        }
      }

      if (shouldEmitNewLocationToFacade) {
        setUserGeographicLocation(effectiveGeographicLocation);
        lastEmittedGeographicLocationReference.current = effectiveGeographicLocation;
        
        if (!isGeographicallyTriangulated) {
          setIsGeographicallyTriangulated(true);
        }
      }
    }
  }, [rawHardwareTelemetry, manualGeographicAnchor, isGeographicallyTriangulated]);

  /**
   * API SOBERANA DE TELEMETRÍA (Fachada Pública del Núcleo)
   */
  const telemetryApplicationProgrammingInterface: TelemetryCoreReturn = {
    userLocation: userGeographicLocation,
    isIgnited: isHardwareIgnited,
    isDenied: isHardwareAccessDenied,
    isTriangulated: isGeographicallyTriangulated,
    isGlobalPositioningSystemLocked: rawHardwareTelemetry?.source === 'gps' && (rawHardwareTelemetry.accuracy || 9999) < SOVEREIGN_ACCURACY_THRESHOLD,
    telemetrySource: (rawHardwareTelemetry?.source as TelemetrySource) || null,
    
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
        latitude: latitudeCoordinate,
        longitude: longitudeCoordinate,
        accuracy: 1, 
        heading: rawHardwareTelemetry?.heading ?? null,
        speed: null,
        source: 'manual-anchor',
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
 * NOTA TÉCNICA DEL ARCHITECT (V2.1):
 * 1. Kinematic Engine Sync: Se resolvió el error TS2305 al sustituir 'calculateDistance' 
 *    por 'calculateDistanceBetweenPoints', alineando el núcleo con la librería V3.0.
 * 2. Zero Abbreviations Policy: Purificación absoluta de términos (isHardwareIgnited, 
 *    physicalMovementDistanceMagnitude, lastEmittedGeographicLocationReference).
 * 3. Atomic Re-Render Shield: El uso de referencias para el bloqueo de precisión GPS 
 *    previene bucles de renderizado infinitos durante la transición IP -> GPS.
 */