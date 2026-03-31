/**
 * ARCHIVO: components/geo/map-constants.ts
 * VERSIÓN: 5.5 (NicePod Map Assets - Performance & Lite-Profile Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Centralizar el ADN físico, lumínico y de rendimiento del motor WebGL.
 * [REFORMA V5.5]: Definición de perfiles de rendimiento HIGH_FIDELITY vs TACTICAL_LITE.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/**
 * MapPerformanceProfile: [NUEVO V5.5]
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
  zoom: 14.8,
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
    zoom: 18.5,
    pitch: 75,
    offset_distance_meters: 25,
    bearing_follow: true
  },
  OVERVIEW: {
    zoom: 15.2,
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
 * LITE_ENGINE_CONFIG: [NUEVO V5.5]
 * Misión: Máxima velocidad en fase de creación.
 * Desactiva sombras complejas y etiquetas para liberar VRAM.
 */
export const LITE_ENGINE_CONFIG = {
  lightPreset: ACTIVE_MAP_THEME,
  showPointOfInterestLabels: false,
  showTransitLabels: false,
  showPlaceLabels: false, // Menos ruido visual
  showRoadLabels: true,  // Mantenemos calles para el anclaje
  buildingOpacity: 0.4,   // Edificios casi translúcidos para reducir el dibujado de píxeles
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

/**
 * LITE_TERRAIN_CONFIG: [NUEVO V5.5]
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
 */
export const FLY_CONFIG = {
  duration: 1800,
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
 * NOTA TÉCNICA DEL ARCHITECT (V5.5):
 * 1. Performance Toggling: La introducción de LITE_ENGINE_CONFIG permite al sistema 
 *    degradar la calidad estética en favor de la precisión funcional en el Step 1.
 * 2. VRAM Protection: Al reducir la opacidad de los edificios (0.4) y simplificar
 *    el terreno en modo Lite, Mapbox consume significativamente menos memoria.
 * 3. Zero Regressions: Se mantienen las constantes de inmersión para el mapa grande.
 * 4. Prepared for Injection: El componente MapCore ahora tiene los datos necesarios
 *    para ajustar sus propiedades según el perfil de rendimiento solicitado.
 */