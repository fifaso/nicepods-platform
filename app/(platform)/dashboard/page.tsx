// app/(platform)/dashboard/page.tsx
// VERSIÓN: 5.0 (The Intelligence Command Suite - Unified Search & Space Mastery)
// Misión: Orquestar el punto de entrada operativo con un estado de búsqueda sincronizado.
// [FIX]: Se unifica DiscoveryHub para que el buscador en el header y los resultados en el cuerpo compartan el mismo estado.

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
 * [SHIELD]: CARGA DIFERIDA DE COMPONENTES DE ALTO CONSUMO (GPU/RAM)
 * El Mapa 3D se carga solo en el cliente para evitar errores de hidratación.
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
 * [SHIELD]: ESTANTE DE PODCASTS
 * Se mantiene dinámico para asegurar que el scroll inicial sea ligero.
 */
const PodcastShelf = dynamic(
  () => import("@/components/podcast-shelf").then((mod) => mod.PodcastShelf),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-32 bg-white/[0.01] rounded-[2rem] border border-dashed border-white/5 flex items-center justify-center">
        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/5 animate-pulse">Sincronizando Malla de Audio</span>
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
 * Procesa la respuesta de PostgreSQL para asegurar consistencia en los objetos JSONB.
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
 * DashboardPage: Terminal de mando central de NicePod V2.5.
 */
export default async function DashboardPage() {
  const supabase = createClient();
  
  // 1. VALIDACIÓN DE SOBERANÍA (Auth Guard)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
      redirect("/login");
  }

  // 2. ADQUISICIÓN DE INTELIGENCIA (Parallel Fetch Strategy)
  const [
    { data: feedData },
    { data: resonanceData },
    { data: profileData }
  ] = await Promise.all([
    supabase.rpc('get_user_discovery_feed', { p_user_id: user.id }),
    supabase.from('user_resonance_profiles').select('*').eq('id', user.id).single(),
    supabase.from('profiles').select('full_name, reputation_score').eq('id', user.id).single()
  ]);

  const feed = feedData as DiscoveryFeed;
  const resonanceProfile = resonanceData as ResonanceProfile;
  const userName = profileData?.full_name?.split(' ')[0] || "Curador";

  const safeEpicenter = sanitizePodcasts(feed?.epicenter || []);
  const safeConnections = sanitizePodcasts(feed?.semantic_connections || []);

  return (
    <main className="container mx-auto max-w-screen-xl min-h-screen px-4 lg:px-6 overflow-x-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12 pt-6 pb-24">
        
        {/* COLUMNA CENTRAL: SISTEMA OPERATIVO */}
        <div className="lg:col-span-3 space-y-10">
          
          {/* SECCIÓN I: CABECERA DINÁMICA
              [ESTRATEGIA]: El saludo y la búsqueda comparten un contenedor relativo.
          */}
          <div className="relative w-full min-h-[80px] flex items-center justify-between">
            
            {/* SALUDO SUTIL (Capa inferior) */}
            <header className="flex flex-col justify-center animate-in fade-in duration-1000">
              <div className="flex items-center gap-2 mb-1 opacity-60">
                <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">
                  Sincronía Estable
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
                Hola, <span className="text-primary not-italic">{userName}</span>
              </h1>
            </header>

            {/* [DISCOVERY HUB ÚNICO]: Orquestador de Búsqueda y Resultados
                Este componente manejará su propio botón de expansión que cubrirá el saludo de arriba.
            */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full flex justify-end">
                <DiscoveryHub 
                  userName={userName} 
                  showShelvesOnNoSearch={true}
                  epicenterPodcasts={safeEpicenter}
                  connectionsPodcasts={safeConnections}
                />
            </div>

          </div>

          {/* SECCIÓN II: MAPA PANORÁMICO MADRID 3D
              Ubicado debajo de la línea de comando para actuar como un portal visual persistente.
          */}
          <section className="relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-zinc-950 shadow-2xl transition-all duration-700 hover:border-primary/20">
            <div className="h-[140px] md:h-[180px] w-full">
              <MapPreviewFrame />
            </div>
            {/* Capa de atmósfera integrada */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none z-10" />
            <div className="absolute bottom-4 left-6 z-20 flex items-center gap-3">
                <div className="p-2 bg-primary/20 backdrop-blur-xl rounded-xl border border-primary/30">
                    <MapIcon size={14} className="text-primary" />
                </div>
                <h3 className="text-white font-black text-sm md:text-lg uppercase tracking-tighter italic leading-none drop-shadow-lg">
                    Madrid <span className="text-primary">Live Resonance</span>
                </h3>
            </div>
          </section>

          {/* [NOTA]: El contenido de categorías y estantes ahora vive dentro del DiscoveryHub (V9.0)
              para asegurar que desaparezcan cuando el usuario realiza una búsqueda.
          */}

        </div>

        {/* COLUMNA LATERAL: MÉTRICAS Y SOBERANÍA */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[7.5rem] space-y-8">
            
            {/* Tarjeta de Misión de Curaduría */}
            <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 backdrop-blur-md relative overflow-hidden group shadow-xl">
                <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000">
                    <Globe size={70} className="text-primary" />
                </div>
                <div className="space-y-4 relative z-10">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Objetivo de Inteligencia</p>
                    <h4 className="font-bold text-sm text-foreground leading-snug tracking-tight">
                        Expande tu huella en el mapa. Cada crónica anclada fortalece la memoria colectiva de Madrid.
                    </h4>
                    <Link href="/create" className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:translate-x-1 transition-transform">
                        Iniciar Nueva Forja <ChevronRight size={12} />
                    </Link>
                </div>
            </div>

            {/* Panel de Gráficos NKV (Perspectiva de Datos) */}
            <InsightPanel resonanceProfile={resonanceProfile} />
            
            {/* Branding Sutil y Versión */}
            <div className="p-8 text-center bg-white/[0.02] rounded-[2.5rem] border border-white/5 flex flex-col items-center space-y-4 shadow-inner">
                <div className="h-8 w-8 relative opacity-20 hover:opacity-40 transition-opacity">
                    <Image 
                      src="/nicepod-logo.png" 
                      alt="NicePod" 
                      fill 
                      className="object-contain grayscale"
                    />
                </div>
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">Intelligence Shell V2.5</p>
                    <div className="flex items-center gap-1.5 justify-center">
                        <Activity size={10} className="text-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-widest">Protocolo Witness Activo</span>
                    </div>
                </div>
            </div>

          </div>
        </aside>

      </div>
      
      {/* GATILLO UNIVERSAL DE CREACIÓN */}
      <FloatingActionButton />
    </main>
  );
}