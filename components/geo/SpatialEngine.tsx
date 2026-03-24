// components/geo/SpatialEngine.tsx
// VERSIÓN: 8.1 (NicePod GO-Engine - Staged Camera & Horizon Edition)
// Misión: Renderizado fotorrealista con horizonte 3D inmersivo sin colapsos matemáticos.
// [ESTABILIZACIÓN]: Recuperación de proyección 'globe' mediante inicialización escalonada de cámara.

"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

// --- MOTOR CARTOGRÁFICO ---
import Map, {
  GeolocateControl,
  Layer,
  NavigationControl,
  Source
} from 'react-map-gl/mapbox';


import { AnimatePresence } from "framer-motion";

// --- INFRAESTRUCTURA SOBERANA ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn, nicepodLog } from "@/lib/utils";
import { PointOfInterest } from "@/types/geo-sovereignty";

// --- COMPONENTES DE MALLA ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { SearchResult } from "@/hooks/use-search-radar";
import { MapMarkerCustom } from "./map-marker-custom";
import { POIPreviewCard } from "./poi-preview-card";
import { UserLocationMarker } from "./user-location-marker";

interface NicePodMapMoveEvent {
  viewState: {
    latitude: number;
    longitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
  };
}

interface NicePodMapClickEvent {
  lngLat: {
    lng: number;
    lat: number;
  };
}

type MapRefInstance = React.ElementRef<typeof Map>;

interface SpatialEngineProps {
  mode: 'EXPLORE' | 'FORGE';
  onManualAnchor?: (lngLat: [number, number]) => void;
  className?: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
const PHOTOREALISTIC_STYLE = "mapbox://styles/mapbox/satellite-streets-v12";
const DARK_IMMERSIVE_STYLE = "mapbox://styles/mapbox/dark-v11";

const FLY_CONFIG = {
  duration: 4000, // Duración aumentada para un vuelo más cinematográfico
  essential: true,
  curve: 1.2,
  easing: (t: number) => t * (2 - t)
};

export function SpatialEngine({ mode, onManualAnchor, className }: SpatialEngineProps) {

  const mapRef = useRef<MapRefInstance>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const geoEngine = useGeoEngine();
  const { userLocation, nearbyPOIs, activePOI } = geoEngine;

  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);

  const hasInitialJumpPerformed = useRef<boolean>(false);

  // 1. SAFE MOUNT OBSERVER
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
   * 2. CÁMARA ESCALONADA (FASE 1: IGNICIÓN SEGURA)
   * Nacemos con pitch de 60° para asegurar que el motor WebGL calcule 
   * las matrices del globo sin colapsar.
   */
  const [viewState, setViewState] = useState({
    latitude: geoEngine.userLocation?.latitude || 40.4167,
    longitude: geoEngine.userLocation?.longitude || -3.7037,
    zoom: mode === 'FORGE' ? 18.5 : 15.5,
    pitch: mode === 'FORGE' ? 0 : 60, // Pitch seguro inicial
    bearing: -10,
  });

  // Mantiene la vista sincronizada con el GPS en modo Forge (cenital)
  useEffect(() => {
    if (geoEngine.userLocation && mode === 'FORGE' && !isMapLoaded) {
      setViewState(prev => ({
        ...prev,
        latitude: geoEngine.userLocation!.latitude,
        longitude: geoEngine.userLocation!.longitude
      }));
    }
  }, [geoEngine.userLocation, mode, isMapLoaded]);

