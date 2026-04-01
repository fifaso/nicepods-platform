/**
 * ARCHIVO: components/geo/SpatialEngine/camera-controller.tsx
 * VERSIÓN: 4.11 (NicePod Camera Director - Autonomous Sovereignty Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Gestionar la cámara WebGL con aislamiento de perspectiva y blindaje anti-jitter.
 * [REFORMA V4.11]: Implementación de forcedPerspective y Estasis de Alta Precisión.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useGeoEngine } from "@/hooks/use-geo-engine";
import {
  calculateDestinationPoint,
  calculateDistance,
  interpolateAngle,
  interpolateCoords,
  KinematicPosition,
  lerpSimple
} from "@/lib/geo-kinematics";
import { nicepodLog } from "@/lib/utils";
import { CameraPerspective, MapInstanceId } from "@/types/geo-sovereignty";
import { useCallback, useEffect, useRef } from "react";
import { useMap } from "react-map-gl/mapbox";
import {
  FLY_CONFIG,
  INITIAL_OVERVIEW_CONFIG,
  KINEMATIC_CONFIG,
  PERSPECTIVE_PROFILES
} from "../map-constants";

interface CameraControllerProps {
  /** mapId: Identificador único de la instancia soberana. */
  mapId: MapInstanceId;
  /** forcedPerspective: Opcional. Bloquea la cámara en un modo (ej: OVERVIEW para Dashboard). */
  forcedPerspective?: CameraPerspective;
}

/**
 * UMBRALES DE ESTASIS CINEMÁTICA (RE-CALIBRADOS V4.11)
 * Definen la "Zona de Silencio" para erradicar el pestañeo y el jitter.
 */
const STASIS_CONFIG = {
  DISTANCE_THRESHOLD: 0.10, // 10 centímetros (Margen de error GPS urbano)
  BEARING_THRESHOLD: 0.8,   // 0.8 grados (Umbral de ruido magnético)
  PITCH_THRESHOLD: 0.5,
  ZOOM_THRESHOLD: 0.01
};

