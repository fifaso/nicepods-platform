// components/geo/map-constants.ts
// VERSIÓN: 1.0 (NicePod Map Assets - Immutable Configuration Edition)
// Misión: Centralizar configuraciones WebGL para garantizar la inmutabilidad del motor v3.
// [ESTABILIZACIÓN]: Prevención de colisiones de Source/Terrain mediante referencias estáticas.


/**
 * ---------------------------------------------------------------------------
 * I. INFRAESTRUCTURA BASE
 * ---------------------------------------------------------------------------
 */

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/**
 * ESTILOS DE MALLA SOBERANA
 * PHOTOREALISTIC: Base satelital para máxima fidelidad (Forja y Exploración).
 * DARK_IMMERSIVE: Base sintética para visualización de datos nocturna.
 */
export const MAP_STYLES = {
  PHOTOREALISTIC: "mapbox://styles/mapbox/satellite-streets-v12",
  DARK_IMMERSIVE: "mapbox://styles/mapbox/dark-v11",
};

/**
 * CONFIGURACIÓN DE CÁMARA T0 (Nacimiento del Mapa)
 * Punto de anclaje inicial: Puerta del Sol, Madrid.
 * Zoom 14.5: Equilibrio óptimo entre carga de tiles y contexto urbano.
 */
export const INITIAL_VIEW_STATE = {
  latitude: 40.4167,
  longitude: -3.7037,
  zoom: 14.5,
  pitch: 0,
  bearing: 0,
};

/**
 * ---------------------------------------------------------------------------
 * II. ATMÓSFERA Y FÍSICA (THE GO-EXPERIENCE)
 * ---------------------------------------------------------------------------
 * Estos objetos son inmutables para evitar el error 'Source cannot be removed'.
 */

/**
 * TERRAIN_CONFIG: Modelo de Elevación Digital (DEM)
 * Provee el relieve 3D a la ciudad de Madrid.
 */
export const TERRAIN_CONFIG = {
  source: 'mapbox-dem',
  exaggeration: 1.2
};

/**
 * FOG_CONFIG: Niebla Volumétrica y Horizonte
 * Crea el efecto de profundidad Pokémon GO y ahorra GPU ocluyendo el horizonte.
 */
export const FOG_CONFIG = {
  "range": [0.5, 10],
  "color": "#020202",
  "horizon-blend": 0.2,
  "high-color": "#1e293b",
  "space-color": "#000000",
  "star-intensity": 0.5
};

/**
 * DEM_SOURCE_CONFIG: Fuente de datos para el terreno
 */
export const DEM_SOURCE_CONFIG = {
  id: "mapbox-dem",
  type: "raster-dem" as const,
  url: "mapbox://mapbox.mapbox-terrain-dem-v1",
  tileSize: 512,
  maxzoom: 14
};

/**
 * ---------------------------------------------------------------------------
 * III. CAPAS ARQUITECTÓNICAS (OBSIDIANA GLASS)
 * ---------------------------------------------------------------------------
 */

/**
 * BUILDING_LAYER_STYLE: Extrusiones 3D
 * Renderiza los edificios como cristales translúcidos sobre el satélite.
 */
export const BUILDING_LAYER_STYLE = {
  id: "3d-buildings-sovereign",
  source: "composite",
  "source-layer": "building",
  filter: ["==", "extrude", "true"],
  type: "fill-extrusion" as const,
  minzoom: 14,
  paint: {
    "fill-extrusion-color": "#050505", // Negro abismal industrial
    "fill-extrusion-height": ["get", "height"],
    "fill-extrusion-base": ["get", "min_height"],
    "fill-extrusion-opacity": 0.75, // Transparencia premium
  },
};

/**
 * ---------------------------------------------------------------------------
 * IV. CINEMATOGRAFÍA DE VUELO (FLIGHT PHYSICS)
 * ---------------------------------------------------------------------------
 */

/**
 * FLY_CONFIG: Parámetros de salto táctico
 */
export const FLY_CONFIG = {
  duration: 3500,
  essential: true,
  curve: 1.4,
  easing: (t: number) => t * (2 - t)
};

/**
 * ZOOM_LEVELS: Estándares de proximidad
 */
export const ZOOM_LEVELS = {
  CITY: 13,
  NEIGHBORHOOD: 15.5,
  STREET: 17.5,
  FORGE: 18.8
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V1.0):
 * 1. Inmutabilidad Garantizada: Al estar definidos fuera del ámbito de React,
 *    estos objetos no cambian su referencia (id en memoria) entre renders.
 * 2. Cero redundancia: Cualquier componente de mapa (Preview o Principal) 
 *    debe importar estas constantes, asegurando una estética coherente.
 * 3. Preparado para v3: Todas las propiedades de atmósfera (Fog) y 
 *    terreno (Terrain) cumplen con el esquema de Mapbox GL JS v3.x.
 */