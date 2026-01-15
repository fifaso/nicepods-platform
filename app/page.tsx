// app/page.tsx
// VERSIÓN: 8.1 (Production Ready - SSR Signature Fix & Logic Integrity)

import { DiscoveryHub } from "@/components/discovery-hub";
import { InsightPanel } from "@/components/insight-panel";
import { PlatformInfoDialog } from "@/components/platform-info-dialog";
import { Button } from "@/components/ui/button";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { createClient } from "@/lib/supabase/server";
import { PodcastWithProfile } from "@/types/podcast";
import type { Tables } from "@/types/supabase";
import { Library, Loader2, User } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

/**
 * CARGA DINÁMICA DE COMPONENTES PESADOS
 * Evita bloqueos en el hilo principal y errores de hidratación.
 */
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
 * SANITIZACIÓN DE DATOS
 * Normaliza los campos de Supabase para asegurar compatibilidad con la UI.
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

// --- SUB-COMPONENTES DE VISTA ---

function UserDashboard({ user, feed, profile }: { user: any; feed: DiscoveryFeed | null; profile: any }) {
  const userName = profile?.full_name?.split(' ')[0] || user.user_metadata?.full_name?.split(' ')[0] || "Creador";

  const safeEpicenter = sanitizePodcasts(feed?.epicenter || []);
  const safeConnections = sanitizePodcasts(feed?.semantic_connections || []);
  const safeHorizons = sanitizePodcasts(feed?.new_horizons || []);

  return (
    <>
      <div className="px-4 lg:px-0 pb-24">
        {/* CABECERA MÓVIL */}
        <div className="lg:hidden mb-5 mt-2">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Hola, <span className="text-primary">{userName}</span>
            </h1>
            <PlatformInfoDialog />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/podcasts?tab=discover" className="w-full">
              <Button variant="secondary" className="w-full h-10 text-xs font-semibold bg-secondary/50 border border-border/50 hover:bg-secondary transition-all">
                <Library className="mr-2 h-3.5 w-3.5" /> Explorar
              </Button>
            </Link>
            <Link href={`/podcasts?tab=library&view=list`} className="w-full">
              <Button variant="secondary" className="w-full h-10 text-xs font-semibold bg-secondary/50 border border-border/50 hover:bg-secondary transition-all">
                <User className="mr-2 h-3.5 w-3.5" /> Mis Creaciones
              </Button>
            </Link>
          </div>
        </div>

        {/* CABECERA DESKTOP */}
        <div className="hidden lg:block mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Hola, {userName}!
          </h1>
          <p className="text-lg text-muted-foreground mt-2">Tu centro de descubrimiento personalizado.</p>
        </div>

        <DiscoveryHub />

        <div className="mt-6 md:mt-10 space-y-8 md:space-y-12">
          <PodcastShelf title="Tu Epicentro Creativo" podcasts={safeEpicenter} variant="compact" />
          <PodcastShelf title="Conexiones Inesperadas" podcasts={safeConnections} variant="compact" />
          <PodcastShelf title="Nuevos Horizontes" podcasts={safeHorizons} variant="compact" />
        </div>
      </div>

      <FloatingActionButton />
    </>
  );
}

function GuestLandingPage({ latestPodcasts }: { latestPodcasts: any[] }) {
  const safeLatest = sanitizePodcasts(latestPodcasts);

  return (
    <div className="flex flex-col items-center pb-20 w-full">
      <section className="w-full text-center pt-12 pb-6 flex flex-col items-center space-y-3 px-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight drop-shadow-xl">
          Expande tu perspectiva
        </h1>
        <p className="max-w-xl text-base md:text-xl text-muted-foreground/80 leading-relaxed px-2">
          Crea, aprende y comparte conocimiento en audio.
        </p>
      </section>

      <section className="w-full max-w-5xl px-0 md:px-4 mx-auto -mt-4 relative z-10">
        <DiscoveryHub />
      </section>

      <div className="w-full max-w-7xl mx-auto px-4 lg:px-0 mt-8 pt-8 border-t border-white/5">
        <PodcastShelf
          title="Últimas creaciones de la comunidad"
          podcasts={safeLatest}
        />
      </div>

      <footer className="w-full py-8 mt-4 text-center text-xs text-muted-foreground lg:hidden">
        <p>&copy; {new Date().getFullYear()} NicePod.</p>
      </footer>
    </div>
  );
}

// --- PÁGINA PRINCIPAL ---

export default async function HomePage() {
  /**
   * [RESOLUCIÓN DEL ERROR]: 
   * createClient ya no recibe argumentos. Obtiene las cookies internamente.
   */
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

      if (profileError) throw new Error("Error crítico cargando perfil: " + profileError.message);

      feed = feedData;
      resonanceProfile = profileData;
      userProfile = userProfileData;

    } catch (e) {
      console.error("Error cargando dashboard de usuario:", e);
      user = null;
    }
  }

  if (!user) {
    try {
      const { data } = await supabase
        .from('micro_pods')
        .select(`*, profiles (full_name, avatar_url, username)`)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(8);

      latestPodcasts = data || [];
    } catch (e) {
      console.error("Error cargando landing:", e);
    }
  }

  return (
    <main className="container mx-auto max-w-screen-xl flex-grow">
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8 xl:gap-12 h-full">

        {/* COLUMNA CENTRAL */}
        <div className="lg:col-span-3 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto lg:overflow-x-hidden lg:pr-6 scrollbar-thin scrollbar-thumb-gray-600/50 hover:scrollbar-thumb-gray-500/50 scrollbar-track-transparent scrollbar-thumb-rounded-full">
          <div className="pt-4 pb-12 lg:pt-12">
            {user && userProfile ? (
              <UserDashboard user={user} feed={feed} profile={userProfile} />
            ) : (
              <GuestLandingPage latestPodcasts={latestPodcasts} />
            )}
          </div>
        </div>

        {/* COLUMNA LATERAL */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[6rem] h-[calc(100vh-7.5rem)]">
            <div className="py-12 h-full">
              <InsightPanel resonanceProfile={resonanceProfile} />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}