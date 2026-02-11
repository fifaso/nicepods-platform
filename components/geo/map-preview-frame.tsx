// components/geo/map-preview-frame.tsx
// VERSIÓN: 5.4 (NicePod Resonance Engine - Total Stability Standard)
// Misión: Ventana táctica 3D con gestión de estados de estilo Gated-by-Idle.
// [FIX]: Erradicación de error 'setSprite' y violaciones de hilo principal.

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
  onIdle?: (event: any) => void; // Captura de estado de reposo de GPU
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
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 animate-pulse space-y-4">
        <Loader2 className="h-5 w-5 text-primary/40 animate-spin" />
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
          Sincronizando Frecuencias...
        </span>
      </div>
    ),
  }
);

/**
 * MapPreviewFrame: Ventana panorámica táctica para el Centro de Mando.
 */
export function MapPreviewFrame() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [currentStyle, setCurrentStyle] = useState<string>("mapbox://styles/mapbox/satellite-v9");

  // Referencia para asegurar que solo escalamos el estilo una vez
  const hasEscalatedFidelity = useRef<boolean>(false);

  /**
   * [CONFIGURACIÓN SEMÁNTICA]: initialViewState
   * Memorizado para evitar reinicializaciones que saturen la memoria de video.
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
   * [LÓGICA DE MONTAJE IDLE]:
   * Retrasamos la inyección del componente hasta que el navegador 
   * haya procesado el LCP (Largest Contentful Paint).
   */
  useEffect(() => {
    let idleId: number;

    const triggerMount = () => {
      setIsMounted(true);
    };

    const timerId = setTimeout(() => {
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        idleId = (window as any).requestIdleCallback(triggerMount);
      } else {
        triggerMount();
      }
    }, 850);

    return () => {
      clearTimeout(timerId);
      if (idleId && "cancelIdleCallback" in window) {
        (window as any).cancelIdleCallback(idleId);
      }
    };
  }, []);

  /**
   * handleMapIdle:
   * Se dispara cuando el mapa termina de cargar sus recursos base (incluyendo sprites).
   * [MEJORA]: Es el momento seguro para escalar a alta fidelidad sin errores de consola.
   */
  const handleMapIdle = useCallback(() => {
    if (!hasEscalatedFidelity.current) {
      console.log("📡 [NicePod-Resonance] Capas base listas. Escalando fidelidad...");
      setCurrentStyle("mapbox://styles/mapbox/satellite-streets-v12");
      hasEscalatedFidelity.current = true;
    }
  }, []);

  /**
   * handlePortalClick:
   * Navegación controlada al explorador de Madrid Resonance.
   */
  const handlePortalClick = useCallback(() => {
    router.push("/map");
  }, [router]);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  /**
   * [FALLBACK]: SKELETON ESTRUCTURAL
   */
  if (!isMounted) {
    return (
      <div className="w-full h-[140px] md:h-[180px] rounded-[2rem] md:rounded-[3rem] bg-zinc-950 border border-white/5 animate-pulse shadow-inner flex items-center justify-center">
        <Globe className="h-6 w-6 text-white/5 animate-spin-slow" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      onClick={handlePortalClick}
      className={cn(
        "group relative w-full overflow-hidden border border-white/10 bg-zinc-950 cursor-pointer shadow-2xl transition-all duration-700 hover:border-primary/40",
        "h-[140px] md:h-[180px] rounded-[2rem] md:rounded-[3rem]"
      )}
    >
      {/* 1. CAPA MOTOR WEBGL (Visualización Satelital) 
          Mantenemos reuseMaps en false para asegurar limpieza de WebGL Context.
      */}
      <div className="absolute inset-0 pointer-events-none opacity-60 group-hover:opacity-90 transition-all duration-1000 group-hover:scale-105">
        <MapEngine
          initialViewState={initialViewState}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: "100%", height: "100%" }}
          mapStyle={currentStyle}
          reuseMaps={false}
          attributionControl={false}
          onIdle={handleMapIdle}
        />
      </div>

      {/* 2. CAPA DE GRADIENTES (Claridad Cartográfica) */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-transparent z-10" />

      {/* 3. CAPA DE INTERFAZ TÁCTICA (HUD) */}
      <div className="absolute inset-0 p-5 md:p-8 flex flex-col justify-between z-20">

        {/* Superior: Indicador de Sincronía */}
        <div className="flex justify-between items-start">
          <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-2xl">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-white/90">
              Madrid Live
            </span>
          </div>

          {/* Acción: Maximizar */}
          <div className="bg-primary p-2.5 rounded-xl shadow-2xl shadow-primary/40 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
            <Maximize2 size={14} className="text-white" />
          </div>
        </div>

        {/* Inferior: Identidad de Nodo y Estado de GPU */}
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
                Portal de Memorias 3D
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 opacity-30 group-hover:opacity-100 transition-all duration-700">
            {!hasEscalatedFidelity.current ? (
              <Loader2 size={10} className="text-primary animate-spin" />
            ) : (
              <Zap size={10} className="text-yellow-500" />
            )}
            <span className="text-[8px] font-black uppercase text-white/60 tracking-widest">
              {hasEscalatedFidelity.current ? "GPU Link" : "Warmup"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. EFECTO AURORA PERIMETRAL */}
      <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/20 rounded-[2rem] md:rounded-[3rem] transition-colors duration-1000 z-30 pointer-events-none" />

    </motion.div>
  );
}