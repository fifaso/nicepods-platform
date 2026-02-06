// app/(platform)/dashboard/page.tsx
// VERSIÓN: 2.1 (The Intelligence Command Center - Performance Optimized)
// Misión: Orquestar el punto de entrada táctico del usuario con latencia cero y máxima densidad de valor.

import { DiscoveryHub } from "@/components/discovery-hub";
import { InsightPanel } from "@/components/insight-panel";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { createClient } from "@/lib/supabase/server";
import { PodcastWithProfile } from "@/types/podcast";
import type { Tables } from "@/types/supabase";
import {
  BrainCircuit,
  ChevronRight,
  Globe,
  Loader2,
  Search,
  Sparkles,
  Zap
} from "lucide-react";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

/**
 * [OPTIMIZACIÓN DE CARGA CRÍTICA]
 * Delegamos el Mapa 3D y los Estantes de Audio a una hidratación diferida.
 * Esto libera el hilo principal para que la página sea interactiva en <200ms.
 */
const MapPreviewFrame = dynamic(
  () => import("@/components/geo/map-preview-frame").then((mod) => mod.MapPreviewFrame),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] rounded-[3rem] bg-zinc-900/50 border border-white/5 flex flex-col items-center justify-center space-y-4 animate-pulse">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/50">Iniciando Motor WebGL...</span>
      </div>
    )
  }
);

