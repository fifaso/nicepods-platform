// app/podcast/[id]/page.tsx
// VERSIÓN: 7.8 (View Switcher Architecture - Dynamic Integrity Standard)
// Misión: Punto de entrada de servidor para visualización de podcasts.
// [ESTABILIZACIÓN]: Implementación de force-dynamic y optimización de metadatos síncronos.

import { PodcastView } from "@/components/podcast-view";
import { PulsePillView } from "@/components/feed/pulse-pill-view";
import { createClient } from '@/lib/supabase/server';
import { PodcastWithProfile } from '@/types/podcast';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

/**
 * [CONFIGURACIÓN DE RED]: force-dynamic
 * Garantizamos que el servidor siempre consulte la base de datos en cada petición.
 * Esto es vital para que, si el podcast termina de procesarse, el usuario vea 
 * el estado real sin depender exclusivamente del WebSocket del cliente.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PodcastPageProps = {
  params: {
    id: string;
  };
};

/**
 * generateMetadata: Motor de visibilidad y SEO técnico.
 */
export async function generateMetadata({ params }: PodcastPageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data: podcast } = await supabase
    .from("micro_pods")
    .select("title, description, cover_image_url, processing_status")
    .eq('id', params.id)
    .single();

  if (!podcast) return { title: "Punto de Sabiduría no localizado | NicePod" };

  // Usamos el placeholder oficial si la imagen aún no está lista
  const ogImage = podcast.cover_image_url || 'https://arbojlknwilqcszuqope.supabase.co/storage/v1/object/public/podcasts/static/placeholder-logo.png';

  return {
    title: `${podcast.title} | NicePod Intelligence`,
    description: podcast.description || "Escucha esta crónica de sabiduría generada en NicePod.",
    openGraph: {
      title: podcast.title,
      description: podcast.description || '',
      images: [ogImage],
      type: 'music.song',
    },
    twitter: {
      card: 'summary_large_image',
      title: podcast.title,
      description: podcast.description || '',
      images: [ogImage],
    }
  };
}

export default async function PodcastDisplayPage({ params }: PodcastPageProps) {
  const supabase = createClient();

  /**
   * [CORE]: Selección de campos de alta fidelidad.
   * Incluimos todas las banderas de integridad para que PodcastView (v22.0)
   * reciba el estado exacto del inventario multimedia.
   */
  const fullFields = `
    *,
    profiles:user_id (
      full_name,
      avatar_url,
      username,
      reputation_score,
      is_verified
    )
  `;

  // 1. FETCHING PARALELO DE ALTA VELOCIDAD (SSR T0)
  const [podcastResponse, repliesResponse, authResponse] = await Promise.all([
    supabase.from("micro_pods").select(fullFields).eq('id', params.id).single(),
    supabase.from('micro_pods').select(fullFields).eq('parent_id', params.id).order('created_at', { ascending: true }),
    supabase.auth.getUser()
  ]);

  const podcastData = podcastResponse.data;
  const user = authResponse.data.user;

  // 2. GUARDIA DE PERSISTENCIA
  if (podcastResponse.error || !podcastData) {
    console.error(`🛑 [NicePod-Router] Recurso inexistente: ${params.id}`);
    notFound();
  }

  // 3. CAPTURA DE INTERACCIONES SOCIALES (Private State)
  let initialIsLiked = false;
  if (user) {
    const { data: likeData } = await supabase
      .from('likes')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('podcast_id', params.id)
      .maybeSingle();

    initialIsLiked = !!likeData;
  }

  // 4. NORMALIZACIÓN DE TIPOS (Rigor TypeScript)
  const typedPodcast = podcastData as unknown as PodcastWithProfile;
  const typedReplies = (repliesResponse.data || []) as unknown as PodcastWithProfile[];

  /**
   * [BIFURCACIÓN DE VISTA SOBERANA]:
   * Decidimos el componente basándonos en la intención original de creación.
   */
  const isPulsePill = typedPodcast.creation_mode === 'pulse';

  if (isPulsePill) {
    return (
      <PulsePillView
        podcastData={typedPodcast}
        user={user}
        initialIsLiked={initialIsLiked}
        replies={typedReplies}
      />
    );
  }

  /**
   * [REVELACIÓN]:
   * Entregamos el control a PodcastView (v22.0), que gestionará
   * la actualización Realtime de audio e imagen si el estado es 'processing'.
   */
  return (
    <PodcastView
      podcastData={typedPodcast}
      user={user}
      initialIsLiked={initialIsLiked}
      replies={typedReplies}
    />
  );
}