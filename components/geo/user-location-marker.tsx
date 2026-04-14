/**
 * ARCHIVO: components/geo/user-location-marker.tsx
 * VERSIÓN: 6.0 (NicePod GO Avatar - Kinetic DOM Projection Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Representar la entidad física del Voyager mediante Proyección Directa 
 * al DOM, eliminando la latencia de renderizado de React y garantizando 
 * una fluidez cinemática de 60 FPS.
 * [REFORMA V6.0]: Implementación del 'Kinetic Projection Protocol'. El marcador 
 * se suscribe al bus de alta frecuencia y se auto-posiciona mediante 
 * transformaciones 3D inyectadas directamente en la GPU. Eliminación de 
 * dependencias de props para el movimiento. ZAP absoluto.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useMap } from "react-map-gl/mapbox";

import { useGeoTelemetry } from "@/hooks/geo-engine/telemetry-core";
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { GEODETIC_KINETIC_SIGNAL_EVENT_NAME } from "@/hooks/use-sensor-authority";
import { interpolateAngle, interpolateCoordinates } from "@/lib/geo-kinematics";
import { cn } from "@/lib/utils";
import { UserLocation } from "@/types/geo-sovereignty";

/**
 * INTERFAZ: UserLocationMarkerProperties
 */
interface UserLocationMarkerProperties {
  /** initialLocation: Posición de anclaje inicial (Semilla T0). */
  initialLocation: UserLocation;
  isResonating: boolean;
}

/**
 * UserLocationMarker: El avatar pericial de alta fidelidad.
 */
