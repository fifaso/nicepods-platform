// app/(platform)/profile/[username]/page.tsx
//version:8.0 (Sovereign Curator Integration - High-Density SSR Standard)
import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

// --- INFRAESTRUCTURA DE COMPONENTES DE ALTA DENSIDAD ---
import PublicProfilePage from '@/components/profile/public-profile-page';

// --- CONTRATOS DE DATOS (INTEGRIDAD SOBERANA) ---
import {
  Collection,
  ProfileData,
  PublicPodcast,
  TestimonialWithAuthor
} from '@/types/profile';

/**
 * [CONFIGURACIÓN DE RED]: force-dynamic
 * Forzamos que cada visita al perfil sea una consulta fresca a la Bóveda de NicePod.
 * Esto asegura que la Reputación Líquida y el conteo de Seguidores sean exactos.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * INTERFAZ: ProfilePageProps
 * Contrato de parámetros para el motor de rutas de Next.js 14.
 */
interface ProfilePageProps {
  params: {
    username: string;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

/**
 * FUNCIÓN: generateMetadata
 * Misión: Proyectar la autoridad del curador hacia indexadores y redes sociales.
 * [ESTABILIZACIÓN]: Búsqueda corregida por columna 'username'.
 */
export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const supabase = createClient();
  const targetUsername = decodeURIComponent(params.username);

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, bio, avatar_url')
    .eq('username', targetUsername)
    .single();

  if (!profile) {
    return { title: "Perfil no localizado | NicePod" };
  }

  const displayName = profile.full_name || `@${targetUsername}`;

  return {
    title: `${displayName} | NicePod Intelligence Archive`,
    description: profile.bio || `Explora las crónicas de sabiduría y el archivo de voz neuronal de ${displayName}.`,
    openGraph: {
      title: `${displayName} en NicePod`,
      description: profile.bio || '',
      images: [profile.avatar_url || '/nicepod-logo.png'],
      type: 'profile',
      username: targetUsername,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${displayName} | NicePod Sovereign Curator`,
      images: [profile.avatar_url || '/nicepod-logo.png'],
    },
    robots: {
      index: true,
      follow: true,
    }
  };
}

/**
 * COMPONENTE: PublicProfileRoute (Server Side)
 * El orquestador de datos que alimenta la visualización del curador.
 */
export default async function PublicProfileRoute({ params, searchParams }: ProfilePageProps) {
  const supabase = createClient();

  // 1. DESCODIFICACIÓN DE IDENTIDAD
  // Soportamos caracteres internacionales y handles complejos.
  const targetUsername = decodeURIComponent(params.username);

  // 2. HANDSHAKE DE DATOS CONCURRENTE (T0)
  // Ejecutamos todas las consultas en paralelo para minimizar el tiempo de respuesta del servidor.
  const [authResponse, profileResponse] = await Promise.all([
    supabase.auth.getUser(),
    supabase
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
      .eq('username', targetUsername)
      .single<ProfileData>()
  ]);

  const visitor = authResponse.data.user;
  const targetProfile = profileResponse.data;

  // 3. PROTOCOLO DE EXISTENCIA
  // Si la columna 'username' no coincide con la búsqueda, abortamos con 404 limpio.
  if (profileResponse.error || !targetProfile) {
    console.warn(`🛑 [SSR-Profile] Intento de acceso a perfil inexistente: ${targetUsername}`);
    notFound();
  }

  // 4. REDIRECCIÓN DE SOBERANÍA
  // Si el curador intenta ver su propio perfil público, lo enviamos a su Dashboard privado
  // para permitirle la gestión, a menos que fuerce el modo visualización (?view=public).
  const isViewingPublicMode = searchParams?.view === 'public';
  if (visitor?.id === targetProfile.id && !isViewingPublicMode) {
    redirect('/profile');
  }

  // 5. COSECHA DE ACTIVOS INTELECTUALES (Fase II)
  // Extraemos podcasts, likes y colecciones asociados al ID del perfil validado.
  const [
    podcastsResponse,
    likesResponse,
    testimonialsResponse,
    collectionsResponse
  ] = await Promise.all([
    // A. Podcasts: El registro histórico de la voz del curador.
    supabase
      .from('micro_pods')
      .select('id, title, description, audio_url, cover_image_url, created_at, duration_seconds, play_count, like_count, status, creation_mode')
      .eq('user_id', targetProfile.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false }),

    // B. Resonancia: Sumatoria de likes para el cálculo de prestigio en la UI.
    supabase
      .from('micro_pods')
      .select('like_count')
      .eq('user_id', targetProfile.id)
      .eq('status', 'published'),

    // C. Testimonios: Validaciones sociales aprobadas por el curador.
    supabase
      .from('profile_testimonials')
      .select('*, author:author_user_id(full_name, avatar_url, username)')
      .eq('profile_user_id', targetProfile.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .returns<TestimonialWithAuthor[]>(),

    // D. Colecciones: Hilos de conocimiento públicos.
    supabase
      .from('collections')
      .select('id, title, description, cover_image_url, updated_at, collection_items(count)')
      .eq('owner_id', targetProfile.id)
      .eq('is_public', true)
      .order('updated_at', { ascending: false })
  ]);

  // 6. NORMALIZACIÓN Y CÁLCULO DE MÉTRICAS
  const podcasts = (podcastsResponse.data || []) as PublicPodcast[];
  const totalLikes = likesResponse.data?.reduce((sum, current) => sum + (current.like_count || 0), 0) ?? 0;
  const testimonials = testimonialsResponse.data || [];

  // Transformación del conteo de ítems de colección (Supabase format to Interface)
  const publicCollections = (collectionsResponse.data || []).map(col => ({
    ...col,
    collection_items: Array.isArray(col.collection_items) ? col.collection_items : [{ count: 0 }]
  })) as unknown as Collection[];

  /**
   * 7. ENTREGA ATÓMICA AL CLIENTE
   * Inyectamos el ID como 'key' para forzar la estabilidad de la reconciliación de React.
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

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * Este orquestador elimina la 'Mentira' de los nombres de columnas (handle -> username).
 * Al utilizar Promise.all, el tiempo de ejecución en el servidor es equivalente
 * a la consulta más lenta, optimizando el TTFB (Time To First Byte).
 * La redirección automática protege la experiencia del usuario propietario.
 */