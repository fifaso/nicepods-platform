/**
 * ARCHIVO: components/geo/geo-creator-overlay.tsx
 * VERSIÓN: 5.6 (NicePod Sovereign Orchestrator - Build Stability & Instance Identity Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Unificar la interfaz con el mando de cámara soberano y aislamiento de instancia.
 * [REPARACIÓN CRÍTICA]: Inyección de mapId="map-full" para sanar error de build TS2322.
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

// --- INFRAESTRUCTURA DE COMPONENTES UI (V11.0 Tactical) ---
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

/**
 * CreatorOverlayContent: El puente de mando táctico de la Workstation.
 */
function CreatorOverlayContent({ canForge }: { canForge: boolean }) {
  // 1. CONSUMO DE SOBERANÍA CINEMÁTICA (V35.0)
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

  // 2. ESTADOS LOCALES DE INTERFAZ
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [mapTheme, setMapTheme] = useState<MapboxLightPreset>('night');

  /**
   * handleIgnition:
   * Activa los sensores mediante un gesto de autoridad explícito.
   */
  const handleIgnition = useCallback(() => {
    nicepodLog("⚡ [Orchestrator] Gesto de ignición detectado. Despertando hardware.");
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(40);
    }
    reSyncRadar();
  }, [reSyncRadar]);

  /**
   * handleCameraAction: EL ALGORITMO DEL MANDO ÚNICO
   * Gestiona la transición entre Recentrar y Conmutar Perspectiva.
   */
  const handleCameraAction = useCallback(() => {
    if (!userLocation) {
      handleIgnition();
      return;
    }

    if (isManualMode) {
      nicepodLog("🎯 [Orchestrator] Ejecutando comando de recentrado.");
      if (typeof window !== "undefined" && navigator.vibrate) {
        navigator.vibrate([15, 35]);
      }
      recenterCamera();
    } else {
      const nextView = cameraPerspective === 'STREET' ? 'OVERVIEW' : 'STREET';
      nicepodLog(`🎥 [Orchestrator] Transmutando visor a modo ${nextView}.`);
      if (typeof window !== "undefined" && navigator.vibrate) {
        navigator.vibrate(25);
      }
      toggleCameraPerspective();
    }
  }, [isManualMode, userLocation, cameraPerspective, recenterCamera, toggleCameraPerspective, handleIgnition]);

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
    "Sintonía de Malla Activa";

  /**
   * smartButtonConfig: Configuración dinámica basada en el estado cinemático.
   */
  const smartButtonConfig = useMemo(() => {
    if (isManualMode) {
      return {
        icon: <Target size={22} className="animate-pulse" />,
        variant: "default" as const,
        label: "Recuperar Foco"
      };
    }
    if (cameraPerspective === 'STREET') {
      return {
        icon: <Layers size={22} />,
        variant: "resonance" as const,
        label: "Vista Estratégica"
      };
    }
    return {
      icon: <Navigation2 size={22} />,
      variant: "glass" as const,
      label: "Vista Inmersiva"
    };
  }, [isManualMode, cameraPerspective]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none flex flex-col">

      {/* I. CAPA 0: EL MOTOR CARTOGRÁFICO SOBERANO 
          [FIX V5.6]: Se inyecta mapId="map-full" para cumplir el contrato TS y aislar la instancia.
      */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <SpatialEngine
          mapId="map-full" // <--- Identidad Soberana de la Malla Principal
          mode={isTerminalOpen ? 'FORGE' : 'EXPLORE'}
          theme={mapTheme}
          onManualAnchor={(lngLat) => {
            if (!isTerminalOpen) return;
            dispatch({ type: 'SET_LOCATION', payload: { lat: lngLat[1], lng: lngLat[0], acc: 1 } });
          }}
        />
      </div>

      {/* II. CAPA 10: PANEL DE IGNICIÓN (COLD FIX) */}
      <AnimatePresence>
        {engineStatus === 'IDLE' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[300] bg-black/60 backdrop-blur-2xl flex flex-col items-center justify-center p-8 pointer-events-auto"
          >
            <div className="max-w-xs w-full bg-[#080808] border border-white/10 rounded-[3.5rem] p-12 flex flex-col items-center text-center shadow-[0_50px_100px_rgba(0,0,0,0.9)]">
              <div className="relative mb-12">
                <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
                <Satellite className="h-16 w-16 text-primary relative z-10" />
              </div>
              <h2 className="text-white font-black uppercase tracking-[0.5em] text-[10px] mb-4">Malla Desconectada</h2>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.3em] leading-relaxed mb-12 px-2">
                Active la telemetría para proyectar la malla de inteligencia.
              </p>
              <Button
                onClick={handleIgnition}
                size="lg"
                variant="default"
                className="w-full rounded-2xl"
              >
                <Power size={18} className="mr-3" />
                CONECTAR
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* III. CAPA 20: DOCK DE COMANDO TÁCTICO */}
      <div className="absolute top-8 right-6 md:right-8 flex flex-col gap-5 z-[150] pointer-events-auto">
        
        {/* ACCIÓN: LA FORJA */}
        {canForge && engineStatus !== 'IDLE' && (
          <Button
            onClick={toggleTerminal}
            variant={isTerminalOpen ? "destructive" : "glass"}
            size="tactical"
            className="shadow-2xl transition-all duration-500"
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

        {/* ACCIÓN: SELECTOR DE TEMA AMBIENTAL */}
        {!isTerminalOpen && engineStatus !== 'IDLE' && (
          <Button
            onClick={() => setMapTheme(prev => prev === 'night' ? 'day' : 'night')}
            variant="glass"
            size="icon"
            className="rounded-full shadow-xl"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={mapTheme}
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -5, opacity: 0 }}
              >
                {mapTheme === 'night' ? <Moon size={20} /> : <Sun size={20} />}
              </motion.div>
            </AnimatePresence>
          </Button>
        )}

        {/* ACCIÓN: EL MANDO ÚNICO (SMART-BUTTON V5.6) */}
        {!isTerminalOpen && engineStatus !== 'IDLE' && (
          <Button
            onClick={handleCameraAction}
            variant={smartButtonConfig.variant}
            size="icon"
            className="rounded-full shadow-2xl transition-all duration-500"
            title={smartButtonConfig.label}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isManualMode ? 'recenter' : cameraPerspective}
                initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 1.5, opacity: 0, rotate: 45 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {smartButtonConfig.icon}
              </motion.div>
            </AnimatePresence>
          </Button>
        )}
      </div>

      {/* IV. CAPA 30: HUD TELEMETRÍA (FORJA) */}
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

      {/* V. CAPA 40: TERMINAL DE INGESTA IA */}
      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-x-0 bottom-0 z-[130] flex flex-col justify-end pointer-events-auto h-[75vh]"
          >
            <div className="w-full h-full bg-[#020202]/98 backdrop-blur-3xl rounded-t-[3.5rem] border-t border-white/10 shadow-[0_-30px_60px_rgba(0,0,0,0.9)] flex flex-col relative overflow-hidden">
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

      {/* VI. STATUS INFERIOR (SINTONÍA NOMINAL) */}
      {!isTerminalOpen && engineStatus !== 'IDLE' && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto">
          <button
            onClick={handleIgnition}
            className={cn(
              "backdrop-blur-3xl px-8 py-4 rounded-full border flex items-center gap-5 shadow-2xl transition-all duration-700 active:scale-95 group",
              isGPSLock ? "bg-emerald-500/10 border-emerald-500/30" : "bg-black/80 border-white/10"
            )}
          >
            <div className="relative">
              <div className={cn("h-3 w-3 rounded-full animate-ping absolute inset-0", isGPSLock ? "bg-emerald-500" : "bg-primary")} />
              <div className={cn("h-3 w-3 rounded-full relative z-10", isGPSLock ? "bg-emerald-400" : "bg-primary")} />
            </div>
            <div className="flex flex-col items-start leading-none gap-1.5">
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

export function GeoCreatorOverlay(props: GeoCreatorOverlayProps) {
  return (
    <ForgeProvider>
      <CreatorOverlayContent {...props} />
    </ForgeProvider>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.6):
 * 1. Build Shield Restoration: La inyección de mapId="map-full" satisface el 
 *    contrato de SpatialEngineProps, resolviendo el error fatal TS2322.
 * 2. Unified Context: El componente se alinea con la estrategia de aislamiento 
 *    de instancias, asegurando que el mando visual no sufra de ghosting.
 * 3. Haptic & Visual ACK: Se preserva la lógica de Smart-Button con feedback
 *    Háptico de grado industrial.
 * 4. Zero Abbreviations: Archivo 100% íntegro para despliegue inmediato.
 */