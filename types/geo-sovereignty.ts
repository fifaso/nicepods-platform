// types/geo-sovereignty.ts
// VERSIÓN: 4.0 (NicePod V2.6 - Permission Shield Edition)
// Misión: Centralizar el contrato de identidad de los activos físicos y la lógica del motor geoespacial.
// [ESTABILIZACIÓN]: Inyección del estado 'PERMISSION_DENIED' para manejar bloqueos de hardware en el SO.

/**
 * ---------------------------------------------------------------------------
 * I. TOPOLOGÍA Y POSICIONAMIENTO (ESTÁNDAR POSTGIS)
 * ---------------------------------------------------------------------------
 */

/**
 * GeoPoint: Representación inmutable de una ubicación en el espacio esférico.
 * [MANDATO NCIS v2.5]: El orden es estrictamente [Longitud, Latitud] para 
 * cumplimiento total con Mapbox GL JS y operadores de PostGIS.
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
 * ActivePOI: Representación de un nodo cercano detectado por el Radar de Proximidad.
 * Utilizado para el HUD y las alertas de resonancia táctiles.
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
 * POILifecycle: Define el estado existencial de un Punto de Interés.
 * Mapeado directamente con el enum 'poi_lifecycle' en el Metal (SQL).
 */
export type POILifecycle =
  | 'ingested'  // Evidencia física capturada.
  | 'analyzed'  // Procesado por Gemini Vision.
  | 'narrated'  // Crónica redactada por Agente 42.
  | 'published' // Activo en la Malla de Madrid.
  | 'archived';  // Retirado de la vista pública.

/**
 * GeoEngineState: Estados operativos del motor sensorial y narrativo.
 * [FIX V4.0]: Se añade PERMISSION_DENIED para habilitar el 'Permission Shield'.
 */
export type GeoEngineState =
  | 'IDLE'               // Reposo.
  | 'SENSORS_READY'      // Hardware (GPS) vinculado y triangularizando.
  | 'PERMISSION_DENIED'  // [NUEVO]: El SO o el Navegador bloqueó el acceso al GPS.
  | 'INGESTING'          // Transfiriendo binarios comprimidos.
  | 'DOSSIER_READY'      // Datos físicos validados y analizados.
  | 'SYNTHESIZING'       // Forja del Agente 42 en curso.
  | 'NARRATIVE_READY'    // Sabiduría lista para publicación.
  | 'CONFLICT'           // Alerta de proximidad crítica (<10m).
  | 'REJECTED';          // Fallo de red, validación o hardware secundario.

/**
 * ---------------------------------------------------------------------------
 * III. ENTIDADES MAESTRAS (BÓVEDA NKV)
 * ---------------------------------------------------------------------------
 */

/**
 * PointOfInterest: El activo de conocimiento soberano final.
 * Representa la "Piedra" digital en la Malla Urbana.
 */
export interface PointOfInterest {
  id: number;
  author_id: string;
  name: string;
  category_id: string;
  geo_location: GeoPoint; // Tipado estricto vs unknown
  resonance_radius: number;
  importance_score: number;
  historical_fact: string | null;
  rich_description: string | null;
  gallery_urls: string[] | null;
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
 * Actúa como el puente entre la captura física y la narrativa final.
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
 * IV. CONTRATOS DE INTERFACE Y HOOKS (THE BRIDGE)
 * ---------------------------------------------------------------------------
 */

/**
 * GeoContextData: Almacén de resultados asíncronos del motor durante el Stepper.
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
  nearbyPOIs: PointOfInterest[]; // Saneamiento de tipos
  isSearching: boolean;
  isLocked: boolean;
  error: string | null;

  // Métodos de Control
  initSensors: () => void;
  setManualAnchor: (lng: number, lat: number) => void;
  setManualPlaceName: (name: string) => void;
  reSyncRadar: () => void;

  // Flujos de Inteligencia
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
 * V. RESPUESTAS Y PAYLOADS DE ACCIÓN (SERVER ACTIONS CONTRACT)
 * ---------------------------------------------------------------------------
 */

/**
 * GeoActionResponse: Contrato unificado para Server Actions geoespaciales.
 */
export interface GeoActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  trace_id?: string;
}

/**
 * POICreationPayload: Estructura de despacho multimodal comprimida.
 */
export interface POICreationPayload {
  latitude: number;
  longitude: number;
  accuracy: number;
  heroImage: string; // Base64 comprimido
  ocrImages: string[]; // Array de Base64 comprimidos
  categoryId: string;
  resonanceRadius: number;
  adminIntent: string;
}

/**
 * POICategory: Definición taxonómica para la Malla Urbana.
 */
export interface POICategory {
  id: string;
  label: string;
  icon_name: string;
  description: string;
  vibe_color: string;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Build Shield Activo: Al tipar estrictamente 'nearbyPOIs' y 'geo_location', 
 *    el compilador evitará que el 'SpatialEngine' intente renderizar nodos corruptos.
 * 2. Trazabilidad de Permisos: La inclusión de 'PERMISSION_DENIED' en el ciclo 
 *    de vida permite aislar fallos de hardware de fallos humanos (privacidad).
 */