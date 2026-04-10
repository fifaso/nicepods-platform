/**
 * ARCHIVO: components/geo/forge-spatial-precision.tsx
 * VERSIÓN: 2.0 (NicePod Forge Spatial Precision - Industrial Peritaje Edition)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * 
 * Misión: Proveer un instrumento de peritaje geodésico de alta resolución para la 
 * Fase 1 de la forja. Este componente garantiza el aislamiento de telemetría 
 * satelital ante la interacción humana, permitiendo fijar coordenadas con 
 * precisión milimétrica sobre ortofotos fotorrealistas de alta densidad.
 * [DISEÑO SOBERANO]: Implementación de "Telemetry Hijacking" (Secuestro de cámara),
 * bloqueo de cénit absoluto, mira telescópica PBR y rejilla geodésica táctica.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Crosshair, Target, MapPin, MousePointer2, Scan } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { MapRef, MapProps, MapProvider } from "react-map-gl/mapbox";

// --- INFRAESTRUCTURA CORE V4.2 ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { nicepodLog } from "@/lib/utils";

// --- CONSTANTES FÍSICAS Y ESTILOS ---
import {
  FLY_CONFIG,
  MADRID_SOL_COORDS,
  MAP_STYLES,
  MAPBOX_TOKEN
} from "./map-constants";

import { 
  MapInstanceIdentification, 
  UserLocation 
} from "@/types/geo-sovereignty";

/**
 * [BUILD SHIELD]: DEFINICIÓN DE TIPOS DE EVENTOS NOMINALES
 */
type SafeMapClickEvent = Parameters<NonNullable<MapProps['onClick']>>[0];
type SafeMapMovementEvent = Parameters<NonNullable<MapProps['onMove']>>[0];

/**
 * INTERFAZ: ForgeSpatialPrecisionProperties
 */
interface ForgeSpatialPrecisionProperties {
  /** onManualAnchorSelectionAction: Callback que emite las coordenadas purificadas al contexto. */
  onManualAnchorSelectionAction: (longitudeCoordinate: number, latitudeCoordinate: number) => void;
  /** initialLatitudeCoordinate: Semilla de posición opcional para el arranque. */
  initialLatitudeCoordinate?: number | null;
  /** initialLongitudeCoordinate: Semilla de posición opcional para el arranque. */
  initialLongitudeCoordinate?: number | null;
  /** mapInstanceIdentification: ID único para el aislamiento de VRAM en la GPU. */
  mapInstanceIdentification?: MapInstanceIdentification;
}

/**
 * ForgeSpatialPrecision: El Reactor Visual Dedicado para el Anclaje de Precisión.
 */
