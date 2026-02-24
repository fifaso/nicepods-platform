// components/geo/map-inner.tsx
// VERSIÓN: 7.0

"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useRef, useState } from "react";
import Map, {
  GeolocateControl,
  Layer,
  Marker,
  NavigationControl,
  Popup
} from 'react-map-gl';

// --- INFRAESTRUCTURA DE INTELIGENCIA ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { useAuth } from "@/hooks/use-auth";
import { SearchResult } from "@/hooks/use-search-radar";

// --- ICONOGRAFÍA Y UI ---
import { Loader2, Mic, Navigation2, Play } from "lucide-react";

/**
 * INTERFAZ: MapViewState
 * Define la posición y ángulo de la cámara en el espacio 3D.
 */
interface MapViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

/**
 * INTERFAZ: PlaceMemory
 * Representa un nodo de sabiduría anclado a una coordenada física.
 */
interface PlaceMemory {
  id: number;
  lat: number;
  lng: number;
  title: string;
  focus_entity: string;
  content_type: 'chronicle' | 'friend_tip' | 'radar';
}

/**
 * COMPONENTE: MapInner
 * El motor de visualización geoespacial de NicePod V2.5.
 * 
 * [CARACTERÍSTICAS TÁCTICAS]:
 * 1. Radar Unificado: HUD de búsqueda integrado con sincronía de coordenadas.
 * 2. Realidad Satelital: Capas Mapbox v12 con extrusión de edificios 3D.
 * 3. Resonancia Local: Carga dinámica de memorias según el área de visión.
 */
