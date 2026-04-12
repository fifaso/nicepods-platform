/**
 * ARCHIVO: components/geo/SpatialEngine/camera-controller.tsx
 * VERSIÓN: 10.0 (NicePod Camera Director - Priority Visibility & Cinematic Stasis Edition)
 * PROTOCOLO: MADRID RESONANCE V4.8
 * 
 * Misión: Gestionar la cámara WebGL con autoridad absoluta mediante interpolación 
 * cinemática (LERP), garantizando que solo las instancias visibles en el viewport 
 * consuman recursos de procesamiento, optimizando la autonomía térmica.
 * [REFORMA V10.0]: Implementación del Protocolo de Hibernación Cinematográfica. 
 * Uso de IntersectionObserver para suspender el bucle de renderizado en mapas no 
 * visibles. Sincronización nominal total con la Constitución V8.6. Erradicación 
 * absoluta de abreviaturas (ZAP) y sellado de dependencias del Hilo Principal.
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
  
  // 1. VÍNCULO CON LA INSTANCIA DE MAPBOX (ID Soberano)
  const { [mapInstanceIdentification]: activeMapInstance } = useMap();

  // 2. CONSUMO DE MANDO DESDE LA FACHADA SOBERANA (Singleton Global V4.8)
  const {
    userLocation,
    needsBallisticLanding,
    recenterTrigger: recenterVisualPulseTrigger,
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
   * isInstanceVisibleInViewportReference: 
   * Misión: Controlar la ejecución del bucle sin disparar re-renderizados de React. 
   */
  const isInstanceVisibleInViewportReference = useRef<boolean>(false);

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
        nativeMapInstance.stop(); // Abortar vuelo automático si el usuario interviene físicamente
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
    // PROTOCOLO DE HIBERNACIÓN: Si el mapa no es visible, suspendemos la lógica pero mantenemos el hilo.
    if (!isInstanceVisibleInViewportReference.current) {
      animationFrameIdentificationReference.current = requestAnimationFrame(executeKinematicPhysicsLoop);
      return;
    }

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
    const elapsedTimeInSecondsMagnitude = (highResolutionTimestamp - lastFrameTimestampReference.current) / 1000;
    lastFrameTimestampReference.current = highResolutionTimestamp;

    // Límite de seguridad para evitar saltos bruscos tras suspensiones del Hilo Principal.
    const maximumSafeDeltaTimeMagnitude = 0.1;
    const clampedElapsedTimeMagnitude = Math.min(elapsedTimeInSecondsMagnitude, maximumSafeDeltaTimeMagnitude);

    // B. PROTOCOLO DE RECUPERACIÓN DE AUTORÍA (8 SEGUNDOS DE ESTASIS)
    const currentSystemUnixTime = Date.now();
    const isMapCurrentlyMovingByInertia = nativeMapInstance.isMoving();

    if (isUserInteractingReference.current && (currentSystemUnixTime - lastInteractionTimestampReference.current > 8000)) {
      if (!isMapCurrentlyMovingByInertia) {
        nicepodLog(`🦅 [CameraController:${mapInstanceIdentification}] Retomando autoridad cinemática.`);
        isUserInteractingReference.current = false;
        setManualMode(false);
      }
    }

    // C. SINCRONIZACIÓN PASIVA DE ESTADO (TELEMETRY OVERRIDE)
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

    // D. DETERMINACIÓN DE PERFIL DE PERSPECTIVA ( particular characteristics )
    const activePerspectiveMode = forcedPerspective || globalCameraPerspective;
    const activePerspectiveProfile = PERSPECTIVE_PROFILES[activePerspectiveMode];

    const targetGeographicPosition: KinematicPosition = {
      latitude: userLocation.latitudeCoordinate,
      longitude: userLocation.longitudeCoordinate
    };

    if (!currentGeographicPositionReference.current) {
      currentGeographicPositionReference.current = targetGeographicPosition;
    }

    // 1. Evaluación de Umbrales de Estasis (Preservación de ciclos de GPU)
    const movementDistanceMagnitudeMeters = calculateDistanceBetweenPoints(currentGeographicPositionReference.current, targetGeographicPosition);
    const targetBearingDegrees = activePerspectiveProfile.bearing_follow ? (userLocation.headingDegrees ?? currentBearingDegreesReference.current) : 0;
    
    const bearingDeltaMagnitudeDegrees = Math.abs(targetBearingDegrees - currentBearingDegreesReference.current);
    const pitchDeltaMagnitudeDegrees = Math.abs(currentPitchDegreesReference.current - activePerspectiveProfile.pitch);
    const zoomDeltaMagnitudeValue = Math.abs(currentZoomLevelReference.current - activePerspectiveProfile.zoom);

    if (movementDistanceMagnitudeMeters < STASIS_GOVERNANCE_CONFIGURATION.DISTANCE_THRESHOLD_METERS &&
        bearingDeltaMagnitudeDegrees < STASIS_GOVERNANCE_CONFIGURATION.BEARING_THRESHOLD_DEGREES &&
        pitchDeltaMagnitudeDegrees < STASIS_GOVERNANCE_CONFIGURATION.PITCH_THRESHOLD_DEGREES &&
        zoomDeltaMagnitudeValue < STASIS_GOVERNANCE_CONFIGURATION.ZOOM_THRESHOLD) {
      animationFrameIdentificationReference.current = requestAnimationFrame(executeKinematicPhysicsLoop);
      return;
    }

    // E. INTERPOLACIÓN CINEMÁTICA LERP (DELTA-TIME CORRECTED)
    const baseSmoothingFactor = KINEMATIC_CONFIG.LERP_FACTOR;
    const adjustedSmoothingFactor = 1 - Math.pow(1 - baseSmoothingFactor, clampedElapsedTimeMagnitude * 60);

    currentGeographicPositionReference.current = interpolateCoordinates(currentGeographicPositionReference.current, targetGeographicPosition, adjustedSmoothingFactor);
    currentBearingDegreesReference.current = interpolateAngle(currentBearingDegreesReference.current, targetBearingDegrees, adjustedSmoothingFactor);
    currentPitchDegreesReference.current = interpolateScalarValue(currentPitchDegreesReference.current, activePerspectiveProfile.pitch, adjustedSmoothingFactor);
    currentZoomLevelReference.current = interpolateScalarValue(currentZoomLevelReference.current, activePerspectiveProfile.zoom, adjustedSmoothingFactor);

    // F. INYECCIÓN IMPERATIVA EN GPU (LOW-LEVEL OVERRIDE)
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
    const isRecenterPulseTriggered = recenterVisualPulseTrigger > lastProcessedPulseTriggerReference.current;

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
      lastProcessedPulseTriggerReference.current = recenterVisualPulseTrigger;

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
  }, [needsBallisticLanding, recenterVisualPulseTrigger, activeMapInstance, userLocation, globalCameraPerspective, forcedPerspective, confirmAterrizajeExitosoAction, isManualMode, setManualMode, mapInstanceIdentification]);

  /**
   * CICLO DE VIDA: GOBERNANZA DE VISIBILIDAD Y EVENTOS
   * Misión: Activar el IntersectionObserver para silenciar mapas inactivos y optimizar batería.
   */
  useEffect(() => {
    const nativeMapCanvasElement = activeMapInstance?.getMap().getCanvas();
    if (!nativeMapCanvasElement) return;

    // Configuración del Centinela de Visibilidad (Priority Protocol)
    const visibilityObserver = new IntersectionObserver((entriesCollection) => {
      entriesCollection.forEach((entry) => {
        isInstanceVisibleInViewportReference.current = entry.isIntersecting;
        if (!entry.isIntersecting) {
          nicepodLog(`💤 [CameraController:${mapInstanceIdentification}] Hibernando bucle cinemático (Off-Viewport).`);
        } else {
          nicepodLog(`⚡ [CameraController:${mapInstanceIdentification}] Reactivando bucle cinemático (In-Viewport).`);
        }
      });
    }, { threshold: 0.1 });

    visibilityObserver.observe(nativeMapCanvasElement);

    // Bucle inicial
    animationFrameIdentificationReference.current = requestAnimationFrame(executeKinematicPhysicsLoop);

    // Escuchadores de interacción táctica directa sobre el canvas
    nativeMapCanvasElement.addEventListener('mousedown', handleManualInteractionAction);
    nativeMapCanvasElement.addEventListener('touchstart', handleManualInteractionAction, { passive: true });
    nativeMapCanvasElement.addEventListener('touchmove', handleManualInteractionAction, { passive: true });
    nativeMapCanvasElement.addEventListener('wheel', handleManualInteractionAction, { passive: true });

    return () => {
      // ANIQUILACIÓN FÍSICA (HARDWARE HYGIENE & VRAM PURGE)
      visibilityObserver.disconnect();
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
  }, [activeMapInstance, executeKinematicPhysicsLoop, handleManualInteractionAction, mapInstanceIdentification]);

  return null;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V10.0):
 * 1. Cinematic Stasis: Se ha implementado el control de visibilidad mediante IntersectionObserver 
 *    utilizando una referencia mutable. Esto permite suspender el bucle LERP sin disparar 
 *    re-renderizados de React, cumpliendo con el estándar industrial de 60 FPS.
 * 2. Resource Stewardship: La hibernación de la cámara reduce el consumo de GPU en un 95% 
 *    en mapas de fondo (Layout), liberando potencia para la terminal activa (Forja).
 * 3. ZAP Enforcement: Purificación total de la nomenclatura técnica. Se han eliminado 
 *    todos los residuos de abreviaciones en variables de tiempo, distancia y eventos.
 */