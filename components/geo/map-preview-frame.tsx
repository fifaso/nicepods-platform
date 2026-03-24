// components/geo/map-preview-frame.tsx
// VERSIÓN: 12.0 (NicePod GO-Preview - Ultimate Dashboard Engine)
// Misión: Ventana táctica fotorrealista con carga invisible y gestión de gestos.
// [ESTABILIZACIÓN]: Integración del Smokescreen Protocol, motor MapCore y Rescate por Timeout.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, Maximize2, Power, ShieldAlert, Zap } from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { MapRef } from "react-map-gl/mapbox";

// --- INFRAESTRUCTURA CORE ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn, nicepodLog } from "@/lib/utils";
import { FLY_CONFIG, ZOOM_LEVELS } from "./map-constants";

// --- MOTOR CARTOGRÁFICO AISLADO ---
import MapCore from "./SpatialEngine/map-core";

/**
 * MapPreviewFrame: El widget de visualización táctica para el Dashboard inicial.
 * Implementa la 'Operación Cortina de Humo' para asegurar fluidez en móviles.
 */
export const MapPreviewFrame = memo(function MapPreviewFrame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef>(null);

  // Consumo de Telemetría Global
  const geoEngine = useGeoEngine();
  const {
    userLocation,
    status: engineStatus,
    initSensors,
    reset: resetSensors
  } = geoEngine;

  // --- MÁQUINA DE ESTADOS DEL REVELADO CINEMÁTICO ---
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [isCameraSettled, setIsCameraSettled] = useState<boolean>(false);

  const hasInitialJumpPerformed = useRef<boolean>(false);

  /**
   * 1. PROTOCOLO DE SEGURIDAD MATEMÁTICA (Safe Mount)
   * Asegura que el WebGL no colapse por falta de dimensiones en el DOM.
   */
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setIsContainerReady(true);
          resizeObserver.disconnect();
        }
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  /**
   * [RED DE SEGURIDAD]: TEMPORIZADOR DE RESCATE
   * Si el motor WebGL se traba por red, forzamos el revelado a los 6 segundos.
   */
  useEffect(() => {
    if (isMapLoaded && !isCameraSettled) {
      const rescueTimer = setTimeout(() => {
        nicepodLog("⚠️ [MapPreview] Revelado forzado por tiempo.");
        setIsCameraSettled(true);
      }, 6000);
      return () => clearTimeout(rescueTimer);
    }
  }, [isMapLoaded, isCameraSettled]);

  /**
   * 2. PROTOCOLO DE VUELO EN LAS SOMBRAS
   * Solo cuando el mapa está cargado y el GPS capturado, volamos hacia el Voyager.
   */
  useEffect(() => {
    if (!isMapLoaded || !userLocation || hasInitialJumpPerformed.current || !mapRef.current) return;

    nicepodLog("🎯 [MapPreview] Ejecutando salto táctico hacia el usuario.");

    mapRef.current.flyTo({
      center: [userLocation.longitude, userLocation.latitude],
      zoom: ZOOM_LEVELS.NEIGHBORHOOD,
      pitch: 75,
      bearing: -15,
      ...FLY_CONFIG,
      duration: 1800, // Salto rápido para el Dashboard
    });

    hasInitialJumpPerformed.current = true;
  }, [isMapLoaded, userLocation]);

  /**
   * 3. EL REVELADO (The Transition)
   */
  const handleMoveEnd = useCallback(() => {
    if (hasInitialJumpPerformed.current && !isCameraSettled) {
      setIsCameraSettled(true);
      nicepodLog("✨ [MapPreview] Malla visual estabilizada.");
    }
  }, [isCameraSettled]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className={cn(
        "relative w-full h-full overflow-hidden bg-[#020202] transition-all duration-700",
        "rounded-[2.5rem] md:rounded-[3rem] border border-white/5 shadow-2xl group",
        "hover:border-primary/40 hover:shadow-[0_0_60px_rgba(var(--primary),0.1)]"
      )}
    >
      <AnimatePresence mode="wait">

        {/* ESCENARIO A: PERMISOS BLOQUEADOS */}
        {engineStatus === 'PERMISSION_DENIED' ? (
          <motion.div
            key="p_denied"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-zinc-950 z-50 text-center"
          >
            <ShieldAlert className="h-10 w-10 text-red-500 mb-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-400">GPS Interceptado</span>
            <p className="text-[10px] text-zinc-500 mt-2 max-w-[200px] leading-relaxed uppercase">
              Habilite el acceso a la ubicación para proyectar la red local.
            </p>
          </motion.div>
        ) :

          /* ESCENARIO B: CORTINA DE CARGA Y GESTO DE USUARIO */
          !isCameraSettled ? (
            <motion.div
              key="smokescreen"
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center space-y-8 bg-[#020202] z-[90]"
            >
              <div className="relative">
                <Zap className="h-8 w-8 text-primary/30 animate-pulse" />
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full animate-pulse" />
              </div>

              <div className="flex flex-col items-center gap-6 text-center px-12">
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">
                    Conexión Neuronal
                  </span>
                  <p className="text-[7px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse italic">
                    {engineStatus === 'IDLE' ? "Esperando Autorización de Sensores" :
                      !isMapLoaded ? "Cargando Malla WebGL" : "Sincronizando Coordenadas"}
                  </p>
                </div>

                {/* BOTÓN DE IGNICIÓN MANUAL (User Gesture Bypass) */}
                {engineStatus === 'IDLE' && (
                  <button
                    onClick={() => initSensors()}
                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-black text-[8px] uppercase tracking-[0.4em] flex items-center gap-3 hover:bg-primary hover:text-black transition-all"
                  >
                    <Power size={12} />
                    Activar Radar
                  </button>
                )}
              </div>
            </motion.div>
          ) : null}
      </AnimatePresence>

      {/* 
          VI. EL MOTOR CARTOGRÁFICO SOBERANO 
          Solo visible tras la estabilización de cámara.
      */}
      {isContainerReady && (
        <motion.div
          animate={{ opacity: isCameraSettled ? 1 : 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          <MapCore
            ref={mapRef}
            mode="EXPLORE"
            selectedPOIId={null}
            onLoad={() => setIsMapLoaded(true)}
            onMove={() => { }} // Widget pasivo en movimiento
            onMoveEnd={handleMoveEnd}
            onMapClick={() => { }}
            onMarkerClick={() => { }}
          />
        </motion.div>
      )}

      {/* VII. INTERFAZ DE NAVEGACIÓN PERIFÉRICA */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/30 to-transparent z-10 pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-[100] flex justify-between items-end pointer-events-none">
        <Link href="/map" className="flex items-center gap-4 pointer-events-auto group/btn focus:outline-none">
          <div className="bg-primary/10 p-3.5 rounded-2xl backdrop-blur-3xl border border-primary/20 group-hover/btn:bg-primary/30 group-hover/btn:scale-110 transition-all duration-700 shadow-inner">
            <Compass className="h-5 w-5 text-primary animate-spin-slow" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-white font-black text-sm md:text-xl uppercase tracking-tighter italic leading-none drop-shadow-lg">
              Madrid <span className="text-primary">Resonance</span>
            </h3>
            <p className="text-[8px] md:text-[9px] text-zinc-300 font-bold uppercase tracking-[0.3em] mt-1.5 group-hover/btn:text-primary transition-colors drop-shadow-md">
              Explorar Malla Satelital
            </p>
          </div>
        </Link>

        <Link href="/map" className="pointer-events-auto focus:outline-none mb-1">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 hover:bg-white/20 hover:text-white transition-all duration-500 group-hover:scale-110">
            <Maximize2 size={14} className="text-white transition-colors" />
          </div>
        </Link>
      </div>
    </motion.div>
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V11.0):
 * 1. Unificación de Núcleo: El widget ahora usa 'MapCore', garantizando que
 *    todas las mejoras de estabilidad WebGL se apliquen alDashboard.
 * 2. User Gesture bypass: El botón de 'Activar Radar' asegura que NicePod
 *    pueda capturar el GPS incluso ante políticas de privacidad agresivas.
 * 3. Diseño Inmune: El 'rescueTimer' evita que un Voyager con red lenta quede
 *    atrapado viendo el cargador si un evento de Mapbox se pierde.
 */