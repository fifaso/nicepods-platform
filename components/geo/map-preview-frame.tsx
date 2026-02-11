// components/geo/map-preview-frame.tsx
// VERSIÓN: 5.1 (Panoramic Resonance Portal - Structural Precision & Zero Warning)
// Misión: Proveer una ventana táctica 3D al mapa de Madrid con carga diferida y performance de élite.
// [FIX]: Resolución de advertencias de hooks, optimización de visibilidad y gestión de recursos GPU.

"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Globe, Loader2, Maximize2, Zap } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";

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

  /**
   * [SINCRONIZACIÓN DE COORDENADAS]
   * Epicentro: Puerta del Sol, Madrid.
   * Usamos useMemo para garantizar que la referencia sea estable y no reinicie el mapa.
   */
  const initialViewState = useMemo(() => ({
    latitude: 40.4167,
    longitude: -3.7037,
    zoom: 14.8,
    pitch: 65, // Inclinación agresiva para profundidad táctica
    bearing: -15
  }), []);

  /**
   * [HIDRATACIÓN CONTROLADA]
   * Retrasamos el montaje real del mapa para asegurar que el hilo principal procese 
   * primero el saludo y la terminal de búsqueda, eliminando las violaciones de tiempo (>100ms).
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 450);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  /**
   * handlePortalClick
   * Realiza el salto de dimensión hacia el explorador de mapa 3D a pantalla completa.
   */
  const handlePortalClick = useCallback(() => {
    console.log("🚀 [Resonance] Accediendo a la dimensión de exploración completa.");
    router.push("/map");
  }, [router]);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  /**
   * [FALLBACK]: SKELETON AURORA
   * Se muestra durante el proceso de hidratación inicial (T0 -> T1).
   */
  if (!mounted) {
    return (
      <div className="w-full h-[140px] md:h-[180px] rounded-[2rem] md:rounded-[3rem] bg-zinc-950 border border-white/5 animate-pulse shadow-inner" />
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
        "h-[140px] md:h-[180px] rounded-[2rem] md:rounded-[3rem]"
      )}
    >
      {/* 1. CAPA MOTOR WEBGL (Visualización Satelital) 
          Ajustamos la opacidad base al 50% para que el mapa sea "descubierto" visualmente.
      */}
      <div className="absolute inset-0 pointer-events-none opacity-50 group-hover:opacity-80 transition-all duration-1000 group-hover:scale-105">
        <MapEngine
          initialViewState={initialViewState}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
          reuseMaps={true}
          attributionControl={false}
        />
      </div>

      {/* 2. CAPA DE GRADIENTES (Atmósfera Digital)
          [MEJORA 5.1]: Gradientes suavizados (opacidad 60% en base) para 
          permitir que la cartografía de Madrid sea apreciable.
      */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-transparent z-10" />

      {/* 3. CAPA DE INTERFAZ TÁCTICA (HUD) */}
      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between z-20">

        {/* Superior: Estado de Sincronía y Acción */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <div className="bg-black/70 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-2xl">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
                Madrid Live
              </span>
            </div>
          </div>

          {/* Botón de expansión táctica */}
          <div className="bg-primary p-2.5 rounded-xl shadow-2xl shadow-primary/40 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 hover:brightness-110">
            <Maximize2 size={16} className="text-white" />
          </div>
        </div>

        {/* Inferior: Identidad de Nodo y Telemetría */}
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 p-2.5 rounded-2xl backdrop-blur-xl border border-primary/30 shadow-inner group-hover:bg-primary/40 transition-colors">
              <Globe className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm md:text-xl font-black text-white uppercase tracking-tighter italic leading-none drop-shadow-lg">
                Madrid <span className="text-primary">Resonance</span>
              </h3>
              <p className="text-[9px] md:text-[10px] text-white/40 font-bold uppercase tracking-widest hidden sm:block">
                Portal de Memorias 3D Activo
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 opacity-40 group-hover:opacity-100 transition-all duration-700">
            <Zap size={10} className="text-yellow-500" />
            <span className="text-[8px] font-black uppercase text-white/60 tracking-widest">GPU Accelerated</span>
          </div>
        </div>
      </div>

      {/* 4. EFECTO AURORA PERIMETRAL */}
      <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/20 rounded-[2rem] md:rounded-[3rem] transition-colors duration-700 z-30 pointer-events-none" />

    </motion.div>
  );
}