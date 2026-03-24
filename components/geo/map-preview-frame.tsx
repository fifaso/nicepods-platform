// components/geo/map-preview-frame.tsx
// VERSIÓN: 9.3 (NicePod GO-Preview - Horizon Restoration Edition)
// Misión: Ventana táctica fotorrealista del Dashboard con horizonte infinito.
// [ESTABILIZACIÓN]: Implementación de Cámara Escalonada para habilitar proyección Globe.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, Loader2, Maximize2, ShieldAlert, Zap } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";

// --- INFRAESTRUCTURA CORE ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn } from "@/lib/utils";
import { PointOfInterest } from "@/types/geo-sovereignty";
import { Source } from 'react-map-gl/mapbox';
import { MapMarkerCustom } from "./map-marker-custom";
import { UserLocationMarker } from "./user-location-marker";

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

const PHOTOREALISTIC_STYLE = "mapbox://styles/mapbox/satellite-streets-v12";

export const MapPreviewFrame = memo(function MapPreviewFrame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null); // Ref for flyTo control
  const geoEngine = useGeoEngine();
  const { userLocation, nearbyPOIs, activePOI, initSensors, status: engineStatus } = geoEngine;

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isIdleReady, setIsIdleReady] = useState<boolean>(false);
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  // Safe Mount Observer
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
   * CÁMARA ESCALONADA (Fase 1: Ignición)
   * Nace en 60° para que el 'globe' no colapse al compilar matrices iniciales.
   */
  const initialViewState = useMemo(() => ({
    latitude: userLocation?.latitude || 40.4167,
    longitude: userLocation?.longitude || -3.7037,
    zoom: 15.2,
    pitch: 60,
    bearing: -15
  }), [userLocation]);

  /**
   * AUTO-LOCALIZACIÓN CINEMÁTICA (Fase 2: Inmersión)
   * Una vez cargado el mapa, levanta la mirada hacia el horizonte (75°).
   */
  useEffect(() => {
    if (isMapLoaded && userLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 15.8,
        pitch: 75,
        duration: 3500,
        curve: 1.2
      });
    }
  }, [isMapLoaded, userLocation]);

  const fogConfig = useMemo(() => ({
    "range": [0.5, 10],
    "color": "#020202",
    "horizon-blend": 0.2,
    "high-color": "#0f172a",
    "space-color": "#000000",
    "star-intensity": 0.5
  }), []);

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
      <AnimatePresence mode="wait">

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
              NicePod necesita acceso a tu ubicación. Habilita los sensores en los ajustes.
            </p>
          </motion.div>
        ) :

          isIdleReady && isContainerReady ? (
            <motion.div
              key="map_engine"
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

                // [RESTAURACIÓN DE INMERSIÓN]: Globe permite el horizonte, Safe Mount previene el crash.
                projection="globe"
                terrain={{ source: 'mapbox-dem', exaggeration: 1.2 }}
                maxPitch={85}

                reuseMaps={true}
                antialias={true}
                attributionControl={false}
                fog={fogConfig}

                // Evento clave para disparar el salto cinematográfico
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore - Bypass temporal para el onReactLoad nativo
                onLoad={(e) => {
                  mapRef.current = e.target;
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
          ) :
            (
              <motion.div
                key="radar_loader"
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center space-y-5 bg-zinc-950/80"
              >
                <div className="relative">
                  <Zap className="h-8 w-8 text-primary/20 animate-pulse" />
                  <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full animate-pulse" />
                </div>
                <span className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-800 animate-pulse">
                  Localizando Nodo de Usuario...
                </span>
              </motion.div>
            )}

      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/40 to-transparent z-10 pointer-events-none" />

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