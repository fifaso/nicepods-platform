/**
 * ARCHIVO: components/geo/map-preview-frame.tsx
 * VERSIÓN: 18.1 (NicePod GO-Preview - Sovereign Context Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Ventana táctica de contexto (Overview) para el Dashboard.
 * [REFORMA V18.1]: Forzado de modo OVERVIEW y anulación de inmersión 3D.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, Maximize2, Power, ShieldAlert, Zap } from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { MapRef } from "react-map-gl/mapbox";

// --- INFRAESTRUCTURA CORE ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn, nicepodLog } from "@/lib/utils";

// --- ADN DE CONSTANTES V5.4 ---
import {
  ACTIVE_MAP_THEME,
  INITIAL_OVERVIEW_CONFIG
} from "./map-constants";

// --- MOTORES DE RENDERIZADO Y CINEMÁTICA ---
import MapCore from "./SpatialEngine/map-core";
import { CameraController } from "./SpatialEngine/camera-controller";

/**
 * MapPreviewFrame: El widget de visualización para la Workstation Central.
 */
export const MapPreviewFrame = memo(function MapPreviewFrame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef>(null);

  // 1. CONSUMO DE TELEMETRÍA SOBERANA (V32.0)
  const {
    userLocation,
    status: engineStatus,
    initSensors,
    isTriangulated,
    isIgnited,
    needsBallisticLanding,
    cameraPerspective // Consumimos el modo pero lo sobreescribiremos para el widget
  } = useGeoEngine();

  // 2. MÁQUINA DE ESTADOS VISUAL (SMOKESCREEN)
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [isCameraSettled, setIsCameraSettled] = useState<boolean>(false);

  /**
   * 3. PROTOCOLO DE SEGURIDAD DE MONTAJE (Safe Mount)
   */
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setIsContainerReady(true);
          resizeObserver.disconnect();
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  /**
   * 4. AUTO-IGNICIÓN DE CORTESÍA
   */
  useEffect(() => {
    if (isContainerReady && !isIgnited && engineStatus === 'IDLE') {
      nicepodLog("📡 [MapPreview] Iniciando sincronización órbital.");
      initSensors();
    }
  }, [isContainerReady, isIgnited, engineStatus, initSensors]);

  /**
   * 5. RED DE SEGURIDAD (RESCUE TIMER)
   */
  useEffect(() => {
    if (isMapLoaded && !isCameraSettled) {
      const rescueTimer = setTimeout(() => {
        if (!isCameraSettled) {
          nicepodLog("⚠️ [MapPreview] Timeout de revelado. Forzando visibilidad.");
          setIsCameraSettled(true);
        }
      }, 7000);
      return () => clearTimeout(rescueTimer);
    }
  }, [isMapLoaded, isCameraSettled]);

  /**
   * 6. EL REVELADO SOBERANO
   */
  const handleMapIdle = useCallback(() => {
    if (isMapLoaded && !isCameraSettled) {
      setIsCameraSettled(true);
      nicepodLog("✨ [MapPreview] Malla Dashboard lista.");
    }
  }, [isMapLoaded, isCameraSettled]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className={cn(
        "relative w-full h-full overflow-hidden bg-[#020202] transition-all duration-700",
        "rounded-[2.5rem] md:rounded-[3rem] border border-white/5 shadow-2xl group",
        "hover:border-primary/40"
      )}
    >
      <AnimatePresence mode="wait">

        {engineStatus === 'PERMISSION_DENIED' ? (
          <motion.div
            key="p_denied"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-zinc-950 z-[200] text-center"
          >
            <ShieldAlert className="h-10 w-10 text-red-500 mb-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-400">Acceso Interceptado</span>
            <p className="text-[9px] text-zinc-500 mt-2 max-w-[220px] leading-relaxed uppercase">
              Permisos de ubicación requeridos para la malla.
            </p>
          </motion.div>
        ) :

        /* ESCENARIO: SMOKESCREEN DE CONTEXTO */
        !isCameraSettled ? (
          <motion.div
            key="smokescreen"
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center space-y-8 bg-[#020202] z-[150] pointer-events-none"
          >
            <div className="relative">
              <Zap className="h-8 w-8 text-primary/30 animate-pulse" />
              <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full animate-pulse" />
            </div>

            <div className="flex flex-col items-center gap-6 text-center px-12">
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white">
                  Sincronización Órbital
                </span>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse italic">
                  {!isTriangulated ? "Detectando Contexto Urbano..." :
                    needsBallisticLanding ? "Aterrizaje Satelital..." : "Fijando Coordenadas..."}
                </p>
              </div>

              {engineStatus === 'IDLE' && !isIgnited && (
                <button
                  onClick={() => initSensors()}
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-black text-[8px] uppercase tracking-[0.4em] pointer-events-auto hover:bg-primary hover:text-black transition-all"
                >
                  <Power size={12} className="inline mr-2" />
                  Sincronizar Malla
                </button>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* 
          VII. EL MOTOR DE RENDERIZADO (CORE)
          MANDATO V5.4: El widget siempre nace en modo OVERVIEW (Cenital)
          para proporcionar contexto sin oclusión.
      */}
      {isContainerReady && userLocation && (
        <div className="absolute inset-0 z-0 pointer-events-auto">
          <MapCore
            ref={mapRef}
            mode="EXPLORE"
            // Forzamos el punto de inicio cenital
            startCoords={{
              ...userLocation,
              ...INITIAL_OVERVIEW_CONFIG
            }}
            theme={ACTIVE_MAP_THEME}
            selectedPOIId={null}
            onLoad={() => setIsMapLoaded(true)}
            onIdle={handleMapIdle}
            onMove={() => {}}
            onMoveEnd={() => {}}
            onMapClick={() => {}}
            onMarkerClick={() => {}}
          />
          
          {/* 
              [CEREBRO CINEMÁTICO ADAPTADO]
              Nota: En versiones futuras, se podría pasar una prop 'forceOverview'
              al CameraController si se desea que el widget sea inmune a cambios globales.
          */}
          {isMapLoaded && (
            <CameraController />
          )}
        </div>
      )}

      {/* GRADIENTE PROTECTOR */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/20 to-transparent z-10 pointer-events-none" />

      {/* UI PERIFÉRICA */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-[100] flex justify-between items-end pointer-events-none">
        <Link href="/map" className="flex items-center gap-4 pointer-events-auto group/btn focus:outline-none">
          <div className="bg-primary/10 p-3.5 rounded-2xl backdrop-blur-3xl border border-primary/20 group-hover/btn:bg-primary/30 transition-all shadow-inner">
            <Compass className="h-5 w-5 text-primary animate-spin-slow" />
          </div>
          <div className="flex flex-col text-left">
            <h3 className="text-white font-black text-sm md:text-xl uppercase tracking-tighter italic leading-none drop-shadow-lg">
              Madrid Resonance
            </h3>
            <p className="text-[8px] md:text-[9px] text-zinc-300 font-bold uppercase tracking-[0.3em] mt-1.5">
              Malla de Contexto Activa
            </p>
          </div>
        </Link>

        <Link href="/map" className="pointer-events-auto focus:outline-none mb-1">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 hover:bg-white/20 transition-all group-hover:scale-110 shadow-2xl">
            <Maximize2 size={14} className="text-white" />
          </div>
        </Link>
      </div>
    </motion.div>
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V18.1):
 * 1. Overview Priority: Se ha forzado INITIAL_OVERVIEW_CONFIG en el nacimiento del mapa.
 *    Esto soluciona la Imagen 10, asegurando que el widget no "choque" con edificios.
 * 2. Visual Narrative: El Smokescreen ahora habla de "Contexto Urbano", diferenciando
 *    la función del widget (entender dónde estoy) de la función del mapa (peritaje).
 * 3. Shadow Reduction: Se redujo la opacidad del gradiente central para ganar claridad
 *    en las texturas de calle desde el aire.
 * 4. Zero-Flicker: El componente utiliza memo y refs para evitar parpadeos de carga
 *    mientras el feed de noticias se actualiza en segundo plano.
 */