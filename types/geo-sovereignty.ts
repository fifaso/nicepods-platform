/**
 * ARCHIVO: types/geo-sovereignty.ts
 * VERSIÓN: 9.0 (NicePod Sovereign Constitution - Contract Synchronization Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Centralizar el contrato de identidad, telemetría y control cinemático,
 * garantizando la sintonía absoluta entre el hardware de silicio, el oráculo 
 * de inteligencia y el motor de renderizado WebGL.
 * [REFORMA V9.0]: Sincronización nominal total con la Refacción Cinemática V4.9.10. 
 * Se actualiza la interfaz 'GeoEngineReturn' para incluir el Mando Único 
 * Contextual y nombres industriales purificados (ZAP). Sellado del 
 * Build Shield Sovereignty (BSS).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

/**
 * ---------------------------------------------------------------------------
 * I. TOPOLOGÍA Y POSICIONAMIENTO (ESTÁNDAR POSTGIS)
 * ---------------------------------------------------------------------------
 */

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitudeCoordinate, latitudeCoordinate]
}

export type TelemetrySource = 
  | 'global-positioning-system' 
  | 'cache' 
  | 'internet-protocol-fallback' 
  | 'manual-anchor' 
  | 'edge-internet-protocol';

export interface UserLocation {
  latitudeCoordinate: number;
  longitudeCoordinate: number;
  accuracyMeters: number;
  headingDegrees: number | null;
  speedMetersPerSecond: number | null;
  geographicSource?: TelemetrySource;
  timestamp?: number;
}

export interface ActivePointOfInterest {
  identification: string;
  name: string;
  distanceMeters: number;
  isWithinRadius: boolean;
  historicalFact?: string;
}

/**
 * ---------------------------------------------------------------------------
 * II. TAXONOMÍA GRANULAR Y RELOJ SOBERANO
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
 * GeoEngineReturn: La firma pública unificada de la Workstation.
 * [SINCRO V9.0]: Actualización de descriptores industriales para resolver TS2339.
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
  
  /** recenterTriggerPulse: Contador de pulsos para la sincronía de cámara. */
  recenterTriggerPulse: number; 
  confirmLanding: () => void;

  // Gobernanza de Cámara y Estilo Visual
  cameraPerspective: CameraPerspective;
  /** activeMapStyle: Identificador del lienzo WebGL en uso. */
  activeMapStyle: string; 
  /** isManualModeActive: Indica si el Voyager posee autoridad sobre la lente. */
  isManualModeActive: boolean; 
  
  /** executeUnifiedCommandAction: Actuador contextual para el botón de ubicación. */
  executeUnifiedCommandAction: () => void;
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
 * VI. RESPUESTAS Y PAYLOADS DE ACCIÓN
 * ---------------------------------------------------------------------------
 */

export interface GeoActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  trace_identification?: string;
}

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
 * NOTA TÉCNICA DEL ARCHITECT (V9.0):
 * 1. Build Shield Restoration: Se han renombrado 'recenterTrigger' a 'recenterTriggerPulse' 
 *    y 'isManualMode' a 'isManualModeActive' para coincidir con la lógica interna.
 * 2. ZAP Compliance: Purificación nominal total. Se introduce 'activeMapStyle' 
 *    y 'executeUnifiedCommandAction' en la firma pública.
 * 3. Contractual Symmetry: Los componentes ahora pueden desestructurar las 
 *    propiedades de 'useGeoEngine' sin disparar errores de propiedad inexistente.
 */