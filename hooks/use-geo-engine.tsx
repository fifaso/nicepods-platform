/**
 * ARCHIVO: hooks/use-geo-engine.tsx
 * VERSIÓN: 54.0 (NicePod Sovereign Geo-Engine - Automatic Mesh Elevation Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Actuar como la Fachada Transparente unificadora de la Workstation. 
 * Orquestar la sintonía entre los núcleos de telemetría, radar e interfaz, 
 * garantizando el aterrizaje automático y la elevación de precisión de la malla.
 * [REFORMA V54.0]: Implementación del 'Automatic Mesh Elevation'. La fachada 
 * ahora detecta la transición de fuente (IP -> GPS) y dispara aterrizajes 
 * cinemáticos automáticos para actualizar la posición del Voyager sin 
 * intervención humana. Sincronía nominal absoluta (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef } from "react";

// --- TRIPARTICIÓN DEL NÚCLEO (V4.9 - CORE COMPOSITION) ---
import { useGeoInterface } from "./geo-engine/interface-core";
import { RadarProvider, useGeoRadar } from "./geo-engine/radar-core";
import { TelemetryProvider, useGeoTelemetry } from "./geo-engine/telemetry-core";

// --- CONTRATOS SOBERANOS E INTELIGENCIA INDUSTRIAL ---
import {
  GeoContextData,
  GeoEngineReturn,
  GeoEngineState
} from "@/types/geo-sovereignty";
import { useForgeOrchestrator } from "./use-forge-orchestrator";

// --- UTILIDADES DE INFRAESTRUCTURA ---
import { nicepodLog } from "@/lib/utils";

const GeoEngineContext = createContext<GeoEngineReturn | undefined>(undefined);

/**
 * GeoFacadeComponent: El Cerebro Sincronizador de la Workstation NicePod.
 * Misión: Fusionar el estado de los núcleos en una firma operativa autónoma.
 */
