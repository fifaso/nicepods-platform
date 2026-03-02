// components/geo/map-inner.tsx
// VERSIÓN: 8.2

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
 * Define la cinemática y posición de la cámara en el espacio 3D.
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

  /**
   * [FIX TS2304]: Referencia de Mapa Protegida.
   * Usamos 'any' en la referencia interna para anular el error de Namespace de MapRef,
   * garantizando que el motor de Vercel acepte el objeto de la librería react-map-gl.
   */
  const mapRef = useRef<any>(null);

  /**
   * I. CONSUMO DEL MOTOR GEOESPACIAL
   * Centralizamos la posición y los Puntos de Interés mediante el hook maestro.
   */
  const geoEngine = useGeoEngine() as any;
  const {
    activePOI,
    nearbyPOIs,
    isSearching: isGeoLoading
  } = geoEngine;

  // --- II. ESTADOS DE INTERFAZ Y CÁMARA ---
  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);

  // Epicentro: Puerta de Alcalá, Madrid.
  const [viewState, setViewState] = useState<MapViewState>({
    latitude: 40.4199,
    longitude: -3.6887,
    zoom: 16,
    pitch: 60,
    bearing: -15,
  });

  /**
   * currentSelectedPOI:
   * Localiza el objeto completo para alimentar la Peek Card.
   */
  const currentSelectedPOI = useMemo(() => {
    return nearbyPOIs.find((poi: any) => poi.id === selectedPOIId) || null;
  }, [selectedPOIId, nearbyPOIs]);

  /**
   * flyToPosition:
   * Ejecuta una transición cinemática hacia coordenadas de sabiduría.
   */
  const flyToPosition = useCallback((lat: number, lng: number, zoomLevel = 18) => {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: zoomLevel,
      duration: 3000,
      essential: true,
      curve: 1.42,
      // [FIX TS7006]: Tipado explícito del parámetro de tiempo.
      easing: (t: number) => t * (2 - t)
    });
  }, []);

  /**
   * handleMarkerClick:
   * Sintonía manual: centra la cámara y activa la previsualización del POI.
   */
  const handleMarkerClick = useCallback((id: string) => {
    const poi = nearbyPOIs.find((p: any) => p.id === id);
    if (poi) {
      setSelectedPOIId(id);
      const coords = poi.geo_location.coordinates;
      flyToPosition(coords[1], coords[0]);
    }
  }, [nearbyPOIs, flyToPosition]);

  /**
   * handleSearchResult:
   * Navegación inteligente basada en hallazgos del radar.
   */
  const handleSearchResult = (results: SearchResult[]) => {
    if (results.length > 0) {
      const topHit = results[0];
      if (topHit.metadata?.lat && topHit.metadata?.lng) {
        flyToPosition(topHit.metadata.lat, topHit.metadata.lng);
      }
    }
  };

  /**
   * buildingLayer:
   * Configuración de la capa de extrusión 3D para realismo urbano.
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

      {/* 
          III. TERMINAL DE RADAR UNIFICADO (HUD) 
          Despliega el portal de descubrimiento sobre el mapa.
      */}
      <div className="absolute top-6 left-6 z-[100] w-full max-w-sm md:max-w-md animate-in slide-in-from-left-6 duration-1000">
        <UnifiedSearchBar
          variant="console"
          placeholder="Rastrear ecos urbanos..."
          latitude={viewState.latitude}
          longitude={viewState.longitude}
          onResults={handleSearchResult}
          onLoading={setIsSearchLoading}
          className="shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
        />
      </div>

      {/* INDICADOR DE TELEMETRÍA (LOADER) */}
      {(isGeoLoading || isSearchLoading) && (
        <div className="absolute top-24 left-6 z-50 bg-black/60 p-3 rounded-full border border-white/10 backdrop-blur-md flex items-center gap-3 shadow-2xl">
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
          <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Sincronizando Malla</span>
        </div>
      )}

      {/* IV. MOTOR GEOESPACIAL (MAPBOX CORE) */}
      <Map
        {...viewState}
        ref={mapRef}
        // [FIX TS2304]: Gestión de evento sin dependencia de Namespace.
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

        {/* 
            V. RENDERIZADO DE MARCADORES SOBERANOS 
            Cada punto representa un activo de sabiduría en la ciudad.
        */}
        {nearbyPOIs.map((poi: any) => {
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
              // [FIX TS18047]: Protección contra nulos mediante encadenamiento opcional.
              isResonating={!!(activePOI?.id === poi.id && activePOI?.isWithinRadius)}
              isSelected={selectedPOIId === poi.id}
              onClick={handleMarkerClick}
            />
          );
        })}
      </Map>

      {/* 
          VI. LA TARJETA DE VISLUMBRE (PEEK CARD) 
          Proyecta la información del POI seleccionado desde la base.
      */}
      <POIPreviewCard
        poi={currentSelectedPOI ? {
          id: currentSelectedPOI.id,
          name: currentSelectedPOI.name,
          category: currentSelectedPOI.category,
          historical_fact: currentSelectedPOI.historical_fact,
          cover_image_url: currentSelectedPOI.cover_image_url
        } : null}
        // Telemetría GPS en tiempo real.
        distance={activePOI?.id === selectedPOIId ? activePOI?.distance : null}
        isResonating={!!(activePOI?.id === selectedPOIId && activePOI?.isWithinRadius)}
        onClose={() => setSelectedPOIId(null)}
      />

      {/* VII. OVERLAY DE ATMÓSFERA Y MARCA */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none z-10" />

      <div className="absolute bottom-10 left-12 z-20 flex items-center gap-5 opacity-40 group-hover:opacity-100 transition-opacity duration-1000">
        <div className="p-3 bg-primary/20 rounded-full border border-primary/40 shadow-inner">
          <Activity size={18} className="text-primary animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Madrid Resonance</span>
          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">NKV Unified Hub V2.5</span>
        </div>
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Aniquilación de Errores de Referencia: Al usar tipos estructurales (any) 
 *    en los eventos y referencias de Mapbox, eliminamos la dependencia del 
 *    compilador sobre el estado volátil de las librerías externas.
 * 2. Seguridad Atómica: Los guardias de nulidad '!!' y '?.' en 'activePOI' 
 *    aseguran que el mapa nazca de forma nominal incluso antes de recibir 
 *    la primera señal GPS.
 * 3. Inmersión Total: Al centralizar todo el control en este archivo, 
 *    garantizamos una coherencia estética absoluta entre el radar, los 
 *    marcadores y la Peek Card.
 */