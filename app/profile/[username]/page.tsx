// app/profile/[username]/page.tsx
// VERSIÓN: 5.0 (Social Proof: Testimonials Integration & Security)

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { 
  PublicProfilePage, 
  type ProfileData, 
  type PublicPodcast,
  type TestimonialWithAuthor 
} from '@/components/profile-client-component';

type ProfilePageProps = {
  params: { username: string };
};

export default async function PublicProfileRoute({ params }: ProfilePageProps) {
  const supabase = createClient(cookies());

  // 1. Identificar al visitante (para saber si puede dejar review o si es el dueño)
  const { data: { user: visitor } } = await supabase.auth.getUser();

  // 2. Decodificar username y buscar perfil
  const targetUsername = decodeURIComponent(params.username);
  
  const { data: targetProfile, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, bio')
    .eq('username', targetUsername)
    .single<ProfileData>();
  
  if (error || !targetProfile) {
    notFound(); 
  }
  
  // 3. CANONICAL REDIRECT: Si soy yo, voy a mi panel privado
  if (visitor?.id === targetProfile.id) {
    redirect('/profile');
  }

  // 4. CARGA DE DATOS PARALELA (Optimizada)
  const [podcastsResponse, likesResponse, testimonialsResponse] = await Promise.all([
    // A. Podcasts Publicados
    supabase
      .from('micro_pods')
      .select('id, title, description, audio_url, created_at, duration_seconds')
      .eq('user_id', targetProfile.id)
      .eq('status', 'published') 
      .order('created_at', { ascending: false }),
      
    // B. Total de Likes
    supabase
      .from('micro_pods')
      .select('like_count')
      .eq('user_id', targetProfile.id)
      .eq('status', 'published'),

    // C. Testimonios Aprobados (Solo lo que queremos mostrar al mundo)
    supabase
      .from('profile_testimonials')
      .select('*, author:author_user_id(full_name, avatar_url)')
      .eq('profile_user_id', targetProfile.id)
      .eq('status', 'approved') // FILTRO CRÍTICO
      .order('created_at', { ascending: false })
      .returns<TestimonialWithAuthor[]>()
  ]);

  const podcasts = (podcastsResponse.data || []) as PublicPodcast[];
  const totalLikes = likesResponse.data?.reduce((sum, p) => sum + (p.like_count || 0), 0) ?? 0;
  const testimonials = testimonialsResponse.data || [];

  // 5. Renderizado
  return (
    <PublicProfilePage 
      profile={targetProfile} 
      podcasts={podcasts}
      totalLikes={totalLikes}
      initialTestimonials={testimonials}
    />
  );
}