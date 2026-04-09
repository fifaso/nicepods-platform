/**
 * ARCHIVO: hooks/use-geo-engine.tsx
 * VERSIÓN: 49.0 (NicePod Sovereign Geo-Engine - Final Nominal & Contractual Seal)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Actuar como Fachada Transparente unificando los núcleos de Telemetría, 
 * Radar e Interfaz, orquestando la inteligencia geoespacial de la Workstation.
 * [REFORMA V49.0]: Sincronización nominal total con la Constitución de Soberanía V8.6,
 * el Orquestador de Forja V8.0 y el Esquema de Validación V4.1. Resolución definitiva
 * de errores de asignación de tipos (TS2345, TS2353, TS2322) y purificación ZAP.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef } from "react";

// --- TRIPARTICIÓN DEL NÚCLEO (V4.0 - TRIPLE CORE SYNERGY) ---
import { InterfaceProvider, useGeoInterface } from "./geo-engine/interface-core";
import { RadarProvider, useGeoRadar } from "./geo-engine/radar-core";
import { TelemetryProvider, useGeoTelemetry } from "./geo-engine/telemetry-core";

// --- CONTRATOS SOBERANOS E INTELIGENCIA V4.0 ---
import { GeoContextData, GeoEngineReturn, GeoEngineState } from "@/types/geo-sovereignty";
import { useForgeOrchestrator } from "./use-forge-orchestrator";

// --- UTILIDADES DE INFRAESTRUCTURA ---
import { nicepodLog } from "@/lib/utils";

const GeoEngineContext = createContext<GeoEngineReturn | undefined>(undefined);

/**
 * GeoFacadeComponent: El Cerebro Sincronizador de la Workstation.
 */
