// components/geo/map-preview-frame.tsx
// VERSIÓN: 4.3 (Resonance Engine - Optimized Lifecycle & Build Shield Fixed)
// Misión: Ventana táctica 3D con hidratación controlada para máximo rendimiento.

"use client";

import { motion } from "framer-motion";
import { Compass, Loader2, Maximize2, Zap } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";

/**
 * MadridMapProps: Contrato de tipos para el motor Mapbox.
 */
interface MadridMapProps {
  initialViewState: {
    latitude: number;
    longitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
  };
  mapboxAccessToken: string;
  style: React.CSSProperties;
  mapStyle: string;
  reuseMaps?: boolean;
}

/**
 * MapEngine: Carga diferida del motor de mapas.
 */
const MapEngine = dynamic<MadridMapProps>(
  () => import("react-map-gl").then((mod) => mod.Map),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 animate-pulse space-y-4">
        <Loader2 className="h-6 w-6 text-primary/40 animate-spin" />
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Sintonizando Satélites...</span>
      </div>
    ),
  }
);

export function MapPreviewFrame() {
  const router = useRouter();
  const [mounted, setMounted] = useState<boolean>(false);

  // Puerta del Sol, Madrid (Referencia Maestra)
  const coords = useMemo(() => ({
    latitude: 40.4167,
    longitude: -3.7037
  }), []);

  /**
   * [MEJORA]: Retraso táctico de montaje.
   * Evita que Mapbox compita con la carga inicial del texto de la página,
   * eliminando la violación de tiempo del hilo principal.
   */
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 250);
    return () => clearTimeout(timer);
  }, []);

  /**
   * handlePortalClick
   * Saltamos a la vista completa del mapa.
   */
  const handlePortalClick = useCallback(() => {
    router.push("/map");
  }, [router]);

  if (!mounted) {
    return (
      <div className="w-full h-[180px] lg:h-[220px] rounded-[2.5rem] bg-zinc-950 border border-white/5 animate-pulse flex items-center justify-center shadow-inner" />
    );
  }

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onClick={handlePortalClick}
      className="group relative w-full h-[180px] lg:h-[220px] rounded-[2.5rem] overflow-hidden border border-white/10 bg-zinc-950 cursor-pointer shadow-2xl transition-all duration-500 hover:border-primary/40"
    >
      {/* CAPA 1: MOTOR WEBGL (Opacidad reducida para no distraer en Dashboard) */}
      <div className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity duration-700">
        <MapEngine
          initialViewState={{
            ...coords,
            zoom: 14.5,
            pitch: 55,
            bearing: -15
          }}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
          reuseMaps={true}
        />
      </div>

      {/* CAPA 2: GRADIENTE DE PROFUNDIDAD */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent z-10" />

      {/* CAPA 3: INTERFAZ HUD */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between z-20">
        <div className="flex justify-between items-start">
          <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/90">Madrid Live</span>
          </div>
          <div className="bg-primary p-2 rounded-full shadow-lg scale-0 group-hover:scale-100 transition-all duration-300">
            <Maximize2 size={14} className="text-white" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 p-3 rounded-2xl backdrop-blur-md border border-primary/20">
              <Compass className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <div className="space-y-0.5 text-left">
              <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none italic">Vivir lo Local</h3>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter leading-none">Mapa 3D de Memorias</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-[8px] font-black text-white/20 uppercase tracking-widest">
            <Zap size={10} /> GPU Active
          </div>
        </div>
      </div>
    </motion.div>
  );
}