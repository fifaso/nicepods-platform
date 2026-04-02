/**
 * ARCHIVO: components/geo/SpatialEngine/camera-controller.tsx
 * VERSIÓN: 6.0 (NicePod Camera Director - Passive Sync & Satellite Stability Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Gestionar la cámara WebGL con autoridad absoluta, aislamiento de perspectiva 
 * y sincronización pasiva con los gestos humanos para erradicar el Jitter.
 * [REFORMA V6.0]: Implementación de seguimiento de inercia y blindaje de modo SATELLITE.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
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
  /** mapInstanceId: Identificador único de la instancia soberana WebGL. */
  mapInstanceId: MapInstanceId;
  /** forcedPerspective: Bloqueo opcional de modo de visión (ej: OVERVIEW en Dashboard). */
  forcedPerspective?: CameraPerspective;
}

/**
 * UMBRALES DE ESTASIS CINEMÁTICA
 * Definen la "Zona de Silencio" para anular el ruido del hardware en reposo.
 */
const STASIS_CONFIGURATION = {
  DISTANCE_THRESHOLD_METERS: 0.10, // 10 centímetros
  BEARING_THRESHOLD_DEGREES: 0.8,  // 0.8 grados
  PITCH_THRESHOLD_DEGREES: 0.5,
  ZOOM_THRESHOLD: 0.01
};

