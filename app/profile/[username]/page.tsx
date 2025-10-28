// app/profile/[username]/page.tsx
// VERSIÓN FINAL COMPLETA - SERVIDOR DE PÁGINA DE PERFIL DINÁMICA

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ProfileView, type ProfileData, type TestimonialWithAuthor } from '@/components/profile-view';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

// Define el tipo de las props que Next.js pasará a la página
type ProfilePageProps = {
  params: { username: string };
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = createClient(cookies());

  // 1. Obtener la sesión del usuario que está VISITANDO la página (puede ser nulo)
  const { data: { user: visitor } } = await supabase.auth.getUser();

  // 2. Obtener el perfil del usuario VISITADO usando el `username` de la URL
  const { data: visitedProfile } = await supabase
    .from('profiles')
    .select('*, subscriptions(*, plans(*))')
    .eq('username', params.username)
    .single<ProfileData>();
  
  // Si el perfil buscado no existe, Next.js renderizará la página 404.
  if (!visitedProfile) {
    notFound();
  }
  
  // 3. Determinar si el visitante es el dueño del perfil
  const isOwner = visitor?.id === visitedProfile.id;

  // 4. Obtener todos los datos adicionales necesarios en paralelo para máxima eficiencia
  const [
    totalPodcastsResponse,
    totalLikesResponse,
    podcastsThisMonthResponse,
    testimonialsResponse,
    followStatusResponse 
  ] = await Promise.all([
    // Cuenta el total de podcasts creados por el usuario del perfil
    supabase.from('micro_pods').select('id', { count: 'exact', head: true }).eq('user_id', visitedProfile.id),
    
    // Suma todos los likes recibidos en los podcasts del usuario del perfil
    supabase.from('micro_pods').select('like_count').eq('user_id', visitedProfile.id),
    
    // Cuenta los podcasts creados en el último ciclo de 30 días
    supabase.from('micro_pods').select('id', { count: 'exact', head: true }).eq('user_id', visitedProfile.id).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    
    // Obtiene los testimonios: si es el dueño, trae todos (para moderar); si es visitante, solo los aprobados.
    isOwner
      ? supabase.from('profile_testimonials').select('*, author:author_user_id(full_name, avatar_url)').eq('profile_user_id', visitedProfile.id).order('created_at', { ascending: false }).returns<TestimonialWithAuthor[]>()
      : supabase.from('profile_testimonials').select('*, author:author_user_id(full_name, avatar_url)').eq('profile_user_id', visitedProfile.id).eq('status', 'approved').order('created_at', { ascending: false }).returns<TestimonialWithAuthor[]>(),
      
    // Comprueba si el visitante actual ya sigue al usuario del perfil
    visitor 
      ? supabase.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', visitor.id).eq('following_id', visitedProfile.id)
      : Promise.resolve({ count: 0, data: null, error: null }) // Si no hay visitante, no hay seguimiento
  ]);

  // 5. Procesar los resultados de las consultas
  const totalPodcasts = totalPodcastsResponse.count ?? 0;
  const podcastsCreatedThisMonth = podcastsThisMonthResponse.count ?? 0;
  const totalLikes = totalLikesResponse.data?.reduce((sum, pod) => sum + (pod.like_count || 0), 0) ?? 0;
  const testimonials = testimonialsResponse.data ?? [];
  const initialIsFollowing = (followStatusResponse.count ?? 0) > 0;

  // 6. Pasar todos los datos procesados al componente de cliente para su renderizado
  return (
    <ProfileView 
      isOwner={isOwner}
      profile={visitedProfile} 
      podcastsCreatedThisMonth={podcastsCreatedThisMonth}
      totalPodcasts={totalPodcasts}
      totalLikes={totalLikes}
      initialTestimonials={testimonials}
      initialIsFollowing={initialIsFollowing}
    />
  );
}