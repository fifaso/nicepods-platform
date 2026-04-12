/**
 * ARCHIVO: hooks/use-geo-engine.tsx
 * VERSIÓN: 51.0 (NicePod Sovereign Geo-Engine - Hybrid Composition & Tactical Distribution Edition)
 * PROTOCOLO: MADRID RESONANCE V4.8
 * 
 * Misión: Actuar como Fachada Transparente unificando los núcleos de Telemetría, 
 * Radar e Interfaz. Orquesta la inteligencia geoespacial compartida garantizando 
 * que la cinemática de cámara permanezca aislada por instancia.
 * [REFORMA V51.0]: Migración a un modelo de Composición de Hooks. Desacoplamiento 
 * de la Inteligencia Compartida (Location/Radar) de la Voluntad Visual (Cámara). 
 * Sincronización nominal total con la Constitución V8.6 y el Protocolo V4.8.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import React, { useMemo, useEffect, useRef } from "react";

// --- TRIPARTICIÓN DEL NÚCLEO (V4.8 - CORE COMPOSITION) ---
import { useGeoInterface } from "./geo-engine/interface-core";
import { RadarProvider, useGeoRadar } from "./geo-engine/radar-core";
import { TelemetryProvider, useGeoTelemetry } from "./geo-engine/telemetry-core";

// --- CONTRATOS SOBERANOS E INTELIGENCIA INDUSTRIAL ---
import { GeoContextData, GeoEngineReturn, GeoEngineState, IngestionDossier } from "@/types/geo-sovereignty";
import { useForgeOrchestrator } from "./use-forge-orchestrator";

// --- UTILIDADES DE INFRAESTRUCTURA ---
import { nicepodLog } from "@/lib/utils";

/**
 * useGeoEngine:
 * Punto de consumo único para la soberanía geoespacial de la terminal NicePod.
 * [DISEÑO INDUSTRIAL]: Esta fachada combina el estado global de telemetría con 
 * el estado local de la interfaz de cada mapa.
 */
export function useGeoEngine(): GeoEngineReturn {
  const telemetryCore = useGeoTelemetry();
  const radarCore = useGeoRadar();
  const interfaceCore = useGeoInterface();
  const forgeOrchestrator = useForgeOrchestrator();

  const lastTelemetrySourceReference = useRef<string | null>(telemetryCore.telemetrySource);
  const hasPerformedInitialLandingReference = useRef<boolean>(false);

  /**
   * EFECTO: SINCRONIZACIÓN DE PROXIMIDAD Y ATERRIZAJE
   * Misión: Conectar el pulso del hardware con la lógica de inteligencia del radar.
   */
  useEffect(() => {
    const currentGeographicLocation = telemetryCore.userLocation;

    if (currentGeographicLocation) {
      const sourceJustChangedToGlobalPositioningSystem = 
        telemetryCore.telemetrySource === 'global-positioning-system' && 
        lastTelemetrySourceReference.current !== 'global-positioning-system';

      /**
       * 1. DETECCIÓN DE ATERRIZAJE BALÍSTICO:
       * Si el sistema alcanza precisión HD y es un cambio de fuente, disparamos 
       * la animación de aproximación satelital.
       */
      if (telemetryCore.isGlobalPositioningSystemLocked && sourceJustChangedToGlobalPositioningSystem && !hasPerformedInitialLandingReference.current) {
        interfaceCore.triggerLanding();
        hasPerformedInitialLandingReference.current = true;
        radarCore.fetchRadarIntelligence(currentGeographicLocation, true); 
      }

      /**
       * 2. INTELIGENCIA DE PROXIMIDAD SSS (Single Sensory Source):
       * Evaluación de resonancia basada en la telemetría purificada unificada.
       */
      radarCore.evaluateProximityResonance(currentGeographicLocation);
      radarCore.fetchRadarIntelligence(currentGeographicLocation, false); 

      lastTelemetrySourceReference.current = telemetryCore.telemetrySource;
    }
  }, [telemetryCore.userLocation, telemetryCore.isGlobalPositioningSystemLocked, telemetryCore.telemetrySource, radarCore, interfaceCore]);

  /**
   * derivedEngineOperationalStatus: Máquina de Estados Finita Derivada.
   */
  const derivedEngineOperationalStatus = useMemo((): GeoEngineState => {
    if (forgeOrchestrator.forgeStatus !== 'IDLE') return forgeOrchestrator.forgeStatus;
    if (telemetryCore.isDenied) return 'PERMISSION_DENIED';
    return (telemetryCore.isIgnited || telemetryCore.userLocation) ? 'SENSORS_READY' : 'IDLE';
  }, [forgeOrchestrator.forgeStatus, telemetryCore.isDenied, telemetryCore.isIgnited, telemetryCore.userLocation]);

  /**
   * COMPOSICIÓN DE LA API PÚBLICA (CONTRATO V8.6)
   */
  return {
    // I. Estados de Verdad y Telemetría Compartida
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

    // II. Gobernanza Visual y Cinemática (AISLAMIENTO POR INSTANCIA)
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

    // III. Operaciones de Mando de Campo
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

    // IV. Pipeline de Inteligencia (CEREBRO EN EL BORDE)
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
}

/**
 * GeoEngineProvider: El Contenedor de Inteligencia Geodésica Compartida.
 * [MANDATO V7.0]: Se utiliza en el Layout de plataforma para centralizar 
 * la telemetría y el radar, eliminando la redundancia de red.
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
        {children}
      </RadarProvider>
    </TelemetryProvider>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V51.0):
 * 1. Distributed Context Strategy: El 'GeoEngineProvider' ahora solo encapsula los núcleos 
 *    de datos (Telemetry y Radar). El 'InterfaceProvider' debe ser instanciado localmente 
 *    por cada mapa para poseer su propia voluntad cinemática (particular characteristics).
 * 2. Hook Composition: 'useGeoEngine' unifica los tres estados dinámicamente, garantizando 
 *    que la ubicación sea global pero la visión sea local.
 * 3. ZAP Alignment: Purificación total de parámetros (ingestionParameters, audioBinaryBase64Data).
 */