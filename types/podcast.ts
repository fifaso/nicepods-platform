/**
 * ARCHIVE: types/podcast.ts
 * VERSION: 17.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 * 
 * MISSION: Sincronización de Soberanía de la Entidad Podcast.
 * Purificación absoluta: Eliminación definitiva de alias de legado y parches.
 * [REFORMA V17.0]: Remoción de campos @deprecated y sellado de nullabilidad.
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

export interface LocalRecommendation {
  name: string;
  category: 'history' | 'food' | 'secret' | 'activity' | 'event' | string;
  descriptionTextContent: string;
  hasSpecificPodcastAttached: boolean;
  linkedPodcastIdentification?: string | number;
  actionUniformResourceLocator?: string;
  distanceInMeters?: number;
}

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
  publicationTimestamp: string;

  // --- METADATA Y CONTENIDO (ZAP) ---
  titleTextContent: string;
  descriptionTextContent: string;
  contentCategory: string;
  publicationStatus: PodcastStatus;
  intelligenceProcessingStatus: ProcessingStatus;

  // --- ACTIVOS MULTIMEDIA (ZAP) ---
  audioUniformResourceLocator: string;
  coverImageUniformResourceLocator: string;
  playbackDurationSecondsTotal: number;

  // --- ESTADO DE INTEGRIDAD ---
  isAudioReady: boolean;
  isImageReady: boolean;
  isEmbeddingReady: boolean;
  isFeaturedContentStatus: boolean;
  audioAssemblyStatus: AssemblyStatus;
  totalAudioSegmentsCount: number;
  currentAudioSegmentsCount: number;

  // --- ANALÍTICA Y RENDIMIENTO ---
  playCountTotal: number;
  likeCountTotal: number;

  // --- DOSSIERS DE INTELIGENCIA (CRISTAL) ---
  creationMetadataDossier: CreationMetadataPayload | null;
  intelligenceSourcesCollection: ResearchSource[];
  podcastScriptDossier: PodcastScript | null;
  artificialIntelligenceTagsCollection: string[];
  userDefinedTagsCollection: string[];
  artificialIntelligenceSummaryContent: string;
  narrativeLensPerspective: string;
  artificialIntelligenceAgentVersion: string;

  // --- EXTENSIONES GEODÉSICAS ---
  placeNameReference: string;
  geographicLocationPoint: GeoLocation | null;
  quoteContextReference: string;
  quoteTimestampMagnitude: number;

  // --- NOTAS ADMINISTRATIVAS ---
  administrativeNotesContent: string;
  isReviewedByUserStatus: boolean;

  // --- PERFIL DE AUTORIDAD ---
  profiles: {
    fullName: string;
    avatarUniformResourceLocator: string;
    username: string;
    reputationScoreValue: number;
    isVerifiedAccountStatus: boolean;
    authorityRole: string;
  } | null;
}

export type PodcastWithGenealogy = PodcastWithProfile & {
  repliesCollection: PodcastWithProfile[];
};
