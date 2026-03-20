// app/(platform)/dashboard/dashboard-client.tsx
// VERSIÓN: 21.0 (NicePod Interactive Shell - Zero-Wait & Full Radar Edition)
// Misión: Gestionar el estado del radar y renderizar el Dashboard con datos SSR inyectados.

"use client";

import { PlusCircle, ShieldCheck, Terminal, Zap } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";

// --- INFRAESTRUCTURA DEL RADAR UNIFICADO ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { SearchResult } from "@/hooks/use-search-radar";

// --- COMPONENTES SATÉLITES ---
import { InsightPanel } from "@/components/feed/insight-panel";
import { IntelligenceFeed } from "@/components/feed/intelligence-feed";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import type { Tables } from "@/types/database.types";

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
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Sincronizando Malla</span>
        </div>
      </div>
    )
  }
);

interface DashboardClientProps {
  initialFeed: { epicenter: any[]; semantic_connections: any[] };
  initialProfile: Tables<'profiles'>;
  initialResonance: Tables<'user_resonance_profiles'> | null;
  isAdmin: boolean;
}

export function DashboardClient({
  initialFeed,
  initialProfile,
  initialResonance,
  isAdmin
}: DashboardClientProps) {

  // [ESTADOS DE RADAR RESTAURADOS]
  // La interactividad táctica vuelve a estar disponible.
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [currentQuery, setCurrentQuery] = useState<string>("");

  const userName = initialProfile?.full_name?.split(' ')[0] || "Curador";

  // Controladores de búsqueda
  const handleResults = useCallback((results: SearchResult[] | null) => {
    setSearchResults(results);
  }, []);

  const handleClear = useCallback(() => {
    setSearchResults(null);
    setIsSearching(false);
    setCurrentQuery("");
  }, []);

  return (
    <main className="container mx-auto max-w-screen-xl min-h-screen px-4 lg:px-8 selection:bg-primary/30">
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-14 pt-8 md:pt-12 pb-32">

        {/* COLUMNA PRINCIPAL: Inteligencia y Malla */}
        <div className="lg:col-span-3 space-y-10 md:space-y-14">

          {/* CABECERA SOBERANA */}
          <header className="w-full flex flex-col md:flex-row md:items-center justify-between z-40 gap-6">
            <div className="flex flex-col animate-in fade-in slide-in-from-left-6 duration-1000">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none drop-shadow-xl text-muted-foreground/80">
                Hola, <span className="text-foreground">{userName}</span>
              </h1>
              {isAdmin && (
                <div className="flex items-center gap-2 mt-2 opacity-50">
                  <ShieldCheck size={12} className="text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary">Acceso Soberano Concedido</span>
                </div>
              )}
            </div>

            {/* RADAR DE BÚSQUEDA INTERACTIVO */}
            <div className="animate-in fade-in slide-in-from-right-6 duration-1000 delay-200 w-full md:w-auto">
              <UnifiedSearchBar
                variant="console"
                placeholder={`¿Qué ecos buscamos, ${userName}?`}
                onResults={handleResults}
                onLoading={setIsSearching}
                onClear={handleClear}
              />
            </div>
          </header>

          {/* WIDGET DEL MAPA TÁCTICO */}
          <section className="h-[200px] md:h-[260px] w-full animate-in fade-in zoom-in-95 duration-1000 delay-300">
            <MapPreviewFrame />
          </section>

          {/* 
              FEED DE INTELIGENCIA (Resolución TS2739)
              Inyectamos los estados de búsqueda y los datos SSR simultáneamente.
          */}
          <div className="relative z-0 min-h-[500px] animate-in fade-in duration-1000 delay-500">
            <IntelligenceFeed
              userName={userName}
              isSearching={isSearching}
              results={searchResults}
              lastQuery={currentQuery}
              initialEpicenter={initialFeed.epicenter}
              initialConnections={initialFeed.semantic_connections}
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

            {/* PANEL DE METADATOS SSR */}
            <InsightPanel
              initialProfile={initialProfile}
              initialResonance={initialResonance}
            />

            {/* IDENTIDAD DE MARCA */}
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