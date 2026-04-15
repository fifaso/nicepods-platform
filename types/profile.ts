/**
 * ARCHIVO: types/profile.ts
 * VERSIÓN: 4.0 (NicePod Sovereign Profile - Sovereign Protocol V4.0)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * MISIÓN: Centralizar la identidad del curador y sincronizar el contrato SSR-Cliente.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP Compliant / Build Shield Green)
 */

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
 * [ARQUITECTURA V4.0]:
 * Implementación total de Metal-to-Crystal Mapping. Se omiten los nombres
 * de columna snake_case originales en favor de descriptores camelCase ZAP.
 */
export interface ProfileData {
  identification: string;
  username: string;
  fullName: string | null;
  avatarUniformResourceLocator: string | null;
  biographyTextContent: string | null;
  biographyShortSummary: string | null;
  websiteUniformResourceLocator: string | null;
  reputationScoreValue: number;
  isVerifiedAccountStatus: boolean;
  authorityRole: UserRole | string;
  followersCountInventory: number;
  followingCountInventory: number;
  activeCreationJobsCount: number;
  creationTimestamp: string;
  updateTimestamp: string;

  /**
   * subscriptionDetails: Vínculo comercial inyectado por el servidor.
   * Permite determinar el acceso a funcionalidades Pro (V2.7).
   */
  subscriptionDetails?: {
    identification: string;
    subscriptionStatus: Enums<'subscription_status'> | null;
    associatedPlan: {
      identification: number;
      planName: string | null;
      monthlyCreationLimit: number;
      maximumConcurrentDrafts: number | null;
      featureList: string[] | null;
    } | null;
  } | null;

  /**
   * userUsageTelemetrics: Telemetría de consumo para el Dashboard.
   */
  userUsageTelemetrics?: {
    minutesListenedThisMonth: number | null;
    podcastsCreatedThisMonth: number | null;
    draftsCreatedThisMonth: number | null;
  } | null;
}

/**
 * ---------------------------------------------------------------------------
 * III. ENTIDADES DE SALIDA (PUBLIC DATA)
 * ---------------------------------------------------------------------------
 */

/**
 * PublicPodcast: Snapshot de un activo de audio para visualización en perfiles.
 */
export interface PublicPodcast {
  identification: number;
  title: string;
  descriptionTextContent: string | null;
  audioUniformResourceLocator: string | null;
  coverImageUniformResourceLocator: string | null;
  creationTimestamp: string;
  durationInSeconds: number | null;
  playCountTotal: number;
  likeCountTotal: number;
  publicationStatus: Enums<'podcast_status'>;
  creationMode: 'standard' | 'remix' | 'situational' | 'pulse' | string | null;
}

/**
 * TestimonialWithAuthor: Validaciones sociales tipadas.
 */
export interface TestimonialWithAuthor {
  identification: number;
  profileUserIdentification: string;
  authorUserIdentification: string;
  commentTextContent: string;
  moderationStatus: Enums<'testimonial_status'>;
  creationTimestamp: string;

  /**
   * author: Identidad delegada del emisor del testimonio.
   */
  author: {
    identification: string;
    fullName: string | null;
    avatarUniformResourceLocator: string | null;
    username: string;
    authorityRole: string;
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
  identification: string;
  ownerUserIdentification: string;
  title: string;
  descriptionTextContent: string | null;
  isPublicSovereignty: boolean;
  coverImageUniformResourceLocator: string | null;
  totalListenedCount: number;
  likesCountTotal: number;
  updateTimestamp: string;

  /**
   * collectionItems: Relación virtual para conteo de activos.
   */
  collectionItems?: {
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
  isOperationSuccessful: boolean;
  responseStatusMessage: string;
  payloadData?: T;
  validationErrorMessageMap?: Record<string, string[]>;
  traceIdentification: string;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Build Shield Activo: Al usar unknown en ProfileActionResponse, obligamos 
 *    al desarrollador a realizar una validación de tipos o casting explícito 
 *    antes de usar la data, eliminando errores de runtime.
 * 2. Handshake SSR: La estructura de ProfileData garantiza que 'initialProfile' 
 *    en el Root Layout cumpla con los requisitos del 'identity-settings-form.tsx'.
 * 3. Escalabilidad: Se han incluido los campos de 'userUsageTelemetrics' que faltaban
 *    para permitir que el Dashboard visualice las cuotas de usuario Pro.
 */
