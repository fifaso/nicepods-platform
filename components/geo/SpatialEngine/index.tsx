/**
 * ARCHIVO: components/geo/SpatialEngine/index.tsx
 * VERSIÓN: 7.8 (NicePod Spatial Hub - Aggressive Reveal & Race-Condition Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Orquestar el motor WebGL garantizando la visibilidad bajo fallos de red.
 * [REFORMA V7.8]: Implementación de Fallback Timer para el Smokescreen y herencia T0.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, ShieldAlert } from "lucide-react";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { MapRef, MapProvider } from "react-map-gl/mapbox";

// --- INFRAESTRUCTURA CORE ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { SearchResult } from "@/hooks/use-search-radar";
import { cn, nicepodLog } from "@/lib/utils";

// --- CONSTANTES DE FÍSICA Y CONTRATOS V5.4 ---
import {
  FLY_CONFIG,
  MADRID_SOL_COORDS,
  MapboxLightPreset,
  ZOOM_LEVELS,
  INITIAL_OVERVIEW_CONFIG
} from "../map-constants";

import { POIPreviewCard } from "../poi-preview-card";
import { CameraController } from "./camera-controller";
import MapCore from "./map-core";

/**
 * [BUILD SHIELD]: TYPE EXTRACTION
 */
type MapNativeProps = ComponentProps<typeof Map>;
type SafeMapMoveEvent = Parameters<NonNullable<MapNativeProps['onMove']>>[0];
type SafeMapClickEvent = Parameters<NonNullable<MapNativeProps['onClick']>>[0];

interface SpatialEngineProps {
  mode: 'EXPLORE' | 'FORGE';
  theme?: MapboxLightPreset;
  onManualAnchor?: (lngLat: [number, number]) => void;
  className?: string;
}

/**
 * SpatialEngine: El Reactor de Inteligencia Visual Soberano.
 */
