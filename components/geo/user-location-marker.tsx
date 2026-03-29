/**
 * ARCHIVO: components/geo/user-location-marker.tsx
 * VERSIÓN: 3.2 (NicePod GO Avatar - Zoom-Reactive & High-Authority Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Representar al Voyager con escala dinámica y movimiento líquido.
 * [REFORMA V3.2]: Implementación de escalado reactivo al Zoom para Dashboard vs Mapa.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";
import { Marker, useMap } from "react-map-gl/mapbox";

import {
  calculateDistance,
  interpolateCoords,
  KinematicPosition
} from "@/lib/geo-kinematics";
import { cn } from "@/lib/utils";
import { UserLocation } from "@/types/geo-sovereignty";

interface UserLocationMarkerProps {
  location: UserLocation;
  isResonating: boolean;
}

/**
 * UserLocationMarker: La entidad física del Voyager.
 */
const UserLocationMarkerComponent = ({ location, isResonating }: UserLocationMarkerProps) => {
  const { current: mapInstance } = useMap();

  // 1. ESTADO CINEMÁTICO (LERP)
  const [currentPos, setCurrentPos] = useState<KinematicPosition | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(15);
  const animationFrameRef = useRef<number | null>(null);

  /**
   * 2. MOTOR DE ESCALA REACTIVA (ZOOM AWARE)
   * Captura el zoom del mapa para ajustar el tamaño del avatar.
   */
  useEffect(() => {
    if (!mapInstance) return;
    const map = mapInstance.getMap();
    
    const updateZoom = () => setCurrentZoom(map.getZoom());
    map.on('zoom', updateZoom);
    updateZoom(); // Sync inicial

    return () => { map.off('zoom', updateZoom); };
  }, [mapInstance]);

  /**
   * 3. MOTOR DE DESLIZAMIENTO LERP
   */
  useEffect(() => {
    if (!location?.latitude || !location?.longitude) return;

    const targetPos: KinematicPosition = {
      latitude: location.latitude,
      longitude: location.longitude
    };

    if (!currentPos) {
      setCurrentPos(targetPos);
      return;
    }

    const dist = calculateDistance(currentPos, targetPos);

    // Protocolo de Salto de Autoridad (>80m)
    if (dist > 80) {
      setCurrentPos(targetPos);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    // Protocolo de Reposo (<10cm)
    if (dist < 0.1) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const animateMovement = () => {
      setCurrentPos(prev => {
        if (!prev) return targetPos;
        return interpolateCoords(prev, targetPos);
      });
      animationFrameRef.current = requestAnimationFrame(animateMovement);
    };

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(animateMovement);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [location.latitude, location.longitude]);

  // 4. CÁLCULO DE DIMENSIONES DINÁMICAS
  // El factor de escala reduce el tamaño en zooms bajos (Dashboard)
  const visualScale = useMemo(() => {
    if (currentZoom >= 17) return 1.0;
    if (currentZoom <= 14) return 0.6;
    return 0.6 + (currentZoom - 14) * 0.133;
  }, [currentZoom]);

  if (!currentPos) return null;

  const accuracy = location.accuracy || 0;
  const isRescue = accuracy >= 500; 

  const statusColorClass = isRescue
    ? "zinc"
    : isResonating
      ? "emerald"
      : "primary";

  return (
    <Marker
      latitude={currentPos.latitude}
      longitude={currentPos.longitude}
      anchor="center"
      pitchAlignment="map"
      rotationAlignment="map"
      style={{ zIndex: 9999 }} // Z-Shield Soberano
    >
      <div 
        className="relative flex items-center justify-center pointer-events-none transition-transform duration-300"
        style={{ 
          width: `${128 * visualScale}px`, 
          height: `${128 * visualScale}px`,
          transform: `scale(${visualScale})`
        }}
      >

        {/* I. ACCURACY AURA (Reactiva al Zoom) */}
        <div
          className={cn(
            "absolute rounded-full transition-all duration-1000 ease-in-out border-2",
            isRescue
              ? "w-[200%] h-[200%] bg-zinc-500/5 border-zinc-500/10 blur-sm"
              : "w-[80%] h-[80%] bg-primary/5 border-primary/20 blur-none"
          )}
        />

        {/* II. ANILLOS DE RESONANCIA */}
        <div className="absolute inset-0 flex items-center justify-center w-full h-full">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "absolute rounded-full border opacity-0 animate-nicepod-pulse",
                statusColorClass === "zinc" && "border-zinc-500/30 bg-zinc-500/5",
                statusColorClass === "emerald" && "border-emerald-500/60 bg-emerald-500/10",
                statusColorClass === "primary" && "border-primary/50 bg-primary/5"
              )}
              style={{
                width: '100%',
                height: '100%',
                animationDelay: `${(i - 1) * 1.3}s`,
              }}
            />
          ))}
        </div>

        {/* III. NÚCLEO FÍSICO (VITAL SIGNS) */}
        <div className="relative z-10 flex items-center justify-center">
          <div className={cn(
            "absolute inset-0 blur-xl rounded-full animate-pulse duration-[4000ms]",
            statusColorClass === "zinc" && "bg-zinc-500/30",
            statusColorClass === "emerald" && "bg-emerald-500/40",
            statusColorClass === "primary" && "bg-primary/40"
          )} />

          <div className={cn(
            "rounded-full border-[4px] shadow-[0_0_30px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all duration-1000 bg-white",
            // Tamaño adaptativo del núcleo
            currentZoom > 17 ? "h-7 w-7 border-[4px]" : "h-5 w-5 border-[3px]",
            statusColorClass === "zinc" ? "border-zinc-500" : (statusColorClass === "emerald" ? "border-emerald-500" : "border-primary")
          )}>
            <div className={cn(
              "rounded-full animate-ping",
              currentZoom > 17 ? "h-2 w-2" : "h-1.5 w-1.5",
              statusColorClass === "zinc" ? "bg-zinc-400" : (statusColorClass === "emerald" ? "bg-emerald-400" : "bg-primary")
            )} />
          </div>
        </div>

        {/* IV. PUNTERO DE DIRECCIÓN (COMPASS LOCK) */}
        {location.heading !== null && (
          <motion.div
            initial={false}
            animate={{ rotate: location.heading }}
            transition={{ type: "spring", stiffness: 120, damping: 25 }}
            className={cn(
              "absolute filter drop-shadow-[0_0_12px_rgba(0,0,0,0.9)]",
              currentZoom > 17 ? "-top-12" : "-top-8", // Ajuste de posición según zoom
              statusColorClass === "zinc" ? "text-zinc-500" : (statusColorClass === "emerald" ? "text-emerald-400" : "text-primary")
            )}
          >
            <svg 
              width={currentZoom > 17 ? "24" : "16"} 
              height={currentZoom > 17 ? "24" : "16"} 
              viewBox="0 0 20 20" 
              fill="none"
            >
              <path d="M10 0L19 15H1L10 0Z" fill="currentColor" />
            </svg>
          </motion.div>
        )}

        {/* V. INDICADOR TÉCNICO (Solo en modo IP) */}
        <AnimatePresence>
          {isRescue && currentZoom > 14 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-14 whitespace-nowrap z-50"
            >
              <div className="bg-black/80 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10 shadow-2xl flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-pulse" />
                <span className="text-[7px] font-black uppercase tracking-[0.3em] text-zinc-300">
                  Estimando Malla...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </Marker>
  );
};

export const UserLocationMarker = UserLocationMarkerComponent;

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.2):
 * 1. Zoom-Reactive Scale: Se introdujo visualScale para que el avatar no ocluya
 *    el mapa en vistas alejadas (Dashboard), manteniendo la elegancia visual.
 * 2. Adaptive Compass: El puntero de dirección cambia su tamaño y distancia para
 *    ser siempre legible sin importar el nivel de zoom.
 * 3. Z-Shield Integrity: El marcador mantiene su soberanía en el z-index: 9999
 *    para atravesar la arquitectura PBR de Mapbox Standard.
 * 4. High-Fidelity Sync: Se utiliza useMap para sincronizar el estado visual
 *    del avatar con los gestos de cámara del usuario en tiempo real.
 */