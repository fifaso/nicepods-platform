// components/geo/SpatialEngine.tsx
// VERSIÓN: 6.1 (NicePod GO-Engine - Photorealistic & Ultimate Shield Edition)
// Misión: Renderizado Fotorrealista Satelital con cero errores de TypeScript y cero colapsos WebGL.
// [ESTABILIZACIÓN]: Fusión del SafeMount (Anti-RangeError) con Contratos Locales Estrictos.

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
// Sub-path explícito para evitar fallos de Vercel Build.
import Map, {
  GeolocateControl,
  Layer,
  NavigationControl
} from 'react-map-gl/mapbox';

import { AnimatePresence } from "framer-motion";

// --- INFRAESTRUCTURA DE DOMINIO SOBERANO ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn } from "@/lib/utils";
import { PointOfInterest } from "@/types/geo-sovereignty";

// --- COMPONENTES DE MALLA TÁCTICA ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { SearchResult } from "@/hooks/use-search-radar";
import { MapMarkerCustom } from "./map-marker-custom";
import { POIPreviewCard } from "./poi-preview-card";
import { UserLocationMarker } from "./user-location-marker";

/**
 * ---------------------------------------------------------------------------
 * [BUILD SHIELD]: CONTRATOS LOCALES ESTRICTOS (THE FIX)
 * ---------------------------------------------------------------------------
 * Declaramos las estructuras aquí para ignorar los tipos rotos de la librería externa.
 * Esto erradica los errores ts(2304) y ts(2709).
 */
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

// Extracción del tipo de referencia usando React nativo
type MapRefInstance = React.ElementRef<typeof Map>;

interface SpatialEngineProps {
  mode: 'EXPLORE' | 'FORGE';
  onManualAnchor?: (lngLat: [number, number]) => void;
  className?: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/**
 * ESTÁNDAR VISUAL FOTORREALISTA
 */
const PHOTOREALISTIC_STYLE = "mapbox://styles/mapbox/satellite-streets-v12";

const FLY_CONFIG = {
  duration: 2000,
  essential: true,
  curve: 1.42,
  easing: (t: number) => t * (2 - t)
};

export function SpatialEngine({ mode, onManualAnchor, className }: SpatialEngineProps) {

  const mapRef = useRef<MapRefInstance>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const geoEngine = useGeoEngine();

  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);

