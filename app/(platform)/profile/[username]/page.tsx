// app/profile/[username]/page.tsx
// VERSIÓN: 7.0 (Sovereign Curator Integration - Zero-Flicker Standard)
// Misión: Servir la identidad pública de un curador con integridad total y SEO optimizado.
// [ESTABILIZACIÓN]: Resolución de error 'removeChild' mediante sincronía de datos SSR y canonical redirects.

import {
  PublicProfilePage,
  type ProfileData,
  type PublicPodcast,
  type TestimonialWithAuthor
} from '@/components/profile-client-component';
import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

/**
 * [CONFIGURACIÓN DE RED]: force-dynamic
 * Aseguramos que los datos de reputación y seguidores se consulten en tiempo real,
 * evitando que el navegador sirva perfiles desactualizados desde el caché.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProfilePageProps {
  params: { username: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

/**
 * generateMetadata: Motor de SEO y Visibilidad Social.
 * Proyecta la autoridad del curador en los metadatos de la página (OpenGraph).
 */
export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const supabase = createClient();
  const targetUsername = decodeURIComponent(params.username);

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, bio, avatar_url')
    .eq('username', targetUsername)
    .single();

  if (!profile) return { title: "Perfil no encontrado | NicePod" };

  return {
    title: `${profile.full_name} (@${targetUsername}) | NicePod`,
    description: profile.bio || `Explora las crónicas de sabiduría de ${profile.full_name} en NicePod.`,
    openGraph: {
      title: `${profile.full_name} en NicePod`,
      description: profile.bio || '',
      images: [profile.avatar_url || '/nicepod-logo.png'],
    }
  };
}

/**
 * PublicProfileRoute: El orquestador de datos del perfil.
 */
export default async function PublicProfileRoute({ params, searchParams }: ProfilePageProps) {
  const supabase = createClient();

  // 1. IDENTIFICACIÓN DE ACTORES (Handshake SSR)
  // Obtenemos al visitante (si existe) y el perfil objetivo en paralelo.
  const targetUsername = decodeURIComponent(params.username);

  const [authRes, profileRes] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('profiles')
      .select('id, username, full_name, avatar_url, bio, reputation_score, is_verified, followers_count, following_count')
      .eq('username', targetUsername)
      .single<ProfileData>()
  ]);

  const visitor = authRes.data.user;
  const targetProfile = profileRes.data;

  // 2. GUARDIA DE EXISTENCIA
  if (profileRes.error || !targetProfile) {
    notFound();
  }

  // 3. CANONICAL REDIRECT (Protocolo de Identidad)
  // Si el usuario intenta ver su propio perfil público, lo redirigimos a su perfil privado
  // a menos que especifique explícitamente el modo 'public'.
  const isViewingPublicMode = searchParams?.view === 'public';
  if (visitor?.id === targetProfile.id && !isViewingPublicMode) {
    redirect('/profile');
  }

  // 4. COSECHA DE DATOS DE BÓVEDA (Parallel Fetching)
  // Recuperamos todo el inventario del curador en un único ciclo de I/O.
  const [podcastsRes, likesRes, testimonialsRes, collectionsRes] = await Promise.all([
    // A. Podcasts Publicados (Resonancia Pública)
    supabase
      .from('micro_pods')
      .select('id, title, description, audio_url, created_at, duration_seconds, play_count, status')
      .eq('user_id', targetProfile.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false }),

    // B. Conteo de Resonancia Recibida (Likes)
    supabase
      .from('micro_pods')
      .select('like_count')
      .eq('user_id', targetProfile.id)
      .eq('status', 'published'),

    // C. Testimonios de Terceros (Validación de Sabiduría)
    supabase
      .from('profile_testimonials')
      .select('*, author:author_user_id(full_name, avatar_url)')
      .eq('profile_user_id', targetProfile.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .returns<TestimonialWithAuthor[]>(),

    // D. Colecciones de Bóveda (Curaduría Temática)
    supabase
      .from('collections')
      .select('id, title, description, cover_image_url, updated_at, collection_items(count)')
      .eq('owner_id', targetProfile.id)
      .eq('is_public', true)
      .order('updated_at', { ascending: false })
  ]);

  // 5. CONSOLIDACIÓN Y NORMALIZACIÓN
  const podcasts = (podcastsRes.data || []) as PublicPodcast[];
  const totalLikes = likesRes.data?.reduce((sum, p) => sum + (p.like_count || 0), 0) ?? 0;
  const testimonials = testimonialsRes.data || [];
  const publicCollections = collectionsRes.data || [];

  /**
   * [RESOLUCIÓN DEL CRASH REMOVECHILD]:
   * Pasamos los datos al componente de cliente 'PublicProfilePage'.
   * Inyectamos un key basado en el ID del perfil para forzar un montaje 
   * limpio en el cliente, evitando que React intente reconciliar nodos 
   * de una navegación anterior.
   */
  return (
    <PublicProfilePage
      key={targetProfile.id} // <--- [ESTABILIZADOR DE DOM]
      profile={targetProfile}
      podcasts={podcasts}
      totalLikes={totalLikes}
      initialTestimonials={testimonials}
      publicCollections={publicCollections.map(c => ({
        ...c,
        is_public: true
      }))}
    />
  );
}