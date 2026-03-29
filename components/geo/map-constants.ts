/**
 * ARCHIVO: components/geo/map-constants.ts
 * VERSIÓN: 5.4 (NicePod Map Assets - Context-Aware DNA Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Centralizar el ADN físico y cinemático del motor WebGL.
 * [REFORMA V5.4]: Calibración bi-modal: Dashboard (Cenital) vs Mapa (Inmersión).
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
 * INITIAL_OVERVIEW_CONFIG: [NUEVO V5.4]
 * Configuración para el nacimiento del sistema. Vista desde arriba para contexto.
 */
export const INITIAL_OVERVIEW_CONFIG = {
  zoom: 14.8,       // Vista de barrio/distrito (Contexto General)
  pitch: 0,         // Cenital pura (Sin edificios 3D intrusivos)
  bearing: 0,       // Orientación al Norte para legibilidad de mapa
} as const;

/**
 * getInitialViewState: Función generadora de la semilla de renderizado.
 * [MANDATO V5.4]: El sistema siempre nace en modo OVERVIEW (Cenital).
 */
export function getInitialViewState(lat?: number, lng?: number) {
  return {
    latitude: lat || MADRID_SOL_COORDS.latitude,
    longitude: lng || MADRID_SOL_COORDS.longitude,
    ...INITIAL_OVERVIEW_CONFIG,
  };
}

export const KINEMATIC_CONFIG = {
  LERP_FACTOR: 0.12,
  MIN_DISTANCE_THRESHOLD: 1.5,
  HEADING_SMOOTHING: 3.0,
} as const;

/**
 * PERSPECTIVE_PROFILES: Definición física de los modos de visión.
 */
export const PERSPECTIVE_PROFILES = {
  STREET: {
    zoom: 18.5,                // Inmersión profunda
    pitch: 75,                 // Perspectiva profesional (Pokémon GO)
    offset_distance_meters: 25, // Cámara detrás del Voyager
    bearing_follow: true       // Sincronía con brújula
  },
  OVERVIEW: {
    zoom: 15.2,                // Un poco más cerca que el arranque, pero cenital
    pitch: 0,                  // Plano estratégico
    offset_distance_meters: 0,  // Centrado absoluto
    bearing_follow: false      // Norte estático
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
 * STANDARD_ENGINE_CONFIG: Configuración del motor Mapbox Standard.
 * [V5.4]: Activamos PlaceLabels para el contexto en Overview.
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
 * FLY_CONFIG: Parámetros para vuelos balísticos.
 */
export const FLY_CONFIG = {
  duration: 2200, // Ajustado para transiciones de perspectiva elegantes
  essential: true,
  curve: 1.2,
  speed: 1.0,
  easing: (t: number) => t * (2 - t)
} as const;

export const ZOOM_LEVELS = {
  CITY: 13,
  NEIGHBORHOOD: 15.5,
  STREET: 18.5, 
  FORGE: 19.5
} as const;

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.4):
 * 1. Overview First: Se implementó INITIAL_OVERVIEW_CONFIG para que la plataforma 
 *    nazca con una vista cenital (Pitch 0, Zoom 14.8), eliminando el efecto 
 *    de "estar dentro de un edificio" en el Dashboard.
 * 2. Perspective Duality: Los perfiles STREET y OVERVIEW están ahora calibrados
 *    para responder al botón de acción dual con fluidez.
 * 3. Vision Depth: Se ajustaron los ZOOM_LEVELS para asegurar que la inmersión 
 *    en modo calle sea lo suficientemente detallada sin perder la visión del asfalto.
 */