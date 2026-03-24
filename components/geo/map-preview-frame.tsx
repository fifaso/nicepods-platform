// components/geo/map-preview-frame.tsx
// VERSIÓN: 10.0 (NicePod GO-Preview - The Smokescreen Protocol)
// Misión: Ocultar el estrés de renderizado WebGL hasta que el vuelo táctico haya concluido.
// [ESTABILIZACIÓN]: Erradicación de Jittering móvil mediante Revelado Cinemático y Fix ESLint.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, Maximize2, ShieldAlert, Zap } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";

// --- INFRAESTRUCTURA CORE ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn, nicepodLog } from "@/lib/utils";
import { PointOfInterest } from "@/types/geo-sovereignty";
import { Source } from 'react-map-gl/mapbox';
import { MapMarkerCustom } from "./map-marker-custom";
import { UserLocationMarker } from "./user-location-marker";

/**
 * INTERFAZ: MadridMapProps
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
  // [FIX ESLINT]: Añadimos el tipo explícito para el evento de carga
  onLoad?: (e: any) => void;
}

const MapEngine = dynamic<MadridMapProps>(
  () => import("react-map-gl/mapbox").then((mod) => (mod.default || mod.Map) as any),
  { ssr: false } // Quitamos el loader de dynamic porque nosotros controlaremos la UI de carga
);

const PHOTOREALISTIC_STYLE = "mapbox://styles/mapbox/satellite-streets-v12";

export const MapPreviewFrame = memo(function MapPreviewFrame() {
  const containerRef = useRef<HTMLDivElement>(null);

  // CONSUMO DE TELEMETRÍA (El Cerebro Global)
  const geoEngine = useGeoEngine();
  const {
    userLocation,
    nearbyPOIs,
    activePOI,
    initSensors,
    status: engineStatus
  } = geoEngine;

  // --- MÁQUINA DE ESTADOS DEL REVELADO CINEMÁTICO ---
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isIdleReady, setIsIdleReady] = useState<boolean>(false);
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);

  // Nivel 1: El motor WebGL descargó los tiles iniciales
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  // Nivel 2: La cámara terminó de volar hacia el usuario
  const [isCameraSettled, setIsCameraSettled] = useState<boolean>(false);

  // Referencia imperativa para el vuelo en las sombras
  const mapInstanceRef = useRef<any>(null);

  /**
   * 1. PROTOCOLO DE SEGURIDAD MATEMÁTICA (Safe Mount Observer)
   */
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setIsContainerReady(true);
          resizeObserver.disconnect();
        }
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  /**
   * 2. CONFIGURACIÓN DE CÁMARA (Nacimiento Cenital Seguro)
   * Nacemos con pitch 0 para que la compilación de matrices inicial sea barata en CPU.
   */
  const initialViewState = useMemo(() => ({
    latitude: 40.4167,
    longitude: -3.7037,
    zoom: 14.5,
    pitch: 0,
    bearing: 0
  }), []);

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
          initSensors();
        }, { timeout: 3000 });
      } else {
        setIsIdleReady(true);
        initSensors();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [isVisible, initSensors]);

  /**
   * 4. VUELO EN LAS SOMBRAS (The Ghost Flight)
   * Cuando el GPS da la señal y el mapa dice "estoy cargado", volamos
   * sin que el usuario vea el movimiento tosco.
   */
  useEffect(() => {
    // Si ya llegamos, no hacemos nada. Si falta el mapa o el GPS, esperamos.
    if (isCameraSettled || !isMapLoaded || !userLocation || !mapInstanceRef.current) return;

    nicepodLog("🎯 [MapPreview] Ejecutando vuelo cinemático en las sombras.");

    // Volamos hacia el Voyager con la perspectiva inmersiva
    mapInstanceRef.current.flyTo({
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 16.5,
      pitch: 75,
      bearing: -15,
      duration: 1500, // Vuelo rápido porque está oculto
      essential: true,
      easing: (t: number) => t * (2 - t)
    });

    // Cuando el vuelo de 1.5s termina, disolvemos la cortina de humo.
    const revealTimer = setTimeout(() => {
      setIsCameraSettled(true);
      nicepodLog("✨ [MapPreview] Vuelo finalizado. Revelando Malla Urbana.");
    }, 1600);

    return () => clearTimeout(revealTimer);
  }, [isMapLoaded, userLocation, isCameraSettled]);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }} // [FIX ESLINT]: Tailwind safe
      className={cn(
        "relative w-full h-full overflow-hidden bg-[#030303] transition-all duration-700",
        "rounded-[2.5rem] md:rounded-[3rem] border border-white/5 shadow-2xl group",
        "hover:border-primary/40 hover:shadow-[0_0_60px_rgba(var(--primary),0.1)]"
      )}
    >
      <AnimatePresence mode="wait">

        {/* ESCENARIO A: EL PERMISSION SHIELD */}
        {engineStatus === 'PERMISSION_DENIED' ? (
          <motion.div
            key="permission_denied"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-zinc-950 z-50 text-center"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse" />
              <ShieldAlert className="h-10 w-10 text-red-500 relative z-10" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-400 mb-2">
              GPS Interceptado
            </span>
            <p className="text-xs text-zinc-500 max-w-[200px] leading-relaxed">
              Active la ubicación para ver la red local.
            </p>
          </motion.div>
        ) :

          /* ESCENARIO B: CORTINA DE HUMO (Calibrando Malla) */
          /* Esta pantalla se queda mientras el mapa carga por debajo y la cámara vuela */
          !isCameraSettled ? (
            <motion.div
              key="radar_loader"
              exit={{ opacity: 0 }}
              // El z-index alto asegura que tape al mapa imperfecto
              className="absolute inset-0 flex flex-col items-center justify-center space-y-5 bg-zinc-950 z-[90]"
            >
              <div className="relative">
                <Zap className="h-8 w-8 text-primary/30 animate-pulse" />
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full animate-pulse" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white">
                  Sincronizando Órbita
                </span>
                <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-primary/60 italic">
                  {!userLocation ? "Buscando coordenadas..." : "Calibrando Fotorrealismo 3D..."}
                </span>
              </div>
            </motion.div>
          ) : null}
      </AnimatePresence>

      {/* 
          EL MOTOR INMERSIVO (SIEMPRE CARGANDO EN SEGUNDO PLANO)
          Al quitar las condicionales visuales de este bloque, obligamos al navegador
          a iniciar el trabajo de GPU en cuanto tiene dimensiones (isContainerReady), 
          pero estará oculto bajo la Cortina de Humo (z-index del loader) 
          o bajo opacity-0 si preferimos fundido puro.
      */}
      {isIdleReady && isContainerReady && (
        <motion.div
          initial={{ opacity: 0 }}
          // El mapa solo se vuelve visible cuando la cámara aterrizó
          animate={{ opacity: isCameraSettled ? 1 : 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 grayscale-[0.3] opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 z-0"
        >
          <MapEngine
            initialViewState={initialViewState}
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: "100%", height: "100%" }}
            mapStyle={PHOTOREALISTIC_STYLE}
            projection="globe"
            terrain={{ source: 'mapbox-dem', exaggeration: 1.2 }}
            maxPitch={85}
            reuseMaps={true}
            antialias={false} // Desactivado para ahorrar GPU móvil
            attributionControl={false}
            fog={fogConfig}

            // [FIX ESLINT]: Firma tipada correctamente en la interfaz
            onLoad={(e) => {
              mapInstanceRef.current = e.target;
              setIsMapLoaded(true);
            }}
          >
            <Source
              id="mapbox-dem"
              type="raster-dem"
              url="mapbox://mapbox.mapbox-terrain-dem-v1"
              tileSize={512}
              maxzoom={14}
            />

            {userLocation && (
              <UserLocationMarker
                location={userLocation}
                isResonating={!!activePOI?.isWithinRadius}
              />
            )}

            {nearbyPOIs?.map((poi: PointOfInterest) => (
              <MapMarkerCustom
                key={poi.id}
                id={poi.id.toString()}
                latitude={poi.geo_location.coordinates[1]}
                longitude={poi.geo_location.coordinates[0]}
                category_id={poi.category_id}
                name={poi.name}
                isResonating={activePOI?.id === poi.id.toString() && activePOI?.isWithinRadius}
                isSelected={false}
                onClick={() => { }}
              />
            ))}
          </MapEngine>
        </motion.div>
      )}

      {/* ELEMENTOS SUPERPUESTOS UI (Siempre Visibles) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/40 to-transparent z-10 pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-[100] flex justify-between items-end pointer-events-none">
        <Link href="/map" className="flex items-center gap-4 pointer-events-auto group/btn focus:outline-none">
          <div className="bg-primary/10 p-3.5 rounded-2xl backdrop-blur-3xl border border-primary/20 group-hover/btn:bg-primary/30 group-hover/btn:scale-110 transition-all duration-700 shadow-inner">
            <Compass className="h-5 w-5 text-primary animate-spin-slow" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-white font-black text-sm md:text-xl uppercase tracking-tighter italic leading-none drop-shadow-lg">
              Madrid <span className="text-primary">Resonance</span>
            </h3>
            <p className="text-[8px] md:text-[9px] text-zinc-300 font-bold uppercase tracking-[0.3em] mt-1.5 group-hover/btn:text-primary transition-colors drop-shadow-md">
              Explorar Mapa en Vivo
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