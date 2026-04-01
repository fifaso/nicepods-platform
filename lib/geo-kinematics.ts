/**
 * ARCHIVO: lib/geo-kinematics.ts
 * VERSIÓN: 2.0 (NicePod Sovereign Kinematic Engine - Pure Math Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Proveer el soporte físico-matemático para la cinemática de cámara y avatar.
 * [REFORMA V2.0]: Eliminación total de dependencias externas. Matemática pura de 
 * grado industrial para garantizar la soberanía del hilo principal.
 * Nivel de Integridad: 100% (Propietario / Sin Abreviaciones / Producción-Ready)
 */

/**
 * INTERFAZ: KinematicPosition
 * Representación técnica de un punto en el espacio geográfico.
 */
export interface KinematicPosition {
  latitude: number;
  longitude: number;
}

/**
 * interpolateCoords:
 * Realiza una interpolación lineal (LERP) entre dos coordenadas geográficas.
 * @param start - Posición de origen.
 * @param end - Posición de destino.
 * @param factor - Factor de suavizado (0 a 1).
 * 
 * [PROTOCOLO NCIS]: Si el desplazamiento es menor a 5cm, el motor entra en estasis
 * para evitar el jitter visual del hardware.
 */
export function interpolateCoords(
  start: KinematicPosition,
  end: KinematicPosition,
  factor: number = 0.12
): KinematicPosition {
  const distance = calculateDistance(start, end);
  
  // Umbral de Silencio Mecánico: 5 centímetros
  if (distance < 0.05) {
    return start;
  }

  // Aceleración de Alcance: Si la distancia es mayor a 50m, duplicamos la velocidad
  const effectiveFactor = distance > 50 ? Math.min(factor * 2, 1) : factor;

  return {
    latitude: start.latitude + (end.latitude - start.latitude) * effectiveFactor,
    longitude: start.longitude + (end.longitude - start.longitude) * effectiveFactor,
  };
}

/**
 * interpolateAngle:
 * Suaviza la rotación angular gestionando el cruce por el Norte (0°/360°).
 * @param startAngle - Ángulo actual en grados.
 * @param targetAngle - Ángulo objetivo en grados.
 * @param factor - Factor de suavizado.
 */
export function interpolateAngle(
  startAngle: number,
  targetAngle: number,
  factor: number = 0.12
): number {
  let difference = ((targetAngle - startAngle + 180) % 360) - 180;
  if (difference < -180) {
    difference += 360;
  }

  /**
   * JITTER SHIELD:
   * Ignoramos variaciones menores a 0.6 grados para estabilizar la brújula 
   * ante interferencias electromagnéticas urbanas.
   */
  if (Math.abs(difference) < 0.6) {
    return startAngle;
  }

  return (startAngle + difference * factor + 360) % 360;
}

/**
 * lerpSimple:
 * Interpolación lineal para escalares (Zoom, Pitch).
 */
export function lerpSimple(
  start: number, 
  end: number, 
  factor: number = 0.12
): number {
  const difference = end - start;
  // Umbral de estabilidad nanométrica
  if (Math.abs(difference) < 0.0001) {
    return end;
  }
  return start + difference * factor;
}

/**
 * calculateDistance: Fómula de Haversine (Soberanía Pura).
 * Calcula la distancia real en metros sobre la esfera terrestre.
 */
export function calculateDistance(p1: KinematicPosition, p2: KinematicPosition): number {
  const EARTH_RADIUS_METERS = 6371000;
  
  const latitudeRad1 = (p1.latitude * Math.PI) / 180;
  const latitudeRad2 = (p2.latitude * Math.PI) / 180;
  
  const deltaLatitude = ((p2.latitude - p1.latitude) * Math.PI) / 180;
  const deltaLongitude = ((p2.longitude - p1.longitude) * Math.PI) / 180;

  const haversineA =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(latitudeRad1) * 
    Math.cos(latitudeRad2) * 
    Math.sin(deltaLongitude / 2) * 
    Math.sin(deltaLongitude / 2);

  const haversineC = 2 * Math.atan2(Math.sqrt(haversineA), Math.sqrt(1 - haversineA));

  return EARTH_RADIUS_METERS * haversineC;
}

/**
 * calculateDestinationPoint:
 * Proyecta una nueva coordenada geográfica dado un origen, distancia y rumbo.
 * Vital para situar la cámara con offset en el modo inmersivo STREET.
 */
export function calculateDestinationPoint(
  origin: KinematicPosition,
  distanceMeters: number,
  bearingDegrees: number
): KinematicPosition {
  const EARTH_RADIUS_METERS = 6371000;
  const angularDistance = distanceMeters / EARTH_RADIUS_METERS;
  
  const latitudeRad1 = (origin.latitude * Math.PI) / 180;
  const longitudeRad1 = (origin.longitude * Math.PI) / 180;
  const bearingRad = (bearingDegrees * Math.PI) / 180;

  const latitudeRad2 = Math.asin(
    Math.sin(latitudeRad1) * Math.cos(angularDistance) +
    Math.cos(latitudeRad1) * Math.sin(angularDistance) * Math.cos(bearingRad)
  );

  const longitudeRad2 =
    longitudeRad1 +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(latitudeRad1),
      Math.cos(angularDistance) - Math.sin(latitudeRad1) * Math.sin(latitudeRad2)
    );

  return {
    latitude: (latitudeRad2 * 180) / Math.PI,
    longitude: (longitudeRad2 * 180) / Math.PI,
  };
}

/**
 * getBearing:
 * Calcula el ángulo azimutal entre dos coordenadas geográficas.
 */
export function getBearing(p1: KinematicPosition, p2: KinematicPosition): number {
  const latitudeRad1 = (p1.latitude * Math.PI) / 180;
  const latitudeRad2 = (p2.latitude * Math.PI) / 180;
  const deltaLongitude = ((p2.longitude - p1.longitude) * Math.PI) / 180;

  const y = Math.sin(deltaLongitude) * Math.cos(latitudeRad2);
  const x =
    Math.cos(latitudeRad1) * Math.sin(latitudeRad2) -
    Math.sin(latitudeRad1) * Math.cos(latitudeRad2) * Math.cos(deltaLongitude);

  const bearingRad = Math.atan2(y, x);
  return ((bearingRad * 180) / Math.PI + 360) % 360;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Low-Level Integrity: Se han eliminado todas las importaciones externas. El motor
 *    ahora recibe los factores de suavizado por parámetro, siendo una utilidad pura.
 * 2. Performance Shield: La implementación de Haversine y Bearing utiliza funciones
 *    nativas de JavaScript altamente optimizadas por motores V8.
 * 3. Atomic Math: Este archivo es ahora el único punto de verdad para los cálculos 
 *    esféricos de la plataforma, blindando el sistema contra ataques de cadena de suministro.
 */