// components/geo/geo-creator-overlay.tsx
// VERSIÓN: 4.4 (NicePod Sovereign Ingestion Orchestrator - Global Sync & Passthrough Edition)
// Misión: Unificar el Motor Spatial con la Terminal de Captura y el HUD persistente.
// [ESTABILIZACIÓN]: Implementación de Passthrough de eventos, sincronía de isTriangulated y elevación Z.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, Satellite, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// --- INFRAESTRUCTURA DE COMPONENTES UI ---
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
 * Orquesta la interfaz táctica sobre el mapa WebGL.
 */
function CreatorOverlayContent({ canForge }: { canForge: boolean }) {
  // 1. CONSUMO DE TELEMETRÍA GLOBAL (V17.0)
  const {
    setManualAnchor,
    status: engineStatus,
    data: engineData,
    userLocation,
    initSensors,
    isTriangulated // [NUEVO V2.7]: Requerido para informar al HUD
  } = useGeoEngine();

  const { state: forgeState, dispatch } = useForge();

  // Control de la Terminal de Captura
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);

  /**
   * [SISTEMA]: Ignición proactiva de hardware.
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
   * RESOLUCIÓN DE IDENTIDAD HUD
   */
  const displayName = forgeState.intentText ||
    engineData?.manualPlaceName ||
    engineData?.dossier?.visual_analysis_dossier?.detectedOfficialName ||
    "Sincronizando Malla Urbana...";

  return (
    /**
     * [ORDEN ARQUITECTÓNICO]:
     * El contenedor raíz es 'pointer-events-none' para no bloquear el mapa.
     * Solo sus hijos interactivos activan el 'pointer-events-auto'.
     */
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none flex flex-col">

      {/* 
          I. CAPA 0: EL MOTOR CARTOGRÁFICO 
          Ocupa todo el fondo y es el único que recibe gestos de arrastre por defecto.
      */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <SpatialEngine
          mode={isTerminalOpen ? 'FORGE' : 'EXPLORE'}
          onManualAnchor={handleManualAnchor}
        />
      </div>

      {/* 
          II. CAPA 10: EL GATILLO DE SIEMBRA (FAB) 
      */}
      {canForge && (
        <div className="absolute top-8 right-6 md:right-8 z-[120] pointer-events-auto">
          <Button
            onClick={toggleTerminal}
            className={cn(
              "h-14 w-14 md:h-16 md:w-16 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.6)] transition-all duration-500 border",
              isTerminalOpen
                ? "bg-red-500 hover:bg-red-600 text-white rotate-90 border-red-400/50"
                : "bg-[#080808] hover:bg-primary text-white border-white/10 hover:border-primary/50"
            )}
          >
            <AnimatePresence mode="wait">
              {isTerminalOpen ? (
                <motion.div key="close" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <X size={24} className="md:w-8 md:h-8" />
                </motion.div>
              ) : (
                <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Plus size={24} className="md:w-8 md:h-8 group-hover:scale-110" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      )}

      {/* 
          III. CAPA 20: HUD DE AVIÓNICA (PERSISTENTE)
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
              isTriangulated={isTriangulated} // [SYNC V2.7]
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
          V. CAPA 5: INDICADOR DE RESONANCIA (VOYAGER MODE) 
      */}
      {!isTerminalOpen && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className={cn(
            "backdrop-blur-2xl px-6 py-2.5 rounded-full border flex items-center gap-3 shadow-2xl transition-all duration-700",
            isTriangulated ? "bg-emerald-500/10 border-emerald-500/20" : "bg-black/70 border-white/10"
          )}>
            <div className={cn("h-2 w-2 rounded-full animate-ping", isTriangulated ? "bg-emerald-500" : "bg-primary")} />
            <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.5em]">
              Madrid Resonance <span className={cn("ml-2", isTriangulated ? "text-emerald-400" : "text-primary/60")}>V2.7</span>
            </span>
          </div>
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
 * NOTA TÉCNICA DEL ARCHITECT (V4.4):
 * 1. Solución de Passthrough: El contenedor raíz ahora es 'pointer-events-none'. Esto 
 *    garantiza que el mapa WebGL debajo reciba todos los gestos (zoom, rotate, drag) 
 *    sin interferencias, eliminando la sensación de "mapa bloqueado".
 * 2. Sincronía T0: Se inyectó 'isTriangulated' para informar al RadarHUD y al 
 *    indicador inferior, unificando la percepción de "Malla Localizada" en toda la UI.
 * 3. Z-Index Management: Se asignaron capas explícitas (0, 10, 20, 30, 120) para 
 *    garantizar que la terminal y los botones floten sobre el mapa pero permitan 
 *    que los marcadores HTML de Mapbox operen en su propio estrato.
 */