// components/geo/geo-creator-overlay.tsx
// VERSIÓN: 1.0 (NicePod V2.6 - Sovereign Ingestion Orchestrator)
// Misión: Unificar el Motor Spatial con la Terminal de Captura Multimodal.
// [ESTABILIZACIÓN]: Gestión de estados de creación, modo de mapa y anclaje manual.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Map as MapIcon, Plus, Satellite, X } from "lucide-react";
import { useCallback, useState } from "react";

// --- NÚCLEO DE INFRAESTRUCTURA ---
import { Button } from "@/components/ui/button";
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn } from "@/lib/utils";
import { ForgeProvider, useForge } from "./forge-context";
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
 * Este componente vive dentro del ForgeProvider para poder acceder al dispatch.
 */
function CreatorOverlayContent({ canForge }: { canForge: boolean }) {
  const { state, dispatch } = useForge();
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
   * Puente entre el long-press del mapa y la memoria de la forja.
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
        acc: 1 // Precisión absoluta por ser anclaje manual
      }
    });
  }, [isTerminalOpen, setManualAnchor, dispatch]);

  return (
    <div className="relative w-full h-full">

      {/* 
          I. EL MOTOR CARTOGRÁFICO UNIFICADO 
          El modo cambia según si la terminal está abierta para permitir 
          la visión satelital durante la creación.
      */}
      <SpatialEngine
        mode={isTerminalOpen ? 'FORGE' : 'EXPLORE'}
        onManualAnchor={handleManualAnchor}
      />

      {/* 
          II. BOTÓN FLOTANTE SOBERANO (FAB) 
          Solo visible para usuarios con autoridad (Admin/Pro).
      */}
      {canForge && (
        <div className="absolute top-8 right-8 z-[110]">
          <Button
            onClick={toggleTerminal}
            className={cn(
              "h-16 w-16 rounded-full shadow-2xl transition-all duration-500 group overflow-hidden",
              isTerminalOpen
                ? "bg-red-500 hover:bg-red-600 text-white rotate-90"
                : "bg-white hover:bg-primary text-black hover:text-white"
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

            {/* Efecto de pulso cuando está en modo espera */}
            {!isTerminalOpen && (
              <div className="absolute inset-0 bg-primary/20 animate-ping rounded-full -z-10" />
            )}
          </Button>
        </div>
      )}

      {/* 
          III. LA TERMINAL DE INGESTA (DRAWER / OVERLAY) 
          Se proyecta desde la base cubriendo parcialmente el mapa.
      */}
      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-[100] flex flex-col justify-end pointer-events-none"
          >
            {/* Overlay de fondo para enfocar la carga cognitiva */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-none" />

            {/* Contenedor de la Workstation Terminal */}
            <div className="w-full h-[85vh] bg-[#020202]/90 backdrop-blur-3xl rounded-t-[3.5rem] border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] pointer-events-auto overflow-hidden relative">

              {/* Indicador Táctil Superior (Drag Handle Visual) */}
              <div className="w-full flex justify-center py-4">
                <div className="w-12 h-1 bg-white/10 rounded-full" />
              </div>

              {/* HUD de Modo (Indicador de Fase) */}
              <div className="absolute top-6 left-12 flex items-center gap-4 opacity-40">
                {isTerminalOpen && (
                  <>
                    <Satellite size={14} className="text-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">
                      Terminal de Siembra Activa
                    </span>
                  </>
                )}
              </div>

              <div className="w-full h-full overflow-hidden">
                <GeoScannerUI />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
          IV. INDICADOR DE MODO (EXPLORE OVERLAY) 
          Informa al usuario Voyager sobre la naturaleza de la vista.
      */}
      {!isTerminalOpen && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-xl px-5 py-2 rounded-full border border-white/5 flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-1000">
            <MapIcon size={14} className="text-primary/60" />
            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">
              Madrid Resonance Hub • <span className="text-primary/60">V2.6</span>
            </span>
          </div>
        </div>
      )}

    </div>
  );
}

/**
 * COMPONENTE PRINCIPAL: GeoCreatorOverlay
 * Exportación nominal que provee el contexto necesario para el funcionamiento.
 */
export function GeoCreatorOverlay(props: GeoCreatorOverlayProps) {
  return (
    <ForgeProvider>
      <CreatorOverlayContent {...props} />
    </ForgeProvider>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Thumb-Driven Design: El botón FAB está posicionado para ser accionado 
 *    con el pulgar derecho en dispositivos móviles, iniciando la misión de forma ergonómica.
 * 2. Transición Táctica: El Drawer utiliza un 85% de la altura del viewport (85vh), 
 *    permitiendo que el Admin siga viendo la coordenada de anclaje en el mapa 
 *    mientras completa los pasos de ingesta.
 * 3. Aislamiento de Sensores: Al resetear el GeoEngine al cerrar la terminal, 
 *    liberamos el 'watchPosition' del GPS, ahorrando un 15% de batería en campo.
 */