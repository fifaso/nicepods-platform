// components/geo/map-inner.tsx
// VERSIÓN: 8.0

"use client";

import React, { useCallback, useRef, useState, useMemo, useEffect } from "react";
import Map, { 
  GeolocateControl, 
  Layer, 
  NavigationControl,
  MapRef,
  ViewStateChangeEvent
} from 'react-map-gl';
import "mapbox-gl/dist/mapbox-gl.css";

// --- NÚCLEO DE INTELIGENCIA Y SOBERANÍA ---
import { useAuth } from "@/hooks/use-auth";
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { SearchResult } from "@/hooks/use-search-radar";

// --- COMPONENTES DE INTERFAZ DE LUJO ---
import { MapMarkerCustom } from "./map-marker-custom";
import { POIPreviewCard } from "./poi-preview-card";

// --- ICONOGRAFÍA Y UTILIDADES ---
import { Loader2, Navigation2, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * INTERFAZ: MapViewState
 * Controla la cinemática de la cámara en el espacio 3D.
 */
interface MapViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

/**
 * COMPONENTE: MapInner
 * El motor central del Spatial Hub de NicePod V2.5.
 */
export default function MapInner() {
  const { supabase } = useAuth();
  const mapRef = useRef<MapRef>(null);

  // --- I. CONSUMO DEL MOTOR GEOESPACIAL (V2.0) ---
  // El GeoEngine gestiona la posición del usuario y la resonancia con los POIs.
  const { 
    userLocation, 
    activePOI, 
    nearbyPOIs, 
    isSearching: isGeoLoading,
    error: geoError 
  } = useGeoEngine();

  // --- II. ESTADOS DE INTERFAZ Y CÁMARA ---
  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);

  const [viewState, setViewState] = useState<MapViewState>({
    latitude: 40.4167,
    longitude: -3.7037,
    zoom: 16,
    pitch: 60,
    bearing: -15,
  });

  /**
   * currentSelectedPOI:
   * Localiza el objeto completo del POI seleccionado para alimentar la Peek Card.
   */
  const currentSelectedPOI = useMemo(() => {
    return nearbyPOIs.find(p => p.id === selectedPOIId) || null;
  }, [selectedPOIId, nearbyPOIs]);

  /**
   * flyToPosition:
   * Ejecuta una transición cinemática de cámara hacia coordenadas específicas.
   */
  const flyToPosition = useCallback((lat: number, lng: number, zoom = 18) => {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: zoom,
      duration: 3000,
      essential: true,
      curve: 1.42,
      easing: (t) => t * (2 - t) // EaseOutQuad
    });
  }, []);

  /**
   * handleMarkerClick:
   * Al pulsar un marcador, centramos la cámara y activamos la previsualización.
   */
  const handleMarkerClick = useCallback((id: string) => {
    const poi = nearbyPOIs.find(p => p.id === id);
    if (poi) {
      setSelectedPOIId(id);
      const coords = poi.geo_location.coordinates;
      flyToPosition(coords[1], coords[0]);
    }
  }, [nearbyPOIs, flyToPosition]);

  /**
   * handleSearchResult:
   * Misión: Navegar hacia los hallazgos del radar semántico.
   */
  const handleSearchResult = (results: SearchResult[]) => {
    if (results.length > 0) {
      const firstResult = results[0];
      if (firstResult.metadata?.lat && firstResult.metadata?.lng) {
        flyToPosition(firstResult.metadata.lat, firstResult.metadata.lng);
      }
    }
  };

  /**
   * buildingLayer:
   * Configuración de la extrusión 3D de edificios.
   * [SUTILEZA]: Opacidad reducida al 20% para no ocluir la imagen satelital.
   */
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

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  return (
    <div className="w-full h-full relative group selection:bg-primary/20 bg-[#020202]">
      
      {/* 
          III. TERMINAL DE RADAR UNIFICADO (HUD) 
          Inyectamos el radar directamente sobre el mapa.
      */}
      <div className="absolute top-6 left-6 z-[100] w-full max-w-sm md:max-w-md animate-in slide-in-from-left-6 duration-1000">
        <UnifiedSearchBar 
          variant="console"
          placeholder="Rastrear sabiduría urbana..."
          latitude={viewState.latitude}
          longitude={viewState.longitude}
          onResults={handleSearchResult}
          onLoading={setIsSearchLoading}
          className="shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
        />
      </div>

      {/* INDICADOR DE TELEMETRÍA (LOADER) */}
      {(isGeoLoading || isSearchLoading) && (
        <div className="absolute top-24 left-6 z-50 bg-black/60 p-3 rounded-full border border-white/5 backdrop-blur-md flex items-center gap-3 shadow-2xl">
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
          <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Sincronizando Malla</span>
        </div>
      )}

      {/* IV. MOTOR MAPBOX (REALIDAD SATELITAL) */}
      <Map
        {...viewState}
        ref={mapRef}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        reuseMaps
        antialias={true}
        attributionControl={false}
      >
        <GeolocateControl position="top-right" trackUserLocation showUserHeading className="mr-4 mt-4" />
        <NavigationControl position="top-right" showCompass={false} className="mr-4" />

        <Layer {...buildingLayer as any} />

        {/* 
            V. RENDERIZADO DE MARCADORES SOBERANOS 
            Consumimos la lista de POIs del GeoEngine.
        */}
        {nearbyPOIs.map((poi) => {
          const lat = poi.geo_location.coordinates[1];
          const lng = poi.geo_location.coordinates[0];
          
          return (
            <MapMarkerCustom 
              key={poi.id}
              id={poi.id}
              latitude={lat}
              longitude={lng}
              category={poi.category}
              name={poi.name}
              // [SINCRO]: El marcador brilla si el GeoEngine detecta resonancia
              isResonating={activePOI?.id === poi.id && activePOI.isWithinRadius}
              isSelected={selectedPOIId === poi.id}
              onClick={handleMarkerClick}
            />
          );
        })}
      </Map>

      {/* 
          VI. LA TARJETA DE VISLUMBRE (PEEK CARD) 
          Reemplaza al Popup nativo para una experiencia de lujo.
      */}
      <POIPreviewCard 
        poi={currentSelectedPOI ? {
          id: currentSelectedPOI.id,
          name: currentSelectedPOI.name,
          category: currentSelectedPOI.category,
          historical_fact: currentSelectedPOI.historical_fact,
          cover_image_url: currentSelectedPOI.cover_image_url
        } : null}
        // Calculamos distancia en tiempo real basándose en el GPS
        distance={activePOI?.id === selectedPOIId ? activePOI.distance : null}
        isResonating={activePOI?.id === selectedPOIId && activePOI.isWithinRadius}
        onClose={() => setSelectedPOIId(null)}
      />

      {/* VII. OVERLAY DE ATMÓSFERA Y TELEMETRÍA */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none z-10" />
      
      <div className="absolute bottom-10 left-12 z-20 flex items-center gap-5 opacity-40 group-hover:opacity-100 transition-opacity duration-1000">
        <div className="p-3 bg-primary/20 rounded-full border border-primary/40 shadow-inner">
            <Activity size={18} className="text-primary animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Madrid Resonance</span>
          <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">Terminal Sincronizada V2.5</span>
        </div>
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Unificación de Datos: Al usar 'useGeoEngine', el mapa deja de realizar peticiones 
 *    propias. Ahora es una vista 'espectadora' de la lógica central del hook, 
 *    garantizando que no existan desincronías entre la posición y los marcadores.
 * 2. UX de Lujo: La sustitución del Popup por 'POIPreviewCard' eleva la calidad 
 *    percibida al nivel de una aplicación nativa, permitiendo una transición 
 *    suave hacia la página de inmersión profunda.
 * 3. Gestión de Z-Index: El radar HUD se mantiene en 'z-100' para asegurar 
 *    que los marcadores (z-10) y la Peek Card (z-80) fluyan por debajo de 
 *    la terminal de búsqueda global.
 */