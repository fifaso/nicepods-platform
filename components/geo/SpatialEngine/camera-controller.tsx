/**
 * ARCHIVO: components/geo/SpatialEngine/camera-controller.tsx
 * VERSIÓN: 7.1 (NicePod Camera Director - Cinematic Stability & Type Guard Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Gestionar la cámara WebGL con autoridad absoluta, aislamiento de perspectiva 
 * y sincronización pasiva con los gestos humanos para erradicar el Jitter visual.
 * [REFORMA V7.1]: Resolución definitiva de errores de tipos TS2345 y TS2724, 
 * implementación de Guardias de Tipo para referencias nulas y purificación nominal.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useGeoEngine } from "@/hooks/use-geo-engine";
import {
  calculateDestinationPoint,
  calculateDistanceBetweenPoints, // [FIX V7.1]: Sincronía con lib V3.0
  interpolateAngle,
  interpolateCoordinates,         // [FIX V7.1]: Sincronía con lib V3.0
  KinematicPosition,
  interpolateScalarValue          // [FIX V7.1]: Sincronía con lib V3.0
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

/**
 * INTERFAZ: CameraControllerProperties
 */
interface CameraControllerProperties {
  /** mapInstanceIdentification: Identificador único de la instancia soberana WebGL en la GPU. */
  mapInstanceIdentification: MapInstanceId;
  /** forcedPerspective: Bloqueo opcional de modo de visión para contextos específicos. */
  forcedPerspective?: CameraPerspective;
}

/**
 * UMBRALES DE ESTASIS CINEMÁTICA
 * Definen la "Zona de Silencio" para anular el ruido térmico del hardware en reposo.
 */
const STASIS_GOVERNANCE_CONFIGURATION = {
  DISTANCE_THRESHOLD_METERS: 0.10, 
  BEARING_THRESHOLD_DEGREES: 0.8,  
  PITCH_THRESHOLD_DEGREES: 0.5,
  ZOOM_THRESHOLD: 0.01
};

/**
 * CameraController: El cerebro cinemático del reactor visual de NicePod.
 */
