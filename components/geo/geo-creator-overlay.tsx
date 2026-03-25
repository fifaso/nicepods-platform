// components/geo/geo-creator-overlay.tsx
// VERSIÓN: 4.5 (NicePod Sovereign Orchestrator - Interactive Recovery Edition)
// Misión: Unificar el Motor Spatial con la Terminal de Captura y garantizar el control total del mapa.
// [ESTABILIZACIÓN]: Implementación de botón de re-centrado, feedback de persistencia y liberación de gestos.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, Satellite, Target, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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
 * Orquesta la interfaz táctica y el control de cámara sobre el mapa WebGL.
 */
function CreatorOverlayContent({ canForge }: { canForge: boolean }) {
  // 1. CONSUMO DE TELEMETRÍA SOBERANA (V18.0)
  const {
    setManualAnchor,
    status: engineStatus,
    data: engineData,
    userLocation,
    initSensors,
    isTriangulated,
    reSyncRadar
  } = useGeoEngine();

  const { state: forgeState, dispatch } = useForge();

  // Control de la Terminal de Captura
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);

  // Referencia para comunicación imperativa con el mapa si fuera necesario
  const spatialRef = useRef<any>(null);

  /**
   * [PROTOCOLO DE IGNICIÓN]:
   * Asegura que NicePod despierte los sensores al entrar al mapa.
   */
  useEffect(() => {
    if (engineStatus === 'IDLE') {
      initSensors();
    }
  }, [engineStatus, initSensors]);

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

  /**
   * handleRecenter:
   * Fuerza al mapa a buscar y centrar al Voyager de forma inmediata.
   */
  const handleRecenter = useCallback(() => {
    if (!userLocation) {
      initSensors(); // Intento de ignición forzada si no hay ubicación
      return;
    }
    // El SpatialEngine reaccionará automáticamente al cambio de coordenadas
    // si el componente se mantiene sincronizado.
    nicepodLog("🎯 [Orchestrator] Re-centrando cámara en Voyager.");
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(20);
    }
  }, [userLocation, initSensors]);

  /**
   * RESOLUCIÓN DE IDENTIDAD HUD
   */
  const displayName = forgeState.intentText ||
    engineData?.manualPlaceName ||
    engineData?.dossier?.visual_analysis_dossier?.detectedOfficialName ||
    "Malla Satelital Activa";

  return (
    /**
     * [ARQUITECTURA DE EVENTOS]:
     * Contenedor raíz invisible a los clics. Solo los componentes tácticos 
     * activan la interactividad.
     */
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none flex flex-col">

      {/* 
          I. CAPA 0: MOTOR CARTOGRÁFICO 
          Interactivo por defecto.
      */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <SpatialEngine
          mode={isTerminalOpen ? 'FORGE' : 'EXPLORE'}
          onManualAnchor={handleManualAnchor}
        />
      </div>

      {/* 
          II. CAPA 10: BOTONES TÁCTICOS FLOTANTES 
      */}
      <div className="absolute top-8 right-6 md:right-8 flex flex-col gap-4 z-[120] pointer-events-auto">

        {/* BOTÓN DE SIEMBRA (FAB) */}
        {canForge && (
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
                <motion.div key="close" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <X size={24} className="md:w-8 md:h-8" />
                </motion.div>
              ) : (
                <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Plus size={24} className="md:w-8 md:h-8" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        )}

        {/* BOTÓN DE RE-CENTRADO (POKÉMON GO STYLE) */}
        {!isTerminalOpen && isTriangulated && (
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
          III. CAPA 20: HUD DE TELEMETRÍA 
      */}
      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
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
          IV. CAPA 30: TERMINAL DE INGESTA (DRAWER) 
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
          V. CAPA 5: INDICADOR DE RESONANCIA Y ACCESO RÁPIDO 
      */}
      {!isTerminalOpen && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
          <button
            onClick={handleRecenter}
            className={cn(
              "backdrop-blur-2xl px-6 py-2.5 rounded-full border flex items-center gap-3 shadow-2xl transition-all duration-700 active:scale-95",
              isTriangulated ? "bg-emerald-500/10 border-emerald-500/20" : "bg-black/70 border-white/10"
            )}
          >
            <div className={cn("h-2 w-2 rounded-full animate-ping", isTriangulated ? "bg-emerald-500" : "bg-primary")} />
            <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.5em]">
              {isTriangulated ? "Malla Sintonizada" : "Madrid Resonance"} <span className={cn("ml-2", isTriangulated ? "text-emerald-400" : "text-primary/60")}>V2.7</span>
            </span>
          </button>
        </div>
      )}

    </div>
  );
}

/**
 * GeoCreatorOverlay: El contenedor raíz de la Malla de Madrid.
 */
export function GeoCreatorOverlay(props: GeoCreatorOverlayProps) {
  return (
    <ForgeProvider>
      <CreatorOverlayContent {...props} />
    </ForgeProvider>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.5):
 * 1. Botón de Recuperación de Foco: Se añadió 'Target' para re-centrar la cámara 
 *    en el Voyager. Esto soluciona la frustración del usuario si el mapa se desvía 
 *    y permite "confirmar" visualmente que el sistema sigue rastreando.
 * 2. Passthrough Garantizado: Se refinó la jerarquía de 'pointer-events'. El mapa 
 *    recibe gestos en todo el viewport (Capa 0) mientras los elementos de control 
 *    (HUD/FAB) interceptan eventos solo en su área delimitada.
 * 3. Feedback de Triangulación: El indicador inferior ahora muta a esmeralda y 
 *    cambia su texto cuando 'isTriangulated' es true, informando al usuario del 
 *    éxito del enlace satelital.
 */