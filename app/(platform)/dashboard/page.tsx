// app/(platform)/dashboard/page.tsx
// VERSIÓN: 4.0 (The Intelligence Command Suite - Space Optimized & Search Overlay)
// Misión: Terminal de mando optimizada. El saludo y la búsqueda conviven dinámicamente para ganar espacio vital.

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
    History,
    ChevronRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import React from "react";

/**
 * [SHIELD]: HIDRATACIÓN ESCALONADA
 * Cargamos el Mapa y los Estantes de forma diferida para liberar el hilo principal.
 * Skeleton ultra-compacto para evitar scroll innecesario al cargar.
 */
const MapPreviewFrame = dynamic(
  () => import("@/components/geo/map-preview-frame").then((mod) => mod.MapPreviewFrame),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-[140px] md:h-[180px] rounded-[2.5rem] bg-zinc-950/50 border border-white/5 animate-pulse flex items-center justify-center" />
    )
  }
);

const PodcastShelf = dynamic(
  () => import("@/components/podcast-shelf").then((mod) => mod.PodcastShelf),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-32 bg-white/[0.01] rounded-[2rem] border border-dashed border-white/5 flex items-center justify-center" />
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
  
  // 1. VALIDACIÓN DE IDENTIDAD
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
      redirect("/login");
  }

  // 2. RECOPILACIÓN DE INTELIGENCIA PARALELA
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
  
  const safeEpicenter = sanitizePodcasts(feed?.epicenter || []);
  const safeConnections = sanitizePodcasts(feed?.semantic_connections || []);

  return (
    <main className="container mx-auto max-w-screen-xl min-h-screen px-4 lg:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12 pt-4 pb-24">
        
        {/* COLUMNA MAESTRA (Malla de Inteligencia) */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* SECCIÓN I: COMMAND BAR DINÁMICA
              [UX UPGRADE]: Contenedor relativo que permite que el buscador cubra el título.
          */}
          <header className="relative w-full h-20 flex items-center animate-in fade-in duration-700">
            
            {/* Capa A: Título y Saludo (Sutil) */}
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
                Hola, <span className="text-primary not-italic">{userName}</span>
              </h1>
              <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
                Tu ecosistema de inteligencia está activo
              </p>
            </div>

            {/* Capa B: Buscador Expansivo
                Situado de forma absoluta para poder crecer sobre el título sin desplazar el layout.
            */}
            <div className="absolute right-0 w-full flex justify-end">
                <DiscoveryHub showOnlySearch={true} userName={userName} />
            </div>

          </header>

          {/* SECCIÓN II: PORTAL DE RESONANCIA (PANORÁMICO)
              [SPACE OPTIMIZED]: Altura reducida para que el contenido sea visible de inmediato.
          */}
          <section className="relative group rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl transition-all duration-700 hover:border-primary/20 bg-zinc-950">
            <div className="absolute top-4 left-6 z-20">
                <div className="bg-black/60 backdrop-blur-xl px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 shadow-2xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Resonancia Live</span>
                </div>
            </div>
            
            {/* Altura táctica: 140px (móvil) / 180px (desktop) */}
            <div className="h-[140px] md:h-[180px] w-full">
              <MapPreviewFrame />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none z-10" />
            
            {/* Título integrado en el mapa para ahorrar espacio */}
            <div className="absolute bottom-4 left-6 z-20">
                <h3 className="text-white font-black text-lg md:text-xl uppercase tracking-tighter italic leading-none drop-shadow-md">
                    Madrid <span className="text-primary">3D</span>
                </h3>
            </div>
          </section>

          {/* SECCIÓN III: ACTIVIDAD RECIENTE Y DIMENSIONES */}
          <div className="space-y-12">
            
            {/* Categorías (Exploración compacta) */}
            <section className="animate-in fade-in duration-1000 delay-300">
                <DiscoveryHub showOnlyCategories={true} />
            </section>

            {/* Estantes de Podcasts (Densidad Alta) */}
            <div className="space-y-10">
                <div className="relative">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <div className="flex items-center gap-2">
                            <Zap size={14} className="text-primary fill-current" />
                            <h2 className="text-xs font-black uppercase tracking-widest text-foreground">Tu Epicentro</h2>
                        </div>
                    </div>
                    <PodcastShelf 
                        title="Epicentro" 
                        podcasts={safeEpicenter} 
                        variant="compact" 
                    />
                </div>

                <div className="relative">
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <Sparkles size={14} className="text-purple-500 fill-current" />
                        <h2 className="text-xs font-black uppercase tracking-widest text-foreground">Conexiones</h2>
                    </div>
                    <PodcastShelf 
                        title="Conexiones" 
                        podcasts={safeConnections} 
                        variant="compact" 
                    />
                </div>
            </div>

          </div>
        </div>

        {/* COLUMNA LATERAL (Soberanía y Métricas) */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[7.5rem] space-y-6">
            
            <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000">
                    <Globe size={70} className="text-primary" />
                </div>
                <div className="space-y-4 relative z-10">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Consola de Misión</p>
                    <h4 className="font-bold text-sm text-foreground leading-snug tracking-tight">
                        Ancla nuevas memorias sonoras para expandir la red.
                    </h4>
                    <Link href="/create" className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:translate-x-1 transition-transform">
                        Iniciar Forja <ChevronRight size={12} />
                    </Link>
                </div>
            </div>

            <InsightPanel resonanceProfile={resonanceProfile} />
            
            <div className="p-6 text-center bg-white/[0.02] rounded-[2rem] border border-white/5 flex flex-col items-center space-y-3">
                <div className="h-6 w-6 relative opacity-20">
                    <Image src="/nicepod-logo.png" alt="NicePod" fill className="object-contain grayscale" />
                </div>
                <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">Intelligence Shell V2.5</p>
            </div>
          </div>
        </aside>

      </div>
      
      <FloatingActionButton />
    </main>
  );
}