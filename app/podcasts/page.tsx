// app/podcasts/page.tsx

import { createClient } from "@/lib/supabase/server";
// --- CORRECCIÓN: La ruta de importación ahora es correcta y explícita ---
import { PodcastLibraryClient } from "./podcast-library-client";
import { type PodcastWithProfile } from "@/components/podcast-card";

export default async function PodcastsLibraryPage() {
  const supabase = createClient();

  // Obtenemos todos los podcasts publicados, incluyendo la información del perfil del autor.
  const { data: podcasts, error } = await supabase
    .from('micro_pods')
    .select(`
      *,
      profiles (
        full_name,
        avatar_url
      )
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching podcasts for library:", error.message);
    // En un caso real, podrías devolver un componente de error aquí.
  }
  
  const totalPodcasts = podcasts?.length ?? 0;

  // Renderizamos el componente cliente, pasándole los datos obtenidos.
  return (
    <PodcastLibraryClient 
      podcasts={podcasts as PodcastWithProfile[] ?? []} 
      totalPodcasts={totalPodcasts} 
    />
  );
}