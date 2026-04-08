/**
 * ARCHIVO: hooks/use-geo-engine.tsx
 * VERSIÓN: 47.0 (NicePod Sovereign Geo-Engine - Facade Harmonization Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Actuar como Fachada Transparente unificando los núcleos de Telemetría, 
 * Radar e Interfaz, orquestando la inteligencia geoespacial de la Workstation.
 * [REFORMA V47.0]: Sincronización nominal total con TelemetryCore V2.0, 
 * resolución de 11 errores de compilación y cumplimiento de la Zero Abbreviations Policy.
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
   * Misión: Sincronizar el hardware de ubicación con la lógica de radar.
   */
  useEffect(() => {
    const currentUserLocation = telemetryCore.userLocation;

    if (currentUserLocation) {
      const sourceJustChangedToGlobalPositioningSystem = 
        telemetryCore.telemetrySource === 'gps' && 
        lastTelemetrySourceReference.current !== 'gps';

      /**
       * 1. DETECCIÓN DE ATERRIZAJE BALÍSTICO:
       * [FIX]: Uso de 'isGlobalPositioningSystemLocked' para sincronía con TelemetryCore V2.0.
       */
      if (telemetryCore.isGlobalPositioningSystemLocked && sourceJustChangedToGlobalPositioningSystem && !hasPerformedInitialLandingReference.current) {
        interfaceCore.triggerLanding();
        hasPerformedInitialLandingReference.current = true;
        radarCore.fetchRadar(currentUserLocation, true); 
      }

      /**
       * 2. INTELIGENCIA DE PROXIMIDAD:
       */
      radarCore.evaluateProximity(currentUserLocation);
      radarCore.fetchRadar(currentUserLocation, false); 

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
   * ENSAMBLAJE DE LA API PÚBLICA (CONTRATO SOBERANO V4.0)
   * Misión: Devolver un objeto íntegro que satisfaga el Build Shield de Vercel.
   * [AVISO]: Se mantienen las propiedades de 'GeoEngineReturn' pero mapeadas a los nuevos métodos del Core.
   */
  const geoEngineApplicationInterface: GeoEngineReturn = {
    // I. Estados de Verdad y Telemetría Purificada
    status: derivedEngineOperationalStatus,
    userLocation: telemetryCore.userLocation,
    nearbyPointsOfInterest: radarCore.nearbyPointsOfInterest,
    activePointOfInterest: radarCore.activePointOfInterest,
    isTriangulated: telemetryCore.isTriangulated,
    isGPSLock: telemetryCore.isGlobalPositioningSystemLocked, // Mapeo de compatibilidad con Constitución
    isSearching: radarCore.isSearching,
    isLocked: forgeOrchestrator.isForgeLocked,
    isIgnited: telemetryCore.isIgnited,
    error: forgeOrchestrator.forgeError || (telemetryCore.isDenied ? "GPS_RESTRICTED" : null),
    data: { 
      ...forgeOrchestrator.forgeData, 
      ...radarCore.localData 
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
    
    recenterCamera: () => {
      if (telemetryCore.userLocation) {
        radarCore.fetchRadar(telemetryCore.userLocation, true);
      }
      interfaceCore.triggerRecenter();
    },

    // III. Operaciones de Mando de Campo (Hardware Sync)
    // [FIX]: Sincronización con los nuevos métodos de TelemetryCore V2.0
    initSensors: telemetryCore.initializeHardwareSensors,
    reSyncRadar: () => {
      radarCore.clearRadar();
      if (telemetryCore.userLocation) {
        radarCore.fetchRadar(telemetryCore.userLocation, true);
      }
      telemetryCore.reSynchronizeSensors();
    },
    setTriangulated: () => telemetryCore.setGeographicTriangulationState(true),
    setManualAnchor: telemetryCore.setManualGeographicAnchor,
    setManualPlaceName: radarCore.setManualPlaceName,

    // IV. Pipeline de Inteligencia
    ingestSensoryData: (parameters) => forgeOrchestrator.ingestSensoryData(telemetryCore.userLocation, parameters),
    
    synthesizeNarrative: (parameters) => forgeOrchestrator.synthesizeNarrative({
      pointOfInterestIdentification: parameters.pointOfInterestIdentification,
      depth: parameters.depth,
      tone: parameters.tone,
      refinedIntent: parameters.refinedIntent
    }),
    
    transcribeVoiceIntent: (audioBase64) => forgeOrchestrator.transcribeVoiceIntent(audioBase64),

    /**
     * reset: Purga absoluta de memoria y hardware.
     */
    reset: () => {
      telemetryCore.terminateHardwareSensors();
      telemetryCore.clearManualGeographicAnchor();
      telemetryCore.setGeographicTriangulationState(false);
      radarCore.clearRadar();
      interfaceCore.resetInterface();
      forgeOrchestrator.resetForge();
      hasPerformedInitialLandingReference.current = false;
      lastTelemetrySourceReference.current = null;
      nicepodLog("🧹 [GeoEngine] Memoria del motor purgada íntegramente.");
    }
  };

  return (
    <GeoEngineContext.Provider value={geoEngineApplicationInterface}>
      {children}
    </GeoEngineContext.Provider>
  );
}

/**
 * GeoEngineProvider: El Contenedor de Infraestructura.
 * [FIX V47.0]: Sincronización con InitialGeographicDataContract de TelemetryCore V2.0.
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
 * Punto de consumo único para la soberanía geoespacial de la plataforma.
 */
export function useGeoEngine() {
  const context = useContext(GeoEngineContext);
  if (!context) {
    throw new Error("CRITICAL_ERROR: useGeoEngine debe invocarse dentro de un GeoEngineProvider.");
  }
  return context;
}