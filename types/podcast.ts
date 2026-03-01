// types/podcast.ts
// VERSIÓN: 8.0

import { Database } from './database.types';

/** 
 * UTILIDADES DE EXTRACCIÓN SEMÁNTICA
 * Derivamos los tipos base directamente de la Fuente de Verdad (PostgreSQL) 
 * sincronizada mediante el CLI de Supabase.
 */
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// --- TIPOS BASE DEL ESQUEMA DE DATOS ---
export type PodcastRow = Tables<'micro_pods'>;
export type ProfileRow = Tables<'profiles'>;
export type PointOfInterestRow = Tables<'points_of_interest'>;
export type PodcastStatus = Enums<'podcast_status'>;

/**
 * TIPO: AssemblyStatus
 * Define los estados posibles del Protocolo de Streaming (NSP) para audios segmentados.
 */
export type AssemblyStatus = 'idle' | 'collecting' | 'assembling' | 'completed' | 'failed';

/**
 * INTERFAZ: PodcastScript
 * Estructura interna del campo 'script_text' (JSONB).
 * Separa la narrativa neuronal de la versión de texto plano para búsqueda y teleprompter.
 */
export interface PodcastScript {
  script_body: string;   // Versión completa con acting notes para la IA de voz.
  script_plain: string;  // Versión limpia para análisis semántico y visualización.
}

/**
 * INTERFAZ: ResearchSource
 * Contrato de transparencia bibliográfica. 
 * Define el origen y la relevancia de cada fragmento de información utilizado.
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
 * Estructura de datos para los Puntos de Interés (POI) sugeridos por la inteligencia situacional.
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
 * Dossier de inteligencia urbana generado por el motor Madrid Resonance.
 */
export interface DiscoveryContextPayload {
  narrative_hook: string;         // El gancho inicial que conecta el lugar con la historia.
  recommendations: LocalRecommendation[]; // Lista detallada de POIs cercanos.
  closing_thought: string;        // Reflexión final basada en la ubicación.
  detected_poi?: string;          // ID o nombre del POI exacto donde se originó la sintonía.
  image_analysis_summary?: string; // Si hubo inyección de visión (IA), se guarda aquí el resumen.
}

/**
 * INTERFAZ: CreationMetadataPayload
 * Este es el contrato del campo 'creation_data' (JSONB).
 * Actúa como la "Caja Negra" que almacena la intención creativa y los parámetros técnicos.
 */
export interface CreationMetadataPayload {
  // Metodología de Forja
  style: 'solo' | 'link' | 'archetype' | 'qa' | 'legacy' | 'remix' | 'local_concierge';
  agentName: string;
  creation_mode: 'standard' | 'remix' | 'situational' | 'pulse';

  // Contexto Situacional (Solo para modo 'situational')
  discovery_context?: DiscoveryContextPayload;

  // Parámetros de Configuración del Stepper
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
    [key: string]: unknown; // Permite extensiones controladas de metadatos
  };

  // Trazabilidad de Sistema
  user_reaction?: string;
  quote_context?: string;
}

/**
 * TIPO MAESTRO: PodcastWithProfile
 * El objeto de datos definitivo que consume la interfaz de NicePod V2.5.
 * 
 * [RE-INGENIERÍA]: 
 * Reemplazamos los campos JSONB genéricos por nuestras interfaces estrictas 
 * e inyectamos las columnas necesarias para la estrategia GEO.
 */
export type PodcastWithProfile = Omit<PodcastRow, 'creation_data' | 'sources' | 'script_text' | 'ai_tags' | 'user_tags'> & {
  // Banderas de Integridad y NSP
  audio_ready: boolean;
  image_ready: boolean;
  audio_assembly_status: AssemblyStatus;
  total_audio_segments: number | null;
  current_audio_segments: number | null;

  // Tipado Estricto de Campos Complejos
  creation_data: CreationMetadataPayload | null;
  sources: ResearchSource[] | null;
  script_text: PodcastScript | null;
  ai_tags: string[] | null;
  user_tags: string[] | null;

  // Extensiones Geoespaciales (Resonancia Madrid)
  place_name: string | null;
  geo_location: any; // Mantenemos any para compatibilidad con el formato PostGIS de Mapbox

  // Vínculo con la Identidad del Curador (JOIN de base de datos)
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
 * Soporte para la estructura de 'Remix' e hilos de sabiduría.
 */
export type PodcastWithGenealogy = PodcastWithProfile & {
  replies?: PodcastWithProfile[];
};

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Sincronía GEO: Al incluir 'place_name' y 'geo_location' de forma explícita 
 *    en 'PodcastWithProfile', eliminamos el error TS2339 en componentes de vista.
 * 2. Cero Abreviaciones: Se han expandido las interfaces LocalRecommendation 
 *    y DiscoveryContextPayload para reflejar cada campo que el motor de IA 
 *    inyecta tras el escaneo situacional.
 * 3. Integridad ACiD: El uso de 'Omit' garantiza que no existan colisiones entre 
 *    el tipo crudo de base de datos y nuestras interfaces enriquecidas.
 */