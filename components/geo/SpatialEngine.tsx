// components/geo/SpatialEngine.tsx
// VERSIÓN: 6.1 (NicePod GO-Engine - The Immersive Calibration)
// Misión: Silenciar el ruido comercial y aplicar segregación visual estricta (Explore vs Forge).

"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";

import Map, { 
  Layer, 
  NavigationControl, 
  GeolocateControl 
} from 'react-map-gl/mapbox';

import type { MapRef, ViewStateChangeEvent, MapLayerMouseEvent } from 'react-map-gl';
import { AnimatePresence } from "framer-motion";

import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn } from "@/lib/utils";
import { PointOfInterest } from "@/types/geo-sovereignty";

import { MapMarkerCustom } from "./map-marker-custom";
import { UserLocationMarker } from "./user-location-marker";
import { POIPreviewCard } from "./poi-preview-card";
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { SearchResult } from "@/hooks/use-search-radar";

interface SpatialEngineProps {
  mode: 'EXPLORE' | 'FORGE';
  onManualAnchor?: (lngLat: [number, number]) => void;
  className?: string;
}

type MapRefInstance = React.ElementRef<typeof Map>;
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export function SpatialEngine({ mode, onManualAnchor, className }: SpatialEngineProps) {
  
  const mapRef = useRef<MapRefInstance>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const geoEngine = useGeoEngine();

  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);

  // Safe Mount Observer
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
   * CÁMARA SEGREGADA: 
   * Forge = Alta precisión cenital. Explore = Inmersión profunda.
   */
  const [viewState, setViewState] = useState({
    latitude: geoEngine.userLocation?.latitude || 40.4167,
    longitude: geoEngine.userLocation?.longitude || -3.7037,
    zoom: mode === 'FORGE' ? 18.5 : 15.8,
    pitch: mode === 'FORGE' ? 0 : 70, // EXPLORE fuerza la mirada al frente
    bearing: mode === 'FORGE' ? 0 : -15,
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

  const flyToPosition = useCallback((lng: number, lat: number, zoomLevel = 17) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: zoomLevel,
        duration: 2000,
        essential: true,
        pitch: mode === 'EXPLORE' ? 70 : 0 // Mantiene la inmersión tras volar
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

  // ATMÓSFERA SOBERANA
  const fogConfig = useMemo(() => ({
    "range": [0.5, 10],
    "color": "#020202",
    "horizon-blend": 0.2,
    "high-color": "#1e293b",
    "space-color": "#000000",
    "star-intensity": 0.4
  }), []);

  /**
   * CAPA ARQUITECTÓNICA: Edificios de "Cristal de Obsidiana"
   * Solo se activan en modo EXPLORE.
   */
  const buildingLayerConfig = useMemo(() => ({
    id: "3d-buildings",
    source: "composite",
    "source-layer": "building",
    filter: ["==", "extrude", "true"],
    type: "fill-extrusion",
    minzoom: 14,
    paint: {
      "fill-extrusion-color": "#050505", // Negro abismal
      "fill-extrusion-height": ["get", "height"],
      "fill-extrusion-base": ["get", "min_height"],
      "fill-extrusion-opacity": 0.7, // Translúcido para ver los Ecos a través
    },
  }), []);

  const handleMove = useCallback((event: ViewStateChangeEvent) => {
    setViewState(event.viewState);
  }, []);

  const handleMapClick = useCallback((event: MapLayerMouseEvent) => {
    if (mode !== 'FORGE' || !onManualAnchor) return;
    const lngLat: [number, number] = [event.lngLat.lng, event.lngLat.lat];
    if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate([10, 30, 10]);
    onManualAnchor(lngLat);
  }, [mode, onManualAnchor]);

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

  /**
   * [PROTOCOLO DE SILENCIO]: Evento 'onLoad' para purgar el mapa
   * Elimina todas las etiquetas genéricas (tiendas, hoteles, transporte).
   */
  const onMapLoad = useCallback((e: any) => {
    setIsMapLoaded(true);
    const map = e.target;
    
    // Si estamos en modo EXPLORE, apagamos el ruido de la ciudad.
    if (mode === 'EXPLORE') {
      const layers = map.getStyle().layers;
      layers.forEach((layer: any) => {
        // Apuntamos a las capas de texto (símbolos) de Mapbox
        if (layer.type === 'symbol' && layer.id.includes('poi')) {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
        if (layer.type === 'symbol' && layer.id.includes('transit')) {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      });
    }
  }, [mode]);

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
          onLoad={onMapLoad}
          mapboxAccessToken={MAPBOX_TOKEN}
          
          // ESTILO SEGREGADO: Satélite para precisión (Admin), Dark para inmersión (Voyager)
          mapStyle={mode === 'FORGE' ? "mapbox://styles/mapbox/satellite-streets-v12" : "mapbox://styles/mapbox/dark-v11"}
          
          projection="mercator" 
          
          // El terreno 3D solo se activa en EXPLORE para evitar fallos de Z-fighting con el satélite
          terrain={mode === 'EXPLORE' ? { source: 'mapbox-dem', exaggeration: 1.2 } : undefined}
          
          fog={mode === 'EXPLORE' ? fogConfig as any : undefined}
          antialias={true}
          reuseMaps={true}
          
          // Restricciones de cámara según modo
          minPitch={mode === 'EXPLORE' ? 45 : 0}
          maxPitch={80} 
          attributionControl={false}
        >
          
          {/* El punto azul nativo de Mapbox SE APAGA para usar nuestro Avatar */}
          <GeolocateControl 
            positionOptions={{ enableHighAccuracy: true }} 
            trackUserLocation={true} 
            showUserLocation={false} // OCULTA EL PUNTO AZUL GENÉRICO
            className="hidden" 
          />

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

          {/* Renderizado Arquitectónico Condicional */}
          {isMapLoaded && mode === 'EXPLORE' && (
            <Layer {...buildingLayerConfig as any} />
          )}

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