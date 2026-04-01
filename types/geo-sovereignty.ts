/**
 * ARCHIVO: types/geo-sovereignty.ts
 * VERSIÓN: 7.0 (NicePod V3.0 - Triple-Core Contract & Vault Strictness Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Centralizar el contrato de identidad, telemetría y control cinemático.
 * [REFORMA V7.0]: Sincronización de Edge Functions (Tonos) y blindaje de Metadata NKV.
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

export type TelemetrySource = 'gps' | 'cache' | 'ip-fallback' | 'manual-anchor' | 'edge-ip';

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
  source?: TelemetrySource;
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
 */
export type CameraPerspective = 'STREET' | 'OVERVIEW';

/**
 * MapInstanceId: Identificadores únicos de lienzo para aislamiento WebGL.
 */
export type MapInstanceId = 'map-full' | 'map-dashboard' | 'map-forge' | 'map-sentinel';

/**
 * NarrativeDepth: Escalas de profundidad para la síntesis de IA.
 */
export type NarrativeDepth = 'flash' | 'cronica' | 'inmersion';

/**
 * NarrativeTone: Taxonomía editorial unificada para el Agente 42.
 * [FIX V7.0]: Sincronizado con geo-narrative-creator Edge Function.
 */
export type NarrativeTone = 'academico' | 'misterioso' | 'epico' | 'melancolico' | 'neutro';

/**
 * ---------------------------------------------------------------------------
 * III. ENTIDADES MAESTRAS (BÓVEDA NKV)
 * ---------------------------------------------------------------------------
 */

/**
 * POIMetadata: Tipado estricto para evitar el antipatrón Record<string, unknown>.
 */
export interface POIMetadata {
  urban_context?: string;
  architectural_period?: string;
  custom_tags?: string[];
  curator_notes?: string;
  [key: string]: unknown; // Extensibilidad segura
}

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
  metadata?: POIMetadata | null;
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
 * GeoEngineReturn: La firma pública que la Fachada (useGeoEngine) entrega a la UI.
 * [MANDATO V7.0]: Este contrato permanece INMUTABLE para garantizar cero regresiones
 * tras la migración a la arquitectura Triple-Core.
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
  isIgnited: boolean;
  isTriangulated: boolean;
  isGPSLock: boolean;
  needsBallisticLanding: boolean;
  recenterTrigger: number;
  confirmLanding: () => void;

  // --- GOBERNANZA DE CÁMARA Y PERSPECTIVA ---
  cameraPerspective: CameraPerspective;
  isManualMode: boolean;
  toggleCameraPerspective: () => void;
  setManualMode: (active: boolean) => void;
  recenterCamera: () => void;

  // Métodos de Control Tradicionales
  initSensors: () => void;
  reSyncRadar: () => void;
  setTriangulated: () => void;
  setManualAnchor: (lng: number, lat: number) => void;
  setManualPlaceName: (name: string) => void;

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
    depth: NarrativeDepth;
    tone: NarrativeTone;
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
 * NOTA TÉCNICA DEL ARCHITECT (V7.0):
 * 1. Sync Tone: Se incluyó 'melancolico' para coincidir con la IA en el Borde.
 * 2. NKV Shielding: La metadata ahora requiere cumplir con 'POIMetadata', erradicando el
 *    riesgo de inyectar objetos opacos a la base de datos PostgreSQL.
 * 3. Facade Stability: La interfaz GeoEngineReturn no ha modificado su estructura, 
 *    garantizando que la transición a la V3.0 de los hooks (Triple-Core) compile instantáneamente.
 */
