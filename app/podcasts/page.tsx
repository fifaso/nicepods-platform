// app/podcasts/page.tsx
// VERSIÓN FINAL CON LAYOUT REESTRUCTURADO

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { PodcastWithProfile } from '@/types/podcast';
import { LibraryTabs } from './library-tabs'; // El componente hijo ahora contiene toda la lógica de UI

// Tipos de datos que se pasarán como props (sin cambios)
type UserCreatedPodcast = {
  id: number;
  created_at: string;
  title: string;
  description: string | null;
  status: string;
  audio_url: string | null;
  duration_seconds: number | null;
};

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

  // La lógica de obtención de datos permanece sin cambios. Es robusta y eficiente.
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
      const { data, error } = await supabase.from('micro_pods').select('id, created_at, title, description, status, audio_url, duration_seconds').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      userCreatedPodcasts = data || [];
    } catch (error) { console.error("Error al obtener micro-podcasts del usuario:", error); userCreatedPodcasts = []; }
  }

  const currentTab = searchParams.tab;
  const defaultTab = currentTab === 'library' && user ? 'library' : 'discover';

  return (
    <div className="container mx-auto max-w-7xl py-8 md:py-12 px-4">
      {/* [INTERVENCIÓN QUIRÚRGICA #1]: Header optimizado para reducir espacio vertical */}
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Centro de Descubrimiento</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Descubre conocimiento en experiencias de audio concisas.
        </p>
      </header>
      
      {/* [INTERVENCIÓN QUIRÚRGICA #2]: Se delega toda la UI, incluida la nueva barra de control, a LibraryTabs */}
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