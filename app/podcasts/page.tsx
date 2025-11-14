// app/podcasts/page.tsx
// VERSIÓN DE PRODUCCIÓN FINAL: Con el contrato de props corregido.

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { PodcastWithProfile } from '@/types/podcast';
import { LibraryTabs } from './library-tabs';
import type { Tables } from '@/types/supabase';

type UserCreationJob = Tables<'podcast_creation_jobs'>;
type ResonanceProfile = Tables<'user_resonance_profiles'>;
type LibraryViewMode = 'grid' | 'list' | 'compass';

export default async function PodcastsPage({ searchParams }: { searchParams: { tab: string, view: LibraryViewMode } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  const currentTab = searchParams.tab;
  const currentView = searchParams.view || 'grid';
  const defaultTab = currentTab === 'library' && user ? 'library' : 'discover';
  
  const profileQuery = '*, profiles(full_name, avatar_url, username)';
  
  const [
    publicPodcastsResult,
    userPodcastsResult,
    userCreationJobsResult,
    userProfileResult,
    allAnalyzedPodcastsResult,
    tagsResult
  ] = await Promise.all([
    supabase.from('micro_pods').select(profileQuery).eq('status', 'published').order('created_at', { ascending: false }),
    user ? supabase.from('micro_pods').select(profileQuery).eq('user_id', user.id).order('created_at', { ascending: false }) : Promise.resolve({ data: [], error: null }),
    user ? supabase.from('podcast_creation_jobs').select('*').eq('user_id', user.id).in('status', ['pending', 'processing']).eq('archived', false).order('created_at', { ascending: false }) : Promise.resolve({ data: [], error: null }),
    user ? supabase.from('user_resonance_profiles').select('*').eq('user_id', user.id).single() : Promise.resolve({ data: null, error: null }),
    currentView === 'compass' ? supabase.from('micro_pods').select('*, profiles(*)').not('final_coordinates', 'is', null).eq('status', 'published') : Promise.resolve({ data: [], error: null }),
    currentView === 'compass' ? supabase.rpc('get_all_unique_tags') : Promise.resolve({ data: [], error: null })
  ]);

  const publicPodcasts: PodcastWithProfile[] = (publicPodcastsResult.data as any[]) || [];
  const userCreatedPodcasts: PodcastWithProfile[] = (userPodcastsResult.data as any[]) || [];
  const userCreationJobs: UserCreationJob[] = (userCreationJobsResult.data as UserCreationJob[]) || [];
  const userProfile: ResonanceProfile | null = userProfileResult.data;
  const allAnalyzedPodcasts: PodcastWithProfile[] = (allAnalyzedPodcastsResult.data as any[]) || [];
  const compassTags: string[] = tagsResult.data || [];

  const compassProps = currentView === 'compass' ? {
    userProfile: userProfile,
    podcasts: allAnalyzedPodcasts,
    tags: compassTags,
  } : null;

  return (
    <div className="container mx-auto max-w-7xl py-8 md:py-12 px-4">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Centro de Descubrimiento</h1>
        <p className="text-lg text-muted-foreground mt-2">Descubre conocimiento en experiencias de audio concisas.</p>
      </header>
      
      <LibraryTabs
        defaultTab={defaultTab}
        user={user}
        publicPodcasts={publicPodcasts}
        userCreatedPodcasts={userCreatedPodcasts}
        userCreationJobs={userCreationJobs}
        compassProps={compassProps}
      />
    </div>
  );
}