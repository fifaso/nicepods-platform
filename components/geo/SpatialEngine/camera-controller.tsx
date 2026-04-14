/**
 * ARCHIVO: components/geo/SpatialEngine/camera-controller.tsx
 * VERSIÓN: 12.0 (NicePod Camera Director - Contract Alignment & Cinematic Precision Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Orquestar la lente WebGL mediante Interpolación Lineal (LERP) de alta 
 * frecuencia, garantizando que el Voyager experimente una inmersión fluida a 
 * 60 FPS sin saltos parabólicos ni degradación del rendimiento térmico.
 * [REFORMA V12.0]: Resolución definitiva de errores TS2339 mediante la alineación 
 * nominal con la Constitución V9.0. Sincronización de 'recenterTriggerPulse' e 
 * 'isManualModeActive'. Optimización del motor de estasis predictiva.
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
  INITIAL_OVERVIEW_CONFIGURATION,
  KINEMATIC_CONFIGURATION,
  PERSPECTIVE_PROFILES,
  FLY_CONFIGURATION
} from "../map-constants";

/**
 * INTERFAZ: CameraControllerProperties
 */
interface CameraControllerProperties {
  /** mapInstanceIdentification: Identificador único de la instancia WebGL en la GPU. */
  mapInstanceIdentification: MapInstanceIdentification;
  /** forcedPerspective: Bloqueo opcional de modo de visión para contextos específicos. */
  forcedPerspective?: CameraPerspective;
}

/**
 * CONFIGURACIÓN DE SENSIBILIDAD CINEMÁTICA
 */
const CINEMATIC_STASIS_THRESHOLDS = {
  DISTANCE_METERS: 0.05, 
  ROTATION_DEGREES: 0.2,  
  ALTITUDE_ZOOM: 0.005
};

/**
 * CameraController: El cerebro cinemático del reactor visual de NicePod.
 */
