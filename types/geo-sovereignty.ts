/**
 * ARCHIVO: types/geo-sovereignty.ts
 * VERSIÓN: 8.6 (NicePod Sovereign Constitution - Absolute Nominal Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Centralizar el contrato de identidad, telemetría y control cinemático,
 * garantizando la sintonía absoluta entre el hardware de silicio, el oráculo 
 * de inteligencia y el motor de renderizado WebGL.
 * [REFORMA V8.6]: Sincronización nominal total con la Reforma V4.1 (poi-schema.ts) 
 * y las Acciones Geográficas V12.0. Erradicación absoluta de acrónimos (ZAP), 
 * sellado del Build Shield (BSS) y normalización del Dossier de Inteligencia.
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
  coordinates: [number, number]; // [longitudeCoordinate, latitudeCoordinate]
}

/**
 * TelemetrySource: Definición del origen de la verdad geográfica.
 */
export type TelemetrySource = 
  | 'global-positioning-system' 
  | 'cache' 
  | 'internet-protocol-fallback' 
  | 'manual-anchor' 
  | 'edge-internet-protocol';

/**
 * UserLocation: Snapshot de telemetría purificada capturada por el hardware.
 */
export interface UserLocation {
  latitudeCoordinate: number;
  longitudeCoordinate: number;
  accuracyMeters: number;
  headingDegrees: number | null;
  speedMetersPerSecond: number | null;
  geographicSource?: TelemetrySource;
  timestamp?: number;
}

/**
 * ActivePointOfInterest: Representación de un hito cercano detectado por el Radar.
 */
export interface ActivePointOfInterest {
  identification: string;
  name: string;
  distanceMeters: number;
  isWithinRadius: boolean;
  historicalFact?: string;
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

export type MapInstanceIdentification = 'map-full' | 'map-dashboard' | 'map-forge' | 'map-sentinel';

export type NarrativeDepth = 'flash' | 'cronica' | 'inmersion';

export type NarrativeTone = 'academico' | 'misterioso' | 'epico' | 'melancolico' | 'neutro';

/**
 * ---------------------------------------------------------------------------
 * IV. ENTIDADES MAESTRAS (BÓVEDA NKV)
 * ---------------------------------------------------------------------------
 */

export interface PointOfInterestMetadata {
  urbanContext?: string;
  architecturalPeriod?: string;
  customTagsCollection?: string[];
  curatorNotes?: string;
  externalSourceUniformResourceLocator?: string;
  groundingSummary?: string;
  processingTraceIdentification?: string;
}

/**
 * PointOfInterest: El objeto de conocimiento central anclado en el Metal.
 */
export interface PointOfInterest {
  identification: number;
  authorIdentification: string;
  name: string;
  categoryMission: CategoryMission;
  categoryEntity: CategoryEntity;
  historicalEpoch: HistoricalEpoch;
  geographicLocation: GeoPoint;
  resonanceRadiusMeters: number;
  importanceScore: number;
  historicalFact: string | null;
  richDescription: string | null;
  galleryUniformResourceLocatorsCollection: string[] | null;
  ambientAudioUniformResourceLocator: string | null;
  status: PointOfInterestLifecycle;
  isPublished: boolean;
  referencePodcastIdentification: number | null;
  creationTimestamp: string;
  updateTimestamp: string;
  metadata?: PointOfInterestMetadata | null;
}

/**
 * IngestionDossier: El resultado del peritaje técnico multidimensional.
 * [MANDATO BSS]: Sincronizado milimétricamente con IntelligenceAgencyAnalysisSchema.
 */
export interface IngestionDossier {
  point_of_interest_identification: number;
  raw_optical_character_recognition_text: string | null;
  weather_snapshot: {
    temperatureCelsius: number;
    conditionText: string;
    isDaytime: boolean;
    windKilometersPerHour?: number;
  };
  visual_analysis_dossier: {
    historicalDossier: string;
    architectureStyle?: string;
    atmosphere?: string;
    detectedElementsCollection?: string[];
    detectedOfficialName?: string;
    administratorOriginalIntent?: string;
    groundingVerification?: string; 
  };
  hardware_sensor_accuracy: number;
  ingested_at_timestamp: string;
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
 * GeoEngineReturn: La firma pública que la Fachada entrega a la Interfaz de Usuario.
 */
export interface GeoEngineReturn {
  // Estados de Verdad y Telemetría Purificada
  status: GeoEngineState;
  data: GeoContextData;
  userLocation: UserLocation | null;
  nearbyPointsOfInterest: PointOfInterest[];
  activePointOfInterest: ActivePointOfInterest | null;
  isSearching: boolean;
  isLocked: boolean;
  error: string | null;

  // Capacidades de Soberanía de Hardware
  isIgnited: boolean;
  isTriangulated: boolean;
  isGPSLock: boolean;
  needsBallisticLanding: boolean;
  recenterTrigger: number;
  confirmLanding: () => void;

  // Gobernanza de Cámara y Estilo Visual
  cameraPerspective: CameraPerspective;
  mapStyle: string; 
  isManualMode: boolean;
  toggleCameraPerspective: () => void;
  setManualMode: (active: boolean) => void;
  recenterCamera: () => void;

  // Métodos de Control Táctico
  initSensors: () => void;
  reSyncRadar: () => void;
  setTriangulated: () => void;
  setManualAnchor: (longitudeCoordinate: number, latitudeCoordinate: number) => void;
  setManualPlaceName: (placeName: string) => void;

  // Pipeline de Inteligencia Multidimensional
  ingestSensoryData: (parameters: {
    heroImage: File;
    opticalCharacterRecognitionImages: File[];
    ambientAudioBlob?: Blob | null;
    administratorIntentText: string;
    intentAudioBlob?: Blob | null; 
    categoryMission: CategoryMission;
    categoryEntity: CategoryEntity;
    historicalEpoch: HistoricalEpoch;
    resonanceRadiusMeters: number;
    referenceUniformResourceLocator?: string; 
  }) => Promise<{ pointOfInterestIdentification: number; dossier: IngestionDossier } | void>;

  synthesizeNarrative: (parameters: {
    pointOfInterestIdentification: number; 
    narrativeDepth: NarrativeDepth;
    narrativeTone: NarrativeTone;
    refinedAdministratorIntent?: string;
  }) => Promise<void>;

  transcribeVoiceIntent: (audioBase64Data: string) => Promise<GeoActionResponse<{ transcriptionText: string }>>;
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
  latitudeCoordinate: number;
  longitudeCoordinate: number;
  accuracyMeters: number;
  heroImageStoragePath: string; 
  opticalCharacterRecognitionImagePaths: string[]; 
  categoryMission: string;
  categoryEntity: string;
  historicalEpoch: string;
  resonanceRadiusMeters: number;
  administratorIntent: string;
  referenceUniformResourceLocator?: string;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V8.6):
 * 1. Build Shield Synchronization: Se han renombrado todas las propiedades para 
 *    satisfacer los errores TS2339 y TS2353 detectados tras la reforma de las acciones.
 * 2. Zero Abbreviations Policy: Se han purificado términos técnicos: URL -> UniformResourceLocator, 
 *    ID -> Identification, GPS -> GlobalPositioningSystem, OCR -> OpticalCharacterRecognition.
 * 3. Contractual Symmetry: El IngestionDossier ahora refleja exactamente la estructura 
 *    validada por el IntelligenceAgencyAnalysisSchema en el Borde.
 */