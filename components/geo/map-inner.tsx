// components/geo/map-inner.tsx
// VERSIÓN: 9.1 (NicePod Spatial Engine - Minimalist Inversion)
// Misión: Motor central del Radar Geográfico de Madrid en modo Inmersión Total.
// [ESTABILIZACIÓN]: Poda de HUDs decorativos y optimización de foco visual.

"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useMemo, useRef, useState } from "react";
import Map, { GeolocateControl, Layer } from 'react-map-gl';

// --- NÚCLEO DE INTELIGENCIA ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { useAuth } from "@/hooks/use-auth";
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { SearchResult } from "@/hooks/use-search-radar";

// --- COMPONENTES DE INTERFAZ ---
import { MapMarkerCustom } from "./map-marker-custom";
import { POIPreviewCard } from "./poi-preview-card";
import { Loader2 } from "lucide-react";

/**
 * COMPONENTE: MapInner
 * El lienzo cartográfico soberano.
 */
export default function MapInner() {
  const mapRef = useRef<any>(null);
  const geoEngine = useGeoEngine() as any;
  const { activePOI, nearbyPOIs, isSearching: isGeoLoading } = geoEngine;

  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [viewState, setViewState] = useState({
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

      {/* HUD DE BÚSQUEDA: Rediseñado para visibilidad táctil absoluta */}
      <div className="absolute top-6 left-4 right-4 md:top-8 md:left-8 z-[100] w-auto">
        <UnifiedSearchBar
          variant="console"
          placeholder="Rastrear ecos urbanos..."
          latitude={viewState.latitude}
          longitude={viewState.longitude}
          onResults={handleSearchResult}
          onLoading={setIsSearchLoading}
          className="shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
        />
      </div>

      {/* INDICADOR DE SINCRONIZACIÓN */}
      {(isGeoLoading || isSearchLoading) && (
        <div className="absolute top-24 left-6 z-50 bg-black/60 p-3 rounded-full border border-white/10 backdrop-blur-md flex items-center gap-3 shadow-2xl">
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        </div>
      )}

      {/* MOTOR CARTOGRÁFICO */}
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
        <GeolocateControl position="bottom-right" />
        <Layer {...buildingLayer as any} />

        {nearbyPOIs && nearbyPOIs.map((poi: any) => {
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

      {/* TARJETA DE VISLUMBRE */}
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