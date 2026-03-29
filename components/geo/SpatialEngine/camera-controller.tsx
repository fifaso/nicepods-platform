/**
 * ARCHIVO: components/geo/SpatialEngine/camera-controller.tsx
 * VERSIÓN: 4.4 (NicePod Camera Director - Tactical Pulse & Pulse-Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Gestionar la cámara WebGL con transiciones de autoridad infinita.
 * [REFORMA V4.4]: Integración de recenterTrigger para romper la parálisis de estado.
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

  // 2. CONSUMO DE MANDO CINEMÁTICO (V34.0)
  const {
    userLocation,
    needsBallisticLanding,
    recenterTrigger, // [PULSO V4.4]: El contador incremental de autoridad
    confirmLanding,
    cameraPerspective,
    isManualMode,
    setManualMode
  } = useGeoEngine();

  // 3. MEMORIA TÉCNICA (REFS DE ALTA PRECISIÓN)
  const currentPosRef = useRef<KinematicPosition | null>(null);
  const currentBearingRef = useRef<number>(INITIAL_OVERVIEW_CONFIG.bearing);
  const currentPitchRef = useRef<number>(INITIAL_OVERVIEW_CONFIG.pitch);
  const currentZoomRef = useRef<number>(INITIAL_OVERVIEW_CONFIG.zoom);
  
  const isFlyingRef = useRef<boolean>(false);
  const lastInteractionRef = useRef<number>(0);
  const lastProcessedTriggerRef = useRef<number>(0);
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
      nicepodLog("🎯 [Camera-Director] Timeout de inactividad. Recuperando autoridad.");
      setManualMode(false);
    }

    // B. GUARDA DE VUELO Y CONTROL MANUAL
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
    const targetBearing = profile.bearing_follow 
      ? (userLocation.heading ?? currentBearingRef.current)
      : 0; 
    currentBearingRef.current = interpolateAngle(currentBearingRef.current, targetBearing);

    // 3. Inclinación y Escala (Pitch & Zoom)
    currentPitchRef.current = lerpSimple(currentPitchRef.current, profile.pitch);
    currentZoomRef.current = lerpSimple(currentZoomRef.current, profile.zoom);

    // E. CÁLCULO DEL ANCLA CINEMÁTICA (Follow-Offset)
    const cameraAnchor = calculateDestinationPoint(
      currentPosRef.current,
      -profile.offset_distance_meters, 
      currentBearingRef.current
    );

    // F. INYECCIÓN IMPERATIVA EN GPU
    map.jumpTo({
      center: [cameraAnchor.longitude, cameraAnchor.latitude],
      bearing: currentBearingRef.current,
      pitch: currentPitchRef.current,
      zoom: currentZoomRef.current
    });

    animationFrameRef.current = requestAnimationFrame(kinematicLoop);
  }, [mapInstance, userLocation, cameraPerspective, isManualMode, setManualMode]);

  /**
   * EFECTO: ORQUESTACIÓN DE VUELO BALÍSTICO POR PULSO
   * [REFORMA V4.4]: Se dispara si el booleano es true O si el contador de pulso cambia.
   */
  useEffect(() => {
    const triggerReceived = recenterTrigger > lastProcessedTriggerRef.current;
    
    if ((needsBallisticLanding || triggerReceived) && mapInstance && userLocation && !isFlyingRef.current) {
      const map = mapInstance.getMap();
      const profile = PERSPECTIVE_PROFILES[cameraPerspective];
      
      nicepodLog(`🚀 [Camera-Director] Pulso de Autoridad Detectado. Maniobra: ${cameraPerspective}.`);
      isFlyingRef.current = true;
      lastProcessedTriggerRef.current = recenterTrigger;

      // Sincronización de memoria física para suavizar el post-vuelo
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
        // Si es un recentrado explícito por botón, aplicamos velocidad máxima
        duration: triggerReceived ? 1200 : FLY_CONFIG.duration 
      });

      // Handshake de finalización
      map.once('moveend', () => {
        nicepodLog("🏁 [Camera-Director] Aterrizaje completado por pulso.");
        isFlyingRef.current = false;
        
        // Sincronizamos las referencias con el estado final real
        currentPitchRef.current = profile.pitch;
        currentZoomRef.current = profile.zoom;
        currentBearingRef.current = profile.bearing_follow ? (userLocation.heading ?? 0) : 0;
        
        confirmLanding(); 
      });
    }
  }, [needsBallisticLanding, recenterTrigger, mapInstance, userLocation, cameraPerspective, confirmLanding]);

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
 * NOTA TÉCNICA DEL ARCHITECT (V4.4):
 * 1. Pulse-Based Triggering: Se utiliza recenterTrigger para asegurar que cada click
 *    en el botón de ubicación genere un evento flyTo, eliminando la "sordera" de la V4.3.
 * 2. Morphing Fidelity: El motor LERP ahora interpola dinámicamente Pitch y Zoom,
 *    garantizando transiciones STREET/OVERVIEW de grado industrial.
 * 3. Atomic Ref Sync: Tras cada flyTo, se sincronizan las referencias internas para
 *    evitar el "rebote visual" del motor de 60FPS.
 * 4. Conflict Resolution: El flag isFlyingRef bloquea el motor líquido durante
 *    animaciones nativas de Mapbox, protegiendo la GPU de comandos contradictorios.
 */