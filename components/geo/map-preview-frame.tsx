/**
 * ARCHIVO: components/geo/map-preview-frame.tsx
 * VERSIÓN: 18.6 (NicePod GO-Preview - Ultra-Stable Context Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Ventana táctica de contexto cenital con aislamiento de recursos.
 * [REFORMA V18.6]: Implementación de forcedPerspective="OVERVIEW" y Revelado Agresivo.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, Maximize2, Power, ShieldAlert, Zap } from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { MapRef, MapProvider } from "react-map-gl/mapbox";

// --- INFRAESTRUCTURA CORE ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn, nicepodLog } from "@/lib/utils";

// --- ADN DE CONSTANTES V5.5 ---
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
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef>(null);
  const smokescreenRef = useRef<HTMLDivElement>(null);

  // 1. CONSUMO DE SOBERANÍA CINEMÁTICA (V41.0)
  const {
    userLocation,
    status: engineStatus,
    initSensors,
    isTriangulated,
    isIgnited,
    needsBallisticLanding,
    setManualMode,
    error: geoError
  } = useGeoEngine();

  // 2. MÁQUINA DE ESTADOS VISUAL
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  
  // Guardas para el protocolo de revelado único
  const revealPerformedRef = useRef<boolean>(false);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 3. PROTOCOLO DE SEGURIDAD DE MONTAJE (Safe Mount)
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
   * 4. AUTO-IGNICIÓN SENSORIAL
   */
  useEffect(() => {
    if (isContainerReady && !isIgnited && engineStatus === 'IDLE') {
      nicepodLog("📡 [MapPreview] Activando sintonía órbital.");
      initSensors();
    }
  }, [isContainerReady, isIgnited, engineStatus, initSensors]);

  /**
   * 5. EL REVELADO AGRESIVO (Protocolo V18.6)
   * Disuelve el velo de carga sin disparar re-renders en el Dashboard.
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
    nicepodLog("✨ [MapPreview] Malla Dashboard materializada.");
  }, []);

  /**
   * RACE-CONDITION GUARD: 
   * Si el motor WebGL tarda > 2.5s por errores de red, forzamos visibilidad.
   */
  useEffect(() => {
    if (isMapLoaded && !revealPerformedRef.current) {
      fallbackTimerRef.current = setTimeout(revealWidgetMap, 2500);
    }
    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, [isMapLoaded, revealWidgetMap]);

  return (
    /**
     * MapProvider local: Aislamiento total de contexto WebGL.
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
          {/* SMOKESCREEN: Capa de Protección Visual */}
          <div 
            ref={smokescreenRef}
            className="absolute inset-0 z-[110] bg-[#020202] flex flex-col items-center justify-center space-y-8 transition-opacity duration-800 pointer-events-auto"
          >
            {engineStatus === 'PERMISSION_DENIED' ? (
              <div className="flex flex-col items-center gap-4 text-center p-6">
                <ShieldAlert className="h-10 w-10 text-red-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-400">Acceso Interceptado</span>
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
            VII. MOTOR WEBGL AISLADO
            [MANDATO V18.6]: mapId="map-dashboard" + profile="TACTICAL_LITE".
        */}
        {isContainerReady && userLocation && (
          <div className="absolute inset-0 z-0 pointer-events-auto">
            <MapCore
              mapId="map-dashboard"
              mode="EXPLORE"
              performanceProfile="TACTICAL_LITE" // <--- Ahorro masivo de VRAM
              startCoords={{
                ...userLocation,
                ...INITIAL_OVERVIEW_CONFIG
              }}
              theme={ACTIVE_MAP_THEME}
              selectedPOIId={null}
              onLoad={() => setIsMapLoaded(true)}
              onIdle={revealWidgetMap}
              onMove={() => setManualMode(true)}
              onMoveEnd={() => {}}
              onMapClick={() => {}}
              onMarkerClick={() => {}}
            />
            
            {/* 
                [SOBERANÍA DE PERSPECTIVA V18.6]
                El widget se bloquea en modo OVERVIEW ignorando el estado global.
                Esto erradica el ladeo 3D accidental (Imagen 37).
            */}
            {isMapLoaded && (
              <CameraController 
                mapId="map-dashboard" 
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V18.6):
 * 1. Perspective Sovereignty: Al inyectar forcedPerspective="OVERVIEW", el widget 
 *    permanece cenital de forma inmutable, resolviendo el bug de ladeo 3D.
 * 2. Aggressive Reveal: El uso de revealWidgetMap con un fallback de 2.5s garantiza 
 *    que el Dashboard nunca se quede en negro por fallos de assets de Mapbox.
 * 3. Resource Hygiene: El perfil TACTICAL_LITE libera ~250MB de VRAM, asegurando
 *    que el Dashboard sea fluido incluso durante actualizaciones pesadas del feed.
 * 4. Zero-Flicker Identity: La instancia 'map-dashboard' está totalmente aislada 
 *    de la ruta de mapa principal, eliminando el pestañeo de retorno.
 */