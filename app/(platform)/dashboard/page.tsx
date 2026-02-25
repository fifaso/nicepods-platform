// app/(platform)/dashboard/page.tsx
// VERSIÓN: 14.0

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Globe,
  Loader2,
  Map as MapIcon,
  Terminal,
  PlusCircle,
  Zap
} from "lucide-react";

// --- INFRAESTRUCTURA DEL RADAR UNIFICADO (V3.0) ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { SearchResult } from "@/hooks/use-search-radar";

// --- COMPONENTES SATÉLITES DE LA MALLA UI ---
import { InsightPanel } from "@/components/insight-panel";
import { IntelligenceFeed } from "@/components/intelligence-feed";
import { FloatingActionButton } from "@/components/ui/floating-action-button";

// --- HOOKS DE IDENTIDAD Y TIPOS ---
import { useAuth } from "@/hooks/use-auth";
import type { Tables } from "@/types/supabase";

/**
 * [SHIELD]: HIDRATACIÓN DIFERIDA (T2)
 * Carga asíncrona del componente WebGL (Mapa) para evitar el bloqueo
 * del hilo principal y erradicar el Cumulative Layout Shift (CLS).
 */
const MapPreviewFrame = dynamic(
  () => import("@/components/geo/map-preview-frame").then((mod) => mod.MapPreviewFrame),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full rounded-[2.5rem] bg-zinc-950/50 border border-white/5 animate-pulse flex items-center justify-center shadow-inner">
        <div className="flex flex-col items-center gap-4 opacity-40">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Sincronizando Malla</span>
        </div>
      </div>
    )
  }
);

/**
 * [CONTRATOS DE DATOS]
 */
type ResonanceProfile = Tables<'user_resonance_profiles'>;

interface DiscoveryFeed {
  epicenter: any[] | null;
  semantic_connections: any[] | null;
}

/**
 * COMPONENTE MAESTRO: DashboardPage
 * El epicentro de operaciones y telemetría de NicePod V2.5.
 */
