/**
 * ARCHIVO: app/(platform)/profile/[username]/page.tsx
 * VERSIÓN: 10.0 (NicePod Public Profile Orchestrator - Sovereign Protocol V4.0)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestador de servidor para la visualización de perfiles públicos con integridad nominal.
 * [REFORMA V10.0]: Sincronización nominal total con ProfileData V4.0 y ZAP.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP Compliant / Build Shield Green)
 */

import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

// --- INFRAESTRUCTURA DE COMPONENTES DE ALTA DENSIDAD ---
import PublicProfilePage from '@/components/profile/public-profile-page';

// --- CONTRATOS DE DATOS SOBERANOS ---
import {
  Collection,
  ProfileData,
  PublicPodcast,
  TestimonialWithAuthor
} from '@/types/profile';
import { PodcastWithProfile } from '@/types/podcast';

/**
 * [CONFIGURACIÓN DE RED]: force-dynamic
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * INTERFAZ: PublicProfileRouteComponentProperties
 */
interface PublicProfileRouteComponentProperties {
  params: {
    username: string;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

/**
 * generateMetadata: Misión: Proyectar la autoridad del curador hacia indexadores y redes sociales.
 */
export async function generateMetadata({ params: routeParameters }: PublicProfileRouteComponentProperties): Promise<Metadata> {
  const supabaseClient = createClient();
  const targetUsernameIdentification = decodeURIComponent(routeParameters.username);

  const { data: administratorProfileRow } = await supabaseClient
    .from('profiles')
    .select('full_name, bio, avatar_url')
    .eq('username', targetUsernameIdentification)
    .single();

  if (!administratorProfileRow) {
    return { title: "Perfil no localizado | NicePod" };
  }

  const userDisplayName = administratorProfileRow.full_name || `@${targetUsernameIdentification}`;

  return {
    title: `${userDisplayName} | NicePod Intelligence Archive`,
    description: administratorProfileRow.bio || `Archivo de sabiduria y registro de voz de ${userDisplayName}.`,
    openGraph: {
      title: `${userDisplayName} en NicePod`,
      description: administratorProfileRow.bio || '',
      images: [administratorProfileRow.avatar_url || '/nicepod-logo.png'],
      type: 'profile',
      username: targetUsernameIdentification,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${userDisplayName} | NicePod Sovereign Curator`,
      images: [administratorProfileRow.avatar_url || '/nicepod-logo.png'],
    }
  };
}

/**
 * PublicProfileRoute: El orquestador de datos Server-Side.
 */
export default async function PublicProfileRoute({ 
  params: routeParameters, 
  searchParams: urlSearchParameters 
}: PublicProfileRouteComponentProperties) {
  
  const supabaseClient = createClient();
  const targetUsernameIdentification = decodeURIComponent(routeParameters.username);

  // 1. HANDSHAKE DE DATOS CONCURRENTE (T0)
  const [authenticationResponse, profileQueryResponse] = await Promise.all([
    supabaseClient.auth.getUser(),
    supabaseClient
      .from('profiles')
      .select(`
        id, 
        username, 
        full_name, 
        avatar_url, 
        bio, 
        bio_short,
        website_url,
        reputation_score, 
        is_verified, 
        followers_count, 
        following_count,
        active_creation_jobs,
        role,
        created_at,
        updated_at,
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
      .eq('username', targetUsernameIdentification)
      .single()
  ]);

  const activeAuthenticatedUser = authenticationResponse.data.user;
  const targetAdministratorProfileRow = profileQueryResponse.data;

  // 2. PROTOCOLO DE EXISTENCIA
  if (profileQueryResponse.error || !targetAdministratorProfileRow) {
    console.warn(`🛑 [SSR-Profile] Acceso a perfil inexistente: ${targetUsernameIdentification}`);
    notFound();
  }

  // 3. REDIRECCIÓN DE SOBERANÍA (Autogestión vs Visualización)
  const isViewingPublicInterfaceMode = urlSearchParameters?.view === 'public';
  if (activeAuthenticatedUser?.id === targetAdministratorProfileRow.id && !isViewingPublicInterfaceMode) {
    redirect('/profile');
  }

  // 4. COSECHA DE ACTIVOS INTELECTUALES (Malla Completa)
  const [
    publishedPodcastsDatabaseResponse,
    resonanceMetricsDatabaseResponse,
    testimonialsDatabaseResponse,
    collectionsDatabaseResponse
  ] = await Promise.all([
    // A. Podcasts: Registro histórico de la voz
    supabaseClient
      .from('micro_pods')
      .select('*, profiles:user_id(full_name, avatar_url, username, reputation_score, is_verified)')
      .eq('user_id', targetAdministratorProfileRow.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false }),

    // B. Resonancia: Sumatoria de interacciones
    supabaseClient
      .from('micro_pods')
      .select('like_count')
      .eq('user_id', targetAdministratorProfileRow.id)
      .eq('status', 'published'),

    // C. Testimonios: Validaciones aprobadas
    supabaseClient
      .from('profile_testimonials')
      .select('*, author:author_user_id(id, full_name, avatar_url, username, role)')
      .eq('profile_user_id', targetAdministratorProfileRow.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false }),

    // D. Colecciones: Hilos de conocimiento
    supabaseClient
      .from('collections')
      .select('id, owner_id, title, description, is_public, cover_image_url, total_listened_count, likes_count, updated_at, collection_items(count)')
      .eq('owner_id', targetAdministratorProfileRow.id)
      .eq('is_public', true)
      .order('updated_at', { ascending: false })
  ]);

