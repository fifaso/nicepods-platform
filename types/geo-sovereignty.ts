/**
 * ARCHIVO: types/geo-sovereignty.ts
 * VERSIÓN: 6.2 (NicePod V2.8 - Instance Isolation & Identity Sovereignty Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Centralizar el contrato de identidad, telemetría y aislamiento de instancias.
 * [REFORMA V6.2]: Inyección de MapInstanceId para erradicar el Ghosting de Mapbox.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
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
 * - OVERVIEW: Vista Cenital 0°, Zoom 15.2 (Vista de Contexto / Dashboard).
 */
export type CameraPerspective = 'STREET' | 'OVERVIEW';

/**
 * MapInstanceId: [NUEVO V6.2] Identificadores únicos de lienzo.
 * Evita la colisión de contextos entre el Dashboard y el Mapa de Inmersión.
 */
export type MapInstanceId = 'map-full' | 'map-dashboard';

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
 * [REFORMA V6.2]: Integración de Soberanía de Instancia para aislamiento WebGL.
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

  // --- CAPACIDADES DE SOBERANÍA ---
  
  /** isIgnited: Hardware GPS activo y singleton de hardware bloqueado. */
  isIgnited: boolean;

  /** isTriangulated: Ubicación inicial disponible (IP o GPS). */
  isTriangulated: boolean;
  
  /** isGPSLock: Precisión certificada de alta fidelidad (<80m). */
  isGPSLock: boolean;

  /** needsBallisticLanding: Flag para maniobras de aproximación automatizadas. */
  needsBallisticLanding: boolean;

  /** recenterTrigger: Pulso incremental para forzar recentrados bajo demanda. */
  recenterTrigger: number;

  /** confirmLanding: Callback que cierra el ciclo de vuelo balístico. */
  confirmLanding: () => void;

  // --- GOBERNANZA DE CÁMARA Y PERSPECTIVA ---

  /** cameraPerspective: El modo actual de visión (STREET vs OVERVIEW). */
  cameraPerspective: CameraPerspective;

  /** isManualMode: Indica si el usuario ha desplazado el mapa manualmente. */
  isManualMode: boolean;

  /** toggleCameraPerspective: Conmuta entre inmersión y estrategia. */
  toggleCameraPerspective: () => void;

  /** setManualMode: Informa al motor que el usuario tiene el mando. */
  setManualMode: (active: boolean) => void;

  /** recenterCamera: Fuerza el regreso inmediato al Voyager disparando el pulso. */
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.2):
 * 1. Isolation Foundations: La introducción de MapInstanceId permite que el sistema
 *    desligue físicamente el mapa del Dashboard del mapa Full-screen.
 * 2. Ghosting Eradication: Al definir IDs únicos, el CameraController podrá 
 *    vincularse exclusivamente al lienzo activo, deteniendo las rotaciones fantasmales.
 * 3. Atomic Integrity: Se mantienen los contratos cinemáticos bi-modales para 
 *    garantizar la fluidez de la Malla de Madrid.
 */