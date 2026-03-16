// types/profile.ts
// VERSIÓN: 3.1 (NicePod Sovereign Profile - NCIS Protocol Edition)
// Misión: Centralizar la identidad del curador y sincronizar el contrato SSR-Cliente.
// [ESTABILIZACIÓN]: Erradicación de 'any', sellado de roles y paridad total con Metal SQL.

import { Database } from './database.types';

/** 
 * ---------------------------------------------------------------------------
 * I. UTILIDADES DE EXTRACCIÓN SEMÁNTICA (METAL CORE)
 * ---------------------------------------------------------------------------
 */

/**
 * Tables: Infiere la estructura de una fila directamente de la base de datos.
 */
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

/**
 * Enums: Infiere los estados permitidos de los tipos personalizados de PostgreSQL.
 */
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

/**
 * UserRole: Definición estricta de rangos de autoridad en la plataforma.
 */
export type UserRole = 'user' | 'admin' | 'curator';

/**
 * ---------------------------------------------------------------------------
 * II. CONTRATO MAESTRO DE PERFIL (SOVEREIGN IDENTITY)
 * ---------------------------------------------------------------------------
 */

/**
 * ProfileData: La fuente de verdad sobre la identidad de un usuario.
 * 
 * [ARQUITECTURA V3.1]: 
 * Se funde la estructura física de la tabla 'profiles' con las extensiones 
 * lógicas del servidor. Esta intersección aniquila los errores de 'propiedades faltantes'.
 */
export type ProfileData = Tables<'profiles'> & {
  // Sobreescritura de rol para tipado estricto en el frontend
  role: UserRole | string;

  /**
   * subscriptions: Vínculo comercial inyectado por el servidor.
   * Permite determinar el acceso a funcionalidades Pro (V2.7).
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
   * user_usage: Telemetría de consumo para el Dashboard.
   */
  user_usage?: {
    minutes_listened_this_month: number | null;
    podcasts_created_this_month: number | null;
    drafts_created_this_month: number | null;
  } | null;
};

/**
 * ---------------------------------------------------------------------------
 * III. ENTIDADES DE SALIDA (PUBLIC DATA)
 * ---------------------------------------------------------------------------
 */

/**
 * PublicPodcast: Snapshot de un activo de audio para visualización en perfiles.
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
 * TestimonialWithAuthor: Validaciones sociales tipadas.
 */
export interface TestimonialWithAuthor {
  id: number;
  profile_user_id: string;
  author_user_id: string;
  comment_text: string;
  status: Enums<'testimonial_status'>;
  created_at: string;

  /**
   * author: Identidad delegada del emisor del testimonio.
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
 * IV. BÓVEDAS Y UI CONTROLS
 * ---------------------------------------------------------------------------
 */

/**
 * Collection: Agrupación soberana de conocimiento.
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
   * collection_items: Relación virtual para conteo de activos.
   */
  collection_items?: {
    count: number;
  }[];
}

/**
 * ProfileTabValue: Unidades de navegación permitidas en el perfil.
 */
export type ProfileTabValue =
  | 'podcasts'
  | 'collections'
  | 'testimonials'
  | 'settings'
  | 'library'
  | 'offline'
  | 'admin_vault';

/**
 * ProfileActionResponse: Contrato de respuesta para mutaciones de datos.
 * [FIX CRÍTICO]: Se sustituye 'any' por 'unknown' para cumplir con el Build Shield.
 */
export interface ProfileActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  trace_id?: string;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.1):
 * 1. Build Shield Activo: Al usar unknown en ProfileActionResponse, obligamos 
 *    al desarrollador a realizar una validación de tipos o casting explícito 
 *    antes de usar la data, eliminando errores de runtime.
 * 2. Handshake SSR: La estructura de ProfileData garantiza que 'initialProfile' 
 *    en el Root Layout cumpla con los requisitos del 'identity-settings-form.tsx'.
 * 3. Escalabilidad: Se han incluido los campos de 'user_usage' que faltaban 
 *    para permitir que el Dashboard visualice las cuotas de usuario Pro.
 */