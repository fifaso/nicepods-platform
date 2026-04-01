/**
 * ARCHIVO: components/geo/user-location-marker.tsx
 * VERSIÓN: 3.4 (NicePod GO Avatar - Passive Alignment & Jitter-Shield Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Representar al Voyager con escala dinámica y sincronía total con la cámara.
 * [REFORMA V3.4]: Integración de Deadzone Shield y alineación dinámica de Pitch/Rotation.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";
import { Marker, useMap } from "react-map-gl/mapbox";

// --- SERVICIOS CINEMÁTICOS SOBERANOS (V1.2) ---
import {
  calculateDistance,
  interpolateCoords,
  interpolateAngle,
  KinematicPosition
} from "@/lib/geo-kinematics";
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn, nicepodLog } from "@/lib/utils";
import { UserLocation } from "@/types/geo-sovereignty";

interface UserLocationMarkerProps {
  location: UserLocation;
  isResonating: boolean;
}

/**
 * UserLocationMarker: La entidad física del Voyager en la Malla de Madrid.
 */
const UserLocationMarkerComponent = ({ location, isResonating }: UserLocationMarkerProps) => {
  const { current: mapInstance } = useMap();
  
  // Consumimos la perspectiva para ajustar el alineamiento (3D vs 2D)
  const { cameraPerspective, isManualMode } = useGeoEngine();

  // 1. ESTADO DE RENDERIZADO Y ESCALA
  const [renderPos, setRenderPos] = useState<KinematicPosition | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(15);
  
  // 2. MEMORIA TÉCNICA (REFS DE ALTA VELOCIDAD)
  const visualPosRef = useRef<KinematicPosition | null>(null);
  const visualHeadingRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  /**
   * 3. SINCRO DE ZOOM
   * Misión: Capturar la escala del visor para el algoritmo de dimensionamiento.
   */
  useEffect(() => {
    if (!mapInstance) return;
    const map = mapInstance.getMap();
    
    const updateZoom = () => setCurrentZoom(map.getZoom());
    map.on('zoom', updateZoom);
    updateZoom();

    return () => {
      map.off('zoom', updateZoom);
    };
  }, [mapInstance]);

  /**
   * 4. MOTOR DE DESLIZAMIENTO (LERP ENGINE V3.4)
   * [SINCRO]: Utiliza la matemática de Deadzone Shield para evitar el Jitter.
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

    // Caso B: Salto de Autoridad (>80m) -> Teletransporte
    if (distanceToTarget > 80) {
      visualPosRef.current = targetPos;
      setRenderPos(targetPos);
      return;
    }

    // Caso C: Deslizamiento Cinematográfico
    const runAnimation = () => {
      if (!visualPosRef.current) return;

      // Usamos el motor LERP unificado del sistema
      const nextStep = interpolateCoords(visualPosRef.current, targetPos);
      visualPosRef.current = nextStep;
      setRenderPos(nextStep);

      const remainingDist = calculateDistance(nextStep, targetPos);
      if (remainingDist > 0.05) {
        animationFrameRef.current = requestAnimationFrame(runAnimation);
      }
    };

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(runAnimation);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [location.latitude, location.longitude]);

  /**
   * 5. PROCESAMIENTO DE RUMBO (COMPASS SHIELD)
   * Misión: Suavizar el ladeo del avatar usando la Deadzone del Bloque A.
   */
  const smoothedHeading = useMemo(() => {
    if (location.heading === null) return visualHeadingRef.current;
    
    const nextHeading = interpolateAngle(visualHeadingRef.current, location.heading);
    visualHeadingRef.current = nextHeading;
    return nextHeading;
  }, [location.heading]);

  // 6. CÁLCULO DE ESCALA TÁCTICA
  const visualScale = useMemo(() => {
    if (currentZoom >= 18) return 1.0;
    if (currentZoom <= 14) return 0.6;
    return 0.6 + (currentZoom - 14) * (0.4 / 4);
  }, [currentZoom]);

  if (!renderPos) return null;

  const isRescue = (location.accuracy || 0) >= 500; 
  const isStreetView = cameraPerspective === 'STREET';

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
      // [V3.4]: Alineamiento dinámico. En Dashboard (Overview) es 'viewport' (2D).
      // En Mapa Full (Street) es 'map' (3D) para proyectarse en el asfalto.
      pitchAlignment={isStreetView ? "map" : "viewport"}
      rotationAlignment={isStreetView ? "map" : "viewport"}
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

        {/* I. AURA DE INCERTIDUMBRE (ACCURACY CONE) */}
        <div
          className={cn(
            "absolute rounded-full transition-all duration-1000 ease-in-out border-2",
            isRescue
              ? "w-[240%] h-[240%] bg-zinc-500/5 border-zinc-500/10 blur-md"
              : "w-[100%] h-[100%] bg-primary/5 border-primary/20 blur-none"
          )}
        />

        {/* II. ANILLOS DE RESONANCIA SOBERANA */}
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

        {/* IV. PUNTERO DE RUMBO (COMPASS CONE) */}
        {location.heading !== null && (
          <motion.div
            initial={false}
            animate={{ rotate: smoothedHeading }}
            transition={{ type: "spring", stiffness: 120, damping: 25 }}
            className={cn(
              "absolute filter drop-shadow-[0_0_15px_rgba(0,0,0,0.9)]",
              currentZoom > 17 ? "-top-14" : "-top-10",
              statusColorClass === "zinc" ? "text-zinc-500" : (statusColorClass === "emerald" ? "text-emerald-400" : "text-primary")
            )}
          >
            <svg 
              width={currentZoom > 17 ? "28" : "18"} 
              height={currentZoom > 17 ? "28" : "18"} 
              viewBox="0 0 20 20" 
              fill="none"
            >
              <path d="M10 0L20 16H0L10 0Z" fill="currentColor" />
            </svg>
          </motion.div>
        )}

        {/* V. INDICADOR DE MATERIALIZACIÓN T0 */}
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
 * NOTA TÉCNICA DEL ARCHITECT (V3.4):
 * 1. Ghosting Eradication: Se sincronizó el motor LERP del avatar con las constantes
 *    del CameraController, asegurando que ambos se muevan en el mismo frame de la GPU.
 * 2. Perspective Awareness: El uso de pitchAlignment dinámico soluciona el ladeo 3D 
 *    accidental en el Dashboard (Imagen 37), forzando una vista 2D en modo OVERVIEW.
 * 3. Jitter Shield 0.5°: El avatar consume ahora la lógica de Deadzone del Bloque A, 
 *    eliminando los movimientos laterales nerviosos cuando el usuario está quieto.
 * 4. Zero-Regressions: Se mantiene el Z-Shield 9999 para perforar edificios PBR.
 */
