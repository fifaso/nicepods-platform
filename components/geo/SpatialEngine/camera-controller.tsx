/**
 * ARCHIVO: components/geo/SpatialEngine/camera-controller.tsx
 * VERSIÓN: 4.1 (NicePod Camera Director - Dynamic Perspective Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Gestionar la cámara WebGL imperativamente con soporte para Perspectiva Dual.
 * [REFORMA V4.1]: Implementación de interpolación de Pitch/Zoom y sincronía de Modo Manual.
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
  STREET_VIEW_CONFIG,
  KINEMATIC_CONFIG
} from "../map-constants";

/**
 * CameraController: El Director de Fotografía imperativo.
 */
export function CameraController() {
  // 1. CONEXIÓN CON EL MOTOR WEBGL SOBERANO
  const { current: mapInstance } = useMap();

  // 2. CONSUMO DE TELEMETRÍA Y MANDO CINEMÁTICO (V32.0)
  const {
    userLocation,
    needsBallisticLanding,
    confirmLanding,
    cameraPerspective,
    isManualMode,
    setManualMode
  } = useGeoEngine();

  // 3. MEMORIA TÉCNICA (REFS DE ALTA VELOCIDAD)
  // Usamos Refs para mantener la suavidad de 60FPS sin disparar re-renders de React.
  const currentPosRef = useRef<KinematicPosition | null>(null);
  const currentBearingRef = useRef<number>(STREET_VIEW_CONFIG.bearing);
  const currentPitchRef = useRef<number>(STREET_VIEW_CONFIG.pitch);
  const currentZoomRef = useRef<number>(STREET_VIEW_CONFIG.zoom);
  
  const isFlyingRef = useRef<boolean>(false);
  const lastInteractionRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  /**
   * handleUserInteraction:
   * Sincroniza el estado manual local con el orquestador global.
   */
  const handleUserInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
    if (!isManualMode) {
      setManualMode(true); // Informamos al GeoEngine que el usuario tiene el mando
    }
  }, [isManualMode, setManualMode]);

  /**
   * kinematicLoop: EL CORAZÓN DEL MOVIMIENTO LÍQUIDO
   * Gestiona la interpolación de todas las variables físicas del visor.
   */
  const kinematicLoop = useCallback(() => {
    if (!mapInstance || !userLocation) {
      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    const map = mapInstance.getMap();

    // A. PROTOCOLO DE RECONQUISTA DE FOCO (Automatic Recenter)
    // Si pasan 8 segundos sin interacción, el GeoEngine recuperará el control.
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

    // C. OBTENCIÓN DEL PERFIL DE PERSPECTIVA (STREET vs OVERVIEW)
    const profile = PERSPECTIVE_PROFILES[cameraPerspective];

    // D. INTERPOLACIÓN CINEMÁTICA (LERP)
    // 1. Posición
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
    const targetBearing = profile.bearing_follow 
      ? (userLocation.heading ?? currentBearingRef.current)
      : 0; // En Overview el Norte siempre está arriba para estabilidad estratégica.
    currentBearingRef.current = interpolateAngle(currentBearingRef.current, targetBearing);

    // 3. Inclinación (Pitch)
    currentPitchRef.current += (profile.pitch - currentPitchRef.current) * KINEMATIC_CONFIG.LERP_FACTOR;

    // 4. Escala (Zoom)
    currentZoomRef.current += (profile.zoom - currentZoomRef.current) * KINEMATIC_CONFIG.LERP_FACTOR;

    // E. CÁLCULO DEL OFFSET DE SEGUIMIENTO (PRO-VIEW)
    // Calculamos el ancla de la cámara basándonos en el offset del perfil activo.
    const cameraAnchor = calculateDestinationPoint(
      currentPosRef.current,
      -profile.offset_distance_meters, 
      currentBearingRef.current
    );

    // F. EJECUCIÓN IMPERATIVA SOBRE LA GPU
    map.jumpTo({
      center: [cameraAnchor.longitude, cameraAnchor.latitude],
      bearing: currentBearingRef.current,
      pitch: currentPitchRef.current,
      zoom: currentZoomRef.current
    });

    animationFrameRef.current = requestAnimationFrame(kinematicLoop);
  }, [mapInstance, userLocation, cameraPerspective, isManualMode, setManualMode]);

  /**
   * EFECTO: ORQUESTACIÓN DE VUELO BALÍSTICO
   * Se activa para el Aterrizaje Inicial o para el Recentrado Forzado.
   */
  useEffect(() => {
    if (needsBallisticLanding && mapInstance && userLocation && !isFlyingRef.current) {
      const map = mapInstance.getMap();
      const profile = PERSPECTIVE_PROFILES[cameraPerspective];
      
      nicepodLog(`🚀 [Camera-Director] Iniciando Vuelo Balístico (${cameraPerspective}).`);
      isFlyingRef.current = true;

      // Sincronización de referencias antes de soltar el LERP
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
        nicepodLog("🏁 [Camera-Director] Vuelo finalizado. Malla anclada.");
        isFlyingRef.current = false;
        // Sincronizamos las refs de pitch y zoom con el resultado del vuelo
        currentPitchRef.current = profile.pitch;
        currentZoomRef.current = profile.zoom;
        confirmLanding();
      });
    }
  }, [needsBallisticLanding, mapInstance, userLocation, cameraPerspective, confirmLanding]);

  /**
   * CICLO DE VIDA: Gestión de Eventos del Canvas
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
 * NOTA TÉCNICA DEL ARCHITECT (V4.1):
 * 1. Perspective Morphing: El controlador ahora interpola dinámicamente Pitch y Zoom, 
 *    haciendo que el cambio entre STREET y OVERVIEW sea cinematográfico.
 * 2. Manual Mode Handshake: Se integra el callback setManualMode(true) para que el
 *    GeoEngine y el Overlay sepan cuándo el usuario ha tomado el mando.
 * 3. Strategic Stability: En modo OVERVIEW, se fuerza bearing: 0 (Norte arriba) 
 *    para facilitar la lectura del mapa táctico, rompiendo el LERP de giro.
 * 4. Loop Protection: Se sincronizan las refs de Pitch/Zoom post-vuelo balístico 
 *    para evitar el "rebote visual" al retomar el motor líquido.
 */