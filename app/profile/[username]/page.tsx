// app/profile/[username]/page.tsx
// VERSIÓN FINAL COMPLETA - VALIDADA

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ProfileView, type ProfileData, type TestimonialWithAuthor } from '@/components/profile-view';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

type ProfilePageProps = {
  params: { username: string };
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = createClient(cookies());
  const { data: { user: visitor } } = await supabase.auth.getUser();

  const { data: visitedProfile } = await supabase
    .from('profiles')
    .select('*, subscriptions(*, plans(*))')
    .eq('username', params.username)
    .single<ProfileData>();
  
  if (!visitedProfile) {
    notFound();
  }
  
  const isOwner = visitor?.id === visitedProfile.id;

  const [
    totalPodcastsResponse,
    totalLikesResponse,
    podcastsThisMonthResponse,
    testimonialsResponse
  ] = await Promise.all([
    supabase.from('micro_pods').select('id', { count: 'exact', head: true }).eq('user_id', visitedProfile.id),
    supabase.from('micro_pods').select('like_count').eq('user_id', visitedProfile.id),
    supabase.from('micro_pods').select('id', { count: 'exact', head: true }).eq('user_id', visitedProfile.id).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    isOwner
      ? supabase.from('profile_testimonials').select('*, author:author_user_id(full_name, avatar_url)').eq('profile_user_id', visitedProfile.id).order('created_at', { ascending: false }).returns<TestimonialWithAuthor[]>()
      : supabase.from('profile_testimonials').select('*, author:author_user_id(full_name, avatar_url)').eq('profile_user_id', visitedProfile.id).eq('status', 'approved').order('created_at', { ascending: false }).returns<TestimonialWithAuthor[]>()
  ]);

  if (!visitedProfile) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error al Cargar el Perfil</AlertTitle>
          <AlertDescription>No se pudieron obtener los datos de este perfil.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalPodcasts = totalPodcastsResponse.count ?? 0;
  const podcastsCreatedThisMonth = podcastsThisMonthResponse.count ?? 0;
  const totalLikes = totalLikesResponse.data?.reduce((sum, pod) => sum + (pod.like_count || 0), 0) ?? 0;
  const testimonials = testimonialsResponse.data ?? [];

  return (
    <ProfileView 
      isOwner={isOwner}
      profile={visitedProfile} 
      podcastsCreatedThisMonth={podcastsCreatedThisMonth}
      totalPodcasts={totalPodcasts}
      totalLikes={totalLikes}
      initialTestimonials={testimonials}
    />
  );
}