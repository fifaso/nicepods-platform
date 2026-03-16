// types/geo-sovereignty.ts
// VERSIÓN: 1.0 (NicePod V2.6 - Sovereign Geo-Intelligence Edition)
// Misión: Centralizar el contrato de identidad de los activos físicos anclados en la ciudad.
// [ESTABILIZACIÓN]: Independencia total del dominio de podcasts y rigor métrico PostGIS.

/**
 * ---------------------------------------------------------------------------
 * I. CICLO DE VIDA Y ESTADOS SOBERANOS
 * ---------------------------------------------------------------------------
 */

/**
 * POILifecycle: Define el estado existencial de un Punto de Interés.
 * 1. ingested: Capturado físicamente por el Administrador. Solo existen coordenadas y evidencia visual.
 * 2. analyzed: La IA multimodal ha procesado el OCR y la atmósfera visual. Listo para ser narrado.
 * 3. narrated: El Agente 38 ha sintetizado la crónica. El activo intelectual está completo.
 * 4. published: Nodo activo y visible en la Malla de Madrid Resonance.
 * 5. archived: Memoria retirada de la frecuencia activa por motivos de curaduría.
 */
export type POILifecycle = 'ingested' | 'analyzed' | 'narrated' | 'published' | 'archived';

/**
 * ---------------------------------------------------------------------------
 * II. GEOMETRÍA Y TOPOLOGÍA (ESTÁNDAR POSTGIS)
 * ---------------------------------------------------------------------------
 */

/**
 * GeoPoint: Representación inmutable de una ubicación en el espacio esférico (EPSG:4326).
 * 
 * [MANDATO CRÍTICO]: 
 * El orden de las coordenadas es estrictamente [Longitud, Latitud]. 
 * El incumplimiento de este orden es causa de fallo estructural en el Radar.
 */
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

/**
 * ---------------------------------------------------------------------------
 * III. ENTIDADES MAESTRAS (CORE ASSETS)
 * ---------------------------------------------------------------------------
 */

/**
 * PointOfInterest: El activo de conocimiento soberano de NicePod.
 * Representa la verdad final almacenada en la tabla 'public.points_of_interest'.
 */
export interface PointOfInterest {
  // Identificadores y Autoría
  id: number;
  author_id: string; // Referencia UUID al perfil del Administrador o Curador Pro.

  // Identidad Nominativa y Clasificación
  name: string; // Nombre oficial validado por OCR o IA.
  category_id: string; // Relación con la taxonomía (historia, arte, secreto, etc.)

  // Soberanía Física y Resonancia
  geo_location: GeoPoint;
  resonance_radius: number; // Distancia métrica real de activación (Standard: 35m).
  importance_score: number; // Ponderación de 1 a 10 para el ranking del Radar.

  // Capital Intelectual (Narrativa)
  historical_fact: string | null; // Gancho atómico (máximo 85 caracteres).
  rich_description: string | null; // Crónica literaria generada por Agente 38.

  // Activos Multimedia
  gallery_urls: string[]; // Colección de evidencias visuales en el Storage soberano.
  ambient_audio_url: string | null; // Soundscape real del lugar capturado en campo.

  // Estados de Control
  status: POILifecycle;
  is_published: boolean;
  reference_podcast_id: number | null; // Vínculo opcional con el flujo aspatial.

  // Telemetría Temporal
  created_at: string;
  updated_at: string;

  // Metadatos Extendidos (Black Box)
  metadata?: Record<string, unknown> | null;
}

/**
 * ---------------------------------------------------------------------------
 * IV. INGESTA SENSORIAL (EVIDENCE BUFFER)
 * ---------------------------------------------------------------------------
 */

/**
 * IngestionDossier: El contenedor de datos brutos procesados por los sentidos del sistema.
 * Mapea la información almacenada en 'public.poi_ingestion_buffer'.
 */
export interface IngestionDossier {
  poi_id: number;

  // Inteligencia Textual (OCR)
  raw_ocr_text: string | null; // Transcripción literal de placas o inscripciones.

  // Inteligencia Ambiental (Sensores Externos)
  weather_snapshot: {
    temp_c: number;
    condition: string;
    is_day: boolean;
    wind_kph?: number;
  };

  // Inteligencia Visual (IA Multimodal)
  visual_analysis_dossier: {
    architectureStyle?: string;
    atmosphere?: string;
    detectedElements?: string[]; // Ej: ["granito", "neoclasico", "estatua"]
    detectedOfficialName?: string;
  };

  // Calidad de Captura
  sensor_accuracy: number; // Precisión GPS en metros en el momento del anclaje.
  ingested_at: string;
}

/**
 * ---------------------------------------------------------------------------
 * V. RESPUESTAS DE ACCIÓN Y TRANSPORTE
 * ---------------------------------------------------------------------------
 */

/**
 * GeoActionResponse: Contrato unificado para todas las Server Actions del dominio Map.
 * Garantiza que el frontend siempre sepa cómo procesar un éxito o un fallo.
 */
export interface GeoActionResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  trace_id?: string; // ID de correlación para auditoría de Edge Functions.
}

/**
 * POICreationPayload: Estructura de envío para iniciar una nueva misión de siembra.
 */
export interface POICreationPayload {
  latitude: number;
  longitude: number;
  accuracy: number;
  heroImage: string; // Base64 o URL temporal
  ocrImage?: string; // Base64 o URL temporal
  categoryId: string;
  resonanceRadius: number;
  adminIntent: string; // La "semilla" del administrador.
}

/**
 * ---------------------------------------------------------------------------
 * VI. TAXONOMÍA URBANA
 * ---------------------------------------------------------------------------
 */

/**
 * POICategory: Definición de un nodo taxonómico en la malla urbana.
 */
export interface POICategory {
  id: string; // Ej: 'historia'
  label: string; // Ej: 'Memoria Histórica'
  icon_name: string; // Lucide icon reference
  description: string;
  vibe_color: string; // Color hexadecimal para el pulso de resonancia.
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Cero Ambigüedad: Se ha prohibido el uso de tipos genéricos en campos críticos.
 * 2. Preparación Escalable: La estructura 'IngestionDossier' permite que la IA 
 *    sea más inteligente con el tiempo sin romper el contrato del frontend.
 * 3. Rigor de Localización: El cumplimiento de la interfaz 'GeoPoint' es lo que 
 *    permite que PostGIS calcule distancias métricas exactas (ST_Distance) 
 *    que luego el RadarHUD visualiza con precisión milimétrica.
 */