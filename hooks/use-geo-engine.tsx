/**
 * ARCHIVO: hooks/use-geo-engine.tsx
 * VERSIÓN: 45.1 (NicePod Sovereign Geo-Engine - Log Integrity & Triple-Core Facade)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Actuar como Fachada Transparente unificando los núcleos de Telemetría, 
 * Radar e Interfaz. Provee el contrato GeoEngineReturn sin generar competencia 
 * de hilos ni bucles de re-renderizado.
 * [FIX V45.1]: Inclusión de importación nicepodLog para resolver error de compilación.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef } from "react";

// --- TRIPARTICIÓN DEL NÚCLEO (V3.0) ---
import { InterfaceProvider, useGeoInterface } from "./geo-engine/interface-core";
import { RadarProvider, useGeoRadar } from "./geo-engine/radar-core";
import { TelemetryProvider, useGeoTelemetry } from "./geo-engine/telemetry-core";

// --- CONTRATOS SOBERANOS Y IA ---
import { GeoContextData, GeoEngineReturn, GeoEngineState } from "@/types/geo-sovereignty";
import { useForgeOrchestrator } from "./use-forge-orchestrator";

// --- UTILIDADES DE INFRAESTRUCTURA ---
import { nicepodLog } from "@/lib/utils";

const GeoEngineContext = createContext<GeoEngineReturn | undefined>(undefined);

/**
 * GeoFacadeComponent: El Cerebro Sincronizador.
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
   * Misión: Sincronizar el hardware con la lógica de red y la interfaz táctica.
   */
  useEffect(() => {
    const currentLocation = telemetryCore.userLocation;

    if (currentLocation) {
      const sourceJustChangedToGPS = 
        telemetryCore.telemetrySource === 'gps' && 
        lastSourceReference.current !== 'gps';

      /**
       * 1. DETECCIÓN DE ATERRIZAJE BALÍSTICO (Handshake T0):
       * Si pasamos de IP a GPS de alta fidelidad, disparamos el aterrizaje.
       */
      if (telemetryCore.isGPSLock && sourceJustChangedToGPS && !hasPerformedInitialLandingReference.current) {
        interfaceCore.triggerLanding();
        hasPerformedInitialLandingReference.current = true;
        radarCore.fetchRadar(currentLocation, true); 
      }

      /**
       * 2. INTELIGENCIA DE PROXIMIDAD:
       * Evaluación de resonancia basada en telemetría purificada.
       */
      radarCore.evaluateProximity(currentLocation);
      radarCore.fetchRadar(currentLocation, false); 

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
   * derivedStatus: Máquina de Estados Finita Derivada para la UI.
   */
  const derivedStatus = useMemo((): GeoEngineState => {
    if (forgeOrchestrator.forgeStatus !== 'IDLE') return forgeOrchestrator.forgeStatus;
    if (telemetryCore.isDenied) return 'PERMISSION_DENIED';
    return (telemetryCore.isIgnited || telemetryCore.userLocation) ? 'SENSORS_READY' : 'IDLE';
  }, [forgeOrchestrator.forgeStatus, telemetryCore.isDenied, telemetryCore.isIgnited, telemetryCore.userLocation]);

  /**
   * ENSAMBLAJE DE LA API PÚBLICA (CONTRATO SOBERANO V7.1)
   */
  const geoEngineApi: GeoEngineReturn = {
    // I. Estados de Verdad y Telemetría
    status: derivedStatus,
    userLocation: telemetryCore.userLocation,
    nearbyPOIs: radarCore.nearbyPOIs,
    activePOI: radarCore.activePOI,
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

    // IV. Pipeline de Inteligencia (Agente 42)
    ingestSensoryData: (params) => forgeOrchestrator.ingestSensoryData(telemetryCore.userLocation, params),
    synthesizeNarrative: forgeOrchestrator.synthesizeNarrative,
    transcribeVoiceIntent: forgeOrchestrator.transcribeVoiceIntent,

    /**
     * reset: 
     * Misión: Purga absoluta de memoria táctica y desconexión de hardware.
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