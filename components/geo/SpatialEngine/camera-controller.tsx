/**
 * ARCHIVO: components/geo/SpatialEngine/camera-controller.tsx
 * VERSIÓN: 4.8 (NicePod Camera Director - Interaction-Shield & Jitter-Free Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Gestionar la cámara WebGL priorizando la soberanía del tacto sobre el LERP.
 * [REFORMA V4.8]: Implementación de Interaction-Shield y Umbral de Silencio Rotacional.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useGeoEngine } from "@/hooks/use-geo-engine";
import {
  calculateDestinationPoint,
  interpolateAngle,
  interpolateCoords,
  lerpSimple,
  KinematicPosition
} from "@/lib/geo-kinematics";
import { nicepodLog } from "@/lib/utils";
import { useCallback, useEffect, useRef } from "react";
import { useMap } from "react-map-gl/mapbox";
import { MapInstanceId } from "@/types/geo-sovereignty";
import {
  PERSPECTIVE_PROFILES,
  FLY_CONFIG,
  INITIAL_OVERVIEW_CONFIG,
  KINEMATIC_CONFIG
} from "../map-constants";

interface CameraControllerProps {
  /** mapId: Identificador único de la instancia (map-full o map-dashboard). */
  mapId: MapInstanceId;
}

/**
 * CameraController: El brazo ejecutor de la cinemática soberana.
 */
