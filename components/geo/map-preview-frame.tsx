// components/geo/map-preview-frame.tsx
// VERSIÓN: 9.3 (NicePod GO-Preview - The Safe Mount Final Edition)
// Misión: Ventana táctica fotorrealista que rastrea y centra al Voyager.
// [ESTABILIZACIÓN]: Fusión total de Auto-Centrado, Proyección Mercator y Fix de Tipos Vercel.

"use client";

import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Loader2, Maximize2, Zap } from "lucide-react";

// --- INFRAESTRUCTURA CORE ---
import { cn } from "@/lib/utils";
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { UserLocationMarker } from "./user-location-marker";
import { MapMarkerCustom } from "./map-marker-custom";
import { PointOfInterest } from "@/types/geo-sovereignty";

/**
 * INTERFAZ: MadridMapProps
 * [BUILD SHIELD]: Contrato blindado para la importación dinámica del motor WebGL.
 * Incluye 'children' para evitar que el compilador rechace los marcadores anidados.
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
  fog?: any;
  antialias?: boolean;
  projection?: string;
  terrain?: any;
  maxPitch?: number;
  children?: React.ReactNode; 
}

/**
 * [SHIELD]: MapEngine
 * Carga diferida del motor Mapbox apuntando al sub-path explícito de Vercel.
 * Esto aniquila el error 'Module not found: Package path . is not exported'.
 */
const MapEngine = dynamic<MadridMapProps>(
  () => import("react-map-gl/mapbox").then((mod) => (mod.default || mod.Map) as any),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950/40">
        <Loader2 className="h-5 w-5 text-primary/10 animate-spin" />
      </div>
    ),
  }
);

// [SALTO FOTORREALISTA]: Estética base satelital
const PHOTOREALISTIC_STYLE = "mapbox://styles/mapbox/satellite-streets-v12";

export const MapPreviewFrame = memo(function MapPreviewFrame() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Consumo del cerebro geoespacial (Elevado desde RootLayout)
  const geoEngine = useGeoEngine();
  const { userLocation, nearbyPOIs, activePOI, initSensors } = geoEngine;

  // Máquina de estados de montaje seguro
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isIdleReady, setIsIdleReady] = useState<boolean>(false);
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);

  /**
   * 1. PROTOCOLO DE SEGURIDAD MATEMÁTICA (Safe Mount Observer)
   * Evita colapsos de GPU (RangeError) asegurando que el lienzo tenga 
   * dimensiones reales (>0px) antes de despertar el motor WebGL.
   */
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setIsContainerReady(true);
          resizeObserver.disconnect(); // Solo necesitamos la primera confirmación vital
        }
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  /**
   * 2. CONFIGURACIÓN DE CÁMARA DINÁMICA (Auto-Centrado)
   * Sintoniza el centro de la cámara con la posición real del Voyager si está disponible.
   */
  const initialViewState = useMemo(() => ({
    latitude: userLocation?.latitude || 40.4167,
    longitude: userLocation?.longitude || -3.7037,
    zoom: 15.2, // Zoom de escáner de media altitud
    pitch: 75,  // Perspectiva 'Pokémon GO'
    bearing: -15
  }), [userLocation]);

  /**
   * ATMÓSFERA SOBERANA (Mapbox v3 Fog API)
   * Fusiona el horizonte con el color de fondo para ahorrar texturas lejanas.
   */
  const fogConfig = useMemo(() => ({
    "range": [0.8, 8],
    "color": "#020202",
    "horizon-blend": 0.3,
    "high-color": "#0f172a",
    "space-color": "#000000",
    "star-intensity": 0.4
  }), []);

  /**
   * 3. MONITOR DE VISIBILIDAD E IGNICIÓN
   * Activa los sensores solo cuando la ventana entra en el campo visual del usuario.
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          setIsIdleReady(true);
          initSensors(); // Despertar hardware GPS proactivamente
        }, { timeout: 3000 });
      } else {
        setIsIdleReady(true);
        initSensors();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [isVisible, initSensors]);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative w-full h-full overflow-hidden bg-[#030303] transition-all duration-700",
        "rounded-[2.5rem] md:rounded-[3rem] border border-white/5 shadow-2xl group",
        "hover:border-primary/40 hover:shadow-[0_0_60px_rgba(var(--primary),0.1)]"
      )}
    >
      <AnimatePresence>
        {isIdleReady && isContainerReady ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 grayscale-[0.3] opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
          >
            <MapEngine
              initialViewState={initialViewState}
              mapboxAccessToken={MAPBOX_TOKEN}
              style={{ width: "100%", height: "100%" }}
              mapStyle={PHOTOREALISTIC_STYLE}
              
              // [ESCUDO MATEMÁTICO]: Evita el colapso en pitch elevados
              projection="mercator"
              terrain={{ source: 'mapbox-dem', exaggeration: 1.2 }}
              maxPitch={80}
              
              reuseMaps={true}
              antialias={true}
              attributionControl={false}
              fog={fogConfig}
            >
              {/* I. EL VOYAGER (Avatar de Resonancia) */}
              {userLocation && (
                <UserLocationMarker 
                  location={userLocation} 
                  isResonating={!!activePOI?.isWithinRadius} 
                />
              )}

              {/* II. LA MALLA ACTIVA (Ecos del Entorno) */}
              {nearbyPOIs?.map((poi: PointOfInterest) => (
                <MapMarkerCustom
                  key={poi.id}
                  id={poi.id.toString()}
                  latitude={poi.geo_location.coordinates[1]}
                  longitude={poi.geo_location.coordinates[0]}
                  category_id={poi.category_id}
                  name={poi.name}
                  isResonating={activePOI?.id === poi.id.toString() && activePOI?.isWithinRadius}
                  isSelected={false} // Interacción delegada a la pantalla completa
                  onClick={() => {
                    nicepodLog("Apertura de Malla solicitada por táctica visual.");
                  }}
                />
              ))}
            </MapEngine>
          </motion.div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-5">
            <div className="relative">
              <Zap className="h-8 w-8 text-primary/20 animate-pulse" />
              <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full animate-pulse" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-800 animate-pulse">
              Localizando Nodo de Usuario...
            </span>
          </div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/40 to-transparent z-10 pointer-events-none" />

      {/* INTERFAZ DE EXPANSIÓN SOBERANA */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20 flex justify-between items-end pointer-events-none">
        <Link href="/map" className="flex items-center gap-4 pointer-events-auto group/btn focus:outline-none">
          <div className="bg-primary/10 p-3.5 rounded-2xl backdrop-blur-3xl border border-primary/20 group-hover/btn:bg-primary/30 group-hover/btn:scale-110 transition-all duration-700 shadow-inner">
            <Compass className="h-5 w-5 text-primary animate-spin-slow" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-white font-black text-sm md:text-xl uppercase tracking-tighter italic leading-none drop-shadow-lg">
              Madrid <span className="text-primary">Resonance</span>
            </h3>
            <p className="text-[8px] md:text-[9px] text-zinc-300 font-bold uppercase tracking-[0.3em] mt-1.5 group-hover/btn:text-primary transition-colors drop-shadow-md">
              Navegar Malla Satelital
            </p>
          </div>
        </Link>

        <Link href="/map" className="pointer-events-auto focus:outline-none mb-1">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 hover:bg-white/20 hover:text-white transition-all duration-500 group-hover:scale-110">
            <Maximize2 size={14} className="text-white transition-colors" />
          </div>
        </Link>
      </div>
    </motion.div>
  );
});