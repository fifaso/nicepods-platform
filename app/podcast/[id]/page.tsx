// app/podcast/[id]/page.tsx
// VERSIÓN: 7.5 (Master Integrity - Shielded Production & SEO Ready)

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PodcastView } from "@/components/podcast-view";
import { PodcastWithProfile } from '@/types/podcast';
import { createClient } from '@/lib/supabase/server'; 

type PodcastPageProps = {
  params: {
    id: string;
  };
};

/**
 * GENERACIÓN DE METADATOS DINÁMICOS (SEO)
 * Estratégico: Indexamos el contenido incluso si los activos multimedia
 * están terminando de procesarse.
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

  // SELECTOR MAESTRO: Campos para satisfacer la interfaz y el nuevo sistema de integridad
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

  // 1. FETCHING PARALELO (Máxima Eficiencia)
  const [podcastResponse, repliesResponse, authResponse] = await Promise.all([
    supabase.from("micro_pods").select(fullFields).eq('id', params.id).single(),
    supabase.from('micro_pods').select(fullFields).eq('parent_id', params.id).order('created_at', { ascending: true }),
    supabase.auth.getUser()
  ]);

  const podcastData = podcastResponse.data;
  const user = authResponse.data.user;

  // 2. GUARDIA DE EXISTENCIA
  if (podcastResponse.error || !podcastData) {
    console.error(`[NicePod-Error] Fallo en recuperación de Podcast ID ${params.id}`);
    notFound();
  }

  // 3. LÓGICA DE INTEGRIDAD (Gatekeeper)
  // Determinamos si el contenido está listo para consumo multimedia total.
  const isReady = podcastData.processing_status === 'completed';
  const isFailed = podcastData.processing_status === 'failed';

  // 4. FETCHING DE INTERACCIONES (Solo si hay sesión activa)
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

  // 5. NORMALIZACIÓN Y CASTING DE TIPOS
  const typedPodcast = podcastData as unknown as PodcastWithProfile;
  const typedReplies = (repliesResponse.data || []) as unknown as PodcastWithProfile[];

  /**
   * HANDOFF AL COMPONENTE DE CLIENTE
   * El componente <PodcastView> es el encargado de renderizar el estado
   * "En Construcción" si detecta que typedPodcast.processing_status !== 'completed'
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