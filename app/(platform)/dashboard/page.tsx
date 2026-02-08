// app/(platform)/dashboard/page.tsx
// VERSIÓN: 9.0 (Operational Command Center - Final Structural Fix)
// Misión: Punto de entrada operativo. Resolución definitiva de solapamiento de capas.
// [FIX]: Se divide la lógica de búsqueda en dos instancias para proteger el flujo del documento.

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
    Map as MapIcon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import React from "react";

/**
 * [TYPES]: Definiciones de integridad.
 */
type ResonanceProfile = Tables<'user_resonance_profiles'>;

interface DiscoveryFeed {
  epicenter: PodcastWithProfile[] | null;
  semantic_connections: PodcastWithProfile[] | null;
  new_horizons: PodcastWithProfile[] | null;
}

/**
 * [SHIELD]: HIDRATACIÓN ESCALONADA
 * Mapa y Estantes cargados con skeletons para no estresar el Main Thread.
 */
const MapPreviewFrame = dynamic(
  () => import("@/components/geo/map-preview-frame").then((mod) => mod.MapPreviewFrame),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-[140px] md:h-[180px] rounded-[2.5rem] bg-zinc-900/50 border border-white/5 animate-pulse flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary/20" />
      </div>
    )
  }
);

/**
 * sanitizePodcasts
 */
function sanitizePodcasts(podcasts: any[] | null): PodcastWithProfile[] {
  if (!podcasts || !Array.isArray(podcasts)) return [];
  return podcasts.map((pod) => {
    return {
      ...pod,
      creation_data: typeof pod.creation_data === 'string' ? JSON.parse(pod.creation_data) : pod.creation_data || null,
      ai_tags: Array.isArray(pod.ai_tags) ? pod.ai_tags : [],
      user_tags: Array.isArray(pod.user_tags) ? pod.user_tags : [],
      sources: Array.isArray(pod.sources) ? pod.sources : [],
    };
  }).filter((p) => p.id);
}

export default async function DashboardPage() {
  const supabase = createClient();
  
  // 1. PROTOCOLO DE IDENTIDAD
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
      redirect("/login");
  }

  // 2. RECOPILACIÓN DE INTELIGENCIA
  const [
    { data: feedData },
    { data: resonanceData },
    { data: profileData }
  ] = await Promise.all([
    supabase.rpc('get_user_discovery_feed', { p_user_id: user.id }),
    supabase.from('user_resonance_profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('profiles').select('full_name, reputation_score').eq('id', user.id).single()
  ]);

  const feed = feedData as DiscoveryFeed;
  const resonanceProfile = resonanceData as ResonanceProfile;
  const userName = profileData?.full_name?.split(' ')[0] || "Curador";

  const safeEpicenter = sanitizePodcasts(feed?.epicenter || []);
  const safeConnections = sanitizePodcasts(feed?.semantic_connections || []);

  return (
    <main className="container mx-auto max-w-screen-xl px-4 lg:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12 pb-24">
        
        {/* COLUMNA CENTRAL (OP-CENTER) */}
        <div className="lg:col-span-3 space-y-10">
          
          {/* SECCIÓN I: COMMAND HEADER
              Contenedor con altura física real para anclar el resto de la página.
          */}
          <header className="relative w-full h-24 md:h-28 flex items-center justify-between z-40 bg-transparent">
            
            {/* SALUDO (Capa Estática en el flujo) */}
            <div className="flex flex-col justify-center animate-in fade-in duration-1000">
              <div className="flex items-center gap-2 mb-2 opacity-60">
                <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">
                  Sincronía Nominal
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic leading-none">
                Hola, <span className="text-primary not-italic">{userName}</span>
              </h1>
            </div>

            {/* BUSCADOR MAESTRO (Capa Dinámica absoluta)
                Al expandirse, cubrirá el saludo pero no afectará al mapa de abajo.
            */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full flex justify-end pointer-events-none">
                <div className="pointer-events-auto w-full">
                    <DiscoveryHub 
                        userName={userName} 
                        showOnlySearch={true} 
                    />
                </div>
            </div>
          </header>

          {/* SECCIÓN II: PORTAL MADRID (Posicionamiento Estático Garantizado) */}
          <section className="relative rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border border-white/5 bg-zinc-950 shadow-2xl transition-all duration-700 hover:border-primary/20">
            <div className="h-[140px] md:h-[180px] w-full relative z-0">
              <MapPreviewFrame />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none z-10" />
            <div className="absolute bottom-4 left-8 z-20 flex items-center gap-3">
                <div className="p-2 bg-primary/20 backdrop-blur-xl rounded-xl border border-primary/30">
                    <MapIcon size={14} className="text-primary" />
                </div>
                <h3 className="text-white font-black text-xs md:text-sm uppercase tracking-tighter italic drop-shadow-lg leading-none">
                    Madrid <span className="text-primary">Live Resonance</span>
                </h3>
            </div>
          </section>

          {/* SECCIÓN III: FEED DE INTELIGENCIA (Posicionamiento Estático)
              [CLAVE]: Esta instancia de DiscoveryHub renderiza las categorías y los resultados,
              asegurando que los podcasts se dibujen en su lugar correcto.
          */}
          <div className="relative z-0">
              <DiscoveryHub 
                  userName={userName} 
                  showShelvesOnNoSearch={true}
                  epicenterPodcasts={safeEpicenter}
                  connectionsPodcasts={safeConnections}
                  showOnlyCategories={false} 
              />
          </div>

        </div>

        {/* COLUMNA LATERAL (Soberanía y Telemetría) */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[7.5rem] space-y-8">
            
            <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 backdrop-blur-md relative overflow-hidden group shadow-xl">
                <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000">
                    <Globe size={70} className="text-primary" />
                </div>
                <div className="space-y-4 relative z-10">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Estado de Misión</p>
                    <h4 className="font-bold text-sm text-foreground leading-snug tracking-tight">
                        Tu Bóveda se expande con cada crónica. Fortalece la memoria colectiva de Madrid.
                    </h4>
                    <Link 
                        href="/create" 
                        className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:translate-x-1 transition-transform"
                    >
                        Iniciar Nueva Forja <ChevronRight size={12} />
                    </Link>
                </div>
            </div>

            <InsightPanel resonanceProfile={resonanceProfile} />
            
            <div className="p-10 text-center bg-white/[0.02] rounded-[3rem] border border-white/5 flex flex-col items-center space-y-4 shadow-inner">
                <div className="h-10 w-10 relative opacity-20 hover:opacity-50 transition-opacity">
                    <Image 
                      src="/nicepod-logo.png" 
                      alt="NicePod" 
                      fill 
                      className="object-contain grayscale"
                    />
                </div>
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">Intelligence Shell V2.5</p>
                    <div className="flex items-center gap-1.5 justify-center">
                        <Activity size={10} className="text-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-widest">Neural Link Active</span>
                    </div>
                </div>
            </div>
          </div>
        </aside>

      </div>
      
      <FloatingActionButton />
    </main>
  );
}