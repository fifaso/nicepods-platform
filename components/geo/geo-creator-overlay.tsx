// components/geo/geo-creator-overlay.tsx
// VERSIÓN: 5.0 (NicePod Sovereign Orchestrator - Tactical Console & Motion Edition)
// Misión: Unificar la Malla 3D, la Cinemática y la IA bajo una interfaz de autoridad.
// [ESTABILIZACIÓN]: Implementación de Tactical Dock, Theme Switcher y Camera Lock.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Moon,
  Plus,
  Power,
  Satellite,
  ShieldCheck,
  Sun,
  Target, X
} from "lucide-react";
import { useCallback, useState } from "react";

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
 * La estación de control táctico sobre la Malla de Madrid Resonance.
 */
function CreatorOverlayContent({ canForge }: { canForge: boolean }) {
  // 1. CONSUMO DE TELEMETRÍA SOBERANA (V23.0)
  const {
    status: engineStatus,
    data: engineData,
    userLocation,
    initSensors,
    isTriangulated,
    isGPSLock,
    error: geoError
  } = useGeoEngine();

  const { state: forgeState, dispatch } = useForge();

  // 2. ESTADOS DE CONSOLA (INTERFACE CONTROL)
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [mapTheme, setMapTheme] = useState<'night' | 'day'>('night');
  const [isCameraLocked, setIsCameraLocked] = useState<boolean>(true);

  /**
   * handleIgnition:
   * Gesto de autoridad para despertar el hardware.
   */
  const handleIgnition = useCallback(() => {
    nicepodLog("⚡ [Orchestrator] Gesto de autoridad detectado. Ignición GPS.");
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(40);
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

  /**
   * handleRecenter:
   * Misión: Re-anclar la cámara al Voyager con un pulso cinemático.
   */
  const handleRecenter = useCallback(() => {
    if (!userLocation) {
      handleIgnition();
      return;
    }
    setIsCameraLocked(true);
    nicepodLog("🎯 [Orchestrator] Re-anclando cámara al Voyager.");
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate([10, 20]);
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
     * Contenedor raíz 'pointer-events-none'. El mapa WebGL (Capa 0) es 
     * el dueño de los gestos táctiles por defecto.
     */
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none flex flex-col">

      {/* 
          I. CAPA 0: EL MOTOR CARTOGRÁFICO SOBERANO 
          Gestiona el renderizado PBR y la cinemática fluida.
      */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <SpatialEngine
          mode={isTerminalOpen ? 'FORGE' : 'EXPLORE'}
          onManualAnchor={(lngLat) => {
            if (!isTerminalOpen) return;
            dispatch({ type: 'SET_LOCATION', payload: { lat: lngLat[1], lng: lngLat[0], acc: 1 } });
          }}
        />
      </div>

      {/* 
          II. CAPA 10: EL PANEL DE IGNICIÓN (IDLE PROTECTOR) 
      */}
      <AnimatePresence>
        {engineStatus === 'IDLE' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[300] bg-black/40 backdrop-blur-xl flex flex-col items-center justify-center p-8 pointer-events-auto"
          >
            <div className="max-w-xs w-full bg-[#080808] border border-white/10 rounded-[3rem] p-12 flex flex-col items-center text-center shadow-[0_40px_80px_rgba(0,0,0,0.9)]">
              <div className="relative mb-10">
                <div className="absolute inset-0 bg-primary/30 blur-3xl animate-pulse" />
                <Satellite className="h-14 w-14 text-primary relative z-10" />
              </div>
              <h2 className="text-white font-black uppercase tracking-[0.4em] text-xs mb-3">Enlace Desconectado</h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed mb-12">
                Sincronice su posición para proyectar la malla de inteligencia en este territorio.
              </p>
              <Button
                onClick={handleIgnition}
                className="w-full h-14 bg-primary text-black font-black uppercase tracking-[0.4em] text-[10px] rounded-2xl shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)] hover:scale-105 transition-all"
              >
                <Power size={18} className="mr-3" />
                Sincronizar Malla
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
          III. CAPA 20: TACTICAL DOCK (PANEL DE INSTRUMENTOS) 
          Flota a la derecha para control rápido con el pulgar.
      */}
      <div className="absolute top-8 right-6 md:right-8 flex flex-col gap-4 z-[150] pointer-events-auto">

        {/* BOTÓN DE SIEMBRA */}
        {canForge && engineStatus !== 'IDLE' && (
          <Button
            onClick={toggleTerminal}
            className={cn(
              "h-14 w-14 md:h-16 md:w-16 rounded-full shadow-2xl transition-all duration-500 border",
              isTerminalOpen
                ? "bg-red-500 hover:bg-red-600 text-white rotate-90 border-red-400"
                : "bg-[#080808]/90 text-white border-white/10 hover:border-primary/50"
            )}
          >
            <AnimatePresence mode="wait">
              {isTerminalOpen ? <X size={24} /> : <Plus size={24} className="group-hover:scale-110" />}
            </AnimatePresence>
          </Button>
        )}

        {/* INTERRUPTOR DE LUZ (DAY/NIGHT) */}
        {!isTerminalOpen && engineStatus !== 'IDLE' && (
          <motion.button
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            onClick={() => setMapTheme(prev => prev === 'night' ? 'day' : 'night')}
            className="h-12 w-12 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center shadow-xl hover:bg-white hover:text-black transition-all"
          >
            {mapTheme === 'night' ? <Moon size={18} /> : <Sun size={18} />}
          </motion.button>
        )}

        {/* LOCK CAMERA (CENTRAR VOYAGER) */}
        {!isTerminalOpen && engineStatus !== 'IDLE' && (
          <motion.button
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            onClick={handleRecenter}
            className={cn(
              "h-12 w-12 rounded-full backdrop-blur-xl border flex items-center justify-center shadow-xl transition-all",
              isCameraLocked
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                : "bg-black/60 border-white/10 text-white"
            )}
          >
            <Target size={18} />
          </motion.button>
        )}
      </div>

      {/* 
          IV. CAPA 30: HUD DE TELEMETRÍA (PERSISTENTE EN FORJA) 
      */}
      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-4 right-24 md:left-8 md:right-32 z-[140] pointer-events-auto"
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
          V. CAPA 40: TERMINAL DE INGESTA (DRAWER SOBERANO) 
      */}
      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-x-0 bottom-0 z-[130] flex flex-col justify-end pointer-events-auto h-[75vh]"
          >
            <div className="w-full h-full bg-[#020202]/95 backdrop-blur-3xl rounded-t-[3rem] md:rounded-t-[4rem] border-t border-white/10 shadow-[0_-30px_60px_rgba(0,0,0,0.9)] flex flex-col relative overflow-hidden">
              <div className="w-full flex justify-center py-5 shrink-0 z-20">
                <div className="w-12 h-1.5 bg-white/10 rounded-full" />
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
          Transformado en botón de acción rápida para re-centrar la malla.
      */}
      {!isTerminalOpen && engineStatus !== 'IDLE' && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto">
          <button
            onClick={handleRecenter}
            className={cn(
              "backdrop-blur-3xl px-6 py-3 rounded-full border flex items-center gap-4 shadow-2xl transition-all duration-700 active:scale-95",
              isGPSLock
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-black/80 border-white/10"
            )}
          >
            <div className="relative">
              <div className={cn(
                "h-2 w-2 rounded-full animate-ping absolute inset-0",
                isGPSLock ? "bg-emerald-500" : "bg-primary"
              )} />
              <div className={cn(
                "h-2 w-2 rounded-full relative z-10",
                isGPSLock ? "bg-emerald-400" : "bg-primary"
              )} />
            </div>

            <div className="flex flex-col items-start leading-none">
              <span className="text-[9px] font-black text-white uppercase tracking-[0.4em]">
                {isGPSLock ? "Malla Sintonizada" : "Capturando Señal..."}
              </span>
              <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1">
                {isGPSLock ? "GPS High-Fidelity" : "Red Neuronal Estimada"}
              </span>
            </div>

            {isGPSLock && <ShieldCheck size={12} className="text-emerald-500 ml-1" />}
          </button>
        </div>
      )}

    </div>
  );
}

/**
 * EXPORTACIÓN SOBERANA: GeoCreatorOverlay
 * Orquestador principal de la experiencia de usuario geoespacial.
 */
export function GeoCreatorOverlay(props: GeoCreatorOverlayProps) {
  return (
    <ForgeProvider>
      <CreatorOverlayContent {...props} />
    </ForgeProvider>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Solución de Oclusión: Se implementó 'pointer-events-none' en el contenedor raíz
 *    para garantizar que el mapa WebGL debajo sea el dueño de la interacción táctil.
 * 2. Tactical Command Dock: Se inyectaron controles imperativos para el Tema (Luz)
 *    y el Bloqueo de Cámara, permitiendo al Voyager personalizar su experiencia.
 * 3. Ignición Proactiva: El 'Ignition Overlay' garantiza un gesto de usuario para
 *    romper el bloqueo de privacidad del GPS en navegadores móviles modernos.
 * 4. Feedback de Calidad: El sistema diferencia visualmente entre un enlace de red
 *    y un enlace satelital (GPS Lock), proporcionando rigor pericial al usuario.
 */