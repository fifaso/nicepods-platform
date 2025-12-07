// app/podcast/[id]/page.tsx
// VERSIÓN: 5.11 (Final: Verified Data Pipeline for Sources & Tags)

import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { PodcastView } from "@/components/podcast-view";
import { PodcastWithProfile } from '@/types/podcast';
import { createClient } from '@/lib/supabase/server'; 

type PodcastPageProps = {
  params: {
    id: string;
  };
};

export default async function PodcastDisplayPage({ params }: PodcastPageProps) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Redirige a la página de login, manteniendo la URL original para un retorno fácil.
    redirect(`/login?redirect=/podcast/${params.id}`);
  }

  // Consulta Maestra:
  // Aquí es donde aseguramos que el campo 'sources' viaja desde la DB al Frontend.
  const { data: podcastData, error } = await supabase
    .from("micro_pods")
    .select(`
      id, 
      user_id, 
      title, 
      description, 
      script_text, 
      audio_url,
      cover_image_url, 
      duration_seconds, 
      category, 
      status,
      play_count, 
      like_count, 
      created_at, 
      updated_at,
      creation_data,
      ai_tags, 
      user_tags,
      sources, 
      profiles ( full_name, avatar_url, username )
    `)
    .eq('id', params.id)
    .single<PodcastWithProfile>();

  if (error || !podcastData) {
    console.error(`Error al obtener podcast con ID ${params.id}:`, error?.message);
    notFound();
  }
  
  // Verificación de Like inicial para UX instantánea
  const { data: likeData } = await supabase
    .from('likes')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('podcast_id', podcastData.id)
    .single();
    
  const initialIsLiked = !!likeData;
  
  return (
    <PodcastView 
      podcastData={podcastData} 
      user={user} 
      initialIsLiked={initialIsLiked} 
    />
  );
}