  // Estado de Montaje Seguro (Safe Mount)
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);

  /**
   * PROTOCOLO DE SEGURIDAD MATEMÁTICA (Safe Mount Observer)
   * Evita el 'RangeError: Maximum call stack size exceeded' de Mapbox v3.
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
   * CONFIGURACIÓN DE CÁMARA "GO-EXPERIENCE"
   */
  const [viewState, setViewState] = useState({
    latitude: geoEngine.userLocation?.latitude || 40.4167,
    longitude: geoEngine.userLocation?.longitude || -3.7037,
    zoom: mode === 'FORGE' ? 18.5 : 16.5,
    pitch: 75,
    bearing: -12,
  });

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
   * PROTOCOLOS DE VUELO TÁCTICO
   */
  const flyToPosition = useCallback((lng: number, lat: number, zoomLevel = 17) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: zoomLevel,
        ...FLY_CONFIG
      });
    }
  }, []);

  const handleSearchResult = useCallback((results: SearchResult[] | null) => {
    if (results && results.length > 0) {
      const topHit = results[0];
      if (topHit.metadata?.lat && topHit.metadata?.lng) {
        flyToPosition(topHit.metadata.lng, topHit.metadata.lat, 17);
      }
    }
  }, [flyToPosition]);

  /**
   * ATMÓSFERA SOBERANA (Fotorrealismo)
   */
  const fogConfig = useMemo(() => ({
    "range": [0.5, 12],
    "color": "#020202",
    "horizon-blend": 0.1,
    "high-color": "#0f172a",
    "space-color": "#000000",
    "star-intensity": 0.4
  }), []);

  /**
   * CAPA ARQUITECTÓNICA 3D CRISTALINA
   */
  const buildingLayerConfig = useMemo(() => ({
    id: "3d-buildings",
    source: "composite",
    "source-layer": "building",
    filter: ["==", "extrude", "true"],
    type: "fill-extrusion",
    minzoom: 14,
    paint: {
      "fill-extrusion-color": "#0a0a0a",
      "fill-extrusion-height": ["get", "height"],
      "fill-extrusion-base": ["get", "min_height"],
      "fill-extrusion-opacity": 0.65,
    },
  }), []);

  // --- MANEJADORES DE EVENTOS SOBERANOS ---

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
    flyToPosition(lngLat[0], lngLat[1], 19);
  }, [mode, onManualAnchor, flyToPosition]);

  // Data Mapper para curar contratos
  const mappedSelectedPOI = useMemo(() => {
    if (!selectedPOIId || !geoEngine.nearbyPOIs) return null;

    const rawPoi = geoEngine.nearbyPOIs.find(p => p.id.toString() === selectedPOIId);
    if (!rawPoi) return null;

    return {
      id: rawPoi.id.toString(),
      name: rawPoi.name,
      category: rawPoi.category_id,
      historical_fact: rawPoi.historical_fact || undefined,
      cover_image_url: rawPoi.gallery_urls?.[0] || undefined
    };
  }, [selectedPOIId, geoEngine.nearbyPOIs]);

  return (
    <div ref={containerRef} className={cn("w-full h-full relative bg-[#010101]", className)}>

      {mode === 'EXPLORE' && (
        <div className="absolute top-6 left-4 right-4 z-[100] md:top-8 md:left-8 md:w-[400px]">
          <UnifiedSearchBar
            variant="console"
            placeholder="Rastrear ecos urbanos..."
            latitude={viewState.latitude}
            longitude={viewState.longitude}
            onResults={handleSearchResult}
            onLoading={setIsSearchLoading}
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
          onLoad={() => setIsMapLoaded(true)}
          mapboxAccessToken={MAPBOX_TOKEN}

          mapStyle={PHOTOREALISTIC_STYLE}

          // [FIX MATEMÁTICO]: Proyección Mercator para aniquilar el bucle infinito
          projection="mercator"
          terrain={{ source: 'mapbox-dem', exaggeration: 1.2 }}
          fog={fogConfig as any}
          antialias={true}
          reuseMaps={true}

          // [FIX CRÍTICO]: Límite de 80 grados
          maxPitch={80}
          attributionControl={false}
        >

          {geoEngine.userLocation && (
            <UserLocationMarker
              location={geoEngine.userLocation}
              isResonating={!!geoEngine.activePOI?.isWithinRadius}
            />
          )}

          {geoEngine.nearbyPOIs?.map((poi: PointOfInterest) => (
            <MapMarkerCustom
              key={poi.id}
              id={poi.id.toString()}
              latitude={poi.geo_location.coordinates[1]}
              longitude={poi.geo_location.coordinates[0]}
              category_id={poi.category_id}
              name={poi.name}
              isResonating={geoEngine.activePOI?.id === poi.id.toString() && geoEngine.activePOI?.isWithinRadius}
              isSelected={selectedPOIId === poi.id.toString()}
              onClick={(id) => {
                if (mode === 'EXPLORE') {
                  setSelectedPOIId(id);
                  const p = geoEngine.nearbyPOIs.find(item => item.id.toString() === id);
                  if (p) flyToPosition(p.geo_location.coordinates[0], p.geo_location.coordinates[1], 17);
                }
              }}
            />
          ))}

          {isMapLoaded && (
            <Layer {...buildingLayerConfig as any} />
          )}

          <div className="absolute bottom-10 right-4 flex flex-col gap-4 z-40">
            <NavigationControl showCompass={false} className="!bg-black/60 !backdrop-blur-xl !border-white/10 !rounded-2xl" />
            <GeolocateControl
              positionOptions={{ enableHighAccuracy: true }}
              trackUserLocation={mode === 'FORGE'}
              className="!bg-black/60 !backdrop-blur-xl !border-white/10 !rounded-2xl"
            />
          </div>
        </Map>
      )}

      <AnimatePresence>
        {mappedSelectedPOI && mode === 'EXPLORE' && (
          <POIPreviewCard
            poi={mappedSelectedPOI}
            distance={geoEngine.activePOI?.id === selectedPOIId ? geoEngine.activePOI?.distance : null}
            isResonating={selectedPOIId === geoEngine.activePOI?.id && geoEngine.activePOI?.isWithinRadius}
            onClose={() => setSelectedPOIId(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}