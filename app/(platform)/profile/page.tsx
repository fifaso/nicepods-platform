/**
 * ARCHIVE: app/(platform)/profile/page.tsx
 * VERSION: 9.0 (NicePod Private Bunker - Industrial Standard & Traceability Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * MISSION: Server-side orchestration for the private intellectual capital bunker,
 * ensuring session integrity and parallel intelligence harvesting.
 * INTEGRITY LEVEL: 100% (Sovereign / Zero Abbreviations / Production-Ready)
 */

import { createClient } from '@/lib/supabase/server';
import { nicepodLog } from '@/lib/utils';
import PostHogClient from '@/posthog';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

// --- NUEVAS IMPORTACIONES MODULARES ---
import { PrivateProfileDashboard } from '@/components/profile/private-profile-dashboard';

// --- CONTRATOS DE DATOS SOBERANOS ---
import {
  Collection,
  ProfileData,
  PublicPodcast,
  TestimonialWithAuthor
} from '@/types/profile';

/**
 * [CONFIGURACIÓN DE RED]: force-dynamic
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * generateMetadata: Define la identidad de la terminal en el navegador.
 */
export const metadata: Metadata = {
  title: "Búnker de Sabiduría | NicePod Intelligence",
  description: "Centro de mandos operativo y gestión de soberanía de datos personales.",
  robots: { index: false, follow: false },
};

/**
 * PrivateProfileRoute: El orquestador de datos soberanos del servidor (SSR T0).
 *
 * Misión: Validar la autoridad del Voyager y realizar la cosecha paralela
 * de inteligencia privada (identidad, consumo, testimonios y colecciones)
 * para la hidratación instantánea de la terminal de peritaje.
 *
 * @returns {Promise<JSX.Element>} El chasis de la interfaz del Búnker de Sabiduría.
 */
