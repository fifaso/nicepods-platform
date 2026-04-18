/**
 * ARCHIVO: hooks/geo-engine/use-kinetic-avatar-projection.ts
 * VERSIÓN: 2.2
 * PROTOCOLO: MADRID RESONANCE V4.9
 * MISIÓN: Orquestar el bucle de animación cinemática con captura de referencias y cumplimiento ZAP.
 * [THERMIC V1.0]: Implementación de MRCP para aniquilación de cuadros de animación.
 * NIVEL DE INTEGRIDAD: 100% (Soberano)
 */

"use client";

import { useEffect, useRef } from "react";
// [BUILD SHIELD]: Importación modular total para resolver la colisión de namespaces en Mapbox v3.
import { interpolateAngle, interpolateCoordinates } from "@/lib/geo-kinematics";
import { nicepodLog } from "@/lib/utils";
import { UserLocation } from "@/types/geo-sovereignty";
import * as mapboxgl from "mapbox-gl";
import { GEODETIC_KINETIC_SIGNAL_EVENT_NAME } from "../use-sensor-authority";
import { useGeoTelemetry } from "./telemetry-core";

/**
 * INTERFAZ: KineticProjectionProperties
 * Misión: Definir el contrato de entrada para el motor de renderizado cinemático.
 */
interface KineticProjectionProperties {
  /** initialGeographicLocation: Ubicación semilla para el primer cuadro de renderizado. */
  initialGeographicLocation: UserLocation;
  /** mapNativeInstance: Instancia física del motor WebGL de Mapbox. */
  mapNativeInstance: mapboxgl.Map | undefined;
  /** avatarContainerReference: Referencia al elemento HTML inyectado en la GPU. */
  avatarContainerReference: React.RefObject<HTMLDivElement>;
  /** smoothingFactorMagnitude: Nivel de inercia para la suavidad de la interpolación. */
  smoothingFactorMagnitude?: number;
}

/**
 * HOOK: useKineticAvatarProjection
 * El motor de movimiento de milisegundos de la Workstation NicePod.
 */
