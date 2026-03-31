/**
 * ARCHIVO: components/geo/SpatialEngine/index.tsx
 * VERSIÓN: 7.10 (NicePod Spatial Hub - Performance Profiling Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Orquestar el motor WebGL con soporte para perfiles de carga variable.
 * [REFORMA V7.10]: Implementación de performanceProfile (HIGH_FIDELITY vs TACTICAL_LITE).
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

// --- CONSTANTES DE FÍSICA Y CONTRATOS V5.5 ---
import {
  FLY_CONFIG,
  MADRID_SOL_COORDS,
  MapboxLightPreset,
  MapPerformanceProfile, // [NUEVO V5.5]
  ZOOM_LEVELS,
  INITIAL_OVERVIEW_CONFIG
} from "../map-constants";

import { MapInstanceId } from "@/types/geo-sovereignty";
import { POIPreviewCard } from "../poi-preview-card";
import { CameraController } from "./camera-controller";
import MapCore from "./map-core";

/**
 * [BUILD SHIELD]: TYPE EXTRACTION
 * Extraemos dinámicamente los contratos de eventos de la instancia nativa.
 */
type MapNativeProps = ComponentProps<typeof Map>;
type SafeMapMoveEvent = Parameters<NonNullable<MapNativeProps['onMove']>>[0];
type SafeMapClickEvent = Parameters<NonNullable<MapNativeProps['onClick']>>[0];

/**
 * SpatialEngineProps: Contrato de orquestación visual soberano.
 * [V7.10]: Integración de performanceProfile para optimización de VRAM.
 */
interface SpatialEngineProps {
  mapId: MapInstanceId;
  mode: 'EXPLORE' | 'FORGE';
  theme?: MapboxLightPreset;
  performanceProfile?: MapPerformanceProfile; // [NUEVO]
  onManualAnchor?: (lngLat: [number, number]) => void;
  className?: string;
}

/**
 * SpatialEngine: El Reactor de Inteligencia Visual Soberano.
 */
export function SpatialEngine({ 
  mapId, 
  mode, 
  theme = 'night', 
  performanceProfile = 'HIGH_FIDELITY', // Por defecto, máxima calidad
  onManualAnchor, 
  className 
}: SpatialEngineProps) {

  // 1. CONSUMO DE SOBERANÍA CINEMÁTICA (V37.0)
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
   * 4. PROTOCOLO DE SEGURIDAD DE MONTAJE (Safe Mount)
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

      // Sincronía Pokémon GO: Forzar vista STREET al entrar en el mapa full-screen
      if (mode === 'EXPLORE' && cameraPerspective === 'OVERVIEW') {
        nicepodLog(`🎭 [SpatialHub:${mapId}] Activando inmersión de calle.`);
        toggleCameraPerspective();
      }
    }
  }, [isContainerReady, isIgnited, engineStatus, initSensors, mode, cameraPerspective, toggleCameraPerspective, mapId]);

  /**
   * 6. EL REVELADO AGRESIVO (Soberanía Visual V7.8)
   */
  const revealMap = useCallback(() => {
    if (revealPerformedRef.current) return;
    
    nicepodLog(`✨ [SpatialHub:${mapId}] Malla materializada. Perfil: ${performanceProfile}`);
    revealPerformedRef.current = true;
    
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);

    if (smokescreenRef.current) {
      smokescreenRef.current.style.opacity = "0";
      smokescreenRef.current.style.pointerEvents = "none";
      setTimeout(() => {
        if (smokescreenRef.current) smokescreenRef.current.style.display = "none";
      }, 850);
    }
  }, [mapId, performanceProfile]);

  /**
   * FALLBACK TIMER: Race-Condition Guard
   */
  useEffect(() => {
    if (isMapLoaded && !revealPerformedRef.current) {
      fallbackTimerRef.current = setTimeout(() => {
        nicepodLog(`⚠️ [SpatialHub:${mapId}] Timeout Mapbox onIdle. Forzando paso de luz.`);
        revealMap();
      }, 2200);
    }
    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, [isMapLoaded, revealMap, mapId]);

  /**
   * 7. MANEJADORES DE EVENTOS SOBERANOS
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
    nicepodLog(`📍 [SpatialHub:${mapId}] Cámara asentada.`);
  }, [mapId]);

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

        {/* I. CORTINA DE CARGA SOBERANA */}
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
                  {needsBallisticLanding ? "Ejecutando Salto Balístico..." : 
                   isIgnited ? "Restaurando Link..." : "Sincronizando Malla..."}
                </p>
              </div>
            </>
          )}
        </div>

        {/* II. MOTOR WEBGL (MAP-CORE) */}
        {isContainerReady && userLocation && (
          <div className="w-full h-full pointer-events-auto">
            <MapCore
              mapId={mapId}
              mode={mode}
              // [V7.10]: Propagación del perfil de rendimiento
              performanceProfile={performanceProfile}
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

            {/* DIRECTOR DE CÁMARA (Sincronizado con mapId) */}
            {mode === 'EXPLORE' && isMapLoaded && (
              <CameraController mapId={mapId} />
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
 * NOTA TÉCNICA DEL ARCHITECT (V7.10):
 * 1. Resource Sovereignty: Se inyectó performanceProfile para permitir que el 
 *    sistema degrade la calidad visual en favor de la respuesta física en el Step 1.
 * 2. Atomic Identity: El bindeo por mapId garantiza que el CameraController 
 *    esté vinculado quirúrgicamente al lienzo activo, erradicando el ghosting visual.
 * 3. Memory Hygiene: El encapsulamiento del MapProvider asegura que la VRAM sea 
 *    liberada al desmontar la ruta, protegiendo el hilo principal.
 * 4. Interaction Shield: handleMapMove mantiene el Flight-Shield, permitiendo 
 *    maniobras de autoridad sin interrupciones manuales falsas.
 */