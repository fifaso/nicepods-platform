/**
 * ARCHIVO: types/geo-sovereignty.ts
 * VERSIÓN: 7.7 (NicePod V4.0 - Full Descriptive Integrity & Build Shield Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Centralizar el contrato de identidad, telemetría y control cinemático,
 * garantizando la sintonía entre el hardware de captura y el oráculo de IA.
 * [REFORMA V7.7]: Purificación total de nomenclatura. Sustitución definitiva del
 * término 'POI' por 'PointOfInterest' para erradicar errores de importación.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

/**
 * ---------------------------------------------------------------------------
 * I. TOPOLOGÍA Y POSICIONAMIENTO (ESTÁNDAR POSTGIS)
 * ---------------------------------------------------------------------------
 */

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export type TelemetrySource = 
  | 'gps' 
  | 'cache' 
  | 'ip-fallback' 
  | 'manual-anchor' 
  | 'edge-ip';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  source?: TelemetrySource;
  timestamp?: number;
}

/**
 * ActivePointOfInterest: Representación de un nodo cercano detectado por el Radar.
 */
export interface ActivePointOfInterest {
  identification: string;
  name: string;
  distance: number;
  isWithinRadius: boolean;
  historical_fact?: string;
}

/**
 * ---------------------------------------------------------------------------
 * II. TAXONOMÍA GRANULAR Y RELOJ SOBERANO (LA RED NEURONAL V4.0)
 * ---------------------------------------------------------------------------
 */

export type CategoryMission = 
  | 'infraestructura_vital'
  | 'memoria_soberana'
  | 'capital_intelectual'
  | 'resonancia_sensorial';

export type CategoryEntity =
  | 'aseo_premium' | 'nodo_hidratacion' | 'refugio_climatico' | 'terminal_energia' | 'zona_segura'
  | 'monumento_nacional' | 'placa_sintonia' | 'yacimiento_ruina' | 'leyenda_urbana' | 'arquitectura_epoca'
  | 'museo_sabiduria' | 'atelier_galeria' | 'libreria_autor' | 'centro_innovacion' | 'intervencion_plastica'
  | 'mirador_estrategico' | 'paisaje_sonoro' | 'pasaje_secreto' | 'mercado_origen' | 'obrador_tradicion';

export type HistoricalEpoch =
  | 'origen_geologico'
  | 'pre_industrial'
  | 'siglo_de_oro'
  | 'ilustracion_borbonica'
  | 'modernismo_expansion'
  | 'contemporaneo'
  | 'futuro_especulativo'
  | 'atemporal';

/**
 * ---------------------------------------------------------------------------
 * III. CICLO DE VIDA Y MÁQUINA DE ESTADOS
 * ---------------------------------------------------------------------------
 */

export type PointOfInterestLifecycle =
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

export type CameraPerspective = 'STREET' | 'OVERVIEW' | 'SATELLITE';

export type MapInstanceId = 'map-full' | 'map-dashboard' | 'map-forge' | 'map-sentinel';

export type NarrativeDepth = 'flash' | 'cronica' | 'inmersion';

export type NarrativeTone = 'academico' | 'misterioso' | 'epico' | 'melancolico' | 'neutro';

/**
 * ---------------------------------------------------------------------------
 * IV. ENTIDADES MAESTRAS (BÓVEDA NKV)
 * ---------------------------------------------------------------------------
 */

export interface PointOfInterestMetadata {
  urban_context?: string;
  architectural_period?: string;
  custom_tags?: string[];
  curator_notes?: string;
  external_source_url?: string;
  grounding_summary?: string;
  processing_trace_id?: string;
}

export interface PointOfInterest {
  id: number;
  author_id: string;
  name: string;
  category_mission: CategoryMission;
  category_entity: CategoryEntity;
  historical_epoch: HistoricalEpoch;
  geo_location: GeoPoint;
  resonance_radius: number;
  importance_score: number;
  historical_fact: string | null;
  rich_description: string | null;
  gallery_urls: string[] | null;
  ambient_audio_url: string | null;
  status: PointOfInterestLifecycle;
  is_published: boolean;
  reference_podcast_id: number | null;
  created_at: string;
  updated_at: string;
  metadata?: PointOfInterestMetadata | null;
}

export interface IngestionDossier {
  point_of_interest_identification: number;
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
 * V. CONTRATOS DE INTERFACE Y HOOKS (THE BRIDGE)
 * ---------------------------------------------------------------------------
 */

export interface GeoContextData {
  pointOfInterestIdentification?: number;
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
 * GeoEngineReturn: La firma pública de la Fachada Soberana.
 */
export interface GeoEngineReturn {
  status: GeoEngineState;
  data: GeoContextData;
  userLocation: UserLocation | null;
  nearbyPointsOfInterest: PointOfInterest[];
  activePointOfInterest: ActivePointOfInterest | null;
  isSearching: boolean;
  isLocked: boolean;
  error: string | null;

  isIgnited: boolean;
  isTriangulated: boolean;
  isGPSLock: boolean;
  needsBallisticLanding: boolean;
  recenterTrigger: number;
  confirmLanding: () => void;

  cameraPerspective: CameraPerspective;
  mapStyle: string; 
  isManualMode: boolean;
  toggleCameraPerspective: () => void;
  setManualMode: (active: boolean) => void;
  recenterCamera: () => void;

  initSensors: () => void;
  reSyncRadar: () => void;
  setTriangulated: () => void;
  setManualAnchor: (longitude: number, latitude: number) => void;
  setManualPlaceName: (name: string) => void;

  ingestSensoryData: (parameters: {
    heroImage: File;
    ocrImages: File[];
    ambientAudio?: Blob | null;
    intentText: string;
    intentAudioBlob?: Blob | null;
    categoryMission: CategoryMission;
    categoryEntity: CategoryEntity;
    historicalEpoch: HistoricalEpoch;
    resonanceRadius: number;
    referenceUrl?: string; 
  }) => Promise<{ pointOfInterestIdentification: number; dossier: IngestionDossier } | void>;

  synthesizeNarrative: (parameters: {
    pointOfInterestIdentification: number;
    depth: NarrativeDepth;
    tone: NarrativeTone;
    refinedIntent?: string;
  }) => Promise<void>;

  transcribeVoiceIntent: (audioBase64: string) => Promise<GeoActionResponse<{ transcription: string }>>;
  reset: () => void;
}

/**
 * ---------------------------------------------------------------------------
 * VI. RESPUESTAS Y PAYLOADS DE ACCIÓN (SERVER ACTIONS CONTRACT)
 * ---------------------------------------------------------------------------
 */

export interface GeoActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  trace_id?: string;
}

/**
 * PointOfInterestCreationPayload: Contrato para la Ingesta Lightning V4.0.
 */
export interface PointOfInterestCreationPayload {
  latitude: number;
  longitude: number;
  accuracy: number;
  heroImageFilePath: string;
  ocrImageFilePaths: string[]; 
  categoryMission: string;
  categoryEntity: string;
  historicalEpoch: string;
  resonanceRadius: number;
  adminIntent: string;
  referenceUrl?: string;
}