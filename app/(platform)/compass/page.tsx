/**
 * ARCHIVO: app/(platform)/compass/page.tsx
 * VERSIÓN: 11.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 * 
 * Misión: Orquestador de servidor para la visualización geo-semántica de la Malla.
 * [REFORMA V11.0]: Sincronización axial completa con el contrato purificado V7.0.
 * Eliminación de fugas snake_case y alineación absoluta con la Doctrina ZAP.
 *
 * Nivel de Integridad: 100% (Soberanía Nominal V7.0)
 */

import { ResonanceCompass } from "@/components/feed/resonance-compass";
import { createClient } from "@/lib/supabase/server";
import type { PodcastWithProfile } from "@/types/podcast";
import type { Tables } from "@/types/database.types";
import { redirect } from "next/navigation";
import { mapDatabasePodcastToSovereignPodcast } from "@/lib/podcast-utils";

type UserResonanceProfile = Tables<'user_resonance_profiles'>;

export default async function CompassPage() {
  const supabaseClient = createClient();

  const { 
    data: { user: authenticatedUser }, 
    error: authenticationError 
  } = await supabaseClient.auth.getUser();

  if (authenticationError || !authenticatedUser) {
    redirect('/login?redirect=/compass');
  }

  const userIdentification = authenticatedUser.id;

  const [
    resonanceProfileResponse,
    publishedPodcastsResponse
  ] = await Promise.all([
    supabaseClient
      .from('user_resonance_profiles')
      .select('*')
      .eq('user_id', userIdentification)
      .maybeSingle(),
    supabaseClient
      .from('micro_pods')
      .select('*, profiles(*)')
      .not('status', 'eq', 'failed')
      .eq('status', 'published')
      .limit(100)
  ]);

  if (publishedPodcastsResponse.error) {
    console.error(
        "🔥 [Compass-SSR-Fatal] Error al recuperar la colección de crónicas:", 
        publishedPodcastsResponse.error.message
    );
  }

  const podcastCollection: PodcastWithProfile[] = (publishedPodcastsResponse.data || [])
    .map((podcastRow: any) => mapDatabasePodcastToSovereignPodcast(podcastRow));

  const userResonanceProfile: UserResonanceProfile | null = resonanceProfileResponse.data || null;

  const uniqueSemanticTags: string[] = Array.from(
    new Set(
        podcastCollection.flatMap((podcastItem) => podcastItem.artificialIntelligenceTagsCollection || [])
    )
  ).filter((tagLabel) => tagLabel && tagLabel.length > 0);

  return (
    <div className="container mx-auto max-w-7xl py-12 px-4 animate-in fade-in duration-1000 selection:bg-primary/30">
      
      <header className="text-center mb-12 space-y-3">
        <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-white uppercase italic font-serif">
          Brújula de <span className="text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]">Resonancia</span>
        </h1>
        <p className="max-w-2xl mx-auto text-base md:text-xl text-zinc-500 font-medium leading-relaxed uppercase tracking-tight">
          Explora la capa invisible de Madrid a través de las historias que resuenan en tu frecuencia.
        </p>
      </header>

      <section className="relative w-full aspect-video md:h-[650px] rounded-[3.5rem] overflow-hidden border border-white/5 bg-zinc-950/50 backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.8)] isolate">
        <ResonanceCompass
          userResonanceProfile={userResonanceProfile}
          podcastCollection={podcastCollection}
          semanticTags={uniqueSemanticTags}
        />
      </section>

      <footer className="mt-12 text-center opacity-20 hover:opacity-100 transition-opacity duration-1000">
        <p className="text-[9px] font-black uppercase tracking-[1em] text-white">
          NicePod Spatial Intelligence Terminal
        </p>
        <p className="text-[7px] font-bold uppercase tracking-[0.4em] text-zinc-500 mt-2">
          Protocolo Madrid Resonance V7.0 • Brain-Metal Link Active
        </p>
      </footer>
    </div>
  );
}
