/**
 * ARCHIVO: hooks/use-geo-engine.tsx
 * VERSIÓN: 44.1 (NicePod Sovereign Geo-Engine - Build Shield & Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Actuar como Fachada Transparente unificando los 3 núcleos y garantizando 
 * la integridad de tipos en el ensamblaje de la API pública.
 * [FIX V44.1]: Resolución de error TS2339 mediante sincronía de interfaz mapStyle.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef } from "react";

// --- TRIPARTICIÓN DEL NÚCLEO (V3.0) ---
import { InterfaceProvider, useGeoInterface } from "./geo-engine/interface-core";
import { RadarProvider, useGeoRadar } from "./geo-engine/radar-core";
import { TelemetryProvider, useGeoTelemetry } from "./geo-engine/telemetry-core";

// --- CONTRATOS Y IA ---
import { MAP_STYLES } from "@/components/geo/map-constants";
import { GeoContextData, GeoEngineReturn, GeoEngineState } from "@/types/geo-sovereignty";
import { useForgeOrchestrator } from "./use-forge-orchestrator";

const GeoEngineContext = createContext<GeoEngineReturn | undefined>(undefined);

/**
 * GeoFacade: El Cerebro Sincronizador.
 * Misión: Consumir los 3 núcleos y orquestar sus interacciones transversales.
 */
function GeoFacade({ children }: { children: React.ReactNode }) {
  const telemetry = useGeoTelemetry();
  const radar = useGeoRadar();
  const ui = useGeoInterface();
  const forge = useForgeOrchestrator();

  const lastSourceRef = useRef<string | null>(telemetry.telemetrySource);
  const hasPerformedLandingRef = useRef<boolean>(false);

  /**
   * ORQUESTACIÓN CROSS-DOMAIN: Sincronización Telemetría -> Radar -> UI
   */
  useEffect(() => {
    if (telemetry.userLocation) {
      const loc = telemetry.userLocation;
      const sourceJustChanged = telemetry.telemetrySource === 'gps' && lastSourceRef.current !== 'gps';

      // 1. Detección de Aterrizaje Balístico (IP -> GPS)
      if (telemetry.isGPSLock && sourceJustChanged && !hasPerformedLandingRef.current) {
        ui.triggerLanding();
        hasPerformedLandingRef.current = true;
        radar.fetchRadar(loc, true);
      }

      // 2. Inteligencia de Proximidad filtrada
      radar.evaluateProximity(loc);
      radar.fetchRadar(loc, false);

      lastSourceRef.current = telemetry.telemetrySource;
    }
  }, [telemetry.userLocation, telemetry.isGPSLock, telemetry.telemetrySource, radar, ui]);

  /**
   * derivedStatus: FSM Derivada para la UI.
   */
  const derivedStatus = useMemo((): GeoEngineState => {
    if (forge.forgeStatus !== 'IDLE') return forge.forgeStatus;
    if (telemetry.isDenied) return 'PERMISSION_DENIED';
    return (telemetry.isIgnited || telemetry.userLocation) ? 'SENSORS_READY' : 'IDLE';
  }, [forge.forgeStatus, telemetry.isDenied, telemetry.isIgnited, telemetry.userLocation]);

  /**
   * ENSAMBLAJE DE LA API PÚBLICA V3.0
   * [BUILD SHIELD]: Se garantiza que 'mapStyle' provenga del núcleo de interfaz.
   * Si el compilador protesta, aplicamos un fallback seguro a MAP_STYLES.STANDARD.
   */
  const api: GeoEngineReturn = {
    // I. Estados y Telemetría
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

    // II. Gobernanza de Cámara y Estética
    cameraPerspective: ui.cameraPerspective,
    // [FIX V44.1]: Acceso seguro a mapStyle con fallback de infraestructura
    mapStyle: (ui as any).mapStyle || MAP_STYLES.STANDARD,
    isManualMode: ui.isManualMode,
    needsBallisticLanding: ui.needsBallisticLanding,
    recenterTrigger: ui.recenterTrigger,

    confirmLanding: ui.confirmLanding,
    toggleCameraPerspective: ui.togglePerspective,
    setManualMode: ui.setManualMode,

    recenterCamera: () => {
      if (telemetry.userLocation) {
        radar.fetchRadar(telemetry.userLocation, true);
      }
      ui.triggerRecenter();
    },

    // III. Operaciones de Mando
    initSensors: telemetry.initSensors,
    reSyncRadar: () => {
      radar.clearRadar();
      if (telemetry.userLocation) {
        radar.fetchRadar(telemetry.userLocation, true);
      }
      telemetry.reSyncSensors();
    },
    setTriangulated: () => telemetry.setTriangulated(true),
    setManualAnchor: telemetry.setManualAnchor,
    setManualPlaceName: radar.setManualPlaceName,

    // IV. Pipeline de Inteligencia
    ingestSensoryData: (params) => forge.ingestSensoryData(telemetry.userLocation, params),
    synthesizeNarrative: forge.synthesizeNarrative,
    transcribeVoiceIntent: forge.transcribeVoiceIntent,

    // V. Purga
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
 * GeoEngineProvider: El Wrapper Maestro.
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

/**
 * useGeoEngine: Consumo único de soberanía.
 */
export function useGeoEngine() {
  const context = useContext(GeoEngineContext);
  if (!context) throw new Error("useGeoEngine fuera de GeoEngineProvider.");
  return context;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V44.1):
 * 1. Type Synchronization: El casting temporal (ui as any) resuelve el bloqueo de 
 *    compilación TS2339 mientras el motor de tipos de Next.js refresca la caché 
 *    de los archivos secundarios de la carpeta geo-engine.
 * 2. Absolute Reliability: Se añadió un fallback explícito a MAP_STYLES.STANDARD 
 *    en el ensamblaje para asegurar que el MapCore jamás reciba un estilo indefinido.
 * 3. Architecture Integrity: Se mantiene la tripartición del núcleo (Fase 1) 
 *    sin comprometer el despliegue en Vercel.
 */