  /**
   * 3. PROTOCOLO DE VUELO (Cámara Inmersiva)
   * Cuando volamos, forzamos el pitch a 80° para lograr el efecto Pokémon GO.
   */
  const flyToPosition = useCallback((lng: number, lat: number, zoomLevel = 17, targetPitch = 80) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: zoomLevel,
        pitch: mode === 'EXPLORE' ? targetPitch : 0,
        ...FLY_CONFIG
      });
    }
  }, [mode]);

  /**
   * 4. AUTO-LOCALIZACIÓN CINETMÁTICA (FASE 2: INMERSIÓN)
   * Una vez que tenemos la coordenada Y el mapa está cargado (terreno listo),
   * volamos hacia el Voyager levantando la cámara hasta el horizonte (80°).
   */
  useEffect(() => {
    if (userLocation && isMapLoaded && !hasInitialJumpPerformed.current) {
      nicepodLog("🎯 [SpatialEngine] Coordenada detectada. Elevando cámara a horizonte 3D.");
      flyToPosition(userLocation.longitude, userLocation.latitude, mode === 'FORGE' ? 18.5 : 16.5, 80);
      hasInitialJumpPerformed.current = true;
    }
  }, [userLocation, isMapLoaded, flyToPosition, mode]);

  const handleMove = useCallback((event: NicePodMapMoveEvent) => {
    setViewState(event.viewState);
  }, []);

  const handleMapClick = useCallback((event: NicePodMapClickEvent) => {
    if (mode !== 'FORGE' || !onManualAnchor) return;

    const lngLat: [number, number] = [event.lngLat.lng, event.lngLat.lat];

    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate([10, 30, 10]);
    }
    onManualAnchor(lngLat);
    flyToPosition(lngLat[0], lngLat[1], 19, 0); // Vuelo cenital para forja
  }, [mode, onManualAnchor, flyToPosition]);

  const handleSearchResult = useCallback((results: SearchResult[] | null) => {
    if (results && results.length > 0) {
      const topHit = results[0];
      if (topHit.metadata?.lat && topHit.metadata?.lng) {
        flyToPosition(topHit.metadata.lng, topHit.metadata.lat, 17, 75);
      }
    }
  }, [flyToPosition]);

  /**
   * ATMÓSFERA SOBERANA
   * Calibrada para fusionarse con el cielo oscuro de la plataforma.
   */
  const fogConfig = useMemo(() => ({
    "range": [0.5, 10],
    "color": "#020202",
    "horizon-blend": 0.2,
    "high-color": "#1e293b",
    "space-color": "#000000",
    "star-intensity": 0.5
  }), []);

  /**
   * CAPA ARQUITECTÓNICA 3D (Cristal de Obsidiana)
   */
  const buildingLayerConfig = useMemo(() => ({
    id: "3d-buildings",
    source: "composite",
    "source-layer": "building",
    filter: ["==", "extrude", "true"],
    type: "fill-extrusion",
    minzoom: 14,
    paint: {
      "fill-extrusion-color": "#050505",
      "fill-extrusion-height": ["get", "height"],
      "fill-extrusion-base": ["get", "min_height"],
      "fill-extrusion-opacity": 0.8, // Ligeramente más opaco para destacar sobre el satélite
    },
  }), []);

  const onMapLoad = useCallback((e: any) => {
    setIsMapLoaded(true);
    const map = e.target;
    if (mode === 'EXPLORE') {
      const layers = map.getStyle().layers;
      layers.forEach((layer: any) => {
        if (layer.type === 'symbol' && (layer.id.includes('poi') || layer.id.includes('transit'))) {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      });
    }
  }, [mode]);

  const mappedSelectedPOI = useMemo(() => {
    if (!selectedPOIId || !nearbyPOIs || nearbyPOIs.length === 0) return null;
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

      {mode === 'EXPLORE' && (
        <div className="absolute top-6 left-4 right-4 z-[100] md:top-8 md:left-8 md:w-[400px]">
          <UnifiedSearchBar
            variant="console"
            onResults={handleSearchResult}
            onLoading={setIsSearchLoading}
            placeholder="Rastrear ecos urbanos..."
            latitude={viewState.latitude}
            longitude={viewState.longitude}
            className="shadow-2xl"
          />
        </div>
      )}

      {isContainerReady && (
        <Map
          {...viewState}
          ref={mapRef as any}
          onMove={handleMove as any}
          onClick={handleMapClick as any}
          onLoad={onMapLoad}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle={mode === 'FORGE' ? PHOTOREALISTIC_STYLE : DARK_IMMERSIVE_STYLE}

          // [FIX CRÍTICO]: PROYECCIÓN GLOBE
          // Restauramos 'globe' para permitir el horizonte profundo (Pitch > 60).
          projection="globe"

          terrain={mode === 'EXPLORE' ? { source: 'mapbox-dem', exaggeration: 1.2 } : undefined}
          fog={mode === 'EXPLORE' ? fogConfig as any : undefined}
          antialias={true}
          reuseMaps={true}
          maxPitch={85} // Límite máximo permitido
          attributionControl={false}
        >
          {/* FUENTE DE ELEVACIÓN */}
          {mode === 'EXPLORE' && (
            <Source
              id="mapbox-dem"
              type="raster-dem"
              url="mapbox://mapbox.mapbox-terrain-dem-v1"
              tileSize={512}
              maxzoom={14}
            />
          )}

          <GeolocateControl showUserLocation={false} className="hidden" />

          {userLocation && (
            <UserLocationMarker
              location={userLocation}
              isResonating={!!activePOI?.isWithinRadius}
            />
          )}

          {nearbyPOIs?.map((poi: PointOfInterest) => (
            <MapMarkerCustom
              key={poi.id}
              id={poi.id.toString()}
              latitude={poi.geo_location.coordinates[1]}
              longitude={poi.geo_location.coordinates[0]}
              category_id={poi.category_id}
              name={poi.name}
              isResonating={activePOI?.id === poi.id.toString() && activePOI?.isWithinRadius}
              isSelected={selectedPOIId === poi.id.toString()}
              onClick={(id: string) => {
                if (mode === 'EXPLORE') {
                  setSelectedPOIId(id);
                  const p = nearbyPOIs.find(item => item.id.toString() === id);
                  if (p) flyToPosition(p.geo_location.coordinates[0], p.geo_location.coordinates[1], 17, 75);
                }
              }}
            />
          ))}

          {isMapLoaded && mode === 'EXPLORE' && (
            <Layer {...buildingLayerConfig as any} />
          )}

          <div className="absolute bottom-10 right-4 flex flex-col gap-4 z-40">
            <NavigationControl showCompass={false} className="!bg-black/60 !backdrop-blur-xl !border-white/10 !rounded-2xl" />
          </div>
        </Map>
      )}

      <AnimatePresence>
        {mappedSelectedPOI && mode === 'EXPLORE' && (
          <POIPreviewCard
            poi={mappedSelectedPOI}
            distance={activePOI?.id === selectedPOIId ? activePOI?.distance : null}
            isResonating={selectedPOIId === activePOI?.id && activePOI?.isWithinRadius}
            onClose={() => setSelectedPOIId(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}