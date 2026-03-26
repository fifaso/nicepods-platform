// components/geo/SpatialEngine/camera-controller.tsx
// VERSIÓN: 2.0 (NicePod Camera Director - Liquid Motion & Precision Offset Edition)
// Misión: Gestionar imperativamente la cámara para lograr la fluidez de Google Maps.
// [ESTABILIZACIÓN]: Unificación de coordenadas lat/lng y protocolo de reconquista táctica.

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
} from "../map-constants";

/**
 * COMPONENTE: CameraController
 * Este componente no renderiza nada en el DOM. Es un controlador puro 
 * que interactúa imperativamente con la instancia WebGL del mapa.
 */
export function CameraController() {
  // 1. CONEXIÓN CON EL MOTOR WEBGL
  const { current: mapInstance } = useMap();

  // 2. CONSUMO DE TELEMETRÍA SOBERANA (V23.2)
  const { userLocation, isTriangulated, isGPSLock } = useGeoEngine();

  // 3. MEMORIA CINEMÁTICA (REFS)
  // Usamos Refs para garantizar que el bucle de 60fps no dispare re-renderizados de React.
  const currentPosRef = useRef<KinematicPosition | null>(null);
  const currentBearingRef = useRef<number>(-15);
  const isManualModeRef = useRef<boolean>(false);
  const lastInteractionRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  /**
   * handleUserInteraction:
   * Detecta cuando el Voyager toma el mando manual del mapa.
   */
  const handleUserInteraction = useCallback(() => {
    isManualModeRef.current = true;
    lastInteractionRef.current = Date.now();
  }, []);

  /**
   * kinematicLoop:
   * El corazón del movimiento líquido. Se ejecuta sincronizado con el refresco de la GPU.
   */
  const kinematicLoop = useCallback(() => {
    if (!mapInstance || !userLocation) {
      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    const map = mapInstance.getMap();

    // A. EVALUACIÓN DE RECONQUISTA DE FOCO
    // Si han pasado 6 segundos sin gestos táctiles, volvemos al modo automático.
    const now = Date.now();
    if (isManualModeRef.current && (now - lastInteractionRef.current > 6000)) {
      isManualModeRef.current = false;
      nicepodLog("🎯 [Camera-Director] Reconquista de foco: Retomando seguimiento.");
    }

    // Si el usuario está operando el mapa manualmente, pausamos el bucle de cámara.
    if (isManualModeRef.current) {
      animationFrameRef.current = requestAnimationFrame(kinematicLoop);
      return;
    }

    // B. CÁLCULO DE POSICIÓN INTERPOLADA (LERP)
    const targetPos: KinematicPosition = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude
    };

    // Si es el primer fix, saltamos instantáneamente.
    if (!currentPosRef.current) {
      currentPosRef.current = targetPos;
    } else {
      // Suavizamos el movimiento geográfico
      currentPosRef.current = interpolateCoords(currentPosRef.current, targetPos);
    }

    // C. CÁLCULO DE RUMBO (BEARING)
    // El heading del GPS puede temblar; lo interpolamos para una rotación líquida.
    const targetBearing = userLocation.heading ?? currentBearingRef.current;
    currentBearingRef.current = interpolateAngle(currentBearingRef.current, targetBearing);

    // D. CÁLCULO DEL FOLLOW-OFFSET (VISIÓN POKÉMON GO)
    // Situamos el centro de la cámara X metros por detrás del Voyager basándonos en el rumbo.
    const cameraAnchor = calculateDestinationPoint(
      currentPosRef.current,
      -CAMERA_PROFILES.NAVIGATE.offset_distance_meters, // Desplazamiento hacia atrás
      currentBearingRef.current
    );

    // E. EJECUCIÓN IMPERATIVA SOBRE EL METAL
    // Usamos jumpTo para que la cámara siga nuestra interpolación manual frame a frame.
    map.jumpTo({
      center: [cameraAnchor.longitude, cameraAnchor.latitude],
      bearing: currentBearingRef.current,
      pitch: CAMERA_PROFILES.NAVIGATE.pitch,
      zoom: CAMERA_PROFILES.NAVIGATE.zoom
    });

    animationFrameRef.current = requestAnimationFrame(kinematicLoop);
  }, [mapInstance, userLocation]);

  // --- IV. ORQUESTACIÓN DEL CICLO DE VIDA ---

  useEffect(() => {
    // Iniciamos el motor de cinemática
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

  return null; // Componente lógico, sin interfaz propia.
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Solución de Nomenclatura: Se erradicó el uso de 'lat/lng' en favor del estándar 
 *    'latitude/longitude' de la interfaz KinematicPosition, resolviendo los 
 *    errores de tipos ts(2339) y ts(2739).
 * 2. Movimiento Líquido (60FPS): Al delegar el seguimiento a un bucle de 
 *    'requestAnimationFrame' fuera del estado de React, el mapa se desliza con la 
 *    suavidad de un motor de juego, eliminando los saltos bruscos del GPS.
 * 3. Follow-Distance Táctica: La cámara se sitúa 30m por detrás del Voyager. 
 *    Esto amplía el campo visual frontal y garantiza que los edificios 3D de 
 *    obsidiana no oculten el marcador del usuario.
 * 4. Build Shield Total: Se importó 'nicepodLog' desde '@/lib/utils' y se 
 *    blindaron los nulos mediante guardas de referencia en el bucle.
 */