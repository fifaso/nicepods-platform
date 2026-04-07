/**
 * ARCHIVO: components/geo/geo-creator-overlay.tsx
 * VERSIÓN: 8.1 (NicePod Sovereign Orchestrator - Absolute Nominal Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestar la interfaz táctica y el ciclo de vida de los motores WebGL 
 * garantizando la sincronía absoluta de contratos entre la interfaz y el SpatialEngine.
 * [REFORMA V8.1]: Resolución definitiva de error TS2322, purificación mediante Aliasing 
 * de componentes (HUD/UI) y cumplimiento estricto de la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Layers,
  Moon,
  Navigation2,
  Plus,
  Power,
  Satellite,
  ShieldCheck,
  Sun,
  Target,
  X
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

// --- INFRAESTRUCTURA DE COMPONENTES DE INTERFAZ ---
import { Button } from "@/components/ui/button";
import { cn, nicepodLog } from "@/lib/utils";

// --- PROVEEDORES DE ESTADO (CEREBROS NEURONALES V4.0) ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { ForgeProvider, useForge } from "./forge-context";

// --- MOTORES DE VISUALIZACIÓN Y ALIASING NOMINAL ---
// Utilizamos 'as' para cumplir con la Zero Abbreviations Policy internamente sin romper rutas.
import { RadarHUD as RadarHeadsUpDisplay } from "./radar-hud";
import { GeoScannerUI as GeographicScannerUserInterface } from "./scanner-ui";
import { SpatialEngine } from "./SpatialEngine";
import { MAP_STYLES } from "./map-constants";

/**
 * INTERFAZ: GeoCreatorOverlayProperties
 */
interface GeoCreatorOverlayProperties {
  isForgeAuthorityGranted: boolean; 
  userIdentification: string;       
}

/**
 * CreatorOverlayContent: El puente de mando táctico de la Workstation.
 */
