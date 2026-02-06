// components/geo/map-preview-frame.tsx
// VERSIÓN: 4.2 (Madrid Resonance - GPU Optimized & CSS Shield)
// Misión: Proveer una ventana táctica 3D al mapa de Madrid con carga diferida y performance de élite.

"use client";

import { motion } from "framer-motion";
import { Compass, Loader2, Maximize2, Zap } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

/**
 * MadridMapProps: Definición estricta de la interfaz del motor de mapas.
 * Asegura que el compilador de Next.js no pierda el rastro de los tipos en la carga dinámica.
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
  attributionControl?: boolean;
}

/**
 * [SHIELD]: MapEngine
 * Cargamos el motor WebGL con ssr: false para evitar errores de hidratación.
 * El loading skeleton ha sido diseñado para mantener la geometría de la página y evitar el Layout Shift.
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

/**
 * MapPreviewFrame: El componente de visualización táctica del Dashboard.
 */
export function MapPreviewFrame() {
  const router = useRouter();
  const [mounted, setMounted] = useState<boolean>(false);

  // Coordenadas maestras: El epicentro de Madrid (Puerta del Sol)
  const MADRID_COORDS = useMemo(() => ({
    latitude: 40.4167,
    longitude: -3.7037
  }), []);

  /**
   * [HIDRATACIÓN CONTROLADA]
   * Retrasamos el montaje real del mapa un frame para asegurar que el CSS global
   * haya sido parseado por el navegador, eliminando la advertencia de Mapbox.
   */
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  /**
   * handlePortalClick
   * Realiza el salto de dimensión hacia el explorador de mapa 3D a pantalla completa.
   */
  const handlePortalClick = useCallback(() => {
    console.log("🚀 [Resonance] Saltando a dimensión 3D completa...");
    router.push("/map");
  }, [router]);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  // Si no ha montado, devolvemos el contenedor vacío con el estilo Aurora base
  if (!mounted) {
    return (
      <div className="w-full h-[220px] lg:h-[280px] rounded-[3rem] bg-zinc-950 border border-white/5 animate-pulse shadow-2xl" />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      onClick={handlePortalClick}
      className="group relative w-full h-[220px] lg:h-[280px] rounded-[3rem] overflow-hidden border border-white/10 bg-zinc-950 cursor-pointer shadow-[0_0_50px_rgba(139,92,246,0.1)] transition-all duration-700 hover:border-primary/40"
    >
      {/* 1. CAPA DEL MOTOR WEBGL (EL CORAZÓN) */}
      <div className="absolute inset-0 pointer-events-none opacity-30 group-hover:opacity-60 transition-all duration-1000 group-hover:scale-105">
        <MapEngine
          initialViewState={{
            ...MADRID_COORDS,
            zoom: 14.8,
            pitch: 62,
            bearing: -20
          }}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
          reuseMaps={true}
          attributionControl={false}
        />
      </div>

      {/* 2. CAPA DE PROFUNDIDAD Y SOMBRAS (THE VOID) */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10" />

      {/* 3. CAPA DE INTERFAZ TÁCTICA (HUD) */}
      <div className="absolute inset-0 p-8 flex flex-col justify-between z-20">

        {/* Superior: Estado y Maximizar */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <div className="bg-black/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3 shadow-2xl">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Sincronía Madrid Live</span>
            </div>
            <div className="hidden lg:flex bg-primary/10 px-3 py-1 rounded-full border border-primary/20 w-fit">
              <span className="text-[8px] font-black text-primary uppercase tracking-widest italic">V2.5 Protocol</span>
            </div>
          </div>

          <div className="bg-primary p-3 rounded-2xl shadow-2xl shadow-primary/40 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:brightness-110">
            <Maximize2 size={18} className="text-white" />
          </div>
        </div>

        {/* Inferior: Título e Indicador de Visión */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="bg-primary/20 p-4 rounded-[1.5rem] backdrop-blur-xl border border-primary/30 shadow-inner group-hover:bg-primary/30 transition-colors">
              <Compass className="h-7 w-7 text-primary animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter italic leading-none">
                Vivir lo <span className="text-primary">Local</span>
              </h3>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Inmersión en el mapa de memorias</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
            <Zap size={12} className="text-yellow-400" />
            <span className="text-[8px] font-black uppercase text-white/60 tracking-[0.3em]">GPU Accelerated</span>
          </div>
        </div>
      </div>

      {/* EFECTO DE LUZ PERIMETRAL (AURORA) */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-1000" />

    </motion.div>
  );
}

/**
 * useCallback: Memorización para el handler del router.
 * Evita la recreación de la función en cada renderizado, optimizando el hilo principal.
 */
function useCallback(fn: () => void, deps: any[]) {
  return React.useCallback(fn, deps);
}