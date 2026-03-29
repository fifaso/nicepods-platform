/**
 * ARCHIVO: lib/geo-kinematics.ts
 * VERSIÓN: 1.1 (NicePod Kinematic Engine - Smart-Motive Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Proveer el soporte matemático para cinemática fluida y lógica espacial.
 * [REFORMA V1.1]: Inyección de funciones de visibilidad y LERP escalar para Zoom/Pitch.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

import { KINEMATIC_CONFIG } from "@/components/geo/map-constants";

/**
 * INTERFAZ: KinematicPosition
 * Representación técnica de un punto en la malla esférica.
 */
export interface KinematicPosition {
  latitude: number;
  longitude: number;
}

/**
 * interpolateCoords:
 * Realiza una interpolación lineal (LERP) entre dos coordenadas.
 * Misión: Eliminar el 'stuttering' visual a 60FPS.
 */
export function interpolateCoords(
  start: KinematicPosition,
  end: KinematicPosition,
  factor: number = KINEMATIC_CONFIG.LERP_FACTOR
): KinematicPosition {
  return {
    latitude: start.latitude + (end.latitude - start.latitude) * factor,
    longitude: start.longitude + (end.longitude - start.longitude) * factor,
  };
}

/**
 * interpolateAngle:
 * Suaviza la rotación considerando el wrap-around de 360 grados.
 */
export function interpolateAngle(
  startAngle: number,
  targetAngle: number,
  factor: number = KINEMATIC_CONFIG.LERP_FACTOR
): number {
  let diff = ((targetAngle - startAngle + 180) % 360) - 180;
  if (diff < -180) diff += 360;
  return (startAngle + diff * factor + 360) % 360;
}

/**
 * lerpSimple: [NUEVO V1.1]
 * Interpolación lineal para valores numéricos simples (Zoom, Pitch).
 */
export function lerpSimple(
  start: number, 
  end: number, 
  factor: number = KINEMATIC_CONFIG.LERP_FACTOR
): number {
  return start + (end - start) * factor;
}

/**
 * calculateDistance: Matemática de Haversine de alta precisión.
 * Calcula la distancia real en metros entre dos puntos geográficos.
 */
export function calculateDistance(p1: KinematicPosition, p2: KinematicPosition): number {
  const R = 6371e3; // Radio de la Tierra en metros
  const phi1 = (p1.latitude * Math.PI) / 180;
  const phi2 = (p2.latitude * Math.PI) / 180;
  const deltaPhi = ((p2.latitude - p1.latitude) * Math.PI) / 180;
  const deltaLambda = ((p2.longitude - p1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * isUserOffCenter: [NUEVO V1.1]
 * Determina si el usuario está lo suficientemente lejos del centro del mapa
 * para justificar el cambio de estado del botón a "Recuperar Foco".
 * 
 * @param cameraCenter - Coordenada actual del visor de Mapbox.
 * @param userLocation - Coordenada real del GPS.
 * @param thresholdMeters - Distancia de tolerancia (Default 50m).
 */
export function isUserOffCenter(
  cameraCenter: KinematicPosition,
  userLocation: KinematicPosition,
  thresholdMeters: number = 50
): boolean {
  const distance = calculateDistance(cameraCenter, userLocation);
  return distance > thresholdMeters;
}

/**
 * calculateDestinationPoint:
 * Calcula un nuevo punto dado un origen, una distancia y un rumbo.
 * Fundamental para el 'Follow-Offset' de la cámara.
 */
export function calculateDestinationPoint(
  origin: KinematicPosition,
  distanceMeters: number,
  bearingDegrees: number
): KinematicPosition {
  const R = 6371e3; 
  const ad = distanceMeters / R;
  const la1 = (origin.latitude * Math.PI) / 180;
  const lo1 = (origin.longitude * Math.PI) / 180;
  const brng = (bearingDegrees * Math.PI) / 180;

  const la2 = Math.asin(
    Math.sin(la1) * Math.cos(ad) + Math.cos(la1) * Math.sin(ad) * Math.cos(brng)
  );

  const lo2 =
    lo1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(ad) * Math.cos(la1),
      Math.cos(ad) - Math.sin(la1) * Math.sin(la2)
    );

  return {
    latitude: (la2 * 180) / Math.PI,
    longitude: (lo2 * 180) / Math.PI,
  };
}

/**
 * getBearing:
 * Calcula el rumbo (ángulo) entre dos coordenadas.
 */
export function getBearing(p1: KinematicPosition, p2: KinematicPosition): number {
  const la1 = (p1.latitude * Math.PI) / 180;
  const lo1 = (p1.longitude * Math.PI) / 180;
  const la2 = (p2.latitude * Math.PI) / 180;
  const lo2 = (p2.longitude * Math.PI) / 180;

  const y = Math.sin(lo2 - lo1) * Math.cos(la2);
  const x =
    Math.cos(la1) * Math.sin(la2) -
    Math.sin(la1) * Math.cos(la2) * Math.cos(lo2 - lo1);

  const brng = Math.atan2(y, x);
  return ((brng * 180) / Math.PI + 360) % 360;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V1.1):
 * 1. Visual Off-Center Guard: Se implementó 'isUserOffCenter' para dotar al 
 *    GeoEngine de la capacidad de decidir inteligentemente el estado del UI.
 * 2. Morphing Support: 'lerpSimple' garantiza que los cambios de Zoom y Pitch
 *    en las transiciones de perspectiva sean suaves y no discretos.
 * 3. Atomic Math: Mantiene el Dogma NCIS de trigonometría pura sin dependencias
 *    externas, asegurando un bundle ligero y ejecución en microsegundos.
 */