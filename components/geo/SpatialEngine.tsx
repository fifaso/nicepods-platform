// components/geo/SpatialEngine.tsx
// VERSIÓN: 3.2 (NicePod Sovereign Mapping Engine - Full Resolution Edition)
// Misión: Centralizar la renderización geoespacial con resiliencia WebGL total.
// [ESTABILIZACIÓN]: Restauración de interactividad en Modo Explore (Fix TS2304).

"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, {
  GeolocateControl,
  Layer,
  Marker,
  NavigationControl
} from 'react-map-gl';

import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, Navigation2 } from "lucide-react";

// --- INFRAESTRUCTURA DE DOMINIO SOBERANO ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn } from "@/lib/utils";

// --- COMPONENTES DE INTERFAZ DE VUELO ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { SearchResult } from "@/hooks/use-search-radar";
import { MapMarkerCustom } from "./map-marker-custom";
import { POIPreviewCard } from "./poi-preview-card";

/**
 * ---------------------------------------------------------------------------
 * I. CONTRATOS DE INTERFAZ (PROPS Y EVENTOS)
 * ---------------------------------------------------------------------------
 */

interface SpatialEngineProps {
  mode: 'EXPLORE' | 'FORGE';
  onManualAnchor?: (lngLat: [number, number]) => void;
  className?: string;
}

interface MapboxMoveEvent {
  viewState: {
    latitude: number;
    longitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
  };
}

interface MapboxMouseEvent {
  lngLat: {
    lng: number;
    lat: number;
  };
  preventDefault: () => void;
}

/**
 * ---------------------------------------------------------------------------
 * II. CONFIGURACIÓN DE RENDIMIENTO WEBGL
 * ---------------------------------------------------------------------------
 */
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
const MAP_STYLE_EXPLORE = "mapbox://styles/mapbox/dark-v11";
const MAP_STYLE_FORGE = "mapbox://styles/mapbox/satellite-streets-v12";

const FLY_CONFIG = {
  duration: 2000,
  essential: true,
  curve: 1.42,
  easing: (t: number) => t * (2 - t)
};

