// types/geo-sovereignty.ts
// VERSIÓN: 2.0 (NicePod V2.6 - Sovereign Geo-Intelligence Constitution)
// Misión: Centralizar el contrato de identidad de los activos físicos y la lógica del motor.
// [ESTABILIZACIÓN]: Integración total de telemetría, estados de motor y contratos de hook.

/**
 * ---------------------------------------------------------------------------
 * I. TOPOLOGÍA Y POSICIONAMIENTO (ESTÁNDAR POSTGIS)
 * ---------------------------------------------------------------------------
 */

/**
 * GeoPoint: Representación inmutable de una ubicación en el espacio esférico.
 * [MANDATO]: El orden es estrictamente [Longitud, Latitud] para Mapbox/PostGIS.
 */
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

/**
 * UserLocation: Snapshot de telemetría capturada por el hardware del curador.
 */
export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
}

/**
 * ActivePOI: Representación de un nodo cercano detectado por el Radar.
 */
export interface ActivePOI {
  id: string;
  name: string;
  distance: number;
  isWithinRadius: boolean;
  historical_fact?: string;
}

/**
 * ---------------------------------------------------------------------------
 * II. CICLO DE VIDA Y MÁQUINA DE ESTADOS
 * ---------------------------------------------------------------------------
 */

/**
 * POILifecycle: Define el estado existencial de un Punto de Interés en la DB.
 */
export type POILifecycle = 'ingested' | 'analyzed' | 'narrated' | 'published' | 'archived';

/**
 * GeoEngineState: Estados operativos del motor sensorial y narrativo.
 */
export type GeoEngineState =
  | 'IDLE'             // Reposo.
  | 'SENSORS_READY'    // Hardware vinculado.
  | 'INGESTING'        // Transfiriendo binarios.
  | 'DOSSIER_READY'    // Datos físicos validados.
  | 'SYNTHESIZING'     // Forja del Agente 42.
  | 'NARRATIVE_READY'  // Sabiduría lista.
  | 'CONFLICT'         // Alerta de proximidad (<10m).
  | 'REJECTED';        // Fallo de red o validación.

/**
 * ---------------------------------------------------------------------------
 * III. ENTIDADES MAESTRAS (BÓVEDA)
 * ---------------------------------------------------------------------------
 */

/**
 * PointOfInterest: El activo de conocimiento soberano final.
 */
export interface PointOfInterest {
  id: number;
  author_id: string;
  name: string;
  category_id: string;
  geo_location: GeoPoint;
  resonance_radius: number;
  importance_score: number;
  historical_fact: string | null;
  rich_description: string | null;
  gallery_urls: string[];
  ambient_audio_url: string | null;
  status: POILifecycle;
  is_published: boolean;
  reference_podcast_id: number | null;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown> | null;
}

/**
 * IngestionDossier: El contenedor de evidencia procesada por la IA sensorial.
 */
export interface IngestionDossier {
  poi_id: number;
  raw_ocr_text: string | null;
  weather_snapshot: {
    temp_c: number;
    condition: string;
    is_day: boolean;
    wind_kph?: number;
  };
  visual_analysis_dossier: {
    architectureStyle?: string;
    atmosphere?: string;
    detectedElements?: string[];
    detectedOfficialName?: string;
  };
  sensor_accuracy: number;
  ingested_at: string;
}

/**
 * ---------------------------------------------------------------------------
 * IV. CONTRATOS DE INTERFACE Y HOOKS
 * ---------------------------------------------------------------------------
 */

/**
 * GeoContextData: Almacén de resultados asíncronos del motor.
 */
export interface GeoContextData {
  poiId?: number;
  dossier?: IngestionDossier;
  narrative?: {
    title: string;
    hook: string;
    script: string;
  };
  manualPlaceName?: string;
  isProximityConflict?: boolean;
  rejectionReason?: string;
}

/**
 * GeoEngineReturn: La firma pública que el hook useGeoEngine entrega a la UI.
 */
export interface GeoEngineReturn {
  status: GeoEngineState;
  data: GeoContextData;
  userLocation: UserLocation | null;
  activePOI: ActivePOI | null;
  nearbyPOIs: any[];
  isSearching: boolean;
  isLocked: boolean;
  error: string | null;

  initSensors: () => void;
  setManualAnchor: (lng: number, lat: number) => void;
  setManualPlaceName: (name: string) => void;
  reSyncRadar: () => void;

  ingestSensoryData: (params: {
    heroImage: File;
    ocrImages: File[];
    ambientAudio?: Blob | null;
    intent: string;
    categoryId: string;
    radius: number;
  }) => Promise<{ poiId: number; dossier: IngestionDossier } | void>;

  synthesizeNarrative: (params: {
    poiId: number;
    depth: 'flash' | 'cronica' | 'inmersion';
    tone: string;
    refinedIntent?: string;
  }) => Promise<void>;

  transcribeVoiceIntent: (audioBase64: string) => Promise<GeoActionResponse<{ transcription: string }>>;
  reset: () => void;
}

/**
 * ---------------------------------------------------------------------------
 * V. RESPUESTAS Y PAYLOADS DE ACCIÓN
 * ---------------------------------------------------------------------------
 */

/**
 * GeoActionResponse: Contrato unificado para Server Actions.
 */
export interface GeoActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  trace_id?: string;
}

/**
 * POICreationPayload: Estructura de despacho multimodal.
 */
export interface POICreationPayload {
  latitude: number;
  longitude: number;
  accuracy: number;
  heroImage: string; // URL o Base64
  ocrImages: string[]; // Array de evidencias visuales
  categoryId: string;
  resonanceRadius: number;
  adminIntent: string;
}

/**
 * POICategory: Definición taxonómica para la Malla.
 */
export interface POICategory {
  id: string;
  label: string;
  icon_name: string;
  description: string;
  vibe_color: string;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Resolución de Ceguera (TS2305): Este archivo ahora exporta UserLocation, 
 *    ActivePOI, GeoEngineReturn y GeoEngineState, permitiendo que el hook 
 *    sea 100% tipado externamente.
 * 2. Cero Abreviaciones: Se ha mantenido el rigor en cada propiedad para que 
 *    el sistema sea auto-documentado.
 * 3. Escalabilidad Pro: La estructura está preparada para recibir hasta 3 
 *    imágenes OCR en el POICreationPayload, alineándose con el Step 2 Pro.
 */