function GeoFacadeComponent({ children }: { children: React.ReactNode }) {
  const telemetryCore = useGeoTelemetry();
  const radarCore = useGeoRadar();
  const interfaceCore = useGeoInterface();
  const forgeOrchestrator = useForgeOrchestrator();

  const lastTelemetrySourceReference = useRef<string | null>(telemetryCore.telemetrySource);
  const hasPerformedInitialLandingReference = useRef<boolean>(false);
  const hasUpgradedToHardwareFixReference = useRef<boolean>(false);

  /**
   * EFECTO: ORQUESTACIÓN DE AUTO-SINCRO Y ELEVACIÓN
   * Misión: Detectar mejoras en la fuente de verdad y mover la cámara automáticamente.
   */
  useEffect(() => {
    const currentGeographicLocationSnapshot = telemetryCore.userLocation;
    const currentTelemetrySource = telemetryCore.telemetrySource;

    if (currentGeographicLocationSnapshot) {

      /**
       * 1. ATERRIZAJE INICIAL (PROTOCOLO T0)
       * Si el sistema está triangulado (aunque sea por IP), realizamos el primer aterrizaje.
       */
      if (telemetryCore.isTriangulated && !hasPerformedInitialLandingReference.current) {
        nicepodLog(`🚀 [GeoEngine] Aterrizaje Inicial (Fuente: ${currentTelemetrySource}).`);
        interfaceCore.triggerLanding();
        hasPerformedInitialLandingReference.current = true;
        radarCore.fetchRadarIntelligence(currentGeographicLocationSnapshot, true);
      }

      /**
       * 2. ELEVACIÓN AUTOMÁTICA DE MALLA (AUTO-UPGRADE)
       * Misión: Si estábamos en IP y ahora el hardware (GPS/WiFi) responde, 
       * ejecutamos un nuevo aterrizaje hacia la ubicación precisa.
       */
      const isUpgradingFromInternetProtocolToHardware =
        currentTelemetrySource === 'global-positioning-system' &&
        lastTelemetrySourceReference.current === 'edge-internet-protocol';

      if (isUpgradingFromInternetProtocolToHardware && !hasUpgradedToHardwareFixReference.current) {
        nicepodLog("🛰️ [GeoEngine] Elevación de Malla: Sintonía de hardware detectada. Recentrando...");
        interfaceCore.triggerLanding(); // Dispara el movimiento hacia la nueva coordenada real.
        hasUpgradedToHardwareFixReference.current = true;

        // Refrescamos el radar para obtener hitos precisos del entorno real.
        radarCore.fetchRadarIntelligence(currentGeographicLocationSnapshot, true);
      }

      /**
       * 3. EVALUACIÓN DE RESONANCIA SSS
       */
      radarCore.evaluateProximityResonance(currentGeographicLocationSnapshot);

      // Si el Voyager se mueve significativamente, actualizamos el radar en segundo plano.
      radarCore.fetchRadarIntelligence(currentGeographicLocationSnapshot, false);

      lastTelemetrySourceReference.current = currentTelemetrySource;
    }
  }, [
    telemetryCore.userLocation,
    telemetryCore.isTriangulated,
    telemetryCore.telemetrySource,
    radarCore,
    interfaceCore
  ]);

  /**
   * derivedEngineOperationalStatus: Máquina de Estados Finita.
   */
  const derivedEngineOperationalStatus = useMemo((): GeoEngineState => {
    if (forgeOrchestrator.forgeStatus !== 'IDLE') return forgeOrchestrator.forgeStatus;
    if (telemetryCore.isDenied) return 'PERMISSION_DENIED';
    if (telemetryCore.isTriangulated) return 'SENSORS_READY';
    return telemetryCore.isIgnited ? 'SENSORS_READY' : 'IDLE';
  }, [forgeOrchestrator.forgeStatus, telemetryCore.isDenied, telemetryCore.isIgnited, telemetryCore.isTriangulated]);

  /**
   * geoEngineApplicationProgrammingInterface:
   * Composición de la firma pública que satisface el contrato GeoEngineReturn.
   */
  const geoEngineApplicationProgrammingInterface: GeoEngineReturn = {
    status: derivedEngineOperationalStatus,
    userLocation: telemetryCore.userLocation,
    nearbyPointsOfInterest: radarCore.nearbyPointsOfInterest,
    activePointOfInterest: radarCore.activePointOfInterest,
    isTriangulated: telemetryCore.isTriangulated,
    isGPSLock: telemetryCore.isGlobalPositioningSystemLocked,
    isSearching: radarCore.isRadarSearchProcessActive,
    isLocked: forgeOrchestrator.isForgeLocked,
    isIgnited: telemetryCore.isIgnited,
    error: forgeOrchestrator.forgeError || (telemetryCore.isDenied ? "GPS_RESTRICTED" : null),
    data: {
      ...forgeOrchestrator.forgeData,
      ...radarCore.localGeographicData
    } as GeoContextData,

    cameraPerspective: interfaceCore.cameraPerspective,
    mapStyle: interfaceCore.mapStyle,
    isManualMode: interfaceCore.isManualMode,
    needsBallisticLanding: interfaceCore.needsBallisticLanding,
    recenterTrigger: interfaceCore.recenterTrigger,

    confirmLanding: interfaceCore.confirmLanding,
    toggleCameraPerspective: interfaceCore.togglePerspective,
    setManualMode: interfaceCore.setManualMode,

    recenterCamera: () => {
      if (telemetryCore.userLocation) {
        radarCore.fetchRadarIntelligence(telemetryCore.userLocation, true);
      }
      interfaceCore.triggerRecenter();
    },

    initSensors: telemetryCore.initializeHardwareSensors,
    reSyncRadar: () => {
      radarCore.clearRadarIntelligence();
      if (telemetryCore.userLocation) {
        radarCore.fetchRadarIntelligence(telemetryCore.userLocation, true);
      }
      telemetryCore.reSynchronizeSensors();
    },
    setTriangulated: () => telemetryCore.setGeographicTriangulationState(true),
    setManualAnchor: (longitudeCoordinate: number, latitudeCoordinate: number) =>
      telemetryCore.setManualGeographicAnchor(longitudeCoordinate, latitudeCoordinate),
    setManualPlaceName: (placeName: string) => radarCore.setManualGeographicPlaceName(placeName),

    ingestSensoryData: (ingestionParameters) => forgeOrchestrator.ingestSensoryData(telemetryCore.userLocation, {
      heroImage: ingestionParameters.heroImage,
      opticalCharacterRecognitionImages: ingestionParameters.opticalCharacterRecognitionImages,
      ambientAudioBlob: ingestionParameters.ambientAudioBlob,
      administratorIntentText: ingestionParameters.administratorIntentText,
      intentAudioBlob: ingestionParameters.intentAudioBlob,
      categoryMission: ingestionParameters.categoryMission,
      categoryEntity: ingestionParameters.categoryEntity,
      historicalEpoch: ingestionParameters.historicalEpoch,
      resonanceRadiusMeters: ingestionParameters.resonanceRadiusMeters,
      referenceUniformResourceLocator: ingestionParameters.referenceUniformResourceLocator
    }),

    synthesizeNarrative: (synthesisParameters) => forgeOrchestrator.synthesizeNarrative({
      pointOfInterestIdentification: synthesisParameters.pointOfInterestIdentification,
      narrativeDepth: synthesisParameters.narrativeDepth,
      narrativeTone: synthesisParameters.narrativeTone,
      refinedAdministratorIntent: synthesisParameters.refinedAdministratorIntent
    }),

    transcribeVoiceIntent: (audioBinaryBase64Data: string) => forgeOrchestrator.transcribeVoiceIntent(audioBinaryBase64Data),

    reset: () => {
      telemetryCore.terminateHardwareSensors();
      telemetryCore.clearManualGeographicAnchor();
      telemetryCore.setGeographicTriangulationState(false);
      radarCore.clearRadarIntelligence();
      interfaceCore.resetInterface();
      forgeOrchestrator.resetForge();
      hasPerformedInitialLandingReference.current = false;
      hasUpgradedToHardwareFixReference.current = false;
      lastTelemetrySourceReference.current = null;
      nicepodLog("🧹 [GeoEngine] Malla purgada.");
    }
  };

  return (
    <GeoEngineContext.Provider value={geoEngineApplicationProgrammingInterface}>
      {children}
    </GeoEngineContext.Provider>
  );
}

