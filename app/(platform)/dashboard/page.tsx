// app/(platform)/dashboard/page.tsx
// VERSIÓN: 7.5 (The Intelligence Command Suite - Final Architecture)
// Misión: Punto de entrada operativo. Estabilidad total de capas y optimización de densidad visual.
// [FIX]: Resolución definitiva de solapamiento y errores de tipos en PodcastShelf.

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
    Map as MapIcon,
    History
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import React from "react";

/**
 * [TYPES]: Definiciones de integridad para el compilador.
 */
type ResonanceProfile = Tables<'user_resonance_profiles'>;

interface DiscoveryFeed {
  epicenter: PodcastWithProfile[] | null;
  semantic_connections: PodcastWithProfile[] | null;
  new_horizons: PodcastWithProfile[] | null;
}

/**
 * [SHIELD]: HIDRATACIÓN ESCALONADA
 * El Mapa y los Estantes se cargan de forma diferida para maximizar los 60 FPS iniciales.
 */
const MapPreviewFrame = dynamic(
  () => import("@/components/geo/map-preview-frame").then((mod) => mod.MapPreviewFrame),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-[140px] md:h-[180px] rounded-[2.5rem] bg-zinc-900/50 border border-white/5 animate-pulse flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary/20" />
      </div>
    )
  }
);

/**
 * sanitizePodcasts
 * Asegura que los metadatos JSONB no rompan el renderizado en el cliente.
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

/**
 * DashboardPage: El núcleo táctico de NicePod V2.5.
 */
export default async function DashboardPage() {
  const supabase = createClient();
  
  // 1. VALIDACIÓN DE IDENTIDAD (Server-Side)
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
    supabase.from('user_resonance_profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('profiles').select('full_name, reputation_score').eq('id', user.id).single()
  ]);

  const feed = feedData as DiscoveryFeed;
  const resonanceProfile = resonanceData as ResonanceProfile;
  const userName = profileData?.full_name?.split(' ')[0] || "Curador";

  // Procesamiento de datos para los estantes
  const safeEpicenter = sanitizePodcasts(feed?.epicenter || []);
  const safeConnections = sanitizePodcasts(feed?.semantic_connections || []);

  return (
    <main className="container mx-auto max-w-screen-xl min-h-screen px-4 lg:px-6 overflow-x-hidden">
      
      {/* ESTRUCTURA DE MALLA TÁCTICA */}
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12 pt-6 pb-24">
        
        {/* COLUMNA CENTRAL (Centro de Comando) */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* SECCIÓN I: COMMAND HEADER 
              [RESCATE]: Contenedor con altura mínima fija para evitar que el contenido suba.
          */}
          <header className="relative w-full min-h-[100px] md:min-h-[120px] flex items-center justify-between z-40">
            
            {/* SALUDO (Capa Base) */}
            <div className="flex flex-col justify-center animate-in fade-in slide-in-from-left-4 duration-1000">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/70">
                  Sincronía de Bóveda
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic leading-none">
                Hola, <span className="text-primary not-italic">{userName}</span>
              </h1>
            </div>

            {/* BUSCADOR EXPANSIVO
                Este componente cubrirá el saludo al activarse sin mover los estantes de abajo.
            */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full flex justify-end pointer-events-none">
                <div className="pointer-events-auto w-full max-w-full">
                    <DiscoveryHub 
                        userName={userName} 
                        showShelvesOnNoSearch={false} // El control de estantes es ahora externo para mayor estabilidad
                    />
                </div>
            </div>

          </header>

          {/* SECCIÓN II: PORTAL MADRID (Banner Panorámico Elegante)
              Altura compacta para priorizar la visualización de podcasts.
          */}
          <section className="relative rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border border-white/5 bg-zinc-950 shadow-2xl transition-all duration-700 hover:border-primary/20 group">
            <div className="h-[140px] md:h-[180px] w-full relative z-0 opacity-40 group-hover:opacity-60 transition-opacity">
              <MapPreviewFrame />
            </div>
            
            {/* Capa de atmósfera integrada */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none z-10" />
            
            {/* HUD de localización sutil */}
            <div className="absolute bottom-6 left-8 z-20 flex items-center gap-4">
                <div className="p-2.5 bg-primary/20 backdrop-blur-xl rounded-2xl border border-primary/30 shadow-inner">
                    <MapIcon size={16} className="text-primary" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-white font-black text-sm md:text-lg uppercase tracking-tighter italic leading-none drop-shadow-lg">
                      Madrid <span className="text-primary">Resonance</span>
                  </h3>
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest hidden md:block">
                    Portal de Memorias 3D Activo
                  </p>
                </div>
            </div>
          </section>

          {/* SECCIÓN III: MALLA DE CONOCIMIENTO (Feed de Podcasts)
              [PERFECCIÓN]: Ubicación fija debajo del portal.
          */}
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            
            {/* Carrusel de Universos Semánticos */}
            <section>
                <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center gap-3">
                        <BrainCircuit className="text-primary/40 h-4 w-4" />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/50">Dimensiones</h2>
                    </div>
                    <div className="h-px flex-1 mx-8 bg-white/5 hidden md:block" />
                    <div className="flex items-center gap-2 text-[8px] font-bold text-white/10 uppercase tracking-widest">
                        <Activity size={10} /> Neural Loop Active
                    </div>
                </div>
                <DiscoveryHub showOnlyCategories={true} userName={userName} />
            </section>

            {/* Estantes de Podcasts con Títulos Memorizados y Props Corregidas */}
            <div className="space-y-14">
                <div className="relative">
                    <div className="flex items-center gap-3 mb-5 px-2">
                        <Zap size={16} className="text-primary fill-current opacity-40" />
                        <h2 className="text-sm font-black uppercase tracking-tighter text-foreground/80">Tu Epicentro Creativo</h2>
                    </div>
                    <PodcastShelf 
                        title="Tu Epicentro" 
                        podcasts={safeEpicenter} 
                        variant="compact" 
                    />
                </div>

                <div className="relative">
                    <div className="flex items-center gap-3 mb-5 px-2">
                        <Sparkles size={16} className="text-purple-500 fill-current opacity-40" />
                        <h2 className="text-sm font-black uppercase tracking-tighter text-foreground/80">Conexiones Inesperadas</h2>
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

        {/* COLUMNA LATERAL (Insights & Soberanía de Datos) */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[7.5rem] space-y-8">
            
            {/* Tarjeta de Misión Operativa */}
            <div className="p-8 bg-primary/5 rounded-[3rem] border border-primary/10 backdrop-blur-md relative overflow-hidden group shadow-2xl">
                <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000">
                    <Globe size={70} className="text-primary" />
                </div>
                <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-2">
                        <Activity size={14} className="text-primary" />
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Estado de Misión</p>
                    </div>
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

            {/* Panel de Gráficos de Resonancia */}
            <InsightPanel resonanceProfile={resonanceProfile} />
            
            {/* Branding Sutil del Sistema */}
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
                    <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">Intelligence Shell V2.5</p>
                </div>
            </div>

          </div>
        </aside>

      </div>
      
      <FloatingActionButton />
    </main>
  );
}