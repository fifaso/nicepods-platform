// types/podcast.ts
// VERSIÓN: 10.0 (NicePod Intelligence Station - Full Contract Integrity)
// Misión: Centralizar la tipificación de activos, estados y fuentes de investigación.
// [ESTABILIZACIÓN]: Inyección de 'snippet' en ResearchSource y sincronía total con Schema V9.1.

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
export type AssemblyStatus = Enums<'assembly_status'>;

/**
 * [TIPO GEOGRÁFICO]: Representación de PostGIS Geography(POINT, 4326)
 * Estándar de salida GeoJSON para la Malla de Madrid Resonance.
 */
export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [Longitud, Latitud]
}

/**
 * [REMEDIACÍON TS2344]: PointOfInterestRow
 * Misión: Asegurar compatibilidad incluso ante latencia de sincronía de Supabase CLI.
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
  script_body: string;   // Narrativa para síntesis neuronal.
  script_plain: string;  // Texto limpio para visualización.
}

/**
 * INTERFAZ: ResearchSource
 * [FIX CRÍTICO V10.0]: Inyección de 'snippet' y sincronía de orígenes.
 * Esto resuelve el error ts(2339) en el paso final de creación.
 */
export interface ResearchSource {
  title: string;
  url: string;
  content?: string;
  snippet?: string; // <--- PROPIEDAD RESTAURADA
  origin: 'vault' | 'web' | 'fresh_research' | 'pulse_selection';
  relevance?: number;
}

/**
 * INTERFAZ: LocalRecommendation
 * Nodos de interés detectados por el motor situacional.
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
 * Contrato estricto del campo 'creation_data' (JSONB).
 */
export interface CreationMetadataPayload {
  style: 'solo' | 'link' | 'archetype' | 'qa' | 'legacy' | 'remix' | 'local_concierge' | 'briefing';
  agentName: string;
  creation_mode: 'standard' | 'remix' | 'situational' | 'pulse';
  discovery_context?: DiscoveryContextPayload | null;
  inputs: {
    topic?: string;
    motivation?: string;
    goal?: string;
    duration?: string;
    narrativeDepth?: 'Superficial' | 'Intermedia' | 'Profunda' | string;
    tone?: string;
    voiceGender?: 'Masculino' | 'Femenino';
    voiceStyle?: 'Calmado' | 'Energético' | 'Profesional' | 'Inspirador' | string;
    voicePace?: string;
    image_base64_reference?: string;
    [key: string]: unknown;
  };
  user_reaction?: string;
  quote_context?: string;
}

/**
 * TIPO MAESTRO: PodcastWithProfile
 * Objeto de datos unificado para toda la Workstation.
 * Integra la fila de PostgreSQL con metadatos de autoría y estructuras JSONB.
 */
export type PodcastWithProfile = Omit<PodcastRow, 'creation_data' | 'sources' | 'script_text' | 'ai_tags' | 'user_tags' | 'geo_location'> & {
  // Estado de Integridad Multimedia
  audio_ready: boolean;
  image_ready: boolean;
  embedding_ready: boolean;
  audio_assembly_status: AssemblyStatus;
  total_audio_segments: number | null;
  current_audio_segments: number | null;

  // Campos JSONB tipados
  creation_data: CreationMetadataPayload | null;
  sources: ResearchSource[] | null;
  script_text: PodcastScript | null;
  ai_tags: string[] | null;
  user_tags: string[] | null;

  // Extensiones Geoespaciales
  place_name: string | null;
  geo_location: GeoLocation | null;

  // Identidad del Curador (JOIN)
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
 * Soporte para la arquitectura social de hilos (Threads).
 */
export type PodcastWithGenealogy = PodcastWithProfile & {
  replies?: PodcastWithProfile[];
};

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Soldadura de Tipos: La inclusión de 'snippet' en 'ResearchSource' cierra el 
 *    circuito de validación con el esquema de Zod V9.1.
 * 2. Cero Abreviaciones: Se han expandido los tipos de 'voiceStyle' y 'narrativeDepth' 
 *    para soportar los nuevos motores de síntesis de Gemini 3.0.
 * 3. Protección de Datos: El uso de 'Omit' garantiza que no existan colisiones 
 *    entre el tipo 'jsonb' genérico de Postgres y nuestras interfaces estructuradas.
 */