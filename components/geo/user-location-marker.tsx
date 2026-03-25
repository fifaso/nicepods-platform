// components/geo/user-location-marker.tsx
// VERSIÓN: 2.2 (NicePod GO Avatar - Precision Feedback & Materialization Edition)
// Misión: Representar al usuario en la malla con visualización dinámica de precisión.
// [ESTABILIZACIÓN]: Implementación de Accuracy Aura, jerarquía de color por estado y Z-Shield.

"use client";

import { cn } from "@/lib/utils";
import { UserLocation } from "@/types/geo-sovereignty";
import { motion, AnimatePresence } from "framer-motion";
import { memo } from "react";
// [FIX VERCEL]: Enrutamiento explícito al motor Mapbox
import { Marker } from "react-map-gl/mapbox";

interface UserLocationMarkerProps {
  location: UserLocation;
  isResonating: boolean;
}

const UserLocationMarkerComponent = ({ location, isResonating }: UserLocationMarkerProps) => {

  // 1. PROTOCOLO DE MATERIALIZACIÓN OBLIGATORIA
  // Si no hay coordenadas, el Voyager es un espectro. No renderizamos nada.
  if (!location?.latitude || !location?.longitude) return null;

  /**
   * EVALUACIÓN DE AUTORIDAD DEL DATO
   * - isRescue: Señal degradada (Geo-IP o Celda). Accuracy > 500m.
   * - isHighPrecision: Señal satelital óptima. Accuracy < 20m.
   */
  const accuracy = location.accuracy || 0;
  const isRescue = accuracy >= 500;
  const isHighPrecision = accuracy > 0 && accuracy < 20;

  // Selección de colorimetría industrial
  const statusColorClass = isRescue 
    ? "zinc" 
    : isResonating 
      ? "emerald" 
      : "primary";

  return (
    <Marker
      latitude={location.latitude}
      longitude={location.longitude}
      anchor="center"
      // [MANDATO]: 'map' asegura que el avatar se acueste sobre el asfalto 3D
      pitchAlignment="map"
      rotationAlignment="map"
      // Z-Shield: Elevación máxima para evitar ser tapado por edificios de obsidiana
      style={{ zIndex: 9999 }}
    >
      <div className="relative flex items-center justify-center pointer-events-none">

        {/* 
            I. ACCURACY AURA (Círculo de Incertidumbre)
            Representa visualmente la precisión del GPS. Se expande si la señal es pobre.
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
            [MANDATO V2.7]: Uso de CSS keyframes para evitar lag en el Main Thread.
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

/**
 * [BUILD SHIELD]: Memoización de Alta Fidelidad
 */
export const UserLocationMarker = memo(UserLocationMarkerComponent, (prev, next) => {
  return (
    prev.isResonating === next.isResonating &&
    prev.location?.latitude === next.location?.latitude &&
    prev.location?.longitude === next.location?.longitude &&
    prev.location?.heading === next.location?.heading &&
    prev.location?.accuracy === next.location?.accuracy
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.2):
 * 1. Accuracy Aura: Se implementó un círculo de incertidumbre que reacciona a la
 *    precisión métrica del GPS, proporcionando feedback honesto al Voyager.
 * 2. Z-Index Absoluto: El marcador opera en z-9999 para garantizar que nunca sea
 *    clipeado por las extrusiones 3D de los edificios de cristal de Madrid.
 * 3. Hot-Swap Visual: El componente maneja tres estados de color (Zinc, Primary, Emerald)
 *    para informar sobre la calidad del enlace y el estado de sintonía en tiempo real.
 * 4. Inmersión Pokémon GO: pitchAlignment="map" asegura que los anillos de resonancia
 *    se proyecten de forma plana sobre la superficie terrestre del motor Mapbox.
 */