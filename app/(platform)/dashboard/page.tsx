// app/(platform)/dashboard/page.tsx
// VERSIÓN: 7.0 (The Intelligence Command Suite - Operational Excellence Edition)
// Misión: Punto de entrada táctico. Gestiona el espacio mediante estados dinámicos y jerarquía visual de élite.
// [FIX]: Resolución de error 'ResonanceProfile' y optimización de escala visual.

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
 * [DEFINICIÓN DE TIPOS ESTRICTOS]
 * Resolvemos el error de compilación asegurando que los alias de tipo existan antes de su uso.
 */
type ResonanceProfile = Tables<'user_resonance_profiles'>;

interface DiscoveryFeed {
  epicenter: PodcastWithProfile[] | null;
  semantic_connections: PodcastWithProfile[] | null;
  new_horizons: PodcastWithProfile[] | null;
}

/**
 * [SHIELD]: HIDRATACIÓN ESCALONADA
 * Cargamos el Mapa Panorámico de forma diferida para liberar el hilo principal de la GPU.
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

/**
 * sanitizePodcasts
 * Procesa la respuesta de PostgreSQL para asegurar consistencia en los objetos JSONB del feed.
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
 * DashboardPage: La terminal de entrada de NicePod V2.5.
 */
export default async function DashboardPage() {
  const supabase = createClient();
  
  // 1. PROTOCOLO DE IDENTIDAD (Validación en el Servidor)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
      redirect("/login");
  }

  // 2. RECOPILACIÓN DE INTELIGENCIA PARALELA
  // Ejecutamos todas las consultas en una sola ráfaga para minimizar latencia.
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

  // Preparación de datos seguros para los estantes de contenido
  const safeEpicenter = sanitizePodcasts(feed?.epicenter || []);
  const safeConnections = sanitizePodcasts(feed?.semantic_connections || []);

  return (
    <main className="container mx-auto max-w-screen-xl min-h-screen px-4 lg:px-6 overflow-x-hidden">
      
      {/* MALLA ESTRUCTURAL DE LA PLATAFORMA */}
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12 pt-6 pb-24">
        
        {/* COLUMNA CENTRAL (CENTRO DE OPERACIONES) */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* SECCIÓN I: COMMAND BAR DINÁMICA
              El saludo es sutil. El buscador (DiscoveryHub) se expandirá para cubrirlo al activarse.
          */}
          <header className="relative w-full min-h-[90px] flex items-center justify-between z-30">
            
            {/* SALUDO DE IDENTIDAD (Capa Inferior) */}
            <div className="flex flex-col justify-center animate-in fade-in duration-1000">
              <div className="flex items-center gap-2 mb-1.5 opacity-60">
                <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">
                  Sincronía Nominal
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic leading-none">
                Hola, <span className="text-primary not-italic">{userName}</span>
              </h1>
            </div>

            {/* ORQUESTADOR DE BÚSQUEDA Y RESULTADOS
                Posicionado absolutamente para permitir la expansión física sobre el saludo.
            */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full flex justify-end pointer-events-none">
                <div className="pointer-events-auto w-full max-w-full">
                    <DiscoveryHub 
                        userName={userName} 
                        showShelvesOnNoSearch={true}
                        epicenterPodcasts={safeEpicenter}
                        connectionsPodcasts={safeConnections}
                    />
                </div>
            </div>

          </header>

          {/* SECCIÓN II: PORTAL MADRID RESONANCE (Banner Panorámico)
              Altura reducida para liberar el scroll y mostrar conocimiento de inmediato.
          */}
          <section className="relative rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border border-white/5 bg-zinc-950 shadow-2xl transition-all duration-700 hover:border-primary/20">
            <div className="h-[140px] md:h-[180px] w-full relative z-0">
              <MapPreviewFrame />
            </div>
            
            {/* Capa de atmósfera y profundidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none z-10" />
            
            {/* HUD de localización integrado */}
            <div className="absolute bottom-4 left-6 z-20 flex items-center gap-3">
                <div className="p-2 bg-primary/20 backdrop-blur-xl rounded-xl border border-primary/30">
                    <MapIcon size={14} className="text-primary" />
                </div>
                <h3 className="text-white font-black text-xs md:text-sm uppercase tracking-tighter italic drop-shadow-lg leading-none">
                    Madrid <span className="text-primary">Live Resonance</span>
                </h3>
            </div>
          </section>

          {/* [INTEGRACIÓN TÁCTICA]: 
              El contenido de categorías y estantes ahora se gestiona dentro del DiscoveryHub (V9.0)
              para garantizar que desaparezcan de forma atómica cuando el usuario realiza una búsqueda.
          */}

        </div>

        {/* COLUMNA LATERAL (TERMINAL DE MÉTRICAS) */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[7.5rem] space-y-8">
            
            {/* Card de Objetivo Curatorial */}
            <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 backdrop-blur-md relative overflow-hidden group shadow-xl shadow-primary/5">
                <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000">
                    <Globe size={70} className="text-primary" />
                </div>
                <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-2">
                        <BrainCircuit size={14} className="text-primary" />
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Estado de Misión</p>
                    </div>
                    <h4 className="font-bold text-sm text-foreground leading-snug tracking-tight">
                        Tu Bóveda se expande con cada crónica. Ancla conocimiento en el mapa para aumentar tu resonancia comunitaria.
                    </h4>
                    <Link 
                        href="/create" 
                        className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:translate-x-1 transition-transform"
                    >
                        Iniciar Nueva Forja <ChevronRight size={12} />
                    </Link>
                </div>
            </div>

            {/* Panel de Insights Semánticos del Usuario */}
            <InsightPanel resonanceProfile={resonanceProfile} />
            
            {/* Indicador de Versión y Salud de Red */}
            <div className="p-10 text-center bg-white/[0.02] rounded-[3rem] border border-white/5 flex flex-col items-center space-y-5 shadow-inner">
                <div className="h-8 w-8 relative opacity-20 hover:opacity-50 transition-opacity">
                    <Image 
                      src="/nicepod-logo.png" 
                      alt="NicePod" 
                      fill 
                      className="object-contain grayscale"
                    />
                </div>
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.5em]">Intelligence Shell V2.5</p>
                    <div className="flex items-center gap-1.5 justify-center">
                        <Activity size={10} className="text-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-widest">Neural Link OK</span>
                    </div>
                </div>
            </div>

          </div>
        </aside>

      </div>
      
      {/* GATILLO DE CREACIÓN FLOTANTE */}
      <FloatingActionButton />
    </main>
  );
}