export function CameraController({ mapId }: CameraControllerProps) {
  // 1. CONEXIÓN VINCULADA POR ID
  // Accedemos exclusivamente a la instancia de Mapbox declarada para este contexto.
  const { [mapId]: mapInstance } = useMap();

  // 2. CONSUMO DE MANDO CINEMÁTICO (V36.0)
  const {
    userLocation,
    needsBallisticLanding,
    recenterTrigger,
    confirmLanding,
    cameraPerspective,
    isManualMode,
    setManualMode
  } = useGeoEngine();

  // 3. MEMORIA TÉCNICA (REFS DE ALTA VELOCIDAD)
  const currentPosRef = useRef<KinematicPosition | null>(null);
  const currentBearingRef = useRef<number>(INITIAL_OVERVIEW_CONFIG.bearing);
  const currentPitchRef = useRef<number>(INITIAL_OVERVIEW_CONFIG.pitch);
  const currentZoomRef = useRef<number>(INITIAL_OVERVIEW_CONFIG.zoom);
  
  const isFlyingRef = useRef<boolean>(false);
  const lastInteractionRef = useRef<number>(0);
  const lastProcessedTriggerRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  /**
   * handleUserInteraction: EL ESCUDO DE INTERACCIÓN
   * Misión: Detener inmediatamente el motor LERP al detectar contacto físico.
   */
  const handleUserInteraction = useCallback(() => {
    // Registramos el timestamp del contacto
    lastInteractionRef.current = Date.now();
    
    // Si no estábamos en modo manual, activamos la soberanía del usuario.
    if (!isManualMode) {
      setManualMode(true);
    }

    // [PUNTO CRÍTICO]: Cancelamos el frame actual para liberar el bus de comandos.
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [isManualMode, setManualMode]);

  /**
   * kinematicLoop: EL CORAZÓN DEL MOVIMIENTO LÍQUIDO
   * Interpola todas las variables físicas a 60FPS sincronizado con la GPU.
   */
  const kinematicLoop = useCallback(() => {
    // Si la instancia o la telemetría no están listas, cedemos el frame.
    if (!mapInstance || !userLocation) {
      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    const map = mapInstance.getMap();

    // A. EVALUACIÓN DE RECUPERACIÓN DE AUTORIDAD (8 segundos)
    const now = Date.now();
    if (isManualMode && (now - lastInteractionRef.current > 8000)) {
      nicepodLog(`🎯 [Camera:${mapId}] Recuperando autoridad por inactividad.`);
      setManualMode(false);
    }

    // B. GUARDAS DE SILENCIO (MANUAL O VUELO ACTIVO)
    // El escudo de interacción bloquea el LERP para dejar pasar los gestos del usuario.
    if (isManualMode || isFlyingRef.current) {
      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    // C. PERFIL DE PERSPECTIVA (STREET vs OVERVIEW)
    const profile = PERSPECTIVE_PROFILES[cameraPerspective];

    // D. MOTOR LERP MULTI-VARIABLE
    
    // 1. Posicionamiento Espacial
    const targetPos: KinematicPosition = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude
    };
    if (!currentPosRef.current) {
      currentPosRef.current = targetPos;
    } else {
      currentPosRef.current = interpolateCoords(currentPosRef.current, targetPos);
    }

    // 2. Orientación (Jitter Shield)
    // [V4.8]: Si el cambio de rumbo es < 0.5°, ignoramos el ruido del magnetómetro.
    const rawTargetBearing = profile.bearing_follow 
      ? (userLocation.heading ?? currentBearingRef.current)
      : 0; 
    
    if (Math.abs(rawTargetBearing - currentBearingRef.current) > 0.5) {
      currentBearingRef.current = interpolateAngle(currentBearingRef.current, rawTargetBearing);
    }

    // 3. Inclinación y Escala
    currentPitchRef.current = lerpSimple(currentPitchRef.current, profile.pitch);
    currentZoomRef.current = lerpSimple(currentZoomRef.current, profile.zoom);

    // E. CÁLCULO DEL ANCLA CINEMÁTICA (Follow-Offset)
    const cameraAnchor = calculateDestinationPoint(
      currentPosRef.current,
      -profile.offset_distance_meters, 
      currentBearingRef.current
    );

    // F. INYECCIÓN IMPERATIVA EN GPU
    map.jumpTo({
      center: [cameraAnchor.longitude, cameraAnchor.latitude],
      bearing: currentBearingRef.current,
      pitch: currentPitchRef.current,
      zoom: currentZoomRef.current
    });

    animationFrameRef.current = requestAnimationFrame(kinematicLoop);
  }, [mapInstance, userLocation, cameraPerspective, isManualMode, setManualMode, mapId]);

  /**
   * EFECTO: ORQUESTACIÓN DE VUELO BALÍSTICO POR PULSO
   * [REFORMA V4.8]: Salto de prioridad alfa que cancela el bucle de renderizado.
   */
  useEffect(() => {
    const triggerReceived = recenterTrigger > lastProcessedTriggerRef.current;
    
    if ((needsBallisticLanding || triggerReceived) && mapInstance && userLocation && !isFlyingRef.current) {
      const map = mapInstance.getMap();
      const profile = PERSPECTIVE_PROFILES[cameraPerspective];
      
      nicepodLog(`🚀 [Camera:${mapId}] Pulso Balístico activado. Prioridad de vuelo.`);
      
      // FRENO ABSOLUTO: Detenemos el LERP antes de soltar el mando al motor nativo.
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      isFlyingRef.current = true;
      lastProcessedTriggerRef.current = recenterTrigger;

      // Sync de referencias para aterrizaje suave
      currentPosRef.current = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      };

      map.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: profile.zoom,
        pitch: profile.pitch,
        bearing: profile.bearing_follow ? (userLocation.heading ?? 0) : 0,
        ...FLY_CONFIG,
        duration: triggerReceived ? 1200 : FLY_CONFIG.duration 
      });

      map.once('moveend', () => {
        nicepodLog(`🏁 [Camera:${mapId}] Aterrizaje completado.`);
        
        // Sincronizamos las referencias con el estado final de la GPU
        currentPitchRef.current = profile.pitch;
        currentZoomRef.current = profile.zoom;
        currentBearingRef.current = profile.bearing_follow ? (userLocation.heading ?? 0) : 0;
        
        isFlyingRef.current = false;
        confirmLanding(); 

        // Retomamos el motor líquido si no hay interacción manual
        if (!isManualMode) {
          animationFrameRef.current = requestAnimationFrame(kinematicLoop);
        }
      });
    }
  }, [needsBallisticLanding, recenterTrigger, mapInstance, userLocation, cameraPerspective, confirmLanding, kinematicLoop, mapId, isManualMode]);

  /**
   * CICLO DE VIDA: Gestión de Eventos y GPU Offloading
   */
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(kinematicLoop);

    const canvas = mapInstance?.getMap().getCanvas();
    if (canvas) {
      canvas.addEventListener('mousedown', handleUserInteraction);
      canvas.addEventListener('touchstart', handleUserInteraction, { passive: true });
      canvas.addEventListener('wheel', handleUserInteraction, { passive: true });
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (canvas) {
        canvas.removeEventListener('mousedown', handleUserInteraction);
        canvas.removeEventListener('touchstart', handleUserInteraction);
        canvas.removeEventListener('wheel', handleUserInteraction);
      }
    };
  }, [mapInstance, kinematicLoop, handleUserInteraction]);

  return null; 
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.8):
 * 1. Interaction Sovereignty: El uso de cancelAnimationFrame en el evento de contacto
 *    libera físicamente el zoom y pan nativos de Mapbox, eliminando los bloqueos.
 * 2. Jitter Shield: Se inyectó un umbral de 0.5° en la interpolación angular para 
 *    eliminar los movimientos laterales erráticos causados por el magnetómetro.
 * 3. Atomic Ref Sync: Mantiene la sincronía absoluta post-vuelo para evitar 
 *    rebotes visuales al retomar el control de la cámara.
 * 4. Instance Integrity: El bindeo por mapId garantiza que las órdenes de una 
 *    página nunca contaminen el contexto de la otra.
 */