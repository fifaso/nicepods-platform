// app/(platform)/dashboard/page.tsx
// VERSIÓN: 2.0 (The Intelligence Command Center - Strategic UI & Full Integrity)
// Misión: Proveer una terminal de alta fidelidad para el curador de conocimiento.

import { DiscoveryHub } from "@/components/discovery-hub";
import { MapPreviewFrame } from "@/components/geo/map-preview-frame";
import { InsightPanel } from "@/components/insight-panel";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { createClient } from "@/lib/supabase/server";
import { PodcastWithProfile } from "@/types/podcast";
import type { Tables } from "@/types/supabase";
import { BrainCircuit, Globe, Loader2, Sparkles, Zap } from "lucide-react";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

/**
 * [CARGA ESTRATÉGICA]: Componentes Pesados
 * Cargamos el carrusel de podcasts con ssr: false para no retrasar el First Contentful Paint.
 */
const PodcastShelf = dynamic(
  () => import("@/components/podcast-shelf").then((mod) => mod.PodcastShelf),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-48 flex flex-col items-center justify-center space-y-4 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 animate-pulse">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Sintonizando Frecuencias...</span>
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
 * sanitizePodcasts
 * Procesa los datos crudos de Supabase para asegurar integridad de objetos JSON y tipado.
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

/**
 * DashboardPage: El núcleo dinámico de NicePod V2.5.
 * Este componente es 100% Servidor, garantizando que el usuario siempre vea datos frescos.
 */
export default async function DashboardPage() {
  const supabase = createClient();

  // 1. ESCUDO DE SEGURIDAD (Server-Side Guard)
  // Validamos identidad directamente contra el núcleo de auth antes de renderizar un solo pixel.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. ADQUISICIÓN DE DATOS (Parallel Strategy)
  // Disparamos todas las consultas en paralelo para minimizar la latencia de carga.
  const [
    { data: feedData },
    { data: resonanceData },
    { data: profileData, error: profileError }
  ] = await Promise.all([
    supabase.rpc('get_user_discovery_feed', { p_user_id: user.id }),
    supabase.from('user_resonance_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('profiles').select('full_name, reputation_score').eq('id', user.id).single()
  ]);

  if (profileError) {
    console.error("🔥 [Dashboard-Fatal]: No se pudo recuperar el perfil del curador.");
  }

  const feed = feedData as DiscoveryFeed;
  const resonanceProfile = resonanceData as ResonanceProfile;
  const userName = profileData?.full_name?.split(' ')[0] || "Curador";
  const reputation = profileData?.reputation_score || 0;

  const safeEpicenter = sanitizePodcasts(feed?.epicenter || []);
  const safeConnections = sanitizePodcasts(feed?.semantic_connections || []);

  return (
    <main className="container mx-auto max-w-screen-xl min-h-screen px-4 lg:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12 xl:gap-16 pt-8 pb-24">

        {/* COLUMNA CENTRAL: EL LIENZO DE SABIDURÍA */}
        <div className="lg:col-span-3 space-y-12">

          {/* SECCIÓN 1: HERO TÁCTICO */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                  Terminal de Inteligencia Activa
                </div>
                {reputation > 100 && (
                  <div className="flex items-center gap-1.5 text-yellow-500 text-[10px] font-black uppercase tracking-widest">
                    <Sparkles size={12} /> Curador Elite
                  </div>
                )}
              </div>
              <h1 className="text-4xl lg:text-7xl font-black tracking-tighter text-zinc-900 dark:text-white leading-none">
                Hola, <span className="text-primary italic">{userName}</span>
              </h1>
              <p className="text-muted-foreground text-sm lg:text-xl font-medium max-w-lg leading-snug">
                Tu red de crónicas urbanas y señales de alta autoridad está sincronizada.
              </p>
            </div>

            {/* BUSCADOR OMNI (Desktop Integrado) */}
            <div className="w-full md:max-w-sm">
              <DiscoveryHub showOnlySearch={true} userName={userName} />
            </div>
          </header>

          {/* SECCIÓN 2: PORTAL DE RESONANCIA (Madrid Live) */}
          <section className="relative group rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/10 transition-all hover:border-primary/30">
            <div className="absolute top-8 left-8 z-20 flex flex-col gap-2">
              <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Madrid Resonance Live</span>
              </div>
            </div>

            <div className="h-[400px] w-full">
              <MapPreviewFrame />
            </div>

            {/* Overlay Informativo */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-8 left-8 right-8 z-20 flex justify-between items-end">
              <div className="space-y-1">
                <h3 className="text-white font-black text-2xl uppercase tracking-tighter italic">Memoria Urbana</h3>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Descubre ecos en tu radio actual</p>
              </div>
              <div className="hidden md:flex gap-4">
                <div className="p-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center gap-3">
                  <Globe size={16} className="text-blue-400" />
                  <span className="text-[10px] font-black text-white uppercase">Sincronizado</span>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 3: ESTANTES DE CONOCIMIENTO (Feed Dinámico) */}
          <div className="space-y-20">

            {/* Categorías de Acceso Rápido */}
            <section className="animate-in fade-in duration-1000 delay-300">
              <div className="flex items-center gap-3 mb-8">
                <BrainCircuit className="text-primary h-5 w-5" />
                <h2 className="text-sm font-black uppercase tracking-[0.4em] text-muted-foreground">Explora tu Bóveda Semántica</h2>
              </div>
              <DiscoveryHub showOnlyCategories={true} />
            </section>

            {/* Estantes Curados */}
            <div className="space-y-24">
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-transparent opacity-20" />
                <PodcastShelf
                  title="Tu Epicentro Creativo"
                  podcasts={safeEpicenter}
                  variant="compact"
                />
              </div>

              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-transparent opacity-20" />
                <PodcastShelf
                  title="Conexiones Inesperadas"
                  podcasts={safeConnections}
                  variant="compact"
                />
              </div>
            </div>

          </div>
        </div>

        {/* COLUMNA LATERAL: MÉTRICAS DE IMPACTO (Sidebar) */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[7rem] space-y-8">
            <div className="p-6 bg-primary/5 rounded-[2.5rem] border border-primary/20 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                <Zap size={40} className="text-primary" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Misión Actual</p>
              <h4 className="font-bold text-sm text-foreground leading-tight">Forja contenido de alta autoridad y aumenta tu resonancia comunitaria.</h4>
            </div>

            <InsightPanel resonanceProfile={resonanceProfile} />

            <div className="p-8 text-center bg-white/5 rounded-[2.5rem] border border-white/10">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.5em] mb-4">Integridad NicePod</p>
              <p className="text-[10px] text-muted-foreground/60 font-medium">Versión 2.5 Active Shell<br />Stable Intelligence Loop</p>
            </div>
          </div>
        </aside>

      </div>

      {/* EL GATILLO DE CREACIÓN MAESTRO */}
      <FloatingActionButton />
    </main>
  );
}