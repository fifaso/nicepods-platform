// components/geo/geo-creator-overlay.tsx
// VERSIÓN: 4.2 (NicePod V2.6 - Sovereign Ingestion Orchestrator - Clean Edition)
// Misión: Unificar el Motor Spatial con la Terminal de Captura.
// [ESTABILIZACIÓN]: Eliminación de GeoEngineProvider redundante (ahora heredado globalmente).

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, Satellite, X } from "lucide-react";
import React, { useCallback, useState, useEffect } from "react";

// --- INFRAESTRUCTURA DE COMPONENTES UI ---
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- PROVEEDORES DE ESTADO (CEREBROS) ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { ForgeProvider, useForge } from "./forge-context";

// --- MOTORES DE VISUALIZACIÓN Y CAPTURA ---
import { GeoScannerUI } from "./scanner-ui";
import { SpatialEngine } from "./SpatialEngine";
import { RadarHUD } from "./radar-hud";

/**
 * INTERFAZ: GeoCreatorOverlayProps
 * Recibe la autoridad de rango y la identidad desde el servidor (SSR).
 */
interface GeoCreatorOverlayProps {
  /** canForge: Autoridad heredada para mutar la malla urbana. */
  canForge: boolean;
  /** userId: Identificador único del curador soberano. */
  userId: string;
}

/**
 * COMPONENTE INTERNO: CreatorOverlayContent
 * Orquesta la interacción entre el mapa WebGL y la UI de captura.
 */
