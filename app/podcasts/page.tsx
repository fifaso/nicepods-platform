// app/podcasts/page.tsx
// VERSIÓN FINAL CON CARGA DE DATOS COMPLETA

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { PodcastWithProfile } from '@/types/podcast';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { LibraryTabs } from './library-tabs';

type UserCreatedPodcast = {
  id: number;
  created_at: string;
  title: string;
  description: string | null;
  status: string;
  audio_url: string | null;
  duration_seconds: number | null; // Se añade el tipo
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
      // ================== INTERVENCIÓN QUIRÚRGICA ==================
      // Se añade `duration_seconds` a la lista de columnas solicitadas.
      const { data, error } = await supabase.from('micro_pods').select('id, created_at, title, description, status, audio_url, duration_seconds').eq('user_id', user.id).order('created_at', { ascending: false });
      // =============================================================
      if (error) throw error;
      userCreatedPodcasts = data || [];
    } catch (error) { console.error("Error al obtener micro-podcasts del usuario:", error); userCreatedPodcasts = []; }
  }

  const currentTab = searchParams.tab;
  const defaultTab = currentTab === 'library' && user ? 'library' : 'discover';

  return (
    <div className="container mx-auto max-w-7xl py-12 md:py-16 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Centro de Descubrimiento</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Descubre conocimiento en experiencias de audio concisas.
        </p>
        <div className="mt-6 max-w-2xl mx-auto relative">
          <Input placeholder="Buscar podcasts, temas o creadores..." className="pr-10" />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
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