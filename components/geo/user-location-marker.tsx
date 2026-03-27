// components/geo/user-location-marker.tsx
// VERSIÓN: 3.1 (NicePod GO Avatar - Liquid Motion & High-Authority Edition)
// Misión: Representar al usuario en la malla con movimiento fluido garantizado por LERP.
// [ESTABILIZACIÓN]: Implementación de requestAnimationFrame para eliminar saltos visuales.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Marker } from "react-map-gl/mapbox";

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
 * UserLocationMarker: La entidad física del Voyager en la Malla de Madrid.
 * [MANDATO V2.7]: El avatar no salta, se desliza. Sincronía Pokémon GO.
 */
const UserLocationMarkerComponent = ({ location, isResonating }: UserLocationMarkerProps) => {

  // 1. ESTADO CINEMÁTICO (Interpolación Local)
  // Misión: Mantener una posición visual independiente de la señal cruda del GPS.
  const [currentPos, setCurrentPos] = useState<KinematicPosition | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  /**
   * 2. MOTOR DE DESLIZAMIENTO (LERP LOOP)
   * Misión: Mover el avatar hacia la nueva coordenada del GPS de forma líquida.
   */
  useEffect(() => {
    if (!location?.latitude || !location?.longitude) return;

    const targetPos: KinematicPosition = {
      latitude: location.latitude,
      longitude: location.longitude
    };

    // Si es el primer fix, materializamos instantáneamente
    if (!currentPos) {
      setCurrentPos(targetPos);
      return;
    }

    const dist = calculateDistance(currentPos, targetPos);

    // [PROTOCOLOS DE MOVIMIENTO]:
    // A. Salto de Autoridad: Si la distancia es > 80m (IP a GPS Lock), teletransportamos.
    if (dist > 80) {
      setCurrentPos(targetPos);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    // B. Reposo Técnico: Si el movimiento es menor a 10cm, detenemos el motor para ahorrar CPU.
    if (dist < 0.1) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    // C. Deslizamiento Líquido (LERP)
    const animateMovement = () => {
      setCurrentPos(prev => {
        if (!prev) return targetPos;
        // Interpolamos hacia el destino usando la matemática central de NicePod
        return interpolateCoords(prev, targetPos);
      });

      animationFrameRef.current = requestAnimationFrame(animateMovement);
    };

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(animateMovement);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.latitude, location.longitude]);

  // 3. SALVAGUARDA DE RENDERIZADO
  if (!currentPos) return null;

  /**
   * EVALUACIÓN DE CALIDAD DE SEÑAL
   */
  const accuracy = location.accuracy || 0;
  const isRescue = accuracy >= 500; // Señal de IP o Celda

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
      // [MANDATO]: 'map' asegura que los anillos se proyecten sobre el asfalto 3D.
      pitchAlignment="map"
      // rotationAlignment="map" vincula la brújula al norte de la ciudad.
      rotationAlignment="map"
      // Z-Shield: Elevación máxima para evitar oclusión por edificios de obsidiana.
      style={{ zIndex: 9999 }}
    >
      <div className="relative flex items-center justify-center w-32 h-32 pointer-events-none">

        {/* 
            I. ACCURACY AURA (Círculo de Incertidumbre)
            Representa visualmente el margen de error del hardware.
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
            Sincronizados con el color de estado de la misión.
        */}
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

        {/* 
            III. NÚCLEO FÍSICO (EL ÁTOMO VOYAGER) 
            Diseño de alto contraste con aura de profundidad.
        */}
        <div className="relative z-10 flex items-center justify-center">
          {/* Brillo de fondo para evitar oclusión con texturas satelitales */}
          <div className={cn(
            "absolute inset-0 blur-xl rounded-full animate-pulse duration-[4000ms]",
            statusColorClass === "zinc" && "bg-zinc-500/30",
            statusColorClass === "emerald" && "bg-emerald-500/40",
            statusColorClass === "primary" && "bg-primary/40"
          )} />

          {/* El núcleo sólido con ping de vida activo */}
          <div className={cn(
            "h-7 w-7 bg-white rounded-full border-[4px] shadow-[0_0_30px_rgba(0,0,0,0.6)] flex items-center justify-center transition-colors duration-1000",
            statusColorClass === "zinc" ? "border-zinc-500" : (statusColorClass === "emerald" ? "border-emerald-500" : "border-primary")
          )}>
            <div className={cn(
              "h-2 w-2 rounded-full animate-ping",
              statusColorClass === "zinc" ? "bg-zinc-400" : (statusColorClass === "emerald" ? "bg-emerald-400" : "bg-primary")
            )} />
          </div>
        </div>

        {/* 
            IV. PUNTERO DE DIRECCIÓN (THE COMPASS CONE)
            Sincronizado con el giroscopio mediante suavizado elástico.
        */}
        {location.heading !== null && (
          <motion.div
            initial={false}
            animate={{ rotate: location.heading }}
            transition={{ type: "spring", stiffness: 120, damping: 25 }}
            className={cn(
              "absolute -top-10 filter drop-shadow-[0_0_12px_rgba(0,0,0,0.9)]",
              statusColorClass === "zinc" ? "text-zinc-500" : (statusColorClass === "emerald" ? "text-emerald-400" : "text-primary")
            )}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 0L19 15H1L10 0Z" fill="currentColor" />
            </svg>
          </motion.div>
        )}

        {/* V. INDICADOR TÉCNICO DE MATERIALIZACIÓN */}
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

/**
 * [BUILD SHIELD]: Exportación Soberana.
 * No se usa memo estricto porque el componente gestiona su propio bucle de 
 * animación interna para lograr el movimiento líquido.
 */
export const UserLocationMarker = UserLocationMarkerComponent;

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.1):
 * 1. Liquid Movement (LERP): Se ha inyectado un motor de interpolación interna que 
 *    elimina los saltos de GPS. El avatar ahora 'camina' hacia las nuevas coordenadas 
 *    píxel a píxel, logrando la fluidez de un motor de videojuegos.
 * 2. Accuracy Feedback: El aura visual cambia dinámicamente según la precisión del 
 *    hardware, informando honestamente al Voyager sobre la calidad de su señal.
 * 3. Z-Index Infranqueable: Se ha blindado la visibilidad del marcador a z-9999 para 
 *    evitar que los edificios 3D Standard lo ocluyan.
 * 4. Optimización de Red: El sistema diferencia entre IP (Zinc) y GPS (Primary), 
 *    facilitando la comprensión del estado de materialización T0.
 */