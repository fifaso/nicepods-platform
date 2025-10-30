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
    testimonialsResponse,
    followStatusResponse 
  ] = await Promise.all([
    supabase.from('micro_pods').select('id', { count: 'exact', head: true }).eq('user_id', visitedProfile.id),
    supabase.from('micro_pods').select('like_count').eq('user_id', visitedProfile.id),
    supabase.from('micro_pods').select('id', { count: 'exact', head: true }).eq('user_id', visitedProfile.id).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    isOwner
      ? supabase.from('profile_testimonials').select('*, author:author_user_id(full_name, avatar_url)').eq('profile_user_id', visitedProfile.id).order('created_at', { ascending: false }).returns<TestimonialWithAuthor[]>()
      : supabase.from('profile_testimonials').select('*, author:author_user_id(full_name, avatar_url)').eq('profile_user_id', visitedProfile.id).eq('status', 'approved').order('created_at', { ascending: false }).returns<TestimonialWithAuthor[]>(),
    visitor 
      ? supabase.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', visitor.id).eq('following_id', visitedProfile.id)
      : Promise.resolve({ count: 0, data: null, error: null })
  ]);

  const totalPodcasts = totalPodcastsResponse.count ?? 0;
  const podcastsCreatedThisMonth = podcastsThisMonthResponse.count ?? 0;
  const totalLikes = totalLikesResponse.data?.reduce((sum, pod) => sum + (pod.like_count || 0), 0) ?? 0;
  const testimonials = testimonialsResponse.data ?? [];
  const initialIsFollowing = (followStatusResponse.count ?? 0) > 0;

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