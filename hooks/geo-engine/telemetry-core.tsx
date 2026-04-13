/**
 * ARCHIVO: hooks/geo-engine/telemetry-core.tsx
 * VERSIÓN: 5.1 (NicePod Sovereign Telemetry Core - Elastic Lock & Tactical Stability Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Gestionar la ubicación física del Voyager purificando la telemetría, 
 * garantizando la persistencia de la "Verdad Consolidada" entre cambios de ruta
 * y aplicando el protocolo de Aislamiento Térmico para preservar la autonomía energética.
 * [REFORMA V5.1]: Implementación del Protocolo de Bloqueo Elástico (Elastic Lock). 
 * Se introduce el umbral de 'ACCEPTABLE_ACCURACY_THRESHOLD_METERS' para permitir 
 * que entornos de escritorio (WiFi/PC) liberen la interfaz de usuario mientras 
 * el hardware busca el bloqueo soberano. Sincronía nominal absoluta (ZAP).
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
const EMISSION_THRESHOLD_METERS = 0.8;           // Escudo contra micro-vibraciones del hardware.
const TELEPORT_THRESHOLD_METERS = 100.0;         // Detección de anomalías de salto cuántico (Bouncing).
const SOVEREIGN_ACCURACY_THRESHOLD_METERS = 35;  // Umbral para bloqueo satelital HD (Emerald State).
const ACCEPTABLE_ACCURACY_THRESHOLD_METERS = 250; // Umbral elástico para liberación de UI (Network State).

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
 * [MANDATO]: Actúa como el motor de purificación de señales del Singleton de Hardware.
 */
