// components/geo/SpatialEngine/index.tsx
// VERSIÓN: 6.3 (NicePod Spatial Hub - Cinematic Director Integration Edition)
// Misión: Orquestar el motor WebGL delegando el seguimiento continuo al CameraController.
// [ESTABILIZACIÓN]: Integración del motor de interpolación LERP y purga de conflictos de cámara.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass } from "lucide-react";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { MapRef } from "react-map-gl/mapbox";

// --- INFRAESTRUCTURA CORE ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { SearchResult } from "@/hooks/use-search-radar";
import { cn } from "@/lib/utils";

// --- CONSTANTES DE FÍSICA Y CÁMARA ---
import {
  FLY_CONFIG,
  MADRID_SOL_COORDS,
  MapboxLightPreset,
  ZOOM_LEVELS
} from "../map-constants";

import { POIPreviewCard } from "../poi-preview-card";
import MapCore from "./map-core";

// [MANDATO V2.7]: Inyección del Director Cinematográfico
import { CameraController } from "./camera-controller";

/**
 * ---------------------------------------------------------------------------
 * I. [BUILD SHIELD]: TYPE EXTRACTION STRATEGY
 * ---------------------------------------------------------------------------
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

export function SpatialEngine({ mode, theme = 'night', onManualAnchor, className }: SpatialEngineProps) {

  // 1. CONSUMO DE TELEMETRÍA SOBERANA
  const {
    userLocation,
    nearbyPOIs,
    activePOI,
    status: engineStatus,
    initSensors,
    isTriangulated,
    setTriangulated
  } = useGeoEngine();

  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  // El mapa asume que la cámara está "asentada" si ya existía una triangulación previa
  const [isCameraSettled, setIsCameraSettled] = useState<boolean>(isTriangulated);

  const [searchCenter, setSearchCenter] = useState({
    latitude: MADRID_SOL_COORDS.latitude,
    longitude: MADRID_SOL_COORDS.longitude,
  });

  /**
   * 2. PROTOCOLOS DE INICIALIZACIÓN (Safe Mount)
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
   * 3. PROTOCOLO DE IGNICIÓN AUTOMÁTICA
   */
  useEffect(() => {
    if (isContainerReady && engineStatus === 'IDLE') {
      initSensors();
    }
  }, [isContainerReady, engineStatus, initSensors]);

  /**
   * 4. PROTOCOLO DE RESCATE (Fail-Safe)
   */
  useEffect(() => {
    if (isMapLoaded && !isCameraSettled) {
      const rescueTimer = setTimeout(() => {
        if (!isCameraSettled) {
          setIsCameraSettled(true);
        }
      }, 7000);
      return () => clearTimeout(rescueTimer);
    }
  }, [isMapLoaded, isCameraSettled]);

  /**
   * 5. VUELOS MANUALES (Intervención de Usuario)
   * Estas funciones solo se usan cuando el usuario TOCA la interfaz (Click o Búsqueda).
   * El seguimiento automático (al caminar) es ahora responsabilidad del CameraController.
   */
  const flyToPosition = useCallback((lng: number, lat: number, zoom: number = ZOOM_LEVELS.STREET) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: zoom,
      pitch: mode === 'EXPLORE' ? 80 : 0,
      bearing: -15,
      ...FLY_CONFIG
    });
  }, [mode]);

  const jumpToPosition = useCallback((lng: number, lat: number, zoom: number = ZOOM_LEVELS.STREET) => {
    if (!mapRef.current) return;
    mapRef.current.jumpTo({
      center: [lng, lat],
      zoom: zoom,
      pitch: mode === 'EXPLORE' ? 80 : 0,
      bearing: -15
    });
  }, [mode]);

  /**
   * 6. PROTOCOLO DE REVELADO SOBERANO
   */
  const handleMapIdle = useCallback(() => {
    if (isMapLoaded && !isCameraSettled) {
      setIsCameraSettled(true);
      // Solo en el primer 'idle' marcamos la triangulación como sellada
      if (!isTriangulated) {
        setTriangulated();
      }
    }
  }, [isMapLoaded, isCameraSettled, isTriangulated, setTriangulated]);

  const handleMoveEnd = useCallback((event: SafeMapMoveEvent) => {
    setSearchCenter({
      latitude: event.viewState.latitude,
      longitude: event.viewState.longitude
    });
  }, []);

  const handleMapClick = useCallback((event: SafeMapClickEvent) => {
    if (mode !== 'FORGE' || !onManualAnchor) return;
    const lngLat: [number, number] = [event.lngLat.lng, event.lngLat.lat];
    onManualAnchor(lngLat);
    jumpToPosition(lngLat[0], lngLat[1], ZOOM_LEVELS.FORGE);
  }, [mode, onManualAnchor, jumpToPosition]);

  const handleSearchResult = useCallback((results: SearchResult[] | null) => {
    if (results && results.length > 0) {
      const topHit = results[0];
      if (topHit.metadata?.lat && topHit.metadata?.lng) {
        flyToPosition(topHit.metadata.lng, topHit.metadata.lat, ZOOM_LEVELS.STREET);
      }
    }
  }, [flyToPosition]);

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
      <AnimatePresence mode="wait">
        {!isCameraSettled && (
          <motion.div key="smokescreen" exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.8, ease: "easeOut" }} className="absolute inset-0 z-[110] bg-[#020202] flex flex-col items-center justify-center space-y-10 pointer-events-auto">
            <Compass className="h-16 w-16 text-primary animate-spin-slow" />
            <div className="flex flex-col items-center gap-4 text-center px-12">
              <span className="text-[11px] font-black uppercase tracking-[0.6em] text-white">Madrid Resonance</span>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse italic">
                {!userLocation ? "Capturando Telemetría..." : "Estabilizando Malla 3D..."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
          [MANDATO V2.7]: Montaje Condicional garantizado. 
          El motor no nace hasta que tenemos la semilla espacial inicial.
      */}
      {isContainerReady && userLocation && (
        <div className="w-full h-full pointer-events-auto">
          <MapCore
            ref={mapRef}
            mode={mode}
            startCoords={userLocation}
            theme={theme} 
            selectedPOIId={selectedPOIId}
            onLoad={() => setIsMapLoaded(true)}
            onIdle={handleMapIdle}
            onMove={() => { }}
            onMoveEnd={handleMoveEnd}
            onMapClick={handleMapClick}
            onMarkerClick={(id: string) => {
              if (mode === 'EXPLORE') {
                setSelectedPOIId(id);
                const p = nearbyPOIs.find(item => item.id.toString() === id);
                if (p) flyToPosition(p.geo_location.coordinates[0], p.geo_location.coordinates[1]);
              }
            }}
          />
          
          {/* 
              [CEREBRO CINEMÁTICO INYECTADO] 
              Si estamos explorando, el Director toma el control de los motores WebGL 
              para garantizar el seguimiento de 60fps estilo Google Maps / Pokémon GO.
          */}
          {mode === 'EXPLORE' && isCameraSettled && (
             <CameraController />
          )}
        </div>
      )}

      {mode === 'EXPLORE' && isCameraSettled && (
        <div className="absolute top-6 left-4 right-4 z-[100] md:top-8 md:left-8 md:w-[400px] animate-in fade-in duration-1000 pointer-events-auto">
          <UnifiedSearchBar variant="console" onResults={handleSearchResult} placeholder="Rastrear ecos urbanos..." latitude={searchCenter.latitude} longitude={searchCenter.longitude} />
        </div>
      )}

      <AnimatePresence>
        {mappedSelectedPOI && mode === 'EXPLORE' && (
          <div className="pointer-events-auto contents">
            <POIPreviewCard poi={mappedSelectedPOI} distance={activePOI?.id === selectedPOIId ? activePOI?.distance : null} isResonating={selectedPOIId === activePOI?.id && activePOI?.isWithinRadius} onClose={() => setSelectedPOIId(null)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.3):
 * 1. Delegación de Seguimiento: Se purgaron los useEffects que saltaban la cámara al cambiar el GPS.
 *    Esa responsabilidad ha sido transferida exitosamente al 'CameraController'.
 * 2. Inyección de Mando: El '<CameraController />' se monta de forma condicional, 
 *    garantizando que la interpolación matemática solo consuma recursos cuando la malla 
 *    esté lista y el usuario esté en modo exploración.
 */