/**
 * ARCHIVO: components/geo/geo-creator-overlay.tsx
 * VERSIÓN: 7.1 (NicePod Sovereign Orchestrator - Contract Sync & PBR Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Orquestar la interfaz táctica y el ciclo de vida de los motores WebGL 
 * garantizando la sincronía absoluta de contratos entre la UI y el SpatialEngine.
 * [FIX V7.1]: Alineación de la propiedad mapInstanceId para satisfacer al Build Shield
 * y resolución de colisión de tipos en el despliegue de Vercel.
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

// --- INFRAESTRUCTURA DE COMPONENTES UI ---
import { Button } from "@/components/ui/button";
import { cn, nicepodLog } from "@/lib/utils";

// --- PROVEEDORES DE ESTADO (CEREBROS V3.0) ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { ForgeProvider, useForge } from "./forge-context";

// --- MOTORES DE VISUALIZACIÓN Y CONSTANTES ---
import { RadarHUD } from "./radar-hud";
import { GeoScannerUI } from "./scanner-ui";
import { SpatialEngine } from "./SpatialEngine";
import { MAP_STYLES } from "./map-constants";

interface GeoCreatorOverlayProps {
  canForge: boolean;
  userId: string;
}

/**
 * CreatorOverlayContent: El puente de mando táctico de la Workstation.
 */