const PodcastShelf = dynamic(
  () => import("@/components/podcast-shelf").then((mod) => mod.PodcastShelf),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-48 bg-white/[0.02] rounded-[2.5rem] border border-dashed border-white/5 flex items-center justify-center">
        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20">Sintonizando Frecuencia</span>
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
 * Garantiza que los metadatos JSONB sean seguros para el renderizado de React.
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
 * DashboardPage: Terminal táctica de NicePod.
 */
export default async function DashboardPage() {
  const supabase = createClient();

  // 1. ESCUDO DE IDENTIDAD (Validación en el Borde)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. ADQUISICIÓN DE INTELIGENCIA (Estrategia de Paralelismo Total)
  const [
    { data: feedData },
    { data: resonanceData },
    { data: profileData }
  ] = await Promise.all([
    supabase.rpc('get_user_discovery_feed', { p_user_id: user.id }),
    supabase.from('user_resonance_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('profiles').select('full_name, reputation_score').eq('id', user.id).single()
  ]);

  const feed = feedData as DiscoveryFeed;
  const resonanceProfile = resonanceData as ResonanceProfile;
  const userName = profileData?.full_name?.split(' ')[0] || "Curador";
  const reputation = profileData?.reputation_score || 0;

  const safeEpicenter = sanitizePodcasts(feed?.epicenter || []);
  const safeConnections = sanitizePodcasts(feed?.semantic_connections || []);

  return (
    <main className="container mx-auto max-w-screen-xl min-h-screen px-4 lg:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12 xl:gap-16 pt-10 pb-32">

        {/* COLUMNA DE OPERACIONES (Centro de Visión) */}
        <div className="lg:col-span-3 space-y-16">

          {/* SECCIÓN I: CABECERA DE ALTO IMPACTO */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 animate-in fade-in slide-in-from-top-6 duration-1000">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                  Sincronía de Inteligencia Estable
                </div>
                {reputation > 50 && (
                  <div className="flex items-center gap-2 text-fuchsia-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <Sparkles size={14} className="animate-pulse" /> Nivel: Curador
                  </div>
                )}
              </div>

              <h1 className="text-5xl lg:text-8xl font-black tracking-tighter text-zinc-900 dark:text-white leading-[0.85] uppercase italic">
                Hola, <span className="text-primary not-italic">{userName}</span>
              </h1>
              <p className="text-muted-foreground text-base lg:text-2xl font-medium max-w-xl leading-relaxed">
                Tu mapa de crónicas y radares de alta autoridad está listo para ser explorado.
              </p>
            </div>

            {/* INTEGRACIÓN OMNI-SEARCH (Acceso Rápido) */}
            <div className="w-full md:max-w-sm group">
              <div className="mb-2 flex items-center gap-2 px-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest group-hover:text-primary/50 transition-colors">
                <Search size={12} /> Localizador Semántico
              </div>
              <DiscoveryHub showOnlySearch={true} userName={userName} />
            </div>
          </header>

          {/* SECCIÓN II: MADRID RESONANCE LIVE (Ventana 3D) */}
          <section className="relative group rounded-[3.5rem] overflow-hidden border border-white/5 shadow-2xl shadow-purple-500/5 transition-all duration-700 hover:border-primary/20">
            {/* HUD de Estado del Mapa */}
            <div className="absolute top-10 left-10 z-20 flex flex-col gap-3">
              <div className="bg-black/80 backdrop-blur-2xl px-6 py-2.5 rounded-2xl border border-white/10 flex items-center gap-3 shadow-2xl">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Resonancia Urbana: Madrid</span>
              </div>
            </div>

            {/* Cargador del Motor WebGL */}
            <div className="h-[450px] lg:h-[550px] w-full bg-zinc-950">
              <MapPreviewFrame />
            </div>

            {/* Máscara de Profundidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />

            {/* Controles de Navegación Inferiores */}
            <div className="absolute bottom-10 left-10 right-10 z-20 flex justify-between items-end gap-6">
              <div className="space-y-2">
                <h3 className="text-white font-black text-3xl lg:text-5xl uppercase tracking-tighter italic leading-none drop-shadow-lg">
                  Vivir lo <span className="text-primary">Local</span>
                </h3>
                <p className="text-white/60 text-xs lg:text-sm font-bold uppercase tracking-[0.2em]">Explora memorias sonoras ancladas al territorio</p>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <div className="px-6 py-3 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 flex items-center gap-3 group/btn cursor-pointer hover:bg-white/10 transition-all">
                  <Globe size={18} className="text-blue-400" />
                  <span className="text-[11px] font-black text-white uppercase tracking-widest">Abrir Dimensión 3D</span>
                  <ChevronRight size={14} className="text-white/40 group-hover/btn:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN III: FEED DINÁMICO (Inteligencia Circular) */}
          <div className="space-y-24">

            {/* Categorías de Universos Semánticos */}
            <section className="animate-in fade-in duration-1000 delay-500">
              <div className="flex items-center gap-4 mb-10 pl-2">
                <div className="h-px w-12 bg-primary/30" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-muted-foreground/60">Dimensiones de Sabiduría</h2>
              </div>
              <DiscoveryHub showOnlyCategories={true} />
            </section>

            {/* Estantes de Conocimiento (Optimización LCP) */}
            <div className="space-y-32">
              <div className="relative group">
                <div className="absolute -left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <PodcastShelf
                  title="Tu Epicentro Creativo"
                  podcasts={safeEpicenter}
                  variant="compact"
                />
              </div>

              <div className="relative group">
                <div className="absolute -left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <PodcastShelf
                  title="Conexiones Inesperadas"
                  podcasts={safeConnections}
                  variant="compact"
                />
              </div>
            </div>

          </div>
        </div>

        {/* ASIDE: TERMINAL DE MÉTRICAS (Estrategia Lateral) */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[7.5rem] space-y-10">

            {/* Banner de Misión Operativa */}
            <div className="p-8 bg-primary/5 rounded-[3rem] border border-primary/20 backdrop-blur-md relative overflow-hidden group shadow-2xl shadow-primary/5">
              <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                <Zap size={80} className="text-primary fill-current" />
              </div>
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-2">
                  <BrainCircuit size={16} className="text-primary" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Objetivo de Curador</p>
                </div>
                <h4 className="font-bold text-base text-foreground leading-snug">
                  Alimenta tu Bóveda hoy. Cada crónica forjada aumenta tu resonancia en el mapa de Madrid.
                </h4>
              </div>
            </div>

            {/* Panel de Insights Semánticos */}
            <InsightPanel resonanceProfile={resonanceProfile} />

            {/* Branding de Versión y Salud de Red */}
            <div className="p-10 text-center bg-white/5 rounded-[3rem] border border-white/5 flex flex-col items-center space-y-4">
              <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/10 p-1.5 opacity-40">
                <img src="/nicepod-logo.png" alt="NicePod" className="w-full h-full object-contain grayscale" />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">Core V2.5 Active Shell</p>
                <p className="text-[10px] text-muted-foreground/40 font-medium leading-tight">
                  Ecosistema Sincronizado<br />
                  Latencia: Nominal
                </p>
              </div>
            </div>

          </div>
        </aside>

      </div>

      {/* TRIGGER DE CREACIÓN FLOTANTE */}
      <FloatingActionButton />
    </main>
  );
}