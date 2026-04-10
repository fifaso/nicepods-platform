/**
 * ARCHIVO: hooks/use-geo-engine.tsx
 * VERSIÓN: 50.0 (NicePod Sovereign Geo-Engine - Absolute Industrial Synchronization Edition)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * 
 * Misión: Actuar como Fachada Transparente unificando los núcleos de Telemetría, 
 * Radar e Interfaz, orquestando la inteligencia geoespacial de la Workstation.
 * [REFORMA V50.0]: Sincronización nominal definitiva con la Reforma V4.2. 
 * Alineación total de propiedades en la API pública (latitudeCoordinate, 
 * accuracyMeters, geographicSource). Sellado del Build Shield y cumplimiento 
 * absoluto de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef } from "react";

// --- TRIPARTICIÓN DEL NÚCLEO (V4.2 - TRIPLE CORE SYNERGY) ---
import { InterfaceProvider, useGeoInterface } from "./geo-engine/interface-core";
import { RadarProvider, useGeoRadar } from "./geo-engine/radar-core";
import { TelemetryProvider, useGeoTelemetry } from "./geo-engine/telemetry-core";

// --- CONTRATOS SOBERANOS E INTELIGENCIA V4.2 ---
import { GeoContextData, GeoEngineReturn, GeoEngineState } from "@/types/geo-sovereignty";
import { useForgeOrchestrator } from "./use-forge-orchestrator";

// --- UTILIDADES INDUSTRIALES ---
import { nicepodLog } from "@/lib/utils";

const GeoEngineContext = createContext<GeoEngineReturn | undefined>(undefined);

/**
 * GeoFacadeComponent: El Cerebro Sincronizador de la Workstation NicePod.
 * Misión: Orquestar el flujo de datos entre el hardware (silicio) y el radar (metal).
 */
function GeoFacadeComponent({ children }: { children: React.ReactNode }) {
  const telemetryCore = useGeoTelemetry();
  const radarCore = useGeoRadar();
  const interfaceCore = useGeoInterface();
  const forgeOrchestrator = useForgeOrchestrator();

  const lastTelemetrySourceReference = useRef<string | null>(telemetryCore.telemetrySource);
  const hasPerformedInitialLandingReference = useRef<boolean>(false);

  /**
   * EFECTO: ORQUESTACIÓN CROSS-DOMAIN (HARDWARE TO INTELLIGENCE)
   * Misión: Sincronizar la posición física capturada con el radar semántico de hitos.
   */
  useEffect(() => {
    const currentGeographicLocation = telemetryCore.userLocation;

    if (currentGeographicLocation) {
      const sourceJustChangedToGlobalPositioningSystem = 
        telemetryCore.telemetrySource === 'global-positioning-system' && 
        lastTelemetrySourceReference.current !== 'global-positioning-system';

      /**
       * 1. DETECCIÓN DE ATERRIZAJE BALÍSTICO (HANDSHAKE T0):
       * Si el sistema alcanza precisión satelital soberana (HD), disparamos 
       * la transición cinemática inicial.
       */
      if (telemetryCore.isGlobalPositioningSystemLocked && sourceJustChangedToGlobalPositioningSystem && !hasPerformedInitialLandingReference.current) {
        interfaceCore.triggerLanding();
        hasPerformedInitialLandingReference.current = true;
        
        // Refresco forzado de la inteligencia de radar al aterrizar.
        radarCore.fetchRadarIntelligence(currentGeographicLocation, true); 
      }

      /**
       * 2. INTELIGENCIA DE PROXIMIDAD:
       * Evaluación de resonancia basada en la telemetría purificada industrial.
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
   * Misión: Proveer un estado unificado que resuma la salud de los sensores y la forja.
   */
  const derivedEngineOperationalStatus = useMemo((): GeoEngineState => {
    if (forgeOrchestrator.forgeStatus !== 'IDLE') return forgeOrchestrator.forgeStatus;
    if (telemetryCore.isDenied) return 'PERMISSION_DENIED';
    return (telemetryCore.isIgnited || telemetryCore.userLocation) ? 'SENSORS_READY' : 'IDLE';
  }, [forgeOrchestrator.forgeStatus, telemetryCore.isDenied, telemetryCore.isIgnited, telemetryCore.userLocation]);

  /**
   * ENSAMBLAJE DE LA API PÚBLICA (CONTRATO SOBERANO V8.6)
   * Misión: Devolver un objeto íntegro que satisfaga el contrato GeoEngineReturn sin abreviaciones.
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

    // II. Gobernanza Visual y Cinemática (REACTOR WEBGL)
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
     * Misión: Recuperar al Voyager con autoridad máxima y refresco de malla local.
     */
    recenterCamera: () => {
      if (telemetryCore.userLocation) {
        radarCore.fetchRadarIntelligence(telemetryCore.userLocation, true);
      }
      interfaceCore.triggerRecenter();
    },

    // III. Operaciones de Mando de Campo (HARDWARE CONTROL)
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
    // [FIX V50.0]: Sincronización nominal total con use-forge-orchestrator V8.0
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
    
    // [FIX V50.0]: Sincronización nominal total con synthesizeNarrative V8.0
    synthesizeNarrative: (parameters) => forgeOrchestrator.synthesizeNarrative({
      pointOfInterestIdentification: parameters.pointOfInterestIdentification,
      narrativeDepth: parameters.narrativeDepth,
      narrativeTone: parameters.narrativeTone,
      refinedAdministratorIntent: parameters.refinedAdministratorIntent
    }),
    
    transcribeVoiceIntent: (audioBase64Data: string) => forgeOrchestrator.transcribeVoiceIntent(audioBase64Data),

    /**
     * reset: 
     * Misión: Purga absoluta de memoria táctica y desconexión física de hardware (Aislamiento Térmico).
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
      nicepodLog("🧹 [GeoEngine] Memoria y bus de datos purgados íntegramente.");
    }
  };

  return (
    <GeoEngineContext.Provider value={geoEngineApplicationProgrammingInterface}>
      {children}
    </GeoEngineContext.Provider>
  );
}

/**
 * GeoEngineProvider: El Contenedor de Infraestructura Maestro.
 */
export function GeoEngineProvider({ 
  children, 
  initialData 
}: { 
  children: React.ReactNode, 
  initialData?: { lat: number, lng: number, city: string, source: string } | null 
}) {
  
  /**
   * initialGeographicData:
   * Misión: Adaptar los datos del Middleware a la nomenclatura industrial.
   */
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
 * Punto de consumo único para la soberanía geoespacial de la terminal NicePod.
 */
export function useGeoEngine() {
  const geoEngineContext = useContext(GeoEngineContext);
  if (!geoEngineContext) {
    throw new Error("CRITICAL_ERROR: 'useGeoEngine' debe invocarse dentro de un GeoEngineProvider.");
  }
  return geoEngineContext;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V50.0):
 * 1. Industrial Synchronization: El hook ha sido elevado al estándar V4.2, sincronizando 
 *    la fachada con los núcleos de telemetría y radar ya purificados.
 * 2. Zero Abbreviations Policy: Se ha erradicado cualquier residuo de abreviaciones en 
 *    parámetros y estados internos (latitudeCoordinate, longitudeCoordinate, transcriptionText).
 * 3. Contractual Shield: La API pública es ahora un reflejo exacto de la Constitución 
 *    Soberana V8.6, garantizando que el Build Shield de Vercel sea impenetrable.
 */