function CreatorOverlayContent({ canForge }: { canForge: boolean }) {
  // 1. CONSUMO DE LA FACHADA SOBERANA (Triple-Core Facade V45.0)
  const {
    status: engineStatus,
    data: engineData,
    userLocation,
    initSensors,
    isTriangulated,
    isGPSLock,
    cameraPerspective,
    mapStyle: activeEngineStyle, 
    isManualMode,
    toggleCameraPerspective,
    recenterCamera
  } = useGeoEngine();

  const { state: forgeState, dispatch } = useForge();

  // 2. ESTADOS LOCALES DE INTERFAZ
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);

  /**
   * handleHardwareIgnition:
   * Activa los sensores mediante un gesto de autoridad del Voyager.
   */
  const handleHardwareIgnition = useCallback(() => {
    nicepodLog("⚡ [Orchestrator] Iniciando ignición hardware.");
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(40);
    }
    initSensors();
  }, [initSensors]);

  /**
   * handleCameraAction: EL ALGORITMO DEL MANDO ÚNICO
   * Gestiona la transición entre Recentrar y el Ciclo de Perspectiva Triple.
   */
  const handleCameraAction = useCallback(() => {
    if (!userLocation) {
      handleHardwareIgnition();
      return;
    }

    if (isManualMode) {
      nicepodLog("🎯 [Orchestrator] Recuperando foco Voyager.");
      if (typeof window !== "undefined" && navigator.vibrate) {
        navigator.vibrate([15, 35]);
      }
      recenterCamera();
    } else {
      nicepodLog("🎥 [Orchestrator] Rotando ciclo de perspectiva.");
      if (typeof window !== "undefined" && navigator.vibrate) {
        navigator.vibrate(25);
      }
      toggleCameraPerspective();
    }
  }, [isManualMode, userLocation, recenterCamera, toggleCameraPerspective, handleHardwareIgnition]);

  /**
   * toggleForgeTerminal:
   * Apertura de terminal con gestión de recursos asíncrona.
   */
  const toggleForgeTerminal = useCallback(() => {
    if (isTerminalOpen) {
      nicepodLog("🛡️ [Orchestrator] Restaurando malla de exploración.");
      dispatch({ type: 'RESET_FORGE' });
      setIsTerminalOpen(false);
    } else {
      nicepodLog("⚒️ [Orchestrator] Aislamiento de recursos para la Forja.");
      setIsTerminalOpen(true);
    }
  }, [isTerminalOpen, dispatch]);

  const displayPlaceName = forgeState.intentText ||
    engineData?.manualPlaceName ||
    engineData?.dossier?.visual_analysis_dossier?.detectedOfficialName ||
    "Sintonía de Malla Activa";

  /**
   * smartButtonConfiguration:
   * Mapeo de la voluntad de la UI según el estado del motor.
   */
  const smartButtonConfiguration = useMemo(() => {
    if (isManualMode) {
      return {
        icon: <Target size={22} className="animate-pulse text-primary" />,
        variant: "default" as const,
        label: "Recuperar Foco"
      };
    }
    
    switch (cameraPerspective) {
      case 'STREET':
        return {
          icon: <Satellite size={22} />,
          variant: "resonance" as const,
          label: "Capa Satelital"
        };
      case 'SATELLITE':
        return {
          icon: <Layers size={22} />,
          variant: "glass" as const,
          label: "Vista Estratégica"
        };
      default: // OVERVIEW
        return {
          icon: <Navigation2 size={22} />,
          variant: "glass" as const,
          label: "Vista Inmersiva"
        };
    }
  }, [isManualMode, cameraPerspective]);

  return (
    /**
     * [ORDEN ARQUITECTÓNICA V7.1]: Pointer Isolation.
     */
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none flex flex-col z-[100] isolate">

      {/* 
          I. CAPA 0: REACTOR VISUAL (SPATIAL ENGINE)
          [FIX V7.1]: Cambio de 'mapId' a 'mapInstanceId' para cumplir el contrato V9.0.
      */}
      <AnimatePresence mode="popLayout">
        {!isTerminalOpen && (
          <motion.div
            key="background-map-instance"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-0 pointer-events-auto"
          >
            <SpatialEngine
              mapInstanceId="map-full"
              mode="EXPLORE"
              // [V7.1]: La luz reacciona al estilo para evitar texturas oscuras en satélite
              theme={activeEngineStyle === MAP_STYLES.PHOTOREALISTIC ? 'day' : 'night'}
              className="w-full h-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* II. CAPA 10: VELO DE IGNICIÓN (COLD START) */}
      <AnimatePresence>
        {engineStatus === 'IDLE' && (
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
                Conecte el link sensorial para proyectar la malla urbana de Madrid.
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

        {/* LA FORJA */}
        {canForge && engineStatus !== 'IDLE' && (
          <Button
            onClick={toggleForgeTerminal}
            variant={isTerminalOpen ? "destructive" : "glass"}
            size="tactical"
            className="shadow-2xl transition-all duration-500 pointer-events-auto rounded-2xl h-14 w-14"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isTerminalOpen ? 'close' : 'open'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                {isTerminalOpen ? <X size={26} /> : <Plus size={26} />}
              </motion.div>
            </AnimatePresence>
          </Button>
        )}

        {/* MANDO DE CÁMARA ÚNICO */}
        {!isTerminalOpen && engineStatus !== 'IDLE' && (
          <Button
            onClick={handleCameraAction}
            variant={smartButtonConfiguration.variant}
            size="icon"
            className="rounded-full shadow-2xl transition-all duration-500 pointer-events-auto h-14 w-14"
            title={smartButtonConfiguration.label}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isManualMode ? 'recenter' : cameraPerspective}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {smartButtonConfiguration.icon}
              </motion.div>
            </AnimatePresence>
          </Button>
        )}
      </div>

      {/* IV. CAPA 30: HUD DE TELEMETRÍA (FORJA) */}
      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-4 right-24 md:left-8 md:right-32 z-[250] pointer-events-auto"
          >
            <RadarHUD
              status={engineStatus}
              isTriangulated={isTriangulated}
              isGPSLock={isGPSLock}
              weather={engineData?.dossier?.weather_snapshot}
              place={displayPlaceName}
              accuracy={userLocation?.accuracy || 0}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* V. CAPA 40: TERMINAL GEO-SCANNER */}
      <AnimatePresence>
        {isTerminalOpen && (
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
                <GeoScannerUI />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VI. STATUS INFERIOR: SINTONÍA SOBERANA */}
      {!isTerminalOpen && engineStatus !== 'IDLE' && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[150] pointer-events-auto">
          <button
            onClick={handleHardwareIgnition}
            className={cn(
              "backdrop-blur-3xl px-8 py-4 rounded-full border flex items-center gap-5 shadow-2xl transition-all duration-700 active:scale-95 group",
              isGPSLock ? "bg-emerald-500/10 border-emerald-500/30" : "bg-black/80 border-white/10"
            )}
          >
            <div className="relative">
              <div className={cn("h-3 w-3 rounded-full animate-ping absolute inset-0", isGPSLock ? "bg-emerald-500" : "bg-primary")} />
              <div className={cn("h-3 w-3 rounded-full relative z-10", isGPSLock ? "bg-emerald-400" : "bg-primary")} />
            </div>
            <div className="flex flex-col items-start leading-none gap-1.5 text-left">
              <span className="text-[11px] font-black text-white uppercase tracking-[0.5em]">
                {isGPSLock ? "Malla Sintonizada" : "Capturando Señal"}
              </span>
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                {isGPSLock ? "GPS High-Fidelity Active" : "Detectando Voyager..."}
              </span>
            </div>
            {isGPSLock && <ShieldCheck size={16} className="text-emerald-500 ml-2 group-hover:scale-110 transition-transform" />}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * GeoCreatorOverlay: El contenedor con contexto de forja.
 */
export function GeoCreatorOverlay(props: GeoCreatorOverlayProps) {
  return (
    <ForgeProvider>
      <CreatorOverlayContent {...props} />
    </ForgeProvider>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V7.1):
 * 1. Contract Alignment: Se sincronizó el paso de props a SpatialEngine utilizando 
 *    el nombre completo 'mapInstanceId', resolviendo el error de compilación TS2322.
 * 2. Visual Persistence: La arquitectura garantiza que el mapa de fondo 
 *    sea visible mientras se descarga, eliminando la pantalla negra.
 * 3. Atomic Navigation: El mando de cámara centraliza la recuperación del Voyager 
 *    y el cambio de modo bajo el rigor del motor Triple-Core.
 */