/**
 * ARCHIVO: components/geo/SpatialEngine/camera-controller.tsx
 * VERSIÓN: 4.9 (NicePod Camera Director - Style-Ready & Performance Guard Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Gestionar la cámara WebGL priorizando la estabilidad del hilo principal.
 * [REFORMA V4.9]: Implementación de Style-Load Guard para erradicar violaciones de FPS.
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
  /** mapId: Identificador único de la instancia soberana (map-full o map-dashboard). */
  mapId: MapInstanceId;
}

/**
 * CameraController: El brazo ejecutor cinemático de NicePod.
 * Opera directamente sobre la GPU mediante la instancia nativa de Mapbox GL JS.
 */
export function CameraController({ mapId }: CameraControllerProps) {
  // 1. CONEXIÓN VINCULADA POR ID SOBERANO
  // Extraemos la instancia específica para evitar interferencias entre Dashboard y Mapa Full.
  const { [mapId]: mapInstance } = useMap();

  // 2. CONSUMO DE MANDO CINEMÁTICO (V37.0)
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
   * handleUserInteraction: EL ESCUDO DE INTERACCIÓN
   * Detiene el motor LERP inmediatamente al detectar contacto físico del Voyager.
   */
  const handleUserInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
    if (!isManualMode) {
      setManualMode(true);
    }

    // [ORDEN PRIORITARIA]: Cancelamos el frame actual para liberar la CPU.
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [isManualMode, setManualMode]);

  /**
   * kinematicLoop: EL CORAZÓN DE LA NAVEGACIÓN LÍQUIDA
   * Misión: Interpolar todas las variables físicas a 60FPS.
   */
  const kinematicLoop = useCallback(() => {
    // A. GUARDIA DE ESTABILIDAD (V4.9)
    // No permitimos la ejecución del bucle si Mapbox aún está cargando el estilo.
    // Esto previene violaciones de FPS y errores de 'Style not loaded'.
    if (!mapInstance || !userLocation) {
      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    const map = mapInstance.getMap();
    if (!map.isStyleLoaded()) {
      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    // B. PROTOCOLO DE RECUPERACIÓN DE FOCO (Timeout de 8s)
    const now = Date.now();
    if (isManualMode && (now - lastInteractionRef.current > 8000)) {
      nicepodLog(`🎯 [Camera:${mapId}] Recuperando mando por inactividad.`);
      setManualMode(false);
    }

    // C. FILTROS DE SILENCIO
    if (isManualMode || isFlyingRef.current) {
      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    // D. OBTENCIÓN DEL PERFIL ACTIVO (STREET vs OVERVIEW)
    const profile = PERSPECTIVE_PROFILES[cameraPerspective];

    // E. MOTOR LERP MULTI-VARIABLE (GPU OFF-LOADING)
    
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

    // 2. Orientación (Anti-Jitter Lock 0.5°)
    const rawTargetBearing = profile.bearing_follow 
      ? (userLocation.heading ?? currentBearingRef.current)
      : 0; 
    
    if (Math.abs(rawTargetBearing - currentBearingRef.current) > 0.5) {
      currentBearingRef.current = interpolateAngle(currentBearingRef.current, rawTargetBearing);
    }

    // 3. Morfismo de Lente (Pitch & Zoom)
    currentPitchRef.current = lerpSimple(currentPitchRef.current, profile.pitch);
    currentZoomRef.current = lerpSimple(currentZoomRef.current, profile.zoom);

    // F. CÁLCULO DEL ANCLA CINEMÁTICA (Follow-Offset Táctico)
    const cameraAnchor = calculateDestinationPoint(
      currentPosRef.current,
      -profile.offset_distance_meters, 
      currentBearingRef.current
    );

    // G. EJECUCIÓN IMPERATIVA SOBRE EL METAL
    map.jumpTo({
      center: [cameraAnchor.longitude, cameraAnchor.latitude],
      bearing: currentBearingRef.current,
      pitch: currentPitchRef.current,
      zoom: currentZoomRef.current
    });

    animationFrameRef.current = requestAnimationFrame(kinematicLoop);
  }, [mapInstance, userLocation, cameraPerspective, isManualMode, setManualMode, mapId]);

  /**
   * EFECTO: ORQUESTACIÓN DE VUELO BALÍSTICO POR PULSO
   * [REFORMA V4.9]: Bloqueo total de LERP durante maniobras de autoridad.
   */
  useEffect(() => {
    const triggerReceived = recenterTrigger > lastProcessedTriggerRef.current;
    
    if ((needsBallisticLanding || triggerReceived) && mapInstance && userLocation && !isFlyingRef.current) {
      const map = mapInstance.getMap();
      const profile = PERSPECTIVE_PROFILES[cameraPerspective];
      
      // Solo volamos si el motor WebGL está estable para recibir comandos pesados.
      if (!map.isStyleLoaded()) return;

      nicepodLog(`🚀 [Camera:${mapId}] Pulso Balístico: Priorizando Vuelo.`);
      
      // FRENO DE SEGURIDAD: Detenemos el LERP antes de iniciar flyTo.
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      isFlyingRef.current = true;
      lastProcessedTriggerRef.current = recenterTrigger;

      // Sync previo de referencias para el aterrizaje.
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
        // Velocidad táctica para recentrados manuales.
        duration: triggerReceived ? 1200 : FLY_CONFIG.duration 
      });

      map.once('moveend', () => {
        nicepodLog(`🏁 [Camera:${mapId}] Aterrizaje Certificado.`);
        
        // Sincronizamos las referencias con la verdad final de la GPU.
        currentPitchRef.current = profile.pitch;
        currentZoomRef.current = profile.zoom;
        currentBearingRef.current = profile.bearing_follow ? (userLocation.heading ?? 0) : 0;
        
        isFlyingRef.current = false;
        confirmLanding(); 

        // Retomamos el motor líquido si el usuario no tiene el dedo en la pantalla.
        if (!isManualMode) {
          animationFrameRef.current = requestAnimationFrame(kinematicLoop);
        }
      });
    }
  }, [needsBallisticLanding, recenterTrigger, mapInstance, userLocation, cameraPerspective, confirmLanding, kinematicLoop, mapId, isManualMode]);

  /**
   * CICLO DE VIDA: Gestión de Hardware y Eventos del Canvas.
   */
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(kinematicLoop);

    const canvas = mapInstance?.getMap().getCanvas();
    if (canvas) {
      canvas.addEventListener('mousedown', handleUserInteraction);
      canvas.addEventListener('touchstart', handleUserInteraction, { passive: true });
      canvas.addEventListener('wheel', handleUserInteraction, { passive: true });
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
 * NOTA TÉCNICA DEL ARCHITECT (V4.9):
 * 1. Performance Guard: Se implementó un bloqueo preventivo del bucle LERP mediante
 *    map.isStyleLoaded(), eliminando las violaciones de FPS durante el arranque.
 * 2. Flight Sovereignty: La cancelación física de animationFrame antes de flyTo
 *    asegura que el botón de ubicación funcione de forma determinista y profesional.
 * 3. Jitter Shield 0.5°: Erradica los temblores laterales de la cámara, manteniendo 
 *    la estética Pokémon GO solicitada.
 * 4. Interaction Integrity: El controlador detecta instantáneamente el contacto 
 *    humano para liberar los gestos nativos de Zoom y Pan.
 */