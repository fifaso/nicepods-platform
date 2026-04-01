/**
 * ARCHIVO: components/geo/SpatialEngine/camera-controller.tsx
 * VERSIÓN: 5.0 (NicePod Camera Director - Atomic Sovereignty & Jitter-Free Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Gestionar la cámara WebGL con autoridad absoluta, aislamiento de perspectiva y 
 * erradicación del "Camera Fighting" entre gestos humanos y LERP.
 * [REFORMA V5.0]: Sincronización Pasiva, Freno Hidráulico Atómico y True Delta-Time LERP.
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
 * UMBRALES DE ESTASIS CINEMÁTICA
 * Definen la "Zona de Silencio" para erradicar el pestañeo y el jitter de hardware.
 */
const STASIS_CONFIG = {
  DISTANCE_THRESHOLD: 0.10, // 10 centímetros
  BEARING_THRESHOLD: 0.8,   // 0.8 grados
  PITCH_THRESHOLD: 0.5,
  ZOOM_THRESHOLD: 0.01
};

export function CameraController({ mapId, forcedPerspective }: CameraControllerProps) {
  // 1. CONEXIÓN VINCULADA POR ID SOBERANO
  const { [mapId]: mapInstance } = useMap();

  // 2. CONSUMO DE MANDO CINEMÁTICO
  const {
    userLocation,
    needsBallisticLanding,
    recenterTrigger,
    confirmLanding,
    cameraPerspective: globalPerspective,
    isManualMode,
    setManualMode
  } = useGeoEngine();

  // 3. MEMORIA TÉCNICA Y ESCUDOS ATÓMICOS
  const currentPosRef = useRef<KinematicPosition | null>(null);
  const currentBearingRef = useRef<number>(INITIAL_OVERVIEW_CONFIG.bearing);
  const currentPitchRef = useRef<number>(INITIAL_OVERVIEW_CONFIG.pitch);
  const currentZoomRef = useRef<number>(INITIAL_OVERVIEW_CONFIG.zoom);

  // [REFORMA V5.0]: isInteractingRef es síncrono. Resuelve el Camera Fighting.
  const isInteractingRef = useRef<boolean>(false);
  const isFlyingRef = useRef<boolean>(false);
  const lastInteractionRef = useRef<number>(0);
  const lastProcessedTriggerRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  /**
   * handleUserInteraction: EL ESCUDO DE INTERACCIÓN ATÓMICO
   * Otorga autoridad absoluta e instantánea a los gestos humanos.
   */
  const handleUserInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();

    if (!isInteractingRef.current) {
      nicepodLog(`🛡️ [Camera:${mapId}] Escudo de Interacción Activado (Mando Humano).`);
    }

    isInteractingRef.current = true;
    if (!isManualMode) setManualMode(true);

    // FRENO HIDRÁULICO DE EMERGENCIA: Si el mapa estaba volando por IA o botón, 
    // el toque humano lo aborta FÍSICAMENTE en la GPU.
    if (isFlyingRef.current) {
      const map = mapInstance?.getMap();
      if (map) map.stop();
      isFlyingRef.current = false;
      confirmLanding();
    }
  }, [isManualMode, setManualMode, mapInstance, confirmLanding, mapId]);

  /**
   * kinematicLoop: EL CORAZÓN DEL MOVIMIENTO LÍQUIDO
   * Misión: Ejecutar la cinemática adaptativa respetando las jerarquías de control.
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

    // A. CÁLCULO DE DELTA-TIME (True LERP)
    if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
    let deltaTime = (timestamp - lastFrameTimeRef.current) / 1000;
    lastFrameTimeRef.current = timestamp;

    // CLAMPING: Evita que el Delta-Time se dispare si el usuario cambia de pestaña, 
    // lo que causaría un "teletransporte" al regresar.
    if (deltaTime > 0.1) deltaTime = 0.1;

    // B. TIMEOUT DE RECUPERACIÓN (Recentrado Automático tras 8s de soltar la pantalla)
    const now = Date.now();
    if (isInteractingRef.current && (now - lastInteractionRef.current > 8000)) {
      nicepodLog(`🦅 [Camera:${mapId}] Recuperación de Autoridad tras inactividad.`);
      isInteractingRef.current = false;
      setManualMode(false);
    }

    // C. SINCRONIZACIÓN PASIVA (EVITA LOS SNAPS)
    if (isInteractingRef.current || isFlyingRef.current) {
      // Mientras el usuario o el flyTo controlan el mapa, el motor LERP copia 
      // pasivamente las coordenadas de la GPU. Así, cuando retome el control, 
      // lo hará desde el punto exacto donde lo dejó el usuario.
      const center = map.getCenter();
      currentPosRef.current = { latitude: center.lat, longitude: center.lng };
      currentBearingRef.current = map.getBearing();
      currentPitchRef.current = map.getPitch();
      currentZoomRef.current = map.getZoom();

      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    // D. DETERMINACIÓN DE PERSPECTIVA (Forced vs Global)
    const activePerspective = forcedPerspective || globalPerspective;
    const profile = PERSPECTIVE_PROFILES[activePerspective];

    const targetPos: KinematicPosition = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude
    };

    if (!currentPosRef.current) currentPosRef.current = targetPos;

    // 1. Evaluación de Diferenciales para Estasis
    const distDelta = calculateDistance(currentPosRef.current, targetPos);
    const targetBearing = profile.bearing_follow ? (userLocation.heading ?? currentBearingRef.current) : 0;
    const bearingDelta = Math.abs(targetBearing - currentBearingRef.current);
    const pitchDelta = Math.abs(currentPitchRef.current - profile.pitch);
    const zoomDelta = Math.abs(currentZoomRef.current - profile.zoom);

    if (distDelta < STASIS_CONFIG.DISTANCE_THRESHOLD &&
      bearingDelta < STASIS_CONFIG.BEARING_THRESHOLD &&
      pitchDelta < STASIS_CONFIG.PITCH_THRESHOLD &&
      zoomDelta < STASIS_CONFIG.ZOOM_THRESHOLD) {
      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    // E. TRUE DELTA-TIME LERP
    // Transforma el factor constante en un factor dependiente del tiempo real.
    const baseFactor = KINEMATIC_CONFIG.LERP_FACTOR;
    const timeAdjustedFactor = 1 - Math.pow(1 - baseFactor, deltaTime * 60);

    currentPosRef.current = interpolateCoords(currentPosRef.current, targetPos, timeAdjustedFactor);
    currentBearingRef.current = interpolateAngle(currentBearingRef.current, targetBearing, timeAdjustedFactor);
    currentPitchRef.current = lerpSimple(currentPitchRef.current, profile.pitch, timeAdjustedFactor);
    currentZoomRef.current = lerpSimple(currentZoomRef.current, profile.zoom, timeAdjustedFactor);

    // F. INYECCIÓN IMPERATIVA EN GPU
    const cameraAnchor = calculateDestinationPoint(
      currentPosRef.current,
      -profile.offset_distance_meters,
      currentBearingRef.current
    );

    map.jumpTo({
      center: [cameraAnchor.longitude, cameraAnchor.latitude],
      bearing: currentBearingRef.current,
      pitch: currentPitchRef.current,
      zoom: currentZoomRef.current
    });

    animationFrameRef.current = requestAnimationFrame(kinematicLoop);
  }, [mapInstance, userLocation, globalPerspective, forcedPerspective, setManualMode, mapId]);

  /**
   * EFECTO: ORQUESTACIÓN DE VUELO BALÍSTICO POR PULSO
   * [REFORMA V5.0]: El botón de ubicación recobra la Autoridad Absoluta.
   */
  useEffect(() => {
    const triggerReceived = recenterTrigger > lastProcessedTriggerRef.current;

    if ((needsBallisticLanding || triggerReceived) && mapInstance && userLocation && !isFlyingRef.current) {
      const map = mapInstance.getMap();
      const activePerspective = forcedPerspective || globalPerspective;
      const profile = PERSPECTIVE_PROFILES[activePerspective];

      if (!map.isStyleLoaded()) return;

      nicepodLog(`🚀 [Camera:${mapId}] Ejecutando Vuelo Soberano (Trigger: ${recenterTrigger}).`);

      // 1. TOMA DE CONTROL ABSOLUTA
      isInteractingRef.current = false;
      if (isManualMode) setManualMode(false);

      map.stop(); // Purgamos la cola de la GPU

      isFlyingRef.current = true;
      lastProcessedTriggerRef.current = recenterTrigger;

      // 2. SINCRONIZACIÓN T0 PARA EL VUELO
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
        // Validación post-vuelo: Solo confirmamos aterrizaje si el usuario 
        // no abortó el vuelo tocando la pantalla (isInteractingRef).
        if (!isInteractingRef.current) {
          nicepodLog(`🏁 [Camera:${mapId}] Aterrizaje táctico exitoso.`);
          currentPitchRef.current = profile.pitch;
          currentZoomRef.current = profile.zoom;
          currentBearingRef.current = profile.bearing_follow ? (userLocation.heading ?? 0) : 0;

          confirmLanding();
        }
        isFlyingRef.current = false;
      });
    }
  }, [needsBallisticLanding, recenterTrigger, mapInstance, userLocation, globalPerspective, forcedPerspective, confirmLanding, isManualMode, setManualMode, mapId]);

  /**
   * CICLO DE VIDA Y LISTENERS
   */
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(kinematicLoop);

    const canvas = mapInstance?.getMap().getCanvas();
    if (canvas) {
      canvas.addEventListener('mousedown', handleUserInteraction);
      canvas.addEventListener('touchstart', handleUserInteraction, { passive: true });
      canvas.addEventListener('touchmove', handleUserInteraction, { passive: true }); // V5.0: Sostiene el estado durante el arrastre
      canvas.addEventListener('wheel', handleUserInteraction, { passive: true });
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (canvas) {
        canvas.removeEventListener('mousedown', handleUserInteraction);
        canvas.removeEventListener('touchstart', handleUserInteraction);
        canvas.removeEventListener('touchmove', handleUserInteraction);
        canvas.removeEventListener('wheel', handleUserInteraction);
      }
    };
  }, [mapInstance, kinematicLoop, handleUserInteraction]);

  return null;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Atomic Detachment (Anti-Fighting): El uso de isInteractingRef sincrónico y 
 *    map.stop() garantiza que el motor LERP y los vuelos balísticos se apaguen
 *    instantáneamente en el momento que el humano toca el cristal.
 * 2. True Delta-Time: Se ha implementado un cálculo no lineal para el LERP 
 *    (timeAdjustedFactor) junto con un CLAMP de 0.1s. Esto erradica el Jitter 
 *    y mantiene el movimiento de cámara idéntico en pantallas de 60Hz y 120Hz.
 * 3. Passive Sync: Al rotar el mapa a mano, el motor copia la posición. Así, tras 
 *    8s de inactividad, la cámara "respira" suavemente desde donde se dejó, sin 
 *    saltos bruscos que rompan la inmersión.
 * 4. Sovereign Trigger: El botón de ubicación ahora toma el control forzoso
 *    anulando cualquier estado manual previo.
 */