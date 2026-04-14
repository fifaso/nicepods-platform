/**
 * ARCHIVO: components/geo/SpatialEngine/camera-controller.tsx
 * VERSIÓN: 13.0 (NicePod Camera Director - Imperative Signal Listener Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Orquestar la lente WebGL mediante Interpolación Lineal (LERP) de alta 
 * frecuencia, integrando un receptor de comandos imperativos para recentrado 
 * y cambio de perspectiva con latencia cero.
 * [REFORMA V13.0]: Implementación de 'Imperative Command Listener'. El controlador 
 * ahora se suscribe al 'kineticSignalBus' para reaccionar al instante a los pulsos 
 * del actuador táctico, aniquilando la latencia de respuesta visual. 
 * Cumplimiento absoluto de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
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

  // --- MEMORIA TÁCTICA CINÉTICA ---
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
    if (!isVisibleInViewportReference.current || !mapboxMapInstance || !voyagerGeographicLocation) {
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

    // Protocolo de recuperación de autoridad tras 8s de inactividad
    if (isUserInteractingReference.current && (Date.now() - lastInteractionUnixTimestampReference.current > 8000)) {
      if (!nativeMapInstance.isMoving()) {
        isUserInteractingReference.current = false;
        setManualMode(false);
      }
    }

    // Sincronización en modo manual
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
    
    // Motor LERP Adaptativo
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
   * [SINCRO V13.0]: EFECTO DE ESCUCHA IMPERATIVA
   * Misión: Escuchar al bus de comandos de la interfaz para romper la estasis del motor LERP.
   */
  useEffect(() => {
    const handleImperativeCameraCommand = (event: Event) => {
        nicepodLog("🎯 [CameraController] Recibiendo comando imperativo de recentrado.");
        isUserInteractingReference.current = false;
        if (isManualModeActive) setManualMode(false);
    };

    kineticSignalBus.addEventListener(GEODETIC_CAMERA_COMMAND_EVENT_NAME, handleImperativeCameraCommand);
    return () => kineticSignalBus.removeEventListener(GEODETIC_KINETIC_SIGNAL_EVENT_NAME, handleImperativeCameraCommand);
  }, [kineticSignalBus, isManualModeActive, setManualMode]);

  useEffect(() => {
    const isNewRecenterPulseDetected = recenterTriggerPulse > lastProcessedPulseReference.current;

    if ((needsBallisticLanding || isNewRecenterPulseDetected) && mapboxMapInstance && voyagerGeographicLocation) {
      const nativeMapInstance = mapboxMapInstance.getMap();
      if (!nativeMapInstance.isStyleLoaded()) return;

      lastProcessedPulseReference.current = recenterTriggerPulse;
      nativeMapInstance.stop();

      const distanceToTargetMagnitude = calculateDistanceBetweenPoints(
        { latitude: nativeMapInstance.getCenter().lat, longitude: nativeMapInstance.getCenter().lng },
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
  }, [needsBallisticLanding, recenterTriggerPulse, mapboxMapInstance, voyagerGeographicLocation, confirmAterrizajeExitosoAction]);

  useEffect(() => {
    const nativeMapCanvas = mapboxMapInstance?.getMap().getCanvas();
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
      visibilityObserver.disconnect();
      if (animationFrameIdentificationReference.current) cancelAnimationFrame(animationFrameIdentificationReference.current);
      nativeMapCanvas.removeEventListener('mousedown', handleManualInteractionAction);
      nativeMapCanvas.removeEventListener('touchstart', handleManualInteractionAction);
      nativeMapCanvas.removeEventListener('wheel', handleManualInteractionAction);
    };
  }, [mapboxMapInstance, executeKinematicPhysicsLoop, handleManualInteractionAction]);

  return null;
}