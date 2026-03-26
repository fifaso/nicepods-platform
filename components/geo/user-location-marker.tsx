// components/geo/user-location-marker.tsx
// VERSIÓN: 3.0 (NicePod GO Avatar - Liquid Motion & LERP Edition)
// Misión: Representar al usuario en la malla con interpolación de movimiento físico.
// [ESTABILIZACIÓN]: Implementación de requestAnimationFrame LERP para eliminar saltos de GPS.

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Marker } from "react-map-gl/mapbox";

import { cn } from "@/lib/utils";
import { UserLocation } from "@/types/geo-sovereignty";
import { interpolateCoords, calculateDistance, KinematicPosition } from "@/lib/geo-kinematics";

interface UserLocationMarkerProps {
  location: UserLocation;
  isResonating: boolean;
}

const UserLocationMarkerComponent = ({ location, isResonating }: UserLocationMarkerProps) => {

  // 1. ESTADO CINEMÁTICO (Interpolación Local)
  // [MANDATO V2.7]: El avatar no salta, se desliza. Guardamos la posición actual 
  // independiente de la que nos envía el GPS para calcular el camino intermedio.
  const [currentPos, setCurrentPos] = useState<KinematicPosition>({
    latitude: location.latitude,
    longitude: location.longitude
  });

  const animationFrameRef = useRef<number | null>(null);

  /**
   * 2. MOTOR DE DESLIZAMIENTO (LERP LOOP)
   * Misión: Mover el avatar hacia la nueva coordenada del GPS píxel a píxel a 60fps.
   */
  useEffect(() => {
    if (!location?.latitude || !location?.longitude) return;

    const targetPos: KinematicPosition = {
      latitude: location.latitude,
      longitude: location.longitude
    };

    const dist = calculateDistance(currentPos, targetPos);

    // [FAIL-SAFE]: Si el salto es masivo (>50m, ej: IP Fallback a GPS Lock),
    // no caminamos; nos teletransportamos para no frustrar al Voyager.
    if (dist > 50) {
      setCurrentPos(targetPos);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    // Si la distancia es insignificante, detenemos el motor de render para salvar CPU.
    if (dist < 0.1) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const animateMovement = () => {
      setCurrentPos(prev => {
        // Interpolamos hacia el target usando la matemática central de NicePod
        const next = interpolateCoords(prev, targetPos);
        return next;
      });

      animationFrameRef.current = requestAnimationFrame(animateMovement);
    };

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(animateMovement);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.latitude, location.longitude]); // Dependemos solo del target físico

  // 3. PROTOCOLO DE VISIBILIDAD OBLIGATORIA
  if (!currentPos.latitude || !currentPos.longitude) return null;

  /**
   * EVALUACIÓN DE AUTORIDAD DEL DATO
   */
  const accuracy = location.accuracy || 0;
  const isRescue = accuracy >= 500;
  
  // Selección de colorimetría industrial
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
      // pitchAlignment="map" acuesta los anillos en el suelo para inmersión 3D.
      pitchAlignment="map"
      // rotationAlignment="map" vincula la orientación al norte del mapa.
      rotationAlignment="map"
      // Z-Shield: Elevación máxima para evitar ser tapado por edificios de obsidiana
      style={{ zIndex: 9999 }}
    >
      <div className="relative flex items-center justify-center w-32 h-32 pointer-events-none">

        {/* 
            I. ACCURACY AURA (Círculo de Incertidumbre)
            Representa visualmente la precisión del GPS.
        */}
        <div 
          className={cn(
            "absolute rounded-full transition-all duration-1000 ease-in-out border-2",
            isRescue 
              ? "w-64 h-64 bg-zinc-500/5 border-zinc-500/10 blur-sm" 
              : "w-24 h-24 bg-primary/5 border-primary/20 blur-none"
          )}
        />

        {/* 
            II. ANILLOS DE RESONANCIA (GPU ACCELERATED) 
            [MANDATO V2.7]: Uso de CSS keyframes puros.
        */}
        <div className="absolute inset-0 flex items-center justify-center w-32 h-32">
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

        {/* 
            III. NÚCLEO FÍSICO (EL ÁTOMO VOYAGER) 
        */}
        <div className="relative z-10 flex items-center justify-center">
          {/* Aura de brillo para contraste con texturas satelitales */}
          <div className={cn(
            "absolute inset-0 blur-xl rounded-full animate-pulse duration-[4000ms]",
            statusColorClass === "zinc" && "bg-zinc-500/30",
            statusColorClass === "emerald" && "bg-emerald-500/40",
            statusColorClass === "primary" && "bg-primary/40"
          )} />

          {/* El núcleo sólido */}
          <div className={cn(
            "h-7 w-7 bg-white rounded-full border-[4px] shadow-[0_0_30px_rgba(0,0,0,0.6)] flex items-center justify-center transition-colors duration-700",
            statusColorClass === "zinc" && "border-zinc-500",
            statusColorClass === "emerald" && "border-emerald-500",
            statusColorClass === "primary" && "border-primary"
          )}>
            {/* Ping de vida interno */}
            <div className={cn(
              "h-2 w-2 rounded-full animate-ping",
              statusColorClass === "zinc" && "bg-zinc-400",
              statusColorClass === "emerald" && "bg-emerald-400",
              statusColorClass === "primary" && "bg-primary"
            )} />
          </div>
        </div>

        {/* 
            IV. PUNTERO DE DIRECCIÓN (THE COMPASS CONE)
            Sincronizado con el giroscopio mediante Framer Motion para suavidad.
        */}
        {location.heading !== null && (
          <motion.div
            initial={false}
            animate={{ rotate: location.heading }}
            transition={{ type: "spring", stiffness: 120, damping: 25 }}
            className={cn(
              "absolute -top-10 filter drop-shadow-[0_0_12px_rgba(0,0,0,0.9)]",
              statusColorClass === "zinc" && "text-zinc-500",
              statusColorClass === "emerald" && "text-emerald-400",
              statusColorClass === "primary" && "text-primary"
            )}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 0L19 15H1L10 0Z" fill="currentColor" />
            </svg>
          </motion.div>
        )}

        {/* 
            V. INDICADOR DE ESTADO (TECHNICAL OVERLAY)
            Solo visible en fases de baja precisión o rescate.
        */}
        <AnimatePresence>
          {isRescue && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-12 whitespace-nowrap z-50"
            >
              <div className="bg-black/80 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10 shadow-2xl flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-pulse" />
                <span className="text-[7px] font-black uppercase tracking-[0.3em] text-zinc-300">
                  Estimando Malla por IP...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </Marker>
  );
};

// Se elimina el uso de React.memo para permitir que el requestAnimationFrame 
// interno repinte las coordenadas de interpolación sin ser bloqueado por React.
export const UserLocationMarker = UserLocationMarkerComponent;

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Liquid Motion (LERP): El avatar ya no usa directamente las coordenadas del GPS, 
 *    sino un estado interpolado ('currentPos'). Cuando el GPS envía un nuevo dato, 
 *    el avatar 'camina' hacia ese dato frame a frame, eliminando el efecto 'teletransporte'.
 * 2. Sincronía Cinemática: Al usar la misma matemática de interpolación que el 
 *    'CameraController', el movimiento del mapa y el del usuario son idénticos, 
 *    creando una ilusión de estabilidad perfecta en el centro de la pantalla.
 * 3. Z-Index y Oclusión: El marcador se eleva a z-9999 para garantizar visibilidad 
 *    incluso en ángulos extremos con el motor Mapbox Standard.
 */