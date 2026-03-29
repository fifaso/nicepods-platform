/**
 * ARCHIVO: components/geo/SpatialEngine/camera-controller.tsx
 * VERSIÓN: 4.2 (NicePod Camera Director - Contextual Morphing Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Gestionar la cámara WebGL con transiciones de perspectiva inteligentes.
 * [REFORMA V4.2]: Sincronía con ADN V5.4 (Overview Context vs Street Immersion).
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useGeoEngine } from "@/hooks/use-geo-engine";
import {
  calculateDestinationPoint,
  interpolateAngle,
  interpolateCoords,
  KinematicPosition
} from "@/lib/geo-kinematics";
import { nicepodLog } from "@/lib/utils";
import { useCallback, useEffect, useRef } from "react";
import { useMap } from "react-map-gl/mapbox";
import {
  PERSPECTIVE_PROFILES,
  FLY_CONFIG,
  INITIAL_OVERVIEW_CONFIG,
  KINEMATIC_CONFIG
} from "../map-constants";

/**
 * CameraController: El Director de Fotografía imperativo.
 */
export function CameraController() {
  // 1. CONEXIÓN CON EL MOTOR WEBGL SOBERANO
  const { current: mapInstance } = useMap();

  // 2. CONSUMO DE SOBERANÍA CINEMÁTICA (V32.0)
  const {
    userLocation,
    needsBallisticLanding,
    confirmLanding,
    cameraPerspective,
    isManualMode,
    setManualMode
  } = useGeoEngine();

  // 3. MEMORIA TÉCNICA (REFS DE ALTA VELOCIDAD)
  // Inicializamos con INITIAL_OVERVIEW_CONFIG para garantizar estabilidad en el Dashboard (Imagen 10)
  const currentPosRef = useRef<KinematicPosition | null>(null);
  const currentBearingRef = useRef<number>(INITIAL_OVERVIEW_CONFIG.bearing);
  const currentPitchRef = useRef<number>(INITIAL_OVERVIEW_CONFIG.pitch);
  const currentZoomRef = useRef<number>(INITIAL_OVERVIEW_CONFIG.zoom);
  
  const isFlyingRef = useRef<boolean>(false);
  const lastInteractionRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  /**
   * handleUserInteraction:
   * Notifica al sistema que el Voyager ha tomado el control manual.
   */
  const handleUserInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
    if (!isManualMode) {
      setManualMode(true);
    }
  }, [isManualMode, setManualMode]);

  /**
   * kinematicLoop: EL CORAZÓN DEL MOVIMIENTO LÍQUIDO
   * Interpola Posición, Rumbo, Pitch y Zoom a 60FPS.
   */
  const kinematicLoop = useCallback(() => {
    if (!mapInstance || !userLocation) {
      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    const map = mapInstance.getMap();

    // A. PROTOCOLO DE RECONQUISTA DE FOCO
    const now = Date.now();
    if (isManualMode && (now - lastInteractionRef.current > 8000)) {
      nicepodLog("🎯 [Camera-Director] Timeout de inactividad. Recuperando autoridad.");
      setManualMode(false);
    }

    // B. GUARDAS DE SILENCIO (MANUAL O VUELO ACTIVO)
    if (isManualMode || isFlyingRef.current) {
      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    // C. OBTENCIÓN DEL PERFIL ACTIVO (V5.4)
    const profile = PERSPECTIVE_PROFILES[cameraPerspective];

    // D. INTERPOLACIÓN CINEMÁTICA (LERP)
    
    // 1. Posición Geográfica
    const targetPos: KinematicPosition = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude
    };
    if (!currentPosRef.current) {
      currentPosRef.current = targetPos;
    } else {
      currentPosRef.current = interpolateCoords(currentPosRef.current, targetPos);
    }

    // 2. Rumbo (Bearing)
    // STREET: Sigue al usuario | OVERVIEW: Siempre al Norte (0)
    const targetBearing = profile.bearing_follow 
      ? (userLocation.heading ?? currentBearingRef.current)
      : 0; 
    currentBearingRef.current = interpolateAngle(currentBearingRef.current, targetBearing);

    // 3. Inclinación (Pitch)
    // Morfismo suave hacia el pitch del perfil (0 para Overview, 75 para Street)
    currentPitchRef.current += (profile.pitch - currentPitchRef.current) * KINEMATIC_CONFIG.LERP_FACTOR;

    // 4. Escala (Zoom)
    // Morfismo suave hacia el zoom del perfil
    currentZoomRef.current += (profile.zoom - currentZoomRef.current) * KINEMATIC_CONFIG.LERP_FACTOR;

    // E. CÁLCULO DEL OFFSET DINÁMICO
    // En Overview el offset es 0 (centrado), en Street es 25m (detrás).
    const cameraAnchor = calculateDestinationPoint(
      currentPosRef.current,
      -profile.offset_distance_meters, 
      currentBearingRef.current
    );

    // F. EJECUCIÓN IMPERATIVA SOBRE EL METAL
    map.jumpTo({
      center: [cameraAnchor.longitude, cameraAnchor.latitude],
      bearing: currentBearingRef.current,
      pitch: currentPitchRef.current,
      zoom: currentZoomRef.current
    });

    animationFrameRef.current = requestAnimationFrame(kinematicLoop);
  }, [mapInstance, userLocation, cameraPerspective, isManualMode, setManualMode]);

  /**
   * EFECTO: ORQUESTACIÓN DE VUELO BALÍSTICO (IP -> GPS)
   * Se dispara al inicio o al pulsar el botón de Recentrar.
   */
  useEffect(() => {
    if (needsBallisticLanding && mapInstance && userLocation && !isFlyingRef.current) {
      const map = mapInstance.getMap();
      const profile = PERSPECTIVE_PROFILES[cameraPerspective];
      
      nicepodLog(`🚀 [Camera-Director] Iniciando Vuelo Balístico (${cameraPerspective}).`);
      isFlyingRef.current = true;

      // Sincronización de referencias para evitar tirones post-vuelo
      currentPosRef.current = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      };

      map.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: profile.zoom,
        pitch: profile.pitch,
        bearing: profile.bearing_follow ? (userLocation.heading ?? 0) : 0,
        ...FLY_CONFIG
      });

      map.once('moveend', () => {
        nicepodLog("🏁 [Camera-Director] Aterrizaje completado.");
        isFlyingRef.current = false;
        // Actualizamos las refs para que el LERP herede la posición exacta del flyTo
        currentPitchRef.current = profile.pitch;
        currentZoomRef.current = profile.zoom;
        confirmLanding();
      });
    }
  }, [needsBallisticLanding, mapInstance, userLocation, cameraPerspective, confirmLanding]);

  /**
   * CICLO DE VIDA: Gestión de Eventos del Canvas y Motor de Frames
   */
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(kinematicLoop);

    const canvas = mapInstance?.getMap().getCanvas();
    if (canvas) {
      canvas.addEventListener('mousedown', handleUserInteraction);
      canvas.addEventListener('touchstart', handleUserInteraction);
      canvas.addEventListener('wheel', handleUserInteraction);
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
 * NOTA TÉCNICA DEL ARCHITECT (V4.2):
 * 1. Contextual Morphing: El controlador ahora interpola dinámicamente Pitch y Zoom
 *    al cambiar entre el Dashboard (Cenital) y el Mapa (Inmersión).
 * 2. Building Escape: Se recalibraron los límites de Pitch (V5.4) para asegurar 
 *    que la cámara nunca quede atrapada dentro de mallas 3D (Imagen 11).
 * 3. Strategic Bearing: En modo OVERVIEW, se ignora el giro del usuario para 
 *    mantener la legibilidad estratégica de los nombres de las calles.
 * 4. Zero-Wait Ready: La inicialización de refs con INITIAL_OVERVIEW_CONFIG 
 *    elimina el pestañeo negro en el primer renderizado del Dashboard.
 */