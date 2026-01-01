// app/profile/[username]/page.tsx
// VERSIÓN: 6.1 (Curator Integration: Public Library & Reputation)

import { createClient } from '@/lib/supabase/server'; // [NOTA]: Ya no requiere cookies()
import { notFound, redirect } from 'next/navigation';
import { 
  PublicProfilePage, 
  type ProfileData, 
  type PublicPodcast,
  type TestimonialWithAuthor 
} from '@/components/profile-client-component';

type ProfilePageProps = {
  params: { username: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function PublicProfileRoute({ params, searchParams }: ProfilePageProps) {
  const supabase = createClient();

  // 1. Identificar al visitante
  const { data: { user: visitor } } = await supabase.auth.getUser();

  // 2. Decodificar username y buscar perfil (Ahora con datos de Curador)
  const targetUsername = decodeURIComponent(params.username);
  
  const { data: targetProfile, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, bio, reputation_score, is_verified, followers_count, following_count') // [MEJORA]: Datos sociales
    .eq('username', targetUsername)
    .single<ProfileData>();
  
  if (error || !targetProfile) {
    notFound(); 
  }
  
  // 3. CANONICAL REDIRECT
  const isViewingPublicMode = searchParams?.view === 'public';
  if (visitor?.id === targetProfile.id && !isViewingPublicMode) {
    redirect('/profile');
  }

  // 4. CARGA DE DATOS PARALELA (Ahora con Colecciones Públicas)
  const [podcastsResponse, likesResponse, testimonialsResponse, collectionsResponse] = await Promise.all([
    // A. Podcasts Publicados
    supabase
      .from('micro_pods')
      .select('id, title, description, audio_url, created_at, duration_seconds, play_count')
      .eq('user_id', targetProfile.id)
      .eq('status', 'published') 
      .order('created_at', { ascending: false }),
      
    // B. Likes Totales
    supabase
      .from('micro_pods')
      .select('like_count')
      .eq('user_id', targetProfile.id)
      .eq('status', 'published'),

    // C. Testimonios Aprobados
    supabase
      .from('profile_testimonials')
      .select('*, author:author_user_id(full_name, avatar_url)')
      .eq('profile_user_id', targetProfile.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .returns<TestimonialWithAuthor[]>(),

    // D. [NUEVO] Colecciones Públicas (El Tesoro del Curador)
    supabase
      .from('collections')
      .select('id, title, description, cover_image_url, updated_at, collection_items(count)')
      .eq('owner_id', targetProfile.id)
      .eq('is_public', true) // SOLO PÚBLICAS
      .order('updated_at', { ascending: false })
  ]);

  const podcasts = (podcastsResponse.data || []) as PublicPodcast[];
  const totalLikes = likesResponse.data?.reduce((sum, p) => sum + (p.like_count || 0), 0) ?? 0;
  const testimonials = testimonialsResponse.data || [];
  const publicCollections = collectionsResponse.data || []; // [NUEVO]

  return (
    <PublicProfilePage 
      profile={targetProfile} 
      podcasts={podcasts}
      totalLikes={totalLikes}
      initialTestimonials={testimonials}
      publicCollections={publicCollections} // [INYECCIÓN DE DATOS]
    />
  );
}