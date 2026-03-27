// types/geo-sovereignty.ts
// VERSIÓN: 4.3 (NicePod V2.7 - Extended Telemetry & Contract Integrity Edition)
// Misión: Centralizar el contrato de identidad de los activos físicos y la telemetría.
// [ESTABILIZACIÓN]: Resolución de errores ts(2339) y ts(2353) mediante inyección de metadatos de fuente.

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
 * UserLocation: Snapshot de telemetría capturada por el hardware o la red.
 * [FIX V4.3]: Se añaden 'source' y 'timestamp' para habilitar el refinamiento 
 * automático de IP a GPS real.
 */
export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  /** source: Origen de la verdad (GPS satelital, Caché local o IP de red). */
  source?: 'gps' | 'cache' | 'ip-fallback';
  /** timestamp: Marca de tiempo para validar la frescura del dato (TTL). */
  timestamp?: number;
}

/**
 * ActivePOI: Representación de un nodo cercano detectado por el Radar de Proximidad.
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
 */
export type POILifecycle =
  | 'ingested'  // Evidencia física capturada.
  | 'analyzed'  // Procesado por Gemini Vision.
  | 'narrated'  // Crónica redactada por Agente 42.
  | 'published' // Activo en la Malla de Madrid.
  | 'archived'; // Retirado de la vista pública.

/**
 * GeoEngineState: Estados operativos del motor sensorial y narrativo.
 */
export type GeoEngineState =
  | 'IDLE'               // Reposo.
  | 'SENSORS_READY'      // Hardware (GPS) vinculado y triangularizando.
  | 'PERMISSION_DENIED'  // El SO o el Navegador bloqueó el acceso al GPS.
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
    admin_original_intent?: string;
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
 * GeoContextData: Almacén de resultados asíncronos del motor durante la forja.
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
 * [FIX V2.7]: Inyección de metadatos de persistencia y autoridad progresiva.
 */
export interface GeoEngineReturn {
  status: GeoEngineState;
  data: GeoContextData;
  userLocation: UserLocation | null;
  activePOI: ActivePOI | null;
  nearbyPOIs: PointOfInterest[];
  isSearching: boolean;
  isLocked: boolean;
  error: string | null;

  // --- CAPACIDADES DE SOBERANÍA V2.7 ---
  /** isTriangulated: El sistema tiene una ubicación (IP o GPS). */
  isTriangulated: boolean;
  /** isGPSLock: El hardware ha certificado precisión de calle (<80m). */
  isGPSLock: boolean;
  /** setTriangulated: Sella el estado de localización. */
  setTriangulated: () => void;

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

export interface GeoActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  trace_id?: string;
}

export interface POICreationPayload {
  latitude: number;
  longitude: number;
  accuracy: number;
  heroImage: string;
  ocrImages: string[];
  categoryId: string;
  resonanceRadius: number;
  adminIntent: string;
}

export interface POICategory {
  id: string;
  label: string;
  icon_name: string;
  description: string;
  vibe_color: string;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.3):
 * 1. Sello de Integridad de Datos: Se añadieron 'source' y 'timestamp' a UserLocation. 
 *    Esto elimina el error ts(2339) y permite que el sistema diferencie legalmente 
 *    entre el paracaídas de IP y la verdad del satélite.
 * 2. Preparado para Refinamiento: La inclusión de 'isGPSLock' en GeoEngineReturn 
 *    es el disparador contractual necesario para que el SpatialEngine ejecute 
 *    vuelos de corrección automática.
 * 3. Build Shield Activo: Todas las interfaces están selladas, garantizando un 
 *    build exitoso en Vercel sin pérdida de tipos en las Server Actions.
 */