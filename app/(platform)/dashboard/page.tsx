// app/(platform)/dashboard/page.tsx
// VERSIÓN: 4.1 (The Intelligence Command Suite - Space Optimized & Correct Layering)

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

const MapPreviewFrame = dynamic(
  () => import("@/components/geo/map-preview-frame").then((mod) => mod.MapPreviewFrame),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-[140px] md:h-[180px] rounded-[2rem] md:rounded-[3rem] bg-zinc-950 border border-white/5 animate-pulse flex items-center justify-center" />
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
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
      redirect("/login");
  }

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
    <main className="container mx-auto max-w-screen-xl min-h-screen px-4 lg:px-6 overflow-x-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12 pt-4 pb-24">
        
        <div className="lg:col-span-3 space-y-10">
          
          {/* SECCIÓN I: COMMAND HEADER (Capa dinámica) */}
          <header className="relative w-full h-16 flex items-center animate-in fade-in duration-700">
            
            {/* SALUDO (Se cubre automáticamente cuando el buscador se expande con z-index 60) */}
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
                Hola, <span className="text-primary not-italic">{userName}</span>
              </h1>
              <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mt-1">
                Frecuencia de Inteligencia Activa
              </p>
            </div>

            {/* BUSCADOR MAESTRO (Ubicado a la derecha, pero se expande a la izquierda) */}
            <div className="absolute right-0 w-full flex justify-end pointer-events-none">
                <div className="pointer-events-auto w-full">
                    <DiscoveryHub showOnlySearch={true} userName={userName} />
                </div>
            </div>

          </header>

          {/* SECCIÓN II: PORTAL MADRID (Banner elegante) */}
          <section className="relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-zinc-950 shadow-2xl">
            <div className="h-[140px] md:h-[180px] w-full">
              <MapPreviewFrame />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-6 z-20">
                <h3 className="text-white font-black text-lg md:text-xl uppercase tracking-tighter italic drop-shadow-lg">
                    Madrid <span className="text-primary">3D</span>
                </h3>
            </div>
          </section>

          {/* SECCIÓN III: MALLA DE CONOCIMIENTO */}
          <div className="space-y-12">
            <DiscoveryHub showOnlyCategories={true} />

            <div className="space-y-10">
                <div className="relative">
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <Zap size={14} className="text-primary fill-current" />
                        <h2 className="text-xs font-black uppercase tracking-widest text-foreground">Tu Epicentro</h2>
                    </div>
                    <PodcastShelf title="Epicentro" podcasts={safeEpicenter} variant="compact" />
                </div>

                <div className="relative">
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <Sparkles size={14} className="text-purple-500 fill-current" />
                        <h2 className="text-xs font-black uppercase tracking-widest text-foreground">Conexiones</h2>
                    </div>
                    <PodcastShelf title="Conexiones" podcasts={safeConnections} variant="compact" />
                </div>
            </div>
          </div>
        </div>

        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[7.5rem] space-y-6">
            <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:rotate-12 transition-all">
                    <Globe size={70} className="text-primary" />
                </div>
                <div className="space-y-4 relative z-10">
                    <p className="text-[9px] font-black uppercase text-primary tracking-[0.3em]">Consola</p>
                    <h4 className="font-bold text-sm text-foreground leading-snug">Expande la red anclando nuevas memorias.</h4>
                </div>
            </div>
            <InsightPanel resonanceProfile={resonanceProfile} />
            <div className="p-6 text-center bg-white/[0.02] rounded-[2rem] border border-white/5 flex flex-col items-center gap-2">
                <div className="h-6 w-6 relative opacity-20"><Image src="/nicepod-logo.png" alt="Logo" fill className="object-contain grayscale" /></div>
                <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Intelligence Shell V2.5</p>
            </div>
          </div>
        </aside>

      </div>
      <FloatingActionButton />
    </main>
  );
}