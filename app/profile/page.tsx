// app/profile/page.tsx
// VERSIÓN: 3.0 (Fix: Renamed Component Import & Props Sync)

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileView, type ProfileData, type TestimonialWithAuthor } from '@/components/profile-client-component';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default async function ProfilePage() {
  const supabase = createClient(cookies());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/profile');
  }
  
  const [
    profileResponse,
    totalPodcastsResponse,
    totalLikesResponse,
    podcastsThisMonthResponse,
    testimonialsResponse
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*, subscriptions(*, plans(*))')
      .eq('id', user.id)
      .single<ProfileData>(),
    
    supabase
      .from('micro_pods')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),

    supabase
      .from('micro_pods')
      .select('like_count')
      .eq('user_id', user.id),
      
    supabase
      .from('micro_pods')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      
    supabase
      .from('profile_testimonials')
      .select('*, author:author_user_id(full_name, avatar_url)')
      .eq('profile_user_id', user.id)
      .order('created_at', { ascending: false })
      .returns<TestimonialWithAuthor[]>()
  ]);

  const { data: profile, error: profileError } = profileResponse;

  if (profileError || !profile) {
    console.error("Error fetching profile for user:", user.id, profileError);
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error al Cargar el Perfil</AlertTitle>
          <AlertDescription>No pudimos encontrar los datos de tu perfil. Por favor, intenta recargar la página o contacta con soporte.</AlertDescription>
        </Alert>
      </div>
    );
  }
    
  const totalPodcasts = totalPodcastsResponse.count ?? 0;
  const podcastsCreatedThisMonth = podcastsThisMonthResponse.count ?? 0;
  const totalLikes = totalLikesResponse.data?.reduce((sum, pod) => sum + (pod.like_count || 0), 0) ?? 0;
  const testimonials = testimonialsResponse.data ?? [];

  return (
    // [CORRECCIÓN 2]: Renderizamos ProfileView con los nuevos props requeridos
    <ProfileView 
      profile={profile} 
      podcastsCreatedThisMonth={podcastsCreatedThisMonth}
      totalPodcasts={totalPodcasts}
      totalLikes={totalLikes}
      initialTestimonials={testimonials}
      isOwner={true} // En /profile siempre eres el dueño
      initialIsFollowing={false} // No te puedes seguir a ti mismo
    />
  );
}