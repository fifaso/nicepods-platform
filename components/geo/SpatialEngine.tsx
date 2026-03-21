// components/geo/SpatialEngine.tsx
// VERSIÓN: 6.2 (NicePod GO-Engine - Photorealistic & Sovereign Shield Edition)
// Misión: Renderizado 3D inmersivo, fotorrealista y blindado contra errores de tipos.
// [ESTABILIZACIÓN]: Resolución de ts(2709) y ts(2304) mediante Contratos Locales y Restauración de Estados.

"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

// --- MOTOR CARTOGRÁFICO (SUB-PATH EXPLÍCITO PARA VERCEL) ---
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
 * I. [BUILD SHIELD]: CONTRATOS LOCALES ESTRICTOS
 * ---------------------------------------------------------------------------
 * Erradicamos ts(2709) definiendo las interfaces localmente. 
 * Esto nos hace inmunes a la inestabilidad de tipos de react-map-gl v8.
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

// Extracción del tipo de instancia para el MapRef
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
  duration: 2000,
  essential: true,
  curve: 1.42,
  easing: (t: number) => t * (2 - t)
};

/**
 * SpatialEngine: El motor visual fotorrealista de NicePod.
 */
export function SpatialEngine({ mode, onManualAnchor, className }: SpatialEngineProps) {

  // 1. REFERENCIAS DE HARDWARE Y CONTEXTOS
  const mapRef = useRef<MapRefInstance>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const geoEngine = useGeoEngine();

  // 2. ESTADOS DE INTERACCIÓN Y CARGA
  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);

  // [FIX ts(2304)]: Restauración del estado de carga para el Radar
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);

  /**
   * PROTOCOLO DE SEGURIDAD MATEMÁTICA (Safe Mount)
   * Asegura que el mapa solo se inicialice cuando el contenedor tiene dimensiones.
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
    zoom: mode === 'FORGE' ? 18.5 : 15.8,
    pitch: mode === 'FORGE' ? 0 : 70,
    bearing: mode === 'FORGE' ? 0 : -15,
  });

  // Sincronía T0 con el GPS del Voyager
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
   * PROTOCOLOS DE VUELO (CÁMARA TÁCTICA)
   */
  const flyToPosition = useCallback((lng: number, lat: number, zoomLevel = 17) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: zoomLevel,
        ...FLY_CONFIG,
        pitch: mode === 'EXPLORE' ? 70 : 0
      });
    }
  }, [mode]);

  const handleSearchResult = useCallback((results: SearchResult[] | null) => {
    if (results && results.length > 0) {
      const topHit = results[0];
      if (topHit.metadata?.lat && topHit.metadata?.lng) {
        flyToPosition(topHit.metadata.lng, topHit.metadata.lat, 17);
      }
    }
  }, [flyToPosition]);

  /**
   * ATMÓSFERA SOBERANA
   */
  const fogConfig = useMemo(() => ({
    "range": [0.5, 10],
    "color": "#020202",
    "horizon-blend": 0.2,
    "high-color": "#1e293b",
    "space-color": "#000000",
    "star-intensity": 0.4
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
      "fill-extrusion-opacity": 0.7,
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

  /**
   * [PROTOCOLO DE SILENCIO URBANO]
   */
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
    if (!selectedPOIId || !geoEngine.nearbyPOIs || geoEngine.nearbyPOIs.length === 0) return null;

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

      {/* HUD DE BÚSQUEDA SOBERANA */}
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
          onLoad={onMapLoad}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle={mode === 'FORGE' ? PHOTOREALISTIC_STYLE : DARK_IMMERSIVE_STYLE}

          // [SHIELD]: Prevención de colapso de matrices
          projection="mercator"
          terrain={mode === 'EXPLORE' ? { source: 'mapbox-dem', exaggeration: 1.2 } : undefined}
          fog={mode === 'EXPLORE' ? fogConfig as any : undefined}

          antialias={true}
          reuseMaps={true}
          maxPitch={80}
          attributionControl={false}
        >

          <GeolocateControl showUserLocation={false} className="hidden" />

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
            distance={geoEngine.activePOI?.id === selectedPOIId ? geoEngine.activePOI?.distance : null}
            isResonating={selectedPOIId === geoEngine.activePOI?.id && geoEngine.activePOI?.isWithinRadius}
            onClose={() => setSelectedPOIId(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}