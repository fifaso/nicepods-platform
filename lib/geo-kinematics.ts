/**
 * ARCHIVO: lib/geo-kinematics.ts
 * VERSIÓN: 1.2 (NicePod Kinematic Engine - Precision Shield Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Proveer el soporte matemático para cinemática fluida y blindaje de jitter.
 * [REFORMA V1.2]: Implementación de Umbral de Silencio Rotacional (Deadzone).
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

import { KINEMATIC_CONFIG } from "@/components/geo/map-constants";

/**
 * INTERFAZ: KinematicPosition
 * Representación técnica de un hito en el espacio PostGIS.
 */
export interface KinematicPosition {
  latitude: number;
  longitude: number;
}

/**
 * interpolateCoords:
 * Realiza una interpolación lineal (LERP) entre coordenadas geográficas.
 * [V1.2]: Integración de guarda de micro-movimiento para estabilidad de 60FPS.
 */
export function interpolateCoords(
  start: KinematicPosition,
  end: KinematicPosition,
  factor: number = KINEMATIC_CONFIG.LERP_FACTOR
): KinematicPosition {
  // Calculamos la distancia para determinar si el movimiento es real o ruido.
  const dist = calculateDistance(start, end);
  
  // Umbral de Silencio Lineal: Si el movimiento es menor a 5cm, devolvemos la posición actual.
  if (dist < 0.05) return start;

  return {
    latitude: start.latitude + (end.latitude - start.latitude) * factor,
    longitude: start.longitude + (end.longitude - start.longitude) * factor,
  };
}

/**
 * interpolateAngle:
 * Suaviza la rotación considerando el wrap-around de 360 grados y blindaje Jitter.
 * [V1.2]: Implementación de Deadzone Shield. Si la diferencia es < 0.5°, ignoramos.
 */
export function interpolateAngle(
  startAngle: number,
  targetAngle: number,
  factor: number = KINEMATIC_CONFIG.LERP_FACTOR
): number {
  let diff = ((targetAngle - startAngle + 180) % 360) - 180;
  if (diff < -180) diff += 360;

  /**
   * JITTER SHIELD:
   * Los magnetómetros de los móviles oscilan +-0.3° constantemente. 
   * Ignorar micro-variaciones detiene los movimientos laterales erráticos.
   */
  if (Math.abs(diff) < 0.5) {
    return startAngle;
  }

  return (startAngle + diff * factor + 360) % 360;
}

/**
 * lerpSimple:
 * Interpolación lineal para variables escalares (Zoom, Pitch).
 */
export function lerpSimple(
  start: number, 
  end: number, 
  factor: number = KINEMATIC_CONFIG.LERP_FACTOR
): number {
  const diff = end - start;
  // Umbral de estabilidad para variables de lente.
  if (Math.abs(diff) < 0.001) return end;
  return start + diff * factor;
}

/**
 * calculateDistance: Matemática de Haversine.
 * Calcula la distancia real en metros entre dos puntos.
 */
export function calculateDistance(p1: KinematicPosition, p2: KinematicPosition): number {
  const R = 6371e3; // Radio terrestre en metros
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
 * isUserOffCenter:
 * Lógica pericial para determinar si el Voyager ha salido del foco de la cámara.
 */
export function isUserOffCenter(
  cameraCenter: KinematicPosition,
  userLocation: KinematicPosition,
  thresholdMeters: number = 40
): boolean {
  const distance = calculateDistance(cameraCenter, userLocation);
  return distance > thresholdMeters;
}

/**
 * calculateDestinationPoint:
 * Proyecta un punto dado un origen, una distancia y un rumbo (bearing).
 * Vital para situar la cámara 'X' metros detrás de la trayectoria del Voyager.
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
 * Calcula el ángulo de ataque entre dos puntos geográficos.
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
 * NOTA TÉCNICA DEL ARCHITECT (V1.2):
 * 1. Deadzone Shielding: Se ha implementado un umbral de 0.5° para anular el temblor
 *    de la cámara en modo reposo, garantizando una visualización profesional.
 * 2. Static Recovery: lerpSimple ahora retorna el valor final si la diferencia es 
 *    despreciable, ahorrando ciclos de CPU en el controlador de cámara.
 * 3. Atomic Math: Mantiene el rigor de trigonometría pura sin dependencias 
 *    externas, asegurando la soberanía del hilo principal.
 * 4. Micro-Movement Guard: La interpolación de coordenadas ignora cambios de 
 *    menos de 5cm para estabilizar el marcador del Voyager.
 */