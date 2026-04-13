/**
 * ARCHIVO: components/geo/forge-spatial-precision.tsx
 * VERSIÓN: 3.0 (NicePod Forge Spatial Precision - Absolute Nominal Sync & Link Resolution)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * 
 * Misión: Proveer un instrumento de peritaje geodésico de alta resolución para la 
 * Fase 1 de la forja. Este componente garantiza el aislamiento de telemetría 
 * satelital ante la interacción humana, permitiendo fijar coordenadas con 
 * precisión milimétrica sobre ortofotos fotorrealistas de alta densidad.
 * [REFORMA V3.0]: Resolución definitiva del error TS2304 (importación de 'cn'). 
 * Purificación nominal de coordenadas de evento (ZAP). Implementación de 
 * "Telemetry Hijacking" (Secuestro de cámara) y bloqueo de cénit absoluto.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, Scan } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { MapProps, MapProvider, MapRef } from "react-map-gl/mapbox";

// --- INFRAESTRUCTURA CORE V4.2 ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn, nicepodLog } from "@/lib/utils"; // [FIX]: Importación de 'cn' restaurada

// --- CONSTANTES FÍSICAS Y ESTILOS ---
import {
  FLY_CONFIGURATION,
  MADRID_SOL_COORDINATES,
  MAP_STYLES,
  MAPBOX_TOKEN
} from "./map-constants";

import {
  MapInstanceIdentification
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
  /** onManualAnchorSelectionAction: Callback que emite las coordenadas purificadas al contexto de forja. */
  onManualAnchorSelectionAction: (longitudeCoordinate: number, latitudeCoordinate: number) => void;
  /** initialLatitudeCoordinate: Semilla de posición opcional para el arranque del visor. */
  initialLatitudeCoordinate?: number | null;
  /** initialLongitudeCoordinate: Semilla de posición opcional para el arranque del visor. */
  initialLongitudeCoordinate?: number | null;
  /** mapInstanceIdentification: Identificador único para el aislamiento de VRAM en la GPU. */
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
   * Misión: Establecer el punto de nacimiento del visor geodésico. 
   */
  const initialMapViewState = useMemo(() => {
    return {
      latitude: initialLatitudeCoordinate || userLocation?.latitudeCoordinate || MADRID_SOL_COORDINATES.latitude,
      longitude: initialLongitudeCoordinate || userLocation?.longitudeCoordinate || MADRID_SOL_COORDINATES.longitude,
      zoom: 19.5, // Resolución máxima de peritaje urbano
      pitch: 0,
      bearing: 0
    };
  }, [initialLatitudeCoordinate, initialLongitudeCoordinate, userLocation]);

  /**
   * executeManualAnchorWorkflow:
   * Misión: Capturar el clic, emitir coordenadas y secuestrar la cámara (bloqueo de GPS).
   * [ZAP V3.0]: Mapeo nominal de lngLat nativo a nomenclatura industrial.
   */
  const executeManualAnchorWorkflow = useCallback((geographicEvent: SafeMapClickEvent) => {
    const { lng: clickedLongitudeCoordinate, lat: clickedLatitudeCoordinate } = geographicEvent.lngLat;

    nicepodLog(`📍 [Forge:Precision] Autoridad Manual ejercida en: [${clickedLongitudeCoordinate}, ${clickedLatitudeCoordinate}]`);

    // El toque humano activa el modo manual, ignorando actualizaciones automáticas del GPS global
    if (!isManualMode) {
      setManualMode(true);
    }

    onManualAnchorSelectionAction(clickedLongitudeCoordinate, clickedLatitudeCoordinate);

    // Feedback visual de captura (Aura PBR)
    setIsCapturingInteraction(true);
    setTimeout(() => setIsCapturingInteraction(false), 300);

    // Animación de centrado de precisión sobre el punto de impacto
    mapInstanceReference.current?.flyTo({
      center: [clickedLongitudeCoordinate, clickedLatitudeCoordinate],
      ...FLY_CONFIGURATION,
      duration: 1000,
      essential: true
    });
  }, [isManualMode, setManualMode, onManualAnchorSelectionAction]);

  /**
   * handleMapMovementAction:
   * Misión: Detectar el desplazamiento manual (Pan/Zoom) para ceder la autoridad al Administrador.
   */
  const handleMapMovementAction = useCallback((movementEvent: SafeMapMovementEvent) => {
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
   * Misión: Responder al pulso de recentralización desde la fachada global de telemetría.
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
        ...FLY_CONFIGURATION
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
          reuseMaps={false}
          maxPitch={0} // Bloqueo físico de inclinación para evitar error de paralaje geográfico
          dragRotate={false} // Mantener el Norte como autoridad de visualización
          touchPitch={false}
          attributionControl={false}
          style={{ width: '100%', height: '100%' }}
        />

        {/* I. MIRA TELESCÓPICA PBR (PRECISION CROSSHAIR) */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
          <div className="relative flex items-center justify-center">

            {/* Aura de Captura (Flash de Colisión Geodésica) */}
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

            {/* Iconografía de Precisión (Targeting) */}
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

        {/* III. PANTALLA DE CARGA (SYNC SHIELD) */}
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
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Build Shield Implementation: Se ha resuelto el error TS2304 mediante la importación 
 *    absoluta del utilitario 'cn' desde '@/lib/utils', garantizando la estabilidad de clases.
 * 2. ZAP Compliance: Se han purificado los parámetros de desestructuración de Mapbox 
 *    (lng -> clickedLongitudeCoordinate, lat -> clickedLatitudeCoordinate), eliminando 
 *    cualquier vestigio de abreviatura en la lógica de captura.
 * 3. Precision Centering: El componente utiliza un sistema de mira telescópica PBR con 
 *    feedback dinámico para informar al Administrador sobre la fuente de verdad geográfica.
 */