export default function DashboardPage() {
  // --- IDENTIDAD SOBERANA ---
  const { supabase, profile, isAuthenticated, isInitialLoading } = useAuth();

  // --- ESTADO DE TELEMETRÍA DE BÚSQUEDA ---
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [currentQuery, setCurrentQuery] = useState<string>("");

  // --- ESTADOS NATIVOS DEL DASHBOARD ---
  const [feed, setFeed] = useState<DiscoveryFeed>({ epicenter: [], semantic_connections: [] });
  const [resonanceProfile, setResonanceProfile] = useState<ResonanceProfile | null>(null);

  /**
   * EFECTO INICIAL: DESCARGA ATÓMICA DE BÓVEDA
   * Ejecuta consultas en paralelo para hidratar el feed de inteligencia.
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

  /**
   * OPTIMIZACIÓN (MEMOIZACIÓN):
   * Saneamiento estructurado de JSONB para evitar Forced Reflows en React.
   */
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

  /**
   * PROTOCOLOS DE CONTROL DEL RADAR (Callbacks)
   */
  const handleResults = useCallback((results: SearchResult[]) => {
    setSearchResults(results);
  }, []);

  const handleClear = useCallback(() => {
    setSearchResults([]);
    setIsSearching(false);
    setCurrentQuery("");
  }, []);

  // --- VISTA DE SEGURIDAD (HIDRATACIÓN) ---
  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020202]">
        <div className="flex flex-col items-center gap-6 opacity-60">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white animate-pulse">
            Iniciando Intelligence Shell
          </span>
        </div>
      </div>
    );
  }

  // Extracción limpia del nombre para el saludo.
  const userName = profile?.full_name?.split(' ')[0] || "Curador";

  return (
    <main className="container mx-auto max-w-screen-xl min-h-screen px-4 lg:px-8 selection:bg-primary/30">

      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-14 pt-8 md:pt-12 pb-32">

        {/* --- COLUMNA DE INTELIGENCIA PRINCIPAL (3/4) --- */}
        <div className="lg:col-span-3 space-y-10 md:space-y-14">

          {/* 
              SECCIÓN I: COMMAND HEADER (PURA ELEGANCIA)
              Eliminamos el buscador expansivo y lo dejamos como un gatillo 
              a la derecha, permitiendo que el saludo respire.
          */}
          <header className="w-full flex items-center justify-between z-40 bg-transparent">

            {/* SALUDO SOBERANO MINIMALISTA */}
            <div className="flex flex-col animate-in fade-in slide-in-from-left-6 duration-1000">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none drop-shadow-xl text-muted-foreground/80">
                Hola, <span className="text-foreground">{userName}</span>
              </h1>
            </div>

            {/* 
                RADAR TRIGGER (El Portal Inmersivo)
                Usamos la variante 'console' que pinta solo el botón circular.
                Al pulsarlo, el componente tomará la pantalla entera.
            */}
            <div className="animate-in fade-in slide-in-from-right-6 duration-1000 delay-200">
              <UnifiedSearchBar
                variant="console"
                onResults={handleResults}
                onLoading={setIsSearching}
                onClear={handleClear}
                placeholder={`¿Qué ecos buscamos, ${userName}?`}
              />
            </div>

          </header>

          {/* 
              SECCIÓN II: PANORAMA MADRID RESONANCE
              Un banner táctico para la inmersión geográfica.
          */}
          <section className="relative rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border border-white/5 bg-[#050505] shadow-2xl transition-all duration-1000 hover:border-primary/20 group">
            
            <div className="h-[160px] md:h-[220px] w-full relative z-0 opacity-50 grayscale group-hover:grayscale-0 transition-all duration-1000 ease-out">
              <MapPreviewFrame />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-black/40 to-transparent pointer-events-none z-10" />

            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-20 flex items-center gap-4 md:gap-5">
              <div className="p-3 md:p-4 bg-primary/20 backdrop-blur-3xl rounded-2xl border border-primary/30 shadow-inner group-hover:scale-110 transition-transform duration-700">
                <MapIcon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-white font-black text-sm md:text-xl uppercase tracking-tighter italic drop-shadow-2xl">
                  Madrid <span className="text-primary">Live Resonance</span>
                </h3>
                <p className="text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-[0.4em] mt-0.5">
                  Malla Urbana de Conocimiento
                </p>
              </div>
            </div>
          </section>

          {/* 
              SECCIÓN III: EL FEED DE INTELIGENCIA
              Maneja de forma transparente los estados base y los resultados.
          */}
          <div className="relative z-0 min-h-[500px]">
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

        {/* --- COLUMNA DE TELEMETRÍA LATERAL (ASIDE) --- */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[8rem] space-y-8 flex flex-col h-fit animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500">

            {/* FICHA DE INVITACIÓN A LA FORJA */}
            <div className="p-8 bg-card/20 rounded-[2.5rem] border border-border/40 backdrop-blur-2xl relative overflow-hidden group shadow-xl">
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Terminal size={14} className="text-primary" />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground">Soberanía de Datos</p>
                </div>
                
                <h4 className="font-bold text-lg text-foreground leading-snug tracking-tight">
                  Tu capital intelectual se expande con cada crónica de voz.
                </h4>
                
                <Link
                  href="/create"
                  className="group/btn inline-flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-[0.3em] hover:text-primary/80 transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>INICIAR FORJA</span>
                </Link>
              </div>
            </div>

            {/* MÉTRICAS DE IMPACTO (InsightPanel) */}
            <InsightPanel resonanceProfile={resonanceProfile} />

            {/* SELLO DE PLATAFORMA */}
            <div className="p-10 text-center bg-white/[0.01] rounded-[3rem] border border-white/5 flex flex-col items-center space-y-5 shadow-inner">
              <div className="h-12 w-12 relative opacity-20 grayscale group-hover:grayscale-0 hover:opacity-80 transition-all duration-1000">
                <Image src="/nicepod-logo.png" alt="NicePod" fill className="object-contain" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 justify-center">
                  <Zap size={10} className="text-zinc-600" />
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em]">NicePod V2.5</p>
                </div>
                <div className="flex items-center gap-2.5 justify-center px-4 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">Neural Link Nominal</span>
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