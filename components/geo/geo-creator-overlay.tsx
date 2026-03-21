// components/geo/geo-creator-overlay.tsx
// VERSIÓN: 4.0 (NicePod V2.6 - Sovereign Ingestion Orchestrator - Focus Mode Edition)
// Misión: Unificar el Motor Spatial con la Terminal de Captura, el HUD persistente y la Mira Telescópica.
// [ESTABILIZACIÓN]: Extracción del RadarHUD, bloqueo de interacciones cruzadas y cámara dinámica.

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
 * Este componente orquesta la interacción entre el mapa WebGL y la UI de captura.
 * Vive dentro de los Providers para garantizar la sincronía de datos.
 */
function CreatorOverlayContent({ canForge }: { canForge: boolean }) {
  // Consumimos el despacho de la forja (RAM) y las facultades del motor (Hardware)
  const { state: forgeState, dispatch } = useForge();
  const { 
    setManualAnchor, 
    reset: resetSensors,
    status: engineStatus,
    data: engineData,
    userLocation
  } = useGeoEngine();

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

  /**
   * RESOLUCIÓN DE IDENTIDAD NOMINATIVA (Para el HUD)
   */
  const displayName = forgeState.intentText || 
                      engineData?.manualPlaceName || 
                      engineData?.dossier?.visual_analysis_dossier?.detectedOfficialName || 
                      "Interceptando Señal...";

  return (
    // [FIX VIEWPORT]: El contenedor principal bloquea interacciones si la terminal está cerrada,
    // permitiendo que los clics pasen al mapa de fondo (SpatialEngine).
    <div className={cn(
      "absolute inset-0 w-full h-full overflow-hidden flex flex-col",
      isTerminalOpen ? "pointer-events-auto" : "pointer-events-none"
    )}>

      {/* 
          I. EL MOTOR CARTOGRÁFICO SOBERANO (SPATIAL ENGINE) 
          [FOCUS MODE]: Si la terminal se abre, el mapa cambia a modo 'FORGE' 
          (Satélite 2D, pitch 0, edificios transparentes) para máxima precisión de anclaje.
      */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
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
        <div className="absolute top-8 right-6 md:right-8 z-[120] pointer-events-auto">
          <Button
            onClick={toggleTerminal}
            className={cn(
              "h-14 w-14 md:h-16 md:w-16 rounded-full shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-500 group overflow-hidden border",
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

            {/* Pulso de advertencia si la terminal está en espera */}
            {!isTerminalOpen && (
              <div className="absolute inset-0 bg-primary/10 animate-pulse rounded-full -z-10" />
            )}
          </Button>
        </div>
      )}

      {/* 
          III. EL HUD DE TELEMETRÍA (EXTRAÍDO Y PERSISTENTE)
          [MEJORA]: Flota sobre el mapa y el Drawer, siempre visible para el Admin.
          Solo se muestra si la terminal está abierta.
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
              weather={engineData?.dossier?.weather_snapshot}
              place={displayName}
              accuracy={userLocation?.accuracy || 0}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
          IV. LA TERMINAL DE INGESTA (DRAWER OVERLAY) 
          Diseño en 3ra persona con profundidad física y desenfoque Aurora.
      */}
      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            // Dejamos un margen superior del 25% (h-[75vh]) para que el mapa sirva de Mira Telescópica
            className="absolute inset-x-0 bottom-0 z-[100] flex flex-col justify-end pointer-events-auto h-[75vh]"
          >
            {/* Velo atmosférico para suavizar el corte del mapa */}
            <div className="absolute -top-[15vh] inset-x-0 h-[15vh] bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

            {/* CONTENEDOR MAESTRO DE LA TERMINAL */}
            <div className="w-full h-full bg-[#020202]/95 backdrop-blur-3xl rounded-t-[3rem] md:rounded-t-[4rem] border-t border-white/10 shadow-[0_-30px_60px_rgba(0,0,0,0.9)] flex flex-col relative overflow-hidden">

              {/* Indicador de Arrastre Táctico (Handle) */}
              <div className="w-full flex justify-center py-5 shrink-0 z-20">
                <div className="w-12 md:w-16 h-1.5 bg-white/10 rounded-full" />
              </div>

              {/* Marca de Agua Técnica */}
              <div className="absolute top-6 left-6 md:left-12 flex items-center gap-3 opacity-30 pointer-events-none z-10">
                <Satellite size={12} className="text-primary animate-pulse" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] text-white">
                  Oracle Station
                </span>
              </div>

              {/* [BÓVEDA DE INGESTA]: 
                  El 'GeoScannerUI' ahora ocupa el 100% del área disponible sin 
                  ser interrumpido por el HUD.
              */}
              <div className="w-full flex-1 relative flex flex-col min-h-0 mt-4 md:mt-8">
                <GeoScannerUI />
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
          V. INDICADOR DE RESONANCIA (MODO EXPLORE) 
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
    // para que todos los hijos hereden la misma instancia de sensores y memoria.
    <GeoEngineProvider>
      <ForgeProvider>
        <CreatorOverlayContent {...props} />
      </ForgeProvider>
    </GeoEngineProvider>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Mira Telescópica Operativa: Al reducir la altura del Drawer a 'h-[75vh]', el 
 *    25% superior de la pantalla se convierte en un visor de precisión táctico 
 *    (el SpatialEngine cambia a pitch 0 y Satélite) para facilitar el anclaje manual.
 * 2. Extracción del HUD: El 'RadarHUD' ha sido sacado del 'GeoScannerUI'. Ahora flota
 *    sobre el mapa y el Drawer, garantizando que el Admin nunca pierda de vista la
 *    precisión GPS al hacer scroll en los formularios.
 * 3. Corrección Táctil: El uso de 'pointer-events-none' en el contenedor padre 
 *    asegura que el Voyager pueda interactuar con el mapa 3D cuando el Drawer 
 *    está cerrado, sin "comerse" los eventos de arrastre o clic.
 */