function CreatorOverlayContent({ canForge }: { canForge: boolean }) {
  // 1. CONSUMO DE FACULTADES (El motor sensorial viene del Provider Global en Layout)
  const { state: forgeState, dispatch } = useForge();
  const { 
    setManualAnchor, 
    reset: resetSensors,
    status: engineStatus,
    data: engineData,
    userLocation,
    initSensors 
  } = useGeoEngine();

  // Control de visibilidad de la terminal táctil
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);

  /**
   * [PROTOCOLO AUTO-IGNITION]:
   * Inicia la triangulación GPS en el montaje.
   */
  useEffect(() => {
    initSensors();
    
    // Cleanup opcional al desmontar. El layout mantiene el engine vivo, 
    // pero resetear asegura que la próxima entrada sea limpia.
    return () => {
      resetSensors();
    };
  }, [initSensors, resetSensors]);

  /**
   * toggleTerminal:
   * Activa/Desactiva el flujo de siembra y permuta el modo del motor cartográfico.
   */
  const toggleTerminal = useCallback(() => {
    if (isTerminalOpen) {
      // Solo purgamos la memoria de forja (RAM de creación), no el GPS.
      dispatch({ type: 'RESET_FORGE' });
      setIsTerminalOpen(false);
    } else {
      setIsTerminalOpen(true);
    }
  }, [isTerminalOpen, dispatch]);

  /**
   * handleManualAnchor:
   * Puente de autoridad entre el gesto táctil del mapa y la memoria de ingesta.
   */
  const handleManualAnchor = useCallback((lngLat: [number, number]) => {
    if (!isTerminalOpen) return;

    setManualAnchor(lngLat[0], lngLat[1]);

    dispatch({
      type: 'SET_LOCATION',
      payload: {
        lat: lngLat[1],
        lng: lngLat[0],
        acc: 1 
      }
    });
  }, [isTerminalOpen, setManualAnchor, dispatch]);

  /**
   * RESOLUCIÓN DE IDENTIDAD NOMINATIVA (Para el HUD)
   */
  const displayName = forgeState.intentText || 
                      engineData?.manualPlaceName || 
                      engineData?.dossier?.visual_analysis_dossier?.detectedOfficialName || 
                      "Detectando Ubicación...";

  return (
    // [FIX VIEWPORT]: Control de eventos de puntero.
    <div className={cn(
      "absolute inset-0 w-full h-full overflow-hidden flex flex-col transition-all duration-500",
      isTerminalOpen ? "bg-black/20 pointer-events-auto" : "bg-transparent pointer-events-none"
    )}>

      {/* I. EL MOTOR CARTOGRÁFICO SOBERANO (SPATIAL ENGINE) */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <SpatialEngine
          mode={isTerminalOpen ? 'FORGE' : 'EXPLORE'}
          onManualAnchor={handleManualAnchor}
        />
      </div>

      {/* II. EL GATILLO SOBERANO (FAB) */}
      {canForge && (
        <div className="absolute top-8 right-6 md:right-8 z-[120] pointer-events-auto">
          <Button
            onClick={toggleTerminal}
            className={cn(
              "h-14 w-14 md:h-16 md:w-16 rounded-full shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-500 group overflow-hidden border",
              isTerminalOpen
                ? "bg-red-500 hover:bg-red-600 text-white rotate-90 border-red-400/50"
                : "bg-[#020202] hover:bg-primary text-white border-white/10 hover:border-primary/50 shadow-primary/20"
            )}
            aria-label={isTerminalOpen ? "Abortar siembra" : "Iniciar siembra"}
          >
            <AnimatePresence mode="wait">
              {isTerminalOpen ? (
                <motion.div
                  key="close_icon"
                  initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <X size={24} className="md:w-8 md:h-8" />
                </motion.div>
              ) : (
                <motion.div
                  key="open_icon"
                  initial={{ opacity: 0, scale: 0.5, rotate: 45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="flex items-center justify-center"
                >
                  <Plus size={24} className="md:w-8 md:h-8 group-hover:scale-110 transition-transform duration-300" />
                </motion.div>
              )}
            </AnimatePresence>

            {!isTerminalOpen && (
              <div className="absolute inset-0 bg-primary/10 animate-pulse rounded-full -z-10" />
            )}
          </Button>
        </div>
      )}

      {/* III. EL HUD DE TELEMETRÍA (PERSISTENCIA SUPERIOR) */}
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
              weather={engineData?.dossier?.weather_snapshot}
              place={displayName}
              accuracy={userLocation?.accuracy || 0}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* IV. LA TERMINAL DE INGESTA (DRAWER OVERLAY) */}
      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-x-0 bottom-0 z-[100] flex flex-col justify-end pointer-events-auto h-[75vh]"
          >
            <div className="absolute -top-[15vh] inset-x-0 h-[15vh] bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

            <div className="w-full h-full bg-[#020202]/95 backdrop-blur-3xl rounded-t-[3rem] md:rounded-t-[4rem] border-t border-white/10 shadow-[0_-30px_60px_rgba(0,0,0,0.9)] flex flex-col relative overflow-hidden">
              
              <div className="w-full flex justify-center py-5 shrink-0 z-20">
                <div className="w-12 md:w-16 h-1.5 bg-white/10 rounded-full" />
              </div>

              <div className="absolute top-6 left-6 md:left-12 flex items-center gap-3 opacity-30 pointer-events-none z-10">
                <Satellite size={12} className="text-primary animate-pulse" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] text-white">
                  Oracle Station
                </span>
              </div>

              <div className="w-full flex-1 relative flex flex-col min-h-0 mt-4 md:mt-8">
                <GeoScannerUI />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* V. INDICADOR DE RESONANCIA (MODO VOYAGER) */}
      {!isTerminalOpen && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="bg-black/70 backdrop-blur-2xl px-6 py-2.5 rounded-full border border-white/10 flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-1000">
            <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
            <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.5em]">
              Madrid Resonance <span className="text-primary/60 ml-2">V2.6</span>
            </span>
          </div>
        </div>
      )}

    </div>
  );
}

/**
 * COMPONENTE PÚBLICO: GeoCreatorOverlay
 * Inyecta exclusivamente el ForgeProvider. La inteligencia sensorial (GeoEngineProvider) 
 * es heredada globalmente desde PlatformLayout.
 */
export function GeoCreatorOverlay(props: GeoCreatorOverlayProps) {
  return (
    <ForgeProvider>
      <CreatorOverlayContent {...props} />
    </ForgeProvider>
  );
}