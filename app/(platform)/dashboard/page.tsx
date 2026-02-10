// app/(platform)/dashboard/page.tsx
// VERSIÓN: 10.1 (The Intelligence Command Suite - Final Sync Edition)
// Misión: Punto de entrada soberano. Orquesta la búsqueda dinámica y el feed de conocimiento.
// [AUDITORÍA]: Resolución de inyección de datos, estabilidad de tipos y jerarquía de capas.

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { SearchStation, type SearchResult } from "@/components/geo/SearchStation";
import { IntelligenceFeed } from "@/components/IntelligenceFeed";
import { InsightPanel } from "@/components/insight-panel";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { useAuth } from "@/hooks/use-auth";
import { 
    Loader2, 
    Zap, 
    BrainCircuit, 
    Globe, 
    Activity,
    ChevronRight,
    Map as MapIcon,
    Terminal
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { PodcastWithProfile } from "@/types/podcast";
import type { Tables } from "@/types/supabase";

/**
 * [SHIELD]: HIDRATACIÓN ESCALONADA (T2)
 * El Mapa panorámico se carga de forma diferida para no bloquear la interactividad.
 */
const MapPreviewFrame = dynamic(
  () => import("@/components/geo/map-preview-frame").then((mod) => mod.MapPreviewFrame),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-[140px] md:h-[180px] rounded-[2rem] md:rounded-[3rem] bg-zinc-900/50 border border-white/5 animate-pulse flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary/20" />
      </div>
    )
  }
);

/**
 * [TYPES]: Definiciones de integridad para el motor de TypeScript.
 */
type ResonanceProfile = Tables<'user_resonance_profiles'>;

interface DiscoveryFeed {
  epicenter: PodcastWithProfile[] | null;
  semantic_connections: PodcastWithProfile[] | null;
}

/**
 * sanitizePodcasts
 * Procesa la respuesta de Supabase para asegurar consistencia en los objetos JSONB.
 */
