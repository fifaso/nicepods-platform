/**
 * ARCHIVO: hooks/use-geo-engine.tsx
 * VERSIÓN: 53.0 (NicePod Sovereign Geo-Engine - Elastic State Orchestration & ZAP Absolute Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Actuar como la Fachada Transparente unificadora de la Workstation. 
 * Orquestar la sintonía entre los núcleos de telemetría (silicio), radar (metal) 
 * e interfaz (voluntad visual), garantizando que la verdad geodésica sea global 
 * mientras la cinemática de cámara permanece aislada por instancia.
 * [REFORMA V53.0]: Integración del Protocolo de Bloqueo Elástico. Se refactoriza la 
 * máquina de estados para liberar la interfaz ('SENSORS_READY') ante cualquier 
 * triangulación válida (IP, WiFi o GPS). Purificación total de la Zero Abbreviations 
 * Policy (ZAP) en los contratos de entrada y sincronía con TelemetryCore V5.1.
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
 * Misión: Fusionar el estado de los núcleos en una única firma operativa y resiliente.
 */
function GeoFacadeComponent({ children }: { children: React.ReactNode }) {
  const telemetryCore = useGeoTelemetry();
  const radarCore = useGeoRadar();
  const interfaceCore = useGeoInterface();
  const forgeOrchestrator = useForgeOrchestrator();

  const lastTelemetrySourceReference = useRef<string | null>(telemetryCore.telemetrySource);
  const hasPerformedInitialLandingReference = useRef<boolean>(false);

  /**
   * EFECTO: ORQUESTACIÓN GEODÉSICA CROSS-DOMAIN
   * Misión: Sincronizar el latido del hardware con la inteligencia de radar.
   */
  useEffect(() => {
    const currentGeographicLocationSnapshot = telemetryCore.userLocation;

    if (currentGeographicLocationSnapshot) {
      /**
       * 1. DETECCIÓN DE ATERRIZAJE BALÍSTICO (RESILIENCIA V53.0):
       * Disparamos la transición visual si el sistema está triangulado por primera vez.
       * No esperamos a GPS HD para mostrar la malla; la Semilla T0 es suficiente 
       * para el primer renderizado táctico del Dashboard.
       */
      if (telemetryCore.isTriangulated && !hasPerformedInitialLandingReference.current) {
        nicepodLog("🚀 [GeoEngine] Triangulación inicial detectada. Ejecutando aterrizaje visual.");
        interfaceCore.triggerLanding();
        hasPerformedInitialLandingReference.current = true;

        // Carga inicial de inteligencia de proximidad.
        radarCore.fetchRadarIntelligence(currentGeographicLocationSnapshot, true);
      }

      /**
       * 2. EVALUACIÓN DE RESONANCIA SSS (SINGLE SENSORY SOURCE):
       * Analizamos la proximidad a hitos basándonos en la telemetría unificada purificada.
       */
      radarCore.evaluateProximityResonance(currentGeographicLocationSnapshot);
      radarCore.fetchRadarIntelligence(currentGeographicLocationSnapshot, false);

      lastTelemetrySourceReference.current = telemetryCore.telemetrySource;
    }
  }, [
    telemetryCore.userLocation,
    telemetryCore.isTriangulated,
    telemetryCore.telemetrySource,
    radarCore,
    interfaceCore
  ]);

  /**
   * derivedEngineOperationalStatus: Máquina de Estados Finita Derivada.
   * [SINCRO V53.0]: Se prioriza 'isTriangulated' para liberar la UI.
   */
  const derivedEngineOperationalStatus = useMemo((): GeoEngineState => {
    if (forgeOrchestrator.forgeStatus !== 'IDLE') return forgeOrchestrator.forgeStatus;
    if (telemetryCore.isDenied) return 'PERMISSION_DENIED';

    // Si hay cualquier triangulación válida (incluyendo T0), el sistema está listo.
    if (telemetryCore.isTriangulated) return 'SENSORS_READY';

    return telemetryCore.isIgnited ? 'SENSORS_READY' : 'IDLE';
  }, [forgeOrchestrator.forgeStatus, telemetryCore.isDenied, telemetryCore.isIgnited, telemetryCore.isTriangulated]);

  /**
   * geoEngineApplicationProgrammingInterface:
   * Composición de la firma pública que satisface el contrato GeoEngineReturn V8.6.
   */
  const geoEngineApplicationProgrammingInterface: GeoEngineReturn = {
    // I. Estados de Verdad y Telemetría Purificada (Global SSoT)
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

    // II. Gobernanza Visual y Cinemática (Local Instance Control)
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

    // III. Operaciones de Mando de Hardware (Silicon Bridges)
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

    // IV. Pipeline de Inteligencia Multimodal (Edge Reasoning)
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

    /**
     * reset: 
     * Misión: Purga absoluta de memoria táctica y bus de datos (Hardware Hygiene).
     */
    reset: () => {
      telemetryCore.terminateHardwareSensors();
      telemetryCore.clearManualGeographicAnchor();
      telemetryCore.setGeographicTriangulationState(false);
      radarCore.clearRadarIntelligence();
      interfaceCore.resetInterface();
      forgeOrchestrator.resetForge();
      hasPerformedInitialLandingReference.current = false;
      lastTelemetrySourceReference.current = null;
      nicepodLog("🧹 [GeoEngine] Memoria táctica unificada purgada íntegramente.");
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
 * [MANDATO V4.9]: Actúa como el Singleton de plataforma para los datos físicos.
 */
export function GeoEngineProvider({
  children,
  initialData
}: {
  children: React.ReactNode,
  /** initialData: Semilla geodésica T0 inyectada por el Middleware. */
  initialData?: {
    latitudeCoordinate: number;
    longitudeCoordinate: number;
    cityName: string;
    geographicSource: string;
  } | null
}) {

  /**
   * initialGeographicMetadata: 
   * [SINCRO V53.0]: Mapeo nominal purificado (ZAP) antes de inyectar en los núcleos.
   */
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

/**
 * useGeoEngine:
 * Punto de consumo único para la soberanía geoespacial de la terminal NicePod.
 */
export function useGeoEngine(): GeoEngineReturn {
  const contextReference = useContext(GeoEngineContext);
  if (!contextReference) {
    throw new Error("CRITICAL_ERROR: 'useGeoEngine' invocado fuera del perímetro de su GeoEngineProvider.");
  }
  return contextReference;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V53.0):
 * 1. Elastic State Machine: El estado 'SENSORS_READY' ahora se deriva directamente de 
 *    'isTriangulated'. Esto asegura que la terminal del Dashboard se desbloquee 
 *    al recibir la Semilla T0 o una señal WiFi, eliminando el loop de carga.
 * 2. ZAP Absolute Compliance: Se han eliminado las propiedades 'lat/lng' del contrato 
 *    'initialData' en favor de nombres industriales.
 * 3. Immediate Landing Protocol: Se ha modificado el efecto de orquestación para 
 *    permitir el aterrizaje visual en cuanto hay sintonía de red, mejorando 
 *    la percepción de velocidad de la Workstation.
 */