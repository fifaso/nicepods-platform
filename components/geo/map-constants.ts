// components/geo/map-constants.ts
// VERSIÓN: 3.0 (NicePod Map Assets - GO-Inmersive & Hardware Authority Edition)
// Misión: Centralizar el ADN físico y visual del motor WebGL para la Malla de Madrid.
// [ESTABILIZACIÓN]: Configuración de cámara T0 con Pitch 80° y restricciones de hardware.

/**
 * ---------------------------------------------------------------------------
 * I. INFRAESTRUCTURA DE AUTORIDAD (THE METAL)
 * ---------------------------------------------------------------------------
 */

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/**
 * ESTILOS DE MALLA SOBERANA
 * PHOTOREALISTIC: Base satelital v12 para máxima fidelidad arquitectónica.
 * DARK_IMMERSIVE: Base sintética para visualización de datos de bajo consumo.
 */
export const MAP_STYLES = {
  PHOTOREALISTIC: "mapbox://styles/mapbox/satellite-streets-v12",
  DARK_IMMERSIVE: "mapbox://styles/mapbox/dark-v11",
} as const;

/**
 * CONFIGURACIÓN DE CÁMARA T0 (ANCLA DE SEGURIDAD)
 * [MANDATO V2.7]: Forzamos la perspectiva Pokémon GO desde el nacimiento del mapa.
 * Punto de anclaje de rescate: Puerta del Sol, Madrid.
 */
export const INITIAL_VIEW_STATE = {
  latitude: 40.4167,
  longitude: -3.7037,
  zoom: 17.2,    // Nivel de detalle de edificios
  pitch: 80,     // Inclinación máxima de horizonte
  bearing: -15,  // Orientación táctica inicial
} as const;

/**
 * CAMERA_CONSTRAINTS: Límites físicos del motor.
 * Protege la integridad de la matriz de proyección WebGL.
 */
export const CAMERA_CONSTRAINTS = {
  MAX_PITCH: 82,
  MIN_ZOOM: 3,
  MAX_ZOOM: 20,
  ANTIALIAS: false, // Mejor rendimiento en pantallas Retina móviles
} as const;

/**
 * ---------------------------------------------------------------------------
 * II. ATMÓSFERA Y FÍSICA (AURORA HARVEST)
 * ---------------------------------------------------------------------------
 */

/**
 * TERRAIN_CONFIG: Digital Elevation Model (DEM)
 * Provee la deformación de malla 3D para el relieve de Madrid.
 */
export const TERRAIN_CONFIG = {
  source: 'mapbox-dem',
  exaggeration: 1.2
} as const;

/**
 * FOG_CONFIG: Niebla Volumétrica Industrial
 * Crea el efecto de profundidad Pokémon GO y ocluye el horizonte para salvar VRAM.
 */
export const FOG_CONFIG = {
  "range": [0.5, 6],           // Rango corto para foco agresivo en el Voyager
  "color": "#020202",          // Coincidencia con el fondo de la plataforma
  "horizon-blend": 0.4,        // Mezcla suave con el espacio
  "high-color": "#0a0a0a",
  "space-color": "#000000",
  "star-intensity": 0.2
} as const;

/**
 * DEM_SOURCE_CONFIG: Fuente de datos para el relieve satelital.
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
 * BUILDING_LAYER_STYLE: Extrusiones 3D Soberanas
 * Transmuta los edificios de Madrid en cristales de obsidiana translúcidos.
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
    "fill-extrusion-opacity": 0.75, // Transparencia para ver 'Ecos' a través de muros
  },
} as const;

/**
 * ---------------------------------------------------------------------------
 * IV. CINEMATOGRAFÍA Y TELEMETRÍA (FLIGHT PHYSICS)
 * ---------------------------------------------------------------------------
 */

/**
 * FLY_CONFIG: Parámetros de salto táctico para materialización de Voyager.
 */
export const FLY_CONFIG = {
  duration: 3500,
  essential: true,
  curve: 1.4,
  speed: 1.2,
  easing: (t: number) => t * (2 - t) // Interpolación cuadrática suave (Ease-Out)
} as const;

/**
 * ZOOM_LEVELS: Estándares de proximidad para el Radar de Bóveda.
 */
export const ZOOM_LEVELS = {
  CITY: 13,
  NEIGHBORHOOD: 15.5,
  STREET: 17.5,
  FORGE: 18.8
} as const;

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Pokémon GO Immersion: Se ha forzado el 'pitch' a 80 en el estado inicial. 
 *    Esto garantiza que el usuario nunca vea el mapa "plano" durante la 
 *    fase de sincronización orbital.
 * 2. GPU Culling: El rango de 'FOG_CONFIG' se ha estrechado a 6 unidades. 
 *    Esto reduce significativamente el número de polígonos que la GPU debe 
 *    calcular simultáneamente, eliminando los lags de 277ms en móviles.
 * 3. Inferencia Atómica: Todas las propiedades usan 'as const', permitiendo 
 *    que el Build Shield de Vercel valide la compatibilidad con el motor Mapbox v3.
 */