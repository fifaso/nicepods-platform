// app/(platform)/dashboard/page.tsx
// VERSIÓN: 18.1 (NicePod Operations Center - Zero Flicker & Complete Edition)
// Misión: Centro de mando y telemetría con radar semántico de inmersión total.
// [ESTABILIZACIÓN]: Implementación de estado de carga del feed para evitar "falsos vacíos" durante el fetching.

"use client";

import {
  Loader2,
  PlusCircle,
  ShieldCheck,
  Terminal,
  Zap
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

// --- INFRAESTRUCTURA DEL RADAR UNIFICADO ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { SearchResult } from "@/hooks/use-search-radar";

// --- COMPONENTES SATÉLITES ---
import { InsightPanel } from "@/components/feed/insight-panel";
import { IntelligenceFeed } from "@/components/feed/intelligence-feed";
import { FloatingActionButton } from "@/components/ui/floating-action-button";

// --- HOOKS DE IDENTIDAD Y TIPOS ---
import { useAuth } from "@/hooks/use-auth";
import type { Tables } from "@/types/supabase";

/**
 * [SHIELD]: HIDRATACIÓN DIFERIDA (T2)
 */
const MapPreviewFrame = dynamic(
  () => import("@/components/geo/map-preview-frame").then((mod) => mod.MapPreviewFrame),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full rounded-[2.5rem] bg-zinc-950/50 border border-white/5 animate-pulse flex items-center justify-center shadow-inner">
        <div className="flex flex-col items-center gap-4 opacity-40">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Sincronizando Malla</span>
        </div>
      </div>
    )
  }
);

type ResonanceProfile = Tables<'user_resonance_profiles'>;
interface DiscoveryFeed {
  epicenter: any[] | null;
  semantic_connections: any[] | null;
}

