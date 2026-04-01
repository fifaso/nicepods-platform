/**
 * ARCHIVO: components/geo/map-preview-frame.tsx
 * VERSIÓN: 19.0 (NicePod GO-Preview - Triple-Core Synergy Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Ventana táctica de contexto cenital con aislamiento absoluto de recursos.
 * [REFORMA V19.0]: Integración con la arquitectura Triple-Core y eliminación de 
 * competencia sensorial en el arranque.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
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

// --- ADN DE CONSTANTES V6.0 ---
import {
  ACTIVE_MAP_THEME,
  INITIAL_OVERVIEW_CONFIG
} from "./map-constants";

// --- MOTORES DE RENDERIZADO Y CINEMÁTICA ---
import { CameraController } from "./SpatialEngine/camera-controller";
import MapCore from "./SpatialEngine/map-core";

/**
 * MapPreviewFrame: El widget de visualización cenital del Dashboard.
 */
export const MapPreviewFrame = memo(function MapPreviewFrame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const smokescreenRef = useRef<HTMLDivElement>(null);

  // 1. CONSUMO DE LA FACHADA SOBERANA (Triple-Core Facade)
  const {
    userLocation,
    status: engineStatus,
    isTriangulated,
    setManualMode,
    error: geoError
  } = useGeoEngine();

  // 2. MÁQUINA DE ESTADOS VISUAL LOCAL
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  const revealPerformedRef = useRef<boolean>(false);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 3. PROTOCOLO DE SEGURIDAD DE MONTAJE (Safe Mount)
   * Garantiza que el contenedor tenga dimensiones reales antes de inyectar WebGL.
   */
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setIsContainerReady(true);
          resizeObserver.disconnect();
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => {
      resizeObserver.disconnect();
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, []);

  /**
   * 4. EL REVELADO AGRESIVO (Protocolo V19.0)
   * Disuelve el velo de carga de forma fluida.
   */
  const revealWidgetMap = useCallback(() => {
    if (revealPerformedRef.current) return;
    revealPerformedRef.current = true;

    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);

    if (smokescreenRef.current) {
      smokescreenRef.current.style.opacity = "0";
      smokescreenRef.current.style.pointerEvents = "none";
      setTimeout(() => {
        if (smokescreenRef.current) smokescreenRef.current.style.display = "none";
      }, 800);
    }
    nicepodLog("✨ [MapPreview] Malla Dashboard sincronizada y visible.");
  }, []);

  /**
   * RACE-CONDITION GUARD: 
   * Fallback de visibilidad por si Mapbox tarda demasiado en emitir 'onIdle'.
   */
  useEffect(() => {
    if (isMapLoaded && !revealPerformedRef.current) {
      fallbackTimerRef.current = setTimeout(revealWidgetMap, 3000);
    }
    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, [isMapLoaded, revealWidgetMap]);

  return (
    /**
     * MapProvider local: Aislamiento total de contexto WebGL.
     * Previene que el mapa principal y el widget compartan ID de cámara.
     */
    <MapProvider>
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
          {/* SMOKESCREEN: Capa de Protección Visual SSR & Loading */}
          <div
            ref={smokescreenRef}
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
            [MANDATO V19.0]: mapId="map-dashboard" garantiza que el CameraController
            solo envíe comandos a este canvas específico.
        */}
        {isContainerReady && userLocation && (
          <div className="absolute inset-0 z-0 pointer-events-auto">
            <MapCore
              mapId="map-dashboard"
              mode="EXPLORE"
              performanceProfile="TACTICAL_LITE" // <--- Ahorro de VRAM crítico en Dashboard
              startCoords={{
                ...userLocation,
                ...INITIAL_OVERVIEW_CONFIG
              }}
              theme={ACTIVE_MAP_THEME}
              selectedPOIId={null}
              onLoad={() => setIsMapLoaded(true)}
              onIdle={revealWidgetMap}
              onMove={() => setManualMode(true)}
              onMapClick={() => { }}
              onMarkerClick={() => { }}
            />

            {/* 
                [SOBERANÍA DE PERSPECTIVA DASHBOARD]
                Forzamos OVERVIEW. El widget jamás se ladeará a 3D, manteniendo 
                la estética de maqueta profesional del Dashboard.
            */}
            {isMapLoaded && (
              <CameraController
                mapId="map-dashboard"
                forcedPerspective="OVERVIEW"
              />
            )}
          </div>
        )}

        {/* GRADIENT OVERLAY: Mejora de legibilidad sobre el mapa */}
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V19.0):
 * 1. Zero-Competition: Se eliminó la ignición de sensores desde el widget. Ahora 
 *    el frame espera pasivamente a que el sistema central entregue 'userLocation', 
 *    liberando al Main Thread de negociaciones de permisos duplicadas.
 * 2. Absolute Isolation: MapProvider local + mapId="map-dashboard" aseguran que 
 *    el recolector de basura (GC) del navegador limpie la VRAM al salir del Dashboard.
 * 3. Perspective Lock: forcedPerspective="OVERVIEW" soluciona de raíz el ladeo 
 *    accidental (Imagen 37), blindando la visualización cenital.
 */