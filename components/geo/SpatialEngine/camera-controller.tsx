/**
 * ARCHIVO: components/geo/SpatialEngine/camera-controller.tsx
 * VERSIÓN: 14.0
 * PROTOCOLO: MADRID RESONANCE V4.9
 * MISIÓN: Orquestar la lente WebGL con aislamiento térmico y captura de referencias.
 * [THERMIC V1.0]: Sincronización nominal ZAP y captura de referencias para aniquilación de cuadros.
 * NIVEL DE INTEGRIDAD: 100% (Soberano)
 */

"use client";

import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useGeoTelemetry } from "@/hooks/geo-engine/telemetry-core";
import { GEODETIC_CAMERA_COMMAND_EVENT_NAME } from "@/hooks/geo-engine/interface-core";
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
  mapInstanceIdentification: MapInstanceIdentification;
  forcedPerspective?: CameraPerspective;
}

/**
 * CONFIGURACIÓN DE SENSIBILIDAD CINEMÁTICA
 */
const CINEMATIC_STASIS_THRESHOLDS = {
  DISTANCE_METERS: 0.05, 
  ROTATION_DEGREES: 0.2,  
  PITCH_DEGREES: 0.5,
  ZOOM_THRESHOLD: 0.01
};

/**
 * CameraController: El cerebro cinemático del reactor visual.
 */