export function ForgeSpatialPrecision({
  onManualAnchorSelectionAction,
  initialLatitudeCoordinate,
  initialLongitudeCoordinate,
  mapInstanceIdentification = "map-forge-precision" as MapInstanceIdentification
}: ForgeSpatialPrecisionProperties) {
  
  // 1. CONSUMO DE LA FACHADA SOBERANA (TRIPLE-CORE SYNERGY)
  const {
    userLocation,
    isManualMode,
    setManualMode,
    recenterTrigger: recenterVisualPulseTrigger
  } = useGeoEngine();

  // 2. REFERENCIAS DE CONTROL TÁCTICO (PILAR 4 - MTI)
  const mapInstanceReference = useRef<MapRef>(null);
  const lastProcessedRecenterPulseReference = useRef<number>(0);
  const isInternalCinematicActiveReference = useRef<boolean>(false);

  // 3. ESTADOS DE INTERFAZ LOCAL (HIGH-FIDELITY FEEDBACK)
  const [isMapEngineReady, setIsMapEngineReady] = useState<boolean>(false);
  const [isCapturingInteraction, setIsCapturingInteraction] = useState<boolean>(false);

  /**
   * initialMapViewState: 
   * Misión: Establecer el punto de nacimiento del visor. 
   * Prioridad: Parámetros del Step 1 > Ubicación Global > Madrid Sol.
   */
  const initialMapViewState = useMemo(() => {
    return {
      latitude: initialLatitudeCoordinate || userLocation?.latitudeCoordinate || MADRID_SOL_COORDS.latitude,
      longitude: initialLongitudeCoordinate || userLocation?.longitudeCoordinate || MADRID_SOL_COORDS.longitude,
      zoom: 19.5, // Resolución máxima de peritaje
      pitch: 0,
      bearing: 0
    };
  }, [initialLatitudeCoordinate, initialLongitudeCoordinate, userLocation]);

  /**
   * executeManualAnchorWorkflow:
   * Misión: Capturar el clic, emitir coordenadas y secuestrar la cámara (bloqueo de GPS).
   * [SINCRO V2.0]: Mapeo nominal inmediato de lngLat nativo a nomenclatura industrial.
   */
  const executeManualAnchorWorkflow = useCallback((geographicEvent: SafeMapClickEvent) => {
    const { lng: longitudeCoordinate, lat: latitudeCoordinate } = geographicEvent.lngLat;
    
    nicepodLog(`📍 [Forge:Precision] Autoridad Manual ejercida en: [${longitudeCoordinate}, ${latitudeCoordinate}]`);
    
    // El toque humano activa el modo manual, ignorando actualizaciones automáticas del GPS
    if (!isManualMode) {
      setManualMode(true);
    }

    onManualAnchorSelectionAction(longitudeCoordinate, latitudeCoordinate);
    
    // Feedback háptico y visual de captura
    setIsCapturingInteraction(true);
    setTimeout(() => setIsCapturingInteraction(false), 300);

    // Animación de centrado de precisión sobre el punto de impacto
    mapInstanceReference.current?.flyTo({
      center: [longitudeCoordinate, latitudeCoordinate],
      ...FLY_CONFIG,
      duration: 1000,
      essential: true
    });
  }, [isManualMode, setManualMode, onManualAnchorSelectionAction]);

  /**
   * handleMapMovementAction:
   * Misión: Detectar el desplazamiento manual (Pan/Zoom) para ceder la autoridad.
   */
  const handleMapMovementAction = useCallback((movementEvent: SafeMapMovementEvent) => {
    // Si el movimiento es originado por un gesto humano (y no por una interpolación interna)
    if (movementEvent.originalEvent && !isInternalCinematicActiveReference.current) {
      if (!isManualMode) {
        setManualMode(true);
      }
    }
  }, [isManualMode, setManualMode]);

  /**
   * EFECTO: TelemetryHijackingGuard
   * Misión: Sincronizar la cámara con el Voyager SOLO si no hay autoridad manual activa.
   */
  useEffect(() => {
    if (!isManualMode && userLocation && mapInstanceReference.current) {
      isInternalCinematicActiveReference.current = true;
      mapInstanceReference.current.easeTo({
        center: [userLocation.longitudeCoordinate, userLocation.latitudeCoordinate],
        duration: 1200,
        essential: false
      });
      setTimeout(() => { isInternalCinematicActiveReference.current = false; }, 1250);
    }
  }, [userLocation, isManualMode]);

  /**
   * EFECTO: RecenterPulseSync (Command Authority)
   * Misión: Responder al pulso de recentralización desde la fachada global.
   */
  useEffect(() => {
    if (recenterVisualPulseTrigger > lastProcessedRecenterPulseReference.current && userLocation) {
      lastProcessedRecenterPulseReference.current = recenterVisualPulseTrigger;
      
      nicepodLog("🎯 [Forge:Precision] Recuperando autoridad satelital por comando de perito.");
      setManualMode(false);
      
      mapInstanceReference.current?.flyTo({
        center: [userLocation.longitudeCoordinate, userLocation.latitudeCoordinate],
        zoom: 19.5,
        pitch: 0,
        bearing: 0,
        ...FLY_CONFIG
      });
    }
  }, [recenterVisualPulseTrigger, userLocation, setManualMode]);

  return (
    <MapProvider>
      <div className="relative w-full h-full bg-[#050505] overflow-hidden isolate flex items-center justify-center rounded-[2.5rem] shadow-inner">
        
        {/* REJILLA GEODÉSICA TÁCTICA (VISUAL OVERLAY) */}
        <div className="absolute inset-0 z-10 pointer-events-none opacity-20 border-[0.5px] border-white/10" 
             style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* MOTOR WEBGL SOBERANO (PHOTOREALISTIC CORE) */}
        <Map
          id={mapInstanceIdentification}
          ref={mapInstanceReference}
          initialViewState={initialMapViewState}
          onLoad={() => setIsMapEngineReady(true)}
          onMove={handleMapMovementAction}
          onClick={executeManualAnchorWorkflow}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle={MAP_STYLES.PHOTOREALISTIC} // Forzado Satelital Cenital
          projection={{ name: "mercator" }}
          reuseMaps={true}
          maxPitch={0} // Bloqueo físico de inclinación para evitar error de paralaje
          dragRotate={false} // Desactivamos rotación para mantener el Norte como autoridad
          touchPitch={false}
          attributionControl={false}
          style={{ width: '100%', height: '100%' }}
        />

        {/* I. MIRA TELESCÓPICA PBR (PRECISION CROSSHAIR) */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
          <div className="relative flex items-center justify-center">
            
            {/* Aura de Captura (Flash al hacer clic) */}
            <AnimatePresence>
              {isCapturingInteraction && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 2, opacity: 0.4 }}
                  exit={{ scale: 3, opacity: 0 }}
                  className="absolute inset-0 rounded-full bg-primary blur-xl"
                />
              )}
            </AnimatePresence>

            {/* Círculo de Resonancia de la Mira */}
            <motion.div
              animate={{ 
                scale: isManualMode ? [1, 1.05, 1] : 1,
                opacity: isManualMode ? [0.4, 0.6, 0.4] : 0.3
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className={cn(
                "absolute h-48 w-48 rounded-full border border-dashed transition-colors duration-1000",
                isManualMode ? "border-primary/60 bg-primary/5" : "border-white/10"
              )}
            />

            {/* Iconografía de Precisión */}
            <div className="relative">
              <Crosshair size={40} className={cn(
                "transition-all duration-700",
                isManualMode ? "text-primary scale-110 drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)]" : "text-white/20"
              )} />
              <div className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-colors duration-700 shadow-[0_0_10px_#fff]",
                isManualMode ? "bg-primary" : "bg-white/40"
              )} />
            </div>
          </div>
        </div>

        {/* II. PANEL DE ESTADO DE AUTORIDAD (NOMINAL FEEDBACK) */}
        <div className="absolute bottom-6 left-6 z-30 pointer-events-none">
          <AnimatePresence mode="wait">
            {isManualMode ? (
              <motion.div
                key="manual_state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-primary/10 backdrop-blur-2xl border border-primary/30 px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-2xl"
              >
                <div className="relative h-2 w-2">
                  <div className="absolute inset-0 bg-primary rounded-full animate-ping" />
                  <div className="relative h-full w-full bg-primary rounded-full" />
                </div>
                <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">Modo Peritaje Manual</span>
              </motion.div>
            ) : (
              <motion.div
                key="satellite_state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-black/60 backdrop-blur-2xl border border-white/10 px-5 py-2.5 rounded-2xl flex items-center gap-3"
              >
                <Scan size={14} className="text-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">Malla Satelital Activa</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* III. INDICADOR DE COORDENADAS DINÁMICAS (OPTIONAL) */}
        {isManualMode && (
          <div className="absolute top-6 right-6 z-30 pointer-events-none hidden md:block">
            <div className="bg-black/80 backdrop-blur-xl border border-white/5 px-4 py-2 rounded-xl">
               <span className="text-[8px] font-mono text-primary/80 uppercase tracking-widest">
                  High-Precision Geodetic Link
               </span>
            </div>
          </div>
        )}

        {/* IV. PANTALLA DE CARGA (SYNC SHIELD) */}
        {!isMapEngineReady && (
          <div className="absolute inset-0 bg-[#020202] z-50 flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
              <div className="h-12 w-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin relative z-10" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 italic">Sincronizando Ortofoto</span>
          </div>
        )}

      </div>
    </MapProvider>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Precision Centering: El componente utiliza un centrado absoluto por Flexbox y una mira 
 *    telescópica estática. La coordenada anclada es SIEMPRE la que reside bajo el Crosshair.
 * 2. Telemetry Hijacking V2: Se ha reforzado el aislamiento. Si 'isManualMode' es activo, 
 *    el motor ignora por completo los pulsos del Satélite para evitar el "Jitter" en el Step 1.
 * 3. ZAP & BSS Compliance: Se han eliminado todas las abreviaturas y se han tipado los 
 *    eventos nativos de Mapbox para garantizar la integridad del contrato industrial.
 * 4. UI Polish: Se inyectó una rejilla geodésica y un panel de estado dinámico que 
 *    informa al Administrador sobre el origen de la verdad geográfica actual.
 */