// types/profile.ts
//VERSIÓN: 2.0 (NicePod Profile Contracts - Sovereign Integrity Standard)
import { Database } from './database.types';

/** 
 * UTILIDADES DE EXTRACCIÓN SEMÁNTICA
 * Derivamos los tipos base directamente de la Fuente de Verdad (PostgreSQL)
 * para asegurar que cualquier cambio en el esquema se refleje en el tipado.
 */
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

/**
 * INTERFAZ: ProfileData
 * Define el contrato de identidad completo para curadores y administradores.
 * 
 * [ESTABILIZACIÓN]: 
 * - Se consolida 'username' (antiguo handle) y 'full_name' (antiguo display_name).
 * - Se añaden campos de biografía extendida y metadatos sociales.
 */
export interface ProfileData {
  // Datos Primarios de la tabla 'profiles'
  id: string;
  username: string; // Handle único del curador
  full_name: string | null; // Nombre público mostrado
  avatar_url: string | null;
  bio: string | null;
  bio_short: string | null; // Eslogan o descripción técnica rápida
  role: string; // 'user' | 'admin'
  website_url: string | null;

  // Métricas de Resonancia y Autoridad
  reputation_score: number | null;
  is_verified: boolean | null;
  followers_count: number;
  following_count: number;

  // Timestamps de Auditoría
  created_at: string;
  updated_at: string;

  /**
   * RELACIONES ANIDADAS: Suscripciones y Planes
   * Inyectadas mediante Joins en la capa SSR para el control de cuotas y features.
   */
  subscriptions?: {
    status: Enums<'subscription_status'> | null;
    plans: {
      name: string | null;
      monthly_creation_limit: number;
      max_concurrent_drafts: number;
      features: string[] | null;
    } | null;
  } | null;
}

/**
 * INTERFAZ: PublicPodcast
 * Estructura de datos optimizada para la visualización en el feed del perfil público.
 * Representa la 'Voz' del curador materializada en la plataforma.
 */
export interface PublicPodcast {
  id: number;
  title: string;
  description: string | null;
  audio_url: string | null;
  cover_image_url: string | null;
  created_at: string;
  duration_seconds: number | null;
  play_count: number;
  like_count: number;
  status: Enums<'podcast_status'>;
  creation_mode: 'standard' | 'remix' | 'situational' | 'pulse' | string | null;
}

/**
 * INTERFAZ: TestimonialWithAuthor
 * Define la estructura de las validaciones sociales (Testimonios).
 * Incluye el objeto 'author' para renderizar la identidad de quien emite la reseña.
 */
export interface TestimonialWithAuthor {
  id: number;
  profile_user_id: string;
  author_user_id: string;
  comment_text: string;
  status: Enums<'testimonial_status'>;
  created_at: string;

  /**
   * author: Identidad del curador que firma el testimonio.
   * [Sincronizado]: Usa 'username' y 'full_name'.
   */
  author: {
    full_name: string | null;
    avatar_url: string | null;
    username: string;
  } | null;
}

/**
 * INTERFAZ: Collection
 * Representa un 'Hilo de Sabiduría' o Bóveda temática curada por el usuario.
 */
export interface Collection {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  cover_image_url: string | null;
  total_listened_count: number;
  updated_at: string;

  /**
   * collection_items: Conteo de activos dentro de la colección.
   * Inyectado mediante la función .count() de Supabase.
   */
  collection_items?: {
    count: number;
  }[];
}

/**
 * TIPO: ProfileTabValue
 * Define los estados permitidos para el motor de pestañas (Tabs) de la interfaz.
 * Evita el uso de strings 'mágicos' y asegura la consistencia de navegación.
 */
export type ProfileTabValue =
  | 'podcasts'
  | 'collections'
  | 'testimonials'
  | 'settings'
  | 'library'
  | 'offline';

/**
 * INTERFAZ: ProfileActionResponse
 * Contrato de respuesta estándar para las Server Actions de perfil.
 */
export interface ProfileActionResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string[]>;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Paridad Absoluta: Este archivo es la traducción directa de 'schema_core.sql'.
 * 2. Escalabilidad: Las interfaces están preparadas para recibir joins complejos
 *    sin perder la seguridad de tipos (Type-Safety).
 * 3. Legibilidad Industrial: Se han evitado abreviaciones para que cualquier 
 *    agente de inteligencia o humano comprenda el propósito de cada campo.
 */