// app/podcast/[id]/page.tsx
// VERSIÓN: 7.1 (Public Access Enabled & Hybrid Fetching)

// Eliminamos 'cookies' ya que createClient ahora es autónomo
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
  // 1. Cliente Supabase (Sin argumentos, según nueva arquitectura)
  const supabase = createClient();

  // 2. Verificación de Auth (Opcional, no bloqueante)
  const { data: { user } } = await supabase.auth.getUser();
  
  // [CORRECCIÓN CRÍTICA]: Eliminamos el redirect forzoso.
  // Permitimos que 'user' sea null para visitantes públicos.

  // 3. FETCHING ESTRATÉGICO
  // Separamos las promesas públicas de las privadas para evitar errores con user.id null
  
  // A. Datos Públicos (Siempre se ejecutan)
  const podcastPromise = supabase
    .from("micro_pods")
    .select(`
      id, user_id, title, description, script_text, audio_url,
      cover_image_url, duration_seconds, category, status,
      play_count, like_count, created_at, updated_at,
      creation_data, ai_tags, user_tags, sources, reviewed_by_user,
      profiles ( full_name, avatar_url, username, reputation_score, is_verified )
    `)
    .eq('id', params.id)
    .single<PodcastWithProfile>();

  const repliesPromise = supabase
    .from('micro_pods')
    .select(`
      id, user_id, title, description, duration_seconds, 
      created_at, cover_image_url, audio_url, status,
      profiles ( full_name, avatar_url, username )
    `)
    .eq('parent_id', params.id)
    .order('created_at', { ascending: true });

  // Ejecutamos consultas públicas en paralelo
  const [podcastResponse, repliesResponse] = await Promise.all([
    podcastPromise, 
    repliesPromise
  ]);

  const podcastData = podcastResponse.data;
  
  if (podcastResponse.error || !podcastData) {
    console.error(`Error 404 o DB en Podcast ${params.id}:`, podcastResponse.error?.message);
    notFound();
  }

  // B. Datos Privados (Solo si hay usuario logueado)
  let initialIsLiked = false;

  if (user) {
    const { data: likeData } = await supabase
      .from('likes')
      .select('user_id')
      .eq('user_id', user.id) // Aquí ya es seguro usar user.id
      .eq('podcast_id', params.id)
      .single();
    
    initialIsLiked = !!likeData;
  }

  // 4. Handoff al Cliente
  // Nota: Asegúrate de que <PodcastView> soporte recibir 'user' como null.
  return (
    <PodcastView 
      podcastData={podcastData} 
      user={user} 
      initialIsLiked={initialIsLiked}
      replies={repliesResponse.data || []} 
    />
  );
}