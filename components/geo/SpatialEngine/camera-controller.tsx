/**
 * ARCHIVO: components/geo/SpatialEngine/camera-controller.tsx
 * VERSIÓN: 8.0 (NicePod Camera Director - Absolute Nominal Sync & Cinematic Stability)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Gestionar la cámara WebGL con autoridad absoluta, aislamiento de perspectiva 
 * y sincronización pasiva con los gestos humanos para erradicar el Jitter visual 
 * mediante interpolación cinemática (LERP).
 * [REFORMA V8.0]: Sincronización nominal total con la Constitución V8.6. Resolución 
 * definitiva de errores TS2339 y TS2305 mediante el mapeo de coordenadas industriales 
 * (latitudeCoordinate, longitudeCoordinate). Erradicación absoluta de abreviaciones.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useGeoEngine } from "@/hooks/use-geo-engine";
import {
  calculateDestinationPoint,
  calculateDistanceBetweenPoints,
  interpolateAngle,
  interpolateCoordinates,
  KinematicPosition,
  interpolateScalarValue
} from "@/lib/geo-kinematics";
import { nicepodLog } from "@/lib/utils";
import { CameraPerspective, MapInstanceIdentification } from "@/types/geo-sovereignty";
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
  mapInstanceIdentification: MapInstanceIdentification;
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
  
  // 1. VÍNCULO CON LA INSTANCIA DE MAPBOX (Consumo de Malla mediante ID Soberano)
  const { [mapInstanceIdentification]: activeMapInstance } = useMap();

  // 2. CONSUMO DE MANDO DESDE LA FACHADA SOBERANA (Triple-Core Synergy V4.0)
  const {
    userLocation,
    needsBallisticLanding,
    recenterTrigger: recenterPulseTrigger,
    confirmLanding: confirmAterrizajeExitosoAction,
    cameraPerspective: globalCameraPerspective,
    isManualMode,
    setManualMode
  } = useGeoEngine();

  // 3. MEMORIA TÁCTICA DE ALTA VELOCIDAD (REFERENCIAS MUTABLES - PILAR 4)
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
        nativeMapInstance.stop(); // Abortar vuelo automático si el usuario interviene
      }
      isCinematicFlightActiveReference.current = false;
      confirmAterrizajeExitosoAction();
    }
  }, [isManualMode, setManualMode, activeMapInstance, confirmAterrizajeExitosoAction, mapInstanceIdentification]);

  /**
   * executeKinematicPhysicsLoop: EL CORAZÓN DEL MOVIMIENTO LÍQUIDO
   * Misión: Calcular la posición de la lente en cada frame sincronizado con la GPU (MTI).
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

    // Limite de seguridad para evitar saltos bruscos tras pausas largas del hilo principal
    if (elapsedTimeInSeconds > 0.1) {
      elapsedTimeInSeconds = 0.1;
    }

    // B. PROTOCOLO DE RECUPERACIÓN DE AUTORÍA (8 SEGUNDOS DE ESTASIS)
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

    // D. DETERMINACIÓN DE PERFIL DE PERSPECTIVA (V4.0)
    const activePerspectiveMode = forcedPerspective || globalCameraPerspective;
    const activePerspectiveProfile = PERSPECTIVE_PROFILES[activePerspectiveMode];

    // [SINCRO V8.0]: Mapeo de UserLocation (Constitución V8.6) a KinematicPosition (lib V3.0)
    const targetGeographicPosition: KinematicPosition = {
      latitude: userLocation.latitudeCoordinate,
      longitude: userLocation.longitudeCoordinate
    };

    if (!currentGeographicPositionReference.current) {
      currentGeographicPositionReference.current = targetGeographicPosition;
    }

    // 1. Evaluación de Umbrales de Estasis
    const movementDistanceMeters = calculateDistanceBetweenPoints(currentGeographicPositionReference.current, targetGeographicPosition);
    const targetBearingDegrees = activePerspectiveProfile.bearing_follow ? (userLocation.headingDegrees ?? currentBearingDegreesReference.current) : 0;
    
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
   * Misión: Ejecutar desplazamientos rápidos de largo alcance (Recenter/Initial Landing).
   */
  useEffect(() => {
    const isRecenterPulseTriggered = recenterPulseTrigger > lastProcessedPulseTriggerReference.current;

    if ((needsBallisticLanding || isRecenterPulseTriggered) && activeMapInstance && userLocation && !isCinematicFlightActiveReference.current) {
      const nativeMapInstance = activeMapInstance.getMap();
      const activePerspectiveMode = forcedPerspective || globalCameraPerspective;
      const activePerspectiveProfile = PERSPECTIVE_PROFILES[activePerspectiveMode];

      if (!nativeMapInstance.isStyleLoaded()) return;

      nicepodLog(`🚀 [CameraController:${mapInstanceIdentification}] Iniciando Vuelo Soberano de posicionamiento.`);

      isUserInteractingReference.current = false;
      if (isManualMode) setManualMode(false);
      nativeMapInstance.stop();

      isCinematicFlightActiveReference.current = true;
      lastProcessedPulseTriggerReference.current = recenterPulseTrigger;

      currentGeographicPositionReference.current = {
        latitude: userLocation.latitudeCoordinate,
        longitude: userLocation.longitudeCoordinate
      };

      nativeMapInstance.flyTo({
        center: [userLocation.longitudeCoordinate, userLocation.latitudeCoordinate],
        zoom: activePerspectiveProfile.zoom,
        pitch: activePerspectiveProfile.pitch,
        bearing: activePerspectiveProfile.bearing_follow ? (userLocation.headingDegrees ?? 0) : 0,
        ...FLY_CONFIG,
        duration: isRecenterPulseTriggered ? 1200 : FLY_CONFIG.duration
      });

      nativeMapInstance.once('moveend', () => {
        if (!isUserInteractingReference.current) {
          nicepodLog(`🏁 [CameraController:${mapInstanceIdentification}] Aterrizaje táctico confirmado.`);
          currentPitchDegreesReference.current = activePerspectiveProfile.pitch;
          currentZoomLevelReference.current = activePerspectiveProfile.zoom;
          currentBearingDegreesReference.current = activePerspectiveProfile.bearing_follow ? (userLocation.headingDegrees ?? 0) : 0;
          
          confirmAterrizajeExitosoAction();
        }
        isCinematicFlightActiveReference.current = false;
      });
    }
  }, [needsBallisticLanding, recenterPulseTrigger, activeMapInstance, userLocation, globalCameraPerspective, forcedPerspective, confirmAterrizajeExitosoAction, isManualMode, setManualMode, mapInstanceIdentification]);

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
      // ANIQUILACIÓN FÍSICA (PILAR 3 & 4)
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
 * NOTA TÉCNICA DEL ARCHITECT (V8.0):
 * 1. Build Shield Compliance: Se han resuelto los 10 errores de tipado mapeando UserLocation 
 *    (latitudeCoordinate, longitudeCoordinate, headingDegrees) al contrato de física cinemática.
 * 2. Zero Abbreviations Policy: Purificación absoluta de nombres de variables y manejadores.
 * 3. Thread Sovereignty: El bucle de interpolación opera mediante requestAnimationFrame, 
 *    pero respeta los umbrales de estasis para minimizar la carga en el Main Thread.
 */