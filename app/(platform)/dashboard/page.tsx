// app/(platform)/dashboard/page.tsx
// VERSIÓN: 15.1 (NicePod Operations Center - Type-Safe Production Edition)
// Misión: Centro de mando y telemetría con radar semántico de alta precisión.
// [ESTABILIZACIÓN]: Alineación de contratos de tipos con UnifiedSearchBar V4.5 (null-safe).

"use client";

import {
  Loader2,
  Map as MapIcon,
  PlusCircle,
  Terminal
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

// --- INFRAESTRUCTURA DEL RADAR UNIFICADO ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { SearchResult } from "@/hooks/use-search-radar";

// --- COMPONENTES SATÉLITES ---
import { IntelligenceFeed } from "@/components/intelligence-feed";
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

/**
 * COMPONENTE MAESTRO: DashboardPage
 */
export default function DashboardPage() {
  const { supabase, profile, isAuthenticated, isInitialLoading } = useAuth();

  // [FIX]: searchResults tipado como 'SearchResult[] | null' para alineación total.
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [currentQuery, setCurrentQuery] = useState<string>("");

  const [feed, setFeed] = useState<DiscoveryFeed>({ epicenter: [], semantic_connections: [] });
  const [resonanceProfile, setResonanceProfile] = useState<ResonanceProfile | null>(null);

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

  /**
   * [FIX DE CONTRATO]: handleResults ahora acepta explícitamente 'null'.
   * Esto resuelve el error ts(2322) que bloqueaba el build.
   */
  const handleResults = useCallback((results: SearchResult[] | null) => {
    setSearchResults(results);
  }, []);

  const handleClear = useCallback(() => {
    setSearchResults(null);
    setIsSearching(false);
    setCurrentQuery("");
  }, []);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020202]">
        <div className="flex flex-col items-center gap-6 opacity-60">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white animate-pulse">
            Iniciando Intelligence Shell
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

          <header className="w-full flex items-center justify-between z-40 bg-transparent">
            <div className="flex flex-col animate-in fade-in slide-in-from-left-6 duration-1000">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none drop-shadow-xl text-muted-foreground/80">
                Hola, <span className="text-foreground">{userName}</span>
              </h1>
            </div>

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

          <section className="relative rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border border-white/5 bg-[#050505] shadow-2xl transition-all duration-1000 hover:border-primary/20 group">
            <div className="h-[160px] md:h-[220px] w-full relative z-0 opacity-50 grayscale group-hover:grayscale-0 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
              <MapPreviewFrame />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-black/40 to-transparent pointer-events-none z-10" />
            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-20 flex items-center gap-4 md:gap-5">
              <div className="p-3 md:p-4 bg-primary/20 backdrop-blur-3xl rounded-2xl border border-primary/30 shadow-inner group-hover:scale-110 transition-transform duration-700">
                <MapIcon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-white font-black text-sm md:text-xl uppercase tracking-tighter italic drop-shadow-2xl">
                  Madrid <span className="text-primary">Resonance</span>
                </h3>
                <p className="text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] mt-0.5">
                  Malla Urbana Activa
                </p>
              </div>
            </div>
          </section>

          <div className="relative z-0 min-h-[500px]">
            <IntelligenceFeed
              userName={userName}
              isSearching={isSearching}
              results={searchResults || []}
              lastQuery={currentQuery}
              epicenterPodcasts={safeEpicenter}
              connectionsPodcasts={safeConnections}
              onClear={handleClear}
            />
          </div>
        </div>

        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[8rem] space-y-8 flex flex-col h-fit animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500">
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
          </div>
        </aside>
      </div>
      <FloatingActionButton />
    </main>
  );
}
/**
 * NOTA TÉCNICA DEL ARCHITECT (MASTER EDITION):
 * 
 * 1. SANEAMIENTO DE CONTRATOS (Fix TS2322):
 *    Se ha actualizado la firma del manejador 'handleResults' para aceptar explícitamente 
 *    'SearchResult[] | null'. Esto alinea el componente con la versión 4.5 del 
 *    'UnifiedSearchBar', eliminando la colisión de tipos que bloqueaba el Build Shield 
 *    de Vercel. El sistema ahora permite la nulidad como un estado legítimo de 'reposo'.
 * 
 * 2. INTEGRIDAD DE VISUALIZACIÓN:
 *    Se ha optimizado el renderizado condicional de los resultados de búsqueda. Al 
 *    utilizar 'searchResults || []' en la alimentación del componente 'IntelligenceFeed', 
 *    garantizamos que el sistema nunca intente iterar sobre un valor nulo, evitando 
 *    crashes en tiempo de ejecución durante la interacción del usuario.
 * 
 * 3. OPTIMIZACIÓN DE RENDERIZADO (Memoización):
 *    Se han mantenido las capas de 'safeEpicenter' y 'safeConnections' como puntos 
 *    de control de datos. Esto asegura que, independientemente de la estructura 
 *    de los datos recibidos desde Supabase (como strings JSONB), el componente 
 *    siempre trabaje con objetos planos y tipados, previniendo errores de 'object is not iterable'.
 * 
 * 4. ESTABILIDAD DE CSS:
 *    Se ha sustituido la clase de 'easing' ambigua por la sintaxis explícita 
 *    'ease-[cubic-bezier(0.16,1,0.3,1)]', eliminando las advertencias de compilación 
 *    de Tailwind que ensuciaban los logs de despliegue.
 */