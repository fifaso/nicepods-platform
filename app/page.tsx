// app/page.tsx
// VERSIÓN: 2.1 (Fix: Guest Access Resilience & Error 500 Prevention)

import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PodcastWithProfile } from "@/types/podcast";
import { PodcastShelf } from "@/components/podcast-shelf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Search, Compass, Lightbulb, Bot, Library, User } from "lucide-react";
import { QuadrantCard } from "@/components/ui/quadrant-card";
import { InsightPanel } from "@/components/insight-panel";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { DiscoveryHub } from "@/components/discovery-hub";
import type { Tables } from "@/types/supabase";

type ResonanceProfile = Tables<'user_resonance_profiles'>;
interface DiscoveryFeed {
  epicenter: PodcastWithProfile[] | null;
  semantic_connections: PodcastWithProfile[] | null;
  new_horizons: PodcastWithProfile[] | null;
}

// ===================================================================
// VISTA PARA USUARIO AUTENTICADO
// ===================================================================
function UserDashboard({ user, feed, profile }: { user: any; feed: DiscoveryFeed | null; profile: any }) {
  const userName = user.user_metadata?.full_name?.split(' ')[0] || user.email;

  return (
    <>
      <div className="px-4 lg:px-0">
        <div className="lg:hidden mb-6"> 
            <h1 className="text-3xl font-bold tracking-tight mb-4">Hola, {userName}!</h1>
            <div className="grid grid-cols-2 gap-4">
                <Link href="/podcasts?tab=discover">
                    <Button variant="outline" className="w-full h-16 text-base bg-card/50">
                        <Library className="mr-2 h-5 w-5" /> Explorar
                    </Button>
                </Link>
                <Link href={`/podcasts?tab=library&view=list`}>
                    <Button variant="outline" className="w-full h-16 text-base bg-card/50">
                        <User className="mr-2 h-5 w-5" /> Mis Creaciones
                    </Button>
                </Link>
            </div>
        </div>
        
        <div className="hidden lg:block">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Hola, {userName}!
            </h1>
            <p className="text-lg text-muted-foreground mt-2">Tu centro de descubrimiento personalizado.</p>
        </div>

        <DiscoveryHub />

        <div className="mt-8 space-y-12">
          <PodcastShelf title="Tu Epicentro Creativo" podcasts={feed?.epicenter || []} variant="compact" />
          <PodcastShelf title="Conexiones Inesperadas" podcasts={feed?.semantic_connections || []} variant="compact" />
          <PodcastShelf title="Nuevos Horizontes en NicePod" podcasts={feed?.new_horizons || []} variant="compact" />
        </div>
      </div>
      <FloatingActionButton />
    </>
  );
}

// ===================================================================
// VISTA PARA INVITADO (SIN LOGIN)
// ===================================================================
function GuestLandingPage({ latestPodcasts }: { latestPodcasts: any[] }) {
  return (
    <div className="flex flex-col items-center">
      <section className="w-full text-center py-16 md:py-20 flex flex-col items-center space-y-4 px-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary">
          Expande tu perspectiva
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Crea, aprende, comparte y potencia tu creatividad.
        </p>
      </section>
      
      <section className="w-full max-w-4xl py-6 px-4 mx-auto">
        <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input type="text" placeholder="Buscar podcasts por tema o palabra clave..." className="w-full p-4 pl-12 rounded-full bg-muted/50 border-2 border-border/20 focus:ring-2 focus:ring-primary focus:outline-none" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuadrantCard icon={<Compass className="h-6 w-6" />} title="Ideas Prácticas y Abstractas" description="Herramientas para la mente y el alma." href="/podcasts?view=compass" />
          <QuadrantCard icon={<Lightbulb className="h-6 w-6" />} title="Pensamiento Conceptual" description="Explora los 'porqués' del mundo." href="/podcasts?view=compass" />
          <QuadrantCard icon={<Bot className="h-6 w-6" />} title="Análisis y Tecnología" description="Descubre cómo funciona el futuro." href="/podcasts?view=compass" />
          <QuadrantCard icon={<Mic className="h-6 w-6" />} title="Narrativa e Historias" description="Conecta a través del storytelling." href="/podcasts?view=compass" />
        </div>
      </section>

      <div className="w-full max-w-7xl mx-auto px-4 lg:px-0 mt-8">
        <PodcastShelf 
          title="Las últimas creaciones de la comunidad"
          podcasts={latestPodcasts || []} // Protección contra null
        />
      </div>

      <footer className="w-full py-8 mt-16 bg-muted/50 text-center text-sm text-muted-foreground lg:hidden">
        <div className="container px-4 md:px-6 mx-auto">
            <p>&copy; {new Date().getFullYear()} NicePod. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

// ===================================================================
// COMPONENTE PRINCIPAL (EL "ROUTER" LÓGICO)
// ===================================================================
export default async function HomePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  let feed: DiscoveryFeed | null = null;
  let resonanceProfile: ResonanceProfile | null = null;
  let latestPodcasts: any[] = []; // Inicializado como array vacío por seguridad
  let userProfile: any = null;

  if (user) {
    try {
        const [
          { data: feedData, error: feedError },
          { data: profileData, error: resonanceError },
          { data: userProfileData, error: profileError }
        ] = await Promise.all([
          supabase.rpc('get_user_discovery_feed', { p_user_id: user.id }),
          supabase.from('user_resonance_profiles').select('*').eq('user_id', user.id).single(),
          supabase.from('profiles').select('username').eq('id', user.id).single()
        ]);
        
        if (feedError) console.error("Error al obtener feed:", feedError);
        feed = feedData;
        resonanceProfile = profileData;
        userProfile = userProfileData;
    } catch (e) {
        console.error("Error crítico en carga de usuario:", e);
    }
  } else {
    // [MODIFICACIÓN CRÍTICA]: Manejo de error para invitados (RLS Protection)
    try {
        const { data, error } = await supabase
          .from('micro_pods')
          .select(`*, profiles (full_name, avatar_url, username)`)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(8);
        
        if (error) {
            console.error("Error cargando podcasts públicos (Probable RLS):", error.message);
            latestPodcasts = []; // Fallback seguro
        } else {
            latestPodcasts = data || [];
        }
    } catch (e) {
        console.error("Excepción en carga pública:", e);
        latestPodcasts = [];
    }
  }

  return (
    <main className="container mx-auto max-w-screen-xl flex-grow">
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8 xl:gap-12 h-full">
        {/* Columna de Contenido */}
        <div className="lg:col-span-3 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto lg:overflow-x-hidden lg:pr-6 
                       scrollbar-thin scrollbar-thumb-gray-600/50 hover:scrollbar-thumb-gray-500/50 
                       scrollbar-track-transparent scrollbar-thumb-rounded-full">
          <div className="pt-6 pb-12 lg:pt-12">
            {user ? (
              <UserDashboard user={user} feed={feed} profile={userProfile} />
            ) : (
              <GuestLandingPage latestPodcasts={latestPodcasts} />
            )}
          </div>
        </div>
        
        {/* Columna del Panel (Sticky) */}
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