// app/podcasts/page.tsx
// VERSIÓN DE PRODUCCIÓN FINAL: Con obtención de datos condicional para la Brújula de Resonancia.

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { PodcastWithProfile } from '@/types/podcast';
import { LibraryTabs } from './library-tabs';
import type { Tables } from '@/types/supabase';

// Usamos los tipos generados por Supabase para máxima robustez y consistencia.
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

  // --- OBTENCIÓN DE DATOS ESTÁNDAR (Lógica existente preservada) ---
  const { data: publicPodcastsData, error: publicPodcastsError } = await supabase.from('micro_pods').select(profileQuery).eq('status', 'published').order('created_at', { ascending: false });

  if (publicPodcastsError) console.error("Error al obtener podcasts públicos:", publicPodcastsError);
  const publicPodcasts: PodcastWithProfile[] = (publicPodcastsData as any[]) || [];

  let userCreationJobs: UserCreationJob[] = [];
  let userCreatedPodcasts: PodcastWithProfile[] = [];

  if (user) {
    const { data: jobsData, error: jobsError } = await supabase.from('podcast_creation_jobs').select('id, created_at, job_title, status, error_message, micro_pod_id').eq('user_id', user.id).in('status', ['pending', 'processing']).eq('archived', false).order('created_at', { ascending: false });
    if (jobsError) console.error("Error al obtener trabajos de creación:", jobsError);
    // Type casting seguro para satisfacer al compilador.
    userCreationJobs = (jobsData as UserCreationJob[]) || [];
    
    const { data: userPodcastsData, error: userPodcastsError } = await supabase.from('micro_pods').select(profileQuery).eq('user_id', user.id).order('created_at', { ascending: false });
    if (userPodcastsError) console.error("Error al obtener micro-podcasts del usuario:", userPodcastsError);
    userCreatedPodcasts = (userPodcastsData as any[]) || [];
  }

  // --- [INTERVENCIÓN ESTRATÉGICA] OBTENCIÓN DE DATOS CONDICIONAL PARA LA BRÚJULA ---
  let compassProps: { userProfile: ResonanceProfile | null; podcasts: PodcastWithProfile[]; tags: string[] } | null = null;
  
  if (user && defaultTab === 'library' && currentView === 'compass') {
    const [
      { data: resonanceProfile, error: profileError },
      { data: allPodcastsData, error: allPodcastsError },
      { data: availableTags, error: tagsError }
    ] = await Promise.all([
      supabase.from('user_resonance_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('micro_pods').select('*, profiles(*)').not('final_coordinates', 'is', null).eq('status', 'published'),
      supabase.rpc('get_all_unique_tags')
    ]);

    if (profileError && profileError.code !== 'PGRST116') console.error("Error al obtener el perfil de resonancia:", profileError);
    if (allPodcastsError) console.error("Error al obtener todos los podcasts para la brújula:", allPodcastsError);
    if (tagsError) console.error("Error al obtener los tags únicos:", tagsError);
    
    compassProps = {
      userProfile: resonanceProfile,
      podcasts: (allPodcastsData as PodcastWithProfile[]) || [],
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
        defaultTab={defaultTab}
        user={user}
        publicPodcasts={publicPodcasts}
        userCreationJobs={userCreationJobs}
        userCreatedPodcasts={userCreatedPodcasts}
        compassProps={compassProps}
      />
    </div>
  );
}