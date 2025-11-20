// app/podcasts/page.tsx
// VERSIÓN FINAL Y COMPLETA: Llama a la RPC correcta y maneja toda la lógica de datos sin abreviaciones.

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { PodcastWithProfile } from '@/types/podcast';
import { LibraryTabs } from './library-tabs';
import type { Tables } from '@/types/supabase';

type UserCreationJob = Tables<'podcast_creation_jobs'>;
type ResonanceProfile = Tables<'user_resonance_profiles'>;
type LibraryViewMode = 'grid' | 'list' | 'compass';

// Se actualiza la interfaz para reflejar los 6 universos.
export interface CuratedShelvesData {
  most_resonant: PodcastWithProfile[] | null;
  deep_thought: PodcastWithProfile[] | null;
  practical_tools: PodcastWithProfile[] | null;
  tech_and_innovation: PodcastWithProfile[] | null;
  wellness_and_mind: PodcastWithProfile[] | null;
  narrative_and_stories: PodcastWithProfile[] | null;
}

export default async function PodcastsPage({ searchParams }: { searchParams: { tab: string, view: LibraryViewMode, limit?: string, universe?: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  const currentTab: 'library' | 'discover' = (searchParams.tab === 'library' || searchParams.tab === 'discover')
    ? searchParams.tab
    : 'discover';
  const currentView = searchParams.view || 'grid';
  const limit = parseInt(searchParams.limit || '10', 10);
  
  const profileQuery = '*, profiles(full_name, avatar_url, username)';
  
  // Obtenemos los datos estándar y los nuevos datos curados en paralelo.
  const [
    userPodcastsResult,
    userCreationJobsResult,
    curatedShelvesResult
  ] = await Promise.all([
    user ? supabase.from('micro_pods').select(profileQuery).eq('user_id', user.id).order('created_at', { ascending: false }) : Promise.resolve({ data: [], error: null }),
    user ? supabase.from('podcast_creation_jobs').select('*').eq('user_id', user.id).in('status', ['pending', 'processing']).eq('archived', false).order('created_at', { ascending: false }) : Promise.resolve({ data: [], error: null }),
    user ? supabase.rpc('get_curated_library_shelves', { p_user_id: user.id }) : supabase.rpc('get_generic_library_shelves')
  ]);

  const userCreatedPodcasts: PodcastWithProfile[] = (userPodcastsResult.data as any[]) || [];
  const userCreationJobs: UserCreationJob[] = (userCreationJobsResult.data as UserCreationJob[]) || [];
  const curatedShelves: CuratedShelvesData | null = curatedShelvesResult.data;
  
  if (curatedShelvesResult.error) {
    console.error("Error al obtener estanterías curadas:", curatedShelvesResult.error);
  }

  // La lógica para compassProps se mantiene completa para cuando se necesite.
  let compassProps: { userProfile: ResonanceProfile | null; podcasts: PodcastWithProfile[]; tags: string[] } | null = null;
  if (currentView === 'compass') {
    let userProfile: ResonanceProfile | null = null;
    let userCenterPoint = '(0,0)';

    if (user) {
        const { data: profileData } = await supabase.from('user_resonance_profiles').select('*').eq('user_id', user.id).single();
        userProfile = profileData;
        if (profileData?.current_center) {
            userCenterPoint = profileData.current_center as string;
        }
    }
    
    const [{ data: resonantPodcasts, error: resonantPodcastsError }, { data: availableTags, error: tagsError }] = await Promise.all([
      supabase.rpc('get_resonant_podcasts', { center_point: userCenterPoint, count_limit: limit }),
      supabase.rpc('get_all_unique_tags')
    ]);

    if (resonantPodcastsError) console.error("Error al obtener podcasts resonantes:", resonantPodcastsError);
    if (tagsError) console.error("Error al obtener los tags únicos:", tagsError);
    
    const podcastIds = resonantPodcasts?.map((p: any) => p.id) || [];
    let podcastsWithProfiles: PodcastWithProfile[] = [];
    if (podcastIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase.from('micro_pods').select(profileQuery).in('id', podcastIds);
        if (profilesError) console.error("Error al enriquecer podcasts resonantes con perfiles:", profilesError);
        podcastsWithProfiles = (profilesData as any[]) || [];
    }

    compassProps = {
      userProfile: userProfile,
      podcasts: podcastsWithProfiles,
      tags: availableTags || [],
    };
  }

  return (
    <div className="container mx-auto max-w-7xl py-8 md:py-12 px-4">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Centro de Descubrimiento</h1>
        <p className="text-lg text-muted-foreground mt-2">Descubre conocimiento en experiencias de audio concisas.</p>
      </header>
      
      <LibraryTabs
        defaultTab={currentTab}
        user={user}
        userCreatedPodcasts={userCreatedPodcasts}
        userCreationJobs={userCreationJobs}
        compassProps={compassProps}
        curatedShelves={curatedShelves}
      />
    </div>
  );
}