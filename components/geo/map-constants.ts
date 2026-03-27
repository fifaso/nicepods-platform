//components/geo/map-constants.ts
/**
 * NICEPOD V5.2 - MAP CONSTANTS (CINEMATIC STREET-LEVEL EDITION)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Centralizar el ADN físico, lumínico y cinemático del motor WebGL.
 * [MEJORA]: Recalibración de perfiles para evitar oclusión por edificios 3D.
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
 * [RECALIBRACIÓN V5.2]: Zoom más profundo y Pitch suavizado para evitar muros.
 */
export const STREET_VIEW_CONFIG = {
  zoom: 18.2,      // Incrementado de 17.2 para mayor detalle de calle
  pitch: 72,       // Reducido de 80 para una perspectiva más natural de horizonte
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
 * CAMERA_PROFILES: Comportamientos específicos según el modo de uso.
 * [RECALIBRACIÓN V5.2]: 
 * - NAVIGATE: Pitch de 75° y Offset de 25m para ver "el hueco de la calle".
 * - INSPECT: Enfoque vertical para captura de puntos.
 */
export const CAMERA_PROFILES = {
  NAVIGATE: {
    zoom: 18.5,
    pitch: 75,                // Reducido de 82 para evitar oclusión por edificios frontales
    offset_distance_meters: 25, // Reducido de 30 para mantener la cámara más cerca del eje del Voyager
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
 * STANDARD_ENGINE_CONFIG: Configuración del motor de renderizado Mapbox Standard.
 * [PROTOCOLO SILENCIO URBANO]: Purga de etiquetas comerciales.
 */
export const STANDARD_ENGINE_CONFIG = {
  lightPreset: ACTIVE_MAP_THEME,
  showPointOfInterestLabels: false,
  showTransitLabels: false,
  showPlaceLabels: true,
  showRoadLabels: true,
} as const;

/**
 * OCCLUSION_CONFIG: [NUEVO] Protocolo de transparencia adaptativa.
 * Define cómo deben comportarse los edificios frente al Voyager.
 */
export const OCCLUSION_CONFIG = {
  puckOcclusion: 'occluded', // 'occluded' permite que el Voyager se vea a través de muros
  buildingOpacity: 0.85,     // Suavizado general de la malla de obsidiana
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
 * [AJUSTE V5.2]: Vuelos más cortos (1.8s) para mayor agilidad.
 */
export const FLY_CONFIG = {
  duration: 1800, // Reducido de 3200 para transiciones balísticas tácticas
  essential: true,
  curve: 1.42,
  speed: 1.1,
  easing: (t: number) => t * (2 - t)
} as const;

export const ZOOM_LEVELS = {
  CITY: 13,
  NEIGHBORHOOD: 15.5,
  STREET: 18.2, // Sincronizado con STREET_VIEW_CONFIG
  FORGE: 19.2
} as const;