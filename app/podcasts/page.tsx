// app/podcasts/page.tsx
// VERSIÓN FINAL COMPLETA, CORREGIDA Y ROBUSTA

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { PodcastWithProfile } from '@/types/podcast';
import { LibraryTabs } from './library-tabs';

// Se mantiene el tipo actualizado que ya incluye el perfil del autor.
type UserCreatedPodcast = PodcastWithProfile;

type UserCreationJob = {
  id: number;
  created_at: string;
  job_title: string | null;
  status: string;
  error_message: string | null;
  micro_pod_id: number | null;
};

// [INTERVENCIÓN QUIRÚRGICA #1]: Se corrige la firma de la función para que sea consistente.
export default async function PodcastsPage({ searchParams }: { searchParams: { tab: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // [INTERVENCIÓN QUIRÚRGICA #2]: Se obtiene el 'user' en el ámbito principal de la función.
  // Esto hace que la variable 'user' sea accesible para toda la lógica posterior, corrigiendo el error.
  const { data: { user } } = await supabase.auth.getUser();

  // Se mantiene la consulta que incluye el `username` para los enlaces a perfiles.
  const profileQuery = '*, profiles(full_name, avatar_url, username)';

  let publicPodcasts: PodcastWithProfile[] = [];
  try {
    const { data, error } = await supabase.from('micro_pods').select(profileQuery).eq('status', 'published').order('created_at', { ascending: false });
    if (error) throw error;
    publicPodcasts = data || [];
  } catch (error) {
    console.error("Error al obtener podcasts públicos:", error);
    publicPodcasts = [];
  }

  let userCreationJobs: UserCreationJob[] = [];
  let userCreatedPodcasts: UserCreatedPodcast[] = [];

  // [INTERVENCIÓN QUIRÚRGICA #3]: Se reestructura la obtención de datos del usuario logueado.
  // El bloque `if (user)` ahora encapsula solo la lógica que depende del usuario.
  if (user) {
    try {
      const { data, error } = await supabase.from('podcast_creation_jobs').select('id, created_at, job_title, status, error_message, micro_pod_id').eq('user_id', user.id).in('status', ['pending', 'processing']).eq('archived', false).order('created_at', { ascending: false });
      if (error) throw error;
      userCreationJobs = data || [];
    } catch (error) { 
      console.error("Error al obtener trabajos de creación:", error); 
      userCreationJobs = []; 
    }
    
    try {
      const { data, error } = await supabase.from('micro_pods').select(profileQuery).eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      userCreatedPodcasts = data || [];
    } catch (error) { 
      console.error("Error al obtener micro-podcasts del usuario:", error); 
      userCreatedPodcasts = []; 
    }
  }

  // Ahora que 'user' y 'searchParams' están en el ámbito correcto, esta lógica funciona.
  const currentTab = searchParams.tab;
  const defaultTab = currentTab === 'library' && user ? 'library' : 'discover';

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
      />
    </div>
  );
}