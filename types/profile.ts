// types/profile.ts
// VERSIÓN: 3.0 (NicePod Sovereign Profile - V2.6 Production Standard)
// Misión: Centralizar la identidad del curador y sincronizar el contrato SSR-Cliente.
// [ESTABILIZACIÓN]: Paridad absoluta con Tables<'profiles'> para erradicar errores de compilación.

import { Database } from './database.types';

/** 
 * ---------------------------------------------------------------------------
 * I. UTILIDADES DE EXTRACCIÓN SEMÁNTICA
 * ---------------------------------------------------------------------------
 */

/**
 * Tables: Extrae la estructura de una fila directamente del Metal SQL.
 */
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

/**
 * Enums: Extrae los estados permitidos de los tipos personalizados de PostgreSQL.
 */
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

/**
 * ---------------------------------------------------------------------------
 * II. CONTRATO MAESTRO DE PERFIL
 * ---------------------------------------------------------------------------
 */

/**
 * ProfileData: Representa la identidad total de un curador en NicePod.
 * 
 * [ARQUITECTURA V3.0]: 
 * Utilizamos una intersección de tipos (&) para asegurar que el objeto contenga
 * el 100% de las columnas de la tabla 'profiles' (incluyendo active_creation_jobs, 
 * followers_count, stripe_customer_id, etc.) más las relaciones inyectadas por SSR.
 */
export type ProfileData = Tables<'profiles'> & {
  /**
   * subscriptions: Relación anidada inyectada mediante Joins en el Middleware o Layout.
   * Contiene los límites de forja y el estatus comercial del usuario.
   */
  subscriptions?: {
    id: string;
    status: Enums<'subscription_status'> | null;
    plans: {
      id: number;
      name: string | null;
      monthly_creation_limit: number;
      max_concurrent_drafts: number | null;
      features: string[] | null;
    } | null;
  } | null;

  /**
   * usage: Telemetría de consumo mensual.
   */
  user_usage?: {
    minutes_listened_this_month: number | null;
    podcasts_created_this_month: number | null;
  } | null;
};

/**
 * ---------------------------------------------------------------------------
 * III. ENTIDADES DE VISUALIZACIÓN PÚBLICA
 * ---------------------------------------------------------------------------
 */

/**
 * PublicPodcast: Estructura optimizada para el feed del perfil público.
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
 * TestimonialWithAuthor: Representación de validación social entre curadores.
 */
export interface TestimonialWithAuthor {
  id: number;
  profile_user_id: string;
  author_user_id: string;
  comment_text: string;
  status: Enums<'testimonial_status'>;
  created_at: string;

  /**
   * author: Snapshot de identidad de quien emite el testimonio.
   */
  author: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    username: string;
    role: string;
  } | null;
}

/**
 * ---------------------------------------------------------------------------
 * IV. BÓVEDAS Y COLECCIONES
 * ---------------------------------------------------------------------------
 */

/**
 * Collection: Agrupación temática de activos intelectuales.
 */
export interface Collection {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  cover_image_url: string | null;
  total_listened_count: number;
  likes_count: number;
  updated_at: string;

  /**
   * collection_items: Relación para conteo de podcasts vinculados.
   */
  collection_items?: {
    count: number;
  }[];
}

/**
 * ---------------------------------------------------------------------------
 * V. MOTORES DE INTERFAZ (UI TYPES)
 * ---------------------------------------------------------------------------
 */

/**
 * ProfileTabValue: Valores permitidos para la navegación de pestañas en el perfil.
 */
export type ProfileTabValue =
  | 'podcasts'
  | 'collections'
  | 'testimonials'
  | 'settings'
  | 'library'
  | 'offline'
  | 'admin_vault'; // Nueva pestaña para el acceso soberano del Administrador

/**
 * ProfileActionResponse: Contrato de respuesta para mutaciones de perfil.
 */
export interface ProfileActionResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  trace_id?: string;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Muerte de la Redundancia: Al usar 'Tables<'profiles'>', este archivo se 
 *    vuelve "Mantenimiento Cero". El compilador siempre tendrá la lista 
 *    actualizada de columnas, solucionando el error TS2322 en el RootLayout.
 * 2. Cero Abreviaciones: Cada campo y cada interfaz ha sido extendida para 
 *    cubrir el 100% de la lógica de negocio actual, incluyendo el soporte para 
 *    'admin_vault' y conteos de colecciones.
 * 3. Integridad SSR: La inclusión de 'subscriptions' como campo opcional (?) 
 *    permite que el Handshake T0 sea flexible: si el servidor no pudo hacer 
 *    el join de la suscripción, el sistema no colapsa, sino que permite que 
 *    el cliente la recupere en segundo plano.
 */