// components/geo/map-inner.tsx
// VERSIÓN: 6.0 (Madrid Resonance - Satellite Reality + 3D Buildings)

"use client";

import { useAuth } from "@/hooks/use-auth";
import { Loader2, Mic, Play } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTheme } from "next-themes";
import { useCallback, useRef, useState } from "react";
import Map, { GeolocateControl, Layer, Marker, NavigationControl, Popup } from 'react-map-gl';

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

export default function MapInner() {
  const { supabase } = useAuth();
  const { theme } = useTheme();
  const mapRef = useRef<any>(null);

  const [memories, setMemories] = useState<PlaceMemory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<PlaceMemory | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [viewState, setViewState] = useState<MapViewState>({
    latitude: 40.4167,
    longitude: -3.7037,
    zoom: 16.5, // Un poco más de zoom para apreciar el detalle satelital
    pitch: 60,   // Más inclinación para un efecto cinematográfico
    bearing: -15,
  });

  const fetchMemoriesInView = useCallback(async (bounds: any) => {
    if (!bounds) return;
    setIsLoading(true);
    try {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const { data, error } = await supabase.rpc("get_memories_in_bounds", {
        min_lat: sw.lat, min_lng: sw.lng, max_lat: ne.lat, max_lng: ne.lng,
      });
      if (!error) setMemories(data || []);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const handleMoveEnd = useCallback((evt: any) => {
    const bounds = evt.target.getBounds();
    fetchMemoriesInView(bounds);
  }, [fetchMemoriesInView]);

  /**
   * [ESTRATEGIA VISUAL]: Satellite Streets
   * Usamos v12 para tener la máxima resolución de imagen con etiquetas legibles.
   */
  const mapStyle = "mapbox://styles/mapbox/satellite-streets-v12";

  // Ajustamos la capa 3D para que contraste mejor con el suelo satelital
  const buildingLayer: any = {
    id: "3d-buildings",
    source: "composite",
    "source-layer": "building",
    filter: ["==", "extrude", "true"],
    type: "fill-extrusion",
    minzoom: 15,
    paint: {
      // Color semitransparente para que se vea la textura del edificio debajo
      "fill-extrusion-color": "white",
      "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "height"]],
      "fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "min_height"]],
      "fill-extrusion-opacity": 0.35,
    },
  };

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  return (
    <div className="w-full h-full relative group">
      {isLoading && (
        <div className="absolute top-6 left-6 z-50 bg-black/60 p-2.5 rounded-full border border-white/10 backdrop-blur-md">
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        </div>
      )}

      <Map
        {...viewState}
        ref={mapRef}
        onMove={(evt: any) => setViewState(evt.viewState)}
        onMoveEnd={handleMoveEnd}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        reuseMaps
      >
        <GeolocateControl position="top-right" trackUserLocation showUserHeading />
        <NavigationControl position="top-right" showCompass={false} />

        {/* Edificios 3D sobre la imagen satelital */}
        <Layer {...buildingLayer} />

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
            <div className="relative cursor-pointer transition-all duration-300 hover:scale-125 z-10">
              <div className="absolute inset-0 bg-primary/60 rounded-full animate-ping opacity-60" />
              <div className="relative z-20 bg-black border-2 border-primary p-2 rounded-full shadow-[0_0_25px_rgba(var(--primary),1)]">
                <Mic className="w-4 h-4 text-white" />
              </div>
            </div>
          </Marker>
        ))}

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
                <span className="text-[9px] font-black text-primary/80 uppercase tracking-widest">
                  {selectedMemory.content_type}
                </span>
              </div>
              <h3 className="font-bold text-sm text-white leading-tight mb-1">{selectedMemory.title}</h3>
              <p className="text-[10px] text-zinc-400 mb-4 line-clamp-2 italic">"{selectedMemory.focus_entity}"</p>

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

      {/* Capa de contraste para labels inferiores de Mapbox */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
    </div>
  );
}