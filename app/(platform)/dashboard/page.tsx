// app/(platform)/dashboard/page.tsx
// VERSIÓN: 13.0

"use client";

import {
  Loader2,
  Map as MapIcon,
  PlusCircle,
  Terminal
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

// --- INFRAESTRUCTURA DE INTELIGENCIA UNIFICADA ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { SearchResult } from "@/hooks/use-search-radar";

// --- COMPONENTES SATÉLITES (Malla UI) ---
import { InsightPanel } from "@/components/insight-panel";
import { IntelligenceFeed } from "@/components/intelligence-feed";
import { FloatingActionButton } from "@/components/ui/floating-action-button";

// --- HOOKS Y TIPOS SOBERANOS ---
import { useAuth } from "@/hooks/use-auth";
import type { Tables } from "@/types/supabase";

/**
 * [SHIELD]: HIDRATACIÓN DIFERIDA (T2)
 * El Mapa panorámico es un activo de alta carga de GPU. 
 */
const MapPreviewFrame = dynamic(
  () => import("@/components/geo/map-preview-frame").then((mod) => mod.MapPreviewFrame),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full rounded-[2.5rem] bg-zinc-900/50 border border-white/5 animate-pulse flex items-center justify-center">
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
 * El epicentro de control y descubrimiento de la Workstation NicePod V2.5.
 */
export default function DashboardPage() {
  const { supabase, profile, isAuthenticated, isInitialLoading } = useAuth();

  // --- ESTADO DE INTELIGENCIA DE BÚSQUEDA ---
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // --- ESTADO DE DATOS E INFRAESTRUCTURA ---
  const [feed, setFeed] = useState<DiscoveryFeed>({ epicenter: [], semantic_connections: [] });
  const [resonanceProfile, setResonanceProfile] = useState<ResonanceProfile | null>(null);

  /**
   * [EFECTO]: CAPTURA DE INTELIGENCIA INICIAL
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
      }
    }
    loadDashboardData();
  }, [isAuthenticated, profile?.id, supabase]);

  const safeEpicenter = useMemo(() => {
    if (!feed.epicenter || !Array.isArray(feed.epicenter)) return [];
    return feed.epicenter.map((pod) => ({
      ...pod,
      creation_data: typeof pod.creation_data === 'string' ? JSON.parse(pod.creation_data) : pod.creation_data || null,
      ai_tags: Array.isArray(pod.ai_tags) ? pod.ai_tags : [],
    })).filter((p) => p.id);
  }, [feed.epicenter]);

  const safeConnections = useMemo(() => {
    if (!feed.semantic_connections || !Array.isArray(feed.semantic_connections)) return [];
    return feed.semantic_connections.map((pod) => ({
      ...pod,
      creation_data: typeof pod.creation_data === 'string' ? JSON.parse(pod.creation_data) : pod.creation_data || null,
      ai_tags: Array.isArray(pod.ai_tags) ? pod.ai_tags : [],
    })).filter((p) => p.id);
  }, [feed.semantic_connections]);

  const handleResults = useCallback((results: SearchResult[]) => {
    setSearchResults(results);
  }, []);

  const handleClear = useCallback(() => {
    setSearchResults([]);
    setIsSearching(false);
  }, []);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    );
  }

  const userName = profile?.full_name?.split(' ')[0] || "Curador";

  return (
    <main className="container mx-auto max-w-screen-xl min-h-screen px-4 lg:px-8 selection:bg-primary/20">

      {/* GRID DE OPERACIONES */}
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-14 pt-8 pb-32">

        {/* COLUMNA PRINCIPAL (3/4) */}
        <div className="lg:col-span-3 space-y-12">

          {/* SECCIÓN I: MINIMALIST COMMAND HEADER 
              [MEJORA]: Se reduce el tamaño y se eliminan etiquetas ruidosas.
          */}
          <header className="relative w-full flex items-center justify-between z-40 bg-transparent py-4 border-b border-border/5">

            {/* SALUDO MINIMALISTA: 
                Utiliza text-muted-foreground para el "Hola" y foreground para el nombre, 
                asegurando contraste perfecto en modo claro y oscuro.
            */}
            <div className="flex items-baseline gap-2 animate-in fade-in duration-1000">
              <h1 className="text-xl md:text-2xl font-medium tracking-tight text-muted-foreground">
                Hola, <span className="text-foreground font-black uppercase tracking-tighter italic">{userName}</span>
              </h1>
            </div>

            {/* RADAR UNIFICADO (TRIMMED) 
                Solo el disparador de búsqueda, sin textos explicativos.
            */}
            <div className="flex items-center">
              <UnifiedSearchBar
                onResults={handleResults}
                onLoading={setIsSearching}
                onClear={handleClear}
                placeholder="Rastrear en la Bóveda..."
              />
            </div>
          </header>

          {/* SECCIÓN II: PORTAL PANORÁMICO MADRID 
              [MEJORA]: Se reduce el radio de borde y se suaviza la opacidad.
          */}
          <section className="relative rounded-[2rem] overflow-hidden border border-border/40 bg-zinc-950/50 shadow-xl transition-all duration-1000 group">
            <div className="h-[140px] md:h-[180px] w-full relative z-0 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
              <MapPreviewFrame />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />

            <div className="absolute bottom-6 left-8 z-20 flex items-center gap-4">
              <div className="p-2.5 bg-primary/10 backdrop-blur-md rounded-xl border border-primary/20">
                <MapIcon size={16} className="text-primary" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-foreground font-black text-[11px] uppercase tracking-widest italic">
                  Madrid <span className="text-primary">Resonance</span>
                </h3>
              </div>
            </div>
          </section>

          {/* ESTACIÓN III: FEED DE INTELIGENCIA */}
          <div className="relative z-0 min-h-[500px]">
            <IntelligenceFeed
              userName={userName}
              isSearching={isSearching}
              results={searchResults}
              lastQuery=""
              epicenterPodcasts={safeEpicenter}
              connectionsPodcasts={safeConnections}
              onClear={handleClear}
            />
          </div>

        </div>

        {/* COLUMNA LATERAL (Aside) */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[7rem] space-y-10 flex flex-col h-fit">

            {/* FICHA DE MISIÓN MINIMALISTA */}
            <div className="p-8 bg-card/40 rounded-[2rem] border border-border/40 backdrop-blur-md relative overflow-hidden group shadow-lg">
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-2.5">
                  <Terminal size={14} className="text-primary/60" />
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Soberanía</p>
                </div>

                <h4 className="font-bold text-base text-foreground leading-snug">
                  Tu capital intelectual se expande. Fortalece la frecuencia.
                </h4>

                <Link
                  href="/create"
                  className="inline-flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:text-primary/80 transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>INICIAR FORJA</span>
                </Link>
              </div>
            </div>

            <InsightPanel resonanceProfile={resonanceProfile} />

            {/* STATUS DE RED DISCRETO */}
            <div className="p-8 text-center bg-white/[0.01] rounded-[2.5rem] border border-border/20 flex flex-col items-center space-y-4 shadow-sm">
              <div className="h-10 w-10 relative opacity-10 grayscale">
                <Image src="/nicepod-logo.png" alt="NicePod" fill className="object-contain" />
              </div>
              <div className="flex items-center gap-2 justify-center px-4 py-1 rounded-full bg-emerald-500/5">
                <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-[0.4em]">Link Nominal</span>
              </div>
            </div>

          </div>
        </aside>

      </div>

      <FloatingActionButton />
    </main>
  );
}