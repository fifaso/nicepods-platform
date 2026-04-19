/**
 * ARCHIVO: app/(platform)/profile/page.tsx
 * VERSIÓN: 8.3 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: Madrid Resonance Protocol V8.3
 * MISIÓN: Orquestar la hidratación de datos del Búnker de Sabiduría (NicePodKnowledgeVault), garantizando la coherencia absoluta entre el Metal y el Cristal.
 * NIVEL DE INTEGRIDAD: 100% (Strategist Verified)
 */

import { createClient } from "@/lib/supabase/server";
import { nicepodLog } from "@/lib/utils";
import PostHogClient from "@/posthog";
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

// --- INFRAESTRUCTURA DE COMPONENTES ---
import { PrivateProfileDashboard } from '@/components/profile/private-profile-dashboard';

// --- CONTRATOS DE DATOS SOBERANOS ---
import {
  Collection,
  ProfileData,
  PublicPodcast,
  TestimonialWithAuthor
} from '@/types/profile';

/**
 * [METADATA API]: Identidad de Visualización Técnica
 */
export const metadata: Metadata = {
  title: "Búnker de Sabiduría | NicePod Intelligence",
  description: "Centro de mandos operativo y gestión de soberanía de datos personales.",
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PrivateProfileRoute() {
  const supabaseSovereignClient = createClient();

  // 1. HANDSHAKE DE IDENTIDAD
  const { data: { user: authenticatedUser }, error: authenticationHardwareException } = await supabaseSovereignClient.auth.getUser();

  if (authenticationHardwareException || !authenticatedUser) {
    redirect('/login?redirect=/profile');
  }

  const authenticatedUserIdentification = authenticatedUser.id;

  nicepodLog(`🔐 [Bunker] Hidratación iniciada para: ${authenticatedUserIdentification.substring(0, 8)}`);

  const posthogSovereignClient = PostHogClient();
  posthogSovereignClient.capture({
    distinctId: authenticatedUserIdentification,
    event: 'voyager_bunker_access_start',
  });
  await posthogSovereignClient.shutdown();

  // 2. COSECHA PARALELA DE INTELIGENCIA
  const [
    profileQueryResponse,
    usageMetricsQueryResponse,
    testimonialsModerationQueryResponse,
    collectionsCuratedQueryResponse,
    vaultIntelligenceQueryResponse
  ] = await Promise.all([
    supabaseSovereignClient
      .from('profiles')
      .select('*, subscriptionDetails:subscriptions(subscriptionStatus:status, associatedPlan:plans(*))')
      .eq('id', authenticatedUserIdentification)
      .single(),

    supabaseSovereignClient
      .from('user_usage')
      .select('podcasts_created_this_month, drafts_created_this_month, minutes_listened_this_month')
      .eq('user_id', authenticatedUserIdentification)
      .maybeSingle(),

    supabaseSovereignClient
      .from('profile_testimonials')
      .select('*, author:author_user_id(*)')
      .eq('profile_user_id', authenticatedUserIdentification)
      .order('created_at', { ascending: false }),

    supabaseSovereignClient
      .from('collections')
      .select('*, collection_items(count)')
      .eq('owner_id', authenticatedUserIdentification)
      .order('updated_at', { ascending: false }),

    supabaseSovereignClient
      .from('playback_events')
      .select('podcast_id, micro_pods(*)')
      .eq('user_id', authenticatedUserIdentification)
      .eq('event_type', 'completed_playback')
      .order('created_at', { ascending: false })
  ]);

  if (profileQueryResponse.error) {
    console.error("🔥 [Bunker-Error]:", profileQueryResponse.error.message);
    redirect('/login');
  }

  // 3. TRANSFORMACIÓN DE DATOS (METAL-TO-CRYSTAL)
  const profileDataSnapshot = profileQueryResponse.data as ProfileData;

  const purifiedCollectionsCollection: Collection[] = (collectionsCuratedQueryResponse.data || []).map((collectionItem: any) => ({
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

  const rawVaultDataCollection = vaultIntelligenceQueryResponse.data || [];
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
        key={profileDataSnapshot.identification}
        profile={profileDataSnapshot}
        podcastsCreatedThisMonth={usageMetricsQueryResponse.data?.podcasts_created_this_month || 0}
        
        /**
         * [SINCRO V19.0]: Los nombres inyectados aquí DEBEN ser exactamente los 
         * declarados en PrivateProfileDashboardComponentProperties (V6.1).
         * Si el componente hijo espera 'initialTestimonialsCollection', enviamos 
         * 'initialTestimonialsCollection'.
         */
        initialTestimonialsCollection={testimonialsModerationQueryResponse.data as TestimonialWithAuthor[] || []}
        initialCollectionsCollection={purifiedCollectionsCollection}
        finishedPodcastsCollection={uniqueFinishedPodcastsCollection}
      />
    </main>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V19.0):
 * 1. Contract Alignment: La resolución del error TS2322 requiere que el padre (page.tsx) 
 *    y el hijo (private-profile-dashboard.tsx) utilicen la misma nomenclatura industrial. 
 *    Se han alineado las propiedades de inyección.
 * 2. ZAP Absolute Compliance: El código respeta al 100% la Zero Abbreviations Policy.
 */