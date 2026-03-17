// components/geo/geo-creator-overlay.tsx
// VERSIÓN: 3.0 (NicePod V2.6 - Sovereign Ingestion Orchestrator Final)
// Misión: Unificar el Motor Spatial con la Terminal de Captura y el Scroll.
// [ESTABILIZACIÓN]: Inyección del GeoEngineProvider y flexibilización de contenedores (Scroll Fix).

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Map as MapIcon, Plus, Satellite, X } from "lucide-react";
import { useCallback, useState } from "react";

// --- NÚCLEO DE INFRAESTRUCTURA ---
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- PROVEEDORES SOBERANOS (EL CEREBRO ÚNICO) ---
import { GeoEngineProvider, useGeoEngine } from "@/hooks/use-geo-engine";
import { ForgeProvider, useForge } from "./forge-context";

// --- COMPONENTES VINCULADOS ---
import { GeoScannerUI } from "./scanner-ui";
import { SpatialEngine } from "./SpatialEngine";

/**
 * INTERFAZ: GeoCreatorOverlayProps
 */
interface GeoCreatorOverlayProps {
  /** canForge: Autoridad heredada del servidor (RBAC) */
  canForge: boolean;
  /** userId: Identidad del curador */
  userId: string;
}

/**
 * COMPONENTE INTERNO: CreatorOverlayContent
 * Este componente vive dentro de los Providers para acceder al estado compartido.
 */