export function CameraController({ 
  mapInstanceIdentification, 
  forcedPerspective 
}: CameraControllerProperties) {
  
  // 1. VÍNCULO CON LA INSTANCIA DE MAPBOX
  const { [mapInstanceIdentification]: mapboxMapInstance } = useMap();

  /**
   * 2. CONSUMO DE MANDO DESDE LA FACHADA SOBERANA (Protocolo V55.0)
   * [SINCRO V12.0]: Alineación nominal absoluta con GeoEngineReturn V9.0.
   */
  const {
    userLocation: voyagerGeographicLocation,
    needsBallisticLanding,
    recenterTriggerPulse, 
    confirmLanding: confirmAterrizajeExitosoAction,
    cameraPerspective: globalCameraPerspective,
    isManualModeActive, 
    setManualMode
  } = useGeoEngine();

  // 3. MEMORIA TÁCTICA CINÉTICA (MTI - PILAR 4)
  const currentCameraPositionReference = useRef<KinematicPosition | null>(null);
  const currentBearingReference = useRef<number>(INITIAL_OVERVIEW_CONFIGURATION.bearing);
  const currentPitchReference = useRef<number>(INITIAL_OVERVIEW_CONFIGURATION.pitch);
  const currentZoomReference = useRef<number>(INITIAL_OVERVIEW_CONFIGURATION.zoom);

  const isUserInteractingReference = useRef<boolean>(false);
  const lastInteractionUnixTimestampReference = useRef<number>(0);
  const lastProcessedPulseReference = useRef<number>(0);
  const lastFrameHighResolutionTimestampReference = useRef<number>(0);
  const animationFrameIdentificationReference = useRef<number | null>(null);
  const isVisibleInViewportReference = useRef<boolean>(false);

  /**
   * handleManualInteractionAction:
   * Misión: Detectar el contacto humano y ceder la autoridad de la GPU.
   */
  const handleManualInteractionAction = useCallback(() => {
    lastInteractionUnixTimestampReference.current = Date.now();
    if (!isUserInteractingReference.current) {
      nicepodLog(`🛡️ [CameraController] Interacción táctica detectada. Cediendo autoridad.`);
      isUserInteractingReference.current = true;
      if (!isManualModeActive) setManualMode(true);
    }
  }, [isManualModeActive, setManualMode]);

  /**
   * executeKinematicPhysicsLoop: EL MOTOR DE RENDERIZADO LÍQUIDO
   */
  const executeKinematicPhysicsLoop = useCallback((highResolutionTimestamp: number) => {
    if (!isVisibleInViewportReference.current || !mapboxMapInstance || !voyagerGeographicLocation) {
      animationFrameIdentificationReference.current = requestAnimationFrame(executeKinematicPhysicsLoop);
      return;
    }

    const nativeMapInstance = mapboxMapInstance.getMap();
    if (!nativeMapInstance.isStyleLoaded()) {
      animationFrameIdentificationReference.current = requestAnimationFrame(executeKinematicPhysicsLoop);
      return;
    }

    // A. CÁLCULO DE DIFERENCIAL DE TIEMPO (DELTA-TIME COMPENSATION)
    if (!lastFrameHighResolutionTimestampReference.current) {
      lastFrameHighResolutionTimestampReference.current = highResolutionTimestamp;
    }
    const deltaTimeMagnitude = (highResolutionTimestamp - lastFrameHighResolutionTimestampReference.current) / 1000;
    lastFrameHighResolutionTimestampReference.current = highResolutionTimestamp;

    // B. PROTOCOLO DE RECUPERACIÓN DE AUTORIDAD
    const currentSystemTime = Date.now();
    if (isUserInteractingReference.current && (currentSystemTime - lastInteractionUnixTimestampReference.current > 8000)) {
      if (!nativeMapInstance.isMoving()) {
        nicepodLog("🦅 [CameraController] Retomando autoridad cinemática por estasis.");
        isUserInteractingReference.current = false;
        setManualMode(false);
      }
    }

    // C. SINCRONIZACIÓN EN MODO MANUAL
    if (isUserInteractingReference.current || nativeMapInstance.isMoving()) {
      const mapCenterPointSnapshot = nativeMapInstance.getCenter();
      currentCameraPositionReference.current = { 
        latitude: mapCenterPointSnapshot.lat, 
        longitude: mapCenterPointSnapshot.lng 
      };
      currentBearingReference.current = nativeMapInstance.getBearing();
      currentPitchReference.current = nativeMapInstance.getPitch();
      currentZoomReference.current = nativeMapInstance.getZoom();
      animationFrameIdentificationReference.current = requestAnimationFrame(executeKinematicPhysicsLoop);
      return;
    }

    // D. DETERMINACIÓN DE PERFIL DE PERSPECTIVA
    const activePerspectiveMode = forcedPerspective || globalCameraPerspective;
    const targetPerspectiveProfile = PERSPECTIVE_PROFILES[activePerspectiveMode];

    const targetGeographicPosition: KinematicPosition = {
      latitude: voyagerGeographicLocation.latitudeCoordinate,
      longitude: voyagerGeographicLocation.longitudeCoordinate
    };

    if (!currentCameraPositionReference.current) {
      currentCameraPositionReference.current = targetGeographicPosition;
    }

    const targetBearingDegrees = targetPerspectiveProfile.bearing_follow ? (voyagerGeographicLocation.headingDegrees ?? currentBearingReference.current) : 0;
    
    // E. EVALUACIÓN DE ESTASIS CINEMÁTICA
    const distanceToVoyagerMagnitude = calculateDistanceBetweenPoints(currentCameraPositionReference.current, targetGeographicPosition);
    if (distanceToVoyagerMagnitude < CINEMATIC_STASIS_THRESHOLDS.DISTANCE_METERS &&
        Math.abs(currentBearingReference.current - targetBearingDegrees) < CINEMATIC_STASIS_THRESHOLDS.ROTATION_DEGREES &&
        Math.abs(currentPitchReference.current - targetPerspectiveProfile.pitch) < CINEMATIC_STASIS_THRESHOLDS.ROTATION_DEGREES) {
        animationFrameIdentificationReference.current = requestAnimationFrame(executeKinematicPhysicsLoop);
        return;
    }

    // F. MOTOR LERP ADAPTATIVO
    const smoothingFactorMagnitude = 1 - Math.pow(1 - KINEMATIC_CONFIGURATION.LERP_FACTOR, deltaTimeMagnitude * 60);

    currentCameraPositionReference.current = interpolateCoordinates(currentCameraPositionReference.current, targetGeographicPosition, smoothingFactorMagnitude);
    currentBearingReference.current = interpolateAngle(currentBearingReference.current, targetBearingDegrees, smoothingFactorMagnitude);
    currentPitchReference.current = interpolateScalarValue(currentPitchReference.current, targetPerspectiveProfile.pitch, smoothingFactorMagnitude);
    currentZoomReference.current = interpolateScalarValue(currentZoomReference.current, targetPerspectiveProfile.zoom, smoothingFactorMagnitude);

    // G. PROYECCIÓN CINEMÁTICA CON OFFSET
    const projectedCameraAnchor = calculateDestinationPoint(
      currentCameraPositionReference.current,
      -targetPerspectiveProfile.offset_distance_meters,
      currentBearingReference.current
    );

    // H. INYECCIÓN IMPERATIVA EN GPU (Bypass React)
    nativeMapInstance.jumpTo({
      center: [projectedCameraAnchor.longitude, projectedCameraAnchor.latitude],
      bearing: currentBearingReference.current,
      pitch: currentPitchReference.current,
      zoom: currentZoomReference.current
    });

    animationFrameIdentificationReference.current = requestAnimationFrame(executeKinematicPhysicsLoop);
  }, [mapboxMapInstance, voyagerGeographicLocation, globalCameraPerspective, forcedPerspective, setManualMode, mapInstanceIdentification]);

  /**
   * EFECTO: ORQUESTACIÓN DE VUELO BALÍSTICO POR PULSO SOBERANO
   * [SINCRO V12.0]: Uso de 'recenterTriggerPulse' para satisfacer el contrato.
   */
  useEffect(() => {
    const isNewRecenterPulseDetected = recenterTriggerPulse > lastProcessedPulseReference.current;

    if ((needsBallisticLanding || isNewRecenterPulseDetected) && mapboxMapInstance && voyagerGeographicLocation) {
      const nativeMapInstance = mapboxMapInstance.getMap();
      if (!nativeMapInstance.isStyleLoaded()) return;

      lastProcessedPulseReference.current = recenterTriggerPulse;
      isUserInteractingReference.current = false;
      if (isManualModeActive) setManualMode(false);

      const currentCameraCenterPoint = nativeMapInstance.getCenter();
      const distanceToTargetMagnitude = calculateDistanceBetweenPoints(
        { latitude: currentCameraCenterPoint.lat, longitude: currentCameraCenterPoint.lng },
        { latitude: voyagerGeographicLocation.latitudeCoordinate, longitude: voyagerGeographicLocation.longitudeCoordinate }
      );

      // Si el desfase es masivo (> 500m), usamos flyTo para eficiencia visual.
      if (distanceToTargetMagnitude > 500) {
        nativeMapInstance.flyTo({
          center: [voyagerGeographicLocation.longitudeCoordinate, voyagerGeographicLocation.latitudeCoordinate],
          duration: 2000,
          essential: true
        });
      }

      confirmAterrizajeExitosoAction();
    }
  }, [needsBallisticLanding, recenterTriggerPulse, mapboxMapInstance, voyagerGeographicLocation, isManualModeActive, setManualMode, confirmAterrizajeExitosoAction]);

  /**
   * CICLO DE VIDA: GOBERNANZA DE VISIBILIDAD Y HARDWARE HYGIENE
   */
  useEffect(() => {
    const nativeMapCanvas = mapboxMapInstance?.getMap().getCanvas();
    if (!nativeMapCanvas) return;

    const visibilityObserver = new IntersectionObserver((entriesCollection) => {
      entriesCollection.forEach((observerEntry) => {
        isVisibleInViewportReference.current = observerEntry.isIntersecting;
      });
    }, { threshold: 0.1 });

    visibilityObserver.observe(nativeMapCanvas);
    animationFrameIdentificationReference.current = requestAnimationFrame(executeKinematicPhysicsLoop);

    nativeMapCanvas.addEventListener('mousedown', handleManualInteractionAction);
    nativeMapCanvas.addEventListener('touchstart', handleManualInteractionAction, { passive: true });
    nativeMapCanvas.addEventListener('wheel', handleManualInteractionAction, { passive: true });

    return () => {
      visibilityObserver.disconnect();
      if (animationFrameIdentificationReference.current) {
        cancelAnimationFrame(animationFrameIdentificationReference.current);
      }
      nativeMapCanvas.removeEventListener('mousedown', handleManualInteractionAction);
      nativeMapCanvas.removeEventListener('touchstart', handleManualInteractionAction);
      nativeMapCanvas.removeEventListener('wheel', handleManualInteractionAction);
    };
  }, [mapboxMapInstance, executeKinematicPhysicsLoop, handleManualInteractionAction]);

  return null;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V12.0):
 * 1. Contract Alignment: Se resolvieron los errores TS2339 al alinear la 
 *    desestructuración de 'useGeoEngine' con la Constitución V9.0.
 * 2. ZAP Compliance: Purificación total de la nomenclatura cinemática: 
 *    'isNewPulseTriggered' -> 'isNewRecenterPulseDetected', 'currentCenter' -> 
 *    'currentCameraCenterPoint'.
 * 3. MTI Architecture: Se mantiene la independencia del Hilo Principal mediante 
 *    el uso de referencias mutables para el estado físico de la lente.
 */