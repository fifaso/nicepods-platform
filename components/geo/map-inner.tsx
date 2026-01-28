// components/geo/map-inner.tsx
// VERSIÓN: 1.7 (Madrid Resonance - Deep Path Import Fix)

"use client";

import { useAuth } from "@/hooks/use-auth";
import { Loader2, Mic, Play } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useMemo, useRef, useState } from "react";

/**
 * [SOLUCIÓN MAESTRA 3]
 * Importamos desde la ruta física interna para bypass de la validación del root '.'.
 * Esto junto con 'esmExternals: loose' en next.config es el blindaje total.
 */
// @ts-ignore
import { GeolocateControl, Layer, Map, Marker, NavigationControl, Popup } from 'react-map-gl/dist/es6/index.js';

export default function MapInner() {
  const { supabase } = useAuth();
  const { theme } = useTheme();

  const mapRef = useRef<any>(null);
  const [memories, setMemories] = useState<any[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewState, setViewState] = useState({
    latitude: 40.4167, longitude: -3.7037, zoom: 16, pitch: 45, bearing: 0,
  });

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
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const mapStyle = useMemo(() =>
    theme === "dark" ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11"
    , [theme]);

  return (
    <div className="w-full h-full relative">
      {isLoading && <div className="absolute top-6 left-6 z-50 bg-black/60 p-2 rounded-full border border-white/10"><Loader2 className="h-4 w-4 text-primary animate-spin" /></div>}

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
        <Layer id="3d-buildings" source="composite" source-layer="building" filter={["==", "extrude", "true"]} type="fill-extrusion" minzoom={15} paint={{ "fill-extrusion-color": "#aaa", "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "height"]], "fill-extrusion-opacity": 0.6 }} />

        {memories.map((mem: any) => (
          <Marker key={mem.id} latitude={mem.lat} longitude={mem.lng} anchor="bottom" onClick={(e: any) => { if (e.originalEvent) e.originalEvent.stopPropagation(); setSelectedMemory(mem); }}>
            <div className="group relative cursor-pointer hover:scale-110 transition-transform">
              <div className="absolute inset-0 bg-primary/40 rounded-full animate-ping" />
              <div className="relative z-10 bg-black border-2 border-primary p-2 rounded-full shadow-lg"><Mic className="w-4 h-4 text-white" /></div>
            </div>
          </Marker>
        ))}

        {selectedMemory && (
          <Popup latitude={selectedMemory.lat} longitude={selectedMemory.lng} anchor="top" onClose={() => setSelectedMemory(null)} closeButton={false}>
            <div className="p-3 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl min-w-[200px]">
              <span className="text-[9px] font-black text-primary/80 uppercase tracking-widest">{selectedMemory.content_type}</span>
              <h3 className="font-bold text-sm text-white mt-1 leading-tight">{selectedMemory.title}</h3>
              <button className="w-full bg-primary text-white text-[10px] font-black py-2.5 rounded-xl mt-3 flex items-center justify-center gap-2 hover:brightness-110" onClick={() => window.location.href = `/podcast/${selectedMemory.id}`}>
                <Play className="w-3 h-3 fill-current" /> ESCUCHAR
              </button>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}