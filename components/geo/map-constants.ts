// components/geo/map-constants.ts
// VERSIÓN: 5.1 (NicePod Map Assets - Final Sync Edition)
// Misión: Centralizar el ADN físico, lumínico y cinemático del motor WebGL.
// [ESTABILIZACIÓN]: Garantía de exportación nominal para getInitialViewState.

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

export const STREET_VIEW_CONFIG = {
  zoom: 17.2,
  pitch: 80,
  bearing: -15,
} as const;

/**
 * getInitialViewState: FUNCIÓN DE SEMILLA DINÁMICA
 * [MANDATO]: Debe estar exportada explícitamente para evitar ts(2724).
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

export const CAMERA_PROFILES = {
  NAVIGATE: {
    zoom: 17.8,
    pitch: 82,
    offset_distance_meters: 30,
    essential: true
  },
  INSPECT: {
    zoom: 19.2,
    pitch: 45,
    offset_distance_meters: 0,
    essential: true
  }
} as const;

export const STANDARD_ENGINE_CONFIG = {
  lightPreset: ACTIVE_MAP_THEME,
  showPointOfInterestLabels: false,
  showTransitLabels: false,
  showPlaceLabels: true,
  showRoadLabels: true,
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

export const FLY_CONFIG = {
  duration: 3200,
  essential: true,
  curve: 1.42,
  speed: 1.1,
  easing: (t: number) => t * (2 - t)
} as const;

export const ZOOM_LEVELS = {
  CITY: 13,
  NEIGHBORHOOD: 15.5,
  STREET: 17.5,
  FORGE: 18.8
} as const;