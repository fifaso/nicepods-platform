/**
 * ARCHIVO: types/geo-sovereignty.ts
 * VERSIÓN: 6.1 (NicePod V2.8 - Recursive Authority & Trigger Pulse Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Centralizar el contrato de identidad, telemetría y control cinemático.
 * [REFORMA V6.1]: Inyección de recenterTrigger para erradicar el estancamiento de estado.
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
 * [REFORMA V6.1]: Integración de recenterTrigger para autoridad infinita del botón.
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

  // --- CAPACIDADES DE SOBERANÍA V6.1 ---
  
  /** isIgnited: Hardware GPS activo y singleton de hardware bloqueado. */
  isIgnited: boolean;

  /** isTriangulated: Ubicación inicial disponible (IP o GPS). */
  isTriangulated: boolean;
  
  /** isGPSLock: Precisión certificada de alta fidelidad (<80m). */
  isGPSLock: boolean;

  /** needsBallisticLanding: Flag para el primer vuelo cinematográfico de aterrizaje. */
  needsBallisticLanding: boolean;

  /** recenterTrigger: [NUEVO V6.1] Pulso incremental para forzar recentrados bajo demanda. */
  recenterTrigger: number;

  /** confirmLanding: Callback que cierra el ciclo de vuelo (inicial o de recentrado). */
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

export interface POICategory {
  id: string;
  label: string;
  icon_name: string;
  description: string;
  vibe_color: string;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.1):
 * 1. Infinite Recenter Fix: Se añadió 'recenterTrigger' como un contador. Esto 
 *    garantiza que cada click en el botón de UI dispare un cambio de estado,
 *    eliminando la "sordera" de la cámara tras el primer uso.
 * 2. Visual Perspective Duality: Se mantiene el soporte para STREET y OVERVIEW,
 *    preparando el terreno para la conmutación profesional de cámara.
 * 3. Type Safety Integrity: El Build Shield de Vercel reconocerá estas propiedades
 *    en el GeoEngine, permitiendo una compilación limpia y robusta.
 */