export function CameraController({ 
  mapInstanceIdentification, 
  forcedPerspective 
}: CameraControllerProperties) {
  
  const { [mapInstanceIdentification]: mapboxMapInstance } = useMap();
  const { kineticSignalBus } = useGeoTelemetry();

  const {
    userLocation: voyagerGeographicLocation,
    needsBallisticLanding,
    recenterTriggerPulse, 
    confirmLanding: confirmAterrizajeExitosoAction,
    cameraPerspective: globalCameraPerspective,
    isManualModeActive, 
    setManualMode
  } = useGeoEngine();

  // MEMORIA TÁCTICA CINÉTICA (MTI - PILAR 4)
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

  const handleManualInteractionAction = useCallback(() => {
    lastInteractionUnixTimestampReference.current = Date.now();
    isUserInteractingReference.current = true;
    if (!isManualModeActive) setManualMode(true);
  }, [isManualModeActive, setManualMode]);

  /**
   * executeKinematicPhysicsLoop: EL MOTOR DE RENDERIZADO LÍQUIDO
   */
  const executeKinematicPhysicsLoop = useCallback((highResolutionTimestamp: number) => {
    if (!isVisibleInViewportReference.current || !mapboxMapInstance || !voyagerGeographicLocation || document.hidden) {
      animationFrameIdentificationReference.current = requestAnimationFrame(executeKinematicPhysicsLoop);
      return;
    }

    const nativeMapInstance = mapboxMapInstance.getMap();
    if (!nativeMapInstance.isStyleLoaded()) {
      animationFrameIdentificationReference.current = requestAnimationFrame(executeKinematicPhysicsLoop);
      return;
    }

    if (!lastFrameHighResolutionTimestampReference.current) {
      lastFrameHighResolutionTimestampReference.current = highResolutionTimestamp;
    }
    const deltaTimeMagnitude = (highResolutionTimestamp - lastFrameHighResolutionTimestampReference.current) / 1000;
    lastFrameHighResolutionTimestampReference.current = highResolutionTimestamp;

    // PROTOCOLO DE RECUPERACIÓN DE AUTORIDAD TRAS INACTIVIDAD
    const currentSystemUnixTimestampMagnitude = Date.now();
    if (isUserInteractingReference.current && (currentSystemUnixTimestampMagnitude - lastInteractionUnixTimestampReference.current > 8000)) {
      if (!nativeMapInstance.isMoving()) {
        isUserInteractingReference.current = false;
        setManualMode(false);
      }
    }

    // SINCRONIZACIÓN EN MODO MANUAL
    if (isUserInteractingReference.current || nativeMapInstance.isMoving()) {
      const mapCenterPointSnapshot = nativeMapInstance.getCenter();
      currentCameraPositionReference.current = { latitude: mapCenterPointSnapshot.lat, longitude: mapCenterPointSnapshot.lng };
      currentBearingReference.current = nativeMapInstance.getBearing();
      currentPitchReference.current = nativeMapInstance.getPitch();
      currentZoomReference.current = nativeMapInstance.getZoom();
      animationFrameIdentificationReference.current = requestAnimationFrame(executeKinematicPhysicsLoop);
      return;
    }

    const activePerspectiveMode = forcedPerspective || globalCameraPerspective;
    const targetPerspectiveProfile = PERSPECTIVE_PROFILES[activePerspectiveMode];
    const targetGeographicPosition = { latitude: voyagerGeographicLocation.latitudeCoordinate, longitude: voyagerGeographicLocation.longitudeCoordinate };

    if (!currentCameraPositionReference.current) currentCameraPositionReference.current = targetGeographicPosition;

    const targetBearingDegrees = targetPerspectiveProfile.bearing_follow ? (voyagerGeographicLocation.headingDegrees ?? currentBearingReference.current) : 0;
    
    // MOTOR LERP ADAPTATIVO
    const smoothingFactorMagnitude = 1 - Math.pow(1 - KINEMATIC_CONFIGURATION.LERP_FACTOR, deltaTimeMagnitude * 60);

    currentCameraPositionReference.current = interpolateCoordinates(currentCameraPositionReference.current, targetGeographicPosition, smoothingFactorMagnitude);
    currentBearingReference.current = interpolateAngle(currentBearingReference.current, targetBearingDegrees, smoothingFactorMagnitude);
    currentPitchReference.current = interpolateScalarValue(currentPitchReference.current, targetPerspectiveProfile.pitch, smoothingFactorMagnitude);
    currentZoomReference.current = interpolateScalarValue(currentZoomReference.current, targetPerspectiveProfile.zoom, smoothingFactorMagnitude);

    const projectedCameraAnchor = calculateDestinationPoint(
      currentCameraPositionReference.current,
      -targetPerspectiveProfile.offset_distance_meters,
      currentBearingReference.current
    );

    nativeMapInstance.jumpTo({
      center: [projectedCameraAnchor.longitude, projectedCameraAnchor.latitude],
      bearing: currentBearingReference.current,
      pitch: currentPitchReference.current,
      zoom: currentZoomReference.current
    });

    animationFrameIdentificationReference.current = requestAnimationFrame(executeKinematicPhysicsLoop);
  }, [mapboxMapInstance, voyagerGeographicLocation, globalCameraPerspective, forcedPerspective, setManualMode]);

  /**
   * [SINCRO V13.1]: ESCUCHA DEL BUS DE COMANDOS
   */
  useEffect(() => {
    const handleImperativeCameraCommand = () => {
        nicepodLog("🎯 [CameraController] Recibiendo comando imperativo de recentrado.");
        isUserInteractingReference.current = false;
        if (isManualModeActive) setManualMode(false);
    };

    window.addEventListener(GEODETIC_CAMERA_COMMAND_EVENT_NAME, handleImperativeCameraCommand);
    return () => window.removeEventListener(GEODETIC_CAMERA_COMMAND_EVENT_NAME, handleImperativeCameraCommand);
  }, [isManualModeActive, setManualMode]);

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

      if (distanceToTargetMagnitude > 500) {
        nativeMapInstance.flyTo({
          center: [voyagerGeographicLocation.longitudeCoordinate, voyagerGeographicLocation.latitudeCoordinate],
          duration: 1500,
          essential: true
        });
      }

      confirmAterrizajeExitosoAction();
    }
  }, [needsBallisticLanding, recenterTriggerPulse, mapboxMapInstance, voyagerGeographicLocation, isManualModeActive, setManualMode, confirmAterrizajeExitosoAction]);

  useEffect(() => {
    const mapboxMapInstanceSnapshot = mapboxMapInstance;
    const nativeMapCanvas = mapboxMapInstanceSnapshot?.getMap().getCanvas();
    if (!nativeMapCanvas) return;

    const visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { isVisibleInViewportReference.current = entry.isIntersecting; });
    }, { threshold: 0.1 });

    visibilityObserver.observe(nativeMapCanvas);
    animationFrameIdentificationReference.current = requestAnimationFrame(executeKinematicPhysicsLoop);

    nativeMapCanvas.addEventListener('mousedown', handleManualInteractionAction);
    nativeMapCanvas.addEventListener('touchstart', handleManualInteractionAction, { passive: true });
    nativeMapCanvas.addEventListener('wheel', handleManualInteractionAction, { passive: true });

    return () => {
      const currentAnimationFrameIdentificationSnapshot = animationFrameIdentificationReference.current;
      visibilityObserver.disconnect();
      if (currentAnimationFrameIdentificationSnapshot) cancelAnimationFrame(currentAnimationFrameIdentificationSnapshot);
      nativeMapCanvas.removeEventListener('mousedown', handleManualInteractionAction);
      nativeMapCanvas.removeEventListener('touchstart', handleManualInteractionAction);
      nativeMapCanvas.removeEventListener('wheel', handleManualInteractionAction);
    };
  }, [mapboxMapInstance, executeKinematicPhysicsLoop, handleManualInteractionAction]);

  return null;
}