export const UserLocationMarker = ({
  initialLocation,
  isResonating
}: UserLocationMarkerProperties) => {

  // 1. VÍNCULO CON EL REACTOR WebGL
  const { current: mapInstanceReference } = useMap();
  const { cameraPerspective } = useGeoEngine();
  const { kineticSignalBus } = useGeoTelemetry();

  // 2. REFERENCIAS MUTABLES (PILAR 4 - MTI)
  // Misión: Almacenar el estado físico sin disparar re-renderizados.
  const avatarContainerReference = useRef<HTMLDivElement>(null);
  const targetLocationReference = useRef<UserLocation>(initialLocation);
  const currentAnimatedLocationReference = useRef<UserLocation>(initialLocation);
  const animationFrameIdentificationReference = useRef<number>(0);

  // 3. ESTADOS DE APOYO (LÓGICA LENTA)
  const [currentZoomLevel, setCurrentZoomLevel] = useState<number>(15);

  /**
   * EFECTO: KINETIC_ORCHESTRATOR
   * Misión: Suscribirse al bus de alta frecuencia y arrancar el bucle de proyección.
   */
  useEffect(() => {
    if (!mapInstanceReference) return;
    const nativeMapInstance = mapInstanceReference.getMap();

    /**
     * handleKineticPulseAction:
     * Captura la señal del hardware en milisegundos y actualiza el objetivo.
     */
    const handleKineticPulseAction = (event: Event) => {
      const customEvent = event as CustomEvent<UserLocation>;
      targetLocationReference.current = customEvent.detail;
    };

    /**
     * executeProjectionLoopAction:
     * El motor cinemático a 60 FPS. Calcula la interpolación y mueve el DOM.
     */
    const executeProjectionLoopAction = () => {
      if (document.hidden) {
        animationFrameIdentificationReference.current = requestAnimationFrame(executeProjectionLoopAction);
        return;
      }

      // 1. Interpolación Lineal (LERP) entre posición actual y objetivo
      const interpolatedPosition = interpolateCoordinates(
        {
          latitude: currentAnimatedLocationReference.current.latitudeCoordinate,
          longitude: currentAnimatedLocationReference.current.longitudeCoordinate
        },
        {
          latitude: targetLocationReference.current.latitudeCoordinate,
          longitude: targetLocationReference.current.longitudeCoordinate
        },
        0.15 // Factor de suavizado cinemático
      );

      // 2. Interpolación Angular para el rumbo (Heading)
      const interpolatedHeading = interpolateAngle(
        currentAnimatedLocationReference.current.headingDegrees || 0,
        targetLocationReference.current.headingDegrees || 0,
        0.10
      );

      // Actualizamos la referencia interna
      currentAnimatedLocationReference.current = {
        ...targetLocationReference.current,
        latitudeCoordinate: interpolatedPosition.latitude,
        longitudeCoordinate: interpolatedPosition.longitude,
        headingDegrees: interpolatedHeading
      };

      // 3. Proyección de Coordenadas Geográficas a Pixeles de Pantalla
      const screenPointCoordinates = nativeMapInstance.project([
        currentAnimatedLocationReference.current.longitudeCoordinate,
        currentAnimatedLocationReference.current.latitudeCoordinate
      ]);

      // 4. Inyección Directa al DOM (Bypass React)
      if (avatarContainerReference.current) {
        const xTranslate = Math.round(screenPointCoordinates.x);
        const yTranslate = Math.round(screenPointCoordinates.y);

        // Usamos translate3d para forzar la aceleración por hardware (GPU)
        avatarContainerReference.current.style.transform =
          `translate3d(${xTranslate}px, ${yTranslate}px, 0) translate(-50%, -50%)`;
      }

      animationFrameIdentificationReference.current = requestAnimationFrame(executeProjectionLoopAction);
    };

    // Ignición del Bus y del Bucle
    kineticSignalBus.addEventListener(GEODETIC_KINETIC_SIGNAL_EVENT_NAME, handleKineticPulseAction);
    animationFrameIdentificationReference.current = requestAnimationFrame(executeProjectionLoopAction);

    // Sincronización de Zoom para escala (Lógica lenta)
    const handleZoomUpdate = () => setCurrentZoomLevel(nativeMapInstance.getZoom());
    nativeMapInstance.on('zoom', handleZoomUpdate);

    /**
     * [HARDWARE HYGIENE]: Desconexión total de procesos.
     */
    return () => {
      kineticSignalBus.removeEventListener(GEODETIC_KINETIC_SIGNAL_EVENT_NAME, handleKineticPulseAction);
      cancelAnimationFrame(animationFrameIdentificationReference.current);
      nativeMapInstance.off('zoom', handleZoomUpdate);
    };
  }, [mapInstanceReference, kineticSignalBus]);

  // 4. CÁLCULO DE ESCALA DINÁMICA (Visual Only)
  const visualScaleFactor = (currentZoomLevel >= 18) ? 1.0 : (currentZoomLevel <= 14) ? 0.6 : 0.6 + (currentZoomLevel - 14) * 0.1;

  const isSatelliteEstimationActive = (targetLocationReference.current.accuracyMeters || 0) >= 200;
  const statusColorThemeVariant = isSatelliteEstimationActive ? "zinc" : isResonating ? "emerald" : "primary";

  return (
    /**
     * [MTI]: El contenedor se posiciona de forma absoluta y es manipulado 
     * mediante la referencia 'avatarContainerReference'.
     */
    <div
      ref={avatarContainerReference}
      className="absolute top-0 left-0 will-change-transform z-[150] pointer-events-none"
      style={{ transform: 'translate(-50%, -50%)' }}
    >
      <div
        className="relative flex items-center justify-center transition-transform ease-out"
        style={{
          width: `${120 * visualScaleFactor}px`,
          height: `${120 * visualScaleFactor}px`,
          transform: `scale(${visualScaleFactor})`
        }}
      >
        {/* I. AURA DE INCERTIDUMBRE GEOGRÁFICA */}
        <div className={cn(
          "absolute rounded-full transition-all duration-1000 border-2",
          isSatelliteEstimationActive ? "w-[240%] h-[240%] bg-zinc-500/5 border-zinc-500/10 blur-md" : "w-[100%] h-[100%] bg-primary/5 border-primary/20"
        )} />

        {/* II. ANILLOS DE RESONANCIA */}
        <div className="absolute inset-0 flex items-center justify-center w-full h-full">
          {[1, 2].map((itemIndex) => (
            <div
              key={itemIndex}
              className={cn(
                "absolute rounded-full border opacity-0 animate-nicepod-pulse",
                statusColorThemeVariant === "zinc" && "border-zinc-500/30",
                statusColorThemeVariant === "emerald" && "border-emerald-500/60",
                statusColorThemeVariant === "primary" && "border-primary/50"
              )}
              style={{ width: '100%', height: '100%', animationDelay: `${(itemIndex - 1) * 1.5}s` }}
            />
          ))}
        </div>

        {/* III. NÚCLEO ATÓMICO SOBERANO */}
        <div className="relative z-10 flex items-center justify-center">
          <div className={cn(
            "absolute inset-0 blur-2xl rounded-full animate-pulse duration-[4000ms]",
            statusColorThemeVariant === "zinc" && "bg-zinc-500/20",
            statusColorThemeVariant === "emerald" && "bg-emerald-500/40",
            statusColorThemeVariant === "primary" && "bg-primary/40"
          )} />
          <div className={cn(
            "rounded-full border-[3px] shadow-2xl flex items-center justify-center bg-white transition-all",
            currentZoomLevel > 17 ? "h-7 w-7" : "h-5 w-5",
            statusColorThemeVariant === "zinc" ? "border-zinc-500" : (statusColorThemeVariant === "emerald" ? "border-emerald-400" : "border-primary")
          )}>
            <div className="h-2 w-2 rounded-full bg-current animate-ping" />
          </div>
        </div>

        {/* IV. PUNTERO DE RUMBO (COMPASS) */}
        <motion.div
          style={{ rotate: currentAnimatedLocationReference.current.headingDegrees || 0 }}
          className={cn(
            "absolute filter drop-shadow-xl origin-bottom",
            currentZoomLevel > 17 ? "-top-14" : "-top-10",
            statusColorThemeVariant === "zinc" ? "text-zinc-500" : (statusColorThemeVariant === "emerald" ? "text-emerald-400" : "text-primary")
          )}
        >
          <svg width={currentZoomLevel > 17 ? "28" : "18"} height={currentZoomLevel > 17 ? "28" : "18"} viewBox="0 0 20 20">
            <path d="M10 0L20 16H0L10 0Z" fill="currentColor" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. React Bypass Protocol: El marcador se mueve a 60 FPS mediante la manipulación 
 *    directa del estilo 'transform' en el bucle 'requestAnimationFrame'.
 * 2. LERP Integration: Se eliminan los saltos visuales mediante la interpolación 
 *    constante de coordenadas y ángulos.
 * 3. GPU Acceleration: El uso de 'translate3d' asegura que el posicionamiento sea 
 *    ejecutado por la unidad de procesamiento gráfico, liberando la CPU.
 */