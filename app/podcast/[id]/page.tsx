// app/podcasts/[id]/page.tsx

// ================== MODIFICACIÓN #1: SIMPLIFICACIÓN DE IMPORTACIONES ==================
// Ya no necesitamos importar 'createServerClient' directamente.
// La función 'createClient' que importaremos del nuevo archivo se encargará de todo.
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { PodcastView } from "@/components/podcast-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { PodcastWithProfile } from '@/types/podcast';
// Asumimos que crearás este archivo en el siguiente paso para centralizar la creación de clientes.
import { createClient } from '@/lib/supabase/server'; 
// ====================================================================================

type PodcastPageProps = {
  params: {
    id: string;
  };
};

export default async function PodcastDisplayPage({ params }: PodcastPageProps) {
  // ================== MODIFICACIÓN #2: LA ARQUITECTURA CORRECTA ==================
  // La mejor práctica es encapsular la lógica de creación del cliente en un archivo helper.
  // Aquí, simplemente llamamos a nuestra función 'createClient' que ya sabe cómo manejar las cookies.
  // Esto hace que nuestro componente de página sea mucho más limpio y mantenible.
  const supabase = createClient(cookies());
  // ==============================================================================

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?redirect=/podcasts/${params.id}`);
  }

  const { data: podcastData, error } = await supabase
    .from("micro_pods")
    .select(`*, profiles(full_name, avatar_url)`)
    .eq('id', params.id)
    .single<PodcastWithProfile>();

  if (error || !podcastData) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Podcast no encontrado</AlertTitle>
          <AlertDescription>
            El podcast que buscas no existe o no tienes permiso para verlo.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Asumimos que la tabla 'podcast_likes' existe.
  const { data: likeData } = await supabase
    .from('podcast_likes')
    .select('id')
    .match({ podcast_id: params.id, user_id: user.id });

  const initialIsLiked = (likeData?.length ?? 0) > 0;
  
  return (
    <PodcastView 
      podcastData={podcastData} 
      user={user} 
      initialIsLiked={initialIsLiked} 
    />
  );
}