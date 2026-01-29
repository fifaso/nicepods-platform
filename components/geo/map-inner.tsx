// components/geo/map-inner.tsx
// VERSIÓN: 5.0 (Madrid Resonance - Professional Self-Healing Architecture)
// Misión: Visualización 3D inmersiva con blindaje total de tipos.

"use client";

import { useAuth } from "@/hooks/use-auth";
import { Loader2, Mic, Play } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useMemo, useRef, useState } from "react";

// Importación de componentes (Valores)
import Map, {
  GeolocateControl,
  Layer,
  Marker,
  NavigationControl,
  Popup
} from 'react-map-gl';

import "mapbox-gl/dist/mapbox-gl.css";

/**
 * 🛡️ CAPA DE AUTOREPARACIÓN (Self-Healing Types)
 * Definimos las interfaces localmente para evitar el error ts(2709).
 * Esto hace que el archivo sea inmune a fallos de resolución del IDE.
 */

interface MapViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

interface PlaceMemory {
  id: number;
  lat: number;
  lng: number;
  title: string;
  focus_entity: string;
  content_type: 'chronicle' | 'friend_tip' | 'radar';
}

// Estructura para el evento de movimiento del mapa
interface LocalViewStateChangeEvent {
  viewState: MapViewState;
  target: any;
}

// Estructura para el evento de click en marcadores
interface LocalMapMouseEvent {
  originalEvent: MouseEvent;
  [key: string]: any;
}

export default function MapInner() {
  const { supabase } = useAuth();
  const { theme } = useTheme();

  // Usamos una referencia genérica robusta para evitar conflictos de namespace
  const mapRef = useRef<any>(null);

  const [memories, setMemories] = useState<PlaceMemory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<PlaceMemory | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [viewState, setViewState] = useState<MapViewState>({
    latitude: 40.416775,
    longitude: -3.703790,
    zoom: 16,
    pitch: 45,
    bearing: 0,
  });

  /**
   * MOTOR DE DATOS: Fetching optimizado por área visible (Bounding Box)
   */
  const fetchMemoriesInView = useCallback(async (bounds: any) => {
    if (!bounds) return;
    setIsLoading(true);
    try {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      const { data, error } = await supabase.rpc("get_memories_in_bounds", {
        min_lat: sw.lat,
        min_lng: sw.lng,
        max_lat: ne.lat,
        max_lng: ne.lng,
      });

      if (!error) {
        setMemories(data || []);
      }
    } catch (error) {
      console.error("[Madrid-Resonance] PostGIS Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  /**
   * MANEJADORES DE EVENTOS (Blindados)
   */
  const handleMove = useCallback((evt: LocalViewStateChangeEvent) => {
    setViewState(evt.viewState);
  }, []);

  const handleMoveEnd = useCallback((evt: LocalViewStateChangeEvent) => {
    const bounds = evt.target.getBounds();
    fetchMemoriesInView(bounds);
  }, [fetchMemoriesInView]);

  const mapStyle = useMemo(() =>
    theme === "dark" ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11"
    , [theme]);

  // Capa técnica de edificios 3D
  const buildingLayer: any = {
    id: "3d-buildings",
    source: "composite",
    "source-layer": "building",
    filter: ["==", "extrude", "true"],
    type: "fill-extrusion",
    minzoom: 15,
    paint: {
      "fill-extrusion-color": "#aaa",
      "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "height"]],
      "fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "min_height"]],
      "fill-extrusion-opacity": 0.6,
    },
  };

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-900 rounded-[2rem] border border-red-500/20">
        <p className="text-red-500 font-mono text-[10px] uppercase tracking-widest">Error: Token Mapbox no configurado</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative group">

      {/* HUD de Carga */}
      {isLoading && (
        <div className="absolute top-6 left-6 z-50 bg-black/60 p-2.5 rounded-full border border-white/10 backdrop-blur-md shadow-2xl">
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        </div>
      )}

      <Map
        {...viewState}
        ref={mapRef}
        onMove={handleMove}
        onMoveEnd={handleMoveEnd}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        reuseMaps
      >
        <GeolocateControl position="top-right" trackUserLocation showUserHeading />
        <NavigationControl position="top-right" showCompass={false} />

        {/* Renderizado de edificios en 3D */}
        <Layer {...buildingLayer} />

        {/* Renderizado de Ecos (Marcadores) */}
        {memories.map((mem) => (
          <Marker
            key={mem.id}
            latitude={mem.lat}
            longitude={mem.lng}
            anchor="bottom"
            onClick={(e: LocalMapMouseEvent) => {
              // Evitamos que el click en el marcador mueva el mapa
              e.originalEvent.stopPropagation();
              setSelectedMemory(mem);
            }}
          >
            <div className="relative cursor-pointer transition-all duration-300 hover:scale-125 z-10">
              <div className="absolute inset-0 bg-primary/40 rounded-full animate-ping opacity-60" />
              <div className="relative z-20 bg-black border-2 border-primary p-2 rounded-full shadow-[0_0_20px_rgba(var(--primary),0.6)]">
                <Mic className="w-4 h-4 text-white" />
              </div>
            </div>
          </Marker>
        ))}

        {/* Panel de Información Dinámico */}
        {selectedMemory && (
          <Popup
            latitude={selectedMemory.lat}
            longitude={selectedMemory.lng}
            anchor="top"
            onClose={() => setSelectedMemory(null)}
            closeButton={false}
            maxWidth="240px"
          >
            <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-black text-primary/80 uppercase tracking-[0.2em]">
                  {selectedMemory.content_type}
                </span>
              </div>
              <h3 className="font-bold text-sm text-white leading-tight mb-1">{selectedMemory.title}</h3>
              <p className="text-[10px] text-zinc-400 mb-4 line-clamp-2 italic">"{selectedMemory.focus_entity}"</p>

              <button
                className="w-full bg-primary text-white text-[10px] font-black py-3 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg"
                onClick={() => window.location.href = `/podcast/${selectedMemory.id}`}
              >
                <Play className="w-3.5 h-3.5 fill-current" /> ESCUCHAR ECO
              </button>
            </div>
          </Popup>
        )}
      </Map>

      {/* Gradiente Inferior de Inmersión */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
    </div>
  );
}