// components/geo/map-preview-frame.tsx
// VERSIÓN: 5.0 (Panoramic Resonance Portal - UX Architecture Master)
// Misión: Proveer una ventana táctica 3D optimizada en espacio, eliminando intrusión visual.

"use client";

import { motion } from "framer-motion";
import { Compass, Loader2, Maximize2, Zap, Globe } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * MadridMapProps: Contrato de tipos para el motor Mapbox.
 * Garantiza integridad en la carga dinámica (Next.js Dynamic).
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
 * Inicialización controlada del motor WebGL con SSR desactivado.
 * El esqueleto (loading) ahora sigue las nuevas dimensiones panorámicas.
 */
const MapEngine = dynamic<MadridMapProps>(
  () => import("react-map-gl").then((mod) => mod.Map),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 animate-pulse">
        <Loader2 className="h-5 w-5 text-primary/40 animate-spin" />
      </div>
    ),
  }
);

/**
 * MapPreviewFrame: El portal de entrada a Madrid Resonance.
 */
export function MapPreviewFrame() {
  const router = useRouter();
  const [mounted, setMounted] = useState<boolean>(false);

  // Coordenadas Maestras: Puerta del Sol, Madrid.
  const coords = useMemo(() => ({
    latitude: 40.4167,
    longitude: -3.7037
  }), []);

  /**
   * [CONTROL DE HIDRATACIÓN]:
   * Retrasamos el montaje para asegurar que el hilo principal procese 
   * primero el saludo y el buscador, eliminando el lag inicial.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
        setMounted(true);
    }, 400);
    return () => {
        clearTimeout(timer);
    };
  }, []);

  /**
   * handlePortalClick: Salto dimensional al mapa completo.
   */
  const handlePortalClick = useCallback(() => {
    console.log("🚀 [Resonance] Accediendo a la dimensión de exploración completa.");
    router.push("/map");
  }, [router]);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  // Renderizado del Skeleton Aurora mientras el motor calienta
  if (!mounted) {
    return (
      <div className="w-full h-[140px] md:h-[180px] rounded-[2rem] md:rounded-[2.5rem] bg-zinc-950 border border-white/5 animate-pulse shadow-inner" />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      onClick={handlePortalClick}
      className={cn(
        "group relative w-full overflow-hidden border border-white/10 bg-zinc-950 cursor-pointer shadow-2xl transition-all duration-700 hover:border-primary/40",
        "h-[140px] md:h-[180px] rounded-[2rem] md:rounded-[3rem]" // Reducción estratégica de altura
      )}
    >
      {/* 1. CAPA MOTOR WEBGL (Visualización Satelital) */}
      <div className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-60 transition-all duration-1000 group-hover:scale-105">
        <MapEngine
          initialViewState={{
            ...coords,
            zoom: 14.8,
            pitch: 65, // Inclinación agresiva para efecto de profundidad
            bearing: -15
          }}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
          reuseMaps={true}
          attributionControl={false}
        />
      </div>

      {/* 2. CAPA DE SOMBRAS Y PROFUNDIDAD (Vignetting) */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-transparent z-10" />

      {/* 3. CAPA DE INTERFAZ TÁCTICA (HUD Minimalista) */}
      <div className="absolute inset-0 p-5 md:p-8 flex flex-col justify-between z-20">
        
        {/* Superior: Estado de Sincronía */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <div className="bg-black/70 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-2xl">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
                Madrid Live
              </span>
            </div>
          </div>
          
          {/* Botón de expansión que aparece en hover */}
          <div className="bg-primary p-2.5 rounded-xl shadow-2xl shadow-primary/40 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
            <Maximize2 size={16} className="text-white" />
          </div>
        </div>

        {/* Inferior: Título Integrado */}
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 p-2.5 rounded-2xl backdrop-blur-xl border border-primary/30 shadow-inner group-hover:bg-primary/40 transition-colors">
              <Globe className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <div className="space-y-0">
              <h3 className="text-sm md:text-xl font-black text-white uppercase tracking-tighter italic leading-none">
                Vivir lo <span className="text-primary">Local</span>
              </h3>
              <p className="text-[9px] md:text-[10px] text-white/40 font-bold uppercase tracking-widest hidden sm:block">
                Explora memorias en 3D
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <Zap size={10} className="text-yellow-500" />
            <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Inmersión Activa</span>
          </div>
        </div>
      </div>

      {/* Efecto de luz Aurora en bordes al pasar el cursor */}
      <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/20 rounded-[2rem] md:rounded-[3rem] transition-colors duration-700 z-30 pointer-events-none" />

    </motion.div>
  );
}