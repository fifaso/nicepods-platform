// app/(platform)/dashboard/page.tsx
// VERSIÓN: 10.2 (The Intelligence Command Suite - High-FPS & Zero-Shift Edition)
// Misión: Punto de entrada soberano. Orquesta la búsqueda dinámica, el feed de conocimiento y la telemetría urbana.
// [OPTIMIZACIÓN]: Resolución de 'Forced Reflow', memoización de sanitización y jerarquía visual inmersiva.

"use client";

import { SearchStation, type SearchResult } from "@/components/geo/search-station";
import { InsightPanel } from "@/components/insight-panel";
import { IntelligenceFeed } from "@/components/intelligence-feed";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { useAuth } from "@/hooks/use-auth";
import type { Tables } from "@/types/supabase";
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

/**
 * [TYPES]: Definiciones de integridad para el motor de datos.
 */
type ResonanceProfile = Tables<'user_resonance_profiles'>;

interface DiscoveryFeed {
  epicenter: any[] | null;
  semantic_connections: any[] | null;
}

/**
 * DashboardPage: La Workstation de control central de NicePod V2.5.
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
   * [OPTIMIZACIÓN QUIRÚRGICA]: Memoización de Podcasts
   * Parseamos y saneamos los datos solo cuando el feed cambia.
   * Esto elimina el 'Forced Reflow' causado por ejecuciones de script pesadas en el render.
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
   * handleResults: Receptor de impactos semánticos de la SearchStation.
   */
  const handleResults = useCallback((results: SearchResult[]) => {
    setSearchResults(results);
  }, []);

  /**
   * handleClear: Restablece el flujo de la Workstation.
   */
  const handleClear = useCallback(() => {
    setSearchResults([]);
    setIsSearching(false);
    setCurrentQuery("");
  }, []);

  // --- PROTECCIÓN DE HIDRATACIÓN INICIAL ---
  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">
            Cargando Intelligence Shell
          </span>
        </div>
      </div>
    );
  }

  const userName = profile?.full_name?.split(' ')[0] || "Curador";

  return (
    <main className="container mx-auto max-w-screen-xl min-h-screen px-4 lg:px-6">

      {/* GRID DE OPERACIONES TÁCTICAS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-10 pt-6 pb-24">

        {/* COLUMNA PRINCIPAL DE INTELIGENCIA (3/4) */}
        <div className="lg:col-span-3 space-y-10">

          {/* SECCIÓN I: COMMAND HEADER 
              [FIX ESTRUCTURAL]: min-h-120px evita el salto de layout al cargar el buscador.
          */}
          <header className="relative w-full min-h-[120px] md:min-h-[140px] flex items-center justify-between z-40 bg-transparent">

            {/* SALUDO SOBERANO */}
            <div className="flex flex-col justify-center animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="flex items-center gap-2 mb-2 opacity-60">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_12px_rgba(139,92,246,0.8)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                  Sincronía Nominal Activa
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic leading-none">
                Hola, <span className="text-primary not-italic">{userName}</span>
              </h1>
            </div>

            {/* ESTACIÓN DE BÚSQUEDA: Capa de Inmersión
                Su z-index garantiza que flote sobre el saludo al expandirse.
            */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full flex justify-end pointer-events-none">
              <div className="pointer-events-auto w-full max-w-xl">
                <SearchStation
                  userName={userName}
                  onResults={handleResults}
                  onLoading={setIsSearching}
                  onClear={handleClear}
                />
              </div>
            </div>
          </header>

          {/* SECCIÓN II: PORTAL PANORÁMICO MADRID
              [UX]: El mapa actúa como un banner táctico de contexto.
          */}
          <section className="relative rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border border-white/5 bg-zinc-950 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-700 hover:border-primary/20 group">

            {/* Contenedor del Mapa (T2) */}
            <div className="h-[160px] md:h-[200px] w-full relative z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-1000">
              <MapPreviewFrame />
            </div>

            {/* Filtros de Atmósfera Aurora */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-transparent pointer-events-none z-10" />

            {/* Etiqueta de Localización en Vivo */}
            <div className="absolute bottom-6 left-8 z-20 flex items-center gap-4">
              <div className="p-3 bg-primary/20 backdrop-blur-2xl rounded-2xl border border-primary/30 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <MapIcon size={18} className="text-primary" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-white font-black text-xs md:text-sm uppercase tracking-tighter italic drop-shadow-2xl">
                  Madrid <span className="text-primary">Live Resonance</span>
                </h3>
                <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Portal de Memorias 3D</p>
              </div>
            </div>
          </section>

          {/* ESTACIÓN III: FEED DE INTELIGENCIA 
              [FIX]: Inyectamos los datos memoizados para evitar re-renders innecesarios.
          */}
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

        {/* COLUMNA LATERAL (Soberanía y Telemetría) */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[8rem] space-y-8 flex flex-col h-fit">

            {/* FICHA DE MISIÓN CURATORIAL */}
            <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 backdrop-blur-xl relative overflow-hidden group shadow-2xl">
              <div className="absolute -top-6 -right-6 p-4 opacity-[0.03] group-hover:rotate-12 group-hover:scale-125 transition-all duration-1000">
                <Globe size={100} className="text-primary" />
              </div>
              <div className="space-y-5 relative z-10">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-primary" />
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Protocolo de Bóveda</p>
                </div>
                <h4 className="font-bold text-base text-foreground leading-tight tracking-tight">
                  Tu Bóveda se expande con cada crónica. Fortalece la memoria de la ciudad.
                </h4>
                <Link
                  href="/create"
                  className="group/btn inline-flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-[0.2em] transition-all hover:gap-5"
                >
                  <span>INICIAR FORJA</span>
                  <ChevronRight size={14} className="transition-all" />
                </Link>
              </div>
            </div>

            {/* PANEL DE INSIGHTS (Datos de Resonancia Real) */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              <InsightPanel resonanceProfile={resonanceProfile} />
            </div>

            {/* BRANDING TÉCNICO Y ESTADO DE RED */}
            <div className="p-10 text-center bg-white/[0.02] rounded-[3.5rem] border border-white/5 flex flex-col items-center space-y-4 shadow-inner">
              <div className="h-12 w-12 relative opacity-30 hover:opacity-60 transition-all duration-500 hover:scale-110">
                <Image
                  src="/nicepod-logo.png"
                  alt="NicePod Intelligence"
                  fill
                  className="object-contain grayscale"
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.5em]">Shell V2.5.21</p>
                <div className="flex items-center gap-2 justify-center opacity-50">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black text-emerald-500/80 uppercase tracking-widest">Neural Sync Active</span>
                </div>
              </div>
            </div>

          </div>
        </aside>

      </div>

      {/* TRIGGER UNIVERSAL DE CREACIÓN (FAB) */}
      <FloatingActionButton />
    </main>
  );
}