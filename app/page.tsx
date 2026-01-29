// app/page.tsx
// VERSIÓN: 10.0 (Madrid Resonance Final Integration - Full Logic & Style Sync)

import { DiscoveryHub } from "@/components/discovery-hub";
import { MapPreviewFrame } from "@/components/geo/map-preview-frame";
import { InsightPanel } from "@/components/insight-panel";
import { PlatformInfoDialog } from "@/components/platform-info-dialog";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { createClient } from "@/lib/supabase/server";
import { PodcastWithProfile } from "@/types/podcast";
import type { Tables } from "@/types/supabase";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

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

// --- VISTA PARA USUARIOS REGISTRADOS ---

function UserDashboard({ user, feed, profile }: { user: any; feed: DiscoveryFeed | null; profile: any }) {
  const userName = profile?.full_name?.split(' ')[0] || user.user_metadata?.full_name?.split(' ')[0] || "Creador";

  const safeEpicenter = sanitizePodcasts(feed?.epicenter || []);
  const safeConnections = sanitizePodcasts(feed?.semantic_connections || []);

  return (
    <div className="px-0 lg:px-0 pb-24 space-y-8 lg:space-y-12">

      {/* 1. SECCIÓN SUPERIOR: CABECERA Y BÚSQUEDA */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-4 lg:px-0">
        <div className="space-y-1">
          <div className="flex items-center justify-between lg:justify-start lg:gap-4">
            <h1 className="text-3xl lg:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white leading-none">
              Hola, <span className="text-primary italic">{userName}</span>
            </h1>
            <div className="lg:hidden">
              <PlatformInfoDialog />
            </div>
          </div>
          <p className="text-xs lg:text-lg font-bold text-muted-foreground uppercase lg:normal-case tracking-widest lg:tracking-normal">
            Tu centro de descubrimiento personalizado
          </p>
        </div>

        {/* BUSCADOR INTEGRADO (Desktop y Mobile Variant) */}
        <div className="w-full lg:max-w-md">
          <DiscoveryHub showOnlySearch={true} mobileVariant={true} userName={userName} />
        </div>
      </section>

      {/* 2. SECCIÓN DESTACADA: EL MINI-PORTAL 3D */}
      <section className="px-4 lg:px-0 relative z-10">
        <MapPreviewFrame />
      </section>

      {/* 3. CONTENIDO: CATEGORÍAS (CARRUSEL) */}
      <section className="mt-4 lg:mt-8">
        <div className="px-4 lg:px-0 mb-6 lg:mb-10">
          <DiscoveryHub showOnlyCategories={true} />
        </div>

        {/* 4. ESTANTES DE CONTENIDO (Mantenemos ubicación inicial) */}
        <div className="space-y-12 md:space-y-16">
          <PodcastShelf title="Tu Epicentro Creativo" podcasts={safeEpicenter} variant="compact" />
          <PodcastShelf title="Conexiones Inesperadas" podcasts={safeConnections} variant="compact" />
        </div>
      </section>

      <FloatingActionButton />
    </div>
  );
}

// --- VISTA PARA INVITADOS ---

function GuestLandingPage({ latestPodcasts }: { latestPodcasts: any[] }) {
  const safeLatest = sanitizePodcasts(latestPodcasts);

  return (
    <div className="flex flex-col items-center pb-20 w-full space-y-12">
      <section className="w-full text-center pt-12 pb-6 px-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-white leading-none drop-shadow-2xl uppercase italic">
          Expande tu <span className="text-primary">perspectiva</span>
        </h1>
        <p className="max-w-xl text-base md:text-xl text-muted-foreground/80 leading-relaxed mx-auto mt-4 font-medium">
          Crea, aprende y comparte conocimiento geolocalizado en audio.
        </p>
      </section>

      <section className="w-full max-w-4xl px-4 mx-auto relative z-10">
        <MapPreviewFrame />
      </section>

      <div className="w-full px-4 lg:px-0">
        <DiscoveryHub showOnlyCategories={true} />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 lg:px-0 mt-8 pt-10 border-t border-white/5">
        <PodcastShelf title="Últimas creaciones de la comunidad" podcasts={safeLatest} />
      </div>
    </div>
  );
}

// --- PÁGINA PRINCIPAL (ORQUESTADOR) ---

export default async function HomePage() {
  const supabase = createClient();
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  } catch (e) { }

  let feed: DiscoveryFeed | null = null;
  let resonanceProfile: ResonanceProfile | null = null;
  let latestPodcasts: any[] = [];
  let userProfile: any = null;

  if (user) {
    try {
      const [
        { data: feedData },
        { data: profileData },
        { data: userProfileData, error: profileError }
      ] = await Promise.all([
        supabase.rpc('get_user_discovery_feed', { p_user_id: user.id }),
        supabase.from('user_resonance_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('profiles').select('username, full_name').eq('id', user.id).single()
      ]);

      if (profileError) throw new Error(profileError.message);
      feed = feedData;
      resonanceProfile = profileData;
      userProfile = userProfileData;

    } catch (e) {
      console.error("Error cargando dashboard:", e);
      user = null;
    }
  }

  if (!user) {
    try {
      const { data } = await supabase.from('micro_pods').select(`*, profiles (*)`).eq('status', 'published').order('created_at', { ascending: false }).limit(8);
      latestPodcasts = data || [];
    } catch (e) { console.error("Error loading guest page:", e); }
  }

  return (
    <main className="container mx-auto max-w-screen-xl flex-grow min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12 xl:gap-16 h-full">

        <div className="lg:col-span-3 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto lg:overflow-x-hidden lg:pr-8 custom-scrollbar-hide">
          <div className="pt-6 pb-20">
            {user && userProfile ? (
              <UserDashboard user={user} feed={feed} profile={userProfile} />
            ) : (
              <GuestLandingPage latestPodcasts={latestPodcasts} />
            )}
          </div>
        </div>

        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[7rem] h-[calc(100vh-9rem)]">
            <InsightPanel resonanceProfile={resonanceProfile} />
          </div>
        </div>

      </div>
    </main>
  );
}