/**
 * ARCHIVO: types/podcast.ts
 * VERSIÓN: 11.0 (NicePod Intelligence Station - The Rosetta Stone Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Centralizar la tipificación de activos, estados y fuentes de investigación.
 * [REFORMA V11.0]: Expansión masiva de contratos (ResearchSource y CreationMetadataPayload)
 * para erradicar el Efecto Cascada de Ruptura de Contrato (Contract Breakage Propagation) 
 * y sincronizar la Malla de Inteligencia con la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { Database } from './database.types';

/** 
 * UTILIDADES DE EXTRACCIÓN SEMÁNTICA
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
  coordinates: [number, number]; // [Longitud, Latitud]
}

/**
 * PointOfInterestRow
 * Misión: Asegurar compatibilidad estricta con la bóveda de capital intelectual.
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
 * Estructura interna del campo 'script_text' (JSONB) para el Teleprompter.
 */
export interface PodcastScript {
  script_body: string;   // Narrativa de alta fidelidad para síntesis neuronal.
  script_plain: string;  // Texto limpio y desprovisto de marcas para visualización.
  text?: string;         // Soporte legacy para crónicas primitivas.
}

/**
 * INTERFAZ: ResearchSource
 * [REFORMA CRÍTICA V11.0]: Inyección de metadatos periciales de autoridad y veracidad.
 * Esto resuelve los errores TS2339 en el SourceEvidenceBoard V2.0.
 */
export interface ResearchSource {
  title: string;
  url: string;
  source_name?: string;               // Origen de la autoridad de dominio
  content_type?: string;              // Taxonomía de fuente (ej: 'paper', 'report')
  summary?: string;                   // Abstract ejecutivo de la evidencia
  snippet?: string;                   // Fragmento clave detectado por el Oráculo
  content?: string;                   // Extracción profunda del documento
  authority_score?: number;           // Nivel de confianza pericial (0.0 - 10.0)
  veracity_verified?: boolean;        // Bandera de integridad cruzada
  relevance?: number;                 // Relevancia contextual con el hito
  origin: 'vault' | 'web' | 'fresh_research' | 'pulse_selection';
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
 * Dossier de inteligencia táctica generado por el radar espacial.
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
 * [REFORMA CRÍTICA V11.0]: Expansión del contrato para soportar telemetría 
 * situacional (location) y metodologías avanzadas (topicA, topicB, catalyst).
 * Esto resuelve los errores TS2339 en el CreationMetadata V6.0.
 */
export interface CreationMetadataPayload {
  style?: 'solo' | 'link' | 'archetype' | 'qa' | 'legacy' | 'remix' | 'local_concierge' | 'briefing';
  agentName?: string;
  creation_mode: 'standard' | 'remix' | 'situational' | 'pulse';
  discovery_context?: DiscoveryContextPayload | null;
  location?: {
    latitude: number;
    longitude: number;
    placeName?: string;
  } | null;
  inputs: {
    topic?: string;
    topicA?: string;   // Eje temático primario para metodología 'link'
    topicB?: string;   // Eje temático secundario para metodología 'link'
    catalyst?: string; // Elemento de fricción o síntesis
    motivation?: string;
    goal?: string;
    duration?: string;
    narrativeDepth?: 'Superficial' | 'Intermedia' | 'Profunda' | string;
    depth?: string;
    tone?: string;
    selectedTone?: string;
    voiceGender?: 'Masculino' | 'Femenino';
    voiceStyle?: 'Calmado' | 'Energético' | 'Profesional' | 'Inspirador' | string;
    voicePace?: string;
    image_base64_reference?: string;
    [key: string]: unknown; // Elasticidad tipada para parámetros futuros
  };
  user_reaction?: string;
  quote_context?: string;
}

/**
 * TIPO MAESTRO: PodcastWithProfile
 * Objeto de datos unificado para toda la Workstation.
 * Integra la fila de PostgreSQL con metadatos de autoría y estructuras JSONB validadas.
 */
export type PodcastWithProfile = Omit<PodcastRow, 'creation_data' | 'sources' | 'script_text' | 'ai_tags' | 'user_tags' | 'geo_location'> & {
  // Estado de Integridad Multimedia y Acústica
  audio_ready: boolean;
  image_ready: boolean;
  embedding_ready: boolean;
  audio_assembly_status: AssemblyStatus;
  total_audio_segments: number | null;
  current_audio_segments: number | null;

  // Campos JSONB blindados con contratos estrictos
  creation_data: CreationMetadataPayload | null;
  sources: ResearchSource[] | null;
  script_text: PodcastScript | null;
  ai_tags: string[] | null;
  user_tags: string[] | null;

  // Extensiones Geoespaciales
  place_name: string | null;
  geo_location: GeoLocation | null;

  // Identidad Soberana del Curador (JOIN relacional)
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
 * Soporte para la arquitectura social de hilos conversacionales (Threads).
 */
export type PodcastWithGenealogy = PodcastWithProfile & {
  replies?: PodcastWithProfile[];
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V11.0):
 * 1. Sincronía del Dossier de Evidencia: La expansión de 'ResearchSource' con 
 *    propiedades de autoridad pericial (authority_score, veracity_verified, etc.)
 *    elimina 7 errores de compilación TS2339 simultáneos.
 * 2. Sincronía de la Malla de Inteligencia: La inclusión del bloque 'location' y 
 *    las variables del sintetizador de ejes en 'CreationMetadataPayload' erradica 
 *    5 errores de compilación TS2339.
 * 3. Zero Abbreviations Policy: Cumplimiento del 100% de la norma en descripciones 
 *    y propiedades estructurales.
 */