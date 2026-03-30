/**
 * ARCHIVO: components/geo/SpatialEngine/camera-controller.tsx
 * VERSIÓN: 4.7 (NicePod Camera Director - Instance Isolation & Pulse Authority Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Gestionar la cámara WebGL con autoridad absoluta sobre una instancia específica.
 * [REFORMA V4.7]: Implementación de vinculación por mapId para erradicar el Ghosting rotacional.
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
import { MapInstanceId } from "@/types/geo-sovereignty";
import {
  PERSPECTIVE_PROFILES,
  FLY_CONFIG,
  INITIAL_OVERVIEW_CONFIG,
  KINEMATIC_CONFIG
} from "../map-constants";

interface CameraControllerProps {
  /** mapId: Identificador único del lienzo a gobernar (map-full o map-dashboard). */
  mapId: MapInstanceId;
}

/**
 * CameraController: El brazo ejecutor de la soberanía visual NicePod.
 * Manipula imperativamente la instancia de Mapbox fuera del ciclo de reconciliación de React.
 */
export function CameraController({ mapId }: CameraControllerProps) {
  // 1. CONEXIÓN VINCULADA CON EL MOTOR WEBGL
  // [FIX V4.7]: Accedemos exclusivamente a la instancia declarada por el padre.
  // Esto evita que el controlador del Dashboard interfiera con el Mapa Full.
  const { [mapId]: mapInstance } = useMap();

  // 2. CONSUMO DE MANDO CINEMÁTICO SOBERANO (V35.0)
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
   * Sincroniza la acción táctica del Voyager con el GeoEngine global.
   */
  const handleUserInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
    if (!isManualMode) {
      setManualMode(true);
    }
  }, [isManualMode, setManualMode]);

  /**
   * kinematicLoop: EL CORAZÓN DE LA NAVEGACIÓN LÍQUIDA (60FPS)
   * Gestiona el desplazamiento y morfismo de perspectiva sincronizado con la GPU.
   */
  const kinematicLoop = useCallback(() => {
    // Si la instancia específica no está montada, cedemos el frame.
    if (!mapInstance || !userLocation) {
      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    const map = mapInstance.getMap();

    // A. PROTOCOLO DE RECUPERACIÓN DE AUTORIDAD (8 segundos)
    const now = Date.now();
    if (isManualMode && (now - lastInteractionRef.current > 8000)) {
      nicepodLog(`🎯 [Camera:${mapId}] Recuperando autoridad por inactividad.`);
      setManualMode(false);
    }

    // B. GUARDA DE VUELO Y CONTROL MANUAL
    // Si la cámara está en medio de un flyTo balístico o bajo mando humano, silenciamos el LERP.
    if (isManualMode || isFlyingRef.current) {
      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    // C. PERFIL DE PERSPECTIVA ACTIVO (STREET vs OVERVIEW)
    const profile = PERSPECTIVE_PROFILES[cameraPerspective];

    // D. MOTOR LERP MULTI-VARIABLE
    
    // 1. Posicionamiento Espacial
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
    // STREET: Brújula activa | OVERVIEW: Norte Fijo (Estabilidad estratégica).
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
    map.jumpTo({
      center: [cameraAnchor.longitude, cameraAnchor.latitude],
      bearing: currentBearingRef.current,
      pitch: currentPitchRef.current,
      zoom: currentZoomRef.current
    });

    animationFrameRef.current = requestAnimationFrame(kinematicLoop);
  }, [mapInstance, userLocation, cameraPerspective, isManualMode, setManualMode, mapId]);

  /**
   * EFECTO: ORQUESTACIÓN DE VUELO BALÍSTICO POR PULSO DE ID
   * [REFORMA V4.7]: Intercepta el recenterTrigger para ejecutar maniobras de autoridad.
   */
  useEffect(() => {
    const triggerReceived = recenterTrigger > lastProcessedTriggerRef.current;
    
    if ((needsBallisticLanding || triggerReceived) && mapInstance && userLocation && !isFlyingRef.current) {
      const map = mapInstance.getMap();
      const profile = PERSPECTIVE_PROFILES[cameraPerspective];
      
      nicepodLog(`🚀 [Camera:${mapId}] Pulso de Autoridad recibido. Iniciando Vuelo.`);
      
      // FRENO AGRESIVO: Cancelamos el bucle LERP para liberar el bus de comandos.
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      isFlyingRef.current = true;
      lastProcessedTriggerRef.current = recenterTrigger;

      // Sincronización de memoria física previa al salto.
      currentPosRef.current = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      };

      // Ejecución de la maniobra nativa flyTo.
      map.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: profile.zoom,
        pitch: profile.pitch,
        bearing: profile.bearing_follow ? (userLocation.heading ?? 0) : 0,
        ...FLY_CONFIG,
        // Si es un recentrado táctico, aplicamos velocidad máxima.
        duration: triggerReceived ? 1200 : FLY_CONFIG.duration 
      });

      // Handshake de finalización: Re-activación del motor líquido.
      map.once('moveend', () => {
        nicepodLog(`🏁 [Camera:${mapId}] Aterrizaje completado.`);
        
        // Sincronizamos las referencias con el estado final real de la GPU.
        currentPitchRef.current = profile.pitch;
        currentZoomRef.current = profile.zoom;
        currentBearingRef.current = profile.bearing_follow ? (userLocation.heading ?? 0) : 0;
        
        isFlyingRef.current = false;
        confirmLanding(); 

        // Reiniciamos el bucle de cinemática líquida de 60FPS.
        animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      });
    }
  }, [needsBallisticLanding, recenterTrigger, mapInstance, userLocation, cameraPerspective, confirmLanding, kinematicLoop, mapId]);

  /**
   * CICLO DE VIDA: Gestión de Eventos y GPU Offloading.
   */
  useEffect(() => {
    // Inicializamos el motor de frames
    animationFrameRef.current = requestAnimationFrame(kinematicLoop);

    // Registramos los sensores de interacción en el canvas de Mapbox
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
 * NOTA TÉCNICA DEL ARCHITECT (V4.7):
 * 1. Instance ID-Mapping: El controlador ahora acepta un mapId, permitiendo que useMap()
 *    localice exactamente el lienzo que debe gobernar, erradicando el Ghosting visual.
 * 2. Absolute Authority Pulse: La integración con recenterTrigger garantiza que 
 *    cada pulsación del botón de ubicación dispare el vuelo cinematográfico.
 * 3. LERP Collision Shield: Se implementó la cancelación física de frames durante
 *    las maniobras balísticas para evitar que jumpTo y flyTo colisionen en la GPU.
 * 4. Perspective Morphing: Mantiene el suavizado de Zoom y Pitch entre los modos
 *    STREET y OVERVIEW para una experiencia profesional (Pokémon GO Style).
 */