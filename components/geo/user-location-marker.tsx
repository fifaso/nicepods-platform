/**
 * ARCHIVO: components/geo/user-location-marker.tsx
 * VERSIÓN: 5.0 (NicePod GO Avatar - Native PBR & Absolute Nominal Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Representar la entidad física del Voyager en la Malla de Madrid con 
 * escala dinámica, oclusión PBR nativa y cero Jitter (temblor visual).
 * [REFORMA V5.0]: Sincronización nominal total con la Constitución V8.6. 
 * Resolución definitiva de errores TS2339 mediante el uso de propiedades 
 * purificadas (latitudeCoordinate, accuracyMeters, headingDegrees). 
 * Cumplimiento absoluto de la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Marker, useMap } from "react-map-gl/mapbox";

import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn, nicepodLog } from "@/lib/utils";
import { UserLocation } from "@/types/geo-sovereignty";

/**
 * INTERFAZ: UserLocationMarkerProperties
 */
interface UserLocationMarkerProperties {
  /** location: Snapshot de telemetría purificada emanada del hardware. */
  location: UserLocation;
  /** isResonating: Indica si el Voyager está dentro de un radio de sabiduría activo. */
  isResonating: boolean;
}

/**
 * UserLocationMarker: El avatar pericial que representa al Voyager en el reactor visual.
 */
