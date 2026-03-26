// components/geo/map-constants.ts
// VERSIÓN: 5.0 (NicePod Map Assets - PBR Master Control & Global Theme Edition)
// Misión: Centralizar la física lumínica y la estética del motor Mapbox Standard.
// [ESTABILIZACIÓN]: Implementación de Interruptor de Tema, Exposición PBR y Fog Deep-Space.

/**
 * ---------------------------------------------------------------------------
 * I. GOBERNANZA DE ESTILO Y TEMA
 * ---------------------------------------------------------------------------
 */

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/**
 * MapboxLightPreset: Define los estados lumínicos autorizados por el motor Standard.
 */
export type MapboxLightPreset = 'night' | 'day' | 'dawn' | 'dusk';

/**
 * [INTERRUPTOR TÁCTICO]: Cambie este valor para alternar el modo del mapa.
 * Misión: Controlar la estética global desde un único punto de verdad.
 */
export const ACTIVE_MAP_THEME: MapboxLightPreset = 'night';

/**
 * ESTILOS DE MALLA SOBERANA
 * STANDARD: El motor más avanzado con iluminación global y modelos 3D detallados.
 */
export const MAP_STYLES = {
  STANDARD: "mapbox://styles/mapbox/standard",
  PHOTOREALISTIC: "mapbox://styles/mapbox/satellite-streets-v12",
} as const;

/**
 * STANDARD_ENGINE_CONFIG: Configuración del motor de iluminación PBR.
 * Diseñado para resaltar las aristas de los edificios y eliminar el aspecto plano.
 */
export const STANDARD_ENGINE_CONFIG = {
  lightPreset: ACTIVE_MAP_THEME,
  showPointOfInterestLabels: false, // Protocolo de Silencio Urbano
  showTransitLabels: false,         // Purgado de iconos de transporte
  showPlaceLabels: true,            // Mantenemos distritos para orientación
  showRoadLabels: true,             // Mantenemos viales para el Voyager
} as const;

/**
 * ---------------------------------------------------------------------------
 * II. CÁMARA Y TELEMETRÍA T0 (MATERIALIZACIÓN)
 * ---------------------------------------------------------------------------
 */

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
 * Pitch 80: Inclinación máxima para apreciar la volumetría de los edificios.
 */
export const STREET_VIEW_CONFIG = {
  zoom: 17.2,
  pitch: 80,
  bearing: -15,
} as const;

/**
 * getInitialViewState: Generador de Semilla de Cámara Dinámica.
 * Misión: Garantizar que el mapa nazca en la ubicación real del usuario.
 */
export const getInitialViewState = (lat?: number, lng?: number) => {
  return {
    latitude: lat || MADRID_SOL_COORDS.latitude,
    longitude: lng || MADRID_SOL_COORDS.longitude,
    ...STREET_VIEW_CONFIG,
  };
};

export const CAMERA_CONSTRAINTS = {
  MAX_PITCH: 85,
  MIN_ZOOM: 2,
  MAX_ZOOM: 22,
  ANTIALIAS: false, // Maximiza FPS en dispositivos móviles
} as const;

/**
 * ---------------------------------------------------------------------------
 * III. ATMÓSFERA Y FÍSICA (AURORA HARVEST)
 * ---------------------------------------------------------------------------
 */

/**
 * TERRAIN_CONFIG: Digital Elevation Model (DEM)
 */
export const TERRAIN_CONFIG = {
  source: 'mapbox-dem',
  exaggeration: 1.1
} as const;

/**
 * FOG_CONFIG: Niebla Volumétrica Deep-Space
 * Sincronizado con el color base de la plataforma (#03040b).
 */
export const FOG_CONFIG = {
  "range": [0.5, 8],
  "color": "#03040b",          // Coincidencia con el Chasis de la plataforma
  "horizon-blend": 0.25,       // Transición nítida Pokémon GO
  "high-color": "#000000",
  "space-color": "#000000",
  "star-intensity": 0.2
} as const;

export const DEM_SOURCE_CONFIG = {
  id: "mapbox-dem",
  type: "raster-dem" as const,
  url: "mapbox://mapbox.mapbox-terrain-dem-v1",
  tileSize: 512,
  maxzoom: 14
} as const;

/**
 * ---------------------------------------------------------------------------
 * IV. CINEMATOGRAFÍA DE VUELO (FLIGHT PHYSICS)
 * ---------------------------------------------------------------------------
 */

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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Control de Tema Centralizado: La constante 'ACTIVE_MAP_THEME' permite cambiar 
 *    el aspecto del mapa (Día/Noche) sin tocar el motor de renderizado.
 * 2. Iluminación PBR: Se definieron los parámetros para Mapbox Standard que eliminan
 *    el aspecto de 'bloques negros', activando sombras y reflejos dinámicos.
 * 3. Higiene Atmosférica: El Fog y el color base están sintonizados con el 
 *    'BackgroundEngine' para una inmersión total 360 grados.
 * 4. Rigor NCIS: Uso de 'as const' para garantizar la inmutabilidad de los objetos 
 *    de configuración en el ciclo de vida de React.
 */