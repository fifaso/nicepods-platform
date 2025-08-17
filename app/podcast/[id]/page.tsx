// app/podcast/[id]/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PodcastView } from "@/components/podcast-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default async function PodcastDisplayPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Si no hay usuario, redirigimos al login, pidiendo que vuelva aquí después.
  if (!user) {
    redirect(`/login?redirect=/podcast/${params.id}`);
  }

  // Obtenemos los datos del podcast específico, incluyendo los datos del perfil del autor.
  const { data: podcastData, error } = await supabase
    .from("micro_pods")
    .select(`*, profiles (full_name, avatar_url)`)
    .eq('id', params.id)
    .single();

  // Manejamos el caso en que el podcast no se encuentre.
  if (error || !podcastData) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Podcast Not Found</AlertTitle>
          <AlertDescription>
            The podcast you are looking for does not exist or you do not have permission to view it.
            {error && <p className="mt-2 font-mono text-xs">{error.message}</p>}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // --- LÓGICA DE "LIKES" CORREGIDA ---
  // Hacemos una consulta para ver si existe una fila que coincida.
  const { data: likeData, error: likeError } = await supabase
    .from('podcast_likes')
    .select('id')
    .match({ podcast_id: params.id, user_id: user.id })
    .limit(1);

  // Si el array devuelto tiene al menos un elemento, significa que al usuario ya le gusta.
  const initialIsLiked = !!likeData && likeData.length > 0;

  if (likeError) {
    console.error("Error checking for like:", likeError.message);
  }

  // Pasamos los datos del podcast y el estado inicial de "like" al componente cliente.
  return (
    <PodcastView podcastData={podcastData} user={user} initialIsLiked={initialIsLiked} />
  );
}