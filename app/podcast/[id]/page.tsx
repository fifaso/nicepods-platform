// app/podcast/[id]/page.tsx
// VERSIÓN: 7.0 (Remix Ready: Fetching Threads & Drafts context)

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

  // 1. Verificación de Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?redirect=/podcast/${params.id}`);
  }

  // 2. EJECUCIÓN PARALELA DE DATOS
  const [podcastResponse, likeResponse, repliesResponse] = await Promise.all([
    // A. El Podcast Principal (Padre)
    supabase
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
        reviewed_by_user,
        profiles ( full_name, avatar_url, username )
      `)
      .eq('id', params.id)
      .single<PodcastWithProfile>(),

    // B. Estado del Like (Interacción)
    supabase
      .from('likes')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('podcast_id', params.id)
      .single(),

    // C. Hilo de Respuestas (Remixes & Thread)
    // [ESTRATEGIA]: No filtramos por 'published' aquí.
    // Traemos todo lo que la política RLS permita (Públicos + Mis Borradores).
    // El componente PodcastView se encarga de separar visualmente los pendientes de los publicados.
    supabase
      .from('micro_pods')
      .select(`
        id, 
        user_id, 
        title, 
        description,
        duration_seconds, 
        created_at, 
        cover_image_url, 
        audio_url,
        status,
        profiles ( full_name, avatar_url, username )
      `)
      .eq('parent_id', params.id)
      .order('created_at', { ascending: true }) // Orden cronológico para seguir la conversación
  ]);

  const podcastData = podcastResponse.data;
  
  if (podcastResponse.error || !podcastData) {
    console.error(`Error al obtener podcast ${params.id}:`, podcastResponse.error?.message);
    notFound();
  }
  
  const initialIsLiked = !!likeResponse.data;
  const replies = repliesResponse.data || []; 

  return (
    <PodcastView 
      podcastData={podcastData} 
      user={user} 
      initialIsLiked={initialIsLiked}
      replies={replies} 
    />
  );
}