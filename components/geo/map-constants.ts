// components/geo/map-constants.ts
// VERSIÓN: 2.0 (NicePod Map Assets - Industrial Configuration & Inmersive Edition)
// Misión: Centralizar configuraciones WebGL para garantizar la inmutabilidad del motor v3.
// [ESTABILIZACIÓN]: Soporte para Pokémon GO Style, Silencio Urbano y Hot-Swap T0.

/**
 * ---------------------------------------------------------------------------
 * I. INFRAESTRUCTURA DE AUTORIDAD
 * ---------------------------------------------------------------------------
 */

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/**
 * ESTILOS DE MALLA SOBERANA
 * PHOTOREALISTIC: Base satelital para máxima fidelidad (Forja y Exploración).
 */
export const MAP_STYLES = {
  PHOTOREALISTIC: "mapbox://styles/mapbox/satellite-streets-v12",
  DARK_IMMERSIVE: "mapbox://styles/mapbox/dark-v11",
} as const;

/**
 * CONFIGURACIÓN DE CÁMARA T0 (ANCLA DE SEGURIDAD)
 * Punto de anclaje inicial: Puerta del Sol, Madrid.
 * [MANDATO]: Este objeto sirve de fallback si el GPS y el Geo-IP fallan simultáneamente.
 */
export const INITIAL_VIEW_STATE = {
  latitude: 40.4167,
  longitude: -3.7037,
  zoom: 14.5,
  pitch: 0,
  bearing: 0,
} as const;

/**
 * ---------------------------------------------------------------------------
 * II. ATMÓSFERA Y FÍSICA (THE GO-EXPERIENCE)
 * ---------------------------------------------------------------------------
 */

/**
 * TERRAIN_CONFIG: Modelo de Elevación Digital (DEM)
 * Provee el relieve 3D a la malla urbana.
 */
export const TERRAIN_CONFIG = {
  source: 'mapbox-dem',
  exaggeration: 1.2
} as const;

/**
 * FOG_CONFIG: Niebla Volumétrica y Profundidad de Campo
 * Crea el efecto Pokémon GO ocultando el horizonte y ahorrando VRAM.
 */
export const FOG_CONFIG = {
  "range": [0.8, 8],
  "color": "#020202",
  "horizon-blend": 0.3,
  "high-color": "#0a0a0a",
  "space-color": "#000000",
  "star-intensity": 0.15
} as const;

/**
 * DEM_SOURCE_CONFIG: Fuente de datos para el relieve
 */
export const DEM_SOURCE_CONFIG = {
  id: "mapbox-dem",
  type: "raster-dem" as const,
  url: "mapbox://mapbox.mapbox-terrain-dem-v1",
  tileSize: 512,
  maxzoom: 14
} as const;

/**
 * ---------------------------------------------------------------------------
 * III. CAPAS ARQUITECTÓNICAS (OBSIDIANA GLASS)
 * ---------------------------------------------------------------------------
 */

/**
 * BUILDING_LAYER_STYLE: Extrusiones 3D
 * Renderiza los edificios como cristales translúcidos sobre el satélite.
 * [ESTÉTICA]: Negro abismal con opacidad técnica (0.75).
 */
export const BUILDING_LAYER_STYLE = {
  id: "3d-buildings-sovereign",
  source: "composite",
  "source-layer": "building",
  filter: ["==", "extrude", "true"],
  type: "fill-extrusion" as const,
  minzoom: 14,
  paint: {
    "fill-extrusion-color": "#050505", 
    "fill-extrusion-height": ["get", "height"],
    "fill-extrusion-base": ["get", "min_height"],
    "fill-extrusion-opacity": 0.75,
  },
} as const;

/**
 * ---------------------------------------------------------------------------
 * IV. CINEMATOGRAFÍA Y TELEMETRÍA (FLIGHT PHYSICS)
 * ---------------------------------------------------------------------------
 */

/**
 * FLY_CONFIG: Parámetros de aproximación aérea cinemática.
 */
export const FLY_CONFIG = {
  duration: 3500,
  essential: true,
  curve: 1.4,
  speed: 1.2,
  easing: (t: number) => t * (2 - t) // Interpolación cuadrática suave
} as const;

/**
 * ZOOM_LEVELS: Estándares de proximidad para el Radar.
 */
export const ZOOM_LEVELS = {
  CITY: 13,
  NEIGHBORHOOD: 15.5,
  STREET: 17.5,
  FORGE: 18.8
} as const;

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Inmutabilidad Garantizada: El uso masivo de 'as const' previene que React
 *    intente realizar comparaciones profundas de objetos, ahorrando ciclos de CPU.
 * 2. Preparado para Materialización: El SpatialEngine consumirá estas constantes
 *    pero el orquestador tiene la autoridad para inyectar las coordenadas 
 *    provenientes del Geo-IP de Vercel como punto de arranque real.
 * 3. Consistencia Visual: Todas las propiedades de niebla y edificios están 
 *    sincronizadas para evitar el 'popping' de texturas durante el vuelo inicial.
 */