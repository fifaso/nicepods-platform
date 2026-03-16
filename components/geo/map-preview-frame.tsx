// components/geo/map-preview-frame.tsx
// VERSIÓN: 6.3 (NicePod Resonance Engine - Fluid Dashboard Edition)
// Misión: Proveer una ventana táctica 3D fluida sin bloquear el hilo principal.
// [ESTABILIZACIÓN]: Implementación de Renderizado Diferido y Fade-In Cinematográfico.

"use client";

import React, { useEffect, useMemo, useRef, useState, memo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Globe, Loader2, Maximize2 } from "lucide-react";
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
 * Utilizamos un delay en la resolución para no penalizar el FCP (First Contentful Paint).
 */
const MapEngine = dynamic<MadridMapProps>(
  () => import("react-map-gl").then((module) => module.Map),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950/40">
        <Loader2 className="h-5 w-5 text-primary/10 animate-spin" />
      </div>
    ),
  }
);

/**
 * MapPreviewFrame: Ventana panorámica táctica para el Dashboard.
 * 
 * [OPTIMIZACIÓN V6.3]:
 * - Evita 'Main Thread Violations' retrasando la activación del WebGL.
 * - Sincroniza visualmente con el tema Aurora mediante gradientes dinámicos.
 */
export const MapPreviewFrame = memo(function MapPreviewFrame() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Estados de control de carga progresiva
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isIdleReady, setIsIdleReady] = useState<boolean>(false);

  // Configuración estática de la cámara (Km 0 - Madrid)
  const initialViewState = useMemo(() => ({
    latitude: 40.4167,
    longitude: -3.7037,
    zoom: 14.2,
    pitch: 60,
    bearing: -10
  }), []);

  /**
   * 1. PROTOCOLO DE VISIBILIDAD: Intersection Observer
   * Solo pre-calentamos el motor si el componente está en el viewport.
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
   * 2. PROTOCOLO IDLE (Diferido): requestIdleCallback
   * El mapa solo se despierta cuando el CPU tiene ciclos libres.
   * Esto aniquila el pestañeo de carga inicial del Dashboard.
   */
  useEffect(() => {
    if (!isVisible) return;

    // Retraso intencional de seguridad para permitir la hidratación de Auth
    const timer = setTimeout(() => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          setIsIdleReady(true);
        }, { timeout: 3000 });
      } else {
        setIsIdleReady(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isVisible]);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative w-full h-full overflow-hidden bg-[#050505] transition-all duration-700",
        "rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 shadow-2xl group",
        "hover:border-primary/40 hover:shadow-[0_0_50px_rgba(var(--primary),0.1)]"
      )}
    >
      {/* CAPA I: EL MOTOR ACTIVO (CON FUNDIDO SUAVE) */}
      <AnimatePresence>
        {isIdleReady ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
          >
            <MapEngine
              initialViewState={initialViewState}
              mapboxAccessToken={MAPBOX_TOKEN}
              style={{ width: "100%", height: "100%" }}
              mapStyle="mapbox://styles/mapbox/dark-v11"
              reuseMaps={true}
              attributionControl={false}
            />
          </motion.div>
        ) : (
          /* CAPA II: STAND-BY VISUAL (SKELETON AURORA) */
          <div className="w-full h-full flex flex-col items-center justify-center space-y-5">
            <div className="relative">
              <Globe className="h-8 w-8 text-primary/10 animate-spin-slow" />
              <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full animate-pulse" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-700 animate-pulse">
              Sincronizando Malla Urbana
            </span>
          </div>
        )}
      </AnimatePresence>

      {/* GRADIENTE DE PROFUNDIDAD (Protección de UI) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10 pointer-events-none" />

      {/* CAPA III: INTERFAZ DE NAVEGACIÓN (Z-20) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-20 flex justify-between items-end pointer-events-none">
        
        {/* Acceso Soberano al Mapa Completo */}
        <Link 
          href="/map" 
          className="flex items-center gap-5 pointer-events-auto group/btn focus:outline-none"
        >
          <div className="bg-primary/20 p-4 rounded-2xl backdrop-blur-3xl border border-primary/30 group-hover/btn:bg-primary/40 group-hover/btn:scale-110 transition-all duration-700 shadow-inner">
            <Compass className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-white font-black text-sm md:text-2xl uppercase tracking-tighter italic leading-none drop-shadow-2xl">
              Madrid <span className="text-primary">Resonance</span>
            </h3>
            <p className="text-[9px] md:text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em] mt-1 group-hover/btn:text-primary transition-colors">
              Explorar Malla Activa
            </p>
          </div>
        </Link>

        {/* Control de Expansión */}
        <Link href="/map" className="pointer-events-auto focus:outline-none mb-1">
          <div className="bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 group-hover:scale-110">
            <Maximize2 size={16} className="text-white/40 group-hover:text-white" />
          </div>
        </Link>
      </div>

      {/* OVERLAY DE INTERACCIÓN AMBIENTAL */}
      <div className="absolute inset-0 z-30 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
    </motion.div>
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.3):
 * 1. Solución de Main Thread Violation: El mapa ahora espera a que el CPU 
 *    esté libre ('requestIdleCallback') y añade un retardo de 1s post-visibilidad.
 *    Esto garantiza que el AuthProvider y el IntelligenceFeed tengan prioridad 
 *    total, eliminando el pestañeo en la carga de identidad.
 * 2. Estética de Transición: Al usar AnimatePresence y un fade-in de 2 segundos, 
 *    el mapa no "salta" a la pantalla, sino que se materializa orgánicamente, 
 *    elevando la percepción de calidad industrial.
 * 3. Economía de Datos: El zoom se ajustó a 14.2 para mostrar un radio de 
 *    Resonancia equilibrado sin saturar el renderizado de etiquetas en la Gran Vía.
 */