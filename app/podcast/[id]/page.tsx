// app/podcast/[id]/page.tsx
// VERSIÓN: 7.6 (Production Final - Full Fetching & Integrity Guard)

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
 * GENERACIÓN DE METADATOS (SEO)
 * Mantiene la visibilidad social incluso durante la forja del activo.
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

  // Selector maestro para satisfacer la interfaz PodcastWithProfile
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

  // 1. FETCHING PARALELO DE ALTA DISPONIBILIDAD
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

  // 3. FETCHING DE INTERACCIONES PRIVADAS
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

  // 4. CASTING DE TIPOS Y HANDOFF
  const typedPodcast = podcastData as unknown as PodcastWithProfile;
  const typedReplies = (repliesResponse.data || []) as unknown as PodcastWithProfile[];

  return (
    <PodcastView 
      podcastData={typedPodcast} 
      user={user} 
      initialIsLiked={initialIsLiked}
      replies={typedReplies}
    />
  );
}