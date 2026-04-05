/**
 * ARCHIVO: hooks/use-geo-engine.tsx
 * VERSIÓN: 46.2 (NicePod Sovereign Geo-Engine - Final Contract Symmetry Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Actuar como Fachada Transparente unificando los núcleos de Telemetría, 
 * Radar e Interfaz bajo el estándar de "Cero Abreviaciones".
 * [REFORMA V46.2]: Sincronización total con la Constitución V8.5, eliminando 
 * errores de compilación TS2339 y garantizando la integridad del contrato.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef } from "react";

// --- TRIPARTICIÓN DEL NÚCLEO (V3.0 - TRIPLE CORE) ---
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
 * Misión: Consumir los 3 núcleos y orquestar sus interacciones transversales.
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
   * Misión: Sincronizar el hardware con la lógica de red y la intención de la UI.
   */
  useEffect(() => {
    const currentUserLocation = telemetryCore.userLocation;

    if (currentUserLocation) {
      const sourceJustChangedToGPS = 
        telemetryCore.telemetrySource === 'gps' && 
        lastTelemetrySourceReference.current !== 'gps';

      /**
       * 1. DETECCIÓN DE ATERRIZAJE BALÍSTICO (Handshake T0):
       * Si el sistema alcanza precisión satelital soberana, disparamos el aterrizaje.
       */
      if (telemetryCore.isGPSLock && sourceJustChangedToGPS && !hasPerformedInitialLandingReference.current) {
        interfaceCore.triggerLanding();
        hasPerformedInitialLandingReference.current = true;
        // Cosecha forzada al obtener precisión métrica real
        radarCore.fetchRadar(currentUserLocation, true); 
      }

      /**
       * 2. INTELIGENCIA DE PROXIMIDAD:
       * Evaluación de resonancia basada en la telemetría purificada.
       */
      radarCore.evaluateProximity(currentUserLocation);
      radarCore.fetchRadar(currentUserLocation, false); 

      lastTelemetrySourceReference.current = telemetryCore.telemetrySource;
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
   * ENSAMBLAJE DE LA API PÚBLICA (CONTRATO SOBERANO V8.5)
   * Misión: Devolver un objeto íntegro que satisfaga el Build Shield de Vercel.
   */
  const geoEngineApi: GeoEngineReturn = {
    // I. Estados de Verdad y Telemetría Purificada
    status: derivedEngineStatus,
    userLocation: telemetryCore.userLocation,
    nearbyPointsOfInterest: radarCore.nearbyPointsOfInterest,
    activePointOfInterest: radarCore.activePointOfInterest,
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
    
    /**
     * synthesizeNarrative:
     * [MANDATO V46.2]: Adaptación explícita de parámetros para cumplir con la V8.5.
     */
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
      telemetryCore.killSensors();
      telemetryCore.clearManualAnchor();
      telemetryCore.setTriangulated(false);
      radarCore.clearRadar();
      interfaceCore.resetInterface();
      forgeOrchestrator.resetForge();
      hasPerformedInitialLandingReference.current = false;
      lastTelemetrySourceReference.current = null;
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
 * Envuelve la plataforma en la jerarquía de núcleos necesaria para el peritaje urbano.
 */
export function GeoEngineProvider({ 
  children, 
  initialData 
}: { 
  children: React.ReactNode, 
  initialData?: { lat: number, lng: number, city: string, source: string } | null 
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V46.2):
 * 1. Descriptive Symmetry: Se ha alcanzado la paridad nominal absoluta entre la 
 *    Constitución de Tipos y la implementación de la Fachada, eliminando el loop 
 *    de errores TS2339 en Vercel.
 * 2. Handshake T0: El Provider ahora acepta explícitamente el objeto initialData 
 *    purificado del RootLayout, garantizando la visibilidad instantánea del mapa.
 * 3. Atomic Orchestration: La fachada actúa como un escudo térmico, protegiendo 
 *    a la UI de la complejidad de los tres núcleos subyacentes.
 */