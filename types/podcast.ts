/**
 * ARCHIVE: types/podcast.ts
 * VERSION: 13.1 (NicePod Intelligence Station - Nominal Sovereignty Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * MISSION: Centralizar la tipificación de activos, estados y fuentes de investigación
 * bajo el Dogma Técnico Inmutable. Garantiza que el compilador sea la ley.
 * [REFORMA V13.0]: Nominal alignment of ResearchSource properties (snippetContentText,
 * summaryContentText) under ZAP. Optionality for authority metadata to ensure
 * validation schema compatibility.
 * INTEGRITY LEVEL: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { Database } from './database.types';

/** 
 * I. UTILIDADES DE EXTRACCIÓN SEMÁNTICA (METAL CORE)
 * Derivamos los tipos base directamente de la Fuente de Verdad (PostgreSQL).
 */
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// --- TIPOS BASE DEL ESQUEMA INDUSTRIAL ---
export type PodcastRow = Tables<'micro_pods'>;
export type ProfileRow = Tables<'profiles'>;
export type PodcastStatus = Enums<'podcast_status'>;
export type AssemblyStatus = Enums<'assembly_status'>;

/**
 * [TIPO GEOGRÁFICO]: Representación de PostGIS Geography(POINT, 4326)
 * Estándar de salida GeoJSON para la Malla de Madrid Resonance.
 */
export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitudeCoordinate, latitudeCoordinate]
}

/**
 * PointOfInterestRow
 * MISSION: Asegurar compatibilidad estricta con la bóveda de capital intelectual.
 */
export type PointOfInterestRow = "points_of_interest" extends keyof Database['public']['Tables']
  ? Tables<"points_of_interest">
  : {
      identification: number;
      name: string;
      category: string;
      descriptionTextContent: string | null;
      geographicLocation: GeoLocation | null;
      imageSummaryContent: string | null;
      referencePodcastIdentification: number | null;
      metadata: Record<string, unknown> | null;
      created_at: string;
      updated_at: string;
      galleryUniformResourceLocatorsCollection: string[] | null;
      richDescriptionContent: string | null;
      historicalFactContent: string | null;
      isPublished: boolean;
      importanceScoreMagnitude: number;
      resonanceRadiusMeters: number;
      embeddingVector: number[] | null;
      ambientAudioUniformResourceLocator: string | null;
      evidenceDataDossier: Record<string, unknown> | null;
    };

/**
 * INTERFAZ: PodcastScript
 * Estructura interna del campo 'script_text' (JSONB) para el Teleprompter.
 */
export interface PodcastScript {
  scriptBodyContent: string;   // Narrativa de alta fidelidad para síntesis neuronal.
  scriptPlainContent: string;  // Texto limpio y desprovisto de marcas para visualización.
  legacyText?: string;         // Soporte legacy para crónicas primitivas.
}

/**
 * INTERFAZ: ResearchSource
 * [REFORMA CRÍTICA V12.0]: Resolución de TS2345. 
 * 'relevance' se sella como number obligatorio para coincidir con el esquema Zod.
 */
export interface ResearchSource {
  title: string;
  uniformResourceLocator: string;
  sourceAuthorityName?: string;             // Origen de la autoridad de dominio
  sourceContentType?: string;               // Taxonomía de fuente (ej: 'paper', 'report')
  summaryContentText?: string;              // Abstract ejecutivo de la evidencia
  snippetContentText?: string;              // Fragmento clave detectado por el Oráculo
  fullContentText?: string;                 // Extracción profunda del documento
  authorityScoreValue?: number | null;      // Nivel de confianza pericial (0.0 - 10.0)
  isVeracityVerified?: boolean;             // Bandera de integridad cruzada
  relevance: number;                        // Relevancia contextual (TS2345 RESOLVED)
  origin: 'vault' | 'web' | 'fresh_research' | 'pulse_selection';
}

/**
 * INTERFAZ: LocalRecommendation
 * Nodos de interés detectados por el motor situacional.
 */
export interface LocalRecommendation {
  name: string;
  category: 'history' | 'food' | 'secret' | 'activity' | 'event' | string;
  descriptionTextContent: string;
  hasSpecificPodcastAttached: boolean;
  linkedPodcastIdentification?: string | number;
  actionUniformResourceLocator?: string;
  distanceInMeters?: number;
}

