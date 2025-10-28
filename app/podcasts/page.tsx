// app/podcasts/page.tsx
// VERSIÓN FINAL CON CONSULTA DE DATOS CORREGIDA PARA "MI BIBLIOTECA"

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { PodcastWithProfile } from '@/types/podcast';
import { LibraryTabs } from './library-tabs';

// [INTERVENCIÓN QUIRÚRGICA #1]: Se actualiza el tipo para que coincida con los nuevos datos que traeremos.
// El tipo `PodcastWithProfile` ya incluye el objeto `profiles`, que es lo que necesitamos.
type UserCreatedPodcast = PodcastWithProfile;

type UserCreationJob = {
  id: number;
  created_at: string;
  job_title: string | null;
  status: string;
  error_message: string | null;
  micro_pod_id: number | null;
};

export default async function PodcastsPage({ searchParams }: { searchParams: { tab: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  let publicPodcasts: PodcastWithProfile[] = [];
  try {
    const { data, error } = await supabase.from('micro_pods').select(`*, profiles(full_name, avatar_url)`).eq('status', 'published').order('created_at', { ascending: false });
    if (error) throw error;
    publicPodcasts = data || [];
  } catch (error) {
    console.error("Error al obtener podcasts públicos:", error);
    publicPodcasts = [];
  }

  let userCreationJobs: UserCreationJob[] = [];
  let userCreatedPodcasts: UserCreatedPodcast[] = [];
  if (user) {
    try {
      const { data, error } = await supabase.from('podcast_creation_jobs').select('id, created_at, job_title, status, error_message, micro_pod_id').eq('user_id', user.id).in('status', ['pending', 'processing']).eq('archived', false).order('created_at', { ascending: false });
      if (error) throw error;
      userCreationJobs = data || [];
    } catch (error) { console.error("Error al obtener trabajos de creación del usuario:", error); userCreationJobs = []; }
    
    try {
      // [INTERVENCIÓN QUIRÚRGICA #2]: Se modifica la consulta para que pida los datos del perfil asociado.
      // Ahora es idéntica en estructura a la consulta de `publicPodcasts`, garantizando datos completos.
      const { data, error } = await supabase.from('micro_pods')
        .select(`*, profiles(full_name, avatar_url)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      userCreatedPodcasts = data || [];
    } catch (error) { 
      console.error("Error al obtener micro-podcasts del usuario:", error); 
      userCreatedPodcasts = []; 
    }
  }

  const currentTab = searchParams.tab;
  const defaultTab = currentTab === 'library' && user ? 'library' : 'discover';

  return (
    <div className="container mx-auto max-w-7xl py-8 md:py-12 px-4">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Centro de Descubrimiento</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Descubre conocimiento en experiencias de audio concisas.
        </p>
      </header>
      
      <LibraryTabs
        defaultTab={defaultTab}
        user={user}
        publicPodcasts={publicPodcasts}
        userCreationJobs={userCreationJobs}
        userCreatedPodcasts={userCreatedPodcasts}
      />
    </div>
  );
}