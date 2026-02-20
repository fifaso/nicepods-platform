// types/profile.ts
// VERSIÓN: 1.0 (NicePod Profile Contracts - Integrity & Authority Standard)
// Misión: Centralizar las definiciones de tipos para la gestión de perfiles, suscripciones y resonancia social.
// [ESTABILIZACIÓN]: Eliminación de errores de asignación (TS2322) mediante contratos de datos serializables.

import { Database } from './database.types';

/** 
 * UTILIDADES DE EXTRACCIÓN SEMÁNTICA
 * Derivamos los tipos base directamente de la Fuente de Verdad (PostgreSQL).
 */
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

/**
 * INTERFAZ: ProfileData
 * Define el contrato de identidad completo para curadores y administradores.
 * Incluye la jerarquía de suscripción y planes para el control de cuotas.
 */
export interface ProfileData {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: string;
  reputation_score: number | null;
  is_verified: boolean | null;
  followers_count: number;
  following_count: number;
  created_at: string;
  updated_at: string;

  // Relaciones anidadas inyectadas por Supabase JOINs
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
  creation_mode: string | null;
}

/**
 * INTERFAZ: TestimonialWithAuthor
 * Define la estructura de las reseñas sociales incluyendo la identidad del autor.
 */
export interface TestimonialWithAuthor {
  id: number;
  profile_user_id: string;
  author_user_id: string;
  comment_text: string;
  status: Enums<'testimonial_status'>;
  created_at: string;

  // Perfil del autor inyectado vía ForeignKey
  author: {
    full_name: string | null;
    avatar_url: string | null;
    username?: string;
  } | null;
}

/**
 * INTERFAZ: Collection
 * Representa un 'Hilo de Sabiduría' (colección de podcasts) curado por el usuario.
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

  // Conteo de elementos inyectado por la función count() de Supabase
  collection_items?: {
    count: number;
  }[];
}

/**
 * TIPO: ProfileTabValue
 * Define los estados posibles del motor de pestañas del perfil para evitar strings 'mágicos'.
 */
export type ProfileTabValue = 'library' | 'offline' | 'testimonials' | 'settings' | 'podcasts' | 'collections';

/**
 * INTERFAZ: ProfileActionResponse
 * Contrato de respuesta para las acciones de servidor (Server Actions) de perfil.
 */
export interface ProfileActionResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}