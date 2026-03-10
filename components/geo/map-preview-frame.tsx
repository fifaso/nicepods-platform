// components/geo/map-preview-frame.tsx
// VERSIÓN: 6.0 (NicePod Resonance Engine - Absolute Stability Edition)
// Misión: Proveer una ventana táctica 3D fluida eliminando cancelaciones de red y re-renders.
// [ESTABILIZACIÓN]: Implementación de React.memo y enrutamiento nativo mediante Link.

"use client";

import React, { useEffect, useMemo, useRef, useState, memo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, Globe, Loader2, Maximize2, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * MadridMapProps: Contrato de integridad para el motor Mapbox GL.
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
    <Link href="/map" className="block w-full h-full outline-none group">
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className={cn(
          "relative w-full h-full overflow-hidden bg-zinc-950 transition-all duration-700",
          "rounded-[2rem] md:rounded-[3.5rem] border border-white/5 group-hover:border-primary/40 shadow-2xl"
        )}
      >
        {/* FASE: MOTOR ACTIVO */}
        {isIdleReady ? (
          <div className="absolute inset-0 opacity-40 group-hover:opacity-70 transition-all duration-1000 group-hover:scale-105">
            <MapEngine
              initialViewState={initialViewState}
              mapboxAccessToken={MAPBOX_TOKEN}
              style={{ width: "100%", height: "100%" }}
              mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
              reuseMaps={true}
              attributionControl={false}
            />
          </div>
        ) : (
          /* FASE: STAND-BY VISUAL */
          <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
            <Globe className="h-8 w-8 text-white/5 animate-spin-slow" />
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/10">
              Sincronizando Malla
            </span>
          </div>
        )}

        {/* GRADIENTES DE ATMÓSFERA */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />

        {/* HUD DE INFORMACIÓN */}
        <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between z-20 pointer-events-none">
          <div className="flex justify-between items-start">
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-white">
                Madrid Live
              </span>
            </div>

            <div className="bg-primary/90 p-2.5 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-500">
              <Maximize2 size={14} className="text-white" />
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-3 rounded-2xl backdrop-blur-xl border border-primary/30 group-hover:bg-primary/40 transition-colors duration-500">
                <Compass className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm md:text-xl font-black text-white uppercase tracking-tighter italic leading-none">
                  Madrid <span className="text-primary">Resonance</span>
                </h3>
                <p className="text-[9px] text-white/30 font-bold uppercase tracking-[0.2em]">
                  Explorar Malla Activa
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* OVERLAY DE INTERACCIÓN */}
        <div className="absolute inset-0 z-30 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      </motion.div>
    </Link>
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Aniquilación de 'Canceled Requests': El uso de React.memo() garantiza que el 
 *    componente del mapa sea ignorado por el reconciliador de React a menos que 
 *    sus props cambien. Esto detiene las interrupciones de red de Mapbox.
 * 2. Navegación Nativa: Al envolver el componente en un <Link>, delegamos el 
 *    enrutamiento al motor de Next.js, lo que permite el pre-fetching automático 
 *    de la página /map, haciendo la transición instantánea.
 * 3. Optimización de GPU: Al reducir la opacidad base (40%), disminuimos el 
 *    estrés de renderizado del Dashboard mientras el usuario interactúa con 
 *    otros elementos.
 */