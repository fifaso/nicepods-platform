/**
 * ARCHIVE: types/podcast.ts
 * VERSION: 14.1 (Purifier Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V5.1
 * 
 * MISSION: Sincronización de Soberanía de la Entidad Podcast.
 * Purificación del Crystal mediante la erradicación de fugas snake_case
 * y alineación con el Dogma Técnico ZAP.
 * [REFORMA V14.1]: Restauración de interfaces auxiliares (LocalRecommendation,
 * DiscoveryContextPayload) para mantener el Build Shield.
 */

import { Database } from './database.types';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

export type PodcastRow = Tables<'micro_pods'>;
export type ProfileRow = Tables<'profiles'>;
export type PodcastStatus = Enums<'podcast_status'>;
export type AssemblyStatus = Enums<'assembly_status'>;

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
export type PodcastWithProfile = Omit<PodcastRow,
  'id' | 'user_id' | 'parent_id' | 'creation_data' | 'sources' | 'script_text' |
  'ai_tags' | 'user_tags' | 'geo_location' | 'place_name' | 'created_at' |
  'audio_ready' | 'image_ready' | 'embedding_ready' |
  'total_audio_segments' | 'current_audio_segments' | 'audio_assembly_status'
> & {
  // --- IDENTIDAD SOBERANA (ZAP) ---
  identification: number;
  authorUserIdentification: string;
  parentPodcastIdentification: number | null;
  creationTimestamp: string;

  // --- ESTADO DE INTEGRIDAD ---
  isAudioReady: boolean;
  isImageReady: boolean;
  isEmbeddingReady: boolean;
  audioAssemblyStatus: AssemblyStatus | null;
  totalAudioSegmentsCount: number | null;
  currentAudioSegmentsCount: number | null;

  // --- DOSSIERS DE INTELIGENCIA (CRISTAL) ---
  creationMetadataDossier: CreationMetadataPayload | null;
  intelligenceSourcesCollection: ResearchSource[] | null;
  podcastScriptDossier: PodcastScript | null;
  artificialIntelligenceTagsCollection: string[] | null;
  userTagsCollection: string[] | null;

  // --- EXTENSIONES GEODÉSICAS ---
  placeNameReference: string | null;
  geographicLocationPoint: GeoLocation | null;

  // --- COMPATIBILIDAD AXIAL (LEGACY FALLBACKS) ---
  /** @deprecated Utilizar 'identification' */
  id: number;
  /** @deprecated Utilizar 'authorUserIdentification' */
  user_id: string;
  /** @deprecated Utilizar 'parentPodcastIdentification' */
  parent_id: number | null;
  /** @deprecated Utilizar 'creationTimestamp' */
  created_at: string;
  /** @deprecated Utilizar 'creationMetadataDossier' */
  creation_data: any;
  /** @deprecated Utilizar 'intelligenceSourcesCollection' */
  sources: any;
  /** @deprecated Utilizar 'podcastScriptDossier' */
  script_text: any;
  /** @deprecated Utilizar 'artificialIntelligenceTagsCollection' */
  ai_tags: any;
  /** @deprecated Utilizar 'geographicLocationPoint' */
  geo_location: any;
  /** @deprecated Utilizar 'isAudioReady' */
  audio_ready: boolean;
  /** @deprecated Utilizar 'isImageReady' */
  image_ready: boolean;
  /** @deprecated Utilizar 'userTagsCollection' */
  user_tags: string[] | null;
  /** @deprecated Utilizar 'placeNameReference' */
  place_name: string | null;

  // --- PERFIL DE AUTORIDAD ---
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    username: string;
    reputation_score: number | null;
    is_verified: boolean | null;
    role: string | null;
  } | null;
};

export type PodcastWithGenealogy = PodcastWithProfile & {
  repliesCollection?: PodcastWithProfile[];
};
