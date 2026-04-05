/**
 * ARCHIVO: hooks/use-geo-engine.tsx
 * VERSIÓN: 46.0 (NicePod Sovereign Geo-Engine - Full Descriptive Symmetry Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Actuar como Fachada Transparente unificando los núcleos de Telemetría, 
 * Radar e Interfaz bajo el estándar de "Cero Abreviaciones".
 * [FIX V46.0]: Resolución de error TS2339 mediante la sincronización nominal de las 
 * propiedades 'nearbyPointsOfInterest' y 'activePointOfInterest' del RadarCore.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef } from "react";

// --- TRIPARTICIÓN DEL NÚCLEO (V3.0 - TRIPLE CORE) ---
import { InterfaceProvider, useGeoInterface } from "./geo-engine/interface-core";
import { RadarProvider, useGeoRadar } from "./geo-engine/radar-core";
import { TelemetryProvider, useGeoTelemetry } from "./geo-engine/telemetry-core";

// --- CONTRATOS SOBERANOS Y INTELIGENCIA ---
import { GeoContextData, GeoEngineReturn, GeoEngineState } from "@/types/geo-sovereignty";
import { useForgeOrchestrator } from "./use-forge-orchestrator";

// --- UTILIDADES DE INFRAESTRUCTURA ---
import { nicepodLog } from "@/lib/utils";

const GeoEngineContext = createContext<GeoEngineReturn | undefined>(undefined);

/**
 * GeoFacadeComponent: El Cerebro Sincronizador de la Workstation.
 * Misión: Consumir los 3 núcleos y orquestar sus interacciones transversales.
 */
function GeoFacadeComponent({ children }: { children: React.ReactNode }) {
  const telemetryCore = useGeoTelemetry();
  const radarCore = useGeoRadar();
  const interfaceCore = useGeoInterface();
  const forgeOrchestrator = useForgeOrchestrator();

  const lastSourceReference = useRef<string | null>(telemetryCore.telemetrySource);
  const hasPerformedInitialLandingReference = useRef<boolean>(false);

  /**
   * EFECTO: ORQUESTACIÓN CROSS-DOMAIN
   * Misión: Sincronizar el hardware con la lógica de red y la intención de la UI.
   */
  useEffect(() => {
    const currentUserLocation = telemetryCore.userLocation;

    if (currentUserLocation) {
      const sourceJustChangedToGPS = 
        telemetryCore.telemetrySource === 'gps' && 
        lastSourceReference.current !== 'gps';

      /**
       * 1. DETECCIÓN DE ATERRIZAJE BALÍSTICO (IP -> GPS)
       * Si el sistema alcanza precisión satelital, disparamos el aterrizaje visual.
       */
      if (telemetryCore.isGPSLock && sourceJustChangedToGPS && !hasPerformedInitialLandingReference.current) {
        interfaceCore.triggerLanding();
        hasPerformedInitialLandingReference.current = true;
        radarCore.fetchRadar(currentUserLocation, true); // Cosecha forzada
      }

      /**
       * 2. INTELIGENCIA DE PROXIMIDAD:
       * Evaluación de resonancia basada en la telemetría purificada.
       */
      radarCore.evaluateProximity(currentUserLocation);
      radarCore.fetchRadar(currentUserLocation, false); // Cosecha Throttled (150m)

      lastSourceReference.current = telemetryCore.telemetrySource;
    }
  }, [
    telemetryCore.userLocation, 
    telemetryCore.isGPSLock, 
    telemetryCore.telemetrySource, 
    radarCore, 
    interfaceCore
  ]);

  /**
   * derivedEngineStatus: Máquina de Estados Finita Derivada para la UI.
   */
  const derivedEngineStatus = useMemo((): GeoEngineState => {
    if (forgeOrchestrator.forgeStatus !== 'IDLE') return forgeOrchestrator.forgeStatus;
    if (telemetryCore.isDenied) return 'PERMISSION_DENIED';
    return (telemetryCore.isIgnited || telemetryCore.userLocation) ? 'SENSORS_READY' : 'IDLE';
  }, [forgeOrchestrator.forgeStatus, telemetryCore.isDenied, telemetryCore.isIgnited, telemetryCore.userLocation]);

  /**
   * ENSAMBLAJE DE LA API PÚBLICA (CONTRATO SOBERANO V8.0)
   * Misión: Devolver un objeto íntegro donde los núcleos colaboran sin competir.
   */
  const geoEngineApi: GeoEngineReturn = {
    // I. Estados de Verdad y Telemetría Purificada
    status: derivedEngineStatus,
    userLocation: telemetryCore.userLocation,
    nearbyPointsOfInterest: radarCore.nearbyPointsOfInterest, // [FIX V46.0]
    activePointOfInterest: radarCore.activePointOfInterest,   // [FIX V46.0]
    isTriangulated: telemetryCore.isTriangulated,
    isGPSLock: telemetryCore.isGPSLock,
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
    
    /**
     * recenterCamera: 
     * Misión: Recuperar el Voyager con autoridad máxima y refresco de malla.
     */
    recenterCamera: () => {
      if (telemetryCore.userLocation) {
        radarCore.fetchRadar(telemetryCore.userLocation, true);
      }
      interfaceCore.triggerRecenter();
    },

    // III. Operaciones de Mando de Campo
    initSensors: telemetryCore.initSensors,
    reSyncRadar: () => {
      radarCore.clearRadar();
      if (telemetryCore.userLocation) {
        radarCore.fetchRadar(telemetryCore.userLocation, true);
      }
      telemetryCore.reSyncSensors();
    },
    setTriangulated: () => telemetryCore.setTriangulated(true),
    setManualAnchor: telemetryCore.setManualAnchor,
    setManualPlaceName: radarCore.setManualPlaceName,

    // IV. Pipeline de Inteligencia (Cerebro en el Borde)
    ingestSensoryData: (parameters) => forgeOrchestrator.ingestSensoryData(telemetryCore.userLocation, parameters),
    synthesizeNarrative: (parameters) => forgeOrchestrator.synthesizeNarrative(parameters),
    transcribeVoiceIntent: (audioBase64) => forgeOrchestrator.transcribeVoiceIntent(audioBase64),

    /**
     * reset: 
     * Misión: Purga absoluta de memoria táctica y desconexión física de hardware.
     */
    reset: () => {
      telemetryCore.killSensors();
      telemetryCore.clearManualAnchor();
      telemetryCore.setTriangulated(false);
      radarCore.clearRadar();
      interfaceCore.resetInterface();
      forgeOrchestrator.resetForge();
      hasPerformedInitialLandingReference.current = false;
      lastSourceReference.current = null;
      nicepodLog("🧹 [GeoEngine] Memoria del motor purgada íntegramente.");
    }
  };

  return (
    <GeoEngineContext.Provider value={geoEngineApi}>
      {children}
    </GeoEngineContext.Provider>
  );
}

/**
 * GeoEngineProvider: El Contenedor de Infraestructura.
 * Misión: Envolver la plataforma en la jerarquía de núcleos necesaria.
 */
export function GeoEngineProvider({ 
  children, 
  initialData 
}: { 
  children: React.ReactNode, 
  initialData?: any 
}) {
  return (
    <TelemetryProvider initialData={initialData}>
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