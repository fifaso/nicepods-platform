// lib/geo-kinematics.ts
// VERSIÓN: 1.0 (NicePod Kinematic Engine - Liquid Motion Edition)
// Misión: Proveer el soporte matemático para transformar telemetría cruda en cinemática fluida.
// [NCIS DOGMA]: Precisión pericial. Sin adornos. Matemática pura para soberanía visual.

import { KINEMATIC_CONFIG } from "@/components/geo/map-constants";

/**
 * INTERFAZ: KinematicPosition
 */
export interface KinematicPosition {
  latitude: number;
  longitude: number;
}

/**
 * interpolateCoords:
 * Realiza una interpolación lineal (LERP) entre dos coordenadas geográficas.
 * Misión: Eliminar el 'stuttering' visual del mapa.
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
 * Suaviza la rotación de la brújula considerando el salto de 360 grados.
 * Misión: Evitar giros erráticos de la cámara en el eje vertical (Bearing).
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
 * calculateDistance: Matemática de Haversine.
 * Calcula la distancia real en metros entre dos puntos.
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
 * calculateDestinationPoint:
 * Calcula un nuevo punto dado un origen, una distancia (metros) y un rumbo (grados).
 * Misión: Implementar el 'Follow-Distance Offset' (situar la cámara detrás del Voyager).
 */
export function calculateDestinationPoint(
  origin: KinematicPosition,
  distanceMeters: number,
  bearingDegrees: number
): KinematicPosition {
  const R = 6371e3; // Radio terrestre
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
 * Calcula el rumbo (bearing) entre dos coordenadas.
 * Misión: Proveer dirección de viaje si el sensor de brújula del móvil es inestable.
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
 * NOTA TÉCNICA DEL ARCHITECT (V1.0):
 * 1. Eficiencia Matemática: Se han utilizado funciones de trigonometría pura para 
 *    evitar dependencias de librerías externas pesadas (como Turf.js), manteniendo 
 *    el bundle de la PWA ligero y rápido.
 * 2. Soporte para el Follow-Offset: 'calculateDestinationPoint' es la clave para 
 *    situar la cámara 'X' metros detrás del usuario, permitiendo ver la calle 
 *    que tiene por delante y evitando que los edificios tapen el avatar.
 * 3. Resolución de Wrap-Around: 'interpolateAngle' garantiza que las rotaciones 
 *    automáticas de la cámara sean suaves y no realicen giros de 360 grados innecesarios.
 */