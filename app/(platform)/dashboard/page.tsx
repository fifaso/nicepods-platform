// app/(platform)/dashboard/page.tsx
// VERSIÓN: 3.2 (The Intelligence Command Suite - Type Integrity Edition)
// Misión: Punto de entrada operativo. Corregida la omisión de la prop 'title' en PodcastShelf.

import { DiscoveryHub } from "@/components/discovery-hub";
import { InsightPanel } from "@/components/insight-panel";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { createClient } from "@/lib/supabase/server";
import { PodcastWithProfile } from "@/types/podcast";
import type { Tables } from "@/types/supabase";
import { 
    Loader2, 
    Sparkles, 
    Zap, 
    BrainCircuit, 
    Globe, 
    Activity,
    ChevronRight,
    Search
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import React from "react";

/**
 * [SHIELD]: HIDRATACIÓN ESCALONADA
 * Cargamos componentes pesados de forma diferida para maximizar el rendimiento inicial.
 */
const MapPreviewFrame = dynamic(
  () => import("@/components/geo/map-preview-frame").then((mod) => mod.MapPreviewFrame),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-[140px] md:h-[180px] rounded-[2rem] md:rounded-[3rem] bg-zinc-900/50 border border-white/5 animate-pulse flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary/30" />
      </div>
    )
  }
);

const PodcastShelf = dynamic(
  () => import("@/components/podcast-shelf").then((mod) => mod.PodcastShelf),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-40 bg-white/[0.01] rounded-[2rem] border border-dashed border-white/5 flex items-center justify-center">
        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/10 animate-pulse">Sincronizando Frecuencias</span>
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
 * sanitizePodcasts: Garantiza la integridad de los metadatos para el renderizado.
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
  
  // 1. VALIDACIÓN DE ACCESO
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
      redirect("/login");
  }

  // 2. ADQUISICIÓN DE INTELIGENCIA
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
    <main className="container mx-auto max-w-screen-xl min-h-screen px-4 lg:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12 xl:gap-16 pt-6 pb-24">
        
        {/* COLUMNA PRINCIPAL */}
        <div className="lg:col-span-3 space-y-10">
          
          {/* SECCIÓN I: COMMAND BAR */}
          <header className="relative w-full flex items-center justify-between min-h-[80px] animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">
                  Estación Activa
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white leading-none uppercase italic">
                Hola, <span className="text-primary not-italic">{userName}</span>
              </h1>
            </div>

            <div className="flex items-center">
                <DiscoveryHub showOnlySearch={true} userName={userName} mobileVariant={true} />
            </div>
          </header>

          {/* SECCIÓN II: PORTAL DE RESONANCIA */}
          <section className="relative group rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border border-white/5 shadow-2xl transition-all duration-700 hover:border-primary/20 bg-zinc-950">
            <div className="absolute top-6 left-6 z-20">
                <div className="bg-black/70 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-2xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Madrid Resonance</span>
                </div>
            </div>
            <div className="h-[140px] md:h-[180px] w-full">
              <MapPreviewFrame />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none z-10" />
          </section>

          {/* SECCIÓN III: MALLA DE CONOCIMIENTO */}
          <div className="space-y-16">
            
            <section className="animate-in fade-in duration-1000 delay-300">
                <div className="flex items-center justify-between mb-6 px-1">
                    <div className="flex items-center gap-3">
                        <BrainCircuit className="text-primary/40 h-4 w-4" />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">Dimensiones</h2>
                    </div>
                    <div className="h-px flex-1 mx-6 bg-white/5 hidden md:block" />
                    <div className="flex items-center gap-1.5 text-[8px] font-bold text-white/20 uppercase tracking-widest">
                        <Activity size={10} /> Neural Loop
                    </div>
                </div>
                <DiscoveryHub showOnlyCategories={true} />
            </section>

            {/* ESTANTES DE PODCASTS (Corregidos con prop 'title' obligatoria) */}
            <div className="space-y-12">
                <div className="relative">
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <Zap size={14} className="text-primary fill-current opacity-40" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Frecuencia Propia</span>
                    </div>
                    <PodcastShelf 
                        title="Tu Epicentro Creativo" 
                        podcasts={safeEpicenter} 
                        variant="compact" 
                    />
                </div>

                <div className="relative">
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <Sparkles size={14} className="text-purple-500 fill-current opacity-40" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Red de Sabiduría</span>
                    </div>
                    <PodcastShelf 
                        title="Conexiones Inesperadas" 
                        podcasts={safeConnections} 
                        variant="compact" 
                    />
                </div>
            </div>

          </div>
        </div>

        {/* ASIDE: INSIGHTS */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[7.5rem] space-y-8">
            <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 backdrop-blur-md relative overflow-hidden group shadow-xl">
                <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000">
                    <Globe size={70} className="text-primary" />
                </div>
                <div className="space-y-4 relative z-10">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Objetivo Operativo</p>
                    <h4 className="font-bold text-sm text-foreground leading-snug tracking-tight">
                        Expande tu huella digital. Cada crónica anclada fortalece la memoria colectiva de la red.
                    </h4>
                    <Link href="/create" className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:translate-x-1 transition-transform">
                        Iniciar Forja <ChevronRight size={12} />
                    </Link>
                </div>
            </div>

            <InsightPanel resonanceProfile={resonanceProfile} />
            
            <div className="p-8 text-center bg-white/[0.02] rounded-[2.5rem] border border-white/5 flex flex-col items-center space-y-4 shadow-inner">
                <div className="h-8 w-8 relative opacity-20">
                    <Image 
                      src="/nicepod-logo.png" 
                      alt="NicePod" 
                      fill 
                      className="object-contain grayscale"
                    />
                </div>
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">Intelligence Shell V2.5</p>
                </div>
            </div>
          </div>
        </aside>

      </div>
      <FloatingActionButton />
    </main>
  );
}