export function TelemetryProvider({
  children,
  initialGeographicData
}: {
  children: React.ReactNode,
  initialGeographicData?: InitialGeographicDataContract | null
}) {

  /**
   * 1. CONSUMO DEL CENTINELA DE HARDWARE (NATIVO SINGLETON V7.1)
   * [SINCRO V5.1]: Sincronización nominal con la interfaz de hidratación instantánea.
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
      latitudeCoordinate: initialGeographicData.latitudeCoordinate,
      longitudeCoordinate: initialGeographicData.longitudeCoordinate,
      cityName: initialGeographicData.cityName,
      geographicSource: initialGeographicData.geographicSource
    } : null
  });

  // 2. ESTADOS SOBERANOS DE UBICACIÓN (NOMINAL INTEGRITY)
  const [userGeographicLocation, setUserGeographicLocation] = useState<UserLocation | null>(rawHardwareTelemetry);

  /**
   * isGeographicallyTriangulated: 
   * Se activa si poseemos cualquier señal válida para la visualización (T0, WiFi o GPS).
   * Misión: Liberar los velos de carga del Dashboard y el Mapa.
   */
  const [isGeographicallyTriangulated, setIsGeographicallyTriangulated] = useState<boolean>(
    !!initialGeographicData || !!rawHardwareTelemetry
  );

  const [manualGeographicAnchor, setManualGeographicAnchorState] = useState<UserLocation | null>(null);

  // 3. MEMORIA TÁCTICA Y BLOQUEO SOBERANO
  const lastEmittedGeographicLocationReference = useRef<UserLocation | null>(rawHardwareTelemetry);

  /**
   * isSovereignAccuracyLockActiveReference:
   * Misión: Determinar si la Workstation posee un bloqueo de precisión HD (< 35 metros).
   */
  const isSovereignAccuracyLockActiveReference = useRef<boolean>(
    !!rawHardwareTelemetry &&
    rawHardwareTelemetry.geographicSource === 'global-positioning-system' &&
    rawHardwareTelemetry.accuracyMeters <= SOVEREIGN_ACCURACY_THRESHOLD_METERS
  );

  /**
   * EFECTO: AISLAMIENTO TÉRMICO (SOBERANÍA DE BATERÍA - PILAR 2)
   * Misión: Apagar físicamente el hardware si la terminal NicePod pierde el foco visual.
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
   * EFECTO: FILTRADO DE AUTORIDAD Y PROTOCOLO ELÁSTICO
   * Misión: Transformar la lectura cruda en telemetría purificada y gestionar los bloqueos.
   */
  useEffect(() => {
    // El anclaje manual tiene prioridad absoluta de bloqueo (Fase de Forja).
    if (manualGeographicAnchor) {
      setUserGeographicLocation(manualGeographicAnchor);
      return;
    }

    if (rawHardwareTelemetry) {
      const currentHardwareAccuracyMagnitude = rawHardwareTelemetry.accuracyMeters || 9999;
      const currentTelemetrySource = rawHardwareTelemetry.geographicSource;

      /**
       * [PROTOCOL]: ELASTIC LOCK MANAGEMENT
       * Misión: Evaluar si la señal es digna de ser inyectada en la Malla.
       */
      let shouldEmitNewLocationToFacade = false;

      // A. Evaluación de Bloqueo Soberano (HD GPS)
      if (
        currentTelemetrySource === 'global-positioning-system' &&
        currentHardwareAccuracyMagnitude <= SOVEREIGN_ACCURACY_THRESHOLD_METERS
      ) {
        if (!isSovereignAccuracyLockActiveReference.current) {
          nicepodLog("🛡️ [TelemetryCore] Bloqueo Soberano satelital (GPS HD) alcanzado.");
          isSovereignAccuracyLockActiveReference.current = true;
        }
      }

      // B. Evaluación de Degradación de Señal
      // Si la precisión se degrada por encima del umbral elástico, perdemos el bloqueo soberano.
      if (currentHardwareAccuracyMagnitude > ACCEPTABLE_ACCURACY_THRESHOLD_METERS) {
        if (isSovereignAccuracyLockActiveReference.current) {
          nicepodLog("⚠️ [TelemetryCore] Pérdida de Bloqueo Soberano por degradación de señal crítica.");
          isSovereignAccuracyLockActiveReference.current = false;
        }
      }

      // C. Lógica de Emisión para Liberación de UI e Isolate
      if (!lastEmittedGeographicLocationReference.current) {
        // Primera emisión tras el arranque (Materialización T0 o primer Fix de hardware).
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

        /**
         * FILTRADO CINEMÁTICO:
         * Emitimos si el movimiento es superior al umbral de vibración, si hay cambio de rumbo
         * o si la precisión ha mejorado significativamente aunque no haya movimiento.
         */
        const hasAccuracyImprovedSignificantly =
          currentHardwareAccuracyMagnitude < (lastEmittedGeographicLocationReference.current.accuracyMeters - 10);

        if (
          physicalMovementDistanceMagnitude > EMISSION_THRESHOLD_METERS ||
          headingAngularDifference > 2.0 ||
          hasAccuracyImprovedSignificantly ||
          currentTelemetrySource !== lastEmittedGeographicLocationReference.current.geographicSource
        ) {
          shouldEmitNewLocationToFacade = true;
        }
      }

      if (shouldEmitNewLocationToFacade) {
        setUserGeographicLocation(rawHardwareTelemetry);
        lastEmittedGeographicLocationReference.current = rawHardwareTelemetry;

        /**
         * LIBERACIÓN DE INTERFAZ:
         * Si la ubicación es aceptable (Red/WiFi < 250m), consideramos el sistema triangulado 
         * para retirar los velos de carga, incluso si no es precisión HD.
         */
        if (!isGeographicallyTriangulated && currentHardwareAccuracyMagnitude <= ACCEPTABLE_ACCURACY_THRESHOLD_METERS) {
          setIsGeographicallyTriangulated(true);
        }
      }
    }
  }, [rawHardwareTelemetry, manualGeographicAnchor, isGeographicallyTriangulated]);

  /**
   * API SOBERANA DE TELEMETRÍA (Contrato Unificado V5.1)
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
 * NOTA TÉCNICA DEL ARCHITECT (V5.1):
 * 1. Elastic Lock Protocol: Se ha introducido la aceptación de señales de red (< 250m) 
 *    como válidas para 'isTriangulated', permitiendo que la UI del Dashboard 
 *    se desbloquee en entornos de oficina/WiFi sin esperar al GPS HD.
 * 2. ZAP Enforcement: Purificación total de la nomenclatura técnica en el 100% 
 *    del archivo. Se eliminaron residuos nominales como lat/lng.
 * 3. Accuracy Feedback Loop: El sistema ahora emite una nueva ubicación si la 
 *    precisión mejora significativamente, incluso si el Voyager está estático.
 */