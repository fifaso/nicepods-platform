// components/geo/geo-creator-overlay.tsx
// VERSIÓN: 4.6 (NicePod Sovereign Orchestrator - Authority Gesture & MESH Sync Edition)
// Misión: Unificar la Malla 3D con la telemetría y romper el bloqueo de privacidad del hardware.
// [ESTABILIZACIÓN]: Implementación de Ignition Screen, Passthrough de eventos y Feedback de Red.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, Satellite, Target, X, Power, ShieldCheck, Zap } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

// --- INFRAESTRUCTURA DE COMPONENTES UI ---
import { Button } from "@/components/ui/button";
import { cn, nicepodLog } from "@/lib/utils";

// --- PROVEEDORES DE ESTADO (CEREBROS) ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { ForgeProvider, useForge } from "./forge-context";

// --- MOTORES DE VISUALIZACIÓN Y CAPTURA ---
import { RadarHUD } from "./radar-hud";
import { GeoScannerUI } from "./scanner-ui";
import { SpatialEngine } from "./SpatialEngine";

/**
 * INTERFAZ: GeoCreatorOverlayProps
 */
interface GeoCreatorOverlayProps {
  canForge: boolean;
  userId: string;
}

/**
 * COMPONENTE INTERNO: CreatorOverlayContent
 * Gestiona la interacción física y la visibilidad de la Malla de Madrid.
 */
