// components/geo/map-inner.tsx
// VERSIÓN: 8.1

"use client";

import React, { useCallback, useRef, useState, useMemo } from "react";
import Map, { 
  GeolocateControl, 
  Layer, 
  NavigationControl
} from 'react-map-gl';
// [FIX TS2709]: Importación de tipos explícita
import type { MapRef, ViewStateChangeEvent } from 'react-map-gl'; 
import "mapbox-gl/dist/mapbox-gl.css";

import { useAuth } from "@/hooks/use-auth";
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { MapMarkerCustom } from "./map-marker-custom";
import { POIPreviewCard } from "./poi-preview-card";
import { Loader2, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MapInner() {
  const { supabase } = useAuth();
  // [FIX]: Aplicamos el tipo correcto a la referencia del mapa
  const mapRef = useRef<MapRef>(null);

  const { 
    activePOI, 
    nearbyPOIs, 
    isSearching: isGeoLoading 
  } = useGeoEngine();

  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);

  const [viewState, setViewState] = useState({
    latitude: 40.4167,
    longitude: -3.7037,
    zoom: 16,
    pitch: 60,
    bearing: -15,
  });

  const currentSelectedPOI = useMemo(() => {
    return nearbyPOIs.find(p => p.id === selectedPOIId) || null;
  }, [selectedPOIId, nearbyPOIs]);

  // [FIX TS7006]: Tipado explícito para el parámetro 't'
  const flyToPosition = useCallback((lat: number, lng: number, zoom = 18) => {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: zoom,
      duration: 3000,
      essential: true,
      curve: 1.42,
      easing: (t: number) => t * (2 - t)
    });
  }, []);

  const handleMarkerClick = useCallback((id: string) => {
    const poi = nearbyPOIs.find(p => p.id === id);
    if (poi) {
      setSelectedPOIId(id);
      const coords = poi.geo_location.coordinates;
      flyToPosition(coords[1], coords[0]);
    }
  }, [nearbyPOIs, flyToPosition]);

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
      "fill-extrusion-opacity": 0.20,
    },
  }), []);

  return (
    <div className="w-full h-full relative bg-[#020202]">
      <div className="absolute top-6 left-6 z-[100] w-full max-w-md">
        <UnifiedSearchBar 
          variant="console"
          latitude={viewState.latitude}
          longitude={viewState.longitude}
          onResults={(res) => {
            if (res.length > 0 && res[0].metadata?.lat) {
              flyToPosition(res[0].metadata.lat, res[0].metadata.lng!);
            }
          }}
          onLoading={setIsSearchLoading}
        />
      </div>

      {(isGeoLoading || isSearchLoading) && (
        <div className="absolute top-24 left-6 z-50 bg-black/60 p-3 rounded-full border border-white/5 backdrop-blur-md flex items-center gap-3 shadow-2xl">
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
          <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Sincronizando Malla</span>
        </div>
      )}

      <Map
        {...viewState}
        ref={mapRef}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        reuseMaps
        antialias={true}
        attributionControl={false}
      >
        <GeolocateControl position="top-right" className="mr-4 mt-4" />
        <NavigationControl position="top-right" showCompass={false} className="mr-4" />
        <Layer {...buildingLayer as any} />

        {nearbyPOIs.map((poi) => (
          <MapMarkerCustom 
            key={poi.id}
            id={poi.id}
            latitude={poi.geo_location.coordinates[1]}
            longitude={poi.geo_location.coordinates[0]}
            category={poi.category}
            name={poi.name}
            isResonating={activePOI?.id === poi.id && activePOI?.isWithinRadius}
            isSelected={selectedPOIId === poi.id}
            onClick={handleMarkerClick}
          />
        ))}
      </Map>

      <POIPreviewCard 
        poi={currentSelectedPOI}
        distance={activePOI?.id === selectedPOIId ? activePOI?.distance : null}
        isResonating={activePOI?.id === selectedPOIId && activePOI?.isWithinRadius}
        onClose={() => setSelectedPOIId(null)}
      />
    </div>
  );
}