/**
 * ARCHIVO: components/geo/user-location-marker.tsx
 * VERSIÓN: 3.3 (NicePod GO Avatar - Stabilized Kinematics Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Representar al Voyager con escala dinámica y movimiento líquido estable.
 * [REFORMA V3.3]: Refactorización de LERP con Refs para sanar advertencia de ESLint y optimizar GPU.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";
import { Marker, useMap } from "react-map-gl/mapbox";

// --- SERVICIOS CINEMÁTICOS ---
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
 * UserLocationMarker: La representación física soberana del Voyager.
 */
const UserLocationMarkerComponent = ({ location, isResonating }: UserLocationMarkerProps) => {
  const { current: mapInstance } = useMap();

  // 1. ESTADO DE RENDERIZADO Y ESCALA
  const [renderPos, setRenderPos] = useState<KinematicPosition | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(15);
  
  // 2. MEMORIA TÉCNICA (REFS)
  // visualPosRef: Almacena la ubicación visual exacta para el cálculo del LERP sin disparar efectos.
  const visualPosRef = useRef<KinematicPosition | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  /**
   * 3. SINCRO DE ZOOM (RECEPTOR DE ESCALA)
   */
  useEffect(() => {
    if (!mapInstance) return;
    const map = mapInstance.getMap();
    
    const updateZoom = () => setCurrentZoom(map.getZoom());
    map.on('zoom', updateZoom);
    updateZoom(); // Captura inicial

    return () => {
      map.off('zoom', updateZoom);
    };
  }, [mapInstance]);

  /**
   * 4. MOTOR DE DESLIZAMIENTO (LERP ENGINE V3.3)
   * Misión: Mover el avatar hacia la telemetría cruda de forma líquida.
   * [FIX]: Se utiliza visualPosRef para eliminar la dependencia de estado en el efecto.
   */
  useEffect(() => {
    if (!location?.latitude || !location?.longitude) return;

    const targetPos: KinematicPosition = {
      latitude: location.latitude,
      longitude: location.longitude
    };

    // Caso A: Materialización inicial
    if (!visualPosRef.current) {
      visualPosRef.current = targetPos;
      setRenderPos(targetPos);
      return;
    }

    const distanceToTarget = calculateDistance(visualPosRef.current, targetPos);

    // Caso B: Salto de Autoridad (IP to GPS > 80m) -> Teletransporte inmediato
    if (distanceToTarget > 80) {
      visualPosRef.current = targetPos;
      setRenderPos(targetPos);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    // Caso C: Reposo técnico (<10cm) -> Suspensión de motor para ahorro de energía
    if (distanceToTarget < 0.1) {
      return;
    }

    // Caso D: Deslizamiento Cinematográfico (LERP 60FPS)
    const runAnimation = () => {
      if (!visualPosRef.current) return;

      // Calculamos el siguiente paso de la interpolación
      const nextStep = interpolateCoords(visualPosRef.current, targetPos);
      
      // Actualizamos la referencia (Verdad física del dibujo)
      visualPosRef.current = nextStep;
      
      // Actualizamos el estado (Trigger de renderizado UI)
      setRenderPos(nextStep);

      // Verificamos si hemos llegado para detener el bucle
      const remainingDist = calculateDistance(nextStep, targetPos);
      if (remainingDist > 0.05) {
        animationFrameRef.current = requestAnimationFrame(runAnimation);
      }
    };

    // Limpieza de bucles previos antes de iniciar uno nuevo
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(runAnimation);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [location.latitude, location.longitude]); // Dependencias limpias: solo la telemetría activa el motor.

  // 5. CÁLCULO DE ESCALA TÁCTICA
  const visualScale = useMemo(() => {
    if (currentZoom >= 17.5) return 1.0;
    if (currentZoom <= 14) return 0.65;
    return 0.65 + (currentZoom - 14) * (0.35 / 3.5);
  }, [currentZoom]);

  if (!renderPos) return null;

  const accuracy = location.accuracy || 0;
  const isRescue = accuracy >= 500; 

  const statusColorClass = isRescue
    ? "zinc"
    : isResonating
      ? "emerald"
      : "primary";

  return (
    <Marker
      latitude={renderPos.latitude}
      longitude={renderPos.longitude}
      anchor="center"
      pitchAlignment="map"
      rotationAlignment="map"
      style={{ zIndex: 9999 }}
    >
      <div 
        className="relative flex items-center justify-center pointer-events-none transition-transform duration-500 ease-out"
        style={{ 
          width: `${120 * visualScale}px`, 
          height: `${120 * visualScale}px`,
          transform: `scale(${visualScale})`
        }}
      >

        {/* I. AURA DE PRECISIÓN (ACCURACY CONE) */}
        <div
          className={cn(
            "absolute rounded-full transition-all duration-1000 ease-in-out border-2",
            isRescue
              ? "w-[220%] h-[220%] bg-zinc-500/5 border-zinc-500/10 blur-md"
              : "w-[90%] h-[90%] bg-primary/5 border-primary/20 blur-none"
          )}
        />

        {/* II. ANILLOS DE RESONANCIA SINCRO-POKÉMON */}
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

        {/* III. NÚCLEO ATÓMICO (VITAL CORE) */}
        <div className="relative z-10 flex items-center justify-center">
          <div className={cn(
            "absolute inset-0 blur-2xl rounded-full animate-pulse duration-[4000ms]",
            statusColorClass === "zinc" && "bg-zinc-500/20",
            statusColorClass === "emerald" && "bg-emerald-500/40",
            statusColorClass === "primary" && "bg-primary/40"
          )} />

          <div className={cn(
            "rounded-full border-[3px] shadow-[0_0_40px_rgba(0,0,0,0.7)] flex items-center justify-center transition-all duration-1000 bg-white",
            currentZoom > 17 ? "h-7 w-7" : "h-5 w-5",
            statusColorClass === "zinc" ? "border-zinc-500" : (statusColorClass === "emerald" ? "border-emerald-400" : "border-primary")
          )}>
            <div className={cn(
              "rounded-full animate-ping",
              currentZoom > 17 ? "h-2 w-2" : "h-1.5 w-1.5",
              statusColorClass === "zinc" ? "bg-zinc-400" : (statusColorClass === "emerald" ? "bg-emerald-400" : "bg-primary")
            )} />
          </div>
        </div>

        {/* IV. PUNTERO DE RUMBO (MAGNETIC COMPASS) */}
        {location.heading !== null && (
          <motion.div
            initial={false}
            animate={{ rotate: location.heading }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className={cn(
              "absolute filter drop-shadow-[0_0_15px_rgba(0,0,0,0.9)]",
              currentZoom > 17 ? "-top-14" : "-top-10",
              statusColorClass === "zinc" ? "text-zinc-500" : (statusColorClass === "emerald" ? "text-emerald-400" : "text-primary")
            )}
          >
            <svg 
              width={currentZoom > 17 ? "26" : "18"} 
              height={currentZoom > 17 ? "26" : "18"} 
              viewBox="0 0 20 20" 
              fill="none"
            >
              <path d="M10 0L19 16H1L10 0Z" fill="currentColor" />
            </svg>
          </motion.div>
        )}

        {/* V. INDICADOR TÉCNICO DE MATERIALIZACIÓN */}
        <AnimatePresence>
          {isRescue && currentZoom > 14 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-14 whitespace-nowrap z-[100]"
            >
              <div className="bg-black/90 backdrop-blur-2xl px-4 py-2 rounded-full border border-white/10 shadow-2xl flex items-center gap-2.5">
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-pulse" />
                <span className="text-[7.5px] font-black uppercase tracking-[0.4em] text-zinc-300">
                  Detectando Contexto...
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
 * NOTA TÉCNICA DEL ARCHITECT (V3.3):
 * 1. Dependency Shield: Se resolvió la advertencia de ESLint en Vercel mediante el uso
 *    de visualPosRef, desligando el estado de renderizado de la lógica del efecto.
 * 2. Visual Proportionality: El avatar ajusta su escala de 0.65x a 1.0x basándose en 
 *    el zoom real de Mapbox, eliminando el ruido visual en el Dashboard.
 * 3. Atomic LERP: El bucle de animación se detiene automáticamente si la distancia
 *    al objetivo es insignificante, liberando ciclos de CPU para el motor PBR.
 * 4. High-Authority UI: Los anillos y el puntero de dirección reflejan la verdad
 *    física de la sintonía (Zinc/Emerald/Primary) con total nitidez.
 */