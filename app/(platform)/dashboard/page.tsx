// app/(platform)/dashboard/page.tsx
// VERSIÓN: 2.2 (The Intelligence Command Center - Full Integrity Edition)
// Misión: Punto de entrada táctico para el curador. Optimizado para LCP y 60 FPS.

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
  History,
  Loader2,
  Search,
  Sparkles,
  Zap
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { redirect } from "next/navigation";

/**
 * [SHIELD]: HIDRATACIÓN ESCALONADA
 * El Mapa 3D y las Estanterías de Audio son componentes pesados que estresan la GPU.
 * Los cargamos de forma dinámica con un esqueleto (loading) que respeta la geometría Aurora.
 */
const MapPreviewFrame = dynamic(
  () => import("@/components/geo/map-preview-frame").then((mod) => mod.MapPreviewFrame),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] lg:h-[500px] rounded-[3.5rem] bg-zinc-900/50 border border-white/5 flex flex-col items-center justify-center space-y-4 animate-pulse">
        <div className="relative">
          <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
          <Globe className="absolute inset-0 m-auto h-5 w-5 text-primary/20" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">Sincronizando Resonancia Urbana...</span>
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
        <div className="flex items-center gap-3 opacity-20">
          <History size={16} />
          <span className="text-[9px] font-black uppercase tracking-[0.5em]">Recuperando Memorias</span>
        </div>
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
 * Procesa el flujo de datos de Supabase para asegurar que los metadatos JSONB 
 * no rompan el renderizado del cliente.
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
 * DashboardPage: Terminal de mando para el usuario autenticado.
 */
