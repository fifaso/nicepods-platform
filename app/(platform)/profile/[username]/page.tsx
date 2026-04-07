/**
 * ARCHIVO: app/(platform)/profile/[username]/page.tsx
 * VERSIÓN: 9.0 (NicePod Sovereign Profile - Industrial SSR Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestador de servidor para la visualización de perfiles públicos,
 * recolectando la identidad, colecciones y capital intelectual del curador.
 * [REFORMA V9.0]: Sincronización nominal con PublicContentTabs V3.0, unificación 
 * de tipos (PodcastWithProfile) y cumplimiento estricto de la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
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
  TestimonialWithAuthor
} from '@/types/profile';
import { PodcastWithProfile } from '@/types/podcast';

/**
 * [CONFIGURACIÓN DE RED]: force-dynamic
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * INTERFAZ: ProfilePageProperties
 */
interface ProfilePageProperties {
  params: {
    username: string;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

/**
 * generateMetadata:
 * Misión: Proyectar la autoridad del curador hacia indexadores y redes sociales.
 */
export async function generateMetadata({ params: routeParameters }: ProfilePageProperties): Promise<Metadata> {
  const supabaseClient = createClient();
  const targetUsernameIdentification = decodeURIComponent(routeParameters.username);

  const { data: administratorProfile } = await supabaseClient
    .from('profiles')
    .select('full_name, bio, avatar_url')
    .eq('username', targetUsernameIdentification)
    .single();

  if (!administratorProfile) {
    return { title: "Perfil no localizado | NicePod" };
  }

  const userDisplayName = administratorProfile.full_name || `@${targetUsernameIdentification}`;

  return {
    title: `${userDisplayName} | NicePod Intelligence Archive`,
    description: administratorProfile.bio || `Archivo de sabiduria y registro de voz de ${userDisplayName}.`,
    openGraph: {
      title: `${userDisplayName} en NicePod`,
      description: administratorProfile.bio || '',
      images: [administratorProfile.avatar_url || '/nicepod-logo.png'],
      type: 'profile',
      username: targetUsernameIdentification,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${userDisplayName} | NicePod Sovereign Curator`,
      images: [administratorProfile.avatar_url || '/nicepod-logo.png'],
    }
  };
}

/**
 * PublicProfileRoute: El orquestador de datos Server-Side.
 */
export default async function PublicProfileRoute({ 
  params: routeParameters, 
  searchParams: urlSearchParameters 
}: ProfilePageProperties) {
  
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
        reputation_score, 
        is_verified, 
        followers_count, 
        following_count,
        created_at,
        updated_at
      `)
      .eq('username', targetUsernameIdentification)
      .single<ProfileData>()
  ]);

  const activeAuthenticatedUser = authenticationResponse.data.user;
  const targetAdministratorProfile = profileQueryResponse.data;

  // 2. PROTOCOLO DE EXISTENCIA
  if (profileQueryResponse.error || !targetAdministratorProfile) {
    console.warn(`🛑 [SSR-Profile] Acceso a perfil inexistente: ${targetUsernameIdentification}`);
    notFound();
  }

  // 3. REDIRECCIÓN DE SOBERANÍA (Autogestión vs Visualización)
  const isViewingPublicInterfaceMode = urlSearchParameters?.view === 'public';
  if (activeAuthenticatedUser?.id === targetAdministratorProfile.id && !isViewingPublicInterfaceMode) {
    redirect('/profile');
  }

  // 4. COSECHA DE ACTIVOS INTELECTUALES (Malla Completa)
  const [
    publishedPodcastsResponse,
    resonanceMetricsResponse,
    testimonialsResponse,
    collectionsResponse
  ] = await Promise.all([
    // A. Podcasts: Registro histórico de la voz (Incluyendo perfil para tipado PodcastWithProfile)
    supabaseClient
      .from('micro_pods')
      .select('*, profiles:user_id(full_name, avatar_url, username, reputation_score, is_verified)')
      .eq('user_id', targetAdministratorProfile.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false }),

    // B. Resonancia: Sumatoria de interacciones
    supabaseClient
      .from('micro_pods')
      .select('like_count')
      .eq('user_id', targetAdministratorProfile.id)
      .eq('status', 'published'),

    // C. Testimonios: Validaciones aprobadas
    supabaseClient
      .from('profile_testimonials')
      .select('*, author:author_user_id(full_name, avatar_url, username)')
      .eq('profile_user_id', targetAdministratorProfile.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .returns<TestimonialWithAuthor[]>(),

    // D. Colecciones: Hilos de conocimiento
    supabaseClient
      .from('collections')
      .select('id, title, description, cover_image_url, updated_at, collection_items(count)')
      .eq('owner_id', targetAdministratorProfile.id)
      .eq('is_public', true)
      .order('updated_at', { ascending: false })
  ]);

  // 5. NORMALIZACIÓN Y CÁLCULO DE MÉTRICAS PERICIALES
  const publishedPodcastsCollection = (publishedPodcastsResponse.data || []) as unknown as PodcastWithProfile[];
  
  const accumulatedResonanceCount = resonanceMetricsResponse.data?.reduce(
    (totalAccumulator, currentItem) => totalAccumulator + (currentItem.like_count || 0), 0
  ) ?? 0;
  
  const approvedTestimonialsCollection = testimonialsResponse.data || [];

  const publicCollectionsCollection = (collectionsResponse.data || []).map((collectionItem) => ({
    ...collectionItem,
    collection_items: Array.isArray(collectionItem.collection_items) 
        ? collectionItem.collection_items 
        : [{ count: 0 }]
  })) as unknown as Collection[];

  /**
   * 6. ENTREGA ATÓMICA AL CLIENTE
   * [FIX V9.0]: Sincronización nominal total con PublicProfilePageProperties.
   */
  return (
    <PublicProfilePage
      key={targetAdministratorProfile.id}
      administratorProfile={targetAdministratorProfile}
      publishedPodcastsCollection={publishedPodcastsCollection}
      accumulatedResonanceCount={accumulatedResonanceCount}
      initialTestimonialsCollection={approvedTestimonialsCollection}
      publicCollectionsCollection={publicCollectionsCollection}
    />
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V9.0):
 * 1. Zero Abbreviations Policy: Purificación absoluta de nomenclatura en todo el pipeline de datos.
 * 2. Type Unification: Al obtener los podcasts con su relación de perfil, garantizamos que 
 *    el 'publishedPodcastsCollection' satisfaga el tipo 'PodcastWithProfile[]', eliminando 
 *    los errores de asignabilidad en los componentes hijos.
 * 3. Contract Alignment: Se ajustaron las propiedades de salida para coincidir con el 
 *    nuevo estándar de los componentes de perfil (V3.0).
 */