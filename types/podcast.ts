// types/podcast.ts
// VERSIÓN: 4.0 (Enterprise Standard - Full Transparency Support)

import { Database } from './database.types';

/** 
 * Utilidades de extracción de tipos de la base de datos generada 
 */
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

/** 
 * Tipos base extraídos de la Fuente de Verdad (SQL) 
 */
export type PodcastRow = Tables<'micro_pods'>;
export type ProfileRow = Tables<'profiles'>;
export type PodcastStatus = Enums<'podcast_status'>;

/**
 * Interfaz para las fuentes de investigación externa (Tavily/Google)
 */
export interface ResearchSource {
  title: string;
  url: string;
  snippet?: string;
}

/**
 * Contrato de Metadatos de Creación.
 * Define exactamente qué se guardó en la 'caja negra' del orquestador.
 */
export interface CreationMetadataPayload {
  style: 'solo' | 'link' | 'archetype' | 'qa' | 'legacy' | 'remix';
  agentName: string;
  creation_mode: 'standard' | 'remix';
  user_reaction?: string;
  quote_context?: string;
  inputs: {
    topic?: string;
    motivation?: string;
    goal?: string;
    topicA?: string;
    topicB?: string;
    catalyst?: string;
    narrative?: { title: string; [key: string]: any } | string;
    tone?: string;
    duration?: string;
    depth?: string;
    tags?: string[];
    [key: string]: any;
  };
}

/**
 * TIPO MAESTRO: Podcast con Perfil e Inteligencia.
 * Este es el objeto principal que fluye por toda la interfaz de usuario.
 */
export type PodcastWithProfile = Omit<PodcastRow, 'creation_data' | 'sources'> & {
  // Reemplazamos jsonb genérico por nuestras interfaces estructuradas
  creation_data: CreationMetadataPayload | null;
  sources: ResearchSource[] | null;
  
  // Relación con el autor
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    username: string;
  } | null;
};

/**
 * Soporte para hilos de conversación y genealogía profunda.
 */
export type PodcastWithGenealogy = PodcastWithProfile & {
  replies?: PodcastWithProfile[];
};