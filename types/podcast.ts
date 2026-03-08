// types/podcast.ts
// VERSIÓN: 9.0 (NicePod Intelligence Station - Strict Contract Edition)
// Misión: Centralizar la tipificación de activos y estados del ecosistema NicePod V2.5.
// [ESTABILIZACIÓN]: Eliminación de tipos 'any', unificación con PostgreSQL Enums y tipado geoespacial.

import { Database } from './database.types';

/** 
 * UTILIDADES DE EXTRACCIÓN SEMÁNTICA
 * Derivamos los tipos base directamente de la Fuente de Verdad (PostgreSQL Autogenerado).
 */
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// --- TIPOS BASE DEL ESQUEMA ---
export type PodcastRow = Tables<'micro_pods'>;
export type ProfileRow = Tables<'profiles'>;
export type PodcastStatus = Enums<'podcast_status'>;
export type AssemblyStatus = Enums<'assembly_status'>;

/**
 * [TIPO GEOGRÁFICO]: Representación de PostGIS Geography(POINT, 4326)
 * Esta estructura asegura que TypeScript entienda la respuesta de PostGIS al consultar geo_location.
 */
export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [Longitud, Latitud]
}

/**
 * [REMEDIACÍON TS2344]: PointOfInterestRow
 * Misión: Asegurar compatibilidad con el esquema evolutivo de Madrid Resonance.
 */
export type PointOfInterestRow = "points_of_interest" extends keyof Database['public']['Tables']
  ? Tables<"points_of_interest">
  : {
      id: number;
      name: string;
      category: string;
      description: string | null;
      geo_location: GeoLocation | null;
      image_summary: string | null;
      reference_podcast_id: number | null;
      metadata: Record<string, unknown> | null;
      created_at: string;
      updated_at: string;
      gallery_urls: string[] | null;
      rich_description: string | null;
      historical_fact: string | null;
      is_published: boolean;
      importance_score: number;
      resonance_radius: number;
      embedding: number[] | null;
      ambient_audio_url: string | null;
      evidence_data: Record<string, unknown> | null;
    };

/**
 * INTERFAZ: PodcastScript
 * Estructura interna del campo 'script_text' (JSONB).
 */
export interface PodcastScript {
  script_body: string;   // Versión narrativa para TTS neuronal.
  script_plain: string;  // Versión limpia para teleprompter.
}

/**
 * INTERFAZ: ResearchSource
 * Contrato de transparencia bibliográfica y origen del dato.
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
 * Estructura para nodos de interés detectados por el Radar.
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
 * Dossier de inteligencia generado por el núcleo cognitivo de NicePod.
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
 * Contrato estricto del campo 'creation_data' (JSONB).
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
 * Combina la fila de base de datos con los metadatos de autoría y las estructuras expandidas JSONB.
 */
export type PodcastWithProfile = Omit<PodcastRow, 'creation_data' | 'sources' | 'script_text' | 'ai_tags' | 'user_tags' | 'geo_location'> & {
  // Integridad NSP
  audio_ready: boolean;
  image_ready: boolean;
  audio_assembly_status: AssemblyStatus;
  total_audio_segments: number | null;
  current_audio_segments: number | null;

  // Campos JSONB tipados rigurosamente
  creation_data: CreationMetadataPayload | null;
  sources: ResearchSource[] | null;
  script_text: PodcastScript | null;
  ai_tags: string[] | null;
  user_tags: string[] | null;

  // Extensiones GEO: Tipado claro tras el saneamiento a PostGIS Geography
  place_name: string | null;
  geo_location: GeoLocation | null;

  // Identidad del Curador (Resultado del JOIN en Supabase)
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
 * Soporte para hilos de sabiduría (Reply threads).
 */
export type PodcastWithGenealogy = PodcastWithProfile & {
  replies?: PodcastWithProfile[];
};

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Saneamiento Geoespacial: 'GeoLocation' ahora define explícitamente [lon, lat], 
 *    eliminando el uso de 'any'. Esto permite al frontend navegar por los datos 
 *    con autocompletado y seguridad.
 * 2. Integridad de Estados: AssemblyStatus y PodcastStatus ahora dependen de 
 *    Enums reales de Postgres, evitando desincronías entre el backend y el cliente.
 * 3. Robustez JSONB: CreationMetadataPayload obliga a definir la estructura de 
 *    las herramientas de IA, lo que garantiza que no perderemos información 
 *    al procesar podcasts complejos.
 */