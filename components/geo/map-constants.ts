/**
 * ARCHIVO: components/geo/map-constants.ts
 * VERSIÓN: 5.3 (NicePod Map Assets - Dual-Perspective Sovereignty Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Centralizar el ADN físico, lumínico y cinemático del motor WebGL.
 * [REFORMA V5.3]: Definición de perfiles físicos para STREET y OVERVIEW.
 */

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

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
 * STREET_VIEW_CONFIG: Configuración base para el nacimiento del mapa.
 */
export const STREET_VIEW_CONFIG = {
  zoom: 18.2,
  pitch: 72,
  bearing: -15,
} as const;

/**
 * getInitialViewState: Función generadora de la semilla de renderizado.
 */
export function getInitialViewState(lat?: number, lng?: number) {
  return {
    latitude: lat || MADRID_SOL_COORDS.latitude,
    longitude: lng || MADRID_SOL_COORDS.longitude,
    ...STREET_VIEW_CONFIG,
  };
}

export const KINEMATIC_CONFIG = {
  LERP_FACTOR: 0.12,
  MIN_DISTANCE_THRESHOLD: 1.5,
  HEADING_SMOOTHING: 3.0,
} as const;

/**
 * PERSPECTIVE_PROFILES: [NUEVO V5.3] 
 * Define la física de los dos modos de visión soberanos.
 */
export const PERSPECTIVE_PROFILES = {
  STREET: {
    zoom: 18.5,
    pitch: 75,                 // Inmersión profesional (Pokémon GO Style)
    offset_distance_meters: 25, // Cámara detrás del Voyager
    bearing_follow: true       // La cámara rota con el usuario
  },
  OVERVIEW: {
    zoom: 15.8,
    pitch: 0,                  // Vista Cenital Pura (Estratégica)
    offset_distance_meters: 0,  // Cámara sobre el Voyager
    bearing_follow: false      // El Norte siempre arriba (Estabilidad)
  }
} as const;

/**
 * CAMERA_PROFILES: Comportamientos según el modo de uso.
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
 * STANDARD_ENGINE_CONFIG: Configuración del motor Mapbox Standard.
 */
export const STANDARD_ENGINE_CONFIG = {
  lightPreset: ACTIVE_MAP_THEME,
  showPointOfInterestLabels: false,
  showTransitLabels: false,
  showPlaceLabels: true,
  showRoadLabels: true,
} as const;

/**
 * OCCLUSION_CONFIG: Protocolo de transparencia adaptativa.
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

export const DEM_SOURCE_CONFIG = {
  id: "mapbox-dem",
  type: "raster-dem" as const,
  url: "mapbox://mapbox.mapbox-terrain-dem-v1",
  tileSize: 512,
  maxzoom: 14
} as const;

/**
 * FLY_CONFIG: Parámetros para vuelos balísticos e inter-modales.
 */
export const FLY_CONFIG = {
  duration: 1800,
  essential: true,
  curve: 1.42,
  speed: 1.1,
  easing: (t: number) => t * (2 - t)
} as const;

export const ZOOM_LEVELS = {
  CITY: 13,
  NEIGHBORHOOD: 15.5,
  STREET: 18.2, 
  FORGE: 19.2
} as const;

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.3):
 * 1. Perspective Duality: Se formaliza PERSPECTIVE_PROFILES para desligar 
 *    la física de la calle de la física estratégica.
 * 2. Static Overview: El modo OVERVIEW se fija en Pitch 0 para optimizar 
 *    la legibilidad de la malla urbana desde el aire.
 * 3. Contract Alignment: Estos valores serán consumidos por el CameraController
 *    para ejecutar transiciones líquidas entre ambos estados.
 */