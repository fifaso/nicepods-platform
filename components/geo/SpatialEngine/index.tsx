/**
 * ARCHIVO: components/geo/SpatialEngine/index.tsx
 * VERSIÓN: 7.4 (NicePod Spatial Hub - Flight-Shield & Mando Autoritario Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Orquestar el motor WebGL protegiendo las maniobras programáticas.
 * [REFORMA V7.4]: Implementación de Flight Shield para evitar colisiones entre LERP y FlyTo.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, ShieldAlert } from "lucide-react";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { MapRef } from "react-map-gl/mapbox";

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

  // 1. CONSUMO DE SOBERANÍA CINEMÁTICA (V34.0)
  const {
    userLocation,
    nearbyPOIs,
    activePOI,
    status: engineStatus,
    initSensors,
    isTriangulated,
    isIgnited,
    needsBallisticLanding, // Flag de pulso de vuelo
    setManualMode,
    cameraPerspective,
    toggleCameraPerspective
  } = useGeoEngine();

  // 2. REFERENCIAS DE CONTROL DE HARDWARE
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 3. MÁQUINA DE ESTADOS VISUAL (REVELADO)
  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [isCameraSettled, setIsCameraSettled] = useState<boolean>(false);

  // Ancla dinámica para el Radar de Búsqueda (Bóveda NKV)
  const [searchCenter, setSearchCenter] = useState({
    latitude: MADRID_SOL_COORDS.latitude,
    longitude: MADRID_SOL_COORDS.longitude,
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
        nicepodLog("📡 [SpatialHub] Activando sensores por proximidad.");
        initSensors();
      }

      // Sincronía Pokémon GO: Forzar vista de calle al entrar en mapa full
      if (mode === 'EXPLORE' && cameraPerspective === 'OVERVIEW') {
        nicepodLog("🎭 [SpatialHub] Transmutando perspectiva para inmersión.");
        toggleCameraPerspective();
      }
    }
  }, [isContainerReady, isIgnited, engineStatus, initSensors, mode, cameraPerspective, toggleCameraPerspective]);

  /**
   * 6. RED DE SEGURIDAD (SMOKESCREEN RESCUE)
   */
  useEffect(() => {
    if (isMapLoaded && !isCameraSettled) {
      const rescueTimer = setTimeout(() => {
        if (!isCameraSettled) {
          nicepodLog("⚠️ [SpatialHub] Timeout de materialización. Forzando paso de luz.");
          setIsCameraSettled(true);
        }
      }, 7000);
      return () => clearTimeout(rescueTimer);
    }
  }, [isMapLoaded, isCameraSettled]);

  /**
   * 7. MANEJADORES DE EVENTOS SOBERANOS
   */

  const handleMapIdle = useCallback(() => {
    if (isMapLoaded && !isCameraSettled) {
      setIsCameraSettled(true);
      nicepodLog("✨ [SpatialHub] Malla PBR estabilizada.");
    }
  }, [isMapLoaded, isCameraSettled]);

  /**
   * handleMapMove: Sincronía de Radar con Escudo de Vuelo.
   * [REFORMA V7.4]: Implementación de Flight-Shield para evitar auto-bloqueo.
   */
  const handleMapMove = useCallback((event: SafeMapMoveEvent) => {
    // Actualizamos el centro para la UnifiedSearchBar en tiempo real
    setSearchCenter({
      latitude: event.viewState.latitude,
      longitude: event.viewState.longitude
    });

    /**
     * FLIGHT-SHIELD LOGIC:
     * Solo activamos el modo manual si:
     * 1. El evento proviene de una interacción física (originalEvent).
     * 2. NO existe un pulso balístico activo (needsBallisticLanding).
     * Esto evita que el movimiento programático del recentrado se auto-cancele.
     */
    if (event.originalEvent && !needsBallisticLanding) {
      setManualMode(true);
    }
  }, [setManualMode, needsBallisticLanding]);

  const handleMapMoveEnd = useCallback((event: SafeMapMoveEvent) => {
    nicepodLog(`📍 [SpatialHub] Cámara anclada en: ${event.viewState.latitude.toFixed(4)}`);
    setSearchCenter({
      latitude: event.viewState.latitude,
      longitude: event.viewState.longitude
    });
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
        // Al buscar, forzamos modo manual para permitir exploración libre tras el vuelo
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
    <div ref={containerRef} className={cn("w-full h-full relative bg-[#010101]", className)}>

      {/* I. CORTINA DE CARGA SOBERANA (SMOKESCREEN) */}
      <AnimatePresence mode="wait">
        {engineStatus === 'PERMISSION_DENIED' ? (
          <motion.div key="p_denied" className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-zinc-950 z-[200] text-center">
            <ShieldAlert className="h-10 w-10 text-red-500 mb-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-400">Acceso Denegado</span>
          </motion.div>
        ) : !isCameraSettled ? (
          <motion.div
            key="smokescreen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 z-[110] bg-[#020202] flex flex-col items-center justify-center space-y-10 pointer-events-auto"
          >
            <div className="relative">
              <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <Compass className="h-16 w-16 text-primary relative z-10 animate-spin-slow" />
            </div>

            <div className="flex flex-col items-center gap-4 text-center px-12">
              <span className="text-[11px] font-black uppercase tracking-[0.6em] text-white">Madrid Resonance</span>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse italic">
                {needsBallisticLanding ? "Ejecutando Vuelo Balístico..." : "Sincronizando Malla..."}
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* II. MOTOR WEBGL (MAP-CORE) */}
      {isContainerReady && userLocation && (
        <div className="w-full h-full pointer-events-auto">
          <MapCore
            ref={mapRef}
            mode={mode}
            // En el mapa grande, si no hay ubicación de autoridad, nacemos arriba (V5.4 Context).
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

          {/* EL DIRECTOR DE CÁMARA (V4.4 compatible) */}
          {mode === 'EXPLORE' && isMapLoaded && (
            <CameraController />
          )}
        </div>
      )}

      {/* III. INTERFAZ SUPERPUESTA */}
      {mode === 'EXPLORE' && isCameraSettled && (
        <div className="absolute top-6 left-4 right-4 z-[100] md:top-8 md:left-8 md:w-[400px] animate-in fade-in duration-1000 pointer-events-auto">
          <UnifiedSearchBar
            variant="console"
            onResults={handleSearchResult}
            onLoading={setIsSearchLoading}
            placeholder="Rastrear ecos urbanos..."
            latitude={searchCenter.latitude}
            longitude={searchCenter.longitude}
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
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V7.4):
 * 1. Flight Shield: Se bloquea la detección de modo manual durante maniobras 
 *    balísticas. Esto resuelve el fallo del botón de ubicación al permitir que 
 *    el flyTo se complete sin interrupciones del sistema.
 * 2. Gesture Discrimination: Solo los eventos 'originalEvent' (físicos) pueden 
 *    activar el modo manual, blindando la cinemática programática.
 * 3. Atomic Radar Sync: El buscador semántico se mantiene alineado con la cámara
 *    tanto en movimiento activo como al finalizar el desplazamiento.
 * 4. Contextual Narrative: El Smokescreen adapta su léxico técnicos según la 
 *    acción en curso, reforzando la atmósfera industrial.
 */