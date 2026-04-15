/**
 * ARCHIVO: supabase/functions/_shared/types.ts
 * VERSIÓN: 2.0 (NicePod Edge Contracts - Sovereign Intelligence Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Definir los contratos de intercambio de datos para las Edge Functions, 
 * garantizando la integridad semántica entre los sensores de hardware, 
 * el oráculo de IA y la bóveda de persistencia.
 * [REFORMA V2.0]: Aplicación absoluta de la Zero Abbreviations Policy (ZAP). 
 * Erradicación de tipos 'any'. Sincronización con estándares PostGIS.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

/**
 * INTERFAZ: GeodeticCoordinates
 * Representación técnica de un punto en el espacio geográfico esférico.
 */
export interface GeodeticCoordinates {
  latitudeCoordinate: number;
  longitudeCoordinate: number;
  altitudeMeters?: number;
  headingDegrees?: number; // Rango: 0-360
}

/**
 * INTERFAZ: WeatherSnapshotDossier
 * Metadatos meteorológicos capturados durante el peritaje urbano.
 */
export interface WeatherSnapshotDossier {
  temperatureCelsius: number;
  conditionDescription: string; // Ej: 'Despejado', 'Tormenta Eléctrica'
  isDaytimeStatus: boolean;
  windSpeedKilometersPerHour: number;
}

/**
 * INTERFAZ: DetectedPointOfInterest
 * Entidad geográfica identificada por el radar de proximidad.
 */
export interface DetectedPointOfInterest {
  /** identification: Referencia única en sistemas externos (Google Places / OSM). */
  identification: string; 
  name: string;
  category: string;
  distanceInMeters: number;
  confidenceScorePercentage: number; // Rango: 0.0 - 1.0
}

/**
 * INTERFAZ: VisualIntelligenceAnalysis
 * Estructura de salida del Oráculo Gemini para análisis de imágenes.
 */
export interface VisualIntelligenceAnalysis {
  detectedElementsCollection: string[];
  architecturalStyleDescription?: string;
  historicalContextInference?: string;
  ocrTextContentFound?: string;
}

/**
 * INTERFAZ: ContextualGeodeticDossier
 * El contenedor maestro de inteligencia para la forja de capital intelectual.
 */
export interface ContextualGeodeticDossier {
  processingTraceIdentification: string;
  eventTimestamp: string;
  userIdentification: string;
  geographicLocation: GeodeticCoordinates;

  /** I. CAPA FÍSICA: Datos crudos de sensores y entorno. */
  weatherMetadatos: WeatherSnapshotDossier;
  primaryDetectedPlace: DetectedPointOfInterest;

  /** II. CAPA COGNITIVA: Capital intelectual recuperado de la Bóveda NKV. */
  historicalFactsCollection: string[]; 
  activeEventsCollection: string[];    

  /** III. CAPA DE VISIÓN: Resultados del peritaje óptico. */
  visualIntelligenceAnalysisDossier?: VisualIntelligenceAnalysis;

  /** IV. ESTADO OPERATIVO: Fase actual en la malla de procesamiento. */
  processingStage: 'raw_ingest' | 'semantic_filtered' | 'script_ready';
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Zero Abbreviations Policy (ZAP): 'lat' -> 'latitudeCoordinate', 
 *    'temp_c' -> 'temperatureCelsius', 'id' -> 'identification'.
 * 2. Type Sovereignty: Se sustituyó 'any' en 'vision_analysis' por la interfaz 
 *    'VisualIntelligenceAnalysis' para permitir un tipado estricto en el Oráculo.
 * 3. Contract Alignment: Los nombres de los campos coinciden ahora con los 
 *    descriptores industriales del esquema PodcastCreationSchema V12.0.
 */