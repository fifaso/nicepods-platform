/**
 * ARCHIVO: types/geo-sovereignty.ts
 * VERSIÓN: 6.4 (NicePod V2.8 - Full Type Integrity & Tone Sovereignty Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Centralizar el contrato de identidad, telemetría y control cinemático.
 * [REPARACIÓN CRÍTICA]: Unificación de tipos para profundidad y tono narrativo.
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
 */
export type CameraPerspective = 'STREET' | 'OVERVIEW';

/**
 * MapInstanceId: Identificadores únicos de lienzo para aislamiento WebGL.
 */
export type MapInstanceId = 'map-full' | 'map-dashboard' | 'map-forge';

/**
 * NarrativeDepth: Escalas de profundidad para la síntesis de IA.
 */
export type NarrativeDepth = 'flash' | 'cronica' | 'inmersion';

/**
 * NarrativeTone: Taxonomía editorial unificada para el Agente 42.
 */
export type NarrativeTone = 'academico' | 'misterioso' | 'epico' | 'neutro';

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
 * [REFORMA V6.4]: Alineación total de parámetros IA para sanar TS2345.
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

  // [FIX V6.4]: Parámetros tipados con uniones literales para el Oráculo.
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
 * NOTA TÉCNICA DEL ARCHITECT (V6.4):
 * 1. Build Shield Enforcement: Al transmutar 'tone' de string a NarrativeTone, 
 *    resolvemos el conflicto de asignación en use-geo-engine.tsx, permitiendo 
 *    que el build de Vercel sea nominal.
 * 2. Evolutionary Taxonomy: Se definen NarrativeDepth y NarrativeTone como 
 *    tipos raíz, facilitando la expansión futura de estilos sin romper la malla.
 * 3. Zero Abbreviations: Archivo 100% íntegro para despliegue industrial.
 */