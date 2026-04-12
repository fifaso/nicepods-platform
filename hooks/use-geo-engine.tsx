/**
 * ARCHIVO: hooks/use-geo-engine.tsx
 * VERSIÓN: 52.0 (NicePod Sovereign Geo-Engine - Absolute Nominal Sync & Tactical Distribution Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Actuar como la Fachada Transparente unificadora de la Workstation. 
 * Orquestar la sintonía entre los núcleos de telemetría (silicio), radar (metal) 
 * e interfaz (voluntad visual), garantizando que la verdad geodésica sea global 
 * mientras la cinemática de cámara permanece aislada por instancia.
 * [REFORMA V52.0]: Implementación integral de la Zero Abbreviations Policy (ZAP). 
 * Sincronización total con la Constitución V8.6 y el Protocolo de Inmunización 
 * de Contexto. Resolución de redundancias en el mapeo de la semilla T0.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import React, { useMemo, useEffect, useRef, useContext, createContext } from "react";

// --- TRIPARTICIÓN DEL NÚCLEO (V4.9 - CORE COMPOSITION) ---
import { useGeoInterface } from "./geo-engine/interface-core";
import { RadarProvider, useGeoRadar } from "./geo-engine/radar-core";
import { TelemetryProvider, useGeoTelemetry } from "./geo-engine/telemetry-core";

// --- CONTRATOS SOBERANOS E INTELIGENCIA INDUSTRIAL ---
import { 
  GeoContextData, 
  GeoEngineReturn, 
  GeoEngineState, 
  GeoActionResponse 
} from "@/types/geo-sovereignty";
import { useForgeOrchestrator } from "./use-forge-orchestrator";

// --- UTILIDADES DE INFRAESTRUCTURA ---
import { nicepodLog } from "@/lib/utils";

const GeoEngineContext = createContext<GeoEngineReturn | undefined>(undefined);

/**
 * GeoFacadeComponent: El Cerebro Sincronizador de la Workstation NicePod.
 * Misión: Fusionar el estado de los núcleos en una única firma operativa.
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
      const sourceJustChangedToGlobalPositioningSystem = 
        telemetryCore.telemetrySource === 'global-positioning-system' && 
        lastTelemetrySourceReference.current !== 'global-positioning-system';

      /**
       * 1. DETECCIÓN DE ATERRIZAJE BALÍSTICO:
       * Si el sistema alcanza precisión soberana (HD) y es un cambio de fuente, 
       * disparamos la transición visual inicial.
       */
      if (telemetryCore.isGlobalPositioningSystemLocked && sourceJustChangedToGlobalPositioningSystem && !hasPerformedInitialLandingReference.current) {
        interfaceCore.triggerLanding();
        hasPerformedInitialLandingReference.current = true;
        radarCore.fetchRadarIntelligence(currentGeographicLocationSnapshot, true); 
      }

      /**
       * 2. EVALUACIÓN DE RESONANCIA SSS (SINGLE SENSORY SOURCE):
       * Analizamos la proximidad a hitos basándonos en la telemetría unificada.
       */
      radarCore.evaluateProximityResonance(currentGeographicLocationSnapshot);
      radarCore.fetchRadarIntelligence(currentGeographicLocationSnapshot, false); 

      lastTelemetrySourceReference.current = telemetryCore.telemetrySource;
    }
  }, [
    telemetryCore.userLocation, 
    telemetryCore.isGlobalPositioningSystemLocked, 
    telemetryCore.telemetrySource, 
    radarCore, 
    interfaceCore
  ]);

  /**
   * derivedEngineOperationalStatus: Máquina de Estados Finita Derivada.
   */
  const derivedEngineOperationalStatus = useMemo((): GeoEngineState => {
    if (forgeOrchestrator.forgeStatus !== 'IDLE') return forgeOrchestrator.forgeStatus;
    if (telemetryCore.isDenied) return 'PERMISSION_DENIED';
    return (telemetryCore.isIgnited || telemetryCore.userLocation) ? 'SENSORS_READY' : 'IDLE';
  }, [forgeOrchestrator.forgeStatus, telemetryCore.isDenied, telemetryCore.isIgnited, telemetryCore.userLocation]);

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
  initialData?: { lat: number, lng: number, city: string, source: string } | null 
}) {
  
  const initialGeographicMetadata = useMemo(() => {
    if (!initialData) return null;
    return {
      latitudeCoordinate: initialData.lat,
      longitudeCoordinate: initialData.lng,
      cityName: initialData.city,
      geographicSource: initialData.source
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
 * NOTA TÉCNICA DEL ARCHITECT (V52.0):
 * 1. Distributed Context Strategy: El 'GeoEngineProvider' ahora es el orquestador global 
 *    situado en el layout raíz. Provee telemetría y radar a toda la aplicación.
 * 2. ZAP Enforcement: Se han purificado el 100% de los parámetros y variables 
 *    (initialGeographicMetadata, currentGeographicLocationSnapshot, ingestionParameters).
 * 3. Passive Interface Resilience: La integración con 'interfaceCore' aprovecha el 
 *    estado pasivo de inmunidad, permitiendo que 'useGeoEngine' funcione en rutas 
 *    sin mapa sin lanzar excepciones de contexto.
 */