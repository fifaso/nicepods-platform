// app/profile/[username]/page.tsx
// VERSIÓN: 6.0 (Fix: Allow Owner to View Public Profile via Param)

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
  searchParams: { [key: string]: string | string[] | undefined }; // [NUEVO]: Tipado para recibir query params
};

export default async function PublicProfileRoute({ params, searchParams }: ProfilePageProps) {
  const supabase = createClient(cookies());

  // 1. Identificar al visitante
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
  
  // 3. CANONICAL REDIRECT (LÓGICA MEJORADA)
  // Si soy yo, PERO NO he pedido explícitamente ver la versión pública (?view=public), redirigir.
  const isViewingPublicMode = searchParams?.view === 'public';

  if (visitor?.id === targetProfile.id && !isViewingPublicMode) {
    redirect('/profile');
  }

  // 4. CARGA DE DATOS PARALELA
  const [podcastsResponse, likesResponse, testimonialsResponse] = await Promise.all([
    supabase
      .from('micro_pods')
      .select('id, title, description, audio_url, created_at, duration_seconds')
      .eq('user_id', targetProfile.id)
      .eq('status', 'published') 
      .order('created_at', { ascending: false }),
      
    supabase
      .from('micro_pods')
      .select('like_count')
      .eq('user_id', targetProfile.id)
      .eq('status', 'published'),

    supabase
      .from('profile_testimonials')
      .select('*, author:author_user_id(full_name, avatar_url)')
      .eq('profile_user_id', targetProfile.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .returns<TestimonialWithAuthor[]>()
  ]);

  const podcasts = (podcastsResponse.data || []) as PublicPodcast[];
  const totalLikes = likesResponse.data?.reduce((sum, p) => sum + (p.like_count || 0), 0) ?? 0;
  const testimonials = testimonialsResponse.data || [];

  return (
    <PublicProfilePage 
      profile={targetProfile} 
      podcasts={podcasts}
      totalLikes={totalLikes}
      initialTestimonials={testimonials}
    />
  );
}