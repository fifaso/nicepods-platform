/**
 * ARCHIVO: types/geo-sovereignty.ts
 * VERSIÓN: 6.0 (NicePod V2.8 - Universal Control & Perspective Sovereignty Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Centralizar el contrato de identidad, telemetría y control de perspectiva.
 * [SELLADO]: Inyección de estados de perspectiva dual y flags de modo manual.
 * Resolución de soberanía visual para la eliminación de controles nativos.
 */

/**
 * ---------------------------------------------------------------------------
 * I. TOPOLOGÍA Y POSICIONAMIENTO (ESTÁNDAR POSTGIS)
 * ---------------------------------------------------------------------------
 */

/**
 * GeoPoint: Representación inmutable de una ubicación en el espacio esférico.
 * [MANDATO NCIS]: Longitud primero para cumplimiento con Mapbox GL JS y PostGIS.
 */
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

/**
 * UserLocation: Snapshot de telemetría capturada por el hardware o la red.
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

export type POILifecycle =
  | 'ingested'
  | 'analyzed'
  | 'narrated'
  | 'published'
  | 'archived';

export type GeoEngineState =
  | 'IDLE'
  | 'SENSORS_READY'
  | 'PERMISSION_DENIED'
  | 'INGESTING'
  | 'DOSSIER_READY'
  | 'SYNTHESIZING'
  | 'NARRATIVE_READY'
  | 'CONFLICT'
  | 'REJECTED';

/**
 * CameraPerspective: Define los dos modos de visualización profesional.
 * - STREET: Inmersión 75°, Zoom 18.5 (Estilo Pokémon GO).
 * - OVERVIEW: Vista Cenital 0°, Zoom 16 (Estilo Satélite/Estratégico).
 */
export type CameraPerspective = 'STREET' | 'OVERVIEW';

/**
 * ---------------------------------------------------------------------------
 * III. ENTIDADES MAESTRAS (BÓVEDA NKV)
 * ---------------------------------------------------------------------------
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
 * [REFORMA V6.0]: Integración de Soberanía de Perspectiva y Mando de Cámara.
 */
export interface GeoEngineReturn {
  // Estados de Sensor y Red
  status: GeoEngineState;
  data: GeoContextData;
  userLocation: UserLocation | null;
  nearbyPOIs: PointOfInterest[];
  activePOI: ActivePOI | null;
  isSearching: boolean;
  isLocked: boolean;
  error: string | null;

  // --- CAPACIDADES DE SOBERANÍA V6.0 ---
  
  /** isIgnited: Hardware GPS activo y singleton bloqueado. */
  isIgnited: boolean;

  /** isTriangulated: Ubicación inicial disponible. */
  isTriangulated: boolean;
  
  /** isGPSLock: Precisión certificada de alta fidelidad (<80m). */
  isGPSLock: boolean;

  /** needsBallisticLanding: Disparador de vuelo cinematográfico inicial. */
  needsBallisticLanding: boolean;

  /** confirmLanding: Cierre de ciclo de vuelo balístico. */
  confirmLanding: () => void;

  // --- NUEVA GOBERNANZA DE CÁMARA (V6.0) ---

  /** cameraPerspective: El modo actual de visión (STREET vs OVERVIEW). */
  cameraPerspective: CameraPerspective;

  /** isManualMode: Indica si el usuario ha desplazado el mapa manualmente (Fuera de foco). */
  isManualMode: boolean;

  /** toggleCameraPerspective: Conmuta entre vista de calle y vista cenital. */
  toggleCameraPerspective: () => void;

  /** setManualMode: Informa al motor si el usuario está interactuando. */
  setManualMode: (active: boolean) => void;

  /** recenterCamera: Fuerza el regreso inmediato al Voyager. */
  recenterCamera: () => void;

  // Métodos de Control Tradicionales
  initSensors: () => void;
  setTriangulated: () => void;
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
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Control de Perspectiva: Se añade CameraPerspective para diferenciar los 
 *    perfiles físicos de renderizado (Inmersión vs Estrategia).
 * 2. Manual Mode Awareness: El flag isManualMode permite al UI reaccionar 
 *    cuando el usuario se "pierde" en el mapa, habilitando el botón de Recentrar.
 * 3. Unified Authority: Los métodos toggleCameraPerspective y recenterCamera
 *    centralizan el mando visual, permitiendo la purga de controles nativos.
 */