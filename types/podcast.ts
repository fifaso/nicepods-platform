// types/podcast.ts
// VERSIÓN: 7.5 (Sovereign Integrity Standard - Full Production Edition)
// Misión: Establecer el contrato técnico absoluto para la visualización y creación de podcasts.
// [ESTABILIZACIÓN]: Resolución de error TS2344 mediante definición explícita de estados NSP.

import { Database } from './database.types';

/** 
 * UTILIDADES DE EXTRACCIÓN SEMÁNTICA
 * Derivamos los tipos base directamente de la Fuente de Verdad (PostgreSQL).
 */
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Tipos base inyectados desde el esquema de base de datos
export type PodcastRow = Tables<'micro_pods'>;
export type ProfileRow = Tables<'profiles'>;
export type PointOfInterestRow = Tables<'points_of_interest'>;
export type PodcastStatus = Enums<'podcast_status'>;

/**
 * INTERFAZ: AssemblyStatus
 * Define los estados del Protocolo de Streaming (NSP).
 * Declarado manualmente para asegurar compatibilidad inmediata con el compilador.
 */
export type AssemblyStatus = 'idle' | 'collecting' | 'assembling' | 'completed' | 'failed';

/**
 * INTERFAZ: PodcastScript
 * Define la estructura interna del campo 'script_text' tras la migración a JSONB.
 */
export interface PodcastScript {
  script_body: string;   // Versión narrativa completa para la IA de voz.
  script_plain: string;  // Versión limpia para teleprompter y búsqueda.
}

/**
 * INTERFAZ: ResearchSource
 * Contrato de transparencia bibliográfica para la investigación externa e interna.
 */
export interface ResearchSource {
  title: string;
  url: string;
  content?: string;
  origin: 'vault' | 'web' | 'fresh_research' | 'pulse_selection';
  relevance?: number;
}

/**
 * INTERFAZ: GeoLocationContext
 * Coordenadas y anclaje nominativo para el motor Madrid Resonance.
 */
export interface GeoLocationContext {
  latitude: number;
  longitude: number;
  placeName?: string;
  cityName?: string;
  country?: string;
}

/**
 * INTERFAZ: LocalRecommendation
 * Estructura de datos para los Puntos de Interés (POI) sugeridos por la IA.
 */
export interface LocalRecommendation {
  name: string;
  category: 'history' | 'food' | 'secret' | 'activity' | 'event' | string;
  description: string;
  has_specific_podcast: boolean;
  linked_podcast_id?: string | number;
  action_url?: string;
  distance_meters?: number;
}

/**
 * INTERFAZ: DiscoveryContextPayload
 * Dossier de inteligencia situacional que registra el veredicto de la ciudad.
 */
export interface DiscoveryContextPayload {
  narrative_hook: string;
  recommendations: LocalRecommendation[];
  closing_thought: string;
  detected_poi?: string;
  image_analysis_summary?: string;
}

/**
 * INTERFAZ: CreationMetadataPayload
 * Este es el contrato del campo 'creation_data' (JSONB).
 * Actúa como la "Caja Negra" que almacena toda la lógica e intención creativa.
 */
export interface CreationMetadataPayload {
  // Metodología y Agente utilizado
  style: 'solo' | 'link' | 'archetype' | 'qa' | 'legacy' | 'remix' | 'local_concierge';
  agentName: string;
  creation_mode: 'standard' | 'remix' | 'situational' | 'pulse';

  // Metadatos de interacción
  user_reaction?: string;
  quote_context?: string;

  // Bloque de inteligencia situacional (Madrid Resonance)
  discovery_context?: DiscoveryContextPayload;

  // Inputs originales recopilados en el Stepper de Creación
  inputs: {
    topic?: string;
    motivation?: string;
    goal?: string;
    duration?: string;
    narrativeDepth?: 'Superficial' | 'Intermedia' | 'Profunda';
    tone?: string;
    voiceGender?: 'Masculino' | 'Femenino';
    voiceStyle?: string;
    voicePace?: string;
    image_base64_reference?: string;
    [key: string]: any;
  };
}

/**
 * TIPO MAESTRO: PodcastWithProfile
 * Objeto de datos unificado que consume la Workstation NicePod.
 * Garantiza que las banderas de integridad y la identidad estén sincronizadas.
 */
export type PodcastWithProfile = Omit<PodcastRow, 'creation_data' | 'sources' | 'script_text'> & {
  // Banderas de Integridad del Protocolo NSP (NicePod Streaming Protocol)
  audio_ready: boolean;
  image_ready: boolean;
  audio_assembly_status: AssemblyStatus;
  total_audio_segments?: number;
  current_audio_segments?: number;

  // Inyección de interfaces estrictas sobre campos JSONB de base de datos
  creation_data: CreationMetadataPayload | null;
  sources: ResearchSource[] | null;
  script_text: PodcastScript | null;

  // Unión con la identidad del creador y sus métricas de reputación
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    username: string;
    reputation_score?: number;
    is_verified?: boolean;
    role?: string;
  } | null;
};

/**
 * TIPO: PodcastWithGenealogy
 * Extensión para manejar hilos de sabiduría y remixes encadenados.
 */
export type PodcastWithGenealogy = PodcastWithProfile & {
  replies?: PodcastWithProfile[];
};