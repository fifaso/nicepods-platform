/**
 * ARCHIVO: types/profile.ts
 * VERSIÓN: 4.1 (NicePod Sovereign Profile - Strict Metal-to-Crystal Contract Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Centralizar el contrato de identidad del Voyager, garantizando la 
 * integridad de tipos entre el Metal (Base de Datos) y el Cristal (Interfaz).
 * [REFORMA V4.1]: Implementación de 'id' como propiedad de respaldo necesaria para 
 * la compatibilidad con el SDK de Supabase, manteniendo 'identification' como 
 * descriptor industrial soberano.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { Database } from './database.types';

/** 
 * ---------------------------------------------------------------------------
 * I. UTILIDADES DE EXTRACCIÓN SEMÁNTICA (METAL CORE)
 * ---------------------------------------------------------------------------
 */

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
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
 * ProfileData: La fuente de verdad sobre la identidad de un Voyager.
 * 
 * [SINCRO V4.1]: Se añade 'id' como propiedad opcional para asegurar la 
 * compatibilidad nativa con la respuesta del cliente de Supabase (Metal).
 */
export interface ProfileData {
  /** identification: Identificador unívoco del perfil (ZAP). */
  identification: string;
  /** id: Fallback necesario para la compatibilidad con la capa de persistencia (Supabase). */
  id?: string;
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

export interface TestimonialWithAuthor {
  identification: number;
  profileUserIdentification: string;
  authorUserIdentification: string;
  commentTextContent: string;
  moderationStatus: Enums<'testimonial_status'>;
  creationTimestamp: string;
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
  collectionItems?: {
    count: number;
  }[];
}

export type ProfileTabValue =
  | 'podcasts'
  | 'collections'
  | 'testimonials'
  | 'settings'
  | 'library'
  | 'offline'
  | 'admin_vault';

export interface ProfileActionResponse<T = unknown> {
  isOperationSuccessful: boolean;
  responseStatusMessage: string;
  payloadData?: T;
  validationErrorMessageMap?: Record<string, string[]>;
  traceIdentification: string;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.1):
 * 1. Metadata Hardening: La inclusión de 'id?' en la interfaz permite que 
 *    nuestros selectores de Supabase fluyan sin necesidad de ser casteados 
 *    a 'any', cumpliendo el protocolo Build Shield (BSS).
 * 2. ZAP Compliance: Purificación total. Se han eliminado todas las abreviaturas 
 *    en los tipos, incluyendo estados, enums y payloads de acciones.
 * 3. Contractual Symmetry: Esta interfaz ahora es 100% compatible con los 
 *    componentes que consumen la data purificada del perfil.
 */