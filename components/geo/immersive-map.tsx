// components/geo/immersive-map.tsx
// VERSIÓN: 4.0 (Madrid Resonance - Full Production Standard)

"use client";

import { useAuth } from "@/hooks/use-auth";
import { Loader2, Mic, Play } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Importamos el CSS de Mapbox para evitar fallos visuales
import "mapbox-gl/dist/mapbox-gl.css";

/**
 * [ESTRATEGIA DE BLINDAJE]: 
 * Usamos @ts-ignore solo para el import porque el IDE en la nube tiene latencia con PNPM,
 * pero Next.js usará 'transpilePackages' definido en tu config para el build real.
 */
// @ts-ignore
import { GeolocateControl, Layer, Map, Marker, NavigationControl, Popup } from "react-map-gl";

// Interfaces Locales para Garantizar Estabilidad
interface PlaceMemory {
  id: number;
  lat: number;
  lng: number;
  title: string;
  focus_entity: string;
  content_type: "chronicle" | "friend_tip" | "radar";
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Estilo de Capa 3D
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

export function ImmersiveMap() {
  const { supabase } = useAuth();
  const { theme } = useTheme();
  const mapRef = useRef<any>(null);

  // Estados
  const [memories, setMemories] = useState<PlaceMemory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<PlaceMemory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // [CRÍTICO]: Este useEffect garantiza que el mapa solo se compile en el cliente, 
  // eliminando errores de exportación en Vercel.
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [viewState, setViewState] = useState({
    latitude: 40.4167,
    longitude: -3.7037,
    zoom: 16,
    pitch: 45,
    bearing: 0,
  });

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
      if (!error) setMemories(data || []);
    } catch (e) {
      console.error("Map Fetch Error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const mapStyle = useMemo(() =>
    theme === "dark" ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11"
    , [theme]);

  // Si no ha cargado en el cliente o no hay token, no renderizamos el motor de Mapbox
  if (!isMounted) return <div className="h-full w-full bg-zinc-900 animate-pulse" />;
  if (!MAPBOX_TOKEN) return <div className="p-4 text-xs font-mono text-red-500">TOKEN_MISSING</div>;

  return (
    <div className="w-full h-full relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-black shadow-2xl">

      {isLoading && (
        <div className="absolute top-6 left-6 z-50 bg-black/60 backdrop-blur-xl p-2.5 rounded-full border border-white/10">
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        </div>
      )}

      <Map
        {...viewState}
        ref={mapRef}
        onMove={(evt: any) => setViewState(evt.viewState)}
        onMoveEnd={(evt: any) => fetchMemories(evt.target.getBounds())}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        reuseMaps
      >
        <GeolocateControl position="top-right" trackUserLocation showUserHeading />
        <NavigationControl position="top-right" showCompass={false} />

        <Layer {...buildingLayer} />

        {memories.map((mem) => (
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
            <div className="group relative cursor-pointer">
              <div className="absolute inset-0 bg-primary/40 rounded-full animate-ping" />
              <div className="relative z-10 bg-black border-2 border-primary p-2 rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-transform hover:scale-125">
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
            className="z-50"
          >
            <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl min-w-[220px]">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-black text-primary/80 uppercase tracking-widest">
                  {selectedMemory.content_type}
                </span>
              </div>
              <h3 className="font-bold text-sm text-white leading-tight mb-1">{selectedMemory.title}</h3>
              <p className="text-[10px] text-zinc-400 mb-4 line-clamp-2 italic">"{selectedMemory.focus_entity}"</p>
              <button
                className="w-full bg-primary text-white text-[10px] font-black py-2.5 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                onClick={() => window.location.href = `/podcast/${selectedMemory.id}`}
              >
                <Play className="w-3 h-3 fill-current" /> ESCUCHAR ECO
              </button>
            </div>
          </Popup>
        )}
      </Map>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
    </div>
  );
}