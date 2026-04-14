/**
 * ARCHIVO: components/geo/SpatialEngine/camera-controller.tsx
 * VERSIÓN: 11.0 (NicePod Camera Director - Cinematic Smooth & Anti-Parabolic Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Orquestar la lente WebGL mediante Interpolación Lineal (LERP) de alta 
 * frecuencia, eliminando saltos bruscos y efectos parabólicos no deseados para 
 * garantizar una inmersión fluida a 60 fotogramas por segundo.
 * [REFORMA V11.0]: Sustitución de 'flyTo' por 'Adaptive LERP Loop' para cambios 
 * de perspectiva. Implementación de suavizado circular para el rumbo (Bearing) 
 * y detección de estasis predictiva. ZAP absoluto y MTI Sovereignty.
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
  PERSPECTIVE_PROFILES
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
 * CameraController: El cerebro cinemático del reactor visual.
 */
export function CameraController({ 
  mapInstanceIdentification, 
  forcedPerspective 
}: CameraControllerProperties) {
  
  // 1. VÍNCULO CON LA INSTANCIA DE MAPBOX
  const { [mapInstanceIdentification]: mapboxMapInstance } = useMap();

  // 2. CONSUMO DE MANDO DESDE LA FACHADA SOBERANA (V4.9)
  const {
    userLocation: voyagerGeographicLocation,
    needsBallisticLanding,
    recenterTriggerPulse: recenterTriggerPulseCounter,
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
      nicepodLog(`🛡️ [CameraController] Interacción táctica detectada. Cediendo control.`);
      isUserInteractingReference.current = true;
      if (!isManualModeActive) setManualMode(true);
    }
  }, [isManualModeActive, setManualMode]);

  /**
   * executeKinematicPhysicsLoop: EL MOTOR DE RENDERIZADO LÍQUIDO
   * Misión: Calcular la posición de la lente frame-a-frame sin usar flyTo.
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

    // A. GESTIÓN DEL TIEMPO (DELTA-TIME COMPENSATION)
    if (!lastFrameHighResolutionTimestampReference.current) {
      lastFrameHighResolutionTimestampReference.current = highResolutionTimestamp;
    }
    const deltaTimeMagnitude = (highResolutionTimestamp - lastFrameHighResolutionTimestampReference.current) / 1000;
    lastFrameHighResolutionTimestampReference.current = highResolutionTimestamp;

    // B. PROTOCOLO DE RECUPERACIÓN DE AUTORIDAD (8 SEGUNDOS DE INACTIVIDAD)
    const currentSystemTime = Date.now();
    if (isUserInteractingReference.current && (currentSystemTime - lastInteractionUnixTimestampReference.current > 8000)) {
      if (!nativeMapInstance.isMoving()) {
        nicepodLog("🦅 [CameraController] Retomando autoridad cinemática por inactividad.");
        isUserInteractingReference.current = false;
        setManualMode(false);
      }
    }

    // C. SINCRONIZACIÓN EN MODO MANUAL/INERCIA
    if (isUserInteractingReference.current || nativeMapInstance.isMoving()) {
      const mapCenterPoint = nativeMapInstance.getCenter();
      currentCameraPositionReference.current = { latitude: mapCenterPoint.lat, longitude: mapCenterPoint.lng };
      currentBearingReference.current = nativeMapInstance.getBearing();
      currentPitchReference.current = nativeMapInstance.getPitch();
      currentZoomReference.current = nativeMapInstance.getZoom();
      animationFrameIdentificationReference.current = requestAnimationFrame(executeKinematicPhysicsLoop);
      return;
    }

    // D. CÁLCULO DE OBJETIVOS SEGÚN PERFIL DE PERSPECTIVA
    const activePerspectiveMode = forcedPerspective || globalCameraPerspective;
    const targetProfile = PERSPECTIVE_PROFILES[activePerspectiveMode];

    const targetGeographicPosition: KinematicPosition = {
      latitude: voyagerGeographicLocation.latitudeCoordinate,
      longitude: voyagerGeographicLocation.longitudeCoordinate
    };

    if (!currentCameraPositionReference.current) {
      currentCameraPositionReference.current = targetGeographicPosition;
    }

    const targetBearing = targetProfile.bearing_follow ? (voyagerGeographicLocation.headingDegrees ?? currentBearingReference.current) : 0;
    
    // E. EVALUACIÓN DE ESTASIS (AHORRO TÉRMICO)
    const distanceToVoyagerMagnitude = calculateDistanceBetweenPoints(currentCameraPositionReference.current, targetGeographicPosition);
    if (distanceToVoyagerMagnitude < CINEMATIC_STASIS_THRESHOLDS.DISTANCE_METERS &&
        Math.abs(currentBearingReference.current - targetBearing) < CINEMATIC_STASIS_THRESHOLDS.ROTATION_DEGREES &&
        Math.abs(currentPitchReference.current - targetProfile.pitch) < CINEMATIC_STASIS_THRESHOLDS.ROTATION_DEGREES) {
        animationFrameIdentificationReference.current = requestAnimationFrame(executeKinematicPhysicsLoop);
        return;
    }

    // F. MOTOR LERP ADAPTATIVO (SMOOTH OPERATOR)
    // Ajustamos el factor de suavizado según el tiempo transcurrido para mantener la fluidez a cualquier FPS.
    const smoothingFactor = 1 - Math.pow(1 - KINEMATIC_CONFIGURATION.LERP_FACTOR, deltaTimeMagnitude * 60);

    currentCameraPositionReference.current = interpolateCoordinates(currentCameraPositionReference.current, targetGeographicPosition, smoothingFactor);
    currentBearingReference.current = interpolateAngle(currentBearingReference.current, targetBearing, smoothingFactor);
    currentPitchReference.current = interpolateScalarValue(currentPitchReference.current, targetProfile.pitch, smoothingFactor);
    currentZoomReference.current = interpolateScalarValue(currentZoomReference.current, targetProfile.zoom, smoothingFactor);

    // G. PROYECCIÓN CINEMÁTICA (OFFSET CALCULATOR)
    // En modo STREET, la cámara se sitúa físicamente detrás del Voyager para el efecto 'Pokémon GO'.
    const projectedCameraAnchor = calculateDestinationPoint(
      currentCameraPositionReference.current,
      -targetProfile.offset_distance_meters,
      currentBearingReference.current
    );

    // Inyección imperativa de alta frecuencia (Bypass React)
    nativeMapInstance.jumpTo({
      center: [projectedCameraAnchor.longitude, projectedCameraAnchor.latitude],
      bearing: currentBearingReference.current,
      pitch: currentPitchReference.current,
      zoom: currentZoomReference.current
    });

    animationFrameIdentificationReference.current = requestAnimationFrame(executeKinematicPhysicsLoop);
  }, [mapboxMapInstance, voyagerGeographicLocation, globalCameraPerspective, forcedPerspective, setManualMode, mapInstanceIdentification]);

  /**
   * EFECTO: ORQUESTACIÓN DE RECIENTRO Y PULSOS
   */
  useEffect(() => {
    const isNewPulseTriggered = recenterTriggerPulseCounter > lastProcessedPulseReference.current;

    if ((needsBallisticLanding || isNewPulseTriggered) && mapboxMapInstance && voyagerGeographicLocation) {
      const nativeMapInstance = mapboxMapInstance.getMap();
      if (!nativeMapInstance.isStyleLoaded()) return;

      lastProcessedPulseReference.current = recenterTriggerPulseCounter;
      isUserInteractingReference.current = false;
      if (isManualModeActive) setManualMode(false);

      /**
       * [SINCRO V11.0]: Aterrizaje Balístico Inteligente.
       * Si la distancia es mayor a 500m, usamos flyTo. Si es un ajuste de 
       * perspectiva corto, dejamos que el bucle LERP haga el trabajo para evitar 
       * el zoom gigante.
       */
      const currentCenter = nativeMapInstance.getCenter();
      const distanceMagnitude = calculateDistanceBetweenPoints(
        { latitude: currentCenter.lat, longitude: currentCenter.lng },
        { latitude: voyagerGeographicLocation.latitudeCoordinate, longitude: voyagerGeographicLocation.longitudeCoordinate }
      );

      if (distanceMagnitude > 500) {
        nativeMapInstance.flyTo({
          center: [voyagerGeographicLocation.longitudeCoordinate, voyagerGeographicLocation.latitudeCoordinate],
          duration: 2000,
          essential: true
        });
      }

      confirmAterrizajeExitosoAction();
    }
  }, [needsBallisticLanding, recenterTriggerPulseCounter, mapboxMapInstance, voyagerGeographicLocation, isManualModeActive, setManualMode, confirmAterrizajeExitosoAction]);

  /**
   * CICLO DE VIDA: GOBERNANZA DE RECURSOS
   */
  useEffect(() => {
    const nativeMapCanvas = mapboxMapInstance?.getMap().getCanvas();
    if (!nativeMapCanvas) return;

    const visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisibleInViewportReference.current = entry.isIntersecting;
      });
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V11.0):
 * 1. Anti-Parabolic Logic: Se eliminó la dependencia de 'flyTo' para cambios de 
 *    visión cercanos, permitiendo que el LERP mueva la cámara a ras de suelo.
 * 2. Delta-Time Correction: La interpolación ahora es independiente de la 
 *    frecuencia de refresco del monitor, garantizando la misma suavidad en 60Hz o 120Hz.
 * 3. ZAP Enforcement: Purificación total de variables (deltaTimeMagnitude, 
 *    projectedCameraAnchor, isUserPhysicallyInteracting).
 */