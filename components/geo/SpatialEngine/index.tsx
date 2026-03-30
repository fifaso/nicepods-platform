/**
 * ARCHIVO: components/geo/SpatialEngine/index.tsx
 * VERSIÓN: 7.7 (NicePod Spatial Hub - Atomic Performance & Interaction Shield Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Orquestar el motor WebGL con aislamiento total y rendimiento industrial.
 * [REFORMA V7.7]: Eliminación de re-renders por movimiento y blindaje de Smokescreen.
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

  // 1. CONSUMO DE SOBERANÍA CINEMÁTICA (V36.0)
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

  // 3. MÁQUINA DE ESTADOS CRÍTICA
  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  
  // searchCenter: Mantenemos un estado local solo para la prop de la SearchBar,
  // pero el cálculo pesado se hace mediante refs.
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
    return () => observer.disconnect();
  }, []);

  /**
   * 5. AUTO-IGNICIÓN Y DISPARADOR DE INMERSIÓN
   */
  useEffect(() => {
    if (isContainerReady) {
      if (!isIgnited && engineStatus === 'IDLE') {
        initSensors();
      }

      // Sincronía Pokémon GO: Forzar vista STREET al entrar en el mapa
      if (mode === 'EXPLORE' && cameraPerspective === 'OVERVIEW') {
        nicepodLog("🎭 [SpatialHub] Transmutando a perspectiva STREET.");
        toggleCameraPerspective();
      }
    }
  }, [isContainerReady, isIgnited, engineStatus, initSensors, mode, cameraPerspective, toggleCameraPerspective]);

  /**
   * 6. EL REVELADO SOBERANO (onIdle)
   * [MEJORA V7.7]: Uso de manipulación directa del DOM para evitar pestañeo por re-render.
   */
  const handleMapIdle = useCallback(() => {
    if (!isMapLoaded) return;
    
    nicepodLog("✨ [SpatialHub] Malla PBR estabilizada. Disolviendo Smokescreen.");
    
    if (smokescreenRef.current) {
      smokescreenRef.current.style.opacity = "0";
      smokescreenRef.current.style.pointerEvents = "none";
      // Eliminamos físicamente del flujo tras la transición
      setTimeout(() => {
        if (smokescreenRef.current) smokescreenRef.current.style.display = "none";
      }, 800);
    }
  }, [isMapLoaded]);

  /**
   * handleMapMove: Sincronía de Radar con Interaction-Shield.
   */
  const handleMapMove = useCallback((event: SafeMapMoveEvent) => {
    // Actualizamos las coordenadas para la barra de búsqueda de forma optimizada
    setSearchPos({
      lat: event.viewState.latitude,
      lng: event.viewState.longitude
    });

    /**
     * FLIGHT-SHIELD LOGIC:
     * Si el evento es físico (originalEvent) y no hay vuelo activo,
     * informamos al GeoEngine para activar el modo manual.
     */
    if (event.originalEvent && !needsBallisticLanding) {
      setManualMode(true);
    }
  }, [setManualMode, needsBallisticLanding]);

  const handleMapMoveEnd = useCallback((event: SafeMapMoveEvent) => {
    nicepodLog(`📍 [SpatialHub] Cámara anclada en: ${event.viewState.latitude.toFixed(4)}`);
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

        {/* I. CORTINA DE CARGA SOBERANA (SMOKESCREEN) 
            [V7.7]: Blindado mediante Ref para evitar pestañeo de re-render.
        */}
        <div 
          ref={smokescreenRef}
          className="absolute inset-0 z-[110] bg-[#020202] flex flex-col items-center justify-center space-y-10 transition-opacity duration-700 ease-in-out pointer-events-auto"
        >
          {engineStatus === 'PERMISSION_DENIED' ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <ShieldAlert className="h-10 w-10 text-red-500 mb-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-400">Acceso Denegado</span>
            </div>
          ) : (
            <>
              <div className="relative">
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }} 
                  transition={{ duration: 3, repeat: Infinity }} 
                  className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" 
                />
                <Compass className="h-16 w-16 text-primary relative z-10 animate-spin-slow" />
              </div>

              <div className="flex flex-col items-center gap-4 text-center px-12">
                <span className="text-[11px] font-black uppercase tracking-[0.6em] text-white">Madrid Resonance</span>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse italic">
                  {needsBallisticLanding ? "Ejecutando Vuelo de Inmersión..." : "Sincronizando Malla..."}
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
              // Nacemos cenital si el hardware no está listo (V5.4 Context).
              startCoords={!isIgnited ? { ...userLocation, ...INITIAL_OVERVIEW_CONFIG } : userLocation}
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

            {/* EL DIRECTOR DE CÁMARA (V4.8 compatible) */}
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
 * NOTA TÉCNICA DEL ARCHITECT (V7.7):
 * 1. Flickering Eradication: Se sustituyó la gestión reactiva de Smokescreen por 
 *    manipulación directa del DOM tras el evento onIdle. Esto evita que el 
 *    componente SpatialEngine se re-renderice al revelar el mapa, protegiendo 
 *    la integridad de la instancia WebGL.
 * 2. Interaction Shield: El manejador onMove ahora discrimina entre vuelos 
 *    balísticos y gestos humanos, permitiendo que el botón de ubicación complete 
 *    sus maniobras sin interferencias.
 * 3. Radar Synchronization: searchPos se actualiza dinámicamente para la 
 *    SearchBar, pero el mapa permanece inmutable gracias a la V8.7 de MapCore.
 * 4. Instance Silencing: MapProvider local garantiza que 'map-full' sea el único 
 *    receptor de comandos en esta ruta.
 */