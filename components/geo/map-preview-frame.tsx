/**
 * ARCHIVO: components/geo/map-preview-frame.tsx
 * VERSIÓN: 20.0 (NicePod GO-Preview - Triple-Core Synergy & Contract Fix)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Ventana táctica de contexto cenital con aislamiento absoluto de recursos.
 * [FIX V20.0]: Alineación de contratos nominales (mapInstanceId, startCoordinates) 
 * para satisfacer al Build Shield y permitir el despliegue en Vercel.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, Maximize2, ShieldAlert, Zap } from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { MapProvider } from "react-map-gl/mapbox";

// --- INFRAESTRUCTURA CORE V3.0 ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn, nicepodLog } from "@/lib/utils";

// --- ADN DE CONSTANTES V7.0 ---
import {
  ACTIVE_MAP_THEME,
  INITIAL_OVERVIEW_CONFIG
} from "./map-constants";

// --- MOTORES DE RENDERIZADO Y CINEMÁTICA ---
import MapCore from "./SpatialEngine/map-core";
import { CameraController } from "./SpatialEngine/camera-controller";

/**
 * MapPreviewFrame: El widget de visualización cenital del Dashboard.
 */
export const MapPreviewFrame = memo(function MapPreviewFrame() {
  const containerReference = useRef<HTMLDivElement>(null);
  const smokescreenReference = useRef<HTMLDivElement>(null);

  // 1. CONSUMO DE LA FACHADA SOBERANA (Triple-Core Facade)
  const {
    userLocation,
    status: engineStatus,
    isTriangulated,
    setManualMode,
    error: geographicError
  } = useGeoEngine();

  // 2. MÁQUINA DE ESTADOS VISUAL LOCAL
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  
  const revealPerformedReference = useRef<boolean>(false);
  const fallbackTimerReference = useRef<NodeJS.Timeout | null>(null);

  /**
   * 3. PROTOCOLO DE SEGURIDAD DE MONTAJE (Safe Mount)
   * Garantiza que el contenedor tenga dimensiones reales antes de inyectar WebGL.
   */
  useEffect(() => {
    if (!containerReference.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setIsContainerReady(true);
          resizeObserver.disconnect();
        }
      }
    });

    resizeObserver.observe(containerReference.current);
    return () => {
      resizeObserver.disconnect();
      if (fallbackTimerReference.current) {
        clearTimeout(fallbackTimerReference.current);
      }
    };
  }, []);

  /**
   * 4. EL REVELADO SOBERANO (Protocolo V20.0)
   * Disuelve el velo de carga de forma fluida.
   */
  const revealWidgetMap = useCallback(() => {
    if (revealPerformedReference.current) return;
    revealPerformedReference.current = true;
    
    if (fallbackTimerReference.current) {
      clearTimeout(fallbackTimerReference.current);
    }

    if (smokescreenReference.current) {
      smokescreenReference.current.style.opacity = "0";
      smokescreenReference.current.style.pointerEvents = "none";
      setTimeout(() => {
        if (smokescreenReference.current) {
          smokescreenReference.current.style.display = "none";
        }
      }, 1000);
    }
    nicepodLog("✨ [MapPreview] Malla Dashboard sincronizada.");
  }, []);

  /**
   * RACE-CONDITION GUARD: 
   * Fallback de visibilidad si Mapbox no emite 'onIdle' en 3 segundos.
   */
  useEffect(() => {
    if (isMapLoaded && !revealPerformedReference.current) {
      fallbackTimerReference.current = setTimeout(revealWidgetMap, 3000);
    }
    return () => {
      if (fallbackTimerReference.current) {
        clearTimeout(fallbackTimerReference.current);
      }
    };
  }, [isMapLoaded, revealWidgetMap]);

  return (
    /**
     * MapProvider local: Aislamiento total de contexto WebGL.
     */
    <MapProvider>
      <motion.div
        ref={containerReference}
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
          {/* SMOKESCREEN: Capa de Protección Visual SSR & Loading */}
          <div 
            ref={smokescreenReference}
            className="absolute inset-0 z-[110] bg-[#020202] flex flex-col items-center justify-center space-y-8 transition-opacity duration-1000 pointer-events-auto"
          >
            {engineStatus === 'PERMISSION_DENIED' ? (
              <div className="flex flex-col items-center gap-4 text-center p-6">
                <ShieldAlert className="h-10 w-10 text-red-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-400">Acceso Geográfico Bloqueado</span>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Zap className="h-8 w-8 text-primary/40 animate-pulse" />
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Sincronización Órbital</span>
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse italic">
                    {!isTriangulated ? "Mapeando Contexto..." : "Fijando Coordenadas..."}
                  </p>
                </div>
              </>
            )}
          </div>
        </AnimatePresence>

        {/* 
            VII. MOTOR WEBGL AISLADO (TACTICAL_LITE)
            [FIX V20.0]: Uso de nombres de propiedad completos (mapInstanceId, startCoordinates).
        */}
        {isContainerReady && userLocation && (
          <div className="absolute inset-0 z-0 pointer-events-auto">
            <MapCore
              mapInstanceId="map-dashboard"
              mode="EXPLORE"
              performanceProfile="TACTICAL_LITE"
              startCoordinates={{
                ...userLocation,
                ...INITIAL_OVERVIEW_CONFIG
              }}
              lightTheme={ACTIVE_MAP_THEME}
              selectedPointOfInterestId={null}
              onLoad={() => setIsMapLoaded(true)}
              onIdle={revealWidgetMap}
              onMove={() => setManualMode(true)}
              onMapClick={() => {}}
              onMarkerClick={() => {}}
            />
            
            {/* 
                [SOBERANÍA DE PERSPECTIVA DASHBOARD]
                [FIX V20.0]: Uso de mapInstanceId para sincronía con el motor.
            */}
            {isMapLoaded && (
              <CameraController 
                mapInstanceId="map-dashboard" 
                forcedPerspective="OVERVIEW" 
              />
            )}
          </div>
        )}

        {/* GRADIENT OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-transparent z-10 pointer-events-none opacity-60" />

        {/* UI DE COMANDO PERIFÉRICA */}
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
    </MapProvider>
  );
});