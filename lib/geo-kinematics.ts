/**
 * ARCHIVO: lib/geo-kinematics.ts
 * VERSIÓN: 3.0 (NicePod Sovereign Kinematic Engine - Pure industrial Math Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Proveer el soporte físico-matemático para la cinemática de cámara y avatar,
 * garantizando la soberanía computacional mediante el uso de matemática pura.
 * [REFORMA V3.0]: Cumplimiento total de la Zero Abbreviations Policy, resolución de 
 * inconsistencia nominal (interpolateCoordinates) y blindaje de tipos.
 * Nivel de Integridad: 100% (Propietario / Sin Abreviaciones / Producción-Ready)
 */

/**
 * INTERFAZ: KinematicPosition
 * Representación técnica de un punto en el espacio geográfico esférico.
 */
export interface KinematicPosition {
  latitude: number;
  longitude: number;
}

/**
 * interpolateCoordinates:
 * Realiza una interpolación lineal (LERP) entre dos coordenadas geográficas.
 * @param startPosition - Posición de origen.
 * @param targetPosition - Posición de destino.
 * @param smoothingFactor - Factor de suavizado (0 a 1).
 * 
 * [PROTOCOLO NCIS]: Si el desplazamiento es menor a 5cm, el motor entra en estasis
 * para evitar el jitter visual causado por el ruido térmico del hardware.
 */
export function interpolateCoordinates(
  startPosition: KinematicPosition,
  targetPosition: KinematicPosition,
  smoothingFactor: number = 0.12
): KinematicPosition {
  const physicalDistanceMeters = calculateDistanceBetweenPoints(startPosition, targetPosition);
  
  // Umbral de Silencio Mecánico: 5 centímetros
  if (physicalDistanceMeters < 0.05) {
    return startPosition;
  }

  // Aceleración de Alcance: Si la distancia es mayor a 50m, duplicamos la velocidad de convergencia.
  const effectiveSmoothingFactor = physicalDistanceMeters > 50 
    ? Math.min(smoothingFactor * 2, 1) 
    : smoothingFactor;

  return {
    latitude: startPosition.latitude + (targetPosition.latitude - startPosition.latitude) * effectiveSmoothingFactor,
    longitude: startPosition.longitude + (targetPosition.longitude - startPosition.longitude) * effectiveSmoothingFactor,
  };
}

/**
 * interpolateAngle:
 * Suaviza la rotación angular gestionando matemáticamente el cruce por el Norte (0°/360°).
 */
export function interpolateAngle(
  currentAngleDegrees: number,
  targetAngleDegrees: number,
  smoothingFactor: number = 0.12
): number {
  let angularDifference = ((targetAngleDegrees - currentAngleDegrees + 180) % 360) - 180;
  if (angularDifference < -180) {
    angularDifference += 360;
  }

  /**
   * JITTER SHIELD:
   * Ignoramos variaciones menores a 0.6 grados para estabilizar la brújula 
   * ante interferencias electromagnéticas del entorno urbano.
   */
  if (Math.abs(angularDifference) < 0.6) {
    return currentAngleDegrees;
  }

  return (currentAngleDegrees + angularDifference * smoothingFactor + 360) % 360;
}

/**
 * interpolateScalarValue:
 * Interpolación lineal para valores escalares (Zoom, Pitch, Opacidad).
 */
export function interpolateScalarValue(
  currentValue: number, 
  targetValue: number, 
  smoothingFactor: number = 0.12
): number {
  const scalarDifference = targetValue - currentValue;
  // Umbral de estabilidad nanométrica
  if (Math.abs(scalarDifference) < 0.0001) {
    return targetValue;
  }
  return currentValue + scalarDifference * smoothingFactor;
}

/**
 * calculateDistanceBetweenPoints: Fómula de Haversine (Soberanía Pura).
 * Calcula la distancia real en metros sobre la superficie de la geoide terrestre.
 */