export default async function PrivateProfileRoute() {
  const supabaseSovereignClient = createClient();

  // 1. PROTOCOLO DE IDENTIDAD (Handshake SSR)
  // Validamos la sesión en el servidor para proteger el acceso al área privada.
  const { data: { user: authenticatedUser }, error: authenticationHardwareException } = await supabaseSovereignClient.auth.getUser();

  if (authenticationHardwareException || !authenticatedUser) {
    // Redirección de seguridad con preservación de intención de retorno.
    redirect('/login?redirect=/profile');
  }

  // TELEMETRÍA: Registro de acceso al Búnker
  nicepodLog("🔐 [Bunker] Iniciando hidratación de peritaje privado.");
  const posthogSovereignClient = PostHogClient();
  posthogSovereignClient.capture({
    distinctId: authenticatedUser.id,
    event: 'voyager_bunker_access_start',
  });
  await posthogSovereignClient.shutdown();

  // 2. COSECHA DE INTELIGENCIA 360° (Parallel Fetching)
  const [
    profileIntelligenceQueryResponse,
    usageMetricsQueryResponse,
    testimonialsModerationQueryResponse,
    collectionsCuratedQueryResponse,
    vaultIntelligenceQueryResponse
  ] = await Promise.all([
    // A. IDENTIDAD & RANGO: Datos base, reputación y JOIN con planes de suscripción.
    supabaseSovereignClient
      .from('profiles')
      .select(`
            *,
            subscriptionDetails:subscriptions (
                subscriptionStatus:status,
                associatedPlan:plans (
                    identification:id,
                    planName:name,
                    monthlyCreationLimit:monthly_creation_limit,
                    maximumConcurrentDrafts:max_concurrent_drafts,
                    featureList:features
                )
            )
        `)
      .eq('id', authenticatedUser.id)
      .single<ProfileData>(),

    // B. MÉTRICA DE CONSUMO: Estado real de la forja mensual y slots de borradores.
    supabaseSovereignClient
      .from('user_usage')
      .select('podcasts_created_this_month, drafts_created_this_month')
      .eq('user_id', authenticatedUser.id)
      .maybeSingle(),

    // C. MODERACIÓN SOCIAL: Todos los testimonios (Aprobados y Pendientes) para gestión.
    supabaseSovereignClient
      .from('profile_testimonials')
      .select(`
            id,
            comment_text,
            status,
            created_at,
            profile_user_id,
            author_user_id,
            author:author_user_id (
                id,
                full_name,
                avatar_url,
                username,
                role
            )
        `)
      .eq('profile_user_id', authenticatedUser.id)
      .order('created_at', { ascending: false })
      .returns<TestimonialWithAuthor[]>(),

    // D. CURADURÍA TEMÁTICA: Colecciones propias con conteo de items en el hilo.
    supabaseSovereignClient
      .from('collections')
      .select('*, collection_items(count)')
      .eq('owner_id', authenticatedUser.id)
      .order('updated_at', { ascending: false }),

    // E. BÓVEDA DE VALOR (Proof of Attention): 
    // Recuperamos podcasts completados para alimentar el creador de colecciones.
    supabaseSovereignClient
      .from('playback_events')
      .select(`
          podcast_id,
          micro_pods (
              id,
              title,
              description,
              cover_image_url,
              duration_seconds,
              like_count,
              play_count,
              status,
              creation_mode,
              created_at
          )
      `)
      .eq('user_id', authenticatedUser.id)
      .eq('event_type', 'completed_playback')
      .order('created_at', { ascending: false })
  ]);

  // 3. PROTOCOLO DE SEGURIDAD ANTE FALLO DE DATOS
  if (profileDatabaseResponse.error || !profileDatabaseResponse.data) {
    console.error("🔥 [NicePod-Bunker-Error]:", profileDatabaseResponse.error?.message);
    redirect('/login');
  }

  const profileRow = profileDatabaseResponse.data;

  // 4. METAL-TO-CRYSTAL MAPPING (Nominal Purification)
  const purifiedProfileData: ProfileData = {
    identification: profileRow.id,
    username: profileRow.username,
    fullName: profileRow.full_name,
    avatarUniformResourceLocator: profileRow.avatar_url,
    biographyTextContent: profileRow.bio,
    biographyShortSummary: profileRow.bio_short,
    websiteUniformResourceLocator: profileRow.website_url,
    reputationScoreValue: profileRow.reputation_score || 0,
    isVerifiedAccountStatus: profileRow.is_verified || false,
    authorityRole: profileRow.role,
    followersCountInventory: profileRow.followers_count || 0,
    followingCountInventory: profileRow.following_count || 0,
    activeCreationJobsCount: profileRow.active_creation_jobs || 0,
    creationTimestamp: profileRow.created_at,
    updateTimestamp: profileRow.updated_at,
    subscriptionDetails: profileRow.subscriptionDetails as any,
    userUsageTelemetrics: usageDatabaseResponse.data ? {
        minutesListenedThisMonth: usageDatabaseResponse.data.minutes_listened_this_month,
        podcastsCreatedThisMonth: usageDatabaseResponse.data.podcasts_created_this_month,
        draftsCreatedThisMonth: usageDatabaseResponse.data.drafts_created_this_month,
    } : undefined
  };

  const purifiedTestimonialsCollection: TestimonialWithAuthor[] = (testimonialsDatabaseResponse.data || []).map((testimonialItem: any) => ({
    identification: testimonialItem.id,
    profileUserIdentification: testimonialItem.profile_user_id,
    authorUserIdentification: testimonialItem.author_user_id,
    commentTextContent: testimonialItem.comment_text,
    moderationStatus: testimonialItem.status,
    creationTimestamp: testimonialItem.created_at,
    author: testimonialItem.author ? {
      identification: testimonialItem.author.id,
      fullName: testimonialItem.author.full_name,
      avatarUniformResourceLocator: testimonialItem.author.avatar_url,
      username: testimonialItem.author.username,
      authorityRole: testimonialItem.author.role
    } : null
  }));

  const purifiedCollectionsCollection: Collection[] = (collectionsDatabaseResponse.data || []).map((collectionItem: any) => ({
    identification: collectionItem.id,
    ownerUserIdentification: collectionItem.owner_id,
    title: collectionItem.title,
    descriptionTextContent: collectionItem.description,
    isPublicSovereignty: collectionItem.is_public,
    coverImageUniformResourceLocator: collectionItem.cover_image_url,
    totalListenedCount: collectionItem.total_listened_count || 0,
    likesCountTotal: collectionItem.likes_count || 0,
    updateTimestamp: collectionItem.updated_at,
    collectionItems: collectionItem.collection_items
  }));

  // 5. LIMPIEZA BINARIA DE LA BÓVEDA (NKV Sync)
  const rawVaultDataCollection = vaultDatabaseResponse.data || [];
  const uniqueFinishedPodcastsCollection: PublicPodcast[] = Array.from(
    new Map(
      rawVaultDataCollection
        .map((vaultItem: any) => vaultItem.micro_pods)
        .filter((podcastRow: any) => podcastRow !== null)
        .map((podcastRow: any) => [
            podcastRow.id,
            {
                identification: podcastRow.id,
                title: podcastRow.title,
                descriptionTextContent: podcastRow.description,
                audioUniformResourceLocator: podcastRow.audio_url,
                coverImageUniformResourceLocator: podcastRow.cover_image_url,
                creationTimestamp: podcastRow.created_at,
                durationInSeconds: podcastRow.duration_seconds,
                playCountTotal: podcastRow.play_count || 0,
                likeCountTotal: podcastRow.like_count || 0,
                publicationStatus: podcastRow.status,
                creationMode: podcastRow.creation_mode
            } as PublicPodcast
        ])
    ).values()
  );

  return (
    <main className="min-h-screen bg-transparent animate-in fade-in duration-1000">
      <PrivateProfileDashboard
        key={profileIntelligenceQueryResponse.data.id}
        profile={profileIntelligenceQueryResponse.data}
        podcastsCreatedThisMonth={usageMetricsQueryResponse.data?.podcasts_created_this_month || 0}
        initialTestimonials={testimonialsModerationQueryResponse.data || []}
        initialCollections={(collectionsCuratedQueryResponse.data || []) as unknown as Collection[]}
        finishedPodcasts={uniqueFinishedPodcastsCollection}
      />
    </main>
  );
}