export default function MapInner() {
  const { supabase } = useAuth();
  const mapRef = useRef<any>(null);

  // --- ESTADOS DE DATOS Y CARGA ---
  const [memories, setMemories] = useState<PlaceMemory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<PlaceMemory | null>(null);
  const [isLoadingMemories, setIsLoadingMemories] = useState<boolean>(false);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);

  // --- ESTADO DE LA CÁMARA (Epicentro: Madrid) ---
  const [viewState, setViewState] = useState<MapViewState>({
    latitude: 40.4167,
    longitude: -3.7037,
    zoom: 16.5,
    pitch: 60,   // Ángulo cinemático
    bearing: -15, // Rotación sutil
  });

  /**
   * fetchMemoriesInView:
   * Recupera las crónicas de la base de datos basándose en el marco visual actual.
   */
  const fetchMemoriesInView = useCallback(async (bounds: any) => {
    if (!bounds || !supabase) return;

    setIsLoadingMemories(true);
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
    } catch (error) {
      console.error("🔥 [Map-Error] Fallo al recuperar memorias urbanas:", error);
    } finally {
      setIsLoadingMemories(false);
    }
  }, [supabase]);

  /**
   * handleMoveEnd:
   * Dispara la actualización de datos cuando la cámara se detiene.
   */
  const handleMoveEnd = useCallback((evt: any) => {
    const bounds = evt.target.getBounds();
    fetchMemoriesInView(bounds);
  }, [fetchMemoriesInView]);

  /**
   * handleSearchResult:
   * Lógica de respuesta ante un impacto del radar semántico.
   */
  const handleSearchResult = (results: SearchResult[]) => {
    // Si el radar detecta un podcast con coordenadas, podríamos mover la cámara aquí.
    console.info(`🛰️ Radar Detectó ${results.length} impactos.`);
  };

  /**
   * CONFIGURACIÓN DE CAPAS Mapbox
   * Definimos la extrusión 3D de edificios sobre la imagen satelital.
   */
  const buildingLayer: any = {
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
      "fill-extrusion-opacity": 0.25,
    },
  };

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  return (
    <div className="w-full h-full relative group selection:bg-primary/30">

      {/* 
          BLOQUE I: TERMINAL DE INTELIGENCIA UNIFICADA 
          Variante 'console' para integración estética con el HUB Geoespacial.
      */}
      <div className="absolute top-6 left-6 z-[60] w-full max-w-sm md:max-w-md animate-in slide-in-from-left-4 duration-1000">
        <UnifiedSearchBar
          variant="console"
          placeholder="Rastrear ecos en la ciudad..."
          latitude={viewState.latitude}
          longitude={viewState.longitude}
          onResults={handleSearchResult}
          onLoading={setIsSearchLoading}
          className="shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        />
      </div>

      {/* INDICADOR DE SINCRONÍA (LOADER) */}
      {(isLoadingMemories || isSearchLoading) && (
        <div className="absolute top-24 left-6 z-50 bg-black/60 p-3 rounded-full border border-white/10 backdrop-blur-md flex items-center gap-3">
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
          <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Sincronizando Malla</span>
        </div>
      )}

      {/* 
          BLOQUE II: MOTOR GEOESPACIAL (Mapbox Core)
      */}
      <Map
        {...viewState}
        ref={mapRef}
        onMove={(evt: any) => setViewState(evt.viewState)}
        onMoveEnd={handleMoveEnd}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        reuseMaps
        antialias={true} // Mejora la definición de los edificios 3D
      >
        <GeolocateControl
          position="top-right"
          trackUserLocation
          showUserHeading
          className="mr-2 mt-2"
        />
        <NavigationControl
          position="top-right"
          showCompass={false}
          className="mr-2"
        />

        {/* Capa de Edificios 3D */}
        <Layer {...buildingLayer} />

        {/* 
            RENDERIZADO DE MEMORIAS (MARKERS)
            Cada marcador representa un podcast geolocalizado.
        */}
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
              <div className="absolute inset-0 bg-primary/60 rounded-full animate-ping opacity-40" />
              <div className="relative z-20 bg-black border-2 border-primary p-2.5 rounded-full shadow-[0_0_30px_rgba(var(--primary),0.8)]">
                <Mic className="w-4 h-4 text-white" />
              </div>
            </div>
          </Marker>
        ))}

        {/* 
            POPUP DE DETALLE: La ventana hacia el audio 
        */}
        {selectedMemory && (
          <Popup
            latitude={selectedMemory.lat}
            longitude={selectedMemory.lng}
            anchor="top"
            onClose={() => setSelectedMemory(null)}
            closeButton={false}
            className="z-[70]"
          >
            <div className="p-5 bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl min-w-[240px] animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black text-primary/80 uppercase tracking-widest">
                  {selectedMemory.content_type.replace('_', ' ')}
                </span>
              </div>

              <h3 className="font-black text-base text-white leading-tight mb-2 uppercase italic tracking-tighter">
                {selectedMemory.title}
              </h3>

              <p className="text-[11px] text-zinc-400 mb-5 line-clamp-2 italic font-medium leading-relaxed">
                "{selectedMemory.focus_entity}"
              </p>

              <button
                className="w-full bg-primary text-black text-[10px] font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-[0_10px_20px_rgba(var(--primary),0.3)]"
                onClick={() => window.location.href = `/podcast/${selectedMemory.id}`}
              >
                <Play className="w-3.5 h-3.5 fill-current" /> ESCUCHAR ECO
              </button>
            </div>
          </Popup>
        )}
      </Map>

      {/* 
          OVERLAY DE INTERFAZ INFERIOR 
          Branding y telemetría de posición.
      */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none z-10" />

      <div className="absolute bottom-8 left-10 z-20 flex items-center gap-4 opacity-40 group-hover:opacity-100 transition-opacity duration-700">
        <Navigation2 size={14} className="text-primary animate-pulse" />
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-white uppercase tracking-[0.4em]">Madrid Resonance</span>
          <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest">NKV Terminal V2.5</span>
        </div>
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Sincronía del Radar: Al pasar viewState.latitude/longitude al UnifiedSearchBar,
 *    el motor de búsqueda prioriza crónicas en el radio visual del usuario.
 * 2. Estética HUD: La variante 'console' integra el buscador como parte del 
 *    instrumental del mapa, no como un elemento web ajeno.
 * 3. Optimización de Capas: Se ha ajustado la extrusión 3D (fill-extrusion-opacity: 0.25)
 *    para que los edificios no tapen la información vital de las calles satelitales.
 */