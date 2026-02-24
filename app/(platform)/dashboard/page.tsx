// app/(platform)/dashboard/page.tsx
// VERSIÓN: 11.0

"use client";

import {
  ChevronRight,
  Globe,
  Loader2,
  Map as MapIcon,
  Terminal
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

// --- NUEVA INFRAESTRUCTURA DE INTELIGENCIA UNIFICADA ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { SearchResult } from "@/hooks/use-search-radar";

// --- COMPONENTES SATELLITES ---
import { InsightPanel } from "@/components/insight-panel";
import { IntelligenceFeed } from "@/components/intelligence-feed";
import { FloatingActionButton } from "@/components/ui/floating-action-button";

// --- HOOKS Y TIPOS ---
import { useAuth } from "@/hooks/use-auth";
import type { Tables } from "@/types/supabase";

/**
 * [SHIELD]: HIDRATACIÓN DIFERIDA (T2)
 * El Mapa panorámico es un activo de alta carga de GPU. 
 * Se carga con ssr: false para evitar discrepancias de hidratación.
 */
const MapPreviewFrame = dynamic(
  () => import("@/components/geo/map-preview-frame").then((mod) => mod.MapPreviewFrame),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full rounded-[2rem] md:rounded-[3rem] bg-zinc-900/50 border border-white/5 animate-pulse flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary/20" />
      </div>
    )
  }
);

type ResonanceProfile = Tables<'user_resonance_profiles'>;

interface DiscoveryFeed {
  epicenter: any[] | null;
  semantic_connections: any[] | null;
}

/**
 * COMPONENTE: DashboardPage
 * La Workstation de control central de NicePod V2.5.
 */