export default function DashboardPage() {
  const { supabase, profile, isAuthenticated, isInitialLoading, isAdmin } = useAuth();

  // [ESTADOS DE RADAR]
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [currentQuery, setCurrentQuery] = useState<string>("");

  // [ESTADOS DE DATOS DE BÓVEDA]
  const [feed, setFeed] = useState<DiscoveryFeed>({ epicenter: [], semantic_connections: [] });
  const [resonanceProfile, setResonanceProfile] = useState<ResonanceProfile | null>(null);

  // [NUEVO ESTADO CRÍTICO]: Control de la cascada de renderizado (Zero-Flicker)
  const [isFeedLoading, setIsFeedLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboardData() {
      // Esperamos a que la identidad SSR esté completamente resuelta
      if (isInitialLoading || !isAuthenticated || !profile?.id || !supabase) return;

      setIsFeedLoading(true);

      try {
        const [
          { data: feedData, error: feedError },
          { data: resonanceData }
        ] = await Promise.all([
          supabase.rpc('get_user_discovery_feed', { p_user_id: profile.id }),
          supabase.from('user_resonance_profiles').select('*').eq('user_id', profile.id).maybeSingle()
        ]);

        if (feedError) {
          console.error("🔥 [Dashboard-RPC-Fail]:", feedError.message);
        } else if (feedData) {
          setFeed(feedData as DiscoveryFeed);
        }

        setResonanceProfile(resonanceData as ResonanceProfile);
      } catch (error) {
        console.error("🔥 [Dashboard-Data-Fail]:", error);
      } finally {
        setIsFeedLoading(false); // Levantamos la cortina de carga
      }
    }

    loadDashboardData();
  }, [isAuthenticated, isInitialLoading, profile?.id, supabase]);

  const safeEpicenter = useMemo(() => {
    if (!feed?.epicenter || !Array.isArray(feed.epicenter)) return [];
    return feed.epicenter.map((pod) => ({
      ...pod,
      creation_data: typeof pod.creation_data === 'string' ? JSON.parse(pod.creation_data) : pod.creation_data || null,
      ai_tags: Array.isArray(pod.ai_tags) ? pod.ai_tags : [],
    })).filter((p) => p.id);
  }, [feed?.epicenter]);

  const safeConnections = useMemo(() => {
    if (!feed?.semantic_connections || !Array.isArray(feed.semantic_connections)) return [];
    return feed.semantic_connections.map((pod) => ({
      ...pod,
      creation_data: typeof pod.creation_data === 'string' ? JSON.parse(pod.creation_data) : pod.creation_data || null,
      ai_tags: Array.isArray(pod.ai_tags) ? pod.ai_tags : [],
    })).filter((p) => p.id);
  }, [feed?.semantic_connections]);

  const handleResults = useCallback((results: SearchResult[] | null) => {
    setSearchResults(results);
  }, []);

  const handleClear = useCallback(() => {
    setSearchResults(null);
    setIsSearching(false);
    setCurrentQuery("");
  }, []);

  // [ZERO FLICKER GUARDIAN]: Si estamos negociando sesión o descargando bóveda, pantalla unificada.
  if (isInitialLoading || isFeedLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020202]">
        <div className="flex flex-col items-center gap-6 opacity-60">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
            <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white animate-pulse">
            Sincronizando Bóveda de Resonancia
          </span>
        </div>
      </div>
    );
  }

  const userName = profile?.full_name?.split(' ')[0] || "Curador";

  return (
    <main className="container mx-auto max-w-screen-xl min-h-screen px-4 lg:px-8 selection:bg-primary/30">
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-14 pt-8 md:pt-12 pb-32">
        <div className="lg:col-span-3 space-y-10 md:space-y-14">

          {/* CABECERA Y BUSCADOR FLOTANTE */}
          <header className="w-full flex flex-col md:flex-row md:items-center justify-between z-40 gap-6">
            <div className="flex flex-col animate-in fade-in slide-in-from-left-6 duration-1000">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none drop-shadow-xl text-muted-foreground/80">
                Hola, <span className="text-foreground">{userName}</span>
              </h1>
              {/* Feedback visual de Privilegios Soberanos */}
              {isAdmin && (
                <div className="flex items-center gap-2 mt-2 opacity-50">
                  <ShieldCheck size={12} className="text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary">Acceso Soberano Concedido</span>
                </div>
              )}
            </div>

            <div className="animate-in fade-in slide-in-from-right-6 duration-1000 delay-200 w-full md:w-auto">
              <UnifiedSearchBar
                variant="console"
                onResults={handleResults}
                onLoading={setIsSearching}
                onClear={handleClear}
                placeholder={`¿Qué ecos buscamos, ${userName}?`}
              />
            </div>
          </header>

          {/* WIDGET DEL MAPA TÁCTICO (Navegable en vivo) */}
          <section className="h-[200px] md:h-[260px] w-full animate-in fade-in zoom-in-95 duration-1000 delay-300">
            <MapPreviewFrame />
          </section>

          {/* 
              FEED DE INTELIGENCIA 
              Ya no sufre de parpadeos gracias a la cortina de carga global.
          */}
          <div className="relative z-0 min-h-[500px] animate-in fade-in duration-1000 delay-500">
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

        {/* --- COLUMNA DE TELEMETRÍA (ASIDE) --- */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[8rem] space-y-8 flex flex-col h-fit animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-700">

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
                <Link href="/create" className="group/btn inline-flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-[0.3em] hover:text-primary/80 transition-colors">
                  <PlusCircle className="h-4 w-4" />
                  <span>INICIAR FORJA</span>
                </Link>
              </div>
            </div>

            <InsightPanel resonanceProfile={resonanceProfile} />

            <div className="p-10 text-center bg-white/[0.01] rounded-[3rem] border border-white/5 flex flex-col items-center space-y-5 shadow-inner group">
              <div className="h-12 w-12 relative opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-1000">
                <Image src="/nicepod-logo.png" alt="NicePod" fill className="object-contain" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 justify-center">
                  <Zap size={10} className="text-zinc-600" />
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">NicePod V2.6</p>
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V18.1):
 * 1. Control de Estado Activo (Zero-Flicker): Se implementó 'isFeedLoading' global.
 *    Al esperar a que todos los datos (perfil, feed, resonance) estén en memoria antes de
 *    desmontar el loader, eliminamos cualquier artefacto visual o reflow de componentes.
 * 2. Feedback Espacial Admin: El texto "Acceso Soberano Concedido" confirma visualmente
 *    que el Middleware y el Cliente coinciden en los permisos del usuario para abrir el mapa.
 * 3. Widget Interactivo: El componente del mapa ahora se delega a 'MapPreviewFrame'
 *    como una entidad explorable real, no un mero enlace decorativo.
 */