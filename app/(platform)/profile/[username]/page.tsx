// app/(platform)/profile/[username]/page.tsx
// VERSIÓN: 7.5 (Sovereign Curator Integration - Modular SSR Standard)
// Misión: Servir la identidad pública de un curador con integridad total y SEO de alta fidelidad.
// [ESTABILIZACIÓN]: Resolución de error TS2307 mediante conexión con la nueva arquitectura de componentes.

import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

// --- INFRAESTRUCTURA DE COMPONENTES MODULARES ---
// Importamos el orquestador de cliente que ensambla el Hero y los Tabs.
import PublicProfilePage from '@/components/profile/public-profile-page';

// --- CONTRATOS DE DATOS (NIVEL 1) ---
import {
  Collection,
  ProfileData,
  PublicPodcast,
  TestimonialWithAuthor
} from '@/types/profile';

/**
 * [CONFIGURACIÓN DE RED]: force-dynamic
 * Forzamos que cada visita al perfil sea una consulta fresca a la Bóveda, 
 * garantizando que el prestigio y los seguidores se actualicen en tiempo real.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * INTERFAZ: ProfilePageProps
 * Define los parámetros de ruta y búsqueda para el motor de Next.js.
 */
interface ProfilePageProps {
  params: {
    username: string
  };
  searchParams: {
    [key: string]: string | string[] | undefined
  };
}

/**
 * generateMetadata: Motor de Visibilidad y Autoridad.
 * Proyecta la identidad del curador hacia los indexadores de búsqueda y redes sociales.
 */
export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const supabase = createClient();
  // Decodificamos el handle para soportar caracteres Unicode en la URL.
  const targetUsername = decodeURIComponent(params.username);

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, bio, avatar_url')
    .eq('username', targetUsername)
    .single();

  if (!profile) {
    return { title: "Perfil no encontrado | NicePod" };
  }

  const displayName = profile.full_name || targetUsername;

  return {
    title: `${displayName} (@${targetUsername}) | NicePod Intelligence`,
    description: profile.bio || `Explora el archivo de sabiduría y las crónicas de voz de ${displayName}.`,
    openGraph: {
      title: `${displayName} en NicePod`,
      description: profile.bio || '',
      images: [profile.avatar_url || '/nicepod-logo.png'],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${displayName} | NicePod`,
      images: [profile.avatar_url || '/nicepod-logo.png'],
    }
  };
}

/**
 * PublicProfileRoute: El orquestador de datos del servidor.
 */
export default async function PublicProfileRoute({ params, searchParams }: ProfilePageProps) {
  const supabase = createClient();

  // 1. HANDSHAKE DE IDENTIDAD (T0)
  // Identificamos al visitante y el perfil objetivo de forma concurrente.
  const targetUsername = decodeURIComponent(params.username);

  const [authResponse, profileResponse] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('profiles')
      .select('id, username, full_name, avatar_url, bio, reputation_score, is_verified, followers_count, following_count')
      .eq('username', targetUsername)
      .single<ProfileData>()
  ]);

  const visitor = authResponse.data.user;
  const targetProfile = profileResponse.data;

  // 2. PROTOCOLO DE SEGURIDAD Y EXISTENCIA
  if (profileResponse.error || !targetProfile) {
    notFound();
  }

  // 3. REDIRECCIÓN CANÓNICA (Soberanía de Cuenta)
  // Si el curador intenta entrar a su propia URL pública, lo redirigimos a su Búnker de gestión,
  // a menos que el parámetro 'view=public' esté presente en la URL.
  const isViewingPublicMode = searchParams?.view === 'public';
  if (visitor?.id === targetProfile.id && !isViewingPublicMode) {
    redirect('/profile');
  }

  // 4. COSECHA DE INTELIGENCIA (Fase SSR)
  // Ejecutamos la recolección masiva de podcasts, likes, testimonios y hilos curados.
  const [
    podcastsResponse,
    likesResponse,
    testimonialsResponse,
    collectionsResponse
  ] = await Promise.all([
    // A. Podcasts Publicados: La voz pública del curador.
    supabase
      .from('micro_pods')
      .select('id, title, description, audio_url, created_at, duration_seconds, play_count, status, creation_mode')
      .eq('user_id', targetProfile.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false }),

    // B. Conteo de Resonancia: Sumatoria de valor social recibido.
    supabase
      .from('micro_pods')
      .select('like_count')
      .eq('user_id', targetProfile.id)
      .eq('status', 'published'),

    // C. Testimonios de Terceros: Validaciones de la comunidad aprobadas.
    supabase
      .from('profile_testimonials')
      .select('*, author:author_user_id(full_name, avatar_url)')
      .eq('profile_user_id', targetProfile.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .returns<TestimonialWithAuthor[]>(),

    // D. Colecciones de Bóveda: Hilos de conocimiento curados.
    supabase
      .from('collections')
      .select('id, title, description, cover_image_url, updated_at, collection_items(count)')
      .eq('owner_id', targetProfile.id)
      .eq('is_public', true)
      .order('updated_at', { ascending: false })
  ]);

  // 5. NORMALIZACIÓN DE RESULTADOS
  const podcasts = (podcastsResponse.data || []) as PublicPodcast[];
  const totalLikes = likesResponse.data?.reduce((sum, current) => sum + (current.like_count || 0), 0) ?? 0;
  const testimonials = testimonialsResponse.data || [];
  const publicCollections = (collectionsResponse.data || []) as unknown as Collection[];

  /**
   * 6. ENTREGA AL CLIENTE (PublicProfilePage)
   * Inyectamos el ID del perfil como 'key' para garantizar un montaje de DOM 
   * inmaculado y resolver el error de reconciliación 'removeChild'.
   */
  return (
    <PublicProfilePage
      key={targetProfile.id}
      profile={targetProfile}
      podcasts={podcasts}
      totalLikes={totalLikes}
      initialTestimonials={testimonials}
      publicCollections={publicCollections}
    />
  );
}