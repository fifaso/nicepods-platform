/**
 * ARCHIVO: components/geo/map-constants.ts
 * VERSIÓN: 7.0 (NicePod Map Assets - Satellite Physics & Orthogonal Precision Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Centralizar el ADN físico, lumínico y de rendimiento del motor WebGL.
 * [REFORMA V7.0]: Definición del perfil físico SATELLITE para erradicar el parpadeo
 * de cámara y asegurar una visualización cenital pura.
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

/**
 * MAP_STYLES:
 * Definición de los lienzos visuales disponibles.
 */
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
 * Configuración cenital para el nacimiento del sistema.
 */
export const INITIAL_OVERVIEW_CONFIG = {
  zoom: 15.5,
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
  LERP_FACTOR: 0.10,
  MIN_DISTANCE_THRESHOLD: 1.5,
  HEADING_SMOOTHING: 3.0,
} as const;

/**
 * PERSPECTIVE_PROFILES: Definición física de los modos de visión.
 * [REFORMA V7.0]: Introducción de SATELLITE como perfil de autoridad cenital.
 */
export const PERSPECTIVE_PROFILES = {
  STREET: {
    zoom: 18.2,
    pitch: 65,
    offset_distance_meters: 35,
    bearing_follow: true
  },
  OVERVIEW: {
    zoom: 15.5,
    pitch: 0,
    offset_distance_meters: 0,
    bearing_follow: false
  },
  /**
   * SATELLITE: Optimizado para visualización fotorrealista.
   * El pitch 0 asegura que la cámara no intente inclinar texturas 2D.
   */
  SATELLITE: {
    zoom: 17.8,               // Zoom profundo pero estable para tiles satelitales
    pitch: 0,                 // Cénit absoluto (Solución al parpadeo Imagen 5/6)
    offset_distance_meters: 0, // Cámara directamente sobre el Voyager
    bearing_follow: false     // El mapa se mantiene orientado al Norte para peritaje claro
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
  duration: 1500,
  essential: true,
  curve: 1.4,
  speed: 1.2,
  easing: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
} as const;

export const ZOOM_LEVELS = {
  CITY: 13,
  NEIGHBORHOOD: 15.5,
  STREET: 18.2,
  SATELLITE: 17.8,
  FORGE: 19.5
} as const;

/**
 * NOTA TÉCNICA DEL ARCHITECT (V7.0):
 * 1. Satellite Stability: La introducción del perfil SATELLITE con pitch 0 y 
 *    bearing_follow: false es la defensa final contra el "Snap-Back". El motor 
 *    ahora tiene un estado estable donde reposar cuando el usuario activa la 
 *    capa fotorrealista.
 * 2. Visual Cohesion: Se sincronizaron los ZOOM_LEVELS para que la transición
 *    entre el modo calle y satélite sea fluida y no cause saltos de escala bruscos.
 * 3. Contract Compliance: Este archivo provee las constantes necesarias para que 
 *    el nuevo contrato de tipos V7.1 sea plenamente operativo.
 */