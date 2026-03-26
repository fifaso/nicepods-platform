// components/geo/map-constants.ts
// VERSIÓN: 4.0 (NicePod Map Assets - Dynamic MESH Anchor Edition)
// Misión: Proveer el ADN físico y visual para la materialización instantánea del Voyager.
// [ESTABILIZACIÓN]: Implementación de Generador de Estado Inicial y Perspectiva GO.

/**
 * ---------------------------------------------------------------------------
 * I. INFRAESTRUCTURA DE AUTORIDAD (THE METAL)
 * ---------------------------------------------------------------------------
 */

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/**
 * ESTILOS DE MALLA SOBERANA
 */
export const MAP_STYLES = {
  PHOTOREALISTIC: "mapbox://styles/mapbox/satellite-streets-v12",
  DARK_IMMERSIVE: "mapbox://styles/mapbox/dark-v11",
} as const;

/**
 * COORDENADAS DE RESCATE (FALLBACK ABSOLUTO)
 * Punto de anclaje: Puerta del Sol, Madrid.
 */
export const MADRID_SOL_COORDS = {
  latitude: 40.4167,
  longitude: -3.7037,
} as const;

/**
 * STREET_VIEW_CONFIG: El estándar visual "NicePod GO"
 * Define los ángulos de cámara innegociables para la inmersión fotorrealista.
 */
export const STREET_VIEW_CONFIG = {
  zoom: 17.2,    // Escala óptima para edificios de obsidiana
  pitch: 80,     // Inclinación agresiva de horizonte
  bearing: -15,  // Orientación táctica
} as const;

/**
 * getInitialViewState: Generador de Semilla de Cámara
 * Misión: Evitar que el mapa siempre nazca en Sol si el Voyager está en otro lugar.
 */
export const getInitialViewState = (lat?: number, lng?: number) => {
  return {
    latitude: lat || MADRID_SOL_COORDS.latitude,
    longitude: lng || MADRID_SOL_COORDS.longitude,
    ...STREET_VIEW_CONFIG,
  };
};

/**
 * CAMERA_CONSTRAINTS: Límites físicos de seguridad.
 */
export const CAMERA_CONSTRAINTS = {
  MAX_PITCH: 82,
  MIN_ZOOM: 3,
  MAX_ZOOM: 20,
  ANTIALIAS: false,
} as const;

/**
 * ---------------------------------------------------------------------------
 * II. ATMÓSFERA Y FÍSICA (THE GO-EXPERIENCE)
 * ---------------------------------------------------------------------------
 */

/**
 * TERRAIN_CONFIG: Digital Elevation Model (DEM)
 */
export const TERRAIN_CONFIG = {
  source: 'mapbox-dem',
  exaggeration: 1.2
} as const;

/**
 * FOG_CONFIG: Niebla Volumétrica Industrial
 * Optimizado para ocultar el popping de edificios y salvar ciclos de GPU.
 */
export const FOG_CONFIG = {
  "range": [0.5, 6],           // Foco estrecho sobre el Voyager
  "color": "#020202",          // Fusión con el chasis de la Workstation
  "horizon-blend": 0.25,       // Transición nítida hacia el espacio
  "high-color": "#0a0a0a",
  "space-color": "#000000",
  "star-intensity": 0.15
} as const;

/**
 * DEM_SOURCE_CONFIG: Fuente de datos para el relieve.
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
 * IV. CINEMATOGRAFÍA DE VUELO (FLIGHT PHYSICS)
 * ---------------------------------------------------------------------------
 */

export const FLY_CONFIG = {
  duration: 3500,
  essential: true,
  curve: 1.4,
  speed: 1.2,
  easing: (t: number) => t * (2 - t) 
} as const;

export const ZOOM_LEVELS = {
  CITY: 13,
  NEIGHBORHOOD: 15.5,
  STREET: 17.5,
  FORGE: 18.8
} as const;

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Semilla Dinámica: Se reemplazó el objeto estático INITIAL_VIEW_STATE por 
 *    la función 'getInitialViewState'. Esto permite que el mapa nazca en la 
 *    ubicación real del usuario (vía Geo-IP o caché) desde el primer render.
 * 2. Inmersión Forzada: Se integró 'STREET_VIEW_CONFIG' para asegurar que 
 *    cualquier materialización use el ángulo Pokémon GO (Pitch 80°) por defecto.
 * 3. Optimización de Niebla: Se redujo el 'horizon-blend' a 0.25 para mejorar 
 *    el rendimiento de la GPU en dispositivos móviles al ocluir texturas lejanas.
 * 4. Rigor NCIS: Se mantiene el uso de 'as const' para blindar el Build Shield.
 */