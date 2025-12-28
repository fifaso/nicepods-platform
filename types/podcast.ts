// types/podcast.ts
// VERSIÓN: 5.0 (NicePod World Standard - Spatial, Vision & Discovery Support)

import { Database } from './database.types';

/** 
 * Utilidades de extracción de tipos de la base de datos sincronizada.
 */
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

/** 
 * Tipos base extraídos de la Fuente de Verdad SQL.
 */
export type PodcastRow = Tables<'micro_pods'>;
export type ProfileRow = Tables<'profiles'>;
export type PodcastStatus = Enums<'podcast_status'>;
export type PointOfInterest = Tables<'points_of_interest'>;

/**
 * Interfaz para las fuentes de investigación externas.
 * Garantiza la transparencia total de la información (Tavily / Google).
 */
export interface ResearchSource {
  title: string;
  url: string;
  snippet?: string;
}

/**
 * Contexto Geográfico para la funcionalidad "Vivir lo Local".
 */
export interface GeoLocationContext {
  latitude: number;
  longitude: number;
  placeName?: string;
  cityName?: string;
  country?: string;
}

/**
 * Estructura de Recomendaciones Locales (Points of Interest).
 * Define los datos que se muestran en la interfaz de usuario antes de generar un podcast profundo.
 */
export interface LocalRecommendation {
  id?: string | number;
  name: string;
  category: 'history' | 'food' | 'secret' | 'activity' | 'event';
  description: string;
  distance_meters?: number;
  action_url?: string;
  has_specific_podcast: boolean;
  linked_podcast_id?: string | number;
}

/**
 * Contrato de Metadatos de Creación (The Provenance Contract).
 * Registra la huella digital completa de cómo se originó el conocimiento.
 */
export interface CreationMetadataPayload {
  style: 'solo' | 'link' | 'archetype' | 'qa' | 'legacy' | 'remix' | 'local_concierge';
  agentName: string;
  creation_mode: 'standard' | 'remix' | 'situational';
  user_reaction?: string;
  quote_context?: string;
  
  // [NUEVO]: Contexto de Descubrimiento Situacional
  discovery_context?: {
    location?: GeoLocationContext;
    detected_poi?: string;
    recommendations?: LocalRecommendation[];
    image_analysis_summary?: string;
  };

  inputs: {
    topic?: string;
    motivation?: string;
    goal?: string;
    topicA?: string;
    topicB?: string;
    duration?: string;
    depth?: string;
    tags?: string[];
    [key: string]: any;
  };
}

/**
 * TIPO MAESTRO: Podcast con Perfil, Inteligencia y Datos Espaciales.
 * Este es el objeto que fluye por los componentes de visualización.
 */
export type PodcastWithProfile = Omit<PodcastRow, 'creation_data' | 'sources'> & {
  // Sobreescritura de tipos JSONB para validación estricta
  creation_data: CreationMetadataPayload | null;
  sources: ResearchSource[] | null;
  
  // Relación con el perfil del autor
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    username: string;
  } | null;
};

/**
 * Soporte para hilos de conversación y visualización jerárquica.
 */
export type PodcastWithGenealogy = PodcastWithProfile & {
  replies?: PodcastWithProfile[];
};