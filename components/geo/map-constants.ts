// components/geo/map-constants.ts
// VERSIÓN: 4.1 (NicePod Map Assets - Mapbox Standard & High-Fidelity Edition)
// Misión: Centralizar el ADN físico y visual del motor WebGL con soporte Standard.
// [ESTABILIZACIÓN]: Implementación de Iluminación PBR, Fog Deep-Space y Semilla Dinámica.

/**
 * ---------------------------------------------------------------------------
 * I. INFRAESTRUCTURA DE AUTORIDAD (THE METAL)
 * ---------------------------------------------------------------------------
 */

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/**
 * ESTILOS DE MALLA SOBERANA
 * STANDARD: El motor más avanzado de Mapbox con iluminación PBR y modelos 3D reales.
 * PHOTOREALISTIC: Base satelital clásica para máxima fidelidad de textura.
 */
export const MAP_STYLES = {
  STANDARD: "mapbox://styles/mapbox/standard",
  PHOTOREALISTIC: "mapbox://styles/mapbox/satellite-streets-v12",
  DARK_IMMERSIVE: "mapbox://styles/mapbox/dark-v11",
} as const;

/**
 * CONFIGURACIÓN DE ILUMINACIÓN TÁCTICA (STANDARD ONLY)
 * Misión: Lograr un aspecto profesional, profundo y de alto contraste.
 */
export const STANDARD_CONFIG = {
  lightPreset: 'night',         // dawn | day | dusk | night
  showPointOfInterestLabels: false, // Purgamos POIs genéricos (Silencio Urbano)
  showTransitLabels: false,     // Eliminamos ruido de transporte
  showPlaceLabels: true,        // Mantenemos barrios para orientación
  showRoadLabels: true          // Mantenemos calles para el Voyager
} as const;

/**
 * COORDENADAS DE RESCATE (FALLBACK ABSOLUTO)
 * Punto de anclaje de seguridad: Puerta del Sol, Madrid.
 */
export const MADRID_SOL_COORDS = {
  latitude: 40.4167,
  longitude: -3.7037,
} as const;

/**
 * STREET_VIEW_CONFIG: El estándar visual "NicePod GO"
 * Define los ángulos de cámara innegociables para la inmersión 3D.
 */
export const STREET_VIEW_CONFIG = {
  zoom: 17.2,    // Escala ideal para apreciar oclusión ambiental
  pitch: 80,     // Inclinación máxima de horizonte
  bearing: -15,  // Orientación táctica inicial
} as const;

/**
 * getInitialViewState: Generador de Semilla de Cámara
 * Misión: Asegurar que el mapa nazca en la ubicación real (IP o GPS).
 */
export const getInitialViewState = (lat?: number, lng?: number) => {
  return {
    latitude: lat || MADRID_SOL_COORDS.latitude,
    longitude: lng || MADRID_SOL_COORDS.longitude,
    ...STREET_VIEW_CONFIG,
  };
};

/**
 * CAMERA_CONSTRAINTS: Límites físicos del motor.
 */
export const CAMERA_CONSTRAINTS = {
  MAX_PITCH: 85, // Elevado para mayor drama visual en Standard
  MIN_ZOOM: 2,
  MAX_ZOOM: 22,
  ANTIALIAS: false, // Optimización para FPS en móviles
} as const;

/**
 * ---------------------------------------------------------------------------
 * II. ATMÓSFERA Y FÍSICA (AURORA HARVEST)
 * ---------------------------------------------------------------------------
 */

/**
 * TERRAIN_CONFIG: Digital Elevation Model (DEM)
 */
export const TERRAIN_CONFIG = {
  source: 'mapbox-dem',
  exaggeration: 1.1 // Calibrado para el estilo Standard
} as const;

/**
 * FOG_CONFIG: Niebla Volumétrica Deep-Space
 * Sincronizado con el color base de la plataforma (#03040b).
 */
export const FOG_CONFIG = {
  "range": [0.5, 8],
  "color": "#03040b",          // Coincidencia con BackgroundEngine V9.0
  "horizon-blend": 0.3,        // Mezcla progresiva
  "high-color": "#000000",
  "space-color": "#000000",
  "star-intensity": 0.3
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
 * III. CINEMATOGRAFÍA Y TELEMETRÍA (FLIGHT PHYSICS)
 * ---------------------------------------------------------------------------
 */

/**
 * FLY_CONFIG: Parámetros de salto táctico inmersivo.
 */
export const FLY_CONFIG = {
  duration: 3200, // Ligeramente más rápido para evitar fatiga
  essential: true,
  curve: 1.42,
  speed: 1.1,
  easing: (t: number) => t * (2 - t)
} as const;

/**
 * ZOOM_LEVELS: Estándares de proximidad.
 */
export const ZOOM_LEVELS = {
  CITY: 13,
  NEIGHBORHOOD: 15.5,
  STREET: 17.5,
  FORGE: 18.8
} as const;

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.1):
 * 1. Soporte Mapbox Standard: Se habilitó el ADN para el nuevo motor PBR. Se 
 *    eliminaron las capas de extrusión manual por ser obsoletas ante esta tecnología.
 * 2. Iluminación Táctica: El objeto 'STANDARD_CONFIG' centraliza el control de 
 *    la luz de la ciudad, permitiendo que el 'MapCore' aplique el preset 'night'
 *    de forma inmediata al cargar.
 * 3. Sincronía Atmosférica: El Fog ahora usa el color exacto del fondo de la 
 *    aplicación, creando una transición perfecta entre el UI y el Mapa.
 * 4. Persistencia de Semilla: Se mantiene 'getInitialViewState' para garantizar 
 *    que el Voyager aparezca siempre en su punto real de materialización.
 */