export function useKineticAvatarProjection({
  initialGeographicLocation,
  mapNativeInstance,
  avatarContainerReference,
  smoothingFactorMagnitude = 0.15
}: KineticProjectionProperties) {

  const { kineticSignalBus } = useGeoTelemetry();

  // --- I. MEMORIA TÁCTICA DE MOVIMIENTO (MTI - PILAR 4) ---
  const targetGeographicLocationReference = useRef<UserLocation>(initialGeographicLocation);
  const currentAnimatedLocationReference = useRef<UserLocation>(initialGeographicLocation);
  const animationFrameIdentificationReference = useRef<number>(0);

  /**
   * executeHighFrequencyProjectionLoop:
   * Misión: Mantener la fluidez de 60 FPS operando fuera del motor de React.
   */
  useEffect(() => {
    // Validación de integridad de hardware y enlace al cristal (DOM).
    if (!mapNativeInstance || !avatarContainerReference.current) {
      return;
    }

    /**
     * handleIncomingKineticPulse:
     * Captura el pulso del bus de hardware y actualiza el objetivo cinético.
     */
    const handleIncomingKineticPulse = (kineticBusSignalEvent: Event) => {
      const customEventDataSnapshot = kineticBusSignalEvent as CustomEvent<UserLocation>;
      if (customEventDataSnapshot.detail) {
        targetGeographicLocationReference.current = customEventDataSnapshot.detail;
      }
    };

    /**
     * animationStepLoopAction:
     * Ejecuta el cálculo de LERP y la proyección de píxeles a 60 cuadros por segundo.
     */
    const animationStepLoopAction = () => {
      // Protocolo de Hibernación Térmica (Pilar 3).
      if (document.hidden) {
        animationFrameIdentificationReference.current = requestAnimationFrame(animationStepLoopAction);
        return;
      }

      const currentAnimatedLocation = currentAnimatedLocationReference.current;
      const targetGeographicLocation = targetGeographicLocationReference.current;

      // 1. Interpolación de Coordenadas Geográficas (Suavizado Geodésico).
      const interpolatedGeographicPositionCoordinates = interpolateCoordinates(
        {
          latitude: currentAnimatedLocation.latitudeCoordinate,
          longitude: currentAnimatedLocation.longitudeCoordinate
        },
        {
          latitude: targetGeographicLocation.latitudeCoordinate,
          longitude: targetGeographicLocation.longitudeCoordinate
        },
        smoothingFactorMagnitude
      );

      // 2. Interpolación Angular (Suavizado del Puntero de Rumbo).
      const interpolatedHeadingDegrees = interpolateAngle(
        currentAnimatedLocation.headingDegrees || 0,
        targetGeographicLocation.headingDegrees || 0,
        0.10
      );

      // Actualizamos la memoria táctica para el siguiente cuadro de animación.
      currentAnimatedLocationReference.current = {
        ...targetGeographicLocation,
        latitudeCoordinate: interpolatedGeographicPositionCoordinates.latitude,
        longitudeCoordinate: interpolatedGeographicPositionCoordinates.longitude,
        headingDegrees: interpolatedHeadingDegrees
      };

      // 3. Proyección Geográfica a Pixeles de Pantalla (Camera Matrix Projection).
      const screenPointPixels = mapNativeInstance.project([
        currentAnimatedLocationReference.current.longitudeCoordinate,
        currentAnimatedLocationReference.current.latitudeCoordinate
      ]);

      // 4. Inyección Directa al Cristal (GPU Acceleration via translate3d).
      const avatarHtmlElement = avatarContainerReference.current;
      if (avatarHtmlElement) {
        const horizontalPixelCoordinate = Math.round(screenPointPixels.x);
        const verticalPixelCoordinate = Math.round(screenPointPixels.y);

        // Uso imperativo de 'translate3d' para forzar la composición en el procesador gráfico.
        avatarHtmlElement.style.transform =
          `translate3d(${horizontalPixelCoordinate}px, ${verticalPixelCoordinate}px, 0) translate(-50%, -50%)`;
      }

      animationFrameIdentificationReference.current = requestAnimationFrame(animationStepLoopAction);
    };

    // --- II. IGNICIÓN DE MOTORES CINÉTICOS ---
    kineticSignalBus.addEventListener(GEODETIC_KINETIC_SIGNAL_EVENT_NAME, handleIncomingKineticPulse);
    animationFrameIdentificationReference.current = requestAnimationFrame(animationStepLoopAction);

    /**
     * [HARDWARE HYGIENE]: Purga atómica de procesos al desmontar.
     */
    return () => {
      const currentAnimationFrameIdentificationSnapshot = animationFrameIdentificationReference.current;
      nicepodLog("🔋 [KineticMotor] Liberando recursos de animación y bus de eventos.");
      kineticSignalBus.removeEventListener(GEODETIC_KINETIC_SIGNAL_EVENT_NAME, handleIncomingKineticPulse);
      if (currentAnimationFrameIdentificationSnapshot) {
        cancelAnimationFrame(currentAnimationFrameIdentificationSnapshot);
      }
    };
  }, [mapNativeInstance, kineticSignalBus, avatarContainerReference, smoothingFactorMagnitude]);

  return {
    currentAnimatedLocation: currentAnimatedLocationReference.current,
    targetGeographicLocation: targetGeographicLocationReference.current
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.1):
 * 1. Build Shield Sovereignty: Se resolvió TS2694 mediante la importación modular 
 *    total, evitando colisiones con el objeto Map nativo del navegador.
 * 2. MTI Architecture: El bucle de animación opera con independencia absoluta de 
 *    React, garantizando fluidez en el Hilo Principal.
 * 3. ZAP Enforcement: Purificación total de descriptores: 'Snapshot' -> 'DataSnapshot', 
 *    'interpolatedPosition' -> 'interpolatedGeographicPositionCoordinates'.
 */