/**
 * INTERFAZ: DiscoveryContextPayload
 * Dossier de inteligencia táctica generado por el radar espacial.
 */
export interface DiscoveryContextPayload {
  narrativeHookText: string;
  recommendationsCollection: LocalRecommendation[];
  closingThoughtText: string;
  detectedPointOfInterestName?: string;
  imageAnalysisSummaryContent?: string;
}

/**
 * INTERFAZ: CreationMetadataPayload
 * [REFORMA V12.0]: Sincronización nominal total con el Cristal.
 */
export interface CreationMetadataPayload {
  style?: 'solo' | 'link' | 'archetype' | 'qa' | 'legacy' | 'remix' | 'local_concierge' | 'briefing';
  agentName?: string;
  creationMode: 'standard' | 'remix' | 'situational' | 'pulse' | 'geo_mode';
  discoveryContext?: DiscoveryContextPayload | null;
  geographicLocation?: {
    latitudeCoordinate: number;
    longitudeCoordinate: number;
    placeName?: string;
  } | null;
  inputs: {
    topic?: string;
    topicA?: string;   
    topicB?: string;   
    catalyst?: string; 
    motivationText?: string;
    goalText?: string;
    durationSelection?: string;
    narrativeDepth?: 'Superficial' | 'Intermedia' | 'Profunda' | string;
    depthValue?: string;
    toneSelection?: string;
    selectedTone?: string;
    voiceGenderSelection?: 'Masculino' | 'Femenino';
    voiceStyleSelection?: 'Calmado' | 'Energético' | 'Profesional' | 'Inspirador' | string;
    voicePaceSelection?: string;
    imageBase64Reference?: string;
    [key: string]: unknown; 
  };
  userReactionContent?: string;
  quoteContextReference?: string;
}

/**
 * TIPO MAESTRO: PodcastWithProfile
 * Objeto de datos unificado para toda la Workstation NicePod.
 */
export type PodcastWithProfile = Omit<PodcastRow, 'id' | 'user_id' | 'parent_id' | 'creation_data' | 'sources' | 'script_text' | 'ai_tags' | 'user_tags' | 'geo_location'> & {
  /** identification: Identificador unívoco del podcast (ZAP). */
  identification: number;
  /** id: Fallback de compatibilidad axial para utilidades de legado. */
  id: number;
  /** authorUserIdentification: Referencia al Voyager creador (ZAP). */
  authorUserIdentification: string;
  /** parentPodcastIdentification: Referencia al hito progenitor en hilos (ZAP). */
  parentPodcastIdentification: number | null;

  // Estado de Integridad Multimedia y Acústica
  isAudioReady: boolean;
  isImageReady: boolean;
  isEmbeddingReady: boolean;
  audioAssemblyStatus: AssemblyStatus;
  totalAudioSegmentsCount: number | null;
  currentAudioSegmentsCount: number | null;

  // Campos JSONB blindados con contratos estrictos
  creation_data: CreationMetadataPayload | null;
  sources: ResearchSource[] | null;
  script_text: PodcastScript | null;
  ai_tags: string[] | null;
  user_tags: string[] | null;

  // Extensiones Geoespaciales
  placeNameReference: string | null;
  geo_location: GeoLocation | null;

  // Identidad Soberana del Curador (Relational Mapping)
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    username: string;
    reputation_score: number | null;
    is_verified: boolean | null;
    role: string | null;
  } | null;
};

/**
 * TIPO GEOLÓGICO: PodcastWithGenealogy
 */
export type PodcastWithGenealogy = PodcastWithProfile & {
  repliesCollection?: PodcastWithProfile[];
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V12.0):
 * 1. Zero Abbreviations Policy (ZAP): Se han purificado todos los descriptores 
 *    (url -> uniformResourceLocator, id -> identification, context -> content).
 * 2. TS2345 Resolution: Al declarar 'relevance' como number (sin opcionalidad), 
 *    el compilador permitirá la asignación desde el esquema de Zod sin casting.
 * 3. Contractual Symmetry: Se han mapeado los campos del Metal ('creation_data') 
 *    hacia sus contrapartes nominales purificadas en el Cristal.
 */