/**
 * ARCHIVO: components/geo/SpatialEngine/camera-controller.tsx
 * VERSIÓN: 4.5 (NicePod Camera Director - Flight-Priority & Loop-Brake Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Gestionar la cámara WebGL priorizando maniobras de autoridad sobre el LERP.
 * [REFORMA V4.5]: Implementación de cancelación agresiva de frames para liberar el flyTo.
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
 * No genera DOM. Manipula el motor WebGL sincronizado con la GPU.
 */
export function CameraController() {
  // 1. CONEXIÓN CON EL MOTOR WEBGL SOBERANO
  const { current: mapInstance } = useMap();

  // 2. CONSUMO DE MANDO CINEMÁTICO (V34.0)
  const {
    userLocation,
    needsBallisticLanding,
    recenterTrigger,
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
   * Mueve la cámara frame a frame. Se bloquea durante vuelos programáticos.
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
      nicepodLog("🎯 [Camera-Director] Tiempo de inactividad superado. Recuperando foco.");
      setManualMode(false);
    }

    // B. GUARDA DE SEGURIDAD
    // Si la cámara está volando o en modo manual, no aplicamos LERP para evitar colisiones.
    if (isManualMode || isFlyingRef.current) {
      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    // C. OBTENCIÓN DEL PERFIL DE PERSPECTIVA ACTIVO
    const profile = PERSPECTIVE_PROFILES[cameraPerspective];

    // D. MOTOR LERP MULTI-VARIABLE
    const targetPos: KinematicPosition = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude
    };

    if (!currentPosRef.current) {
      currentPosRef.current = targetPos;
    } else {
      currentPosRef.current = interpolateCoords(currentPosRef.current, targetPos);
    }

    // Bearing: STREET (Sigue usuario) | OVERVIEW (Norte arriba)
    const targetBearing = profile.bearing_follow 
      ? (userLocation.heading ?? currentBearingRef.current)
      : 0; 
    currentBearingRef.current = interpolateAngle(currentBearingRef.current, targetBearing);

    // Pitch & Zoom: Suavizado por lerpSimple
    currentPitchRef.current = lerpSimple(currentPitchRef.current, profile.pitch);
    currentZoomRef.current = lerpSimple(currentZoomRef.current, profile.zoom);

    // E. CÁLCULO DEL ANCLA CINEMÁTICA (Follow-Offset)
    const cameraAnchor = calculateDestinationPoint(
      currentPosRef.current,
      -profile.offset_distance_meters, 
      currentBearingRef.current
    );

    // F. INYECCIÓN EN GPU
    map.jumpTo({
      center: [cameraAnchor.longitude, cameraAnchor.latitude],
      bearing: currentBearingRef.current,
      pitch: currentPitchRef.current,
      zoom: currentZoomRef.current
    });

    animationFrameRef.current = requestAnimationFrame(kinematicLoop);
  }, [mapInstance, userLocation, cameraPerspective, isManualMode, setManualMode]);

  /**
   * EFECTO: ORQUESTACIÓN DE VUELO BALÍSTICO (THE PULSE BRAKE)
   * [REFORMA V4.5]: Cancela el bucle LERP antes de volar para evitar colisiones de comandos.
   */
  useEffect(() => {
    const triggerReceived = recenterTrigger > lastProcessedTriggerRef.current;
    
    if ((needsBallisticLanding || triggerReceived) && mapInstance && userLocation && !isFlyingRef.current) {
      const map = mapInstance.getMap();
      const profile = PERSPECTIVE_PROFILES[cameraPerspective];
      
      nicepodLog(`🚀 [Camera-Director] Pulso de Autoridad Recibido. Priorizando Vuelo.`);
      
      /**
       * EL FRENO AGRESIVO:
       * Cancelamos el animationFrame actual para que el motor LERP deje de llamar
       * a jumpTo inmediatamente. Esto libera el bus de comandos para el flyTo.
       */
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      isFlyingRef.current = true;
      lastProcessedTriggerRef.current = recenterTrigger;

      // Sync previo de posición para un aterrizaje suave
      currentPosRef.current = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      };

      // Ejecución del vuelo nativo de Mapbox
      map.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: profile.zoom,
        pitch: profile.pitch,
        bearing: profile.bearing_follow ? (userLocation.heading ?? 0) : 0,
        ...FLY_CONFIG,
        duration: triggerReceived ? 1200 : FLY_CONFIG.duration 
      });

      // Handshake de finalización: Re-activamos el motor líquido.
      map.once('moveend', () => {
        nicepodLog("🏁 [Camera-Director] Aterrizaje completado. Re-instanciando LERP.");
        
        // Sincronizamos las refs para evitar saltos al retomar el control
        currentPitchRef.current = profile.pitch;
        currentZoomRef.current = profile.zoom;
        currentBearingRef.current = profile.bearing_follow ? (userLocation.heading ?? 0) : 0;
        
        isFlyingRef.current = false;
        confirmLanding(); 

        // Reiniciamos el bucle de cinemática líquida
        animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      });
    }
  }, [needsBallisticLanding, recenterTrigger, mapInstance, userLocation, cameraPerspective, confirmLanding, kinematicLoop]);

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
 * NOTA TÉCNICA DEL ARCHITECT (V4.5):
 * 1. Flight Priority: Se implementó cancelAnimationFrame antes de flyTo para 
 *    asegurar que el LERP no anule la animación de Mapbox. Esto resuelve 
 *    físicamente el fallo del botón de ubicación.
 * 2. Pulse Recurrence: El uso de recenterTrigger permite que el Voyager 
 *    recentre el mapa infinitas veces con éxito garantizado.
 * 3. Atomic Loop Restante: El bucle LERP solo se reinicia tras el evento 
 *    'moveend', logrando una transición 100% fluida sin "fighting" de cámara.
 * 4. PBR Sync: Se mantienen los perfiles de Pitch/Zoom para la estética profesional.
 */