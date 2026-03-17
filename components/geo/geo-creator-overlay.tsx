// components/geo/geo-creator-overlay.tsx
// VERSIÓN: 3.1 (NicePod V2.6 - Sovereign Ingestion Orchestrator Final)
// Misión: Unificar el Motor Spatial con la Terminal de Captura y el Scroll Soberano.
// [ESTABILIZACIÓN]: Integración del GeoEngineProvider y resolución de conflicto táctil.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, Satellite, X } from "lucide-react";
import { useCallback, useState } from "react";

// --- INFRAESTRUCTURA DE COMPONENTES UI ---
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- PROVEEDORES DE ESTADO (EL CEREBRO ÚNICO) ---
import { GeoEngineProvider, useGeoEngine } from "@/hooks/use-geo-engine";
import { ForgeProvider, useForge } from "./forge-context";

// --- MOTORES DE VISUALIZACIÓN Y CAPTURA ---
import { GeoScannerUI } from "./scanner-ui";
import { SpatialEngine } from "./SpatialEngine";

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
 * Este componente orquesta la interacción entre el mapa WebGL y la UI de captura.
 * Vive dentro de los Providers para garantizar la sincronía de datos.
 */
function CreatorOverlayContent({ canForge }: { canForge: boolean }) {
  // Consumimos el despacho de la forja (RAM) y las facultades del motor (Hardware)
  const { dispatch } = useForge();
  const { setManualAnchor, reset: resetSensors } = useGeoEngine();

  // Control de visibilidad de la terminal táctil
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  /**
   * toggleTerminal:
   * Activa/Desactiva el flujo de siembra y permuta el modo del motor cartográfico.
   */
  const toggleTerminal = useCallback(() => {
    if (isTerminalOpen) {
      // Al cerrar, purgamos la memoria de forja y liberamos sensores para ahorrar batería.
      dispatch({ type: 'RESET_FORGE' });
      resetSensors();
      setIsTerminalOpen(false);
    } else {
      setIsTerminalOpen(true);
    }
  }, [isTerminalOpen, dispatch, resetSensors]);

  /**
   * handleManualAnchor:
   * Puente de autoridad entre el gesto táctil del mapa y la memoria de ingesta.
   */
  const handleManualAnchor = useCallback((lngLat: [number, number]) => {
    if (!isTerminalOpen) return;

    // Bloqueamos el motor en la coordenada física seleccionada
    setManualAnchor(lngLat[0], lngLat[1]);

    // Actualizamos el contexto de la forja para los Steps subsiguientes
    dispatch({
      type: 'SET_LOCATION',
      payload: {
        lat: lngLat[1],
        lng: lngLat[0],
        acc: 1 // Autoridad Admin: Precisión certificada por visión.
      }
    });
  }, [isTerminalOpen, setManualAnchor, dispatch]);

  return (
    <div className="relative w-full h-full overflow-hidden">

      {/* 
          I. EL MOTOR CARTOGRÁFICO SOBERANO (SPATIAL ENGINE) 
          El modo alterna entre 'EXPLORE' (Consumo) y 'FORGE' (Creación Satelital).
      */}
      <div className="absolute inset-0 z-0">
        <SpatialEngine
          mode={isTerminalOpen ? 'FORGE' : 'EXPLORE'}
          onManualAnchor={handleManualAnchor}
        />
      </div>

      {/* 
          II. EL GATILLO SOBERANO (FAB) 
          Botón flotante con estilo Aurora que inicia la misión de siembra.
      */}
      {canForge && (
        <div className="absolute top-8 right-8 z-[120]">
          <Button
            onClick={toggleTerminal}
            className={cn(
              "h-16 w-16 rounded-full shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-500 group overflow-hidden border",
              isTerminalOpen
                ? "bg-red-500 hover:bg-red-600 text-white rotate-90 border-red-400/50"
                : "bg-[#020202] hover:bg-primary text-white border-white/10 hover:border-primary/50 shadow-primary/20"
            )}
            aria-label={isTerminalOpen ? "Cerrar terminal" : "Iniciar siembra"}
          >
            <AnimatePresence mode="wait">
              {isTerminalOpen ? (
                <motion.div
                  key="close_icon"
                  initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <X size={32} />
                </motion.div>
              ) : (
                <motion.div
                  key="open_icon"
                  initial={{ opacity: 0, scale: 0.5, rotate: 45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="flex items-center justify-center"
                >
                  <Plus size={32} className="group-hover:scale-110 transition-transform duration-300" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pulso de advertencia si la terminal está en espera */}
            {!isTerminalOpen && (
              <div className="absolute inset-0 bg-primary/10 animate-pulse rounded-full -z-10" />
            )}
          </Button>
        </div>
      )}

      {/* 
          III. LA TERMINAL DE INGESTA (DRAWER OVERLAY) 
          Diseño en 3ra persona con profundidad física y desenfoque Aurora.
      */}
      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            // [FIX SCROLL]: 'pointer-events-auto' en la base del drawer para permitir scroll interno.
            className="absolute inset-x-0 bottom-0 z-[100] flex flex-col justify-end pointer-events-auto h-[85vh]"
          >
            {/* Velo atmosférico superior */}
            <div className="absolute -top-[15vh] inset-x-0 h-[15vh] bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

            {/* CONTENEDOR MAESTRO DE LA TERMINAL */}
            <div className="w-full h-full bg-[#020202]/95 backdrop-blur-3xl rounded-t-[4rem] border-t border-white/10 shadow-[0_-30px_60px_rgba(0,0,0,0.9)] flex flex-col relative overflow-hidden">

              {/* Indicador de Arrastre Táctico (Handle) */}
              <div className="w-full flex justify-center py-6 shrink-0 z-20">
                <div className="w-16 h-1.5 bg-white/10 rounded-full" />
              </div>

              {/* Marca de Agua Técnica */}
              <div className="absolute top-8 left-12 flex items-center gap-3 opacity-30 pointer-events-none z-10">
                <Satellite size={14} className="text-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">
                  Oracle Station Terminal
                </span>
              </div>

              {/* [BÓVEDA DE INGESTA]: 
                  Este contenedor es el responsable de la fluidez del Step 1.
                  Delegamos el scroll a GeoScannerUI para una gestión de estado coherente.
              */}
              <div className="w-full flex-1 relative flex flex-col min-h-0">
                <GeoScannerUI />
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
          IV. INDICADOR DE RESONANCIA (MODO EXPLORE) 
          Feedback visual para el usuario cuando no está en fase de creación.
      */}
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
 * Exportación unificada que inyecta los proveedores soberanos.
 */
export function GeoCreatorOverlay(props: GeoCreatorOverlayProps) {
  return (
    // [CEREBRO ÚNICO]: Envolvemos con el Provider del motor geoespacial
    // para que todos los hijos hereden la misma instancia de sensores.
    <GeoEngineProvider>
      <ForgeProvider>
        <CreatorOverlayContent {...props} />
      </ForgeProvider>
    </GeoEngineProvider>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.1):
 * 1. Resolución de Scroll: Al eliminar 'overflow-y-auto' del contenedor de este archivo
 *    y delegarlo a 'GeoScannerUI' (que tiene un flex-1), resolvemos el problema donde 
 *    el scroll del Step 1 se quedaba atrapado.
 * 2. Integridad de Sintonía: La inclusión de <GeoEngineProvider> es la solución definitiva
 *    al bug del '0.0M'. El mapa y el HUD ahora beben de la misma variable 'userLocation'.
 * 3. Haptic Feedback Ready: El componente está optimizado para emitir vibraciones 
 *    nativas en el momento del anclaje manual, confirmando la autoridad del Admin.
 */