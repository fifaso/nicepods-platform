// app/page.tsx
// VERSIÓN FINAL Y DINÁMICA: Muestra el dashboard personalizado para usuarios autenticados
// y la página de aterrizaje para invitados, con un diseño completamente responsivo.

import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PodcastWithProfile } from "@/types/podcast";
import { PodcastShelf } from "@/components/podcast-shelf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PodcastCard } from "@/components/podcast-card";
import { Mic, Play, Search, Compass, Lightbulb, Bot } from "lucide-react";
import { QuadrantCard } from "@/components/ui/quadrant-card"; // Asumiendo que este componente fue creado como se planeó.

// Definimos la estructura de la respuesta de nuestro Oráculo para seguridad de tipos.
interface DiscoveryFeed {
  epicenter: PodcastWithProfile[] | null;
  semantic_connections: PodcastWithProfile[] | null;
  new_horizons: PodcastWithProfile[] | null;
}

// Componente para la vista del Dashboard del Usuario Autenticado
function UserDashboard({ user, feed }: { user: any; feed: DiscoveryFeed | null }) {
  return (
    <div className="container mx-auto max-w-7xl py-12 px-4">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
        Hola, {user.user_metadata?.full_name?.split(' ')[0] || user.email}!
      </h1>
      <p className="text-lg text-muted-foreground mt-2">Tu centro de descubrimiento personalizado.</p>

      <div className="mt-8 space-y-12">
        <PodcastShelf title="Tu Epicentro Creativo" podcasts={feed?.epicenter || []} />
        <PodcastShelf title="Conexiones Inesperadas" podcasts={feed?.semantic_connections || []} />
        <PodcastShelf title="Nuevos Horizontes en NicePod" podcasts={feed?.new_horizons || []} />
      </div>
    </div>
  );
}

// Componente para la vista de la Página de Aterrizaje del Invitado
function GuestLandingPage({ latestPodcasts }: { latestPodcasts: any[] | null }) {
  const sampleFeaturesPodcasts = [
    { id: "1", title: "La Ciencia de Crear Hábitos", description: "Descubre los secretos para construir hábitos duraderos.", category: "Psicología", duration: "5:23", color: "from-purple-500 to-pink-500" },
    { id: "2", title: "Mindfulness en la Era Digital", description: "Aprende a mantenerte presente y enfocado.", category: "Bienestar", duration: "4:15", color: "from-blue-500 to-cyan-500" },
    { id: "3", title: "El Poder de la Filosofía Estoica", description: "Sabiduría milenaria para los desafíos modernos.", category: "Filosofía", duration: "6:42", color: "from-indigo-500 to-purple-500" },
    { id: "4", title: "Entendiendo Sesgos Cognitivos", description: "Explora los atajos mentales que nos influencian.", category: "Psicología", duration: "5:18", color: "from-pink-500 to-rose-500" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sección 1: Héroe */}
      <section className="w-full text-center py-20 md:py-32 flex flex-col items-center space-y-6 px-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary">
          Expande tu perspectiva diariamente
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Crea y descubre Micro-Podcasts que se adaptan a tu ritmo de vida. Aprende, comparte y potencia tu creatividad.
        </p>
        <Link href="/create">
          <Button size="lg" className="rounded-full px-8 py-6 text-lg">
            <Mic className="mr-2 h-5 w-5" />
            Comienza a Crear
          </Button>
        </Link>
      </section>
      
      {/* Sección 2: Encuentra tu Próxima Idea */}
      <section className="w-full max-w-4xl py-12 px-4 mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6">Encuentra tu Próxima Idea</h2>
        <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
                type="text"
                placeholder="Buscar podcasts..."
                className="w-full p-3 pl-10 rounded-full bg-muted/50 border border-border/20 focus:ring-2 focus:ring-primary focus:outline-none"
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuadrantCard 
            icon={<Compass className="h-6 w-6" />}
            title="Ideas Prácticas y Abstractas"
            description="Herramientas para la mente y el alma."
            href="/podcasts?view=compass"
          />
          <QuadrantCard 
            icon={<Lightbulb className="h-6 w-6" />}
            title="Pensamiento Conceptual"
            description="Explora los 'porqués' del mundo."
            href="/podcasts?view=compass"
          />
          <QuadrantCard 
            icon={<Bot className="h-6 w-6" />}
            title="Análisis y Tecnología"
            description="Descubre cómo funciona el futuro."
            href="/podcasts?view=compass"
          />
          <QuadrantCard 
            icon={<Mic className="h-6 w-6" />}
            title="Narrativa e Historias"
            description="Conecta a través del storytelling."
            href="/podcasts?view=compass"
          />
        </div>
      </section>

      {/* Sección 3: Únete a la Conversación */}
      <div className="w-full max-w-7xl mx-auto">
        <PodcastShelf 
          title="Únete a la Conversación"
          podcasts={latestPodcasts as any[] || []}
        />
      </div>

      {/* Footer */}
      <footer className="w-full py-8 mt-16 bg-muted/50 text-center text-sm text-muted-foreground">
        <div className="container px-4 md:px-6 mx-auto">
          <p>&copy; {new Date().getFullYear()} NicePod. Todos los derechos reservados.</p>
          <nav className="mt-4 flex justify-center space-x-4">
            <Link href="#" className="hover:text-primary">Política de Privacidad</Link>
            <Link href="#" className="hover:text-primary">Términos de Servicio</Link>
            <Link href="#" className="hover:text-primary">Contacto</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

// El componente principal que decide qué vista mostrar
export default async function HomePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Si hay usuario, llamamos a nuestro Oráculo para obtener el feed personalizado.
    const { data: feed, error: feedError } = await supabase
      .rpc('get_user_discovery_feed', { p_user_id: user.id });

    if (feedError) {
      console.error("Error al obtener el feed de descubrimiento:", feedError);
      // Si el Oráculo falla, mostramos un dashboard de fallback en lugar de romper la página.
      return (
        <div className="container mx-auto max-w-7xl py-12 px-4 text-center">
          <h1 className="text-4xl font-bold">¡Bienvenido de nuevo, {user.email}!</h1>
          <p className="text-lg text-muted-foreground mt-2">No pudimos cargar tu feed personalizado. Por favor, intenta de nuevo más tarde.</p>
        </div>
      );
    }

    return <UserDashboard user={user} feed={feed} />;
  } else {
    // Si no hay usuario, obtenemos los datos genéricos para la landing page y la renderizamos.
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