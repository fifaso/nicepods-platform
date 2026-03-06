// components/geo/map-inner.tsx
// VERSIÓN: 9.0 (NicePod Spatial Engine - Unified Sovereign Edition)
// Misión: Motor central del Radar Geográfico de Madrid.
// [ESTABILIZACIÓN]: Sincronía con Radar V4.5 y tipado estricto de resultados nulos.

"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useMemo, useRef, useState } from "react";
import Map, {
  GeolocateControl,
  Layer,
  NavigationControl
} from 'react-map-gl';

// --- NÚCLEO DE INTELIGENCIA Y SOBERANÍA ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { useAuth } from "@/hooks/use-auth";
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { SearchResult } from "@/hooks/use-search-radar";

// --- COMPONENTES DE INTERFAZ DE ALTA FIDELIDAD ---
import { MapMarkerCustom } from "./map-marker-custom";
import { POIPreviewCard } from "./poi-preview-card";

// --- ICONOGRAFÍA Y UTILIDADES ---
import { Activity, Loader2 } from "lucide-react";

/**
 * INTERFAZ: MapViewState
 * Define la cinemática de la cámara en el espacio 3D de Madrid.
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
 * El epicentro visual del Spatial Hub NicePod V2.5.
 */
export default function MapInner() {
  const { supabase } = useAuth();

  /**
   * [FIX]: Referencia de Mapa protegida para evitar colisiones de tipos
   * con los Namespaces de Mapbox en el despliegue de Vercel.
   */
  const mapRef = useRef<any>(null);

  /**
   * I. MOTOR GEOESPACIAL (Engine Sync)
   */
  const geoEngine = useGeoEngine() as any;
  const {
    activePOI,
    nearbyPOIs,
    isSearching: isGeoLoading
  } = geoEngine;

  // --- II. ESTADOS DE INTERFAZ Y TELEMETRÍA ---
  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);

  // Coordenadas Iniciales: Puerta de Alcalá (Centro de Resonancia).
  const [viewState, setViewState] = useState<MapViewState>({
    latitude: 40.4199,
    longitude: -3.6887,
    zoom: 16,
    pitch: 60,
    bearing: -15,
  });

  /**
   * currentSelectedPOI:
   * Localiza el nodo completo para alimentar la Peek Card.
   */
  const currentSelectedPOI = useMemo(() => {
    if (!nearbyPOIs) return null;
    return nearbyPOIs.find((poi: any) => poi.id === selectedPOIId) || null;
  }, [selectedPOIId, nearbyPOIs]);

  /**
   * flyToPosition:
   * Ejecuta transiciones cinemáticas hacia coordenadas de sabiduría.
   */
  const flyToPosition = useCallback((lat: number, lng: number, zoomLevel = 18) => {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: zoomLevel,
      duration: 3000,
      essential: true,
      curve: 1.42,
      easing: (t: number) => t * (2 - t)
    });
  }, []);

  /**
   * handleMarkerClick:
   * Sintonización manual de la cámara sobre un marcador activo.
   */
  const handleMarkerClick = useCallback((id: string) => {
    const poi = nearbyPOIs.find((p: any) => p.id === id);
    if (poi && poi.geo_location?.coordinates) {
      setSelectedPOIId(id);
      const coords = poi.geo_location.coordinates;
      flyToPosition(coords[1], coords[0]);
    }
  }, [nearbyPOIs, flyToPosition]);

  /**
   * [FIX CRÍTICO]: handleSearchResult
   * Ahora soporta 'SearchResult[] | null' para alinearse con UnifiedSearchBar V4.5.
   */
  const handleSearchResult = useCallback((results: SearchResult[] | null) => {
    if (results && results.length > 0) {
      const topHit = results[0];
      if (topHit.metadata?.lat && topHit.metadata?.lng) {
        flyToPosition(topHit.metadata.lat, topHit.metadata.lng);
      }
    }
  }, [flyToPosition]);

  /**
   * buildingLayer:
   * Configuración de la capa de extrusión 3D (Grado Industrial).
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

  return (
    <div className="w-full h-full relative group selection:bg-primary/20 bg-[#020202]">

      {/* III. TERMINAL DE RADAR UNIFICADO (HUD) */}
      <div className="absolute top-6 left-6 z-[100] w-full max-w-sm md:max-w-md animate-in slide-in-from-left-6 duration-1000">
        <UnifiedSearchBar
          variant="console"
          placeholder="Rastrear ecos urbanos..."
          latitude={viewState.latitude}
          longitude={viewState.longitude}
          onResults={handleSearchResult}
          onLoading={setIsSearchLoading}
          className="shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        />
      </div>

      {/* INDICADOR DE TELEMETRÍA (LOADER) */}
      {(isGeoLoading || isSearchLoading) && (
        <div className="absolute top-24 left-6 z-50 bg-black/60 p-3 rounded-full border border-white/10 backdrop-blur-md flex items-center gap-3 shadow-2xl">
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40">Sincronizando Malla</span>
        </div>
      )}

      {/* IV. MOTOR GEOESPACIAL (MAPBOX CORE) */}
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
        <GeolocateControl position="top-right" className="mr-4 mt-4" />
        <NavigationControl position="top-right" showCompass={false} className="mr-4" />

        <Layer {...buildingLayer as any} />

        {/* V. RENDERIZADO DE MARCADORES DE SABIDURÍA */}
        {nearbyPOIs && nearbyPOIs.map((poi: any) => {
          if (!poi.geo_location?.coordinates) return null;
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
              isResonating={!!(activePOI?.id === poi.id && activePOI?.isWithinRadius)}
              isSelected={selectedPOIId === poi.id}
              onClick={handleMarkerClick}
            />
          );
        })}
      </Map>

      {/* VI. TARJETA DE VISLUMBRE (POI PREVIEW) */}
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

      {/* VII. ATMÓSFERA Y IDENTIDAD VISUAL */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none z-10" />

      <div className="absolute bottom-10 left-12 z-20 flex items-center gap-5 opacity-40 group-hover:opacity-100 transition-opacity duration-1000">
        <div className="p-3 bg-primary/20 rounded-full border border-primary/40 shadow-inner backdrop-blur-xl">
          <Activity size={18} className="text-primary animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-white uppercase tracking-[0.5em] italic">Madrid Resonance</span>
          <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">NKV Engine V2.5</span>
        </div>
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Sincronía del Radar: Al admitir 'null' en 'handleSearchResult', el mapa 
 *    no intenta procesar falsos positivos de búsqueda durante la hidratación.
 * 2. Protección PostGIS: Se ha añadido una validación física sobre 
 *    'poi.geo_location.coordinates' para evitar fallos de renderizado 
 *    si un registro llega con datos geográficos parciales.
 * 3. Cinemática Fluida: El uso de 'useCallback' en 'flyToPosition' previene 
 *    re-creaciones innecesarias de la función, optimizando la memoria en 
 *    dispositivos móviles.
 */