  // 5. METAL-TO-CRYSTAL MAPPING (Nominal Purification)
  const purifiedAdministratorProfile: ProfileData = {
    identification: targetAdministratorProfileRow.id,
    username: targetAdministratorProfileRow.username,
    fullName: targetAdministratorProfileRow.full_name,
    avatarUniformResourceLocator: targetAdministratorProfileRow.avatar_url,
    biographyTextContent: targetAdministratorProfileRow.bio,
    biographyShortSummary: targetAdministratorProfileRow.bio_short,
    websiteUniformResourceLocator: targetAdministratorProfileRow.website_url,
    reputationScoreValue: targetAdministratorProfileRow.reputation_score || 0,
    isVerifiedAccountStatus: targetAdministratorProfileRow.is_verified || false,
    authorityRole: targetAdministratorProfileRow.role,
    followersCountInventory: targetAdministratorProfileRow.followers_count || 0,
    followingCountInventory: targetAdministratorProfileRow.following_count || 0,
    activeCreationJobsCount: targetAdministratorProfileRow.active_creation_jobs || 0,
    creationTimestamp: targetAdministratorProfileRow.created_at,
    updateTimestamp: targetAdministratorProfileRow.updated_at,
    subscriptionDetails: targetAdministratorProfileRow.subscriptionDetails as any
  };

  const publishedPodcastsCollection = (publishedPodcastsDatabaseResponse.data || []) as unknown as PodcastWithProfile[];
  
  const accumulatedResonanceCount = resonanceMetricsDatabaseResponse.data?.reduce(
    (totalAccumulator, currentItem) => totalAccumulator + (currentItem.like_count || 0), 0
  ) ?? 0;
  
  const approvedTestimonialsCollection: TestimonialWithAuthor[] = (testimonialsDatabaseResponse.data || []).map((testimonialItem: any) => ({
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

  const publicCollectionsCollection: Collection[] = (collectionsDatabaseResponse.data || []).map((collectionItem: any) => ({
    identification: collectionItem.id,
    ownerUserIdentification: collectionItem.owner_id,
    title: collectionItem.title,
    descriptionTextContent: collectionItem.description,
    isPublicSovereignty: collectionItem.is_public,
    coverImageUniformResourceLocator: collectionItem.cover_image_url,
    totalListenedCount: collectionItem.total_listened_count || 0,
    likesCountTotal: collectionItem.likes_count || 0,
    updateTimestamp: collectionItem.updated_at,
    collectionItems: Array.isArray(collectionItem.collection_items)
        ? collectionItem.collection_items 
        : [{ count: 0 }]
  }));

  /**
   * 6. ENTREGA ATÓMICA AL CLIENTE
   */
  return (
    <PublicProfilePage
      key={purifiedAdministratorProfile.identification}
      administratorProfile={purifiedAdministratorProfile}
      publishedPodcastsCollection={publishedPodcastsCollection}
      accumulatedResonanceCount={accumulatedResonanceCount}
      initialTestimonialsCollection={approvedTestimonialsCollection}
      publicCollectionsCollection={publicCollectionsCollection}
    />
  );
}
