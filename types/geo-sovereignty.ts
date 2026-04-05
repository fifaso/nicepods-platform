/**
 * ARCHIVO: types/geo-sovereignty.ts
 * VERSIÓN: 8.5 (NicePod Sovereign Constitution - Full Descriptive Integrity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Centralizar el contrato de identidad, telemetría y control cinemático,
 * garantizando la sintonía absoluta entre el hardware, el oráculo y el pintor WebGL.
 * [REFORMA V8.5]: Erradicación total y absoluta de abreviaciones. Implementación 
 * de la Taxonomía Granular V4.0, Reloj Soberano y Grounding Pericial.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
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
 * TelemetrySource: Definición del origen de la verdad geográfica.
 */
export type TelemetrySource = 
  | 'gps' 
  | 'cache' 
  | 'ip-fallback' 
  | 'manual-anchor' 
  | 'edge-ip';

/**
 * UserLocation: Snapshot de telemetría purificada capturada por el hardware.
 */
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
 * ActivePointOfInterest: Representación de un hito cercano detectado por el Radar.
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

/**
 * CategoryMission: El Eje Funcional (Lo que el Voyager busca satisfacer).
 */
export type CategoryMission = 
  | 'infraestructura_vital'
  | 'memoria_soberana'
  | 'capital_intelectual'
  | 'resonancia_sensorial';

/**
 * CategoryEntity: El Eje Físico (Clasificación pericial del hito).
 */
export type CategoryEntity =
  | 'aseo_premium' | 'nodo_hidratacion' | 'refugio_climatico' | 'terminal_energia' | 'zona_segura'
  | 'monumento_nacional' | 'placa_sintonia' | 'yacimiento_ruina' | 'leyenda_urbana' | 'arquitectura_epoca'
  | 'museo_sabiduria' | 'atelier_galeria' | 'libreria_autor' | 'centro_innovacion' | 'intervencion_plastica'
  | 'mirador_estrategico' | 'paisaje_sonoro' | 'pasaje_secreto' | 'mercado_origen' | 'obrador_tradicion';

/**
 * HistoricalEpoch: El Eje Temporal para la sintonización prosódica de la IA.
 */
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

/**
 * PointOfInterestLifecycle: Estados legales de un nodo en la base de datos.
 */
export type PointOfInterestLifecycle =
  | 'ingested'
  | 'analyzed'
  | 'narrated'
  | 'published'
  | 'archived';

/**
 * GeoEngineState: Estados operativos de la Workstation.
 */
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

/**
 * PointOfInterestMetadata: Tipado estricto para la inteligencia extendida.
 */
export interface PointOfInterestMetadata {
  urban_context?: string;
  architectural_period?: string;
  custom_tags?: string[];
  curator_notes?: string;
  external_source_url?: string;
  grounding_summary?: string;
  processing_trace_identification?: string;
}

/**
 * PointOfInterest: El objeto de conocimiento central.
 */
export interface PointOfInterest {
  id: number;
  author_identification: string;
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
  reference_podcast_identification: number | null;
  created_at: string;
  updated_at: string;
  metadata?: PointOfInterestMetadata | null;
}

/**
 * IngestionDossier: El resultado del peritaje técnico de la IA.
 */
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
    groundingVerification?: string; // [FIX V8.5]: Requerido para Step 3
  };
  sensor_accuracy: number;
  ingested_at: string;
}

/**
 * ---------------------------------------------------------------------------
 * V. CONTRATOS DE INTERFACE Y HOOKS (LA FACHADA SOBERANA)
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
 * GeoEngineReturn: La firma pública que la Fachada (useGeoEngine) entrega a la UI.
 */
export interface GeoEngineReturn {
  // Estados y Telemetría
  status: GeoEngineState;
  data: GeoContextData;
  userLocation: UserLocation | null;
  nearbyPointsOfInterest: PointOfInterest[];
  activePointOfInterest: ActivePointOfInterest | null;
  isSearching: boolean;
  isLocked: boolean;
  error: string | null;

  // Capacidades de Soberanía
  isIgnited: boolean;
  isTriangulated: boolean;
  isGPSLock: boolean;
  needsBallisticLanding: boolean;
  recenterTrigger: number;
  confirmLanding: () => void;

  // Gobernanza de Cámara y Estilo
  cameraPerspective: CameraPerspective;
  mapStyle: string; 
  isManualMode: boolean;
  toggleCameraPerspective: () => void;
  setManualMode: (active: boolean) => void;
  recenterCamera: () => void;

  // Métodos de Control
  initSensors: () => void;
  reSyncRadar: () => void;
  setTriangulated: () => void;
  setManualAnchor: (longitude: number, latitude: number) => void;
  setManualPlaceName: (name: string) => void;

  // Flujos de Inteligencia Multidimensional
  ingestSensoryData: (parameters: {
    heroImage: File;
    ocrImages: File[];
    ambientAudio?: Blob | null;
    intentText: string;
    intentAudioBlob?: Blob | null; // Soporte para Dictado Sensorial
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
  trace_identification?: string;
}

/**
 * PointOfInterestCreationPayload: Contrato para la Ingesta Lightning (Signed URLs).
 */
export interface PointOfInterestCreationPayload {
  latitude: number;
  longitude: number;
  accuracy: number;
  heroImageStoragePath: string; 
  ocrImageStoragePaths: string[]; 
  categoryMission: string;
  categoryEntity: string;
  historicalEpoch: string;
  resonanceRadius: number;
  adminIntent: string;
  referenceUrl?: string;
}