// app/page.tsx
// VERSIÓN FINAL Y POTENCIADA: Integra el InsightPanel, FloatingActionButton y una UI/UX mejorada
// para las vistas de invitado y de usuario autenticado, con un diseño completamente responsivo.

import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PodcastWithProfile } from "@/types/podcast";
import { PodcastShelf } from "@/components/podcast-shelf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Search, Compass, Lightbulb, Bot } from "lucide-react";
import { QuadrantCard } from "@/components/ui/quadrant-card";
import { InsightPanel } from "@/components/insight-panel";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import type { Tables } from "@/types/supabase";

// Definimos los tipos para la seguridad de tipos de nuestros datos.
type ResonanceProfile = Tables<'user_resonance_profiles'>;
interface DiscoveryFeed {
  epicenter: PodcastWithProfile[] | null;
  semantic_connections: PodcastWithProfile[] | null;
  new_horizons: PodcastWithProfile[] | null;
}

// ===================================================================
// VISTA PARA USUARIO AUTENTICADO (POTENCIADA)
// ===================================================================
function UserDashboard({ user, feed, resonanceProfile }: { user: any; feed: DiscoveryFeed | null; resonanceProfile: ResonanceProfile | null }) {
  // Obtenemos el primer nombre del usuario para un saludo más personal.
  const userName = user.user_metadata?.full_name?.split(' ')[0] || user.email;

  return (
    <>
      <div className="container mx-auto max-w-7xl py-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8 xl:gap-12">
          
          {/* Columna Principal: Estanterías (ocupa todo el ancho en móvil) */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Hola, {userName}!
            </h1>
            <p className="text-lg text-muted-foreground mt-2">Tu centro de descubrimiento personalizado.</p>

            {/* TODO: Implementar el "Magic Slot" aquí en una futura iteración (ej. Continuar Escuchando) */}

            <div className="mt-8 space-y-12">
              <PodcastShelf title="Tu Epicentro Creativo" podcasts={feed?.epicenter || []} />
              <PodcastShelf title="Conexiones Inesperadas" podcasts={feed?.semantic_connections || []} />
              <PodcastShelf title="Nuevos Horizontes en NicePod" podcasts={feed?.new_horizons || []} />
            </div>
          </div>
          
          {/* [CAMBIO QUIRÚRGICO #1]: Columna Lateral para el Panel de Perspectivas (visible solo en pantallas grandes) */}
          <div className="hidden lg:block lg:col-span-1">
            <InsightPanel resonanceProfile={resonanceProfile} />
          </div>
        </div>
      </div>
      {/* [CAMBIO QUIRÚRGICO #2]: Botón de Acción Flotante para un acceso rápido a la creación en móviles. */}
      <FloatingActionButton />
    </>
  );
}

// ===================================================================
// VISTA PARA INVITADO (POTENCIADA)
// ===================================================================
function GuestLandingPage({ latestPodcasts }: { latestPodcasts: any[] | null }) {
  return (
    <div className="flex flex-col items-center">
      {/* Sección 1: Héroe */}
      <section className="w-full text-center py-20 md:py-32 flex flex-col items-center space-y-6 px-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary">
          Expande tu perspectiva diariamente
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Crea y descubre Micro-Podcasts que se adaptan a tu ritmo de vida. Aprende, comparte y potencia tu creatividad.
        </p>
        {/* [CAMBIO QUIRÚRGICO #3]: Doble llamado a la acción para guiar al usuario. */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-xs mx-auto">
          <Link href="/create" className="w-full">
            <Button size="lg" className="rounded-full w-full py-6 text-lg">
              <Mic className="mr-2 h-5 w-5" />
              Comienza a Crear
            </Button>
          </Link>
          <Link href="/podcasts" className="w-full">
             <Button size="lg" variant="outline" className="rounded-full w-full py-6 text-lg">
               <Compass className="mr-2 h-5 w-5" />
               Explorar Ideas
             </Button>
          </Link>
        </div>
      </section>
      
      {/* Sección 2: Encuentra tu Próxima Idea */}
      <section className="w-full max-w-4xl py-12 px-4 mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6">Encuentra tu Próxima Idea</h2>
        <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                type="text"
                placeholder="Buscar podcasts por tema o palabra clave..."
                className="w-full p-4 pl-12 rounded-full bg-muted/50 border-2 border-border/20 focus:ring-2 focus:ring-primary focus:outline-none"
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuadrantCard icon={<Compass className="h-6 w-6" />} title="Ideas Prácticas y Abstractas" description="Herramientas para la mente y el alma." href="/podcasts?view=compass" />
          <QuadrantCard icon={<Lightbulb className="h-6 w-6" />} title="Pensamiento Conceptual" description="Explora los 'porqués' del mundo." href="/podcasts?view=compass" />
          <QuadrantCard icon={<Bot className="h-6 w-6" />} title="Análisis y Tecnología" description="Descubre cómo funciona el futuro." href="/podcasts?view=compass" />
          <QuadrantCard icon={<Mic className="h-6 w-6" />} title="Narrativa e Historias" description="Conecta a través del storytelling." href="/podcasts?view=compass" />
        </div>
      </section>

      {/* [CAMBIO QUIRÚRGICO #4]: Sección 3 reestructurada con un grid para acomodar el InsightPanel en escritorio. */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 lg:gap-8 xl:gap-12 px-4 lg:px-0">
        <div className="lg:col-span-2">
          <PodcastShelf 
            title="Únete a la Conversación"
            podcasts={latestPodcasts as any[] || []}
          />
        </div>
        <div className="hidden lg:block lg:col-span-1">
          <InsightPanel resonanceProfile={null} />
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-8 mt-16 bg-muted/50 text-center text-sm text-muted-foreground">
        <div className="container px-4 md:px-6 mx-auto">
            <p>&copy; {new Date().getFullYear()} NicePod. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

// ===================================================================
// COMPONENTE PRINCIPAL (EL "ROUTER" LÓGICO POTENCIADO)
// ===================================================================
export default async function HomePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // [CAMBIO QUIRÚRGICO #5]: Si hay usuario, obtenemos AMBOS el feed y el perfil de resonancia en paralelo para máxima eficiencia.
    const [
      { data: feed, error: feedError },
      { data: resonanceProfile, error: profileError }
    ] = await Promise.all([
      supabase.rpc('get_user_discovery_feed', { p_user_id: user.id }),
      supabase.from('user_resonance_profiles').select('*').eq('user_id', user.id).single()
    ]);

    if (feedError) console.error("Error al obtener el feed de descubrimiento:", feedError);
    // Ignoramos el error 'PGRST116' que ocurre cuando un usuario nuevo aún no tiene perfil de resonancia.
    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Error al obtener el perfil de resonancia:", profileError);
    }

    return <UserDashboard user={user} feed={feed} resonanceProfile={resonanceProfile} />;
  } else {
    // Si no hay usuario, la lógica se mantiene igual.
    const { data: latestPodcasts, error } = await supabase
      .from('micro_pods')
      .select(`*, profiles (full_name, avatar_url, username)`)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(8);

    if (error) {
      console.error("Error al obtener los últimos podcasts para la página de inicio:", error.message);
    }
    
    return <GuestLandingPage latestPodcasts={latestPodcasts} />;
  }
}