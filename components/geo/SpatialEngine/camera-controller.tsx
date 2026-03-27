//components/geo/SpatialEngine/camera-controller.tsx
/**
 * NICEPOD V3.0 - CAMERA DIRECTOR (BALLISTIC & LIQUID MOTION)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Gestionar la cámara WebGL imperativamente a 60FPS.
 * [ESTABILIZACIÓN]: Implementación de Vuelo Balístico (IP to GPS) y Re-Sincronía Post-Vuelo.
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
  CAMERA_PROFILES,
  FLY_CONFIG,
} from "../map-constants";

export function CameraController() {
  // 1. CONEXIÓN CON EL MOTOR WEBGL
  const { current: mapInstance } = useMap();

  // 2. CONSUMO DE TELEMETRÍA Y SEÑALES DE AUTORIDAD (V30.0)
  const {
    userLocation,
    needsBallisticLanding,
    confirmLanding
  } = useGeoEngine();

  // 3. MEMORIA CINEMÁTICA Y ESTADO DE VUELO (REFS)
  const currentPosRef = useRef<KinematicPosition | null>(null);
  const currentBearingRef = useRef<number>(-15);
  const isManualModeRef = useRef<boolean>(false);
  const isFlyingRef = useRef<boolean>(false); // Bloqueo de LERP durante animaciones flyTo
  const lastInteractionRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  /**
   * handleUserInteraction:
   * Detecta intervención manual para silenciar el seguimiento automático.
   */
  const handleUserInteraction = useCallback(() => {
    isManualModeRef.current = true;
    lastInteractionRef.current = Date.now();
  }, []);

  /**
   * kinematicLoop:
   * El corazón de 60FPS. Mueve la cámara frame a frame hacia la posición del Voyager.
   */
  const kinematicLoop = useCallback(() => {
    if (!mapInstance || !userLocation) {
      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    const map = mapInstance.getMap();

    // A. EVALUACIÓN DE RECONQUISTA DE FOCO
    const now = Date.now();
    if (isManualModeRef.current && (now - lastInteractionRef.current > 6000)) {
      isManualModeRef.current = false;
      nicepodLog("🎯 [Camera-Director] Reconquista de foco activada.");
    }

    // B. GUARDAS DE SILENCIO (MANUAL O VUELO ACTIVO)
    if (isManualModeRef.current || isFlyingRef.current) {
      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    // C. CÁLCULO DE POSICIÓN INTERPOLADA (LERP)
    const targetPos: KinematicPosition = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude
    };

    if (!currentPosRef.current) {
      currentPosRef.current = targetPos;
    } else {
      // Suavizado líquido de coordenadas
      currentPosRef.current = interpolateCoords(currentPosRef.current, targetPos);
    }

    // D. CÁLCULO DE RUMBO (BEARING)
    const targetBearing = userLocation.heading ?? currentBearingRef.current;
    currentBearingRef.current = interpolateAngle(currentBearingRef.current, targetBearing);

    // E. CÁLCULO DEL FOLLOW-OFFSET (30m detrás del Voyager)
    const cameraAnchor = calculateDestinationPoint(
      currentPosRef.current,
      -CAMERA_PROFILES.NAVIGATE.offset_distance_meters,
      currentBearingRef.current
    );

    // F. EJECUCIÓN IMPERATIVA (JUMP)
    // Usamos jumpTo para que no compita con las animaciones nativas de Mapbox
    map.jumpTo({
      center: [cameraAnchor.longitude, cameraAnchor.latitude],
      bearing: currentBearingRef.current,
      pitch: CAMERA_PROFILES.NAVIGATE.pitch,
      zoom: CAMERA_PROFILES.NAVIGATE.zoom
    });

    animationFrameRef.current = requestAnimationFrame(kinematicLoop);
  }, [mapInstance, userLocation]);

  // --- IV. ORQUESTACIÓN DE VUELO BALÍSTICO (IP TO GPS) ---

  useEffect(() => {
    if (needsBallisticLanding && mapInstance && userLocation && !isFlyingRef.current) {
      const map = mapInstance.getMap();

      nicepodLog("🚀 [Camera-Director] Iniciando Vuelo Balístico hacia el GPS.");
      isFlyingRef.current = true;

      // Sincronizamos la referencia interna antes del vuelo para que el LERP herede el final.
      currentPosRef.current = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      };

      map.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: CAMERA_PROFILES.NAVIGATE.zoom,
        pitch: CAMERA_PROFILES.NAVIGATE.pitch,
        bearing: userLocation.heading ?? -15,
        ...FLY_CONFIG,
        duration: 1800, // Vuelo táctico rápido
      });

      // Al terminar el vuelo, devolvemos el control al motor LERP
      map.once('moveend', () => {
        nicepodLog("🏁 [Camera-Director] Aterrizaje completado. Retomando motor líquido.");
        isFlyingRef.current = false;
        confirmLanding();
      });
    }
  }, [needsBallisticLanding, mapInstance, userLocation, confirmLanding]);

  // --- V. CICLO DE VIDA Y SENSORES ---

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
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Ballistic Landing: Se integra con el flag needsBallisticLanding para ejecutar un
 *    flyTo cinematográfico cuando pasamos de IP a GPS.
 * 2. LERP Suspension: El motor de 60FPS se detiene durante los vuelos automáticos
 *    para evitar que dos comandos de cámara (jumpTo y flyTo) colisionen en la GPU.
 * 3. Authority Handshake: Usa confirmLanding() para cerrar el ciclo de actualización
 *    en el GeoEngine una vez la cámara está asentada.
 * 4. Zero-Jitter: La interpolación angular y de coordenadas garantiza que el 
 *    movimiento se sienta como un motor de juego (Pokémon GO Style).
 */