export const UserLocationMarker = ({ 
  location, 
  isResonating 
}: UserLocationMarkerProperties) => {
  
  // 1. VÍNCULO CON LA INSTANCIA DE MAPBOX
  const { current: mapInstanceReference } = useMap();

  // 2. CONSUMO DE LA FACHADA SOBERANA
  const { cameraPerspective } = useGeoEngine();

  // 3. ESTADO DE ESCALA CINEMÁTICA
  const [currentZoomLevel, setCurrentZoomLevel] = useState<number>(15);

  /**
   * EFECTO: SINCRONIZACIÓN DE ZOOM
   * Misión: Capturar la escala del visor para el algoritmo de dimensionamiento dinámico.
   */
  useEffect(() => {
    if (!mapInstanceReference) return;
    const nativeMapInstance = mapInstanceReference.getMap();

    const handleZoomUpdateAction = () => setCurrentZoomLevel(nativeMapInstance.getZoom());
    
    nativeMapInstance.on('zoom', handleZoomUpdateAction);
    handleZoomUpdateAction();

    return () => {
      nativeMapInstance.off('zoom', handleZoomUpdateAction);
    };
  }, [mapInstanceReference]);

  /**
   * visualScaleFactor: 
   * Misión: Mantener la proporción visual del avatar en diferentes niveles de altitud.
   */
  const visualScaleFactor = useMemo(() => {
    if (currentZoomLevel >= 18) return 1.0;
    if (currentZoomLevel <= 14) return 0.6;
    return 0.6 + (currentZoomLevel - 14) * (0.4 / 4);
  }, [currentZoomLevel]);

  // [BUILD SHIELD]: Validación de integridad de coordenadas antes de inyectar en el Canvas.
  if (!location.latitudeCoordinate || !location.longitudeCoordinate) {
    return null;
  }

  /**
   * isSatelliteEstimationActive: 
   * Misión: Detectar si el hardware opera en modo de baja precisión (Rescate/IP-Fallback).
   */
  const isSatelliteEstimationActive = (location.accuracyMeters || 0) >= 500;
  const isStreetPerspectiveActive = cameraPerspective === 'STREET';

  const statusColorThemeVariant = isSatelliteEstimationActive
    ? "zinc"
    : isResonating
      ? "emerald"
      : "primary";

  return (
    <Marker
      latitude={location.latitudeCoordinate}
      longitude={location.longitudeCoordinate}
      anchor="center"
      /**
       * [PROTOCOLO V5.0]: pitchAlignment="map" es MANDATORIO para la oclusión PBR.
       * Esto permite que el motor de Mapbox v3 oculte el avatar físicamente 
       * cuando camina detrás de la geometría de edificios 3D.
       */
      pitchAlignment={isStreetPerspectiveActive ? "map" : "viewport"}
      rotationAlignment={isStreetPerspectiveActive ? "map" : "viewport"}
    >
      <div
        className="relative flex items-center justify-center transition-transform ease-out pointer-events-none"
        style={{
          width: `${120 * visualScaleFactor}px`,
          height: `${120 * visualScaleFactor}px`,
          transform: `scale(${visualScaleFactor})`
        }}
      >

        {/* I. AURA DE INCERTIDUMBRE GEOGRÁFICA (ACCURACY CONE) */}
        <div
          className={cn(
            "absolute rounded-full transition-all duration-1000 ease-in-out border-2",
            isSatelliteEstimationActive
              ? "w-[240%] h-[240%] bg-zinc-500/5 border-zinc-500/10 blur-md"
              : "w-[100%] h-[100%] bg-primary/5 border-primary/20 blur-none"
          )}
        />

        {/* II. ANILLOS DE RESONANCIA SOBERANA (CONCENTRIC PULSES) */}
        <div className="absolute inset-0 flex items-center justify-center w-full h-full">
          {[1, 2, 3].map((itemIndex) => (
            <div
              key={itemIndex}
              className={cn(
                "absolute rounded-full border opacity-0 animate-nicepod-pulse",
                statusColorThemeVariant === "zinc" && "border-zinc-500/30 bg-zinc-500/5",
                statusColorThemeVariant === "emerald" && "border-emerald-500/60 bg-emerald-500/10",
                statusColorThemeVariant === "primary" && "border-primary/50 bg-primary/5"
              )}
              style={{
                width: '100%',
                height: '100%',
                animationDelay: `${(itemIndex - 1) * 1.3}s`,
              }}
            />
          ))}
        </div>

        {/* III. NÚCLEO ATÓMICO (VITAL HARDWARE CORE) */}
        <div className="relative z-10 flex items-center justify-center">
          <div className={cn(
            "absolute inset-0 blur-2xl rounded-full animate-pulse duration-[4000ms]",
            statusColorThemeVariant === "zinc" && "bg-zinc-500/20",
            statusColorThemeVariant === "emerald" && "bg-emerald-500/40",
            statusColorThemeVariant === "primary" && "bg-primary/40"
          )} />

          <div className={cn(
            "rounded-full border-[3px] shadow-[0_0_40px_rgba(0,0,0,0.7)] flex items-center justify-center transition-all duration-1000 bg-white",
            currentZoomLevel > 17 ? "h-7 w-7" : "h-5 w-5",
            statusColorThemeVariant === "zinc" ? "border-zinc-500" : (statusColorThemeVariant === "emerald" ? "border-emerald-400" : "border-primary")
          )}>
            <div className={cn(
              "rounded-full animate-ping",
              currentZoomLevel > 17 ? "h-2 w-2" : "h-1.5 w-1.5",
              statusColorThemeVariant === "zinc" ? "bg-zinc-400" : (statusColorThemeVariant === "emerald" ? "bg-emerald-400" : "bg-primary")
            )} />
          </div>
        </div>

        {/* IV. PUNTERO DE RUMBO CINEMÁTICO (COMPASS CONE) */}
        {location.headingDegrees !== null && (
          <motion.div
            initial={false}
            animate={{ rotate: location.headingDegrees }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
            className={cn(
              "absolute filter drop-shadow-[0_0_15px_rgba(0,0,0,0.9)] origin-bottom",
              currentZoomLevel > 17 ? "-top-14" : "-top-10",
              statusColorThemeVariant === "zinc" ? "text-zinc-500" : (statusColorThemeVariant === "emerald" ? "text-emerald-400" : "text-primary")
            )}
          >
            <svg
              width={currentZoomLevel > 17 ? "28" : "18"}
              height={currentZoomLevel > 17 ? "28" : "18"}
              viewBox="0 0 20 20"
              fill="none"
            >
              <path d="M10 0L20 16H0L10 0Z" fill="currentColor" />
            </svg>
          </motion.div>
        )}

        {/* V. INDICADOR DE MATERIALIZACIÓN T0 (ESTIMATION LABEL) */}
        <AnimatePresence>
          {isSatelliteEstimationActive && currentZoomLevel > 14 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-14 whitespace-nowrap z-[100]"
            >
              <div className="bg-black/90 backdrop-blur-2xl px-4 py-2 rounded-full border border-white/10 shadow-2xl flex items-center gap-2.5">
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-pulse" />
                <span className="text-[7.5px] font-black uppercase tracking-[0.4em] text-zinc-300">
                  Estimando Malla de Red...
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
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Build Shield Compliance: Se resolvieron los 7 errores de compilación mapeando las 
 *    propiedades de telemetría a sus nombres industriales (latitudeCoordinate, 
 *    longitudeCoordinate, headingDegrees, accuracyMeters).
 * 2. Zero Abbreviations Policy: Se purificaron todas las variables internas: visualScale -> 
 *    visualScaleFactor, i -> itemIndex, isRescue -> isSatelliteEstimationActive.
 * 3. Physical Occlusion: Se mantiene el alineamiento 'map' para garantizar que el 
 *    avatar sea afectado por la oclusión de edificios 3D en el modo de vista STREET.
 */