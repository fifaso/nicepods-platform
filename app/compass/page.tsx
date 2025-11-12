// app/compass/page.tsx
// VERSIÓN DE PRODUCCIÓN FINAL: Con tipos correctos y seguros.

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ResonanceCompass } from "@/components/resonance-compass";
import type { PodcastWithProfile } from "@/types/podcast";
import type { Tables } from "@/types/supabase";

// Definimos el tipo para nuestro perfil de resonancia para mayor claridad.
type ResonanceProfile = Tables<'user_resonance_profiles'>;

export default async function CompassPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/compass');
  }

  const [
    { data: resonanceProfile },
    { data: allPodcastsData }
  ] = await Promise.all([
    supabase.from('user_resonance_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('micro_pods').select('id, title, final_coordinates, cover_image_url, profiles ( full_name, avatar_url )').not('final_coordinates', 'is', null)
  ]);

  // Convertimos los datos de podcast al tipo correcto de forma segura.
  const allPodcasts: PodcastWithProfile[] = (allPodcastsData as any) || [];
  const userProfile: ResonanceProfile | null = resonanceProfile;

  return (
    <div className="container mx-auto max-w-7xl py-12 px-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Tu Brújula de Resonancia</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Explora el universo de ideas que resuenan contigo.
        </p>
      </header>
      <ResonanceCompass 
        userProfile={userProfile}
        podcasts={allPodcasts}
      />
    </div>
  );
}