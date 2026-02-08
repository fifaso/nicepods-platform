// app/(platform)/dashboard/page.tsx
// VERSIÓN: 8.0 (The Intelligence Command Suite - Operational Excellence)
// Misión: Terminal de mando central. Orquesta el saludo, la búsqueda expansiva y el banner geospacial.
// [FIX]: Resolución de error 'PodcastShelf' y estabilización de la jerarquía de capas.

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
 * [TYPES]: Definiciones de integridad para el compilador de Next.js.
 */
type ResonanceProfile = Tables<'user_resonance_profiles'>;

interface DiscoveryFeed {
  epicenter: PodcastWithProfile[] | null;
  semantic_connections: PodcastWithProfile[] | null;
  new_horizons: PodcastWithProfile[] | null;
}

/**
 * [SHIELD]: HIDRATACIÓN ESCALONADA
 * El Mapa se carga diferido para no bloquear el hilo principal de la CPU.
 */
const MapPreviewFrame = dynamic(
  () => import("@/components/geo/map-preview-frame").then((mod) => mod.MapPreviewFrame),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-[140px] md:h-[180px] rounded-[2.5rem] bg-zinc-950 border border-white/5 animate-pulse flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary/20" />
      </div>
    )
  }
);

/**
 * sanitizePodcasts
 * Normaliza los datos de Supabase para asegurar que el tipado 'PodcastWithProfile' sea exacto.
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
 * DashboardPage: El punto de entrada soberano para usuarios autenticados.
 */
export default async function DashboardPage() {
  const supabase = createClient();
  
  // 1. VALIDACIÓN DE IDENTIDAD (Handshake en el Servidor)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
      redirect("/login");
  }

  // 2. RECOPILACIÓN DE INTELIGENCIA (Estrategia Paralela)
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

  // Saneamiento de datos para el motor de descubrimiento
  const safeEpicenter = sanitizePodcasts(feed?.epicenter || []);
  const safeConnections = sanitizePodcasts(feed?.semantic_connections || []);

  return (
    <main className="container mx-auto max-w-screen-xl min-h-screen px-4 lg:px-6">
      
      {/* GRID MAESTRO DE LA WORKSTATION */}
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12 pt-4 pb-24">
        
        {/* COLUMNA DE OPERACIONES (Izquierda/Centro) */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* SECCIÓN I: COMMAND BAR DINÁMICA
              Este contenedor tiene una altura mínima garantizada para evitar colapsos visuales.
          */}
          <header className="relative w-full min-h-[90px] md:min-h-[110px] flex items-center justify-between z-40 bg-transparent">
            
            {/* SALUDO DE BIENVENIDA (Sutil y Profesional) */}
            <div className="flex flex-col justify-center animate-in fade-in slide-in-from-left-4 duration-1000">
              <div className="flex items-center gap-2 mb-1.5 opacity-60">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">
                  Sincronía de Red Estable
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
                Hola, <span className="text-primary not-italic">{userName}</span>
              </h1>
            </div>

            {/* BUSCADOR EXPANSIVO (Orquestador Único)
                Se encarga de cubrir el saludo y gestionar el feed dinámicamente.
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

          {/* SECCIÓN II: PORTAL MADRID (Banner Panorámico Elegante)
              Unificado con la identidad visual V2.5.
          */}
          <section className="relative rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border border-white/5 bg-zinc-950 shadow-2xl transition-all duration-700 hover:border-primary/20 group">
            <div className="h-[140px] md:h-[180px] w-full relative z-0 opacity-40 group-hover:opacity-60 transition-opacity">
              <MapPreviewFrame />
            </div>
            
            {/* Capa de profundidad Aurora */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none z-10" />
            
            <div className="absolute bottom-4 left-8 z-20 flex items-center gap-3">
                <div className="p-2 bg-primary/20 backdrop-blur-xl rounded-xl border border-primary/30">
                    <MapIcon size={14} className="text-primary" />
                </div>
                <h3 className="text-white font-black text-xs md:text-sm uppercase tracking-tighter italic drop-shadow-lg leading-none">
                    Madrid <span className="text-primary">Resonance Live</span>
                </h3>
            </div>
          </section>

          {/* NOTA DE ARQUITECTURA: 
              Los estantes de podcasts (Tu Epicentro / Conexiones) se renderizan 
              ahora DENTRO del componente DiscoveryHub (V9.1) para asegurar 
              que el buscador pueda ocultarlos al activarse, evitando el solapamiento.
          */}

        </div>

        {/* COLUMNA LATERAL: INSIGHTS (Derecha) */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[7.5rem] space-y-8">
            
            {/* Card de Misión Táctica */}
            <div className="p-8 bg-primary/5 rounded-[3rem] border border-primary/10 backdrop-blur-md relative overflow-hidden group shadow-xl shadow-primary/5">
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
            
            {/* Branding y Versión */}
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
                </div>
            </div>

          </div>
        </aside>

      </div>
      
      {/* EL GATILLO DE CREACIÓN UNIVERSAL */}
      <FloatingActionButton />
    </main>
  );
}