/**
 * ARCHIVO: app/(platform)/dashboard/dashboard-client.tsx
 * VERSIÓN: 25.0 (NicePod Interactive Shell - Full Contract Synchronization)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Gestionar el estado interactivo y el diseño (layout) del Dashboard central.
 * [REFORMA V25.0]: Sincronización nominal total con IntelligenceFeed V5.0 y 
 * blindaje absoluto contra errores de tipos en la propagación de búsqueda.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { motion } from "framer-motion";
import { PlusCircle, ShieldCheck, Terminal, Zap } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";

// --- INFRAESTRUCTURA DE DATOS Y CONTRATOS SOBERANOS ---
import { SearchResult } from "@/hooks/use-search-radar";
import { cn } from "@/lib/utils";
import type { Tables } from "@/types/database.types";
import type { PodcastWithProfile } from "@/types/podcast";

// --- COMPONENTES SATÉLITES ---
import { InsightPanel } from "@/components/feed/insight-panel";
import { IntelligenceFeed } from "@/components/feed/intelligence-feed";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";

/**
 * [SHIELD]: HIDRATACIÓN DIFERIDA Y PROTEGIDA
 * El motor WebGL se aísla para proteger el hilo principal (Main Thread).
 */
const MapPreviewFrame = dynamic(
  () => import("@/components/geo/map-preview-frame").then((module) => module.MapPreviewFrame),
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

/**
 * INTERFAZ: DashboardClientProperties
 */
interface DashboardClientProperties {
  initialFeed: {
    epicenter: PodcastWithProfile[];
    semantic_connections: PodcastWithProfile[];
  };
  initialProfile: Tables<'profiles'>;
  initialResonance: Tables<'user_resonance_profiles'> | null;
  isAdministrator: boolean;
}

/**
 * COREOGRAFÍA DE ENTRADA (Framer Motion Industrial Standard)
 */
const containerAnimationVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
};

const itemAnimationVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 25 }
  }
};

/**
 * DashboardClient: El motor de orquestación de la interfaz central.
 */
