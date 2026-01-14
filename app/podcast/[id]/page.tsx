// app/podcast/[id]/page.tsx
// VERSIÓN: 7.3 (Final Production - Type Strict & Public Ready)

import { notFound } from 'next/navigation';
import { PodcastView } from "@/components/podcast-view";
import { PodcastWithProfile } from '@/types/podcast';
import { createClient } from '@/lib/supabase/server';

type PodcastPageProps = {
  params: {
    id: string;
  };
};

export default async function PodcastDisplayPage({ params }: PodcastPageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // SELECTOR MAESTRO: Garantiza que traemos todo lo necesario para PodcastWithProfile
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

  // 1. FETCHING PÚBLICO
  // Forzamos el tipado con 'as unknown as' tras el select para satisfacer a TS
  const { data: podcastData, error: podcastError } = await supabase
    .from("micro_pods")
    .select(fullFields)
    .eq('id', params.id)
    .single();

  if (podcastError || !podcastData) {
    console.error(`Error DB en Podcast ${params.id}:`, podcastError?.message);
    notFound();
  }

  const { data: repliesData } = await supabase
    .from('micro_pods')
    .select(fullFields)
    .eq('parent_id', params.id)
    .order('created_at', { ascending: true });

  // 2. FETCHING PRIVADO (Likes)
  let initialIsLiked = false;
  if (user) {
    const { data: likeData } = await supabase
      .from('likes')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('podcast_id', params.id)
      .single();

    initialIsLiked = !!likeData;
  }

  // Cast final para asegurar compatibilidad total con el componente
  const typedPodcast = podcastData as unknown as PodcastWithProfile;
  const typedReplies = (repliesData || []) as unknown as PodcastWithProfile[];

  return (
    <PodcastView
      podcastData={typedPodcast}
      user={user}
      initialIsLiked={initialIsLiked}
      replies={typedReplies}
    />
  );
}