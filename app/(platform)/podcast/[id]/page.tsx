// app/podcast/[id]/page.tsx
// VERSIÓN: 7.7 (View Switcher Architecture - Narrative vs Pulse Pill)

import { PodcastView } from "@/components/podcast-view";
import { PulsePillView } from "@/components/pulse-pill-view"; // [NUEVO]: Componente especializado
import { createClient } from '@/lib/supabase/server';
import { PodcastWithProfile } from '@/types/podcast';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

type PodcastPageProps = {
  params: {
    id: string;
  };
};

/**
 * GENERACIÓN DE METADATOS (SEO)
 * Mantiene la visibilidad social y la indexación profesional.
 * Es independiente de la lógica de visualización interna.
 */
export async function generateMetadata({ params }: PodcastPageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data: podcast } = await supabase
    .from("micro_pods")
    .select("title, description, cover_image_url")
    .eq('id', params.id)
    .single();

  if (!podcast) return { title: "Podcast no encontrado | NicePod" };

  return {
    title: `${podcast.title} | NicePod`,
    description: podcast.description,
    openGraph: {
      title: podcast.title,
      description: podcast.description || '',
      images: [podcast.cover_image_url || '/nicepod-logo.png'],
      type: 'music.song',
    },
    twitter: {
      card: 'summary_large_image',
      title: podcast.title,
      description: podcast.description || '',
      images: [podcast.cover_image_url || '/nicepod-logo.png'],
    }
  };
}

export default async function PodcastDisplayPage({ params }: PodcastPageProps) {
  const supabase = createClient();

  // Selector maestro que garantiza todas las propiedades para la interfaz PodcastWithProfile
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

  // 1. FETCHING PARALELO DE ALTA VELOCIDAD
  // Disparamos datos públicos y sesión en paralelo para minimizar el Time-to-First-Byte (TTFB)
  const [podcastResponse, repliesResponse, authResponse] = await Promise.all([
    supabase.from("micro_pods").select(fullFields).eq('id', params.id).single(),
    supabase.from('micro_pods').select(fullFields).eq('parent_id', params.id).order('created_at', { ascending: true }),
    supabase.auth.getUser()
  ]);

  const podcastData = podcastResponse.data;
  const user = authResponse.data.user;

  // 2. GUARDIA DE PERSISTENCIA
  if (podcastResponse.error || !podcastData) {
    console.error(`[NicePod-Page-Error] No se pudo localizar el recurso ${params.id}`);
    notFound();
  }

  // 3. FETCHING DE INTERACCIONES PRIVADAS (Likes)
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

  // 4. CASTING DE TIPOS Y SEGMENTACIÓN DE VISTA
  const typedPodcast = podcastData as unknown as PodcastWithProfile;
  const typedReplies = (repliesResponse.data || []) as unknown as PodcastWithProfile[];

  /**
   * [SISTEMA DE BIFURCACIÓN ESTRATÉGICA]:
   * Decidimos qué vista entregar basándonos en el modo de creación.
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

  // Por defecto, entregamos la vista narrativa estándar
  return (
    <PodcastView
      podcastData={typedPodcast}
      user={user}
      initialIsLiked={initialIsLiked}
      replies={typedReplies}
    />
  );
}