export function SpatialEngine({ mode, theme = 'night', onManualAnchor, className }: SpatialEngineProps) {

  // 1. CONSUMO DE SOBERANÍA CINEMÁTICA (V37.0 - Resilience Edition)
  const {
    userLocation,
    nearbyPOIs,
    activePOI,
    status: engineStatus,
    initSensors,
    isTriangulated,
    isIgnited,
    needsBallisticLanding,
    setManualMode,
    cameraPerspective,
    toggleCameraPerspective
  } = useGeoEngine();

  // 2. REFERENCIAS DE CONTROL DE HARDWARE Y DOM
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const smokescreenRef = useRef<HTMLDivElement>(null);
  
  // Guardas de persistencia para evitar duplicidad de efectos
  const revealPerformedRef = useRef<boolean>(false);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 3. MÁQUINA DE ESTADOS VISUAL
  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  
  const [searchPos, setSearchPos] = useState({
    lat: MADRID_SOL_COORDS.latitude,
    lng: MADRID_SOL_COORDS.longitude,
  });

  /**
   * 4. PROTOCOLO DE SEGURIDAD DE MONTAJE
   */
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setIsContainerReady(true);
          observer.disconnect();
        }
      }
    });
    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, []);

  /**
   * 5. AUTO-IGNICIÓN Y PERSPECTIVA AUTOMÁTICA
   */
  useEffect(() => {
    if (isContainerReady) {
      if (!isIgnited && engineStatus === 'IDLE') {
        initSensors();
      }

      if (mode === 'EXPLORE' && cameraPerspective === 'OVERVIEW') {
        nicepodLog("🎭 [SpatialHub] Activando modo STREET para inmersión.");
        toggleCameraPerspective();
      }
    }
  }, [isContainerReady, isIgnited, engineStatus, initSensors, mode, cameraPerspective, toggleCameraPerspective]);

  /**
   * 6. EL REVELADO AGRESIVO (Soberanía Visual V7.8)
   * Misión: Disolver la cortina negra incluso si Mapbox tiene errores internos.
   */
  const revealMap = useCallback(() => {
    if (revealPerformedRef.current) return;
    
    nicepodLog("✨ [SpatialHub] Ejecutando revelado de malla (Aggressive Protocol).");
    revealPerformedRef.current = true;
    
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);

    if (smokescreenRef.current) {
      smokescreenRef.current.style.opacity = "0";
      smokescreenRef.current.style.pointerEvents = "none";
      setTimeout(() => {
        if (smokescreenRef.current) smokescreenRef.current.style.display = "none";
      }, 850);
    }
  }, []);

  /**
   * FALLBACK TIMER: Race-Condition Guard
   * Si el evento 'onIdle' no llega en 2.2s, forzamos el revelado.
   */
  useEffect(() => {
    if (isMapLoaded && !revealPerformedRef.current) {
      fallbackTimerRef.current = setTimeout(() => {
        nicepodLog("⚠️ [SpatialHub] Mapbox Idle Timeout. Forzando visibilidad.");
        revealMap();
      }, 2200);
    }
    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, [isMapLoaded, revealMap]);

  /**
   * 7. MANEJADORES DE EVENTOS
   */
  const handleMapIdle = useCallback(() => {
    if (isMapLoaded) {
      revealMap();
    }
  }, [isMapLoaded, revealMap]);

  const handleMapMove = useCallback((event: SafeMapMoveEvent) => {
    setSearchPos({
      lat: event.viewState.latitude,
      lng: event.viewState.longitude
    });

    if (event.originalEvent && !needsBallisticLanding) {
      setManualMode(true);
    }
  }, [setManualMode, needsBallisticLanding]);

  const handleMapMoveEnd = useCallback((event: SafeMapMoveEvent) => {
    nicepodLog(`📍 [SpatialHub] Ubicación de cámara estable.`);
  }, []);

  const handleMapClick = useCallback((event: SafeMapClickEvent) => {
    if (mode !== 'FORGE' || !onManualAnchor) return;
    if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate([10, 30, 10]);
    const lngLat: [number, number] = [event.lngLat.lng, event.lngLat.lat];
    onManualAnchor(lngLat);
  }, [mode, onManualAnchor]);

  const handleSearchResult = useCallback((results: SearchResult[] | null) => {
    if (results && results.length > 0) {
      const topHit = results[0];
      if (topHit.metadata?.lat && topHit.metadata?.lng && mapRef.current) {
        setManualMode(true); 
        mapRef.current.flyTo({
          center: [topHit.metadata.lng, topHit.metadata.lat],
          zoom: ZOOM_LEVELS.STREET,
          ...FLY_CONFIG
        });
      }
    }
  }, [setManualMode]);

  const mappedSelectedPOI = useMemo(() => {
    if (!selectedPOIId || !nearbyPOIs?.length) return null;
    const rawPoi = nearbyPOIs.find(p => p.id.toString() === selectedPOIId);
    if (!rawPoi) return null;
    return {
      id: rawPoi.id.toString(),
      name: rawPoi.name,
      category: rawPoi.category_id,
      historical_fact: rawPoi.historical_fact || undefined,
      cover_image_url: rawPoi.gallery_urls?.[0] || undefined
    };
  }, [selectedPOIId, nearbyPOIs]);

  return (
    <MapProvider>
      <div ref={containerRef} className={cn("w-full h-full relative bg-[#010101] overflow-hidden", className)}>

        {/* I. CORTINA DE CARGA SOBERANA (SMOKESCREEN AGGRESSIVE) */}
        <div 
          ref={smokescreenRef}
          className="absolute inset-0 z-[110] bg-[#020202] flex flex-col items-center justify-center space-y-10 transition-opacity duration-800 ease-in-out pointer-events-auto"
        >
          {engineStatus === 'PERMISSION_DENIED' ? (
            <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
              <ShieldAlert className="h-10 w-10 text-red-500 mb-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-400">Acceso Interceptado</span>
            </div>
          ) : (
            <>
              <div className="relative">
                <motion.div 
                  animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.5, 0.2] }} 
                  transition={{ duration: 3, repeat: Infinity }} 
                  className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" 
                />
                <Compass className="h-16 w-16 text-primary relative z-10 animate-spin-slow" />
              </div>

              <div className="flex flex-col items-center gap-4 text-center px-12">
                <span className="text-[11px] font-black uppercase tracking-[0.6em] text-white">Madrid Resonance</span>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse italic">
                  {needsBallisticLanding ? "Ejecutando Vuelo de Inmersión..." : 
                   isIgnited ? "Restaurando Enlace Neural..." : "Sincronizando Malla..."}
                </p>
              </div>
            </>
          )}
        </div>

        {/* II. MOTOR WEBGL (MAP-CORE) */}
        {isContainerReady && userLocation && (
          <div className="w-full h-full pointer-events-auto">
            <MapCore
              mapId="map-full"
              ref={mapRef}
              mode={mode}
              // [HERENCIA]: Si venimos del dashboard con GPS, nacemos en la calle.
              startCoords={userLocation}
              theme={theme}
              selectedPOIId={selectedPOIId}
              onLoad={() => setIsMapLoaded(true)}
              onIdle={handleMapIdle}
              onMove={handleMapMove}
              onMoveEnd={handleMapMoveEnd}
              onMapClick={handleMapClick}
              onMarkerClick={(id: string) => {
                if (mode === 'EXPLORE') {
                  setSelectedPOIId(id);
                  const p = nearbyPOIs.find(item => item.id.toString() === id);
                  if (p && mapRef.current) {
                    setManualMode(true);
                    mapRef.current.flyTo({
                      center: [p.geo_location.coordinates[0], p.geo_location.coordinates[1]],
                      zoom: ZOOM_LEVELS.STREET,
                      ...FLY_CONFIG
                    });
                  }
                }
              }}
            />

            {/* DIRECTOR DE CÁMARA (V4.8 compatible) */}
            {mode === 'EXPLORE' && isMapLoaded && (
              <CameraController mapId="map-full" />
            )}
          </div>
        )}

        {/* III. INTERFAZ SUPERPUESTA */}
        {mode === 'EXPLORE' && (
          <div className="absolute top-6 left-4 right-4 z-[100] md:top-8 md:left-8 md:w-[400px] pointer-events-auto">
            <UnifiedSearchBar
              variant="console"
              onResults={handleSearchResult}
              onLoading={setIsSearchLoading}
              placeholder="Rastrear ecos urbanos..."
              latitude={searchPos.lat}
              longitude={searchPos.lng}
            />
          </div>
        )}

        <AnimatePresence>
          {mappedSelectedPOI && mode === 'EXPLORE' && (
            <div className="pointer-events-auto contents">
              <POIPreviewCard
                poi={mappedSelectedPOI}
                distance={activePOI?.id === selectedPOIId ? activePOI?.distance : null}
                isResonating={selectedPOIId === activePOI?.id && activePOI?.isWithinRadius}
                onClose={() => setSelectedPOIId(null)}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </MapProvider>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V7.8):
 * 1. Aggressive Reveal Protocol: Se introdujo un fallback timer de 2.2s para 
 *    garantizar que el mapa se muestre aunque Mapbox falle en emitir 'onIdle'.
 * 2. Handover Continuity: Si el Voyager ya está localizado (isIgnited), el sistema 
 *    nace informando de la restauración del link, eliminando la sensación de carga fría.
 * 3. Race-Condition Shield: revealPerformedRef asegura que el revelado ocurra 
 *    exactamente una vez, ya sea por evento natural o por timeout.
 * 4. Main Thread Protection: La disolución de Smokescreen por Ref evita el 
 *    re-render del Hub, protegiendo la estabilidad del hilo de la GPU.
 */