// app/podcasts/page.tsx
// VERSIÓN DE PRODUCCIÓN FINAL: Con manejo de tipos robusto y obtención de datos defensiva.

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

  // [INTERVENCIÓN ARQUITECTÓNICA DE LA VICTORIA]
  // Implementamos un patrón de obtención de datos robusto y defensivo.
  
  // 1. Ejecutamos todas las promesas y obtenemos los resultados completos.
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
    user ? supabase.from('podcast_creation_jobs').select('id, created_at, job_title, status, error_message, micro_pod_id, archived').eq('user_id', user.id).in('status', ['pending', 'processing']).eq('archived', false).order('created_at', { ascending: false }) : Promise.resolve({ data: [], error: null }),
    user ? supabase.from('user_resonance_profiles').select('*').eq('user_id', user.id).single() : Promise.resolve({ data: null, error: null }),
    // Solo obtenemos los datos masivos de la Brújula si la vista está activa.
    currentView === 'compass' ? supabase.from('micro_pods').select('*, profiles(*)').not('final_coordinates', 'is', null).eq('status', 'published') : Promise.resolve({ data: [], error: null }),
    currentView === 'compass' ? supabase.rpc('get_all_unique_tags') : Promise.resolve({ data: [], error: null })
  ]);

  // 2. Procesamos cada resultado de forma segura.
  if (publicPodcastsResult.error) console.error("Error al obtener podcasts públicos:", publicPodcastsResult.error.message);
  const publicPodcasts: PodcastWithProfile[] = (publicPodcastsResult.data as any[]) || [];
  
  if (userPodcastsResult.error) console.error("Error al obtener podcasts del usuario:", userPodcastsResult.error.message);
  const userCreatedPodcasts: PodcastWithProfile[] = (userPodcastsResult.data as any[]) || [];
  
  if (userCreationJobsResult.error) console.error("Error al obtener trabajos de creación:", userCreationJobsResult.error.message);
  const userCreationJobs: UserCreationJob[] = (userCreationJobsResult.data as UserCreationJob[]) || [];
  
  if (userProfileResult.error && userProfileResult.error.code !== 'PGRST116') console.error("Error al obtener perfil de resonancia:", userProfileResult.error.message);
  const userProfile: ResonanceProfile | null = userProfileResult.data;
  
  if (allAnalyzedPodcastsResult.error) console.error("Error al obtener podcasts para la brújula:", allAnalyzedPodcastsResult.error.message);
  const allAnalyzedPodcasts: PodcastWithProfile[] = (allAnalyzedPodcastsResult.data as any[]) || [];
  
  if (tagsResult.error) console.error("Error al obtener tags únicos:", tagsResult.error.message);
  const compassTags: string[] = tagsResult.data || [];

  const compassProps = currentView === 'compass' ? {
    userProfile: userProfile,
    podcasts: allAnalyzedPodcasts, // La brújula siempre muestra todos los podcasts
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
        userCreationJobs={userCreationJobs}
        userCreatedPodcasts={userCreatedPodcasts}
        compassProps={compassProps}
      />
    </div>
  );
}