export default function DashboardPage() {
  const { supabase, profile, isAuthenticated, isInitialLoading } = useAuth();

  // --- ESTADO DE INTELIGENCIA DE BÚSQUEDA ---
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [currentQuery, setCurrentQuery] = useState<string>("");

  // --- ESTADO DE DATOS E INFRAESTRUCTURA ---
  const [feed, setFeed] = useState<DiscoveryFeed>({ epicenter: [], semantic_connections: [] });
  const [resonanceProfile, setResonanceProfile] = useState<ResonanceProfile | null>(null);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  /**
   * [EFECTO]: CAPTURA DE INTELIGENCIA INICIAL
   * Realizamos un fetch paralelo para minimizar el TTFB percibido.
   */
  useEffect(() => {
    async function loadDashboardData() {
      if (!isAuthenticated || !profile?.id || !supabase) return;

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
   * [OPTIMIZACIÓN]: Memoización de Podcasts
   * Saneamos los datos solo cuando el feed cambia para evitar Forced Reflows.
   */
  const safeEpicenter = useMemo(() => {
    if (!feed.epicenter || !Array.isArray(feed.epicenter)) return [];
    return feed.epicenter.map((pod) => ({
      ...pod,
      creation_data: typeof pod.creation_data === 'string' ? JSON.parse(pod.creation_data) : pod.creation_data || null,
      ai_tags: Array.isArray(pod.ai_tags) ? pod.ai_tags : [],
      sources: Array.isArray(pod.sources) ? pod.sources : [],
    })).filter((p) => p.id);
  }, [feed.epicenter]);

  const safeConnections = useMemo(() => {
    if (!feed.semantic_connections || !Array.isArray(feed.semantic_connections)) return [];
    return feed.semantic_connections.map((pod) => ({
      ...pod,
      creation_data: typeof pod.creation_data === 'string' ? JSON.parse(pod.creation_data) : pod.creation_data || null,
      ai_tags: Array.isArray(pod.ai_tags) ? pod.ai_tags : [],
      sources: Array.isArray(pod.sources) ? pod.sources : [],
    })).filter((p) => p.id);
  }, [feed.semantic_connections]);

  /**
   * handleResults: Receptor de impactos del Radar Unificado.
   */
  const handleResults = useCallback((results: SearchResult[]) => {
    setSearchResults(results);
  }, []);

  /**
   * handleClear: Restablece el flujo original de la Workstation.
   */
  const handleClear = useCallback(() => {
    setSearchResults([]);
    setIsSearching(false);
    setCurrentQuery("");
  }, []);

  // --- PROTECCIÓN DE HIDRATACIÓN ---
  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 animate-pulse">
            Sincronizando Intelligence Shell
          </span>
        </div>
      </div>
    );
  }

  const userName = profile?.full_name?.split(' ')[0] || "Curador";

  return (
    <main className="container mx-auto max-w-screen-xl min-h-screen px-4 lg:px-6 selection:bg-primary/20">

      {/* GRID DE OPERACIONES TÁCTICAS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-10 pt-6 pb-24">

        {/* COLUMNA PRINCIPAL DE INTELIGENCIA (3/4) */}
        <div className="lg:col-span-3 space-y-10">

          {/* SECCIÓN I: COMMAND HEADER (UNIFIED RADAR) */}
          <header className="relative w-full min-h-[140px] flex items-center justify-between z-40">

            {/* SALUDO SOBERANO */}
            <div className="flex flex-col justify-center animate-in fade-in slide-in-from-left-6 duration-1000">
              <div className="flex items-center gap-2 mb-3 opacity-60">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_12px_rgba(139,92,246,0.8)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
                  Frecuencia Nominal Activa
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic leading-none">
                Hola, <span className="text-primary not-italic">{userName}</span>
              </h1>
            </div>

            {/* 
                INYECCIÓN DEL RADAR UNIFICADO:
                Sustituye a SearchStation. variant="console" para estética HUD.
            */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full flex justify-end pointer-events-none">
              <div className="pointer-events-auto w-full max-w-xl">
                <UnifiedSearchBar
                  variant="console"
                  placeholder={`¿Qué conocimiento buscas hoy, ${userName}?`}
                  onResults={handleResults}
                  onLoading={setIsSearching}
                  onClear={handleClear}
                />
              </div>
            </div>
          </header>

          {/* SECCIÓN II: PORTAL PANORÁMICO MADRID */}
          <section className="relative rounded-[3rem] md:rounded-[4rem] overflow-hidden border border-white/5 bg-zinc-950 shadow-2xl transition-all duration-700 hover:border-primary/20 group">
            <div className="h-[180px] md:h-[240px] w-full relative z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-1000">
              <MapPreviewFrame />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-transparent pointer-events-none z-10" />

            <div className="absolute bottom-8 left-10 z-20 flex items-center gap-5">
              <div className="p-4 bg-primary/20 backdrop-blur-3xl rounded-[1.5rem] border border-primary/30 shadow-inner group-hover:scale-110 transition-transform duration-700">
                <MapIcon size={20} className="text-primary" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-white font-black text-sm md:text-lg uppercase tracking-tighter italic drop-shadow-2xl">
                  Madrid <span className="text-primary">Live Resonance</span>
                </h3>
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.3em]">Malla Urbana de Memorias</p>
              </div>
            </div>
          </section>

          {/* ESTACIÓN III: FEED DE INTELIGENCIA */}
          <div className="relative z-0 min-h-[400px]">
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

        {/* COLUMNA LATERAL (Telemetry & Insights) */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[8rem] space-y-10 flex flex-col h-fit">

            {/* FICHA DE MISIÓN */}
            <div className="p-10 bg-primary/5 rounded-[3rem] border border-primary/10 backdrop-blur-2xl relative overflow-hidden group shadow-2xl">
              <div className="absolute -top-10 -right-10 p-4 opacity-[0.04] group-hover:rotate-12 group-hover:scale-150 transition-all duration-1000">
                <Globe size={120} className="text-primary" />
              </div>
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-3">
                  <Terminal size={14} className="text-primary" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Status: Sync</p>
                </div>
                <h4 className="font-bold text-lg text-foreground leading-tight tracking-tight">
                  Tu capital intelectual se expande. Fortalece la frecuencia de la ciudad.
                </h4>
                <Link
                  href="/create"
                  className="group/btn inline-flex items-center gap-4 text-[11px] font-black text-primary uppercase tracking-[0.3em] transition-all hover:gap-6"
                >
                  <span>INICIAR FORJA</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            <InsightPanel resonanceProfile={resonanceProfile} />

            {/* FOOTER DE SHELL */}
            <div className="p-12 text-center bg-white/[0.02] rounded-[4rem] border border-white/5 flex flex-col items-center space-y-5 shadow-inner">
              <div className="h-14 w-14 relative opacity-20 hover:opacity-50 transition-all duration-700 hover:scale-110">
                <Image src="/nicepod-logo.png" alt="NicePod" fill className="object-contain grayscale" />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.6em]">NicePod V2.5</p>
                <div className="flex items-center gap-2 justify-center opacity-40">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Neural Link Nominal</span>
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