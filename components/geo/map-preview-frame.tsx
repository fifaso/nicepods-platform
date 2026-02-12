// components/geo/map-preview-frame.tsx
// VERSIÓN: 5.6 (NicePod Resonance Engine - Idle-First & Viewport Aware Edition)
// Misión: Proveer una ventana táctica 3D fluida eliminando los bloqueos del hilo principal.
// [OPTIMIZACIÓN]: Reemplazo de setTimeout por requestIdleCallback e implementación de carga por visibilidad.

"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Compass,
  Globe,
  Loader2,
  Maximize2,
  Zap
} from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
 * Carga dinámica del motor WebGL con SSR desactivado para prevenir errores de hidratación.
 */
const MapEngine = dynamic<MadridMapProps>(
  () => import("react-map-gl").then((module) => module.Map),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 animate-pulse space-y-4">
        <Loader2 className="h-5 w-5 text-primary/40 animate-spin" />
      </div>
    ),
  }
);

/**
 * MapPreviewFrame: Ventana panorámica táctica para el Centro de Mando.
 */
export function MapPreviewFrame() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // Estados de carga escalonada
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isIdleReady, setIsIdleReady] = useState<boolean>(false);

  /**
   * [CONFIGURACIÓN SEMÁNTICA]: initialViewState
   * Memorizado para evitar reinicializaciones de cámara que disparen re-renders.
   */
  const initialViewState = useMemo(() => {
    return {
      latitude: 40.4167,
      longitude: -3.7037,
      zoom: 14.8,
      pitch: 65,
      bearing: -15
    };
  }, []);

  /**
   * [PROTOCOLO SENSORIAL]: Intersection Observer + requestIdleCallback
   * 1. Detectamos si el componente está en el viewport para no cargar GPU en vano.
   * 2. Esperamos a que el CPU esté libre antes de despertar a WebGL.
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

  useEffect(() => {
    if (!isVisible) return;

    /**
     * Protocolo de Reposo (Idle):
     * 'requestIdleCallback' permite ejecutar la inicialización pesada solo cuando
     * el navegador ha terminado de procesar el Dashboard y las animaciones iniciales.
     */
    const handleIdle = () => {
      // Fallback para navegadores que no soportan requestIdleCallback (Safari)
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          setIsIdleReady(true);
        }, { timeout: 2000 });
      } else {
        setTimeout(() => setIsIdleReady(true), 1500);
      }
    };

    handleIdle();
  }, [isVisible]);

  /**
   * handlePortalClick: Transición controlada al modo inmersivo completo.
   */
  const handlePortalClick = useCallback(() => {
    router.push("/map");
  }, [router]);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      onClick={handlePortalClick}
      className={cn(
        "group relative w-full h-full overflow-hidden bg-zinc-950 cursor-pointer transition-all duration-700",
        "rounded-[2rem] md:rounded-[3rem] border border-white/5 hover:border-primary/40 shadow-2xl"
      )}
    >
      {/* 
          FASE DE CARGA DINÁMICA: 
          Solo montamos el motor cuando el componente es visible y el sistema está ocioso.
      */}
      {isIdleReady ? (
        <div className="absolute inset-0 opacity-60 group-hover:opacity-90 transition-all duration-1000 group-hover:scale-105">
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
        <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
          <Globe className="h-8 w-8 text-white/5 animate-spin-slow" />
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/10">
            Sincronizando Resonancia
          </span>
        </div>
      )}

      {/* CAPA DE ATMÓSFERA Y GRADIENTES (Aurora System) */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-transparent z-10 pointer-events-none" />

      {/* CONTROLES E INFORMACIÓN DE LA TERMINAL */}
      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between z-20 pointer-events-none">
        <div className="flex justify-between items-start">
          <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-2xl">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-white/90">
              Madrid Live
            </span>
          </div>

          <div className="bg-primary/90 p-2.5 rounded-xl shadow-2xl shadow-primary/40 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-500">
            <Maximize2 size={14} className="text-white" />
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 p-3 rounded-2xl backdrop-blur-xl border border-primary/30 shadow-inner group-hover:bg-primary/40 transition-colors duration-500">
              <Compass className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm md:text-xl font-black text-white uppercase tracking-tighter italic leading-none drop-shadow-2xl">
                Madrid <span className="text-primary">Resonance</span>
              </h3>
              <p className="text-[9px] text-white/30 font-bold uppercase tracking-[0.2em] hidden sm:block">
                Portal de Memorias 3D
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5 opacity-40 group-hover:opacity-100 transition-all duration-700">
            <Zap size={10} className="text-yellow-500 fill-yellow-500" />
            <span className="text-[8px] font-black uppercase text-white/80 tracking-widest">
              GPU Active
            </span>
          </div>
        </div>
      </div>

      {/* BORDE DE ACTIVIDAD (Hover Effect) */}
      <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/20 rounded-[2rem] md:rounded-[3rem] transition-colors duration-1000 z-30 pointer-events-none" />

    </motion.div>
  );
}