export function calculateDistanceBetweenPoints(
  firstPosition: KinematicPosition, 
  secondPosition: KinematicPosition
): number {
  const EARTH_RADIUS_METERS = 6371000;
  
  const firstLatitudeRadians = (firstPosition.latitude * Math.PI) / 180;
  const secondLatitudeRadians = (secondPosition.latitude * Math.PI) / 180;
  
  const deltaLatitudeRadians = ((secondPosition.latitude - firstPosition.latitude) * Math.PI) / 180;
  const deltaLongitudeRadians = ((secondPosition.longitude - firstPosition.longitude) * Math.PI) / 180;

  const haversineMathematicalFactor =
    Math.sin(deltaLatitudeRadians / 2) * Math.sin(deltaLatitudeRadians / 2) +
    Math.cos(firstLatitudeRadians) * 
    Math.cos(secondLatitudeRadians) * 
    Math.sin(deltaLongitudeRadians / 2) * 
    Math.sin(deltaLongitudeRadians / 2);

  const haversineCentralAngle = 2 * Math.atan2(
    Math.sqrt(haversineMathematicalFactor), 
    Math.sqrt(1 - haversineMathematicalFactor)
  );

  return EARTH_RADIUS_METERS * haversineCentralAngle;
}

/**
 * calculateDestinationPoint:
 * Proyecta una nueva coordenada geográfica dado un origen, distancia y rumbo (Bearing).
 * Misión: Situar la cámara con offset táctico en el modo inmersivo STREET.
 */
export function calculateDestinationPoint(
  originPosition: KinematicPosition,
  distanceMeters: number,
  bearingDegrees: number
): KinematicPosition {
  const EARTH_RADIUS_METERS = 6371000;
  const angularDistanceRadians = distanceMeters / EARTH_RADIUS_METERS;
  
  const originLatitudeRadians = (originPosition.latitude * Math.PI) / 180;
  const originLongitudeRadians = (originPosition.longitude * Math.PI) / 180;
  const bearingRadians = (bearingDegrees * Math.PI) / 180;

  const destinationLatitudeRadians = Math.asin(
    Math.sin(originLatitudeRadians) * Math.cos(angularDistanceRadians) +
    Math.cos(originLatitudeRadians) * Math.sin(angularDistanceRadians) * Math.cos(bearingRadians)
  );

  const destinationLongitudeRadians =
    originLongitudeRadians +
    Math.atan2(
      Math.sin(bearingRadians) * Math.sin(angularDistanceRadians) * Math.cos(originLatitudeRadians),
      Math.cos(angularDistanceRadians) - Math.sin(originLatitudeRadians) * Math.sin(destinationLatitudeRadians)
    );

  return {
    latitude: (destinationLatitudeRadians * 180) / Math.PI,
    longitude: (destinationLongitudeRadians * 180) / Math.PI,
  };
}

/**
 * calculateBearingBetweenPoints:
 * Calcula el ángulo azimutal (rumbo) entre dos coordenadas geográficas.
 */
export function calculateBearingBetweenPoints(
  firstPosition: KinematicPosition, 
  secondPosition: KinematicPosition
): number {
  const firstLatitudeRadians = (firstPosition.latitude * Math.PI) / 180;
  const secondLatitudeRadians = (secondPosition.latitude * Math.PI) / 180;
  const deltaLongitudeRadians = ((secondPosition.longitude - firstPosition.longitude) * Math.PI) / 180;

  const verticalComponent = Math.sin(deltaLongitudeRadians) * Math.cos(secondLatitudeRadians);
  const horizontalComponent =
    Math.cos(firstLatitudeRadians) * Math.sin(secondLatitudeRadians) -
    Math.sin(firstLatitudeRadians) * Math.cos(secondLatitudeRadians) * Math.cos(deltaLongitudeRadians);

  const bearingRadians = Math.atan2(verticalComponent, horizontalComponent);
  return ((bearingRadians * 180) / Math.PI + 360) % 360;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Build Shield Synchronization: Se renombró 'interpolateCoords' a 'interpolateCoordinates' 
 *    para resolver el error TS2724 en el CameraController.
 * 2. Zero Abbreviations Policy: Purificación absoluta de la nomenclatura matemática, 
 *    elevando la legibilidad del motor cinemático al estándar industrial V4.0.
 * 3. High Precision Math: Se mantiene el uso de constantes geodésicas (EARTH_RADIUS_METERS) 
 *    y funciones trigonométricas nativas para garantizar latencia cero en el hilo principal.
 */