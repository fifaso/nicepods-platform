/**
 * ARCHIVO: components/geo/map-constants.ts
 * VERSIÓN: 6.0 (NicePod Map Assets - Tactical Calibration & Perspective Breath Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Centralizar el ADN físico, lumínico y de rendimiento del motor WebGL.
 * [REFORMA V6.0]: Recalibración de perfiles STREET para evitar el encajonamiento por edificios 3D
 * y optimización de curvas de vuelo balístico.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/**
 * MapPerformanceProfile:
 * Define el nivel de carga gráfica del motor WebGL.
 */
export type MapPerformanceProfile = 'HIGH_FIDELITY' | 'TACTICAL_LITE';

export type MapboxLightPreset = 'night' | 'day' | 'dawn' | 'dusk';

export const ACTIVE_MAP_THEME: MapboxLightPreset = 'night';

export const MAP_STYLES = {
  STANDARD: "mapbox://styles/mapbox/standard",
  PHOTOREALISTIC: "mapbox://styles/mapbox/satellite-streets-v12",
} as const;

export const MADRID_SOL_COORDS = {
  latitude: 40.4167,
  longitude: -3.7037,
} as const;

/**
 * INITIAL_OVERVIEW_CONFIG:
 * Configuración cenital para el nacimiento del sistema (Contexto General).
 */
export const INITIAL_OVERVIEW_CONFIG = {
  zoom: 15.5, // [V6.0]: Aumentado ligeramente para mejor legibilidad de calles
  pitch: 0,
  bearing: 0,
} as const;

/**
 * getInitialViewState: Función generadora de la semilla de renderizado.
 */
export function getInitialViewState(lat?: number, lng?: number) {
  return {
    latitude: lat || MADRID_SOL_COORDS.latitude,
    longitude: lng || MADRID_SOL_COORDS.longitude,
    ...INITIAL_OVERVIEW_CONFIG,
  };
}

/**
 * KINEMATIC_CONFIG: 
 * Factores de suavizado para el motor LERP.
 */
export const KINEMATIC_CONFIG = {
  LERP_FACTOR: 0.10, // [V6.0]: Calibrado para el nuevo cálculo Delta-Time del CameraController
  MIN_DISTANCE_THRESHOLD: 1.5,
  HEADING_SMOOTHING: 3.0,
} as const;

/**
 * PERSPECTIVE_PROFILES: Definición física de los modos de visión.
 * [REFORMA V6.0]: STREET ha sido suavizado para permitir "respirar" a la cámara entre edificios.
 */
export const PERSPECTIVE_PROFILES = {
  STREET: {
    zoom: 18.2,               // Un paso atrás para ganar contexto
    pitch: 65,                // Menos agresivo para evitar colisiones visuales con techos
    offset_distance_meters: 35, // Más distancia desde el avatar para ver la trayectoria
    bearing_follow: true
  },
  OVERVIEW: {
    zoom: 15.5,
    pitch: 0,
    offset_distance_meters: 0,
    bearing_follow: false
  }
} as const;

/**
 * CAMERA_PROFILES: Comportamientos según el flujo de la Workstation.
 */
export const CAMERA_PROFILES = {
  NAVIGATE: {
    ...PERSPECTIVE_PROFILES.STREET,
    essential: true
  },
  INSPECT: {
    zoom: 19.5,
    pitch: 45,
    offset_distance_meters: 0,
    essential: true
  }
} as const;

/**
 * STANDARD_ENGINE_CONFIG: Perfil de Alta Fidelidad (PBR Activo).
 * Optimizado para el visor principal y modo exploración.
 */
export const STANDARD_ENGINE_CONFIG = {
  lightPreset: ACTIVE_MAP_THEME,
  showPointOfInterestLabels: false,
  showTransitLabels: false,
  showPlaceLabels: true,
  showRoadLabels: true,
} as const;

/**
 * LITE_ENGINE_CONFIG: 
 * Misión: Máxima velocidad en fase de creación.
 */
export const LITE_ENGINE_CONFIG = {
  lightPreset: ACTIVE_MAP_THEME,
  showPointOfInterestLabels: false,
  showTransitLabels: false,
  showPlaceLabels: false,
  showRoadLabels: true,
  buildingOpacity: 0.4,
} as const;

/**
 * OCCLUSION_CONFIG: Protocolo de transparencia adaptativa nativa de Mapbox v3.
 */
export const OCCLUSION_CONFIG = {
  puckOcclusion: 'occluded',
  buildingOpacity: 0.85,
} as const;

export const FOG_CONFIG = {
  "range": [0.5, 6],
  "color": "#03040b",
  "horizon-blend": 0.3,
  "high-color": "#000000",
  "space-color": "#000000",
  "star-intensity": 0.2
} as const;

export const TERRAIN_CONFIG = {
  source: 'mapbox-dem',
  exaggeration: 1.15
} as const;

/**
 * LITE_TERRAIN_CONFIG: 
 * Relieve suavizado para mayor estabilidad en el anclaje manual.
 */
export const LITE_TERRAIN_CONFIG = {
  source: 'mapbox-dem',
  exaggeration: 0.4
} as const;

export const DEM_SOURCE_CONFIG = {
  id: "mapbox-dem",
  type: "raster-dem" as const,
  url: "mapbox://mapbox.mapbox-terrain-dem-v1",
  tileSize: 512,
  maxzoom: 14
} as const;

/**
 * FLY_CONFIG: Parámetros para vuelos balísticos.
 * [V6.0]: Aceleración táctica para una respuesta de botón instantánea.
 */
export const FLY_CONFIG = {
  duration: 1500, // [V6.0]: Más rápido para reducir la espera del usuario
  essential: true,
  curve: 1.4,     // Curva más pronunciada para un efecto de "salto"
  speed: 1.2,
  easing: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t // Quad Ease-In-Out
} as const;

export const ZOOM_LEVELS = {
  CITY: 13,
  NEIGHBORHOOD: 15.5,
  STREET: 18.2,
  FORGE: 19.5
} as const;

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Building Clearance: Al reducir el pitch de 75 a 65, se soluciona el problema 
 *    de oclusión masiva en calles estrechas de Madrid, permitiendo que el avatar
 *    tenga un cono de visión más natural.
 * 2. Tactical Velocity: El ajuste de FLY_CONFIG elimina la sensación de "lentitud" 
 *    al pulsar el botón de ubicación, otorgando al Voyager una respuesta visual 
 *    inmediata bajo el estándar Zero-Wait.
 * 3. Delta-Time Alignment: LERP_FACTOR re-calibrado para compensar el nuevo 
 *    algoritmo del Camera Director.
 */