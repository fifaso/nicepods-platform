/**
 * ARCHIVO: components/geo/SpatialEngine/camera-controller.tsx
 * VERSIÓN: 4.3 (NicePod Camera Director - Recursive Ballistics Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Gestionar la cámara WebGL con transiciones de autoridad y perspectiva dual.
 * [REFORMA V4.3]: Implementación de Vuelos Recurrentes y Bloqueo de Interferencia LERP.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useGeoEngine } from "@/hooks/use-geo-engine";
import {
  calculateDestinationPoint,
  interpolateAngle,
  interpolateCoords,
  lerpSimple,
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
 * CameraController: El brazo ejecutor de la soberanía visual.
 * Manipula directamente la instancia de Mapbox a 60FPS fuera del ciclo de React.
 */
export function CameraController() {
  // 1. CONEXIÓN CON EL MOTOR WEBGL SOBERANO
  const { current: mapInstance } = useMap();

  // 2. CONSUMO DE MANDO CINEMÁTICO (V33.0)
  const {
    userLocation,
    needsBallisticLanding,
    confirmLanding,
    cameraPerspective,
    isManualMode,
    setManualMode
  } = useGeoEngine();

  // 3. MEMORIA TÉCNICA (REFS DE ALTA PRECISIÓN)
  // Inicializamos con la verdad cenital para asegurar estabilidad en Dashboard.
  const currentPosRef = useRef<KinematicPosition | null>(null);
  const currentBearingRef = useRef<number>(INITIAL_OVERVIEW_CONFIG.bearing);
  const currentPitchRef = useRef<number>(INITIAL_OVERVIEW_CONFIG.pitch);
  const currentZoomRef = useRef<number>(INITIAL_OVERVIEW_CONFIG.zoom);
  
  const isFlyingRef = useRef<boolean>(false);
  const lastInteractionRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  /**
   * handleUserInteraction:
   * Sincroniza la acción táctica del Voyager con el GeoEngine.
   */
  const handleUserInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
    if (!isManualMode) {
      setManualMode(true);
    }
  }, [isManualMode, setManualMode]);

  /**
   * kinematicLoop: EL CORAZÓN DE LA NAVEGACIÓN LÍQUIDA
   * Ejecuta el desplazamiento y morfismo de perspectiva frame a frame.
   */
  const kinematicLoop = useCallback(() => {
    if (!mapInstance || !userLocation) {
      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    const map = mapInstance.getMap();

    // A. PROTOCOLO DE RECUPERACIÓN DE AUTORIDAD (8 segundos)
    const now = Date.now();
    if (isManualMode && (now - lastInteractionRef.current > 8000)) {
      nicepodLog("🎯 [Camera-Director] Inactividad detectada. Recuperando autoridad.");
      setManualMode(false);
    }

    // B. GUARDA DE VUELO Y CONTROL MANUAL
    // Si estamos en medio de un flyTo balístico o el usuario mueve el mapa, silenciamos el LERP.
    if (isManualMode || isFlyingRef.current) {
      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    // C. PERFIL DE PERSPECTIVA ACTIVO (V5.4)
    const profile = PERSPECTIVE_PROFILES[cameraPerspective];

    // D. MOTOR LERP MULTI-VARIABLE (60FPS)
    
    // 1. Posicionamiento (Coordenadas)
    const targetPos: KinematicPosition = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude
    };
    if (!currentPosRef.current) {
      currentPosRef.current = targetPos;
    } else {
      currentPosRef.current = interpolateCoords(currentPosRef.current, targetPos);
    }

    // 2. Orientación (Bearing)
    // STREET: Brújula activa | OVERVIEW: Norte Fijo (0)
    const targetBearing = profile.bearing_follow 
      ? (userLocation.heading ?? currentBearingRef.current)
      : 0; 
    currentBearingRef.current = interpolateAngle(currentBearingRef.current, targetBearing);

    // 3. Inclinación y Escala (Pitch & Zoom)
    // Aplicamos lerpSimple para un morfismo suave de la lente.
    currentPitchRef.current = lerpSimple(currentPitchRef.current, profile.pitch);
    currentZoomRef.current = lerpSimple(currentZoomRef.current, profile.zoom);

    // E. CÁLCULO DEL ANCLA CINEMÁTICA (Follow-Offset)
    const cameraAnchor = calculateDestinationPoint(
      currentPosRef.current,
      -profile.offset_distance_meters, 
      currentBearingRef.current
    );

    // F. INYECCIÓN IMPERATIVA EN GPU
    // Usamos jumpTo para máxima fidelidad con el cálculo del LERP local.
    map.jumpTo({
      center: [cameraAnchor.longitude, cameraAnchor.latitude],
      bearing: currentBearingRef.current,
      pitch: currentPitchRef.current,
      zoom: currentZoomRef.current
    });

    animationFrameRef.current = requestAnimationFrame(kinematicLoop);
  }, [mapInstance, userLocation, cameraPerspective, isManualMode, setManualMode]);

  /**
   * EFECTO: ORQUESTACIÓN DE VUELO BALÍSTICO RECURRENTE
   * [MEJORA V4.3]: Se dispara cada vez que needsBallisticLanding es true.
   * Resuelve el recentrado profesional y el salto inicial.
   */
  useEffect(() => {
    if (needsBallisticLanding && mapInstance && userLocation && !isFlyingRef.current) {
      const map = mapInstance.getMap();
      const profile = PERSPECTIVE_PROFILES[cameraPerspective];
      
      nicepodLog(`🚀 [Camera-Director] Ejecutando Vuelo Balístico (${cameraPerspective}).`);
      isFlyingRef.current = true;

      // Sincronizamos la memoria física antes de soltar el mando al motor nativo.
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
        // Si es un recentrado manual, aumentamos la velocidad para mayor respuesta.
        duration: isManualMode ? 1200 : FLY_CONFIG.duration 
      });

      // Handshake de finalización de maniobra
      map.once('moveend', () => {
        nicepodLog("🏁 [Camera-Director] Maniobra completada. Retomando motor LERP.");
        isFlyingRef.current = false;
        
        // Sincronizamos las referencias con el estado final de la cámara
        currentPitchRef.current = profile.pitch;
        currentZoomRef.current = profile.zoom;
        currentBearingRef.current = profile.bearing_follow ? (userLocation.heading ?? 0) : 0;
        
        confirmLanding(); // Cerramos el pulso en el GeoEngine
      });
    }
  }, [needsBallisticLanding, mapInstance, userLocation, cameraPerspective, confirmLanding, isManualMode]);

  /**
   * CICLO DE VIDA: Gestión de Eventos y GPU
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
 * NOTA TÉCNICA DEL ARCHITECT (V4.3):
 * 1. Recursive Authority: Se ha habilitado flyTo reactivo al estado global, permitiendo
 *    que el botón de Recentrar funcione con precisión infinita en cada pulsación.
 * 2. Morphing Fidelity: El uso de lerpSimple para Zoom y Pitch asegura que la 
 *    transmisión entre OVERVIEW y STREET sea cinematográfica.
 * 3. Multi-Input Shield: Se bloquea el motor LERP durante animaciones flyTo para 
 *    evitar jittering visual y colisiones de comandos de cámara en la GPU.
 * 4. Precise Street-Lock: Se integra la lógica de bearing selectiva para maximizar
 *    la legibilidad en modo táctico y la inmersión en modo calle.
 */