export default async function DashboardPage() {
  const supabase = createClient();

  // 1. VALIDACIÓN DE ACCESO (Server Guard)
  // Resolvemos la identidad en el servidor para evitar el pestañeo visual de invitado.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. ADQUISICIÓN PARALELA DE INTELIGENCIA
  // Cargamos perfil, feed y resonancia en una sola ráfaga de red.
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

        {/* COLUMNA MAESTRA: FEED DE INTELIGENCIA */}
        <div className="lg:col-span-3 space-y-16">

          {/* BLOQUE I: IDENTIDAD Y ESTADO DE RED */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 animate-in fade-in slide-in-from-top-6 duration-1000">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-3 w-3 relative">
                  <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></div>
                  <div className="relative inline-flex rounded-full h-3 w-3 bg-primary"></div>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                  Sincronía de Bóveda Estable
                </div>
                {reputation > 50 && (
                  <div className="flex items-center gap-2 text-fuchsia-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <Sparkles size={14} className="animate-pulse" /> Rango: Senior
                  </div>
                )}
              </div>

              <h1 className="text-6xl lg:text-8xl font-black tracking-tighter text-zinc-900 dark:text-white leading-[0.85] uppercase italic">
                Hola, <span className="text-primary not-italic">{userName}</span>
              </h1>
              <p className="text-muted-foreground text-base lg:text-2xl font-medium max-w-xl leading-snug">
                Tu ecosistema de crónicas y señales de alta autoridad ha sido actualizado.
              </p>
            </div>

            {/* BUSCADOR OMNIPRESENTE (Integración Táctica) */}
            <div className="w-full md:max-w-sm group">
              <div className="mb-3 flex items-center gap-2 px-3 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] group-hover:text-primary transition-colors">
                <Search size={12} /> Filtro Semántico
              </div>
              <DiscoveryHub showOnlySearch={true} userName={userName} />
            </div>
          </header>

          {/* BLOQUE II: VENTANA 3D (Madrid Resonance Live) */}
          <section className="relative group rounded-[3.5rem] overflow-hidden border border-white/5 shadow-2xl shadow-purple-500/10 transition-all duration-700 hover:border-primary/20 bg-zinc-950">
            {/* HUD de Estado Geospacial */}
            <div className="absolute top-10 left-10 z-20 flex flex-col gap-3">
              <div className="bg-black/80 backdrop-blur-2xl px-6 py-2.5 rounded-2xl border border-white/10 flex items-center gap-3 shadow-2xl">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)] animate-pulse" />
                <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Memoria Viva: Madrid</span>
              </div>
            </div>

            {/* El motor de Mapbox se monta aquí (Client Side Only) */}
            <div className="h-[450px] lg:h-[550px] w-full">
              <MapPreviewFrame />
            </div>

            {/* Máscara Cinematográfica */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none z-10" />

            {/* Información de Resonancia Inferior */}
            <div className="absolute bottom-10 left-10 right-10 z-20 flex justify-between items-end gap-6">
              <div className="space-y-2">
                <h3 className="text-white font-black text-3xl lg:text-5xl uppercase tracking-tighter italic leading-none drop-shadow-2xl">
                  Vivir lo <span className="text-primary">Local</span>
                </h3>
                <p className="text-white/60 text-xs lg:text-sm font-bold uppercase tracking-[0.2em]">Explora el legado sonoro en tu radio actual</p>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <div className="px-8 py-4 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 flex items-center gap-4 group/btn cursor-pointer hover:bg-white/10 transition-all shadow-2xl">
                  <Globe size={20} className="text-blue-400 group-hover/btn:rotate-12 transition-transform" />
                  <span className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Entrar al Mapa</span>
                  <ChevronRight size={16} className="text-white/30 group-hover/btn:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </section>

          {/* BLOQUE III: DIMENSIONES DEL SABER (Feed Dinámico) */}
          <div className="space-y-24">

            {/* Categorías de Universos Semánticos */}
            <section className="animate-in fade-in duration-1000 delay-500">
              <div className="flex items-center gap-4 mb-10 pl-2">
                <div className="h-px w-16 bg-primary/40" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.6em] text-muted-foreground/50">Malla de Conocimiento</h2>
              </div>
              <DiscoveryHub showOnlyCategories={true} />
            </section>

            {/* Estantes de Podcasts Curados */}
            <div className="space-y-32">
              <div className="relative group">
                <div className="absolute -left-10 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <PodcastShelf
                  title="Tu Epicentro Creativo"
                  podcasts={safeEpicenter}
                  variant="compact"
                />
              </div>

              <div className="relative group">
                <div className="absolute -left-10 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <PodcastShelf
                  title="Conexiones Inesperadas"
                  podcasts={safeConnections}
                  variant="compact"
                />
              </div>
            </div>

          </div>
        </div>

        {/* COLUMNA LATERAL: MÉTRICAS Y SALUD DEL SISTEMA */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[7.5rem] space-y-10">

            {/* Card de Misión Táctica */}
            <div className="p-10 bg-primary/5 rounded-[3.5rem] border border-primary/20 backdrop-blur-md relative overflow-hidden group shadow-2xl">
              <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000">
                <Zap size={100} className="text-primary fill-current" />
              </div>
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-3">
                  <BrainCircuit size={18} className="text-primary" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Status Operativo</p>
                </div>
                <h4 className="font-bold text-lg text-foreground leading-tight tracking-tight">
                  Tu Bóveda espera. Forja crónicas de alta fidelidad para expandir tu huella en el mapa.
                </h4>
              </div>
            </div>

            {/* Panel de Gráficos e Insights (NKV Status) */}
            <InsightPanel resonanceProfile={resonanceProfile} />

            {/* [MEJORA]: Branding con Next Image (Zero Warnings) */}
            <div className="p-12 text-center bg-white/5 rounded-[3.5rem] border border-white/5 flex flex-col items-center space-y-6 shadow-inner">
              <div className="h-10 w-10 relative opacity-30 hover:opacity-60 transition-opacity">
                <Image
                  src="/nicepod-logo.png"
                  alt="NicePod Core"
                  fill
                  className="object-contain grayscale"
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em]">System V2.5 Stable</p>
                <p className="text-[10px] text-muted-foreground/30 font-medium leading-relaxed">
                  Intelligence Loop: Active<br />
                  Neural Sync: 100%
                </p>
              </div>
            </div>

          </div>
        </aside>

      </div>

      {/* EL GATILLO UNIVERSAL DE CREACIÓN */}
      <FloatingActionButton />
    </main>
  );
}