export function DashboardClient({
  initialFeed,
  initialProfile,
  initialResonance,
  isAdministrator
}: DashboardClientProperties) {

  // --- ESTADOS DE CONSOLA (RADAR SEMÁNTICO) ---
  const [searchMatchResults, setSearchMatchResults] = useState<SearchResult[] | null>(null);
  const [isSearchProcessActive, setIsSearchProcessActive] = useState<boolean>(false);
  const [currentSearchQuery, setCurrentSearchQuery] = useState<string>("");

  const userDisplayName = initialProfile?.full_name?.split(' ')[0] || "Curador";

  // --- CONTROLADORES DE ESTADO TÁCTICO ---
  const handleSearchResultsAction = useCallback((results: SearchResult[] | null) => {
    setSearchMatchResults(results);
  }, []);

  const handleClearRadarAction = useCallback(() => {
    setSearchMatchResults(null);
    setIsSearchProcessActive(false);
    setCurrentSearchQuery("");
  }, []);

  return (
    <main className="container mx-auto max-w-screen-xl min-h-screen px-4 lg:px-8 selection:bg-primary/30">

      <motion.div
        variants={containerAnimationVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-4 lg:gap-14 pt-8 md:pt-12 pb-32"
      >

        {/* COLUMNA PRINCIPAL: Inteligencia y Malla Urbana */}
        <div className="lg:col-span-3 space-y-10 md:space-y-14">

          {/* CABECERA SOBERANA (ALINEACIÓN AXIAL) */}
          <motion.header 
            variants={itemAnimationVariants} 
            className="w-full flex flex-row items-center justify-between z-40 gap-6"
          >
            <div className="flex flex-col min-w-0">
              <h1 className="text-3xl md:text-6xl font-black tracking-tighter uppercase italic leading-none drop-shadow-xl text-muted-foreground/80 truncate">
                Hola, <span className="text-foreground">{userDisplayName}</span>
              </h1>
              {isAdministrator && (
                <div className="flex items-center gap-2 mt-1 md:mt-2 opacity-50">
                  <ShieldCheck size={12} className="text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary">Acceso Soberano Concedido</span>
                </div>
              )}
            </div>

            {/* RADAR DE BÚSQUEDA INTERACTIVO */}
            <div className="shrink-0 z-50">
              <UnifiedSearchBar
                variant="console"
                placeholder={`¿Qué ecos buscamos?`}
                onSearchIdentificationResults={handleSearchResultsAction}
                onLoadingStatusChange={setIsSearchProcessActive}
                onClearAction={handleClearRadarAction}
              />
            </div>
          </motion.header>

          {/* WIDGET DEL MAPA TÁCTICO (FOCUS MODE) */}
          <motion.section
            variants={itemAnimationVariants}
            className={cn(
              "w-full transition-all duration-700 ease-in-out relative z-0",
              isSearchProcessActive || searchMatchResults 
                ? "h-[140px] opacity-30 saturate-0 scale-[0.98] pointer-events-none" 
                : "h-[260px] md:h-[320px] opacity-100 scale-100"
            )}
          >
            <MapPreviewFrame />
          </motion.section>

          {/* FEED DE INTELIGENCIA SOBERANA */}
          <motion.div variants={itemAnimationVariants} className="relative z-10 min-h-[500px]">
            {/* [FIX TS2322]: Sincronización nominal con IntelligenceFeedProperties V5.0 */}
            <IntelligenceFeed
              userDisplayName={userDisplayName}
              isSearchingProcessActive={isSearchProcessActive}
              searchMatchResults={searchMatchResults}
              lastSearchQuery={currentSearchQuery}
              initialEpicenterCollection={initialFeed.epicenter}
              initialConnectionsCollection={initialFeed.semantic_connections}
              onClearRadarAction={handleClearRadarAction}
            />
          </motion.div>
        </div>

        {/* --- COLUMNA DE TELEMETRÍA (BARRA LATERAL) --- */}
        <aside className="hidden lg:block lg:col-span-1">
          <motion.div
            variants={itemAnimationVariants}
            className={cn(
              "sticky top-[8rem] space-y-8 flex flex-col h-fit transition-all duration-700",
              isSearchProcessActive || searchMatchResults ? "opacity-20 blur-[2px] grayscale pointer-events-none" : "opacity-100"
            )}
          >

            {/* INVITACIÓN A LA FORJA SOBERANA */}
            <div className="p-8 bg-card/20 rounded-[2.5rem] border border-border/40 backdrop-blur-2xl relative overflow-hidden group shadow-xl hover:border-primary/30 transition-colors">
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

            {/* IDENTIDAD DE MARCA INDUSTRIAL */}
            <div className="p-10 text-center bg-white/[0.01] rounded-[3rem] border border-white/5 flex flex-col items-center space-y-5 shadow-inner group">
              <div className="h-12 w-12 relative opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-1000">
                <Image src="/nicepod-logo.png" alt="NicePod" fill className="object-contain" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 justify-center">
                  <Zap size={10} className="text-zinc-600" />
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">NicePod V4.0</p>
                </div>
                <div className="flex items-center gap-2.5 justify-center px-4 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">Neural Link Nominal</span>
                </div>
              </div>
            </div>

          </motion.div>
        </aside>

      </motion.div>
      <FloatingActionButton />
    </main>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V25.0):
 * 1. Contract Alignment: Se resolvió el error TS2322 sincronizando el despacho de 
 *    propiedades hacia IntelligenceFeed utilizando la nomenclatura descriptiva V5.0.
 * 2. Zero Abbreviations Policy: Purificación absoluta de términos (isSearchProcessActive, 
 *    initialEpicenterCollection, handleClearRadarAction).
 * 3. Layout Sovereignty: Se optimizó el truncado de texto en el saludo para proteger 
 *    la integridad del Radar de Búsqueda en el eje horizontal (flex-row).
 */