// components/geo/geo-creator-overlay.tsx
// VERSIÓN: 4.3 (NicePod V2.6 - Sovereign Ingestion Orchestrator - Global Sync Edition)
// Misión: Unificar el Motor Spatial con la Terminal de Captura y el HUD persistente.
// [ESTABILIZACIÓN]: Sincronía con el motor global y optimización de inercia táctil.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, Satellite, X } from "lucide-react";
import React, { useCallback, useState, useEffect } from "react";

// --- INFRAESTRUCTURA DE COMPONENTES UI ---
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- PROVEEDORES DE ESTADO (CEREBROS) ---
// Consumimos el motor global inyectado en app/layout.tsx
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
  /** canForge: Autoridad heredada para mutar la malla urbana (Admin/Pro). */
  canForge: boolean;
  /** userId: Identificador único del curador soberano. */
  userId: string;
}

/**
 * COMPONENTE INTERNO: CreatorOverlayContent
 * Orquesta la interacción entre el mapa WebGL y la UI de captura sensorial.
 */
function CreatorOverlayContent({ canForge }: { canForge: boolean }) {
  // 1. CONSUMO DE FACULTADES (Motor Global + Memoria RAM de Forja)
  const { state: forgeState, dispatch } = useForge();
  const { 
    setManualAnchor, 
    status: engineStatus,
    data: engineData,
    userLocation,
    initSensors // Requerido para ignición en acceso directo a /map
  } = useGeoEngine();

  // Control de visibilidad de la terminal táctil (Drawer)
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);

  /**
   * [PROTOCOLO DE SEGURIDAD SENSORIAL]:
   * Si el Voyager accede directamente a '/map' (saltándose el Dashboard),
   * aseguramos que los sensores se activen. El hook useGeoEngine V14.0
   * ya cuenta con el 'Cerrojo de Hardware' para evitar duplicidad.
   */
  useEffect(() => {
    if (engineStatus === 'IDLE') {
      initSensors();
    }
  }, [engineStatus, initSensors]);

  /**
   * toggleTerminal:
   * Activa/Desactiva el flujo de siembra y limpia la memoria volátil.
   */
  const toggleTerminal = useCallback(() => {
    if (isTerminalOpen) {
      // Al cerrar, purgamos la intención del curador pero mantenemos el GPS vivo.
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

    // Bloqueamos el motor en la coordenada física seleccionada
    setManualAnchor(lngLat[0], lngLat[1]);

    // Sincronizamos el ADN de la Forja para el Step 1 y Step 2
    dispatch({
      type: 'SET_LOCATION',
      payload: {
        lat: lngLat[1],
        lng: lngLat[0],
        acc: 1 // Autoridad de Perito: Precisión manual certificada.
      }
    });
  }, [isTerminalOpen, setManualAnchor, dispatch]);

  /**
   * RESOLUCIÓN DE IDENTIDAD NOMINATIVA (HUD Awareness)
   */
  const displayName = forgeState.intentText || 
                      engineData?.manualPlaceName || 
                      engineData?.dossier?.visual_analysis_dossier?.detectedOfficialName || 
                      "Sincronizando Malla Urbana...";

  return (
    // [FIX VIEWPORT]: El contenedor padre solo captura eventos si el drawer está abierto.
    // Esto permite que el usuario 'arrastre' el mapa 3D cuando el overlay está cerrado.
    <div className={cn(
      "absolute inset-0 w-full h-full overflow-hidden flex flex-col transition-all duration-700",
      isTerminalOpen ? "pointer-events-auto" : "pointer-events-none"
    )}>

      {/* 
          I. EL MOTOR CARTOGRÁFICO SOBERANO (SPATIAL ENGINE) 
          Siempre activo en la Capa 0. 
      */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <SpatialEngine
          mode={isTerminalOpen ? 'FORGE' : 'EXPLORE'}
          onManualAnchor={handleManualAnchor}
        />
      </div>

      {/* 
          II. EL GATILLO SOBERANO (FAB) 
          Botón flotante Aurora que inicia la transmutación de la realidad.
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
            aria-label={isTerminalOpen ? "Abortar misión" : "Iniciar siembra"}
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

      {/* 
          III. EL HUD DE TELEMETRÍA (PERSISTENTE)
          Flota sobre el mapa para mantener conciencia situacional del GPS.
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
              weather={engineData?.dossier?.weather_snapshot}
              place={displayName}
              accuracy={userLocation?.accuracy || 0}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
          IV. LA TERMINAL DE INGESTA (DRAWER SOBERANO) 
          [DISEÑO]: Altura fija h-[75vh] para preservar la Mira Telescópica.
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
            {/* Velo atmosférico superior */}
            <div className="absolute -top-[15vh] inset-x-0 h-[15vh] bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

            <div className="w-full h-full bg-[#020202]/95 backdrop-blur-3xl rounded-t-[3rem] md:rounded-t-[4rem] border-t border-white/10 shadow-[0_-30px_60px_rgba(0,0,0,0.9)] flex flex-col relative overflow-hidden">
              
              {/* Indicador de Arrastre estético */}
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

              {/* [ÁREA DE CONTENIDO]: Orquestador de Pasos */}
              <div className="w-full flex-1 relative flex flex-col min-h-0 mt-4 md:mt-8">
                <GeoScannerUI />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
          V. INDICADOR DE RESONANCIA (MODO VOYAGER) 
          Visible solo cuando la terminal está cerrada para no saturar la UI.
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
 * Orquestador principal de la experiencia de creación.
 */
export function GeoCreatorOverlay(props: GeoCreatorOverlayProps) {
  return (
    // [IMPORTANTE]: GeoEngineProvider se hereda del Layout Global.
    // Solo inyectamos ForgeProvider para el ciclo de vida del formulario.
    <ForgeProvider>
      <CreatorOverlayContent {...props} />
    </ForgeProvider>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.3):
 * 1. Resiliencia de Sensor: Se eliminó el 'resetSensors' del cleanup para evitar 
 *    que el GPS se apague al navegar por el mapa, manteniendo la auto-localización.
 * 2. Inmunidad de Loop: Al confiar en el estado 'IDLE' para initSensors (Línea 66),
 *    aniquilamos el bucle de peticiones que colapsaba el móvil.
 * 3. Diseño Táctico: El HUD y el Drawer operan en z-index coordinados (110 y 100), 
 *    asegurando que la telemetría flote siempre por encima de la narrativa.
 */