function CreatorOverlayContent({ canForge }: { canForge: boolean }) {
  const { dispatch } = useForge();
  const { setManualAnchor, reset: resetSensors } = useGeoEngine();

  // Estado local para controlar la visibilidad de la Terminal de Ingesta
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  /**
   * toggleTerminal:
   * Activa/Desactiva el flujo de creación y cambia el modo del mapa.
   */
  const toggleTerminal = useCallback(() => {
    if (isTerminalOpen) {
      // Al cerrar, reseteamos la forja y los sensores para ahorrar batería/RAM
      dispatch({ type: 'RESET_FORGE' });
      resetSensors();
      setIsTerminalOpen(false);
    } else {
      setIsTerminalOpen(true);
    }
  }, [isTerminalOpen, dispatch, resetSensors]);

  /**
   * handleManualAnchor:
   * Puente entre el long-press del mapa (SpatialEngine) y la memoria (ForgeContext).
   */
  const handleManualAnchor = useCallback((lngLat: [number, number]) => {
    if (!isTerminalOpen) return;

    // Actualizamos el motor sensorial (Hardware Lock)
    setManualAnchor(lngLat[0], lngLat[1]);

    // Sincronizamos la memoria de la forja (Context)
    dispatch({
      type: 'SET_LOCATION',
      payload: {
        lat: lngLat[1],
        lng: lngLat[0],
        acc: 1 // Precisión absoluta por ser anclaje manual (Admin Authority)
      }
    });
  }, [isTerminalOpen, setManualAnchor, dispatch]);

  return (
    <div className="relative w-full h-full">

      {/* 
          I. EL MOTOR CARTOGRÁFICO UNIFICADO 
          El modo cambia según si la terminal está abierta para permitir 
          la visión satelital pura durante la siembra.
      */}
      <SpatialEngine
        mode={isTerminalOpen ? 'FORGE' : 'EXPLORE'}
        onManualAnchor={handleManualAnchor}
      />

      {/* 
          II. BOTÓN FLOTANTE SOBERANO (FAB) 
          Solo visible para usuarios con autoridad de creación (Admin/Pro).
      */}
      {canForge && (
        <div className="absolute top-8 right-8 z-[110]">
          <Button
            onClick={toggleTerminal}
            className={cn(
              "h-16 w-16 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.8)] transition-all duration-500 group overflow-hidden border",
              isTerminalOpen
                ? "bg-red-500 hover:bg-red-600 text-white rotate-90 border-red-500/50"
                : "bg-[#020202] hover:bg-primary text-white border-white/10 hover:border-primary/50"
            )}
          >
            <AnimatePresence mode="wait">
              {isTerminalOpen ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <X size={28} />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="flex items-center justify-center"
                >
                  <Plus size={28} className="group-hover:scale-110 transition-transform" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Efecto de pulso táctico cuando está en modo espera */}
            {!isTerminalOpen && (
              <div className="absolute inset-0 bg-white/5 animate-pulse rounded-full -z-10" />
            )}
          </Button>
        </div>
      )}

      {/* 
          III. LA TERMINAL DE INGESTA (DRAWER / OVERLAY) 
          Se proyecta desde la base. Ocupa el 85% de la pantalla para no tapar el mapa.
      */}
      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            // [FIX SCROLL 1]: pointer-events-auto garantiza que podamos interactuar con la terminal.
            className="absolute inset-x-0 bottom-0 z-[100] flex flex-col justify-end pointer-events-auto h-[85vh]"
          >
            {/* Velo superior oscuro para dar foco al drawer */}
            <div className="absolute -top-[15vh] inset-x-0 h-[15vh] bg-black/50 backdrop-blur-md pointer-events-none" />

            {/* [FIX SCROLL 2]: Chasis Principal. Eliminado el 'overflow-hidden' que rompía el scroll. */}
            <div className="w-full h-full bg-[#020202]/95 backdrop-blur-3xl rounded-t-[3.5rem] border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] flex flex-col relative">

              {/* Indicador Táctil Superior (Drag Handle) */}
              <div className="w-full flex justify-center py-5 shrink-0 z-10">
                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
              </div>

              {/* Marca de Agua Activa */}
              <div className="absolute top-6 left-10 flex items-center gap-3 opacity-30">
                <Satellite size={12} className="text-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">
                  Workstation Terminal
                </span>
              </div>

              {/* [FIX SCROLL 3]: Este es el contenedor vital. 'overflow-y-auto' delega 
                  el scroll a los Steps internos (ScannerUI), erradicando el bloqueo. */}
              <div className="w-full flex-1 overflow-y-auto relative custom-scrollbar">
                <GeoScannerUI />
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
          IV. INDICADOR DE MODO (EXPLORE OVERLAY) 
          Informa al Voyager sobre la naturaleza de la vista de consumo.
      */}
      {!isTerminalOpen && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="bg-black/80 backdrop-blur-2xl px-6 py-2.5 rounded-full border border-white/10 flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-1000">
            <MapIcon size={14} className="text-primary/60" />
            <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.4em]">
              Madrid Resonance <span className="text-primary/60 ml-2">V2.6</span>
            </span>
          </div>
        </div>
      )}

    </div>
  );
}

/**
 * COMPONENTE PRINCIPAL: GeoCreatorOverlay
 * Exportación nominal que provee la "Caja Craneal" para el Cerebro Dual.
 */
export function GeoCreatorOverlay(props: GeoCreatorOverlayProps) {
  return (
    // [EL ESCUDO DE ESTADO]: GeoEngineProvider envuelve toda la UI.
    // Esto garantiza que el mapa y los menús compartan EXACTAMENTE los mismos datos de GPS,
    // erradicando las desincronizaciones de estado (Ghost States).
    <GeoEngineProvider>
      <ForgeProvider>
        <CreatorOverlayContent {...props} />
      </ForgeProvider>
    </GeoEngineProvider>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Resiliencia de Scroll: El contenedor de 'GeoScannerUI' es ahora un flex-1 
 *    con 'overflow-y-auto'. Esto permite que componentes altos como el Step 1 
 *    puedan hacer scroll sin que el HUD se pierda ni la ventana se rompa.
 * 2. Sincronía Total: La inclusión de <GeoEngineProvider> es la cura definitiva 
 *    al problema donde el HUD decía "SENSORS READY" pero el mapa decía "CARGANDO".
 */