export function CameraController({ 
  mapInstanceIdentification, 
  forcedPerspective 
}: CameraControllerProperties) {
  
  // 1. VÍNCULO CON LA INSTANCIA DE MAPBOX (Consumo de Malla)
  const { [mapInstanceIdentification]: activeMapInstance } = useMap();

  // 2. CONSUMO DE MANDO DESDE LA FACHADA SOBERANA (Triple-Core V4.0)
  const {
    userLocation,
    needsBallisticLanding,
    recenterTrigger: recenterPulseTrigger,
    confirmLanding: confirmAterrizajeExitoso,
    cameraPerspective: globalCameraPerspective,
    isManualMode,
    setManualMode
  } = useGeoEngine();

  // 3. MEMORIA TÁCTICA DE ALTA VELOCIDAD (REFERENCIAS MUTABLES)
  const currentGeographicPositionReference = useRef<KinematicPosition | null>(null);
  const currentBearingDegreesReference = useRef<number>(INITIAL_OVERVIEW_CONFIG.bearing);
  const currentPitchDegreesReference = useRef<number>(INITIAL_OVERVIEW_CONFIG.pitch);
  const currentZoomLevelReference = useRef<number>(INITIAL_OVERVIEW_CONFIG.zoom);

  const isUserInteractingReference = useRef<boolean>(false);
  const isCinematicFlightActiveReference = useRef<boolean>(false);
  const lastInteractionTimestampReference = useRef<number>(0);
  const lastProcessedPulseTriggerReference = useRef<number>(0);
  const lastFrameTimestampReference = useRef<number>(0);
  const animationFrameIdentificationReference = useRef<number | null>(null);

  /**
   * handleManualInteractionAction: EL ESCUDO DE INTERFERENCIA HUMANA
   * Misión: Tomar autoridad inmediata sobre la GPU ante el primer contacto táctico.
   */
  const handleManualInteractionAction = useCallback(() => {
    lastInteractionTimestampReference.current = Date.now();

    if (!isUserInteractingReference.current) {
      nicepodLog(`🛡️ [CameraController:${mapInstanceIdentification}] Autoridad cedida al Administrador.`);
    }

    isUserInteractingReference.current = true;
    if (!isManualMode) {
      setManualMode(true);
    }

    if (isCinematicFlightActiveReference.current) {
      const nativeMapInstance = activeMapInstance?.getMap();
      if (nativeMapInstance) {
        nativeMapInstance.stop();
      }
      isCinematicFlightActiveReference.current = false;
      confirmAterrizajeExitoso();
    }
  }, [isManualMode, setManualMode, activeMapInstance, confirmAterrizajeExitoso, mapInstanceIdentification]);

  /**
   * executeKinematicPhysicsLoop: EL CORAZÓN DEL MOVIMIENTO LÍQUIDO
   * Misión: Calcular la posición de la lente en cada frame sincronizado con la GPU.
   */
  const executeKinematicPhysicsLoop = useCallback((highResolutionTimestamp: number) => {
    if (!activeMapInstance || !userLocation) {
      animationFrameIdentificationReference.current = requestAnimationFrame(executeKinematicPhysicsLoop);
      return;
    }

    const nativeMapInstance = activeMapInstance.getMap();
    if (!nativeMapInstance.isStyleLoaded()) {
      animationFrameIdentificationReference.current = requestAnimationFrame(executeKinematicPhysicsLoop);
      return;
    }

    // A. CÁLCULO DE DIFERENCIAL DE TIEMPO (DELTA-TIME)
    if (!lastFrameTimestampReference.current) {
      lastFrameTimestampReference.current = highResolutionTimestamp;
    }
    let elapsedTimeInSeconds = (highResolutionTimestamp - lastFrameTimestampReference.current) / 1000;
    lastFrameTimestampReference.current = highResolutionTimestamp;

    if (elapsedTimeInSeconds > 0.1) {
      elapsedTimeInSeconds = 0.1;
    }

    // B. PROTOCOLO DE RECUPERACIÓN DE AUTORÍA
    const currentSystemTime = Date.now();
    const isMapCurrentlyMovingByInertia = nativeMapInstance.isMoving();

    if (isUserInteractingReference.current && (currentSystemTime - lastInteractionTimestampReference.current > 8000)) {
      if (!isMapCurrentlyMovingByInertia) {
        nicepodLog(`🦅 [CameraController:${mapInstanceIdentification}] Retomando autoridad cinemática.`);
        isUserInteractingReference.current = false;
        setManualMode(false);
      }
    }

    // C. SINCRONIZACIÓN PASIVA DE ESTADO
    if (isUserInteractingReference.current || isCinematicFlightActiveReference.current || isMapCurrentlyMovingByInertia) {
      const currentMapCenterPoint = nativeMapInstance.getCenter();
      currentGeographicPositionReference.current = { 
        latitude: currentMapCenterPoint.lat, 
        longitude: currentMapCenterPoint.lng 
      };
      currentBearingDegreesReference.current = nativeMapInstance.getBearing();
      currentPitchDegreesReference.current = nativeMapInstance.getPitch();
      currentZoomLevelReference.current = nativeMapInstance.getZoom();

      animationFrameIdentificationReference.current = requestAnimationFrame(executeKinematicPhysicsLoop);
      return;
    }

    // D. DETERMINACIÓN DE PERFIL DE PERSPECTIVA
    const activePerspectiveMode = forcedPerspective || globalCameraPerspective;
    const activePerspectiveProfile = PERSPECTIVE_PROFILES[activePerspectiveMode];

    const targetGeographicPosition: KinematicPosition = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude
    };

    /**
     * [FIX TS2345]: TYPE GUARD SOBERANO
     * Inicializamos la referencia si es nula antes de proceder al cálculo de distancia.
     */
    if (!currentGeographicPositionReference.current) {
      currentGeographicPositionReference.current = targetGeographicPosition;
    }

    // 1. Evaluación de Umbrales de Estasis
    const movementDistanceMeters = calculateDistanceBetweenPoints(currentGeographicPositionReference.current, targetGeographicPosition);
    const targetBearingDegrees = activePerspectiveProfile.bearing_follow ? (userLocation.heading ?? currentBearingDegreesReference.current) : 0;
    
    const bearingDeltaDegrees = Math.abs(targetBearingDegrees - currentBearingDegreesReference.current);
    const pitchDeltaDegrees = Math.abs(currentPitchDegreesReference.current - activePerspectiveProfile.pitch);
    const zoomDeltaValue = Math.abs(currentZoomLevelReference.current - activePerspectiveProfile.zoom);

    if (movementDistanceMeters < STASIS_GOVERNANCE_CONFIGURATION.DISTANCE_THRESHOLD_METERS &&
        bearingDeltaDegrees < STASIS_GOVERNANCE_CONFIGURATION.BEARING_THRESHOLD_DEGREES &&
        pitchDeltaDegrees < STASIS_GOVERNANCE_CONFIGURATION.PITCH_THRESHOLD_DEGREES &&
        zoomDeltaValue < STASIS_GOVERNANCE_CONFIGURATION.ZOOM_THRESHOLD) {
      animationFrameIdentificationReference.current = requestAnimationFrame(executeKinematicPhysicsLoop);
      return;
    }

    // E. INTERPOLACIÓN CINEMÁTICA LERP (DELTA-TIME CORRECTED)
    const baseSmoothingFactor = KINEMATIC_CONFIG.LERP_FACTOR;
    const adjustedSmoothingFactor = 1 - Math.pow(1 - baseSmoothingFactor, elapsedTimeInSeconds * 60);

    currentGeographicPositionReference.current = interpolateCoordinates(currentGeographicPositionReference.current, targetGeographicPosition, adjustedSmoothingFactor);
    currentBearingDegreesReference.current = interpolateAngle(currentBearingDegreesReference.current, targetBearingDegrees, adjustedSmoothingFactor);
    currentPitchDegreesReference.current = interpolateScalarValue(currentPitchDegreesReference.current, activePerspectiveProfile.pitch, adjustedSmoothingFactor);
    currentZoomLevelReference.current = interpolateScalarValue(currentZoomLevelReference.current, activePerspectiveProfile.zoom, adjustedSmoothingFactor);

    // F. INYECCIÓN IMPERATIVA EN GPU
    const cameraAnchorPosition = calculateDestinationPoint(
      currentGeographicPositionReference.current,
      -activePerspectiveProfile.offset_distance_meters,
      currentBearingDegreesReference.current
    );

    nativeMapInstance.jumpTo({
      center: [cameraAnchorPosition.longitude, cameraAnchorPosition.latitude],
      bearing: currentBearingDegreesReference.current,
      pitch: currentPitchDegreesReference.current,
      zoom: currentZoomLevelReference.current
    });

    animationFrameIdentificationReference.current = requestAnimationFrame(executeKinematicPhysicsLoop);
  }, [activeMapInstance, userLocation, globalCameraPerspective, forcedPerspective, setManualMode, mapInstanceIdentification]);

  /**
   * EFECTO: ORQUESTACIÓN DE VUELO BALÍSTICO POR PULSO SOBERANO
   */
  useEffect(() => {
    const isRecenterPulseTriggered = recenterPulseTrigger > lastProcessedPulseTriggerReference.current;

    if ((needsBallisticLanding || isRecenterPulseTriggered) && activeMapInstance && userLocation && !isCinematicFlightActiveReference.current) {
      const nativeMapInstance = activeMapInstance.getMap();
      const activePerspectiveMode = forcedPerspective || globalCameraPerspective;
      const activePerspectiveProfile = PERSPECTIVE_PROFILES[activePerspectiveMode];

      if (!nativeMapInstance.isStyleLoaded()) return;

      nicepodLog(`🚀 [CameraController:${mapInstanceIdentification}] Iniciando Vuelo Soberano.`);

      isUserInteractingReference.current = false;
      if (isManualMode) setManualMode(false);
      nativeMapInstance.stop();

      isCinematicFlightActiveReference.current = true;
      lastProcessedPulseTriggerReference.current = recenterPulseTrigger;

      currentGeographicPositionReference.current = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      };

      nativeMapInstance.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: activePerspectiveProfile.zoom,
        pitch: activePerspectiveProfile.pitch,
        bearing: activePerspectiveProfile.bearing_follow ? (userLocation.heading ?? 0) : 0,
        ...FLY_CONFIG,
        duration: isRecenterPulseTriggered ? 1200 : FLY_CONFIG.duration
      });

      nativeMapInstance.once('moveend', () => {
        if (!isUserInteractingReference.current) {
          nicepodLog(`🏁 [CameraController:${mapInstanceIdentification}] Aterrizaje táctico confirmado.`);
          currentPitchDegreesReference.current = activePerspectiveProfile.pitch;
          currentZoomLevelReference.current = activePerspectiveProfile.zoom;
          currentBearingDegreesReference.current = activePerspectiveProfile.bearing_follow ? (userLocation.heading ?? 0) : 0;
          
          confirmAterrizajeExitoso();
        }
        isCinematicFlightActiveReference.current = false;
      });
    }
  }, [needsBallisticLanding, recenterPulseTrigger, activeMapInstance, userLocation, globalCameraPerspective, forcedPerspective, confirmAterrizajeExitoso, isManualMode, setManualMode, mapInstanceIdentification]);

  /**
   * CICLO DE VIDA: GOBERNANZA DE EVENTOS Y ANIQUILACIÓN DE BUCLE
   */
  useEffect(() => {
    animationFrameIdentificationReference.current = requestAnimationFrame(executeKinematicPhysicsLoop);

    const nativeMapCanvasElement = activeMapInstance?.getMap().getCanvas();
    if (nativeMapCanvasElement) {
      nativeMapCanvasElement.addEventListener('mousedown', handleManualInteractionAction);
      nativeMapCanvasElement.addEventListener('touchstart', handleManualInteractionAction, { passive: true });
      nativeMapCanvasElement.addEventListener('touchmove', handleManualInteractionAction, { passive: true });
      nativeMapCanvasElement.addEventListener('wheel', handleManualInteractionAction, { passive: true });
    }

    return () => {
      if (animationFrameIdentificationReference.current) {
        cancelAnimationFrame(animationFrameIdentificationReference.current);
      }
      if (nativeMapCanvasElement) {
        nativeMapCanvasElement.removeEventListener('mousedown', handleManualInteractionAction);
        nativeMapCanvasElement.removeEventListener('touchstart', handleManualInteractionAction);
        nativeMapCanvasElement.removeEventListener('touchmove', handleManualInteractionAction);
        nativeMapCanvasElement.removeEventListener('wheel', handleManualInteractionAction);
      }
    };
  }, [activeMapInstance, executeKinematicPhysicsLoop, handleManualInteractionAction]);

  return null;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V7.1):
 * 1. Type Guard Implementation: Se neutralizó el error TS2345 asegurando que la 
 *    referencia geográfica se inicialice perezosamente antes de ser procesada por 
 *    el motor de distancias.
 * 2. Library Sync: Se corrigió el error TS2724 sincronizando las funciones importadas 
 *    con el nuevo estándar nominal de lib/geo-kinematics.ts V3.0.
 * 3. Zero Abbreviations: Purificación total de la nomenclatura técnica para un 
 *    mantenimiento industrial soberano.
 */