export function CameraController({ mapInstanceId, forcedPerspective }: CameraControllerProps) {
  // 1. VÍNCULO CON LA INSTANCIA DE MAPBOX
  const { [mapInstanceId]: mapInstance } = useMap();

  // 2. CONSUMO DE MANDO DESDE LA FACHADA (V45.0)
  const {
    userLocation,
    needsBallisticLanding,
    recenterTrigger,
    confirmLanding,
    cameraPerspective: globalPerspective,
    isManualMode,
    setManualMode
  } = useGeoEngine();

  // 3. MEMORIA TÉCNICA DE ALTA VELOCIDAD (REFS)
  const currentPositionReference = useRef<KinematicPosition | null>(null);
  const currentBearingReference = useRef<number>(INITIAL_OVERVIEW_CONFIG.bearing);
  const currentPitchReference = useRef<number>(INITIAL_OVERVIEW_CONFIG.pitch);
  const currentZoomReference = useRef<number>(INITIAL_OVERVIEW_CONFIG.zoom);

  const isUserInteractingReference = useRef<boolean>(false);
  const isCinetmaticFlyingReference = useRef<boolean>(false);
  const lastInteractionTimestampReference = useRef<number>(0);
  const lastProcessedTriggerReference = useRef<number>(0);
  const lastFrameTimestampReference = useRef<number>(0);
  const animationFrameIdReference = useRef<number | null>(null);

  /**
   * handleUserInteraction: EL ESCUDO DE INTERACCIÓN SÍNCRONO
   * Misión: Tomar autoridad inmediata sobre la GPU ante el primer contacto físico.
   */
  const handleUserInteraction = useCallback(() => {
    lastInteractionTimestampReference.current = Date.now();

    if (!isUserInteractingReference.current) {
      nicepodLog(`🛡️ [CameraController:${mapInstanceId}] Autoridad cedida al Administrador.`);
    }

    isUserInteractingReference.current = true;
    if (!isManualMode) {
      setManualMode(true);
    }

    // FRENO HIDRÁULICO: Si el mapa volaba por orden del orquestador, el tacto humano lo detiene.
    if (isCinetmaticFlyingReference.current) {
      const nativeMap = mapInstance?.getMap();
      if (nativeMap) {
        nativeMap.stop();
      }
      isCinetmaticFlyingReference.current = false;
      confirmLanding();
    }
  }, [isManualMode, setManualMode, mapInstance, confirmLanding, mapInstanceId]);

  /**
   * kinematicLoop: EL CORAZÓN DEL MOVIMIENTO LÍQUIDO (V6.0)
   * Misión: Calcular la posición de la cámara en cada frame sincronizado con la GPU.
   */
  const kinematicLoop = useCallback((timestamp: number) => {
    if (!mapInstance || !userLocation) {
      animationFrameIdReference.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    const nativeMap = mapInstance.getMap();
    if (!nativeMap.isStyleLoaded()) {
      animationFrameIdReference.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    // A. CÁLCULO DE DELTA-TIME
    if (!lastFrameTimestampReference.current) {
      lastFrameTimestampReference.current = timestamp;
    }
    let deltaTimeSeconds = (timestamp - lastFrameTimestampReference.current) / 1000;
    lastFrameTimestampReference.current = timestamp;

    // Protección contra saltos temporales (Background throttling)
    if (deltaTimeSeconds > 0.1) {
      deltaTimeSeconds = 0.1;
    }

    // B. PROTOCOLO DE RECUPERACIÓN (Time-out de 8 segundos)
    const currentTime = Date.now();
    const mapIsMovingRightNow = nativeMap.isMoving();

    if (isUserInteractingReference.current && (currentTime - lastInteractionTimestampReference.current > 8000)) {
      // Solo recuperamos autoridad si el mapa ya no se está moviendo por inercia
      if (!mapIsMovingRightNow) {
        nicepodLog(`🦅 [CameraController:${mapInstanceId}] Retomando autoridad cinemática.`);
        isUserInteractingReference.current = false;
        setManualMode(false);
      }
    }

    // C. SINCRONIZACIÓN PASIVA (Punto Ciego 3 Solucionado)
    // Mientras el usuario manda, la cámara copia la posición para evitar el "Snap" al soltar.
    if (isUserInteractingReference.current || isCinetmaticFlyingReference.current || mapIsMovingRightNow) {
      const currentMapCenter = nativeMap.getCenter();
      currentPositionReference.current = { 
        latitude: currentMapCenter.lat, 
        longitude: currentMapCenter.lng 
      };
      currentBearingReference.current = nativeMap.getBearing();
      currentPitchReference.current = nativeMap.getPitch();
      currentZoomReference.current = nativeMap.getZoom();

      animationFrameIdReference.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    // D. DETERMINACIÓN DE PERSPECTIVA (V6.0)
    const activePerspectiveMode = forcedPerspective || globalPerspective;
    const perspectiveProfile = PERSPECTIVE_PROFILES[activePerspectiveMode];

    const targetPosition: KinematicPosition = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude
    };

    if (!currentPositionReference.current) {
      currentPositionReference.current = targetPosition;
    }

    // 1. Evaluación de Estasis
    const movementDistance = calculateDistance(currentPositionReference.current, targetPosition);
    const targetBearing = perspectiveProfile.bearing_follow ? (userLocation.heading ?? currentBearingReference.current) : 0;
    
    const bearingDelta = Math.abs(targetBearing - currentBearingReference.current);
    const pitchDelta = Math.abs(currentPitchReference.current - perspectiveProfile.pitch);
    const zoomDelta = Math.abs(currentZoomReference.current - perspectiveProfile.zoom);

    if (movementDistance < STASIS_CONFIGURATION.DISTANCE_THRESHOLD_METERS &&
        bearingDelta < STASIS_CONFIGURATION.BEARING_THRESHOLD_DEGREES &&
        pitchDelta < STASIS_CONFIGURATION.PITCH_THRESHOLD_DEGREES &&
        zoomDelta < STASIS_CONFIGURATION.ZOOM_THRESHOLD) {
      animationFrameIdReference.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    // E. INTERPOLACIÓN CINEMÁTICA DELTA-TIME
    const baseSmoothingFactor = KINEMATIC_CONFIG.LERP_FACTOR;
    const adjustedFactor = 1 - Math.pow(1 - baseSmoothingFactor, deltaTimeSeconds * 60);

    currentPositionReference.current = interpolateCoords(currentPositionReference.current, targetPosition, adjustedFactor);
    currentBearingReference.current = interpolateAngle(currentBearingReference.current, targetBearing, adjustedFactor);
    currentPitchReference.current = lerpSimple(currentPitchReference.current, perspectiveProfile.pitch, adjustedFactor);
    currentZoomReference.current = lerpSimple(currentZoomReference.current, perspectiveProfile.zoom, adjustedFactor);

    // F. INYECCIÓN IMPERATIVA EN GPU
    // Aplicamos el offset de distancia para que la cámara no esté "encima" del avatar.
    const cameraAnchorPosition = calculateDestinationPoint(
      currentPositionReference.current,
      -perspectiveProfile.offset_distance_meters,
      currentBearingReference.current
    );

    nativeMap.jumpTo({
      center: [cameraAnchorPosition.longitude, cameraAnchorPosition.latitude],
      bearing: currentBearingReference.current,
      pitch: currentPitchReference.current,
      zoom: currentZoomReference.current
    });

    animationFrameIdReference.current = requestAnimationFrame(kinematicLoop);
  }, [mapInstance, userLocation, globalPerspective, forcedPerspective, setManualMode, mapInstanceId]);

  /**
   * EFECTO: ORQUESTACIÓN DE VUELO BALÍSTICO POR PULSO
   */
  useEffect(() => {
    const triggerReceived = recenterTrigger > lastProcessedTriggerReference.current;

    if ((needsBallisticLanding || triggerReceived) && mapInstance && userLocation && !isCinetmaticFlyingReference.current) {
      const nativeMap = mapInstance.getMap();
      const activePerspectiveMode = forcedPerspective || globalPerspective;
      const perspectiveProfile = PERSPECTIVE_PROFILES[activePerspectiveMode];

      if (!nativeMap.isStyleLoaded()) return;

      nicepodLog(`🚀 [CameraController:${mapInstanceId}] Iniciando Vuelo Soberano.`);

      // 1. TOMA DE CONTROL ABSOLUTA
      isUserInteractingReference.current = false;
      if (isManualMode) setManualMode(false);
      nativeMap.stop();

      isCinetmaticFlyingReference.current = true;
      lastProcessedTriggerReference.current = recenterTrigger;

      // 2. SINCRONIZACIÓN T0 PARA EL SALTO
      currentPositionReference.current = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      };

      nativeMap.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: perspectiveProfile.zoom,
        pitch: perspectiveProfile.pitch,
        bearing: perspectiveProfile.bearing_follow ? (userLocation.heading ?? 0) : 0,
        ...FLY_CONFIG,
        duration: triggerReceived ? 1200 : FLY_CONFIG.duration
      });

      nativeMap.once('moveend', () => {
        // Solo aterrizamos si el humano no ha interceptado el vuelo
        if (!isUserInteractingReference.current) {
          nicepodLog(`🏁 [CameraController:${mapInstanceId}] Aterrizaje táctico confirmado.`);
          currentPitchReference.current = perspectiveProfile.pitch;
          currentZoomReference.current = perspectiveProfile.zoom;
          currentBearingReference.current = perspectiveProfile.bearing_follow ? (userLocation.heading ?? 0) : 0;
          
          confirmLanding();
        }
        isCinetmaticFlyingReference.current = false;
      });
    }
  }, [needsBallisticLanding, recenterTrigger, mapInstance, userLocation, globalPerspective, forcedPerspective, confirmLanding, isManualMode, setManualMode, mapInstanceId]);

  /**
   * CICLO DE VIDA: Gestión de Eventos del Canvas
   */
  useEffect(() => {
    animationFrameIdReference.current = requestAnimationFrame(kinematicLoop);

    const canvasElement = mapInstance?.getMap().getCanvas();
    if (canvasElement) {
      canvasElement.addEventListener('mousedown', handleUserInteraction);
      canvasElement.addEventListener('touchstart', handleUserInteraction, { passive: true });
      canvasElement.addEventListener('touchmove', handleUserInteraction, { passive: true });
      canvasElement.addEventListener('wheel', handleUserInteraction, { passive: true });
    }

    return () => {
      if (animationFrameIdReference.current) {
        cancelAnimationFrame(animationFrameIdReference.current);
      }
      if (canvasElement) {
        canvasElement.removeEventListener('mousedown', handleUserInteraction);
        canvasElement.removeEventListener('touchstart', handleUserInteraction);
        canvasElement.removeEventListener('touchmove', handleUserInteraction);
        canvasElement.removeEventListener('wheel', handleUserInteraction);
      }
    };
  }, [mapInstance, kinematicLoop, handleUserInteraction]);

  return null;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Momentum Synchronization: El uso de nativeMap.isMoving() en el bucle LERP
 *    garantiza que la cámara espere a que termine la inercia del usuario antes 
 *    de retomar el seguimiento, erradicando micro-saltos de posición.
 * 2. Satellite Awareness: Al integrar las constantes V7.0, el controlador 
 *    detecta la perspectiva SATELLITE y anula el pitch y bearing dinámicos, 
 *    proporcionando una vista de ortofoto estable y profesional.
 * 3. Atomic Integrity: Todas las variables de estado críticas residen en 
 *    objetos MutableRef para una comunicación de latencia cero con la GPU.
 */