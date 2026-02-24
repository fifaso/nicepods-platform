// app/(platform)/dashboard/page.tsx
// VERSIÓN: 12.0

"use client";

import {
  ChevronRight,
  Globe,
  Loader2,
  Map as MapIcon,
  PlusCircle,
  Terminal,
  Zap
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
 * Se carga con ssr: false para evitar discrepancias de hidratación en el cliente.
 */
const MapPreviewFrame = dynamic(
  () => import("@/components/geo/map-preview-frame").then((mod) => mod.MapPreviewFrame),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full rounded-[2.5rem] md:rounded-[3.5rem] bg-zinc-900/50 border border-white/5 animate-pulse flex items-center justify-center">
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
 * COMPONENTE: DashboardPage
 * El epicentro de control y descubrimiento de la Workstation NicePod V2.5.
 */
export default function DashboardPage() {
  // --- CONSUMO DE IDENTIDAD SINCRO ---
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
   * Realizamos un fetch paralelo para minimizar el TTFB percibido en el primer render.
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
   * Saneamos los objetos JSONB del feed solo ante cambios físicos en la data.
   * Esto elimina re-renders innecesarios durante la interacción con el radar.
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
   * handleResults: Receptor de impactos del Radar Portal.
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

  // --- PROTECCIÓN DE HIDRATACIÓN INICIAL ---
  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 animate-pulse">
            Sincronizando Intelligence Shell
          </span>
        </div>
      </div>
    );
  }

  // Personalización Nominal (Extraemos primer nombre para cercanía UX)
  const userName = profile?.full_name?.split(' ')[0] || "Curador";

  return (
    <main className="container mx-auto max-w-screen-xl min-h-screen px-4 lg:px-8 selection:bg-primary/30">

      {/* GRID DE OPERACIONES TÁCTICAS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-14 pt-8 pb-32">

        {/* COLUMNA PRINCIPAL DE INTELIGENCIA (3/4 del ancho) */}
        <div className="lg:col-span-3 space-y-12">

          {/* SECCIÓN I: COMMAND HEADER
              Jerarquía visual de alto impacto para el saludo y búsqueda.
          */}
          <header className="relative w-full flex items-center justify-between z-40 bg-transparent py-4">

            {/* SALUDO SOBERANO */}
            <div className="flex flex-col justify-center animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="flex items-center gap-3 mb-3 opacity-60">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(var(--primary),0.8)]" />
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">
                  Frecuencia Nominal Activa
                </span>
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase italic leading-none drop-shadow-2xl">
                Hola, <span className="text-primary not-italic">{userName}</span>
              </h1>
            </div>

            {/* 
                RADAR UNIFICADO (DISPARADOR)
                Ubicado a la derecha para un flujo de 'input' natural. 
            */}
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">

              {/* [FIX]: Re-ordenamiento de clases Tailwind para resolver conflicto flex/hidden */}
              <div className="hidden md:flex flex-col items-end opacity-30 group cursor-help mr-2">
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Activar Radar</span>
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter flex items-center gap-1">
                  CMD + K
                </span>
              </div>

              <UnifiedSearchBar
                onResults={handleResults}
                onLoading={setIsSearching}
                onClear={handleClear}
                placeholder={`¿Qué conocimiento buscas hoy, ${userName}?`}
              />
            </div>
          </header>

          {/* SECCIÓN II: PORTAL PANORÁMICO MADRID
               Banner táctico que sitúa al curador en el espacio geográfico.
          */}
          <section className="relative rounded-[3rem] md:rounded-[4rem] overflow-hidden border border-white/5 bg-[#050505] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] transition-all duration-1000 hover:border-primary/20 group">

            {/* Capa de Mapa satelital cinemático */}
            <div className="h-[200px] md:h-[260px] w-full relative z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-1000 grayscale hover:grayscale-0">
              <MapPreviewFrame />
            </div>

            {/* Filtros de Atmósfera Aurora (Gradientes de inmersión) */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent z-10 pointer-events-none" />

            {/* Telemetría Geoespacial (Label inferior) */}
            <div className="absolute bottom-8 left-10 z-20 flex items-center gap-6">
              <div className="p-4 bg-primary/20 backdrop-blur-3xl rounded-[1.5rem] border border-primary/30 shadow-inner group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(var(--primary),0.4)] transition-all duration-700">
                <MapIcon size={24} className="text-primary" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-white font-black text-sm md:text-lg uppercase tracking-tighter italic drop-shadow-2xl flex items-center gap-3">
                  Madrid <span className="text-primary">Live Resonance</span>
                  <div className="h-1 w-1 rounded-full bg-primary animate-ping" />
                </h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.4em]">Malla Urbana de Conocimiento</p>
              </div>
            </div>
          </section>

          {/* ESTACIÓN III: ESCENARIO DE INTELIGENCIA (FEED)
              Centralización de hallazgos del radar y estantes personalizados.
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

        {/* COLUMNA LATERAL (ASIDE): Telemetría y Status */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[8rem] space-y-10 flex flex-col h-fit animate-in fade-in slide-in-from-right-4 duration-1000 delay-500">

            {/* FICHA DE MISIÓN CURATORIAL */}
            <div className="p-10 bg-white/[0.02] rounded-[3.5rem] border border-white/5 backdrop-blur-2xl relative overflow-hidden group shadow-2xl hover:border-primary/20 transition-all">
              {/* Decoración de Marca */}
              <div className="absolute -top-12 -right-12 p-4 opacity-[0.03] group-hover:rotate-12 group-hover:scale-150 transition-all duration-1000">
                <Globe size={150} className="text-primary" />
              </div>

              <div className="space-y-7 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-primary/20 rounded-lg">
                    <Terminal size={14} className="text-primary" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80">Protocolo Alpha</p>
                </div>

                <h4 className="font-bold text-xl text-foreground leading-tight tracking-tight">
                  Tu capital intelectual se expande con cada crónica. Fortalece la frecuencia.
                </h4>

                <Link
                  href="/create"
                  className="group/btn inline-flex items-center gap-4 text-[11px] font-black text-primary uppercase tracking-[0.3em] transition-all hover:gap-6"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>INICIAR FORJA</span>
                  <ChevronRight size={16} className="text-primary/40 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* PANEL DE MÉTRICAS SOBERANAS */}
            <div className="px-2">
              <InsightPanel resonanceProfile={resonanceProfile} />
            </div>

            {/* BRANDING TÉCNICO Y ESTADO DE RED */}
            <div className="p-12 text-center bg-white/[0.01] rounded-[4rem] border border-white/5 flex flex-col items-center space-y-6 shadow-inner">
              <div className="h-16 w-16 relative opacity-20 grayscale group-hover:grayscale-0 hover:opacity-80 transition-all duration-1000">
                <Image src="/nicepod-logo.png" alt="NicePod" fill className="object-contain" />
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 justify-center">
                  <Zap size={10} className="text-primary" />
                  <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.6em]">NicePod V2.5</p>
                </div>
                <div className="flex items-center gap-2.5 justify-center px-4 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">Neural Link Nominal</span>
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

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Resolución 'flex/hidden': La clase 'hidden md:flex' garantiza que el 
 *    elemento no exista en el flujo móvil pero se materialice correctamente
 *    en escritorio sin colisiones de propiedades CSS.
 * 2. Diseño de Mando: Al ocultar la barra de búsqueda inicial, el Dashboard
 *    recupera la estética de 'hardware profesional', dejando la búsqueda como 
 *    una herramienta poderosa de pantalla completa siempre disponible vía Cmd+K.
 * 3. Optimización de Memoria: El uso de dynamic imports para el Mapa y la 
 *    memoización de datos pesados asegura que el Dashboard mantenga una
 *    experiencia de usuario fluida y reactiva.
 */