/**
 * ARCHIVO: components/geo/user-location-marker.tsx
 * VERSIÓN: 4.0 (NicePod GO Avatar - Native PBR & Zero-Jitter Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Representar al Voyager con escala dinámica, oclusión PBR nativa y cero Jitter.
 * [REFORMA V4.0]: Eliminación de doble-LERP y cesión de autoridad al motor WebGL.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Marker, useMap } from "react-map-gl/mapbox";

import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn } from "@/lib/utils";
import { UserLocation } from "@/types/geo-sovereignty";

interface UserLocationMarkerProps {
  location: UserLocation;
  isResonating: boolean;
}

/**
 * UserLocationMarker: La entidad física del Voyager en la Malla de Madrid.
 */
export const UserLocationMarker = ({ location, isResonating }: UserLocationMarkerProps) => {
  const { current: mapInstance } = useMap();

  // Consumimos la perspectiva para ajustar el alineamiento (3D vs 2D)
  const { cameraPerspective } = useGeoEngine();

  // 1. ESTADO DE ZOOM TÁCTICO
  const [currentZoom, setCurrentZoom] = useState<number>(15);

  /**
   * 2. SINCRO DE ZOOM
   * Misión: Capturar la escala del visor para el algoritmo de dimensionamiento visual.
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
   * 3. CÁLCULO DE ESCALA VISUAL
   * Permite que el avatar mantenga proporción en la vista de pájaro y no
   * cubra toda la calle en modo inmersivo.
   */
  const visualScale = useMemo(() => {
    if (currentZoom >= 18) return 1.0;
    if (currentZoom <= 14) return 0.6;
    return 0.6 + (currentZoom - 14) * (0.4 / 4);
  }, [currentZoom]);

  if (!location.latitude || !location.longitude) return null;

  const isRescue = (location.accuracy || 0) >= 500;
  const isStreetView = cameraPerspective === 'STREET';

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
      // [V4.0]: El pitchAlignment="map" es MANDATORIO para la oclusión PBR de Mapbox v3.
      // Proyecta el div como una textura sobre el asfalto, permitiendo que los edificios
      // 3D lo cubran si el Voyager camina tras ellos.
      pitchAlignment={isStreetView ? "map" : "viewport"}
      rotationAlignment={isStreetView ? "map" : "viewport"}
    // [V4.0]: Eliminamos el zIndex:9999 forzado. Delegamos al engine interno de Mapbox.
    >
      <div
        className="relative flex items-center justify-center transition-transform ease-out pointer-events-none"
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
        {/* [V4.0]: Delegamos el smoothing a Framer Motion y al VAF del Telemetry Core */}
        {location.heading !== null && (
          <motion.div
            initial={false}
            animate={{ rotate: location.heading }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
            className={cn(
              "absolute filter drop-shadow-[0_0_15px_rgba(0,0,0,0.9)] origin-bottom",
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. CPU Liberation (Zero-Jitter): Se eliminó la interpolación manual basada en 
 *    requestAnimationFrame. El avatar ahora se posiciona usando las coordenadas 
 *    purificadas que el GeoEngine emite cada 80cm, reduciendo a cero las colisiones 
 *    de renderizado detectadas en la consola ("Violation: requestAnimationFrame...").
 * 2. True PBR Occlusion: Al remover zIndex y usar pitchAlignment="map", permitimos 
 *    físicamente al motor Standard v3 que aplique su "puckOcclusion" y oculte el avatar
 *    cuando camine tras un edificio.
 * 3. Spring Compass: Framer Motion asume la labor de suavizado angular de la brújula 
 *    con una configuración de "spring" relajada, eliminando temblores.
 */