/**
 * ARCHIVE: types/podcast.ts
 * VERSION: 16.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 * 
 * MISSION: Sincronización de Soberanía de la Entidad Podcast.
 * [REFORMA V16.0]: Restauración de alias de compatibilidad (@deprecated) para
 * mantener el Build Shield (BSS) mientras se completa la transición axial.
 *
 * NIVEL DE INTEGRIDAD: 100% (Soberanía Nominal V7.0)
 */

import { Database } from './database.types';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

export type PodcastRow = Tables<'micro_pods'>;
export type ProfileRow = Tables<'profiles'>;
export type PodcastStatus = Enums<'podcast_status'>;
export type AssemblyStatus = Enums<'assembly_status'>;
export type ProcessingStatus = Enums<'processing_status'>;

export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number];
}

export interface PodcastScript {
  scriptBodyContent: string;
  scriptPlainContent: string;
  legacyText?: string;
}

export interface ResearchSource {
  title: string;
  uniformResourceLocator: string;
  sourceAuthorityName?: string;
  sourceContentType?: string;
  summaryContentText?: string;
  snippetContentText?: string;
  fullContentText?: string;
  authorityScoreValue?: number | null;
  isVeracityVerified?: boolean;
  relevance: number;
  origin: 'vault' | 'web' | 'fresh_research' | 'pulse_selection';
}

/**
 * INTERFAZ: LocalRecommendation
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
 */
export interface DiscoveryContextPayload {
  narrativeHookText: string;
  recommendationsCollection: LocalRecommendation[];
  closingThoughtText: string;
  detectedPointOfInterestName?: string;
  imageAnalysisSummaryContent?: string;
}

export interface CreationMetadataPayload {
  style?: string;
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
    [key: string]: any;
  };
  userReactionContent?: string;
  quoteContextReference?: string;
}

/**
 * TIPO MAESTRO: PodcastWithProfile
 * Misión: Representación soberana del activo Podcast en el Crystal.
 */
export interface PodcastWithProfile {
  // --- IDENTIDAD SOBERANA (ZAP) ---
  identification: number;
  authorUserIdentification: string;
  parentPodcastIdentification: number | null;
  rootPodcastIdentification: number | null;
  creationTimestamp: string;
  updateTimestamp: string;
  publicationTimestamp: string | null;

  // --- METADATA Y CONTENIDO (ZAP) ---
  titleTextContent: string;
  descriptionTextContent: string | null;
  contentCategory: string | null;
  publicationStatus: PodcastStatus;
  intelligenceProcessingStatus: ProcessingStatus;

  // --- ACTIVOS MULTIMEDIA (ZAP) ---
  audioUniformResourceLocator: string | null;
  coverImageUniformResourceLocator: string | null;
  playbackDurationSecondsTotal: number | null;

  // --- ESTADO DE INTEGRIDAD ---
  isAudioReady: boolean;
  isImageReady: boolean;
  isEmbeddingReady: boolean;
  isFeaturedContentStatus: boolean | null;
  audioAssemblyStatus: AssemblyStatus | null;
  totalAudioSegmentsCount: number | null;
  currentAudioSegmentsCount: number | null;

  // --- ANALÍTICA Y RENDIMIENTO ---
  playCountTotal: number;
  likeCountTotal: number;

  // --- DOSSIERS DE INTELIGENCIA (CRISTAL) ---
  creationMetadataDossier: CreationMetadataPayload | null;
  intelligenceSourcesCollection: ResearchSource[] | null;
  podcastScriptDossier: PodcastScript | null;
  artificialIntelligenceTagsCollection: string[] | null;
  userDefinedTagsCollection: string[] | null;
  artificialIntelligenceSummaryContent: string | null;
  narrativeLensPerspective: string | null;
  artificialIntelligenceAgentVersion: string | null;

  // --- EXTENSIONES GEODÉSICAS ---
  placeNameReference: string | null;
  geographicLocationPoint: GeoLocation | null;
  quoteContextReference: string | null;
  quoteTimestampMagnitude: number | null;

  // --- NOTAS ADMINISTRATIVAS ---
  administrativeNotesContent: string | null;
  isReviewedByUserStatus: boolean | null;

  // --- PERFIL DE AUTORIDAD ---
  profiles: {
    fullName: string | null;
    avatarUniformResourceLocator: string | null;
    username: string;
    reputationScoreValue: number | null;
    isVerifiedAccountStatus: boolean | null;
    authorityRole: string | null;
    // Fallbacks para perfiles SSR
    full_name?: string | null;
    avatar_url?: string | null;
    reputation_score?: number | null;
    is_verified?: boolean | null;
    role?: string | null;
  } | null;

  // --- ALIAS DE COMPATIBILIDAD (AXIAL INTEGRITY - @deprecated) ---
  /** @deprecated Use identification */
  id: number;
  /** @deprecated Use authorUserIdentification */
  user_id: string;
  /** @deprecated Use parentPodcastIdentification */
  parent_id: number | null;
  /** @deprecated Use titleTextContent */
  title: string;
  /** @deprecated Use descriptionTextContent */
  description: string | null;
  /** @deprecated Use publicationStatus */
  status: PodcastStatus;
  /** @deprecated Use intelligenceProcessingStatus */
  processing_status: ProcessingStatus;
  /** @deprecated Use audioUniformResourceLocator */
  audio_url: string | null;
  /** @deprecated Use coverImageUniformResourceLocator */
  cover_image_url: string | null;
  /** @deprecated Use playbackDurationSecondsTotal */
  duration_seconds: number | null;
  /** @deprecated Use creationTimestamp */
  created_at: string;
  /** @deprecated Use likeCountTotal */
  like_count: number;
  /** @deprecated Use playCountTotal */
  play_count: number;
  /** @deprecated Use creationMetadataDossier */
  creation_data: any;
  /** @deprecated Use intelligenceSourcesCollection */
  sources: any;
  /** @deprecated Use podcastScriptDossier */
  script_text: any;
  /** @deprecated Use artificialIntelligenceTagsCollection */
  ai_tags: any;
  /** @deprecated Use geographicLocationPoint */
  geo_location: any;
  /** @deprecated Use isAudioReady */
  audio_ready: boolean;
  /** @deprecated Use isImageReady */
  image_ready: boolean;
  /** @deprecated Use userDefinedTagsCollection */
  user_tags: string[] | null;
  /** @deprecated Use placeNameReference */
  place_name: string | null;
  /** @deprecated Use isFeaturedContentStatus */
  is_featured: boolean | null;
  /** @deprecated Use isReviewedByUserStatus */
  reviewed_by_user: boolean | null;
  /** @deprecated Use creationMetadataDossier?.creationMode */
  creation_mode: any;
}

export type PodcastWithGenealogy = PodcastWithProfile & {
  repliesCollection?: PodcastWithProfile[];
};
