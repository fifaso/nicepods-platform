// components/geo/SpatialEngine.tsx
// VERSIÓN: 3.0 (NicePod Sovereign Mapping Engine - Full TS Parity Edition)
// Misión: Centralizar la renderización geoespacial, el seguimiento de telemetría y la ingesta manual.
// [ESTABILIZACIÓN]: Resolución de Namespace Mapbox GL (TS2709, TS2694) mediante Tipado Estructural.

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
import { AlertTriangle, Navigation2, Plus, Target } from "lucide-react";

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
  /**
   * mode: Define el polimorfismo del mapa.
   * - EXPLORE: Vista cinemática de consumo (Calles Oscuras).
   * - FORGE: Vista táctica de creación para el Admin (Satélite V12).
   */
  mode: 'EXPLORE' | 'FORGE';
  /**
   * onManualAnchor: Callback disparado cuando el Admin realiza un "Long-Press".
   */
  onManualAnchor?: (lngLat: [number, number]) => void;
  className?: string;
}

/**
 * [FIX ESTRUCTURAL TS2709/TS2694]: 
 * Definimos las interfaces de los eventos de Mapbox localmente para evitar 
 * depender de los namespaces defectuosos de la librería @types/mapbox-gl.
 */
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

// Parámetros de inercia de cámara (Curvas de Bezier personalizadas)
const FLY_CONFIG = {
  duration: 2500,
  essential: true,
  curve: 1.42,
  easing: (t: number) => t * (2 - t)
};