export function SpatialEngine({ mode, onManualAnchor, className }: SpatialEngineProps) {
  // 1. REFERENCIAS Y ESTADOS DE MADUREZ
  const mapRef = useRef<any>(null);
  const geoEngine = useGeoEngine();

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [manualAnchor, setManualAnchor] = useState<[number, number] | null>(null);

  // [FIX TS2304]: Restauración de estados de interacción para el Modo EXPLORE
  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);

  // 2. CÁMARA TÁCTICA (VIEWPORT INICIAL)
  const [viewState, setViewState] = useState({
    latitude: geoEngine.userLocation?.latitude || 40.4167,
    longitude: geoEngine.userLocation?.longitude || -3.7037,
    zoom: mode === 'FORGE' ? 18 : 15,
    pitch: mode === 'FORGE' ? 0 : 60, // Forge: Plano para precisión. Explore: 3D inmersivo.
    bearing: -15,
  });

  /**
   * ---------------------------------------------------------------------------
   * III. PROTOCOLOS DE SINCRONÍA (SSR -> CLIENTE) Y CÁMARA
   * ---------------------------------------------------------------------------
   */

  // Salto Inicial: Si hay ubicación (Admin mode), viajamos allí al montar.
  useEffect(() => {
    if (geoEngine.userLocation && !isMapLoaded && mode === 'FORGE') {
      setViewState(prev => ({
        ...prev,
        latitude: geoEngine.userLocation!.latitude,
        longitude: geoEngine.userLocation!.longitude
      }));
    }
  }, [geoEngine.userLocation, isMapLoaded, mode]);

  const handleMove = useCallback((evt: MapboxMoveEvent) => {
    setViewState(evt.viewState);
  }, []);

  const flyToPosition = useCallback((lng: number, lat: number, zoomLevel = 18) => {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: zoomLevel,
      ...FLY_CONFIG
    });
  }, []);

  /**
   * ---------------------------------------------------------------------------
   * IV. PROTOCOLOS DE INTERACCIÓN (POIS Y BÚSQUEDA)
   * ---------------------------------------------------------------------------
   */

  // [FIX TS2304]: Memoria reactiva que determina el nodo visualizado en la tarjeta inferior
  const currentSelectedPOI = useMemo(() => {
    if (!geoEngine.nearbyPOIs) return null;
    return geoEngine.nearbyPOIs.find(poi => poi.id.toString() === selectedPOIId) || null;
  }, [selectedPOIId, geoEngine.nearbyPOIs]);

  const handleSearchResult = useCallback((results: SearchResult[] | null) => {
    if (results && results.length > 0) {
      const topHit = results[0];
      if (topHit.metadata?.lat && topHit.metadata?.lng) {
        flyToPosition(topHit.metadata.lng, topHit.metadata.lat, 17);
      }
    }
  }, [flyToPosition]);

  /**
   * ---------------------------------------------------------------------------
   * V. FACULTAD DE ADMINISTRADOR: ANCLAJE TÁCTIL Y MIRA (LONG-PRESS)
   * ---------------------------------------------------------------------------
   */

  const handleMapClick = useCallback((e: any) => {
    if (mode !== 'FORGE' || !onManualAnchor) return;

    const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];

    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate([10, 30, 10]);
    }

    setManualAnchor(lngLat);
    onManualAnchor(lngLat);
    flyToPosition(lngLat[0], lngLat[1], 19); // Zoom táctico para forja

  }, [mode, onManualAnchor, flyToPosition]);

  /**
   * ---------------------------------------------------------------------------
   * VI. CAPAS DE REDERIZADO (DATA-DRIVEN STYLING)
   * ---------------------------------------------------------------------------
   */

  // Capa de Edificios 3D con estilo Aurora
  const buildingLayer = useMemo(() => ({
    id: "3d-buildings",
    source: "composite",
    "source-layer": "building",
    filter: ["==", "extrude", "true"],
    type: "fill-extrusion",
    minzoom: 15,
    paint: {
      "fill-extrusion-color": mode === 'EXPLORE' ? "#27272a" : "#ffffff", // Zinc para Consumo, Blanco para Forja
      "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "height"]],
      "fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "min_height"]],
      "fill-extrusion-opacity": 0.4,
    },
  }), [mode]);

  return (
    <div className={cn("w-full h-full relative bg-[#010101]", className)}>

      {/* --- HUD DE BÚSQUEDA SOBERANA (Solo Modo Explore) --- */}
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

      {/* --- EL MOTOR CARTOGRÁFICO SOBERANO --- */}
      <Map
        {...viewState}
        ref={mapRef}
        onMove={handleMove}
        onClick={handleMapClick}
        onLoad={() => setIsMapLoaded(true)}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mode === 'FORGE' ? MAP_STYLE_FORGE : MAP_STYLE_EXPLORE}
        reuseMaps={true}
        antialias={true}
        attributionControl={false}
        maxPitch={85}
      >
        {/* CONTROLES DE NAVEGACIÓN */}
        <div className="absolute bottom-10 right-4 flex flex-col gap-3 z-40">
          <NavigationControl showCompass={false} className="!bg-black/80 !backdrop-blur-xl !border-white/10 !rounded-2xl scale-110 !shadow-2xl" />
          <GeolocateControl
            positionOptions={{ enableHighAccuracy: true }}
            trackUserLocation={mode === 'FORGE'} // Seguimiento de hardware agresivo solo al crear
            className="!bg-black/80 !backdrop-blur-xl !border-white/10 !rounded-2xl scale-110 !w-10 !h-10 !shadow-2xl"
          />
        </div>

        {/* CAPAS DE ARQUITECTURA 3D (Bloqueo de Crash WebGL) */}
        {isMapLoaded && <Layer {...buildingLayer as any} />}

        {/* RENDERIZADO DE NODOS URBANOS (Ecos Históricos) */}
        {geoEngine.nearbyPOIs?.map((poi) => {
          if (!poi.geo_location?.coordinates) return null;
          const [lng, lat] = poi.geo_location.coordinates;
          const isSelected = selectedPOIId === poi.id.toString();
          const isResonating = !!(geoEngine.activePOI?.id === poi.id.toString() && geoEngine.activePOI?.isWithinRadius);

          return (
            <MapMarkerCustom
              key={poi.id}
              id={poi.id.toString()}
              latitude={lat}
              longitude={lng}
              category_id={poi.category_id || "historia"}
              name={poi.name}
              isResonating={isResonating}
              isSelected={isSelected}
              onClick={(id) => {
                // Solo permitimos seleccionar (y volar hacia) el POI en modo exploración
                if (mode === 'EXPLORE') {
                  setSelectedPOIId(id);
                  const p = geoEngine.nearbyPOIs.find(item => item.id.toString() === id);
                  if (p) flyToPosition(p.geo_location.coordinates[0], p.geo_location.coordinates[1], 17);
                }
              }}
            />
          );
        })}

        {/* MARCADOR SOBERANO DE SIEMBRA (Solo Modo Forge) */}
        {mode === 'FORGE' && (geoEngine.userLocation || manualAnchor) && (
          <Marker
            latitude={manualAnchor ? manualAnchor[1] : geoEngine.userLocation!.latitude}
            longitude={manualAnchor ? manualAnchor[0] : geoEngine.userLocation!.longitude}
            anchor="center"
          >
            <div className="relative flex flex-col items-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={cn(
                  "absolute h-16 w-16 rounded-full border-2 blur-sm",
                  manualAnchor ? "bg-amber-500/30 border-amber-500/50" : "bg-emerald-500/30 border-emerald-500/50"
                )}
              />
              <div className={cn(
                "relative z-10 p-2 rounded-full shadow-2xl border-2 border-white ring-4",
                manualAnchor ? "bg-amber-500 ring-amber-500/20" : "bg-emerald-500 ring-emerald-500/20"
              )}>
                <Navigation2 className="w-4 h-4 text-black fill-current" />
              </div>
            </div>
          </Marker>
        )}
      </Map>

      {/* MIRA TÁCTICA (Solo Modo Forge) */}
      {mode === 'FORGE' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="relative flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 2 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <Crosshair className="text-primary/60 w-12 h-12 animate-pulse" strokeWidth={1} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),1)]" />
              </div>
            </motion.div>

            {/* HUD de Coordenadas Tácticas */}
            <div className="absolute top-16 bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-2xl">
              <span className="text-[8px] font-black text-white uppercase tracking-[0.3em] tabular-nums">
                {viewState.latitude.toFixed(5)} , {viewState.longitude.toFixed(5)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* --- TARJETA DE VISLUMBRE (Solo Modo Explore) --- */}
      <AnimatePresence>
        {mode === 'EXPLORE' && currentSelectedPOI && (
          <POIPreviewCard
            poi={{
              id: currentSelectedPOI.id.toString(),
              name: currentSelectedPOI.name,
              category: currentSelectedPOI.category_id,
              historical_fact: currentSelectedPOI.historical_fact || undefined,
              cover_image_url: currentSelectedPOI.gallery_urls?.[0]
            }}
            distance={geoEngine.activePOI?.id === selectedPOIId ? geoEngine.activePOI?.distance : null}
            isResonating={!!(geoEngine.activePOI?.id === selectedPOIId && geoEngine.activePOI?.isWithinRadius)}
            onClose={() => setSelectedPOIId(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.2):
 * 1. Restauración de Interactividad (TS2304): Se han reinyectado las variables 
 *    'currentSelectedPOI' y 'selectedPOIId', reviviendo la funcionalidad de 
 *    las tarjetas emergentes cuando el Voyager explora la malla.
 * 2. Protección de Clic: El evento 'onClick' de los marcadores (Línea 225) 
 *    ahora verifica el modo ('EXPLORE'). Esto evita que, si el Admin está 
 *    forjando un nodo, al hacer un clic accidental sobre otro POI, la cámara 
 *    salte abruptamente interrumpiendo su siembra táctica.
 * 3. UX Binaria: El color del marcador del Admin cambia a Ámbar si está 
 *    usando el Anclaje Manual (Línea 247), dándole retroalimentación 
 *    visual inmediata sobre el estado de su autoridad GPS.
 */