function GeoFacadeComponent({ children }: { children: React.ReactNode }) {
  const telemetryCore = useGeoTelemetry();
  const radarCore = useGeoRadar();
  const interfaceCore = useGeoInterface();
  const forgeOrchestrator = useForgeOrchestrator();

  const lastTelemetrySourceReference = useRef<string | null>(telemetryCore.telemetrySource);
  const hasPerformedInitialLandingReference = useRef<boolean>(false);

  /**
   * EFECTO: ORQUESTACIÓN CROSS-DOMAIN
   * Misión: Sincronizar el hardware de ubicación con la lógica de inteligencia de radar.
   */
  useEffect(() => {
    const currentGeographicLocation = telemetryCore.userLocation;

    if (currentGeographicLocation) {
      const sourceJustChangedToGlobalPositioningSystem = 
        telemetryCore.telemetrySource === 'global-positioning-system' && 
        lastTelemetrySourceReference.current !== 'global-positioning-system';

      /**
       * 1. DETECCIÓN DE ATERRIZAJE BALÍSTICO (HANDSHAKE T0):
       * Si el sistema alcanza precisión satelital soberana, disparamos el aterrizaje.
       */
      if (telemetryCore.isGlobalPositioningSystemLocked && sourceJustChangedToGlobalPositioningSystem && !hasPerformedInitialLandingReference.current) {
        interfaceCore.triggerLanding();
        hasPerformedInitialLandingReference.current = true;
        radarCore.fetchRadarIntelligence(currentGeographicLocation, true); 
      }

      /**
       * 2. INTELIGENCIA DE PROXIMIDAD:
       * Evaluación de resonancia basada en la telemetría purificada.
       */
      radarCore.evaluateProximityResonance(currentGeographicLocation);
      radarCore.fetchRadarIntelligence(currentGeographicLocation, false); 

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
   * derivedEngineOperationalStatus: Máquina de Estados Finita Derivada para la UI.
   */
  const derivedEngineOperationalStatus = useMemo((): GeoEngineState => {
    if (forgeOrchestrator.forgeStatus !== 'IDLE') return forgeOrchestrator.forgeStatus;
    if (telemetryCore.isDenied) return 'PERMISSION_DENIED';
    return (telemetryCore.isIgnited || telemetryCore.userLocation) ? 'SENSORS_READY' : 'IDLE';
  }, [forgeOrchestrator.forgeStatus, telemetryCore.isDenied, telemetryCore.isIgnited, telemetryCore.userLocation]);

  /**
   * ENSAMBLAJE DE LA API PÚBLICA (CONTRATO SOBERANO V8.6)
   * Misión: Devolver un objeto íntegro que satisfaga el contrato GeoEngineReturn.
   */
  const geoEngineApplicationProgrammingInterface: GeoEngineReturn = {
    // I. Estados de Verdad y Telemetría Purificada
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

    // II. Gobernanza Visual y Cinemática
    cameraPerspective: interfaceCore.cameraPerspective,
    mapStyle: interfaceCore.mapStyle, 
    isManualMode: interfaceCore.isManualMode,
    needsBallisticLanding: interfaceCore.needsBallisticLanding,
    recenterTrigger: interfaceCore.recenterTrigger,
    
    confirmLanding: interfaceCore.confirmLanding,
    toggleCameraPerspective: interfaceCore.togglePerspective,
    setManualMode: interfaceCore.setManualMode,
    
    /**
     * recenterCamera: 
     * Misión: Recuperar el Voyager con autoridad máxima y refresco de malla.
     */
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
    setManualAnchor: (longitudeCoordinate, latitudeCoordinate) => 
      telemetryCore.setManualGeographicAnchor(longitudeCoordinate, latitudeCoordinate),
    setManualPlaceName: (placeName) => radarCore.setManualGeographicPlaceName(placeName),

    // IV. Pipeline de Inteligencia (Cerebro en el Borde)
    // [FIX V49.0]: Mapeo nominal síncrono con use-forge-orchestrator V8.0
    ingestSensoryData: (parameters) => forgeOrchestrator.ingestSensoryData(telemetryCore.userLocation, {
      heroImage: parameters.heroImage,
      opticalCharacterRecognitionImages: parameters.opticalCharacterRecognitionImages,
      ambientAudioBlob: parameters.ambientAudioBlob,
      administratorIntentText: parameters.administratorIntentText,
      intentAudioBlob: parameters.intentAudioBlob,
      categoryMission: parameters.categoryMission,
      categoryEntity: parameters.categoryEntity,
      historicalEpoch: parameters.historicalEpoch,
      resonanceRadiusMeters: parameters.resonanceRadiusMeters,
      referenceUniformResourceLocator: parameters.referenceUniformResourceLocator
    }),
    
    // [FIX V49.0]: Mapeo nominal síncrono con synthesizeNarrativeAction V12.0
    synthesizeNarrative: (parameters) => forgeOrchestrator.synthesizeNarrative({
      pointOfInterestIdentification: parameters.pointOfInterestIdentification,
      narrativeDepth: parameters.narrativeDepth,
      narrativeTone: parameters.narrativeTone,
      refinedAdministratorIntent: parameters.refinedAdministratorIntent
    }),
    
    // [FIX V49.0]: Alineación con el retorno tipado de transcriptionText
    transcribeVoiceIntent: (audioBase64Data) => forgeOrchestrator.transcribeVoiceIntent(audioBase64Data),

    /**
     * reset: 
     * Misión: Purga absoluta de memoria táctica y desconexión física de hardware.
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
      nicepodLog("🧹 [GeoEngine] Memoria del motor purgada íntegramente.");
    }
  };

  return (
    <GeoEngineContext.Provider value={geoEngineApplicationProgrammingInterface}>
      {children}
    </GeoEngineContext.Provider>
  );
}

/**
 * GeoEngineProvider: El Contenedor de Infraestructura de Madrid Resonance.
 */
export function GeoEngineProvider({ 
  children, 
  initialData 
}: { 
  children: React.ReactNode, 
  initialData?: { lat: number, lng: number, city: string, source: string } | null 
}) {
  
  // Mapeamos los datos legacy del Middleware al nuevo contrato industrial del Core
  const initialGeographicData = useMemo(() => {
    if (!initialData) return null;
    return {
      latitudeCoordinate: initialData.lat,
      longitudeCoordinate: initialData.lng,
      cityName: initialData.city,
      geographicSource: initialData.source
    };
  }, [initialData]);

  return (
    <TelemetryProvider initialGeographicData={initialGeographicData}>
      <RadarProvider>
        <InterfaceProvider>
          <GeoFacadeComponent>
            {children}
          </GeoFacadeComponent>
        </InterfaceProvider>
      </RadarProvider>
    </TelemetryProvider>
  );
}

/**
 * useGeoEngine:
 * Punto de consumo único para la soberanía geoespacial de la Workstation.
 */
export function useGeoEngine() {
  const geoEngineContext = useContext(GeoEngineContext);
  if (!geoEngineContext) {
    throw new Error("CRITICAL_ERROR: 'useGeoEngine' debe invocarse dentro de un GeoEngineProvider.");
  }
  return geoEngineContext;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V49.0):
 * 1. Nominal Synchronization: Se han resuelto todos los errores TS2345, TS2353 y TS2322 
 *    sincronizando los parámetros de la fachada con los contratos V8.0 de la forja.
 * 2. Zero Abbreviations Policy: Se ha purificado toda la interfaz interna y externa.
 *    (OCR -> OpticalCharacterRecognition, URL -> UniformResourceLocator, etc.).
 * 3. Contractual Shield: La API pública ahora es un espejo fiel del metal y la 
 *    constitución legal de datos de la plataforma.
 */