export function SpatialEngine({ mode, onManualAnchor, className }: SpatialEngineProps) {
  // 1. REFERENCIAS AL METAL Y ESTADOS BASE
  // Utilizamos 'any' en el Ref para evitar el bloqueo del namespace MapRef.
  const mapRef = useRef<any>(null);
  const geoEngine = useGeoEngine();

  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);

  // Estado de anclaje manual (Solo modo FORGE)
  const [manualAnchor, setManualAnchor] = useState<[number, number] | null>(null);

  // 2. CÁMARA TÁCTICA (VIEWPORT INICIAL)
  // Km 0 de Madrid por defecto, con pitch agresivo para 3D.
  const [viewState, setViewState] = useState({
    latitude: 40.4167,
    longitude: -3.7037,
    zoom: mode === 'FORGE' ? 18 : 15,
    pitch: 60,
    bearing: -15,
  });

  /**
   * ---------------------------------------------------------------------------
   * III. PROTOCOLOS DE TELEMETRÍA Y SEGUIMIENTO (TRACKING)
   * ---------------------------------------------------------------------------
   */

  // Sincronía del Viewport con el GPS del usuario (Si está activo)
  useEffect(() => {
    if (geoEngine.userLocation && mode === 'FORGE' && !manualAnchor) {
      setViewState(prev => ({
        ...prev,
        latitude: geoEngine.userLocation!.latitude,
        longitude: geoEngine.userLocation!.longitude
      }));
    }
  }, [geoEngine.userLocation, mode, manualAnchor]);

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
   * IV. INTERACCIÓN SOBERANA (POIs Y BÚSQUEDA)
   * ---------------------------------------------------------------------------
   */

  const currentSelectedPOI = useMemo(() => {
    if (!geoEngine.nearbyPOIs) return null;
    return geoEngine.nearbyPOIs.find(poi => poi.id.toString() === selectedPOIId) || null;
  }, [selectedPOIId, geoEngine.nearbyPOIs]);

  const handleMarkerClick = useCallback((id: string) => {
    const poi = geoEngine.nearbyPOIs.find(p => p.id.toString() === id);
    if (poi && poi.geo_location?.coordinates) {
      setSelectedPOIId(id);
      flyToPosition(poi.geo_location.coordinates[0], poi.geo_location.coordinates[1]);
    }
  }, [geoEngine.nearbyPOIs, flyToPosition]);

  const handleSearchResult = useCallback((results: SearchResult[] | null) => {
    if (results && results.length > 0) {
      const topHit = results[0];
      if (topHit.metadata?.lat && topHit.metadata?.lng) {
        flyToPosition(topHit.metadata.lng, topHit.metadata.lat);
      }
    }
  }, [flyToPosition]);

  /**
   * ---------------------------------------------------------------------------
   * V. FACULTAD DE ADMINISTRADOR: ANCLAJE TÁCTIL (LONG-PRESS)
   * ---------------------------------------------------------------------------
   */

  const handleMapContextMenu = useCallback((e: MapboxMouseEvent) => {
    if (mode !== 'FORGE' || !onManualAnchor) return;

    // Prevenimos el menú nativo del navegador (como "Guardar Imagen" en móviles)
    e.preventDefault();

    const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];

    // Haptic Feedback si el dispositivo lo soporta (Hardware Confirmation)
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }

    setManualAnchor(lngLat);
    onManualAnchor(lngLat);
    flyToPosition(lngLat[0], lngLat[1], 19); // Zoom extremo de detalle para forja

  }, [mode, onManualAnchor, flyToPosition]);

  /**
   * ---------------------------------------------------------------------------
   * VI. CAPAS DE REDERIZADO WEBGL (DATA-DRIVEN STYLING)
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
      "fill-extrusion-color": mode === 'EXPLORE' ? "#27272a" : "#ffffff", // Zinc en Explore, Blanco táctico en Forge
      "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "height"]],
      "fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "min_height"]],
      "fill-extrusion-opacity": mode === 'EXPLORE' ? 0.6 : 0.15,
    },
  }), [mode]);

  return (
    <div className={cn("w-full h-full relative bg-[#020202]", className)}>

      {/* --- HUD: PORTAL DE BÚSQUEDA (Solo en Modo Explore) --- */}
      {mode === 'EXPLORE' && (
        <div className="absolute top-6 left-4 right-4 z-[100] md:top-8 md:left-8 md:w-[400px]">
          <UnifiedSearchBar
            variant="console"
            placeholder="Rastrear memoria urbana..."
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
        onContextMenu={handleMapContextMenu} // Evento Long-Press para anclaje
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mode === 'FORGE' ? MAP_STYLE_FORGE : MAP_STYLE_EXPLORE}
        reuseMaps={true}
        antialias={true}
        attributionControl={false}
        // Optimizaciones de Batería y CPU
        maxPitch={85}
        minZoom={12}
      >
        {/* --- CONTROLES DE INTERFAZ TÁCTICA --- */}
        <div className="absolute bottom-10 right-4 flex flex-col gap-3 z-40">
          <NavigationControl
            showCompass={false}
            className="!bg-black/60 !backdrop-blur-xl !border-white/10 !rounded-xl scale-110 !shadow-2xl"
          />
          <GeolocateControl
            positionOptions={{ enableHighAccuracy: true }}
            trackUserLocation={mode === 'FORGE'} // Auto-tracking estricto en creación
            className="!bg-black/60 !backdrop-blur-xl !border-white/10 !rounded-xl scale-110 !w-10 !h-10 !shadow-2xl"
          />
        </div>

        {/* --- CAPAS DE ARQUITECTURA 3D --- */}
        <Layer {...buildingLayer as any} />

        {/* --- RENDERIZADO DE NODOS URBANOS (POIs) --- */}
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
              category_id={poi.category_id || poi.category || "historia"}
              name={poi.name}
              isResonating={isResonating}
              isSelected={isSelected}
              onClick={handleMarkerClick}
            />
          );
        })}

        {/* --- MARCADOR FANTASMA DE ANCLAJE (MODO FORGE) --- */}
        {mode === 'FORGE' && (geoEngine.userLocation || manualAnchor) && (
          <Marker
            latitude={manualAnchor ? manualAnchor[1] : geoEngine.userLocation!.latitude}
            longitude={manualAnchor ? manualAnchor[0] : geoEngine.userLocation!.longitude}
            anchor="center"
          >
            <div className="relative flex flex-col items-center group cursor-pointer">

              {/* Anillo de Incertidumbre GPS (Solo si es hardware real, no manual) */}
              {!manualAnchor && geoEngine.userLocation?.accuracy && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bg-emerald-500/20 rounded-full border border-emerald-500/40"
                  style={{
                    width: `${Math.max(geoEngine.userLocation.accuracy * 2, 40)}px`,
                    height: `${Math.max(geoEngine.userLocation.accuracy * 2, 40)}px`
                  }}
                />
              )}

              {/* Puntero Táctico de Siembra */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={cn(
                  "p-2 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)] border-2 ring-4 transition-all duration-500",
                  manualAnchor ? "bg-amber-500 border-white ring-amber-500/50" : "bg-emerald-500 border-white ring-black/50"
                )}>
                  {manualAnchor ? <Target className="w-4 h-4 text-black" /> : <Navigation2 className="w-4 h-4 text-black fill-current" />}
                </div>
                <div className="w-1 h-3 bg-white rounded-b-full shadow-2xl" />
              </div>

              {/* HUD del Puntero */}
              <div className="absolute -bottom-8 whitespace-nowrap z-30 pointer-events-none">
                <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-2xl flex items-center gap-2">
                  <Plus size={10} className={manualAnchor ? "text-amber-500" : "text-emerald-500"} />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white">
                    {manualAnchor ? "Anclaje Manual" : "Posición Real"}
                  </span>
                </div>
              </div>

            </div>
          </Marker>
        )}
      </Map>

      {/* --- HUD DE ALERTA: DEGRADACIÓN DE GPS (MODO FORGE) --- */}
      <AnimatePresence>
        {mode === 'FORGE' && geoEngine.userLocation && geoEngine.userLocation.accuracy > 30 && !manualAnchor && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-amber-500/10 backdrop-blur-xl border border-amber-500/30 px-4 py-2 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <AlertTriangle size={14} className="text-amber-500 animate-pulse" />
              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                GPS Inestable: Mantén presionado el mapa para anclaje manual
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- TARJETA DE VISLUMBRE (Solo Modo Explore) --- */}
      {mode === 'EXPLORE' && (
        <POIPreviewCard
          poi={currentSelectedPOI ? {
            id: currentSelectedPOI.id.toString(),
            name: currentSelectedPOI.name,
            category: currentSelectedPOI.category_id || currentSelectedPOI.category,
            historical_fact: currentSelectedPOI.historical_fact || undefined,
            cover_image_url: currentSelectedPOI.gallery_urls?.[0]
          } : null}
          distance={geoEngine.activePOI?.id === selectedPOIId ? geoEngine.activePOI?.distance : null}
          isResonating={!!(geoEngine.activePOI?.id === selectedPOIId && geoEngine.activePOI?.isWithinRadius)}
          onClose={() => setSelectedPOIId(null)}
        />
      )}
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Tipado Protector: Definir 'MapboxMoveEvent' y 'MapboxMouseEvent' localmente 
 *    libera a Vercel de intentar reconciliar dependencias profundas de DefinitelyTyped 
 *    que fallan en compilaciones estrictas de Next.js 14.
 * 2. Soberanía Visual: El mapa ahora responde de forma inquebrantable a su entorno: 
 *    Calles limpias en consumo, satélite militar en forja, y el color del marcador 
 *    (Verde/Ámbar) revela el origen de la coordenada (GPS/Humano).
 */