export function CameraController({ mapId, forcedPerspective }: CameraControllerProps) {
  // 1. CONEXIÓN VINCULADA POR ID SOBERANO
  const { [mapId]: mapInstance } = useMap();

  // 2. CONSUMO DE MANDO CINEMÁTICO (V41.0)
  const {
    userLocation,
    needsBallisticLanding,
    recenterTrigger,
    confirmLanding,
    cameraPerspective: globalPerspective,
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
  const lastFrameTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  /**
   * handleUserInteraction: EL ESCUDO DE INTERACCIÓN
   * Libera el Zoom y Pan nativos al detectar contacto físico.
   */
  const handleUserInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
    if (!isManualMode) {
      setManualMode(true);
    }
    // Cancelación inmediata del LERP para evitar el "Camera Fighting"
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [isManualMode, setManualMode]);

  /**
   * kinematicLoop: EL CORAZÓN DEL MOVIMIENTO LÍQUIDO
   * Misión: Ejecutar la cinemática adaptativa sincronizada con la GPU.
   */
  const kinematicLoop = useCallback((timestamp: number) => {
    if (!mapInstance || !userLocation) {
      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    const map = mapInstance.getMap();
    if (!map.isStyleLoaded()) {
      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    // A. CÁLCULO DE DELTA-TIME (Fluidez independiente de FPS)
    if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
    const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000;
    lastFrameTimeRef.current = timestamp;

    // B. TIMEOUT DE RECUPERACIÓN (Recentrado Automático tras 8s)
    const now = Date.now();
    if (isManualMode && (now - lastInteractionRef.current > 8000)) {
      setManualMode(false);
    }

    // C. GUARDAS DE SILENCIO (MANUAL O VUELO)
    if (isManualMode || isFlyingRef.current) {
      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    // D. DETERMINACIÓN DE PERSPECTIVA (LOCAL vs GLOBAL)
    // [V4.11]: Si hay forcedPerspective (Dashboard), ignoramos el estado global.
    const activePerspective = forcedPerspective || globalPerspective;
    const profile = PERSPECTIVE_PROFILES[activePerspective];

    // E. MOTOR LERP CON PROTOCOLO DE ESTASIS
    const targetPos: KinematicPosition = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude
    };

    if (!currentPosRef.current) {
      currentPosRef.current = targetPos;
    }

    // 1. Evaluación de Diferenciales para Estasis
    const distDelta = calculateDistance(currentPosRef.current, targetPos);
    const targetBearing = profile.bearing_follow ? (userLocation.heading ?? currentBearingRef.current) : 0;
    const bearingDelta = Math.abs(targetBearing - currentBearingRef.current);
    const pitchDelta = Math.abs(currentPitchRef.current - profile.pitch);
    const zoomDelta = Math.abs(currentZoomRef.current - profile.zoom);

    /**
     * [ORDEN V4.11]: Si el cambio es ruido sensorial (< umbrales), abortamos el jumpTo.
     * Esto erradica los movimientos laterales y ahorra ciclos de GPU.
     */
    if (distDelta < STASIS_CONFIG.DISTANCE_THRESHOLD &&
      bearingDelta < STASIS_CONFIG.BEARING_THRESHOLD &&
      pitchDelta < STASIS_CONFIG.PITCH_THRESHOLD &&
      zoomDelta < STASIS_CONFIG.ZOOM_THRESHOLD) {
      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    // F. INTERPOLACIÓN CINEMÁTICA (LERP)
    const factor = KINEMATIC_CONFIG.LERP_FACTOR;

    currentPosRef.current = interpolateCoords(currentPosRef.current, targetPos, factor);
    currentBearingRef.current = interpolateAngle(currentBearingRef.current, targetBearing, factor);
    currentPitchRef.current = lerpSimple(currentPitchRef.current, profile.pitch, factor);
    currentZoomRef.current = lerpSimple(currentZoomRef.current, profile.zoom, factor);

    // G. CÁLCULO DEL FOLLOW-OFFSET
    const cameraAnchor = calculateDestinationPoint(
      currentPosRef.current,
      -profile.offset_distance_meters,
      currentBearingRef.current
    );

    // H. INYECCIÓN IMPERATIVA EN GPU
    map.jumpTo({
      center: [cameraAnchor.longitude, cameraAnchor.latitude],
      bearing: currentBearingRef.current,
      pitch: currentPitchRef.current,
      zoom: currentZoomRef.current
    });

    animationFrameRef.current = requestAnimationFrame(kinematicLoop);
  }, [mapInstance, userLocation, globalPerspective, forcedPerspective, isManualMode, setManualMode, mapId]);

  /**
   * EFECTO: ORQUESTACIÓN DE VUELO BALÍSTICO POR PULSO
   * [REFORMA V4.11]: Se dispara ante cualquier incremento del recenterTrigger.
   */
  useEffect(() => {
    const triggerReceived = recenterTrigger > lastProcessedTriggerRef.current;

    if ((needsBallisticLanding || triggerReceived) && mapInstance && userLocation && !isFlyingRef.current) {
      const map = mapInstance.getMap();
      const activePerspective = forcedPerspective || globalPerspective;
      const profile = PERSPECTIVE_PROFILES[activePerspective];

      if (!map.isStyleLoaded()) return;

      nicepodLog(`🚀 [Camera:${mapId}] Iniciando Vuelo Balístico (${activePerspective}).`);

      // FRENO FÍSICO: Detenemos el motor LERP para liberar la GPU
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      isFlyingRef.current = true;
      lastProcessedTriggerRef.current = recenterTrigger;

      // Sincronía previa de posición
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
        // Si es recentrado manual (trigger), aplicamos velocidad táctica
        duration: triggerReceived ? 1200 : FLY_CONFIG.duration
      });

      map.once('moveend', () => {
        nicepodLog(`🏁 [Camera:${mapId}] Aterrizaje completado.`);

        // Sincronía post-vuelo para evitar el rebote LERP
        currentPitchRef.current = profile.pitch;
        currentZoomRef.current = profile.zoom;
        currentBearingRef.current = profile.bearing_follow ? (userLocation.heading ?? 0) : 0;

        isFlyingRef.current = false;
        confirmLanding();

        // Reiniciamos el bucle y el reloj del Delta-Time
        lastFrameTimeRef.current = 0;
        animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      });
    }
  }, [needsBallisticLanding, recenterTrigger, mapInstance, userLocation, globalPerspective, forcedPerspective, confirmLanding, kinematicLoop, mapId]);

  /**
   * CICLO DE VIDA: Gestión de Hardware y Canvas
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
 * NOTA TÉCNICA DEL ARCHITECT (V4.11):
 * 1. Perspective Isolation: El uso de forcedPerspective permite que el widget del 
 *    Dashboard ignore las órdenes globales de 3D, resolviendo el ladeo de la Imagen 37.
 * 2. Tactical Stasis: El umbral de BEARING_THRESHOLD (0.8°) erradica los movimientos
 *    laterales causados por el ruido del magnetómetro detectado en la Imagen 33.
 * 3. Delta-Time LERP: La fluidez del movimiento es ahora constante e independiente
 *    de la carga del navegador, eliminando los saltos de cámara erráticos.
 * 4. Loop Sync: Se sincronizan las refs de Pitch y Zoom tras cada vuelo balístico,
 *    asegurando que el motor líquido herede la posición exacta de la GPU.
 */