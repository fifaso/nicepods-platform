/**
 * ARCHIVO: components/geo/geo-creator-overlay.tsx
 * VERSIÓN: 5.3 (NicePod Sovereign Orchestrator - Smart-Action Button Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Unificar la interfaz de usuario con el mando de cámara soberano.
 * [REFORMA V5.3]: Implementación de Smart-Action Button para Perspectiva Dual.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Moon,
  Plus,
  Power,
  Satellite,
  ShieldCheck, 
  Sun,
  Target, 
  X,
  Navigation2,
  Layers
} from "lucide-react";
import { useCallback, useState, useMemo } from "react";

// --- INFRAESTRUCTURA DE COMPONENTES UI ---
import { Button } from "@/components/ui/button";
import { cn, nicepodLog } from "@/lib/utils";

// --- PROVEEDORES DE ESTADO (CEREBROS) ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { ForgeProvider, useForge } from "./forge-context";

// --- MOTORES DE VISUALIZACIÓN Y CONSTANTES ---
import { MapboxLightPreset } from "./map-constants";
import { RadarHUD } from "./radar-hud";
import { GeoScannerUI } from "./scanner-ui";
import { SpatialEngine } from "./SpatialEngine";

interface GeoCreatorOverlayProps {
  canForge: boolean;
  userId: string;
}

function CreatorOverlayContent({ canForge }: { canForge: boolean }) {
  // 1. CONSUMO DE SOBERANÍA CINEMÁTICA (V32.0)
  const {
    status: engineStatus,
    data: engineData,
    userLocation,
    initSensors,
    isTriangulated,
    isGPSLock,
    reSyncRadar,
    cameraPerspective,
    isManualMode,
    toggleCameraPerspective,
    recenterCamera,
    error: geoError
  } = useGeoEngine();

  const { state: forgeState, dispatch } = useForge();

  // 2. ESTADOS LOCALES DE UI
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [mapTheme, setMapTheme] = useState<MapboxLightPreset>('night');

  /**
   * handleIgnition:
   * Rompe el bloqueo de hardware mediante gesto de autoridad.
   */
  const handleIgnition = useCallback(() => {
    nicepodLog("⚡ [Orchestrator] Gesto de autoridad detectado. Ignición GPS.");
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(40);
    }
    reSyncRadar();
  }, [reSyncRadar]);

  /**
   * handleCameraAction: EL CORAZÓN DEL SMART-BUTTON
   * Decide si recentrar el foco o cambiar la perspectiva.
   */
  const handleCameraAction = useCallback(() => {
    if (!userLocation) return;

    if (isManualMode) {
      // ESTADO A: El usuario está "perdido", volvemos al Voyager.
      nicepodLog("🎯 [Orchestrator] Gesto de Recentrado.");
      if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate([10, 20]);
      recenterCamera();
    } else {
      // ESTADO B: El usuario está centrado, conmutamos la vista.
      nicepodLog(`🎥 [Orchestrator] Conmutando a modo ${cameraPerspective === 'STREET' ? 'OVERVIEW' : 'STREET'}.`);
      if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate(30);
      toggleCameraPerspective();
    }
  }, [isManualMode, userLocation, cameraPerspective, recenterCamera, toggleCameraPerspective]);

  const toggleTerminal = useCallback(() => {
    if (isTerminalOpen) {
      dispatch({ type: 'RESET_FORGE' });
      setIsTerminalOpen(false);
    } else {
      setIsTerminalOpen(true);
    }
  }, [isTerminalOpen, dispatch]);

  const displayName = forgeState.intentText ||
    engineData?.manualPlaceName ||
    engineData?.dossier?.visual_analysis_dossier?.detectedOfficialName ||
    "Malla Satelital Activa";

  /**
   * smartButtonConfig: Configuración dinámica del botón de cámara.
   */
  const smartButtonConfig = useMemo(() => {
    if (isManualMode) {
      return {
        icon: <Target size={20} />,
        color: "bg-primary text-black",
        label: "Recuperar Foco"
      };
    }
    if (cameraPerspective === 'STREET') {
      return {
        icon: <Layers size={20} />,
        color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
        label: "Vista Estratégica"
      };
    }
    return {
      icon: <Navigation2 size={20} />,
      color: "bg-black/60 border-white/10 text-white",
      label: "Vista Inmersiva"
    };
  }, [isManualMode, cameraPerspective]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none flex flex-col">

      {/* I. CAPA 0: EL MOTOR CARTOGRÁFICO (SIN CONTROLES NATIVOS) */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <SpatialEngine
          mode={isTerminalOpen ? 'FORGE' : 'EXPLORE'}
          theme={mapTheme}
          onManualAnchor={(lngLat) => {
            if (!isTerminalOpen) return;
            dispatch({ type: 'SET_LOCATION', payload: { lat: lngLat[1], lng: lngLat[0], acc: 1 } });
          }}
        />
      </div>

      {/* II. CAPA 10: EL PANEL DE IGNICIÓN (COLD START) */}
      <AnimatePresence>
        {engineStatus === 'IDLE' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[300] bg-black/40 backdrop-blur-xl flex flex-col items-center justify-center p-8 pointer-events-auto"
          >
            <div className="max-w-xs w-full bg-[#080808] border border-white/10 rounded-[3rem] p-12 flex flex-col items-center text-center shadow-[0_40px_80px_rgba(0,0,0,0.9)]">
              <div className="relative mb-10">
                <div className="absolute inset-0 bg-primary/30 blur-3xl animate-pulse" />
                <Satellite className="h-14 w-14 text-primary relative z-10" />
              </div>
              <h2 className="text-white font-black uppercase tracking-[0.4em] text-xs mb-3">Enlace Desconectado</h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed mb-12">
                Sincronice su posición para proyectar la malla de inteligencia.
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

      {/* III. CAPA 20: TACTICAL DOCK (MANDO UNIFICADO) */}
      <div className="absolute top-8 right-6 md:right-8 flex flex-col gap-4 z-[150] pointer-events-auto">
        {/* BOTÓN DE FORJA (NODO CENTRAL) */}
        {canForge && engineStatus !== 'IDLE' && (
          <Button
            onClick={toggleTerminal}
            className={cn(
              "h-14 w-14 md:h-16 md:w-16 rounded-full shadow-2xl transition-all duration-500 border",
              isTerminalOpen ? "bg-red-500 text-white" : "bg-[#080808]/90 text-white border-white/10 hover:border-primary/50"
            )}
          >
            <AnimatePresence mode="wait">
              {isTerminalOpen ? <X size={24} /> : <Plus size={24} className="group-hover:scale-110" />}
            </AnimatePresence>
          </Button>
        )}

        {/* SELECTOR DE TEMA PBR */}
        {!isTerminalOpen && engineStatus !== 'IDLE' && (
          <motion.button
            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            onClick={() => setMapTheme(prev => prev === 'night' ? 'day' : 'night')}
            className="h-12 w-12 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center shadow-xl hover:bg-white hover:text-black transition-all"
          >
            {mapTheme === 'night' ? <Moon size={18} /> : <Sun size={18} />}
          </motion.button>
        )}

        {/* SMART-ACTION BUTTON: EL MANDO DE PERSPECTIVA */}
        {!isTerminalOpen && engineStatus !== 'IDLE' && (
          <motion.button
            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            onClick={handleCameraAction}
            className={cn(
              "h-12 w-12 rounded-full backdrop-blur-xl border flex items-center justify-center shadow-xl transition-all duration-500",
              smartButtonConfig.color
            )}
            title={smartButtonConfig.label}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isManualMode ? 'target' : cameraPerspective}
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              >
                {smartButtonConfig.icon}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        )}
      </div>

      {/* IV. CAPA 30: HUD TELEMETRÍA */}
      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
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

      {/* V. CAPA 40: TERMINAL DRAWER */}
      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
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

      {/* VI. STATUS INFERIOR: SELLO DE SINTONÍA */}
      {!isTerminalOpen && engineStatus !== 'IDLE' && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto">
          <button
            onClick={handleIgnition}
            className={cn(
              "backdrop-blur-3xl px-6 py-3 rounded-full border flex items-center gap-4 shadow-2xl transition-all duration-700 active:scale-95",
              isGPSLock ? "bg-emerald-500/10 border-emerald-500/30" : "bg-black/80 border-white/10"
            )}
          >
            <div className="relative">
              <div className={cn("h-2.5 w-2.5 rounded-full animate-ping absolute inset-0", isGPSLock ? "bg-emerald-500" : "bg-primary")} />
              <div className={cn("h-2.5 w-2.5 rounded-full relative z-10", isGPSLock ? "bg-emerald-400" : "bg-primary")} />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">{isGPSLock ? "Malla Sintonizada" : "Capturando Señal..."}</span>
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1">{isGPSLock ? "GPS High-Fidelity Active" : "Detectando Voyager..."}</span>
            </div>
            {isGPSLock && <ShieldCheck size={14} className="text-emerald-500 ml-1" />}
          </button>
        </div>
      )}
    </div>
  );
}

export function GeoCreatorOverlay(props: GeoCreatorOverlayProps) {
  return (
    <ForgeProvider>
      <CreatorOverlayContent {...props} />
    </ForgeProvider>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.3):
 * 1. Smart-Action Logic: El botón de cámara ya no es un simple re-centrador. Ahora es
 *    consciente del estado manual y de la perspectiva, ofreciendo la acción más
 *    relevante en cada frame (Recentrar -> Vista Dual).
 * 2. Visual Morphing: Se implementó AnimatePresence con rotación para que el cambio
 *    de icono se sienta como una transición de hardware real.
 * 3. Perspective Feedback: El cambio a color Emerald en el SmartButton indica que 
 *    el sistema está en modo "GO-Experience" (Inmersión de alta precisión).
 * 4. UX Cleanup: Al delegar la lógica al GeoEngine y al CameraController, el Overlay
 *    se libera de cálculos matemáticos, actuando como un visor de comando puro.
 */