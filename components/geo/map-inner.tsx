// components/geo/map-inner.tsx
// VERSIÓN: 2.0 (Madrid Resonance - Production Ready 3D Map)

"use client";

import { useAuth } from "@/hooks/use-auth";
import { Loader2, Mic, Play } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useMemo, useRef, useState } from "react";
// @ts-ignore
import "mapbox-gl/dist/mapbox-gl.css";
import Map, { GeolocateControl, Layer, Marker, NavigationControl, Popup } from "react-map-gl";

interface PlaceMemory {
  id: number;
  lat: number;
  lng: number;
  title: string;
  focus_entity: string;
  content_type: "chronicle" | "friend_tip" | "radar";
}

export default function MapInner() {
  const { supabase } = useAuth();
  const { theme } = useTheme();
  const mapRef = useRef<any>(null);

  const [memories, setMemories] = useState<PlaceMemory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<PlaceMemory | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [viewState, setViewState] = useState({
    latitude: 40.4167,
    longitude: -3.7037,
    zoom: 16,
    pitch: 45,
    bearing: 0,
  });

  // CARGA DE MEMORIAS SEGÚN EL ÁREA VISIBLE
  const fetchMemories = useCallback(async (bounds: any) => {
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

      if (error) throw error;
      setMemories(data || []);

    } catch (e) {
      console.error("Error cargando memorias PostGIS:", e);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // CONFIGURACIÓN DE CAPA 3D (Extrusión de Madrid)
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

  const mapStyle = useMemo(() =>
    theme === "dark" ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11"
    , [theme]);

  return (
    <div className="w-full h-full relative">
      {/* Indicador de carga sutil sobre el mapa */}
      {isLoading && (
        <div className="absolute top-6 left-6 z-50 bg-black/60 p-2.5 rounded-full border border-white/10 backdrop-blur-md">
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        </div>
      )}

      <Map
        {...viewState}
        ref={mapRef}
        onMove={(evt: any) => setViewState(evt.viewState)}
        onMoveEnd={(evt: any) => {
          if (evt.target) fetchMemories(evt.target.getBounds());
        }}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        reuseMaps
      >
        <GeolocateControl position="top-right" trackUserLocation showUserHeading />
        <NavigationControl position="top-right" showCompass={false} />

        {/* Capa de edificios 3D */}
        <Layer {...buildingLayer} />

        {/* Renderizado de Marcadores */}
        {memories.map((mem) => (
          <Marker
            key={mem.id}
            latitude={mem.lat}
            longitude={mem.lng}
            anchor="bottom"
            onClick={(e: any) => {
              e.originalEvent.stopPropagation();
              setSelectedMemory(mem);
            }}
          >
            <div className="group relative cursor-pointer hover:scale-125 transition-transform duration-300">
              <div className="absolute inset-0 bg-primary/40 rounded-full animate-ping opacity-60" />
              <div className="relative z-10 bg-black border-2 border-primary p-2 rounded-full shadow-[0_0_20px_rgba(var(--primary),0.6)]">
                <Mic className="w-4 h-4 text-white" />
              </div>
            </div>
          </Marker>
        ))}

        {/* Ventana de Información al seleccionar un Eco */}
        {selectedMemory && (
          <Popup
            latitude={selectedMemory.lat}
            longitude={selectedMemory.lng}
            anchor="top"
            onClose={() => setSelectedMemory(null)}
            closeButton={false}
          >
            <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl min-w-[220px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-black text-primary/80 uppercase tracking-[0.2em]">
                  {selectedMemory.content_type}
                </span>
              </div>
              <h3 className="font-bold text-sm text-white leading-tight mb-1">{selectedMemory.title}</h3>
              <p className="text-[10px] text-zinc-400 mb-4 line-clamp-1 italic">"{selectedMemory.focus_entity}"</p>
              <button
                className="w-full bg-primary text-white text-[10px] font-black py-3 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                onClick={() => window.location.href = `/podcast/${selectedMemory.id}`}
              >
                <Play className="w-3.5 h-3.5 fill-current" /> ESCUCHAR ECO
              </button>
            </div>
          </Popup>
        )}
      </Map>

      {/* Gradiente estético para profundidad */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
    </div>
  );
}