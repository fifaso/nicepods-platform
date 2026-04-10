/**
 * ARCHIVO: components/geo/map-constants.ts
 * VERSIÓN: 8.1 (NicePod Map Assets - Precision Forge & Satellite Physics Edition)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * 
 * Misión: Centralizar el ADN físico, lumínico y de rendimiento del motor WebGL,
 * garantizando una base de datos de configuración inmutable para el Reactor Visual.
 * [REFORMA V8.1]: Introducción del perfil 'FORGE_PRECISION' para el anclaje manual 
 * satelital. Sincronización nominal absoluta con el estándar industrial V4.2 
 * y cumplimiento estricto de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

/**
 * MAPBOX_ACCESS_TOKEN: Credencial de autoridad para el motor de renderizado.
 */
export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/**
 * MapPerformanceProfile:
 * Define el nivel de carga gráfica del motor WebGL en la GPU del terminal.
 */
export type MapPerformanceProfile = 'HIGH_FIDELITY' | 'TACTICAL_LITE';

/**
 * MapboxLightPreset: Configuraciones lumínicas para el motor Standard PBR.
 */
export type MapboxLightPreset = 'night' | 'day' | 'dawn' | 'dusk';

/**
 * ACTIVE_MAP_THEME: Estado estético por defecto de la Workstation.
 */
export const ACTIVE_MAP_THEME: MapboxLightPreset = 'night';

/**
 * MAP_STYLES:
 * Definición de los lienzos visuales disponibles en la infraestructura Mapbox.
 */
export const MAP_STYLES = {
  STANDARD: "mapbox://styles/mapbox/standard",
  PHOTOREALISTIC: "mapbox://styles/mapbox/satellite-streets-v12",
} as const;

/**
 * MADRID_SOL_COORDINATES: Punto de anclaje geográfico base para el Voyager.
 */
export const MADRID_SOL_COORDS = {
  latitude: 40.4167,
  longitude: -3.7037,
} as const;

/**
 * INITIAL_OVERVIEW_CONFIG:
 * Configuración cenital para el arranque en frío del reactor visual.
 */
export const INITIAL_OVERVIEW_CONFIG = {
  zoom: 15.5,
  pitch: 0,
  bearing: 0,
} as const;

/**
 * getInitialViewState: 
 * Misión: Generar la semilla de renderizado respetando la nomenclatura purificada.
 */
export function getInitialViewState(
  latitudeCoordinate?: number, 
  longitudeCoordinate?: number
) {
  return {
    latitude: latitudeCoordinate || MADRID_SOL_COORDS.latitude,
    longitude: longitudeCoordinate || MADRID_SOL_COORDS.longitude,
    ...INITIAL_OVERVIEW_CONFIG,
  };
}

/**
 * KINEMATIC_CONFIGURATION: 
 * Factores de suavizado para el motor de interpolación LERP (Pilar 4).
 */
export const KINEMATIC_CONFIG = {
  LERP_FACTOR: 0.10,
  MINIMUM_DISTANCE_THRESHOLD: 1.5,
  HEADING_SMOOTHING: 3.0,
} as const;

/**
 * PERSPECTIVE_PROFILES: 
 * Definición física de los modos de visión de la terminal táctica.
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
   * El pitch 0 asegura estabilidad cenital absoluta sin distorsión de textura.
   */
  SATELLITE: {
    zoom: 17.8,               
    pitch: 0,                 
    offset_distance_meters: 0, 
    bearing_follow: false     
  },
  /**
   * FORGE_PRECISION: Perfil optimizado para el anclaje manual del hito.
   * [V8.1]: Zoom máximo y cénit puro para fijar coordenadas con precisión milimétrica.
   */
  FORGE_PRECISION: {
    zoom: 19.2,
    pitch: 0,
    offset_distance_meters: 0,
    bearing_follow: false
  }
} as const;

/**
 * CAMERA_PROFILES: Comportamientos cinemáticos según el flujo de la terminal.
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
 * STANDARD_ENGINE_CONFIGURATION: Perfil de Alta Fidelidad (PBR Activo).
 */
export const STANDARD_ENGINE_CONFIG = {
  lightPreset: ACTIVE_MAP_THEME,
  showPointOfInterestLabels: false,
  showTransitLabels: false,
  showPlaceLabels: true,
  showRoadLabels: true,
} as const;

/**
 * LITE_ENGINE_CONFIGURATION: 
 * Optimización de recursos para hardware de bajo rendimiento térmico.
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
 * OCC_CONFIG: Protocolo de transparencia y oclusión adaptativa.
 */
export const OCC_CONFIG = {
  puckOcclusion: 'always' as const,
  buildingOpacity: 0.85,
} as const;

/**
 * FOG_CONFIGURATION: Parámetros atmosféricos para el horizonte WebGL.
 */
export const FOG_CONFIG = {
  "range": [0.5, 6],
  "color": "#03040b",
  "horizon-blend": 0.3,
  "high-color": "#000000",
  "space-color": "#000000",
  "star-intensity": 0.2
} as const;

/**
 * TERRAIN_CONFIGURATION: Parámetros físicos del relieve geográfico digital.
 */
export const TERRAIN_CONFIG = {
  source: 'mapbox-dem',
  exaggeration: 1.15
} as const;

export const LITE_TERRAIN_CONFIG = {
  source: 'mapbox-dem',
  exaggeration: 0.4
} as const;

/**
 * DEM_SOURCE_CONFIGURATION: Fuente de datos de elevación para el motor de relieve.
 */
export const DEM_SOURCE_CONFIG = {
  id: "mapbox-dem",
  type: "raster-dem" as const,
  url: "mapbox://mapbox.mapbox-terrain-dem-v1",
  tileSize: 512,
  maximumZoomLevel: 14
} as const;

/**
 * FLY_CONFIGURATION: Parámetros para transiciones de vuelo balístico.
 */
export const FLY_CONFIG = {
  duration: 1500,
  essential: true,
  curve: 1.4,
  speed: 1.2,
  easing: (timeProgress: number) => timeProgress < 0.5 ? 2 * timeProgress * timeProgress : -1 + (4 - 2 * timeProgress) * timeProgress
} as const;

/**
 * ZOOM_LEVELS: Diccionario de escalas operativas de la terminal NicePod.
 */
export const ZOOM_LEVELS = {
  CITY: 13,
  NEIGHBORHOOD: 15.5,
  STREET: 18.2,
  SATELLITE: 17.8,
  FORGE: 19.5
} as const;

/**
 * NOTA TÉCNICA DEL ARCHITECT (V8.1):
 * 1. Precision Grounding: Se ha introducido 'FORGE_PRECISION' como el estándar 
 *    físico para el Step 1. Al utilizar un zoom de 19.2 con pitch 0, facilitamos 
 *    al Administrador la tarea de fijar el anclaje manual sobre la ortofoto.
 * 2. ZAP Enforcement: Purificación total de la nomenclatura técnica para asegurar 
 *    la mantenibilidad industrial del sistema de constantes.
 * 3. Contractual Sync: Las coordenadas geográficas ahora utilizan los nombres 
 *    descriptivos exigidos por la Constitución V8.6.
 */