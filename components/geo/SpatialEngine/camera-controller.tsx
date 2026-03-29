/**
 * ARCHIVO: components/geo/SpatialEngine/camera-controller.tsx
 * VERSIÓN: 4.6 (NicePod Camera Director - Specific Instance Authority Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Gestionar la cámara WebGL priorizando maniobras de autoridad mediante ID específico.
 * [REFORMA V4.6]: Resolución de fallo de mando mediante vinculación por ID 'main-mesh-painter'.
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
 * CameraController: El Director de Fotografía imperativo.
 * No genera DOM. Manipula el motor WebGL sincronizado con la GPU.
 */
export function CameraController() {
  // 1. CONEXIÓN ESPECÍFICA CON EL MOTOR WEBGL
  // [FIX V4.6]: Extraemos la instancia mediante el ID único definido en MapCore.
  // Esto garantiza que useMap() no devuelva undefined.
  const { ['main-mesh-painter']: mapInstance } = useMap();

  // 2. CONSUMO DE MANDO CINEMÁTICO (V35.0)
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
   * Mueve la cámara frame a frame sincronizado con el refresco de pantalla.
   */
  const kinematicLoop = useCallback(() => {
    // Si no hay instancia de mapa detectada, re-intentamos en el siguiente frame.
    if (!mapInstance || !userLocation) {
      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    const map = mapInstance.getMap();

    // A. PROTOCOLO DE RECUPERACIÓN DE AUTORIDAD (8 segundos)
    const now = Date.now();
    if (isManualMode && (now - lastInteractionRef.current > 8000)) {
      nicepodLog("🎯 [Camera-Director] Inactividad detectada. Recuperando mando.");
      setManualMode(false);
    }

    // B. GUARDA DE SEGURIDAD
    // Si la cámara está en medio de un vuelo o el usuario la mueve, bloqueamos el LERP.
    if (isManualMode || isFlyingRef.current) {
      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    // C. OBTENCIÓN DEL PERFIL DE PERSPECTIVA ACTIVO (V5.4)
    const profile = PERSPECTIVE_PROFILES[cameraPerspective];

    // D. MOTOR LERP MULTI-VARIABLE (60FPS)
    const targetPos: KinematicPosition = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude
    };

    if (!currentPosRef.current) {
      currentPosRef.current = targetPos;
    } else {
      currentPosRef.current = interpolateCoords(currentPosRef.current, targetPos);
    }

    // Bearing: STREET (Sigue usuario) | OVERVIEW (Norte arriba fijo)
    const targetBearing = profile.bearing_follow 
      ? (userLocation.heading ?? currentBearingRef.current)
      : 0; 
    currentBearingRef.current = interpolateAngle(currentBearingRef.current, targetBearing);

    // Pitch & Zoom: Morfismo suave mediante lerpSimple
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
   * EFECTO: ORQUESTACIÓN DE VUELO BALÍSTICO POR ID
   * [REFORMA V4.6]: Prioriza el flyTo cancelando físicamente el bucle LERP.
   */
  useEffect(() => {
    const triggerReceived = recenterTrigger > lastProcessedTriggerRef.current;
    
    if ((needsBallisticLanding || triggerReceived) && mapInstance && userLocation && !isFlyingRef.current) {
      const map = mapInstance.getMap();
      const profile = PERSPECTIVE_PROFILES[cameraPerspective];
      
      nicepodLog(`🚀 [Camera-Director] Pulso de Autoridad recibido en 'main-mesh-painter'.`);
      
      /**
       * EL FRENO AGRESIVO:
       * Cancelamos el animationFrame actual para liberar el bus de comandos.
       * Sin esto, el jumpTo del LERP cancelaría el flyTo inmediatamente.
       */
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      isFlyingRef.current = true;
      lastProcessedTriggerRef.current = recenterTrigger;

      // Sincronización de referencias antes de soltar el mando al motor nativo.
      currentPosRef.current = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      };

      // Ejecución del vuelo nativo de Mapbox de alta prioridad.
      map.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: profile.zoom,
        pitch: profile.pitch,
        bearing: profile.bearing_follow ? (userLocation.heading ?? 0) : 0,
        ...FLY_CONFIG,
        // Si es recentrado por botón, usamos velocidad táctica (1.2s)
        duration: triggerReceived ? 1200 : FLY_CONFIG.duration 
      });

      // Handshake de finalización de maniobra
      map.once('moveend', () => {
        nicepodLog("🏁 [Camera-Director] Vuelo completado. Re-instanciando motor líquido.");
        
        // Sincronizamos las refs con el estado final real de la cámara
        currentPitchRef.current = profile.pitch;
        currentZoomRef.current = profile.zoom;
        currentBearingRef.current = profile.bearing_follow ? (userLocation.heading ?? 0) : 0;
        
        isFlyingRef.current = false;
        confirmLanding(); // Notificamos al GeoEngine que hemos aterrizado

        // Reiniciamos el bucle de cinemática líquida de 60FPS
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
 * NOTA TÉCNICA DEL ARCHITECT (V4.6):
 * 1. Specific Instance Mapping: Se utiliza el ID 'main-mesh-painter' en useMap() para 
 *    garantizar que el controlador tenga autoridad sobre el mapa principal de NicePod.
 * 2. Flight Priority Protocol: Se implementó la cancelación física de frames antes 
 *    de iniciar el flyTo. Esto erradica el fallo del botón de ubicación.
 * 3. Pulse-Triggered Recenter: La integración con recenterTrigger (V35.0) permite
 *    que el Voyager recupere el foco infinitas veces de forma exitosa.
 * 4. PBR Morphing: El motor LERP ahora gestiona Zoom y Pitch de forma independiente,
 *    asegurando transiciones de perspectiva fluidas y profesionales.
 */