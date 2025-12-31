// types/podcast.ts
// VERSIÓN: 6.0 (Enterprise Standard - NicePod World & Situational Intelligence)

import { Database } from './database.types';

/** 
 * UTILIDADES DE EXTRACCIÓN SEMÁNTICA
 * Derivamos los tipos directamente de la Fuente de Verdad (Base de Datos).
 */
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Tipos base inyectados desde el esquema de base de datos
export type PodcastRow = Tables<'micro_pods'>;
export type ProfileRow = Tables<'profiles'>;
export type PointOfInterestRow = Tables<'points_of_interest'>;
export type PodcastStatus = Enums<'podcast_status'>;

/**
 * INTERFAZ: ResearchSource
 * Define el contrato de transparencia bibliográfica para la investigación externa.
 */
export interface ResearchSource {
  title: string;
  url: string;
  snippet?: string;
  relevance_score?: number;
}

/**
 * INTERFAZ: GeoLocationContext
 * Registra las coordenadas y la identificación geográfica del punto de origen.
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
 * Estructura de datos para las opciones de 'Puntos de Interés' (POI) que la IA 
 * sugiere antes de generar una narrativa profunda.
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
 * Dossier de inteligencia situacional que registra el veredicto de la IA 
 * sobre el entorno físico del usuario.
 */
export interface DiscoveryContextPayload {
  narrative_hook: string;         // Frase inicial de conexión local
  recommendations: LocalRecommendation[];
  closing_thought: string;        // Reflexión final del concierge
  detected_poi?: string;          // Punto de interés principal identificado
  image_analysis_summary?: string; // Lo que la IA visual identificó en la foto
}

/**
 * INTERFAZ: CreationMetadataPayload
 * Este es el contrato del campo 'creation_data' (JSONB).
 * Actúa como la "Caja Negra" que almacena toda la lógica e intención creativa.
 */
export interface CreationMetadataPayload {
  // Metodología y Agente
  style: 'solo' | 'link' | 'archetype' | 'qa' | 'legacy' | 'remix' | 'local_concierge';
  agentName: string;
  creation_mode: 'standard' | 'remix' | 'situational';
  
  // Metadatos de interacción
  user_reaction?: string;
  quote_context?: string;
  
  // Bloque de inteligencia situacional (solo para Vivir lo Local)
  discovery_context?: DiscoveryContextPayload;

  // Inputs originales del formulario
  inputs: {
    topic?: string;
    motivation?: string;
    goal?: string;
    topicA?: string;
    topicB?: string;
    catalyst?: string;
    duration?: string;
    depth?: string;
    tone?: string;
    tags?: string[];
    location?: GeoLocationContext;
    image_base64_reference?: string; // Referencia visual de origen
    [key: string]: any; // Flexibilidad para extensiones futuras
  };
}

/**
 * TIPO MAESTRO: PodcastWithProfile
 * Es el objeto de datos unificado que consume la interfaz de usuario.
 * Garantiza que la transparencia (fuentes) y la inteligencia (metadata) estén tipadas.
 */
export type PodcastWithProfile = Omit<PodcastRow, 'creation_data' | 'sources'> & {
  // Inyección de interfaces estrictas sobre campos JSONB
  creation_data: CreationMetadataPayload | null;
  sources: ResearchSource[] | null;
  
  // Unión con la identidad del creador
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    username: string;
  } | null;
};

/**
 * TIPO: PodcastWithGenealogy
 * Extensión para manejar hilos de conversación y respuestas (Remixes).
 */
export type PodcastWithGenealogy = PodcastWithProfile & {
  replies?: PodcastWithProfile[];
};