// components/geo/map-preview-frame.tsx
// VERSIÓN: 10.2 (NicePod GO-Preview - Immutable Configuration Edition)
// Misión: Ventana táctica fotorrealista con carga invisible y protección de motor WebGL.
// [ESTABILIZACIÓN]: Memoización estricta de Terrain/Fog para evitar errores de 'Source removal'.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, Maximize2, ShieldAlert, Zap } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

// --- MOTOR CARTOGRÁFICO (COMPONENTES) ---
import { Layer, Source } from 'react-map-gl/mapbox';

// --- INFRAESTRUCTURA CORE ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn, nicepodLog } from "@/lib/utils";
import { PointOfInterest } from "@/types/geo-sovereignty";
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
  onLoad?: (e: any) => void;
  onMoveEnd?: (e: any) => void;
  children?: React.ReactNode;
}

const MapEngine = dynamic<MadridMapProps>(
  () => import("react-map-gl/mapbox").then((mod) => (mod.default || mod.Map) as any),
  { ssr: false }
);

const PHOTOREALISTIC_STYLE = "mapbox://styles/mapbox/satellite-streets-v12";

/**
 * MapPreviewFrame: El widget de visualización táctica para el Dashboard inicial.
 */
export const MapPreviewFrame = memo(function MapPreviewFrame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Consumo de Telemetría Global
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
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [isCameraSettled, setIsCameraSettled] = useState<boolean>(false);

  const hasInitialJumpPerformed = useRef<boolean>(false);

  /**
   * [FIX CRÍTICO]: MEMOIZACIÓN DE CONFIGURACIÓN
   * Garantiza que las referencias a Terrain y Fog sean inmutables, 
   * evitando que el motor intente remover fuentes en uso.
   */
  const terrainConfiguration = useMemo(() => ({
    source: 'mapbox-dem',
    exaggeration: 1.2
  }), []);

  const fogConfiguration = useMemo(() => ({
    "range": [0.8, 8],
    "color": "#020202",
    "horizon-blend": 0.3,
    "high-color": "#0f172a",
    "space-color": "#000000",
    "star-intensity": 0.4
  }), []);

  /**
   * 1. PROTOCOLO DE SEGURIDAD MATEMÁTICA (Safe Mount)
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
   * 2. CONFIGURACIÓN DE CÁMARA (Carga de Proximidad)
   * Nacemos a poca altura (Z14) y con vista plana para reducir el consumo inicial de red.
   */
  const initialViewState = useMemo(() => ({
    latitude: userLocation?.latitude || 40.4167,
    longitude: userLocation?.longitude || -3.7037,
    zoom: 14.5,
    pitch: 0,
    bearing: 0
  }), [userLocation]);

  const buildingLayerConfig = useMemo(() => ({
    id: "3d-buildings-preview",
    source: "composite",
    "source-layer": "building",
    filter: ["==", "extrude", "true"],
    type: "fill-extrusion",
    minzoom: 14,
    paint: {
      "fill-extrusion-color": "#080808",
      "fill-extrusion-height": ["get", "height"],
      "fill-extrusion-base": ["get", "min_height"],
      "fill-extrusion-opacity": 0.6,
    },
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
    }, 400);
    return () => clearTimeout(timer);
  }, [isVisible, initSensors]);

  /**
   * 4. SALTO TÁCTICO EN LAS SOMBRAS
   * Dispara el vuelo hacia la Experiencia GO solo cuando el motor está listo.
   */
  useEffect(() => {
    if (isCameraSettled || !isMapLoaded || !userLocation || !mapInstanceRef.current) return;

    nicepodLog("🎯 [MapPreview] Ejecutando vuelo cinemático hacia Voyager.");

    mapInstanceRef.current.flyTo({
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 15.8,
      pitch: 75,
      bearing: -15,
      duration: 2000,
      essential: true,
      easing: (t: number) => t * (2 - t)
    });

    hasInitialJumpPerformed.current = true;
  }, [isMapLoaded, userLocation, isCameraSettled]);

  /**
   * 5. EL REVELADO (The Transition)
   */
  const handleMoveEnd = useCallback(() => {
    if (hasInitialJumpPerformed.current && !isCameraSettled) {
      setIsCameraSettled(true);
      nicepodLog("✨ [MapPreview] Malla fotorrealista estabilizada.");
    }
  }, [isCameraSettled]);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className={cn(
        "relative w-full h-full overflow-hidden bg-[#030303] transition-all duration-700",
        "rounded-[2.5rem] md:rounded-[3rem] border border-white/5 shadow-2xl group",
        "hover:border-primary/40 hover:shadow-[0_0_60px_rgba(var(--primary),0.1)]"
      )}
    >
      <AnimatePresence mode="wait">

        {/* PERMISSION SHIELD */}
        {engineStatus === 'PERMISSION_DENIED' ? (
          <motion.div
            key="p_denied" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-zinc-950 z-50 text-center"
          >
            <ShieldAlert className="h-10 w-10 text-red-500 mb-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-400">GPS Bloqueado</span>
            <p className="text-xs text-zinc-500 mt-2 max-w-[200px] leading-relaxed uppercase">Habilite el GPS para ver la red.</p>
          </motion.div>
        ) :

          /* SMOKESCREEN LOADER */
          !isCameraSettled ? (
            <motion.div
              key="smokescreen" exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center space-y-5 bg-zinc-950 z-[90]"
            >
              <div className="relative">
                <Zap className="h-8 w-8 text-primary/30 animate-pulse" />
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full animate-pulse" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white italic">
                  {!userLocation ? "Localizando Voyager" : "Calibrando 3D"}
                </span>
              </div>
            </motion.div>
          ) : null}
      </AnimatePresence>

      {/* MOTOR WEBGL (BACKGROUND WORKER) */}
      {isIdleReady && isContainerReady && (
        <motion.div
          animate={{ opacity: isCameraSettled ? 1 : 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          <MapEngine
            initialViewState={initialViewState}
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: "100%", height: "100%" }}
            mapStyle={PHOTOREALISTIC_STYLE}
            projection="mercator"
            terrain={terrainConfiguration}
            maxPitch={82}
            reuseMaps={true}
            antialias={false}
            attributionControl={false}
            fog={fogConfiguration}
            onLoad={(e) => {
              mapInstanceRef.current = e.target;
              setIsMapLoaded(true);
            }}
            onMoveEnd={handleMoveEnd}
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

            {isMapLoaded && (
              <Layer {...buildingLayerConfig as any} />
            )}
          </MapEngine>
        </motion.div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-transparent z-10 pointer-events-none" />

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
              Malla Satelital Activa
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