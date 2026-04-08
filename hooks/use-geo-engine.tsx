/**
 * ARCHIVO: hooks/use-geo-engine.tsx
 * VERSIÓN: 48.0 (NicePod Sovereign Geo-Engine - Final Nominal Seal)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Actuar como Fachada Transparente unificando los núcleos de Telemetría, 
 * Radar e Interfaz, orquestando la inteligencia geoespacial de la Workstation.
 * [REFORMA V48.0]: Sincronización nominal total con RadarCore V2.0, resolución 
 * definitiva de 10 errores de compilación TS2339 y sellado del Build Shield.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef } from "react";

// --- TRIPARTICIÓN DEL NÚCLEO (V4.0 - TRIPLE CORE) ---
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
        telemetryCore.telemetrySource === 'gps' && 
        lastTelemetrySourceReference.current !== 'gps';

      /**
       * 1. DETECCIÓN DE ATERRIZAJE BALÍSTICO (HANDSHAKE T0):
       * Si el sistema alcanza precisión satelital soberana, disparamos el aterrizaje.
       */
      if (telemetryCore.isGlobalPositioningSystemLocked && sourceJustChangedToGlobalPositioningSystem && !hasPerformedInitialLandingReference.current) {
        interfaceCore.triggerLanding();
        hasPerformedInitialLandingReference.current = true;
        // [FIX V48.0]: Sincronía con RadarCore V2.0
        radarCore.fetchRadarIntelligence(currentGeographicLocation, true); 
      }

      /**
       * 2. INTELIGENCIA DE PROXIMIDAD:
       * Evaluación de resonancia basada en la telemetría purificada.
       */
      // [FIX V48.0]: Sincronía con RadarCore V2.0
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
   * ENSAMBLAJE DE LA API PÚBLICA (CONTRATO SOBERANO V4.0)
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
    // [FIX V48.0]: Sincronía con RadarCore V2.0
    isSearching: radarCore.isRadarSearchProcessActive,
    isLocked: forgeOrchestrator.isForgeLocked,
    isIgnited: telemetryCore.isIgnited,
    error: forgeOrchestrator.forgeError || (telemetryCore.isDenied ? "GPS_RESTRICTED" : null),
    data: { 
      ...forgeOrchestrator.forgeData, 
      // [FIX V48.0]: Sincronía con RadarCore V2.0
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
        // [FIX V48.0]: Sincronía con RadarCore V2.0
        radarCore.fetchRadarIntelligence(telemetryCore.userLocation, true);
      }
      interfaceCore.triggerRecenter();
    },

    // III. Operaciones de Mando de Campo
    initSensors: telemetryCore.initializeHardwareSensors,
    reSyncRadar: () => {
      // [FIX V48.0]: Sincronía con RadarCore V2.0
      radarCore.clearRadarIntelligence();
      if (telemetryCore.userLocation) {
        radarCore.fetchRadarIntelligence(telemetryCore.userLocation, true);
      }
      telemetryCore.reSynchronizeSensors();
    },
    setTriangulated: () => telemetryCore.setGeographicTriangulationState(true),
    setManualAnchor: telemetryCore.setManualGeographicAnchor,
    // [FIX V48.0]: Sincronía con RadarCore V2.0
    setManualPlaceName: radarCore.setManualGeographicPlaceName,

    // IV. Pipeline de Inteligencia (Cerebro en el Borde)
    ingestSensoryData: (parameters) => forgeOrchestrator.ingestSensoryData(telemetryCore.userLocation, parameters),
    
    synthesizeNarrative: (parameters) => forgeOrchestrator.synthesizeNarrative({
      pointOfInterestIdentification: parameters.pointOfInterestIdentification,
      depth: parameters.depth,
      tone: parameters.tone,
      refinedIntent: parameters.refinedIntent
    }),
    
    transcribeVoiceIntent: (audioBase64) => forgeOrchestrator.transcribeVoiceIntent(audioBase64),

    /**
     * reset: 
     * Misión: Purga absoluta de memoria táctica y desconexión física de hardware.
     */
    reset: () => {
      telemetryCore.terminateHardwareSensors();
      telemetryCore.clearManualGeographicAnchor();
      telemetryCore.setGeographicTriangulationState(false);
      // [FIX V48.0]: Sincronía con RadarCore V2.0
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
 * NOTA TÉCNICA DEL ARCHITECT (V48.0):
 * 1. Nominal Synchronization: Se han resuelto los 10 errores TS2339 sincronizando la fachada 
 *    con la versión 2.0 del RadarCore.
 * 2. Zero Abbreviations Policy: Purificación absoluta de la nomenclatura interna del motor.
 * 3. Atomic Handshake: Se mantiene el protocolo de aterrizaje balístico al obtener el 
 *    bloqueo de precisión GPS (Global Positioning System Locked).
 */