function CreatorOverlayContent({ canForge }: { canForge: boolean }) {
  // 1. CONSUMO DE TELEMETRÍA SOBERANA (V20.0)
  const {
    setManualAnchor,
    status: engineStatus,
    data: engineData,
    userLocation,
    initSensors,
    isTriangulated,
    error: geoError
  } = useGeoEngine();

  const { state: forgeState, dispatch } = useForge();

  // Control de la Terminal de Captura (Drawer)
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);

  /**
   * handleIgnition:
   * Gesto de usuario explícito para despertar el hardware GPS.
   * [MANDATO]: Imprescindible para superar bloqueos de Safari y Chrome.
   */
  const handleIgnition = useCallback(() => {
    nicepodLog("⚡ [Orchestrator] Gesto de autoridad detectado. Iniciando sensores.");
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }
    initSensors();
  }, [initSensors]);

  const toggleTerminal = useCallback(() => {
    if (isTerminalOpen) {
      dispatch({ type: 'RESET_FORGE' });
      setIsTerminalOpen(false);
    } else {
      setIsTerminalOpen(true);
    }
  }, [isTerminalOpen, dispatch]);

  const handleManualAnchor = useCallback((lngLat: [number, number]) => {
    if (!isTerminalOpen) return;
    setManualAnchor(lngLat[0], lngLat[1]);
    dispatch({
      type: 'SET_LOCATION',
      payload: { lat: lngLat[1], lng: lngLat[0], acc: 1 }
    });
  }, [isTerminalOpen, setManualAnchor, dispatch]);

  const handleRecenter = useCallback(() => {
    if (!userLocation) {
      handleIgnition();
      return;
    }
    nicepodLog("🎯 [Orchestrator] Re-centrando cámara en el Voyager.");
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(20);
    }
  }, [userLocation, handleIgnition]);

  /**
   * RESOLUCIÓN DE IDENTIDAD HUD
   */
  const displayName = forgeState.intentText ||
    engineData?.manualPlaceName ||
    engineData?.dossier?.visual_analysis_dossier?.detectedOfficialName ||
    "Malla Satelital Activa";

  return (
    /**
     * [ORDEN ARQUITECTÓNICO]:
     * El contenedor raíz es 'pointer-events-none' para que el usuario pueda 
     * arrastrar y rotar el mapa 3D sin obstáculos invisibles.
     */
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none flex flex-col">

      {/* 
          I. CAPA 0: EL MOTOR CARTOGRÁFICO 
          Interactivo por defecto. Recibe eventos a través del 'pointer-events-auto'.
      */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <SpatialEngine
          mode={isTerminalOpen ? 'FORGE' : 'EXPLORE'}
          onManualAnchor={handleManualAnchor}
        />
      </div>

      {/* 
          II. CAPA 50: PROTECTOR DE PRIVACIDAD (IGNITION OVERLAY) 
          Solo aparece si el motor está en IDLE para forzar el clic del usuario.
      */}
      <AnimatePresence>
        {engineStatus === 'IDLE' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[200] bg-black/40 backdrop-blur-md flex flex-col items-center justify-center p-8 pointer-events-auto"
          >
            <div className="max-w-xs w-full bg-[#080808] border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center text-center shadow-[0_40px_80px_rgba(0,0,0,0.8)]">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
                <Satellite className="h-12 w-12 text-primary relative z-10" />
              </div>
              
              <h2 className="text-white font-black uppercase tracking-[0.3em] text-sm mb-2">
                Enlace Desconectado
              </h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed mb-10">
                Sincronice su posición para proyectar la malla de inteligencia urbana.
              </p>

              <Button
                onClick={handleIgnition}
                className="w-full h-14 bg-primary text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]"
              >
                <Power size={16} className="mr-3" />
                Sincronizar Malla
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
          III. CAPA 10: BOTONES TÁCTICOS (FAB) 
      */}
      <div className="absolute top-8 right-6 md:right-8 flex flex-col gap-4 z-[120] pointer-events-auto">
        
        {/* FAB DE SIEMBRA */}
        {canForge && engineStatus !== 'IDLE' && (
          <Button
            onClick={toggleTerminal}
            className={cn(
              "h-14 w-14 md:h-16 md:w-16 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.6)] transition-all duration-500 border",
              isTerminalOpen
                ? "bg-red-500 hover:bg-red-600 text-white rotate-90 border-red-400/50"
                : "bg-[#080808] hover:bg-primary text-white border-white/10 hover:border-primary/50 shadow-primary/20"
            )}
          >
            <AnimatePresence mode="wait">
              {isTerminalOpen ? (
                <motion.div key="c" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <X size={24} className="md:w-8 md:h-8" />
                </motion.div>
              ) : (
                <motion.div key="o" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Plus size={24} className="md:w-8 md:h-8 group-hover:scale-110" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        )}

        {/* FAB DE RE-CENTRADO */}
        {engineStatus !== 'IDLE' && !isTerminalOpen && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleRecenter}
            className="h-12 w-12 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center shadow-2xl hover:bg-white hover:text-black transition-all active:scale-90"
          >
            <Target size={20} />
          </motion.button>
        )}
      </div>

      {/* 
          IV. CAPA 20: HUD DE AVIÓNICA 
      */}
      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-4 right-24 md:left-8 md:right-32 z-[110] pointer-events-auto"
          >
            <RadarHUD
              status={engineStatus}
              isTriangulated={isTriangulated}
              weather={engineData?.dossier?.weather_snapshot}
              place={displayName}
              accuracy={userLocation?.accuracy || 0}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
          V. CAPA 30: TERMINAL DE INGESTA (DRAWER) 
      */}
      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-x-0 bottom-0 z-[100] flex flex-col justify-end pointer-events-auto h-[75vh]"
          >
            <div className="w-full h-full bg-[#020202]/95 backdrop-blur-3xl rounded-t-[3rem] md:rounded-t-[4rem] border-t border-white/10 shadow-[0_-30px_60px_rgba(0,0,0,0.9)] flex flex-col relative overflow-hidden">
              <div className="w-full flex justify-center py-5 shrink-0 z-20">
                <div className="w-12 h-1.5 bg-white/10 rounded-full" />
              </div>

              <div className="absolute top-6 left-6 md:left-12 flex items-center gap-3 opacity-30 pointer-events-none z-10">
                <Satellite size={12} className="text-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white">Oracle Station</span>
              </div>

              <div className="w-full flex-1 relative flex flex-col min-h-0 mt-4 md:mt-8">
                <GeoScannerUI />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
          VI. INDICADOR DE STATUS INFERIOR (COMMAND CENTER) 
      */}
      {!isTerminalOpen && engineStatus !== 'IDLE' && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
          <button
            onClick={handleRecenter}
            className={cn(
              "backdrop-blur-3xl px-6 py-3 rounded-full border flex items-center gap-4 shadow-2xl transition-all duration-700 active:scale-95",
              isTriangulated 
                ? "bg-emerald-500/10 border-emerald-500/30" 
                : "bg-black/80 border-white/10"
            )}
          >
            <div className="relative">
               <div className={cn(
                 "h-2 w-2 rounded-full animate-ping absolute inset-0", 
                 isTriangulated ? "bg-emerald-500" : "bg-primary"
               )} />
               <div className={cn(
                 "h-2 w-2 rounded-full relative z-10", 
                 isTriangulated ? "bg-emerald-400" : "bg-primary"
               )} />
            </div>
            
            <div className="flex flex-col items-start leading-none">
              <span className="text-[9px] font-black text-white uppercase tracking-[0.4em]">
                {isTriangulated ? "Malla Sintonizada" : "Sincronizando..."}
              </span>
              <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1">
                {userLocation?.accuracy && userLocation.accuracy < 500 ? "GPS High-Fidelity" : "Edge-IP Fallback"}
              </span>
            </div>

            {isTriangulated && <ShieldCheck size={12} className="text-emerald-500 ml-1" />}
          </button>
        </div>
      )}

    </div>
  );
}

/**
 * EXPORTACIÓN SOBERANA
 */
export function GeoCreatorOverlay(props: GeoCreatorOverlayProps) {
  return (
    <ForgeProvider>
      <CreatorOverlayContent {...props} />
    </ForgeProvider>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.6):
 * 1. Solución de Ignición (User Gesture): Se implementó el 'Ignition Overlay' para 
 *    los casos donde el estado es IDLE. Esto garantiza que el Voyager realice un 
 *    clic físico, permitiendo que NicePod acceda al GPS sin bloqueos del SO.
 * 2. Passthrough Táctico: El contenedor raíz ahora es 'pointer-events-none' de 
 *    forma absoluta. El mapa WebGL es libre y reactivo a los gestos del usuario.
 * 3. Feedback Progresivo: El botón inferior ahora muestra la calidad del enlace 
 *    (GPS vs IP), informando al Voyager de la fidelidad de su materialización.
 */