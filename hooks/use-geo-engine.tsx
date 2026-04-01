/**
 * ARCHIVO: hooks/use-geo-engine.tsx
 * VERSIÓN: 43.0 (NicePod Sovereign Geo-Engine - Facade Orchestrator Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Actuar como Fachada Transparente. Une los 3 núcleos (Telemetry, Radar, Interface)
 * y la Forja para proveer el contrato GeoEngineReturn original sin regresiones.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef } from "react";

// --- TRIPARTICIÓN DEL NÚCLEO (V3.0) ---
import { InterfaceProvider, useGeoInterface } from "./geo-engine/interface-core";
import { RadarProvider, useGeoRadar } from "./geo-engine/radar-core";
import { TelemetryProvider, useGeoTelemetry } from "./geo-engine/telemetry-core";

// --- FORJA E IA ---
import { GeoContextData, GeoEngineReturn, GeoEngineState } from "@/types/geo-sovereignty";
import { useForgeOrchestrator } from "./use-forge-orchestrator";

const GeoEngineContext = createContext<GeoEngineReturn | undefined>(undefined);

/**
 * GeoFacade: El Cerebro Sincronizador.
 * Consume los 3 núcleos puros y orquesta sus interacciones transversales.
 */
function GeoFacade({ children }: { children: React.ReactNode }) {
  const telemetry = useGeoTelemetry();
  const radar = useGeoRadar();
  const ui = useGeoInterface();
  const forge = useForgeOrchestrator();

  const lastSourceRef = useRef<string | null>(telemetry.telemetrySource);
  const hasPerformedLandingRef = useRef<boolean>(false);

  /**
   * ORQUESTACIÓN CROSS-DOMAIN: Sincronización entre Telemetría, Radar y UI
   * Aquí el Facade toma la ubicación física y activa el radar y la cámara.
   */
  useEffect(() => {
    if (telemetry.userLocation) {
      const loc = telemetry.userLocation;
      const sourceJustChanged = telemetry.telemetrySource === 'gps' && lastSourceRef.current !== 'gps';

      // 1. Aterrizaje Balístico (Transición IP -> GPS)
      if (telemetry.isGPSLock && sourceJustChanged && !hasPerformedLandingRef.current) {
        ui.triggerLanding();
        hasPerformedLandingRef.current = true;
        radar.fetchRadar(loc, true); // Forzar lectura profunda al obtener GPS real
      }

      // 2. Evaluaciones de proximidad reactivas al movimiento real (ya filtrado)
      radar.evaluateProximity(loc);
      radar.fetchRadar(loc, false); // Fetch normal (Throttled a 150m)

      lastSourceRef.current = telemetry.telemetrySource;
    }
  }, [telemetry.userLocation, telemetry.isGPSLock, telemetry.telemetrySource, radar, ui]);

  /**
   * ESTADO FINITO (FSM Derivada)
   */
  const derivedStatus = useMemo((): GeoEngineState => {
    if (forge.forgeStatus !== 'IDLE') return forge.forgeStatus;
    if (telemetry.isDenied) return 'PERMISSION_DENIED';
    return (telemetry.isIgnited || telemetry.userLocation) ? 'SENSORS_READY' : 'IDLE';
  }, [forge.forgeStatus, telemetry.isDenied, telemetry.isIgnited, telemetry.userLocation]);

  /**
   * ENSAMBLAJE DEL CONTRATO SOBERANO V6.4
   * Exportamos la API exacta que espera el sistema. Cero regresiones.
   */
  const api: GeoEngineReturn = {
    // Estados y Datos
    status: derivedStatus,
    userLocation: telemetry.userLocation,
    nearbyPOIs: radar.nearbyPOIs,
    activePOI: radar.activePOI,
    isTriangulated: telemetry.isTriangulated,
    isGPSLock: telemetry.isGPSLock,
    isSearching: radar.isSearching,
    isLocked: forge.isForgeLocked,
    isIgnited: telemetry.isIgnited,
    error: forge.forgeError || (telemetry.isDenied ? "GPS_RESTRICTED" : null),
    data: { ...forge.forgeData, ...radar.localData } as GeoContextData,

    // Cinemática
    needsBallisticLanding: ui.needsBallisticLanding,
    recenterTrigger: ui.recenterTrigger,
    cameraPerspective: ui.cameraPerspective,
    isManualMode: ui.isManualMode,
    confirmLanding: ui.confirmLanding,
    toggleCameraPerspective: ui.togglePerspective,
    recenterCamera: () => {
      radar.fetchRadar(telemetry.userLocation!, true); // Refresco forzado al centrar
      ui.triggerRecenter();
    },
    setManualMode: ui.setManualMode,

    // Métodos Operativos
    initSensors: telemetry.initSensors,
    reSyncRadar: () => {
      radar.clearRadar();
      if (telemetry.userLocation) radar.fetchRadar(telemetry.userLocation, true);
      telemetry.reSyncSensors();
    },
    setTriangulated: () => telemetry.setTriangulated(true),
    setManualAnchor: telemetry.setManualAnchor,
    setManualPlaceName: radar.setManualPlaceName,

    // Pipeline IA
    ingestSensoryData: (params) => forge.ingestSensoryData(telemetry.userLocation, params),
    synthesizeNarrative: forge.synthesizeNarrative,
    transcribeVoiceIntent: forge.transcribeVoiceIntent,

    // Purga Absoluta
    reset: () => {
      telemetry.killSensors();
      telemetry.clearManualAnchor();
      telemetry.setTriangulated(false);
      radar.clearRadar();
      ui.resetInterface();
      forge.resetForge();
      hasPerformedLandingRef.current = false;
      lastSourceRef.current = null;
    }
  };

  return <GeoEngineContext.Provider value={api}>{children}</GeoEngineContext.Provider>;
}

/**
 * GeoEngineProvider: El Wrapper Maestro
 * Envuelve la Fachada en los 3 núcleos. Se coloca en layout.tsx.
 */
export function GeoEngineProvider({ children, initialData }: { children: React.ReactNode, initialData?: any }) {
  return (
    <TelemetryProvider initialData={initialData}>
      <RadarProvider>
        <InterfaceProvider>
          <GeoFacade>
            {children}
          </GeoFacade>
        </InterfaceProvider>
      </RadarProvider>
    </TelemetryProvider>
  );
}

export function useGeoEngine() {
  const context = useContext(GeoEngineContext);
  if (!context) throw new Error("useGeoEngine fuera de Provider.");
  return context;
}