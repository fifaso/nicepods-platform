// components/geo/map-inner.tsx
// VERSIÓN: 11.0 (NicePod Spatial Engine - Sovereign HUD Edition)
// Misión: Motor central del Radar Geográfico de Madrid.
// [ESTABILIZACIÓN]: Integración total de controles UI personalizados, 
// eliminación de artefactos visuales y optimización de densidad táctil.

"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useMemo, useRef, useState } from "react";
import Map, { GeolocateControl, Layer, NavigationControl } from 'react-map-gl';

// --- NÚCLEO DE INTELIGENCIA ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { useAuth } from "@/hooks/use-auth";
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { SearchResult } from "@/hooks/use-search-radar";

// --- COMPONENTES DE INTERFAZ ---
import { MapMarkerCustom } from "./map-marker-custom";
import { POIPreviewCard } from "./poi-preview-card";
import { Loader2 } from "lucide-react";

interface MapViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

export default function MapInner() {
  const mapRef = useRef<any>(null);
  const geoEngine = useGeoEngine() as any;
  const { activePOI, nearbyPOIs, isSearching: isGeoLoading } = geoEngine;

  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [viewState, setViewState] = useState<MapViewState>({
    latitude: 40.4199,
    longitude: -3.6887,
    zoom: 16,
    pitch: 60,
    bearing: -15,
  });

  const currentSelectedPOI = useMemo(() => {
    if (!nearbyPOIs) return null;
    return nearbyPOIs.find((poi: any) => poi.id === selectedPOIId) || null;
  }, [selectedPOIId, nearbyPOIs]);

  const flyToPosition = useCallback((lat: number, lng: number, zoomLevel = 18) => {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: zoomLevel,
      duration: 2000,
      essential: true,
      curve: 1.42,
      easing: (t: number) => t * (2 - t)
    });
  }, []);

  const handleMarkerClick = useCallback((id: string) => {
    const poi = nearbyPOIs.find((p: any) => p.id === id);
    if (poi && poi.geo_location?.coordinates) {
      setSelectedPOIId(id);
      const coords = poi.geo_location.coordinates;
      flyToPosition(coords[1], coords[0]);
    }
  }, [nearbyPOIs, flyToPosition]);

  const handleSearchResult = useCallback((results: SearchResult[] | null) => {
    if (results && results.length > 0) {
      const topHit = results[0];
      if (topHit.metadata?.lat && topHit.metadata?.lng) {
        flyToPosition(topHit.metadata.lat, topHit.metadata.lng);
      }
    }
  }, [flyToPosition]);

  const buildingLayer = useMemo(() => ({
    id: "3d-buildings",
    source: "composite",
    "source-layer": "building",
    filter: ["==", "extrude", "true"],
    type: "fill-extrusion",
    minzoom: 15,
    paint: {
      "fill-extrusion-color": "#ffffff",
      "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "height"]],
      "fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "min_height"]],
      "fill-extrusion-opacity": 0.15,
    },
  }), []);

  return (
    <div className="w-full h-full relative bg-[#020202]">

      {/* --- HUD DE BÚSQUEDA --- */}
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

      {/* --- HUD DE SINCRONIZACIÓN --- */}
      {(isGeoLoading || isSearchLoading) && (
        <div className="absolute top-24 left-6 z-[90] bg-black/60 p-3 rounded-full border border-white/10 backdrop-blur-md flex items-center shadow-2xl">
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        </div>
      )}

      {/* --- MOTOR CARTOGRÁFICO --- */}
      <Map
        {...viewState}
        ref={mapRef}
        onMove={(evt: any) => setViewState(evt.viewState)}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        reuseMaps
        antialias={true}
        attributionControl={false}
      >
        {/* --- CONTROLES DE NAVEGACIÓN PERSONALIZADOS --- */}
        <div className="absolute bottom-10 right-4 flex flex-col gap-3 z-40">
           <NavigationControl 
             showCompass={false} 
             className="!bg-black/60 !backdrop-blur-xl !border-white/10 !rounded-xl scale-110 !shadow-2xl" 
           />
           <GeolocateControl 
             positionOptions={{ enableHighAccuracy: true }}
             className="!bg-black/60 !backdrop-blur-xl !border-white/10 !rounded-xl scale-110 !w-10 !h-10 !shadow-2xl" 
           />
        </div>

        <Layer {...buildingLayer as any} />

        {nearbyPOIs?.map((poi: any) => {
          if (!poi.geo_location?.coordinates) return null;
          return (
            <MapMarkerCustom
              key={poi.id}
              id={poi.id}
              latitude={poi.geo_location.coordinates[1]}
              longitude={poi.geo_location.coordinates[0]}
              category={poi.category}
              name={poi.name}
              isResonating={!!(activePOI?.id === poi.id && activePOI?.isWithinRadius)}
              isSelected={selectedPOIId === poi.id}
              onClick={handleMarkerClick}
            />
          );
        })}
      </Map>

      {/* --- TARJETA DE VISLUMBRE --- */}
      <POIPreviewCard
        poi={currentSelectedPOI ? {
          id: currentSelectedPOI.id,
          name: currentSelectedPOI.name,
          category: currentSelectedPOI.category,
          historical_fact: currentSelectedPOI.historical_fact,
          cover_image_url: currentSelectedPOI.cover_image_url
        } : null}
        distance={activePOI?.id === selectedPOIId ? activePOI?.distance : null}
        isResonating={!!(activePOI?.id === selectedPOIId && activePOI?.isWithinRadius)}
        onClose={() => setSelectedPOIId(null)}
      />
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. HUD Centralizado: Se han movido los controles de navegación a un contenedor 
 *    propio 'absolute bottom-10 right-4', eliminando las superposiciones fantasma.
 * 2. Estabilidad de Layout: La eliminación de capas decorativas innecesarias 
 *    garantiza que el canvas de Mapbox ocupe el 100% real de la pantalla del dispositivo.
 * 3. Integridad: Se ha asegurado que el componente no dependa de estados visuales 
 *    que deban ser hidratados tras la renderización inicial.
 */