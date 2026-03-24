// components/geo/map-preview-frame.tsx
// VERSIÓN: 13.0 (NicePod GO-Preview - High Authority & Anti-Loop Edition)
// Misión: Ventana táctica fotorrealista con ignición de sensores controlada.
// [ESTABILIZACIÓN]: Erradicación de bucles de GPS mediante guardias de estado IDLE.

"use client";

import React, { memo, useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Maximize2, ShieldAlert, Zap, Loader2, Power } from "lucide-react";
import { MapRef } from "react-map-gl/mapbox";

// --- INFRAESTRUCTURA CORE ---
import { cn, nicepodLog } from "@/lib/utils";
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { FLY_CONFIG, ZOOM_LEVELS } from "./map-constants";

// --- MOTOR CARTOGRÁFICO AISLADO ---
import MapCore from "./SpatialEngine/map-core";

/**
 * MapPreviewFrame: El widget de visualización táctica para el Dashboard inicial.
 * Implementa una carga síncrona y protegida para dispositivos móviles.
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
  const ignitionAttempted = useRef<boolean>(false);

  /**
   * 1. PROTOCOLO DE SEGURIDAD MATEMÁTICA (Safe Mount)
   * Asegura que el WebGL tenga un contenedor con dimensiones antes de nacer.
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
   * 2. IGNICIÓN CONTROLADA (Anti-Loop GPS)
   * [MANDATO]: Solo disparamos los sensores si el componente es visible, 
   * el contenedor está listo y el motor está en reposo absoluto (IDLE).
   */
  useEffect(() => {
    if (isContainerReady && engineStatus === 'IDLE' && !ignitionAttempted.current) {
      nicepodLog("📡 [MapPreview] Solicitando enlace satelital inicial...");
      initSensors();
      ignitionAttempted.current = true;
    }
  }, [isContainerReady, engineStatus, initSensors]);

  /**
   * [RED DE SEGURIDAD]: TEMPORIZADOR DE RESCATE
   */
  useEffect(() => {
    if (isMapLoaded && !isCameraSettled) {
      const rescueTimer = setTimeout(() => {
        nicepodLog("⚠️ [MapPreview] Estabilización forzada por timeout.");
        setIsCameraSettled(true);
      }, 7000);
      return () => clearTimeout(rescueTimer);
    }
  }, [isMapLoaded, isCameraSettled]);

  /**
   * 3. PROTOCOLO DE VUELO EN LAS SOMBRAS
   * Ejecuta el salto cinemático al detectar al Voyager, manteniendo el mapa oculto.
   */
  useEffect(() => {
    if (!isMapLoaded || !userLocation || hasInitialJumpPerformed.current || !mapRef.current) return;

    nicepodLog("🎯 [MapPreview] Voyager localizado. Iniciando aproximación.");

    mapRef.current.flyTo({
      center: [userLocation.longitude, userLocation.latitude],
      zoom: ZOOM_LEVELS.NEIGHBORHOOD,
      pitch: 75,
      bearing: -15,
      ...FLY_CONFIG,
      duration: 2500, 
    });

    hasInitialJumpPerformed.current = true;
  }, [isMapLoaded, userLocation]);

  /**
   * 4. EL REVELADO (The Transition)
   */
  const handleMoveEnd = useCallback(() => {
    if (hasInitialJumpPerformed.current && !isCameraSettled) {
      setIsCameraSettled(true);
      nicepodLog("✨ [MapPreview] Malla visual sintonizada.");
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
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-400">Acceso Denegado</span>
            <p className="text-[9px] text-zinc-500 mt-2 max-w-[220px] leading-relaxed uppercase">
              El sistema requiere permisos de ubicación para proyectar la malla local.
            </p>
          </motion.div>
        ) :

        /* ESCENARIO B: CORTINA DE CARGA (SMOKESCREEN) */
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
                  Sincronización Órbital
                </span>
                <p className="text-[7px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse italic">
                  {engineStatus === 'IDLE' ? "Esperando Autorización" : 
                   !isMapLoaded ? "Cargando Motor 3D" : "Fijando Coordenadas"}
                </p>
              </div>

              {/* [GESTO DE USUARIO]: Rompe el bloqueo de Safari/Chrome */}
              {engineStatus === 'IDLE' && (
                <button
                  onClick={() => initSensors()}
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-black text-[8px] uppercase tracking-[0.4em] flex items-center gap-3 hover:bg-primary hover:text-black transition-all active:scale-95"
                >
                  <Power size={12} />
                  Iniciar Enlace
                </button>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* 
          V. EL MOTOR DE RENDERIZADO (CORE)
          Aislado para evitar conflictos de recursos.
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
            onMove={() => {}} 
            onMoveEnd={handleMoveEnd}
            onMapClick={() => {}} 
            onMarkerClick={() => {}} 
          />
        </motion.div>
      )}

      {/* GRADIENTE PROTECTOR */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/30 to-transparent z-10 pointer-events-none" />

      {/* UI PERIFÉRICA */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-[100] flex justify-between items-end pointer-events-none">
        <Link href="/map" className="flex items-center gap-4 pointer-events-auto group/btn focus:outline-none">
          <div className="bg-primary/10 p-3.5 rounded-2xl backdrop-blur-3xl border border-primary/20 group-hover/btn:bg-primary/30 group-hover/btn:scale-110 transition-all duration-700 shadow-inner">
            <Compass className="h-5 w-5 text-primary animate-spin-slow" />
          </div>
          <div className="flex flex-col text-left">
            <h3 className="text-white font-black text-sm md:text-xl uppercase tracking-tighter italic leading-none drop-shadow-lg">
              Madrid <span className="text-primary">Resonance</span>
            </h3>
            <p className="text-[8px] md:text-[9px] text-zinc-300 font-bold uppercase tracking-[0.3em] mt-1.5 group-hover/btn:text-primary transition-colors drop-shadow-md">
              Malla Satelital Activa
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