// app/(platform)/dashboard/page.tsx
// VERSIÓN: 1.0 (Protected User Dashboard - Performance Optimized)

import { DiscoveryHub } from "@/components/discovery-hub";
import { MapPreviewFrame } from "@/components/geo/map-preview-frame";
import { InsightPanel } from "@/components/insight-panel";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { createClient } from "@/lib/supabase/server";
import { PodcastWithProfile } from "@/types/podcast";
import type { Tables } from "@/types/supabase";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

// Carga perezosa del estante para no bloquear el renderizado del servidor
const PodcastShelf = dynamic(
  () => import("@/components/podcast-shelf").then((mod) => mod.PodcastShelf),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-32 flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    )
  }
);

type ResonanceProfile = Tables<'user_resonance_profiles'>;

interface DiscoveryFeed {
  epicenter: PodcastWithProfile[] | null;
  semantic_connections: PodcastWithProfile[] | null;
  new_horizons: PodcastWithProfile[] | null;
}

/**
 * Sanitización de datos para asegurar consistencia en la UI.
 */
function sanitizePodcasts(podcasts: any[] | null): PodcastWithProfile[] {
  if (!podcasts || !Array.isArray(podcasts)) return [];
  return podcasts.map(pod => ({
    ...pod,
    creation_data: typeof pod.creation_data === 'string' ? JSON.parse(pod.creation_data) : pod.creation_data || null,
    ai_tags: Array.isArray(pod.ai_tags) ? pod.ai_tags : [],
    user_tags: Array.isArray(pod.user_tags) ? pod.user_tags : [],
    sources: Array.isArray(pod.sources) ? pod.sources : [],
  })).filter(p => p.id);
}

export default async function DashboardPage() {
  const supabase = createClient();

  // 1. Verificación de Seguridad de Nivel de Página
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Carga Paralela de Inteligencia y Perfil
  const [
    { data: feedData },
    { data: resonanceData },
    { data: profileData }
  ] = await Promise.all([
    supabase.rpc('get_user_discovery_feed', { p_user_id: user.id }),
    supabase.from('user_resonance_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('profiles').select('username, full_name').eq('id', user.id).single()
  ]);

  const feed = feedData as DiscoveryFeed;
  const resonanceProfile = resonanceData as ResonanceProfile;
  const userName = profileData?.full_name?.split(' ')[0] || "Explorador";

  const safeEpicenter = sanitizePodcasts(feed?.epicenter || []);
  const safeConnections = sanitizePodcasts(feed?.semantic_connections || []);

  return (
    <main className="container mx-auto max-w-screen-xl min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12 xl:gap-16">

        {/* COLUMNA PRINCIPAL (CONTENIDO) */}
        <div className="lg:col-span-3 pt-6 pb-20 px-4 lg:px-0">
          <div className="space-y-8 lg:space-y-12">

            {/* CABECERA DINÁMICA */}
            <header className="space-y-1">
              <h1 className="text-3xl lg:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">
                Hola, <span className="text-primary italic">{userName}</span>
              </h1>
              <p className="text-sm lg:text-lg font-medium text-muted-foreground">
                Tu centro de inteligencia y memoria urbana.
              </p>
            </header>

            {/* RADAR ESTRATÉGICO */}
            <section className="w-full lg:max-w-md">
              <DiscoveryHub showOnlySearch={true} userName={userName} />
            </section>

            {/* PORTAL MADRID RESONANCE */}
            <section className="relative z-10">
              <MapPreviewFrame />
            </section>

            {/* ESTANTES DE CONOCIMIENTO */}
            <section className="space-y-12 md:space-y-16">
              <PodcastShelf title="Tu Epicentro Creativo" podcasts={safeEpicenter} variant="compact" />
              <PodcastShelf title="Conexiones Inesperadas" podcasts={safeConnections} variant="compact" />
            </section>
          </div>
        </div>

        {/* COLUMNA LATERAL (INSIGHTS) */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[7rem]">
            <InsightPanel resonanceProfile={resonanceProfile} />
          </div>
        </div>
      </div>

      <FloatingActionButton />
    </main>
  );
}