function sanitizePodcasts(podcasts: any[] | null): PodcastWithProfile[] {
  if (!podcasts || !Array.isArray(podcasts)) {
      return [];
  }
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
 * DashboardPage: La terminal de mando central de NicePod V2.5.
 */
export default function DashboardPage() {
  const { supabase, profile, isAuthenticated, isInitialLoading } = useAuth();
  
  // --- ESTADO DE INTELIGENCIA (Lifted State) ---
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [currentQuery, setCurrentQuery] = useState<string>("");

  // --- ESTADO DE DATOS BASE ---
  const [feed, setFeed] = useState<DiscoveryFeed>({ epicenter: [], semantic_connections: [] });
  const [resonanceProfile, setResonanceProfile] = useState<ResonanceProfile | null>(null);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  /**
   * [EFECTO]: CARGA DE INTELIGENCIA INICIAL
   * Recupera los datos del feed y resonancia al montar el componente.
   */
  useEffect(() => {
    async function loadDashboardData() {
        if (!isAuthenticated || !profile?.id) return;
        
        try {
            const [
                { data: feedData },
                { data: resonanceData }
            ] = await Promise.all([
                supabase.rpc('get_user_discovery_feed', { p_user_id: profile.id }),
                supabase.from('user_resonance_profiles').select('*').eq('user_id', profile.id).maybeSingle()
            ]);

            setFeed(feedData as DiscoveryFeed);
            setResonanceProfile(resonanceData as ResonanceProfile);
        } catch (error) {
            console.error("🔥 [Dashboard-Data-Fail]:", error);
        } finally {
            setIsDataLoading(false);
        }
    }

    loadDashboardData();
  }, [isAuthenticated, profile?.id, supabase]);

  /**
   * handleResults: Receptor de impactos semánticos de la SearchStation.
   */
  const handleResults = useCallback((results: SearchResult[]) => {
    setSearchResults(results);
  }, []);

  /**
   * handleClear: Restablece el flujo de datos original.
   */
  const handleClear = useCallback(() => {
    setSearchResults([]);
    setIsSearching(false);
    setCurrentQuery("");
  }, []);

  // --- PROTECCIÓN DE HIDRATACIÓN ---
  if (isInitialLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
          </div>
      );
  }

  const userName = profile?.full_name?.split(' ')[0] || "Curador";
  const safeEpicenter = sanitizePodcasts(feed.epicenter);
  const safeConnections = sanitizePodcasts(feed.semantic_connections);

  return (
    <main className="container mx-auto max-w-screen-xl min-h-screen px-4 lg:px-6">
      
      {/* GRID DE TRABAJO TÁCTICO */}
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-10 pt-6 pb-24">
        
        {/* COLUMNA DE OPERACIONES (3/4) */}
        <div className="lg:col-span-3 space-y-10">
          
          {/* SECCIÓN I: COMMAND HEADER (Capa de Control)
              [FIX ESTRUCTURAL]: min-h reserva el espacio físico del saludo.
          */}
          <header className="relative w-full min-h-[100px] md:min-h-[120px] flex items-center justify-between z-40 bg-transparent">
            
            {/* SALUDO DE IDENTIDAD */}
            <div className="flex flex-col justify-center animate-in fade-in duration-1000">
              <div className="flex items-center gap-2 mb-1.5 opacity-60">
                <div className="h-1 w-1 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">
                  Sincronía Nominal Activa
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic leading-none">
                Hola, <span className="text-primary not-italic">{userName}</span>
              </h1>
            </div>

            {/* ESTACIÓN 1: BÚSQUEDA (Capa de Cobertura)
                Se expande físicamente sobre el saludo gracias a su z-index superior.
            */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full flex justify-end pointer-events-none">
                <div className="pointer-events-auto w-full">
                    <SearchStation 
                        userName={userName}
                        onResults={handleResults}
                        onLoading={setIsSearching}
                        onClear={handleClear}
                    />
                </div>
            </div>
          </header>

          {/* SECCIÓN II: PORTAL MADRID (Banner Panorámico)
              [FIX VISUAL]: Gradiente suavizado para visibilidad total.
          */}
          <section className="relative rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border border-white/5 bg-zinc-950 shadow-2xl transition-all duration-700 hover:border-primary/20 group">
            <div className="h-[140px] md:h-[180px] w-full relative z-0 opacity-50 group-hover:opacity-70 transition-opacity">
              <MapPreviewFrame />
            </div>
            
            {/* Capa de atmósfera integrada (transparencia del 60% en base) */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none z-10" />
            
            <div className="absolute bottom-4 left-8 z-20 flex items-center gap-4">
                <div className="p-2.5 bg-primary/20 backdrop-blur-xl rounded-2xl border border-primary/30 shadow-inner">
                    <MapIcon size={16} className="text-primary" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-white font-black text-xs md:text-sm uppercase tracking-tighter italic drop-shadow-lg">
                      Madrid <span className="text-primary">Live Resonance</span>
                  </h3>
                </div>
            </div>
          </section>

          {/* 
              ESTACIÓN 2: FEED DE INTELIGENCIA (Capa de Contenido)
              [FIX]: Ahora pasamos safeEpicenter y safeConnections correctamente.
          */}
          <div className="relative z-0">
              <IntelligenceFeed 
                  userName={userName}
                  isSearching={isSearching}
                  results={searchResults}
                  lastQuery={currentQuery}
                  epicenterPodcasts={safeEpicenter}
                  connectionsPodcasts={safeConnections}
                  onClear={handleClear}
              />
          </div>

        </div>

        {/* COLUMNA LATERAL (Soberanía y Telemetría) */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[8rem] space-y-8 flex flex-col h-fit">
            
            {/* Ficha de Misión Curatorial */}
            <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 backdrop-blur-md relative overflow-hidden group shadow-xl">
                <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000">
                    <Globe size={70} className="text-primary" />
                </div>
                <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-primary" />
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Estado de Misión</p>
                    </div>
                    <h4 className="font-bold text-sm text-foreground leading-snug tracking-tight">
                        Tu Bóveda se expande con cada crónica. Fortalece la memoria de Madrid anclando tus ideas.
                    </h4>
                    <Link 
                        href="/create" 
                        className="group/btn flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest transition-all"
                    >
                        <span>INICIAR FORJA</span>
                        <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Panel de Insights (Pasamos el estado de resonancia real) */}
            <InsightPanel resonanceProfile={resonanceProfile} />
            
            {/* Branding Técnico de NicePod */}
            <div className="p-10 text-center bg-white/[0.01] rounded-[3rem] border border-white/5 flex flex-col items-center space-y-4 shadow-inner">
                <div className="h-10 w-10 relative opacity-20 hover:opacity-50 transition-opacity">
                    <Image 
                      src="/nicepod-logo.png" 
                      alt="NicePod" 
                      fill 
                      className="object-contain grayscale"
                    />
                </div>
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">Intelligence Shell V2.5.21</p>
                    <div className="flex items-center gap-1.5 justify-center opacity-40">
                        <Zap size={10} className="text-emerald-500" />
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Neural Sync OK</span>
                    </div>
                </div>
            </div>

          </div>
        </aside>

      </div>
      
      {/* TRIGGER UNIVERSAL DE CREACIÓN */}
      <FloatingActionButton />
    </main>
  );
}