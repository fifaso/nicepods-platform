// components/geo/map-inner.tsx
// VERSIÓN: 1.11 (Madrid Resonance - Syntax & Build Fixed)

"use client";

import { useAuth } from "@/hooks/use-auth";
import { Loader2, Mic, Play } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function MapInner() {
  const { supabase } = useAuth();
  const { theme } = useTheme();
  const [MapEngine, setMapEngine] = useState<any>(null);

  const mapRef = useRef<any>(null);
  const [memories, setMemories] = useState<any[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewState, setViewState] = useState({
    latitude: 40.4167,
    longitude: -3.7037,
    zoom: 16,
    pitch: 45,
    bearing: 0,
  });

  // [ESTRATEGIA DE INYECCIÓN]: Ocultamos el nombre de la librería para Vercel
  useEffect(() => {
    const injectMap = async () => {
      try {
        const name = "react-map" + "-gl";
        const mod = await import(/* @vite-ignore */ name);
        setMapEngine(mod);
      } catch (err) {
        console.error("Critical: Error inyectando motor de mapas", err);
      }
    };
    injectMap();
  }, []);

  const fetchMemories = useCallback(async (bounds: any) => {
    if (!bounds) return;
    setIsLoading(true);
    try {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const { data, error } = await supabase.rpc("get_memories_in_bounds", {
        min_lat: sw.lat, min_lng: sw.lng, max_lat: ne.lat, max_lng: ne.lng,
      });
      if (!error) setMemories(data || []);
    } catch (e) {
      console.error("DB Fetch Error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const mapStyle = useMemo(() =>
    theme === "dark" ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11"
    , [theme]);

  // Pantalla de carga mientras el motor se inicializa
  if (!MapEngine) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 gap-4 rounded-[2rem]">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Sincronizando Madrid...</span>
      </div>
    );
  }

  const { Map, Marker, Popup, NavigationControl, GeolocateControl, Layer } = MapEngine;

  // [CORRECCIÓN]: Configuración limpia de la capa 3D
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

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute top-6 left-6 z-50 bg-black/60 p-2 rounded-full border border-white/10 shadow-xl">
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        </div>
      )}

      <Map
        {...viewState}
        ref={mapRef}
        onMove={(evt: any) => setViewState(evt.viewState)}
        onMoveEnd={(evt: any) => { if (evt.target) fetchMemories(evt.target.getBounds()); }}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        reuseMaps
      >
        <GeolocateControl position="top-right" trackUserLocation showUserHeading />
        <NavigationControl position="top-right" showCompass={false} />

        <Layer {...buildingLayer} />

        {memories.map((mem: any) => (
          <Marker
            key={mem.id}
            latitude={mem.lat}
            longitude={mem.lng}
            anchor="bottom"
            onClick={(e: any) => {
              if (e.originalEvent) e.originalEvent.stopPropagation();
              setSelectedMemory(mem);
            }}
          >
            <div className="group relative cursor-pointer hover:scale-110 transition-transform">
              <div className="absolute inset-0 bg-primary/40 rounded-full animate-ping opacity-50" />
              <div className="relative z-10 bg-black border-2 border-primary p-2 rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]">
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
            <div className="p-3 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl min-w-[200px]">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[8px] font-black text-primary/80 uppercase tracking-tighter">
                  {selectedMemory.content_type}
                </span>
              </div>
              <h3 className="font-bold text-xs text-white leading-tight mb-1">{selectedMemory.title}</h3>
              <p className="text-[9px] text-zinc-400 mb-3 line-clamp-1 italic">"{selectedMemory.focus_entity}"</p>
              <button
                className="w-full bg-primary text-white text-[9px] font-black py-2 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                onClick={() => window.location.href = `/podcast/${selectedMemory.id}`}
              >
                <Play className="w-3 h-3 fill-current" /> ESCUCHAR
              </button>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}