/**
 * GeoEngineProvider: El Contenedor de Inteligencia Geodésica Compartida.
 */
export function GeoEngineProvider({
  children,
  initialData
}: {
  children: React.ReactNode,
  initialData?: {
    latitudeCoordinate: number;
    longitudeCoordinate: number;
    cityName: string;
    geographicSource: string;
  } | null
}) {

  const initialGeographicMetadata = useMemo(() => {
    if (!initialData) return null;
    return {
      latitudeCoordinate: initialData.latitudeCoordinate,
      longitudeCoordinate: initialData.longitudeCoordinate,
      cityName: initialData.cityName,
      geographicSource: initialData.geographicSource
    };
  }, [initialData]);

  return (
    <TelemetryProvider initialGeographicData={initialGeographicMetadata}>
      <RadarProvider>
        <GeoFacadeComponent>
          {children}
        </GeoFacadeComponent>
      </RadarProvider>
    </TelemetryProvider>
  );
}

export function useGeoEngine(): GeoEngineReturn {
  const contextReference = useContext(GeoEngineContext);
  if (!contextReference) {
    throw new Error("CRITICAL_ERROR: 'useGeoEngine' fuera de GeoEngineProvider.");
  }
  return contextReference;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V54.0):
 * 1. Mesh Elevation: El sistema ahora es proactivo. Detecta la transición de 
 *    IP a GPS y dispara el aterrizaje de cámara automáticamente, eliminando 
 *    la fricción de la espera manual.
 * 2. Source Monitoring: Se implementa la vigilancia del cambio de fuente 
 *    mediante 'lastTelemetrySourceReference' para asegurar aterrizajes únicos 
 *    por nivel de calidad.
 * 3. ZAP Enforcement: Purificación nominal total en el 100% de los descriptores.
 */