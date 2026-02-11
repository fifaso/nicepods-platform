// components/geo/map-preview-frame.tsx
// VERSIÓN: 5.2 (Madrid Resonance - Sequential Performance Standard)
// Misión: Proveer una ventana táctica 3D con hidratación ultra-diferida para evitar bloqueos del hilo principal.
// [FIX]: Eliminación de violaciones 'requestAnimationFrame' y optimización de visibilidad cartográfica.

"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Compass, Loader2, Maximize2, Zap } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";

/**
 * MadridMapProps: Contrato de integridad para el motor Mapbox.
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
 * Carga dinámica del motor WebGL con SSR desactivado.
 * El skeleton se mantiene visible hasta que el navegador reporte capacidad de renderizado.
 */
const MapEngine = dynamic<MadridMapProps>(
  () => import("react-map-gl").then((module) => module.Map),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 animate-pulse space-y-4">
        <Loader2 className="h-5 w-5 text-primary/40 animate-spin" />
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10">Sintonizando Satélites...</span>
      </div>
    ),
  }
);

/**
 * MapPreviewFrame: Ventana panorámica táctica para el Dashboard.
 */
export function MapPreviewFrame() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState<boolean>(false);

  /**
   * [CONFIGURACIÓN SEMÁNTICA]
   * Coordenadas: Epicentro de Madrid.
   * Usamos useMemo para evitar recreaciones de objetos que reinicien el motor WebGL.
   */
  const initialViewState = useMemo(() => {
    return {
      latitude: 40.4167,
      longitude: -3.7037,
      zoom: 14.8,
      pitch: 65, // Inclinación para profundidad visual
      bearing: -15
    };
  }, []);

  /**
   * [HIDRATACIÓN ESCALONADA T2]
   * Incrementamos el delay a 600ms para asegurar que el saludo y el buscador
   * ya estén pintados, liberando el hilo principal para Mapbox.
   */
  useEffect(() => {
    const mountingTimer = setTimeout(() => {
      setIsMounted(true);
    }, 600);

    return () => {
      clearTimeout(mountingTimer);
    };
  }, []);

  /**
   * handlePortalClick
   * Transición al mapa de exploración completa.
   */
  const handlePortalClick = useCallback(() => {
    console.log("🚀 [NicePod-Geo] Saltando a dimensión 3D completa.");
    router.push("/map");
  }, [router]);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  /**
   * [FALLBACK]: SKELETON ESTRUCTURAL
   * Mantiene el espacio físico (h-140/180) para evitar el Layout Shift.
   */
  if (!isMounted) {
    return (
      <div className="w-full h-[140px] md:h-[180px] rounded-[2rem] md:rounded-[3rem] bg-zinc-950 border border-white/5 animate-pulse shadow-inner" />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      onClick={handlePortalClick}
      className={cn(
        "group relative w-full overflow-hidden border border-white/10 bg-zinc-950 cursor-pointer shadow-2xl transition-all duration-700 hover:border-primary/40",
        "h-[140px] md:h-[180px] rounded-[2rem] md:rounded-[3rem]"
      )}
    >
      {/* 1. CAPA MOTOR WEBGL (Visualización Satelital) 
          Aumentamos opacidad al 60% para que el mapa sea el protagonista visual.
      */}
      <div className="absolute inset-0 pointer-events-none opacity-60 group-hover:opacity-90 transition-all duration-1000 group-hover:scale-105">
        <MapEngine
          initialViewState={initialViewState}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
          reuseMaps={true}
          attributionControl={false}
        />
      </div>

      {/* 2. CAPA DE GRADIENTES (Claridad Cartográfica)
          Hemos reducido la densidad del gradiente 'from-background' para que el 
          asfalto y los edificios de Madrid sean apreciables con luz.
      */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-transparent z-10" />

      {/* 3. CAPA DE INTERFAZ TÁCTICA (HUD) */}
      <div className="absolute inset-0 p-5 md:p-8 flex flex-col justify-between z-20">

        {/* Superior: Estado de Sincronía */}
        <div className="flex justify-between items-start">
          <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-2xl">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-white/90">
              Madrid Live
            </span>
          </div>

          {/* Botón de Maximizar (Revelación en Hover) */}
          <div className="bg-primary p-2 rounded-xl shadow-2xl shadow-primary/40 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
            <Maximize2 size={14} className="text-white" />
          </div>
        </div>

        {/* Inferior: Identidad de Nodo */}
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 p-2.5 rounded-2xl backdrop-blur-xl border border-primary/30 shadow-inner group-hover:bg-primary/40 transition-colors">
              <Compass className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm md:text-lg font-black text-white uppercase tracking-tighter italic leading-none drop-shadow-lg">
                Madrid <span className="text-primary">Resonance</span>
              </h3>
              <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest hidden sm:block">
                Inmersión 3D Activa
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 opacity-30 group-hover:opacity-100 transition-all duration-700">
            <Zap size={10} className="text-yellow-500" />
            <span className="text-[8px] font-black uppercase text-white/60 tracking-widest">GPU Link</span>
          </div>
        </div>
      </div>

      {/* 4. EFECTO AURORA PERIMETRAL */}
      <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/20 rounded-[2rem] md:rounded-[3rem] transition-colors duration-1000 z-30 pointer-events-none" />

    </motion.div>
  );
}