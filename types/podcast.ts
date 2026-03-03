// types/podcast.ts
// VERSIÓN: 8.1

import { Database } from './database.types';

/** 
 * UTILIDADES DE EXTRACCIÓN SEMÁNTICA
 * Derivamos los tipos base directamente de la Fuente de Verdad (PostgreSQL).
 */
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// --- TIPOS BASE DEL ESQUEMA ---
export type PodcastRow = Tables<'micro_pods'>;
export type ProfileRow = Tables<'profiles'>;
export type PodcastStatus = Enums<'podcast_status'>;

/**
 * [REMEDIACÍON TS2344]: PointOfInterestRow
 * Misión: Evitar que el build falle si 'database.types.ts' no se ha actualizado.
 * 
 * Si 'points_of_interest' existe en el esquema generado, extraemos su fila.
 * De lo contrario, usamos una interfaz manual que refleja nuestro último SQL.
 */
export type PointOfInterestRow = "points_of_interest" extends keyof Database['public']['Tables']
  ? Tables<"points_of_interest">
  : {
    id: number;
    name: string;
    category: string;
    description: string | null;
    geo_location: any;
    image_summary: string | null;
    reference_podcast_id: number | null;
    metadata: any | null;
    created_at: string;
    updated_at: string;
    gallery_urls: string[] | null;
    rich_description: string | null;
    historical_fact: string | null;
    is_published: boolean;
    importance_score: number;
    resonance_radius: number;
    embedding: number[] | null;
  };

/**
 * TIPO: AssemblyStatus
 * Define los estados del Protocolo de Streaming (NSP).
 */
export type AssemblyStatus = 'idle' | 'collecting' | 'assembling' | 'completed' | 'failed';

/**
 * INTERFAZ: PodcastScript
 * Estructura interna del campo 'script_text' (JSONB).
 */
export interface PodcastScript {
  script_body: string;   // Versión narrativa para TTS.
  script_plain: string;  // Versión limpia para teleprompter.
}

/**
 * INTERFAZ: ResearchSource
 * Contrato de transparencia bibliográfica.
 */
export interface ResearchSource {
  title: string;
  url: string;
  content?: string;
  origin: 'vault' | 'web' | 'fresh_research' | 'pulse_selection';
  relevance?: number;
}

/**
 * INTERFAZ: LocalRecommendation
 * Puntos de Interés sugeridos por la IA.
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
 * Dossier de inteligencia generado por Madrid Resonance.
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
 * Contrato del campo 'creation_data' (JSONB).
 */
export interface CreationMetadataPayload {
  style: 'solo' | 'link' | 'archetype' | 'qa' | 'legacy' | 'remix' | 'local_concierge';
  agentName: string;
  creation_mode: 'standard' | 'remix' | 'situational' | 'pulse';
  discovery_context?: DiscoveryContextPayload;
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
    [key: string]: unknown;
  };
  user_reaction?: string;
  quote_context?: string;
}

/**
 * TIPO MAESTRO: PodcastWithProfile
 * Objeto de datos unificado para la Workstation.
 */
export type PodcastWithProfile = Omit<PodcastRow, 'creation_data' | 'sources' | 'script_text' | 'ai_tags' | 'user_tags'> & {
  // Integridad NSP
  audio_ready: boolean;
  image_ready: boolean;
  audio_assembly_status: AssemblyStatus;
  total_audio_segments: number | null;
  current_audio_segments: number | null;

  // Campos JSONB tipados
  creation_data: CreationMetadataPayload | null;
  sources: ResearchSource[] | null;
  script_text: PodcastScript | null;
  ai_tags: string[] | null;
  user_tags: string[] | null;

  // Extensiones GEO
  place_name: string | null;
  geo_location: any;

  // Identidad del Curador
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
 * TIPO: PodcastWithGenealogy
 * Soporte para hilos de sabiduría.
 */
export type PodcastWithGenealogy = PodcastWithProfile & {
  replies?: PodcastWithProfile[];
};

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Tipado Condicional: La lógica en 'PointOfInterestRow' es un seguro de 
 *    despliegue. Permite que Vercel compile exitosamente incluso si los tipos 
 *    auto-generados de Supabase tienen un retraso respecto a las migraciones SQL.
 * 2. Cero Abreviaciones: Se han expandido todas las interfaces para reflejar 
 *    la densidad de datos del nuevo flujo multimodal de 3 pasos.
 * 3. Integridad ACiD: El uso de 'unknown' en la extensión de metadatos de 'inputs' 
 *    obliga a realizar verificaciones de tipo en el código, aumentando la robustez.
 */