function CreatorOverlayContent({ isForgeAuthorityGranted }: { isForgeAuthorityGranted: boolean }) {
  
  // 1. CONSUMO DE LA FACHADA SOBERANA (Triple-Core Facade V4.0)
  const {
    status: engineOperationalStatus,
    data: engineOperationalData,
    userLocation,
    initSensors: initializeSensors,
    isTriangulated: isGeographicallyTriangulated,
    isGPSLock: isGlobalPositioningSystemLocked,
    cameraPerspective,
    mapStyle: activeEngineVisualStyle, 
    isManualMode,
    toggleCameraPerspective,
    recenterCamera: recenterVisualCamera
  } = useGeoEngine();

  const { state: forgeState, dispatch: stateDispatcher } = useForge();

  // 2. ESTADOS LOCALES DE INTERFAZ DESCRIPTIVOS
  const [isForgeTerminalInterfaceOpen, setIsForgeTerminalInterfaceOpen] = useState<boolean>(false);

  /**
   * handleHardwareIgnition:
   * Misión: Activar los sensores de telemetría mediante un gesto de autoridad del Voyager.
   */
  const handleHardwareIgnition = useCallback(() => {
    nicepodLog("⚡ [Orchestrator] Iniciando ignición hardware.");
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(40);
    }
    initializeSensors();
  }, [initializeSensors]);

  /**
   * handleCameraCinematicAction: EL ALGORITMO DEL MANDO ÚNICO
   * Misión: Gestionar la transición entre Recentrar y el Ciclo de Perspectiva Triple.
   */
  const handleCameraCinematicAction = useCallback(() => {
    if (!userLocation) {
      handleHardwareIgnition();
      return;
    }

    if (isManualMode) {
      nicepodLog("🎯 [Orchestrator] Recuperando foco pericial del Voyager.");
      if (typeof window !== "undefined" && navigator.vibrate) {
        navigator.vibrate([15, 35]);
      }
      recenterVisualCamera();
    } else {
      nicepodLog("🎥 [Orchestrator] Rotando ciclo de perspectiva visual.");
      if (typeof window !== "undefined" && navigator.vibrate) {
        navigator.vibrate(25);
      }
      toggleCameraPerspective();
    }
  }, [isManualMode, userLocation, recenterVisualCamera, toggleCameraPerspective, handleHardwareIgnition]);

  /**
   * toggleForgeTerminalInterface:
   * Misión: Apertura de terminal de forja con gestión de recursos asíncrona.
   */
  const toggleForgeTerminalInterface = useCallback(() => {
    if (isForgeTerminalInterfaceOpen) {
      nicepodLog("🛡️ [Orchestrator] Restaurando malla de exploración.");
      stateDispatcher({ type: 'RESET_FORGE' });
      setIsForgeTerminalInterfaceOpen(false);
    } else {
      nicepodLog("⚒️ [Orchestrator] Aislamiento de recursos para la Forja de Sabiduría.");
      setIsForgeTerminalInterfaceOpen(true);
    }
  }, [isForgeTerminalInterfaceOpen, stateDispatcher]);

  const displayCurrentPlaceName = forgeState.intentText ||
    engineOperationalData?.manualPlaceName ||
    engineOperationalData?.dossier?.visual_analysis_dossier?.detectedOfficialName ||
    "Sintonía de Malla Activa";

  /**
   * smartButtonConfiguration:
   * Misión: Mapear la voluntad de la interfaz según el estado del motor cinemático.
   */
  const smartButtonConfiguration = useMemo(() => {
    if (isManualMode) {
      return {
        iconComponent: <Target size={22} className="animate-pulse text-primary" />,
        visualVariant: "default" as const,
        accessibilityLabel: "Recuperar Foco"
      };
    }
    
    switch (cameraPerspective) {
      case 'STREET':
        return {
          iconComponent: <Satellite size={22} />,
          visualVariant: "resonance" as const,
          accessibilityLabel: "Capa Satelital"
        };
      case 'SATELLITE':
        return {
          iconComponent: <Layers size={22} />,
          visualVariant: "glass" as const,
          accessibilityLabel: "Vista Estratégica"
        };
      default: // OVERVIEW
        return {
          iconComponent: <Navigation2 size={22} />,
          visualVariant: "glass" as const,
          accessibilityLabel: "Vista Inmersiva"
        };
    }
  }, [isManualMode, cameraPerspective]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none flex flex-col z-[100] isolate">

      {/* I. CAPA 0: REACTOR VISUAL (SPATIAL ENGINE) */}
      <AnimatePresence mode="popLayout">
        {!isForgeTerminalInterfaceOpen && (
          <motion.div
            key="background-spatial-instance"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-0 pointer-events-auto"
          >
            <SpatialEngine
              mapInstanceIdentification="map-full" // [BUILD SHIELD FIX]: Resuelve el error TS2322.
              mode="EXPLORE"
              visualTheme={activeEngineVisualStyle === MAP_STYLES.PHOTOREALISTIC ? 'day' : 'night'}
              className="w-full h-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* II. CAPA 10: VELO DE IGNICIÓN (COLD START TIMEOUT) */}
      <AnimatePresence>
        {engineOperationalStatus === 'IDLE' && (
          <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[300] bg-black/40 backdrop-blur-xl flex flex-col items-center justify-center p-8 pointer-events-auto"
          >
            <div className="max-w-xs w-full bg-[#080808]/90 border border-white/5 rounded-[3.5rem] p-12 flex flex-col items-center text-center shadow-2xl">
              <div className="relative mb-10">
                <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
                <Satellite className="h-16 w-16 text-primary relative z-10" />
              </div>
              <h2 className="text-white font-black uppercase tracking-[0.5em] text-[10px] mb-4">Enlace Interrumpido</h2>
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.3em] leading-relaxed mb-12">
                Conecte el enlace sensorial para proyectar la malla urbana de Madrid.
              </p>
              <Button
                onClick={handleHardwareIgnition}
                size="lg"
                className="w-full rounded-2xl font-black tracking-widest bg-white text-black hover:bg-zinc-200"
              >
                <Power size={18} className="mr-3 text-primary" />
                IGNICIÓN
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* III. CAPA 20: DOCK DE COMANDO TÁCTICO */}
      <div className="absolute top-8 right-6 md:right-8 flex flex-col gap-6 z-[200] pointer-events-none">

        {/* BOTÓN DE ACCESO A LA FORJA SOBERANA */}
        {isForgeAuthorityGranted && engineOperationalStatus !== 'IDLE' && (
          <Button
            onClick={toggleForgeTerminalInterface}
            variant={isForgeTerminalInterfaceOpen ? "destructive" : "glass"}
            size="tactical"
            className="shadow-2xl transition-all duration-500 pointer-events-auto rounded-2xl h-14 w-14"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isForgeTerminalInterfaceOpen ? 'close_action_state' : 'open_action_state'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                {isForgeTerminalInterfaceOpen ? <X size={26} /> : <Plus size={26} />}
              </motion.div>
            </AnimatePresence>
          </Button>
        )}

        {/* MANDO DE CÁMARA ÚNICO (JOYSTICK) */}
        {!isForgeTerminalInterfaceOpen && engineOperationalStatus !== 'IDLE' && (
          <Button
            onClick={handleCameraCinematicAction}
            variant={smartButtonConfiguration.visualVariant}
            size="icon"
            className="rounded-full shadow-2xl transition-all duration-500 pointer-events-auto h-14 w-14"
            title={smartButtonConfiguration.accessibilityLabel}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isManualMode ? 'recenter_visual_state' : cameraPerspective}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {smartButtonConfiguration.iconComponent}
              </motion.div>
            </AnimatePresence>
          </Button>
        )}
      </div>

      {/* IV. CAPA 30: PANTALLA DE DATOS EN CABEZA (HEADS-UP DISPLAY) */}
      <AnimatePresence>
        {isForgeTerminalInterfaceOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-4 right-24 md:left-8 md:right-32 z-[250] pointer-events-auto"
          >
            <RadarHeadsUpDisplay
              status={engineOperationalStatus}
              isTriangulated={isGeographicallyTriangulated}
              isGPSLock={isGlobalPositioningSystemLocked}
              weather={engineOperationalData?.dossier?.weather_snapshot}
              place={displayCurrentPlaceName}
              accuracy={userLocation?.accuracy || 0}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* V. CAPA 40: TERMINAL DEL ESCÁNER GEOGRÁFICO */}
      <AnimatePresence>
        {isForgeTerminalInterfaceOpen && (
          <motion.div
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }} 
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-x-0 bottom-0 z-[240] flex flex-col justify-end pointer-events-auto h-[78vh]"
          >
            <div className="w-full h-full bg-[#020202]/98 backdrop-blur-3xl rounded-t-[3.5rem] border-t border-white/5 shadow-[0_-30px_60px_rgba(0,0,0,0.9)] flex flex-col relative overflow-hidden">
              <div className="w-full flex justify-center py-6 shrink-0 z-20">
                <div className="w-16 h-1.5 bg-white/10 rounded-full" />
              </div>
              <div className="w-full flex-1 relative flex flex-col min-h-0">
                <GeographicScannerUserInterface />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VI. BARRA DE ESTADO INFERIOR: SINTONÍA SOBERANA */}
      {!isForgeTerminalInterfaceOpen && engineOperationalStatus !== 'IDLE' && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[150] pointer-events-auto">
          <button
            onClick={handleHardwareIgnition}
            className={cn(
              "backdrop-blur-3xl px-8 py-4 rounded-full border flex items-center gap-5 shadow-2xl transition-all duration-700 active:scale-95 group",
              isGlobalPositioningSystemLocked ? "bg-emerald-500/10 border-emerald-500/30" : "bg-black/80 border-white/10"
            )}
          >
            <div className="relative">
              <div className={cn("h-3 w-3 rounded-full animate-ping absolute inset-0", isGlobalPositioningSystemLocked ? "bg-emerald-500" : "bg-primary")} />
              <div className={cn("h-3 w-3 rounded-full relative z-10", isGlobalPositioningSystemLocked ? "bg-emerald-400" : "bg-primary")} />
            </div>
            <div className="flex flex-col items-start leading-none gap-1.5 text-left">
              <span className="text-[11px] font-black text-white uppercase tracking-[0.5em]">
                {isGlobalPositioningSystemLocked ? "Malla Sintonizada" : "Capturando Señal"}
              </span>
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                {isGlobalPositioningSystemLocked ? "GPS High-Fidelity Active" : "Detectando Voyager..."}
              </span>
            </div>
            {isGlobalPositioningSystemLocked && <ShieldCheck size={16} className="text-emerald-500 ml-2 group-hover:scale-110 transition-transform" />}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * GeoCreatorOverlay: El contenedor con contexto de forja de sabiduría.
 */
export function GeoCreatorOverlay(properties: GeoCreatorOverlayProperties) {
  return (
    <ForgeProvider>
      <CreatorOverlayContent {...properties} />
    </ForgeProvider>
  );
}