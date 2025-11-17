// app/page.tsx
// VERSIÓN FINAL CON LAYOUT ESTRUCTURAL 3/4 + 1/4 Y PANEL STICKY ALINEADO

import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PodcastWithProfile } from "@/types/podcast";
import { PodcastShelf } from "@/components/podcast-shelf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Search, Compass, Lightbulb, Bot, Play } from "lucide-react";
import { QuadrantCard } from "@/components/ui/quadrant-card";
import { InsightPanel } from "@/components/insight-panel";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import type { Tables } from "@/types/supabase";

// Definimos los tipos para la seguridad de tipos.
type ResonanceProfile = Tables<'user_resonance_profiles'>;
interface DiscoveryFeed {
  epicenter: PodcastWithProfile[] | null;
  semantic_connections: PodcastWithProfile[] | null;
  new_horizons: PodcastWithProfile[] | null;
}

// ===================================================================
// VISTA PARA USUARIO AUTENTICADO
// ===================================================================
function UserDashboard({ user, feed }: { user: any; feed: DiscoveryFeed | null }) {
  const userName = user.user_metadata?.full_name?.split(' ')[0] || user.email;

  return (
    <>
      <div className="px-4 lg:px-0">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Hola, {userName}!
        </h1>
        <p className="text-lg text-muted-foreground mt-2">Tu centro de descubrimiento personalizado.</p>
        <div className="mt-8 space-y-12">
          <PodcastShelf title="Tu Epicentro Creativo" podcasts={feed?.epicenter || []} />
          <PodcastShelf title="Conexiones Inesperadas" podcasts={feed?.semantic_connections || []} />
          <PodcastShelf title="Nuevos Horizontes en NicePod" podcasts={feed?.new_horizons || []} />
        </div>
      </div>
      <FloatingActionButton />
    </>
  );
}

// ===================================================================
// VISTA PARA INVITADO
// ===================================================================
function GuestLandingPage({ latestPodcasts }: { latestPodcasts: any[] | null }) {
  return (
    <div className="flex flex-col items-center">
      {/* Sección 1: Héroe */}
      <section className="w-full text-center py-20 md:py-24 flex flex-col items-center space-y-6 px-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary">
          Expande tu perspectiva diariamente
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Crea y descubre Micro-Podcasts que se adaptan a tu ritmo de vida. Aprende, comparte y potencia tu creatividad.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-xs mx-auto">
          <Link href="/create" className="w-full">
            <Button size="lg" className="rounded-full w-full py-6 text-lg">
              <Mic className="mr-2 h-5 w-5" /> Comienza a Crear
            </Button>
          </Link>
          <Link href="/podcasts" className="w-full">
             <Button size="lg" variant="outline" className="rounded-full w-full py-6 text-lg">
               <Compass className="mr-2 h-5 w-5" /> Explorar Ideas
             </Button>
          </Link>
        </div>
      </section>
      
      {/* Sección 2: Encuentra tu Próxima Idea */}
      <section className="w-full max-w-4xl py-12 px-4 mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6">Encuentra tu Próxima Idea</h2>
        <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input type="text" placeholder="Buscar podcasts..." className="w-full p-4 pl-12 rounded-full bg-muted/50 border-2 border-border/20 focus:ring-2 focus:ring-primary focus:outline-none" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuadrantCard icon={<Compass className="h-6 w-6" />} title="Ideas Prácticas y Abstractas" description="Herramientas para la mente y el alma." href="/podcasts?view=compass" />
          <QuadrantCard icon={<Lightbulb className="h-6 w-6" />} title="Pensamiento Conceptual" description="Explora los 'porqués' del mundo." href="/podcasts?view=compass" />
          <QuadrantCard icon={<Bot className="h-6 w-6" />} title="Análisis y Tecnología" description="Descubre cómo funciona el futuro." href="/podcasts?view=compass" />
          <QuadrantCard icon={<Mic className="h-6 w-6" />} title="Narrativa e Historias" description="Conecta a través del storytelling." href="/podcasts?view=compass" />
        </div>
      </section>

      {/* Sección 3: Únete a la Conversación */}
      <div className="w-full max-w-7xl mx-auto px-4 lg:px-0">
        <PodcastShelf title="Únete a la Conversación" podcasts={latestPodcasts as any[] || []} />
      </div>

      {/* Footer (solo visible en móvil en este layout) */}
      <footer className="w-full py-8 mt-16 bg-muted/50 text-center text-sm text-muted-foreground lg:hidden">
        <div className="container px-4 md:px-6 mx-auto">
            <p>&copy; {new Date().getFullYear()} NicePod. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

// ===================================================================
// COMPONENTE PRINCIPAL (EL "ROUTER" LÓGICO CON EL NUEVO LAYOUT)
// ===================================================================
export default async function HomePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  // Obtenemos los datos necesarios de forma condicional ANTES de renderizar el layout.
  let feed: DiscoveryFeed | null = null;
  let resonanceProfile: ResonanceProfile | null = null;
  let latestPodcasts: any[] | null = null;

  if (user) {
    const [{ data: feedData }, { data: profileData }] = await Promise.all([
      supabase.rpc('get_user_discovery_feed', { p_user_id: user.id }),
      supabase.from('user_resonance_profiles').select('*').eq('user_id', user.id).single()
    ]);
    feed = feedData;
    resonanceProfile = profileData;
  } else {
    const { data } = await supabase
      .from('micro_pods')
      .select(`*, profiles (full_name, avatar_url, username)`)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(8);
    latestPodcasts = data;
  }

  return (
    // [CAMBIO ESTRUCTURAL #1]: El <main> ahora define el contenedor de ancho máximo y el layout de grid.
    // 'max-w-screen-xl' asegura que el ancho coincida con el de la barra de navegación para una alineación perfecta.
    <main className="container mx-auto max-w-screen-xl flex-grow">
      {/* [CAMBIO ESTRUCTURAL #2]: Se cambia el grid a 4 columnas. */}
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8 xl:gap-12 h-full">
        
        {/* === COLUMNA DE CONTENIDO (3/4) - SCROLLABLE === */}
        {/* [CAMBIO ESTRUCTURAL #3]: Esta columna ahora ocupa 3 de 4 partes del grid. */}
        <div className="lg:col-span-3 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-6 
                       scrollbar-thin scrollbar-thumb-gray-600/50 hover:scrollbar-thumb-gray-500/50 
                       scrollbar-track-transparent scrollbar-thumb-rounded-full">
          <div className="py-12">
            {user ? (
              <UserDashboard user={user} feed={feed} />
            ) : (
              <GuestLandingPage latestPodcasts={latestPodcasts} />
            )}
          </div>
        </div>
        
        {/* === COLUMNA DEL PANEL (1/4) - STICKY === */}
        {/* [CAMBIO ESTRUCTURAL #4]: Esta columna ahora ocupa 1 de 4 partes. */}
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