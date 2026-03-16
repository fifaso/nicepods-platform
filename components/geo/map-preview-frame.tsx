// components/geo/map-preview-frame.tsx
// VERSIÓN: 6.2 (NicePod Resonance Engine - Interactive Widget Edition)
// Misión: Proveer una ventana táctica 3D fluida y explorable.
// [ESTABILIZACIÓN]: Desacoplamiento del Link global para restaurar la interactividad WebGL.

"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Compass, Globe, Loader2, Maximize2 } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";

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
 */
const MapEngine = dynamic<MadridMapProps>(
  () => import("react-map-gl").then((module) => module.Map),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 animate-pulse">
        <Loader2 className="h-5 w-5 text-primary/20 animate-spin" />
      </div>
    ),
  }
);

/**
 * MapPreviewFrame: Ventana panorámica táctica para el Dashboard.
 * Envuelta en memo() para aniquilar los re-renders innecesarios y las cancelaciones de red.
 */
export const MapPreviewFrame = memo(function MapPreviewFrame() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Estados de control de carga
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isIdleReady, setIsIdleReady] = useState<boolean>(false);

  // Configuración estática de la cámara (Km 0 - Madrid)
  const initialViewState = useMemo(() => ({
    latitude: 40.4167,
    longitude: -3.7037,
    zoom: 14.5,
    pitch: 60,
    bearing: -10
  }), []);

  /**
   * PROTOCOLO DE CARGA: Intersection Observer
   * Solo activamos el motor cuando el componente entra en el rango visual del usuario.
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  /**
   * PROTOCOLO IDLE: requestIdleCallback
   * Despertamos el motor WebGL solo cuando el CPU ha terminado de procesar la UI principal.
   */
  useEffect(() => {
    if (!isVisible) return;

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        setIsIdleReady(true);
      }, { timeout: 2000 });
    } else {
      const timer = setTimeout(() => setIsIdleReady(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={cn(
        "relative w-full h-full overflow-hidden bg-zinc-950 transition-all duration-700",
        "rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 shadow-2xl group hover:border-primary/40 hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]"
      )}
    >
      {/* 1. ZONA INTERACTIVA (MAPA) */}
      {isIdleReady ? (
        <div className="absolute inset-0 transition-all duration-1000 opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100">
          <MapEngine
            initialViewState={initialViewState}
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/dark-v11" // Modo Explore para el Dashboard
            reuseMaps={true}
            attributionControl={false}
          />
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
          <Globe className="h-8 w-8 text-white/5 animate-spin-slow" />
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/10">Sincronizando Malla</span>
        </div>
      )}

      {/* GRADIENTES DE ATMÓSFERA */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-black/40 to-transparent z-10 pointer-events-none" />

      {/* 2. ZONA DE ENRUTAMIENTO (ÁREA INFERIOR CLICKABLE) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20 flex justify-between items-end pointer-events-none">

        {/* El enlace a /map ahora envuelve solo al botón/título, permitiendo interactuar con el mapa arriba */}
        <Link href="/map" className="flex items-center gap-4 pointer-events-auto group/btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl">
          <div className="bg-primary/20 p-3 rounded-2xl backdrop-blur-xl border border-primary/30 group-hover/btn:bg-primary/40 group-hover/btn:scale-110 transition-all duration-500 shadow-inner">
            <Compass className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <div className="space-y-0.5 flex flex-col">
            <h3 className="text-sm md:text-xl font-black text-white uppercase tracking-tighter italic leading-none drop-shadow-2xl">
              Madrid <span className="text-primary">Resonance</span>
            </h3>
            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.3em] mt-0.5 group-hover/btn:text-primary/80 transition-colors">
              Explorar Malla Activa
            </p>
          </div>
        </Link>

        {/* Botón de Expansión Rápida */}
        <Link href="/map" className="pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
          <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
            <Maximize2 size={16} className="text-white" />
          </div>
        </Link>
      </div>

    </motion.div>
  );
});