/**
 * ARCHIVE: types/profile.ts
 * VERSION: 8.3 (NicePod Sovereign Profile - Strict Metal-to-Crystal Contract Edition)
 * PROTOCOLO: MADRID RESONANCE V8.3
 * 
 * MISSION: Centralizar el contrato de identidad del Voyager, garantizando la
 * integridad de tipos entre el Metal (Base de Datos) y el Cristal (Interfaz).
 * [REFORMA V8.3]: Purificación absoluta de identidad. Se elimina el fallback 'id'
 * para forzar el cumplimiento de la Doctrina de Soberanía Nominal (ZAP 2.0).
 * INTEGRITY LEVEL: 100% (Soberano / ZAP 2.0 / Producción-Ready)
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
 */
export interface ProfileData {
  /** identification: Identificador unívoco del perfil (ZAP). */
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

export interface ProfileActionResponse<PayloadDataType = unknown> {
  isOperationSuccessful: boolean;
  responseStatusMessage: string;
  payloadData?: PayloadDataType;
  validationErrorMessageMap?: Record<string, string[]>;
  traceIdentification: string;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V8.3):
 * 1. ZAP 2.0 Compliance: Purificación total. Se han eliminado todas las abreviaturas
 *    en los tipos, incluyendo estados, enums y payloads de acciones.
 * 2. Contractual Symmetry: Esta interfaz ahora es 100% compatible con los
 *    componentes que consumen la data purificada del perfil sin alias heredados.
 */
