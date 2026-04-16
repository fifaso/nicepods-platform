/**
 * ARCHIVO: app/(platform)/dashboard/dashboard-client.tsx
 * VERSIÓN: 28.0 (NicePod Interactive Shell - Absolute Industrial Seal)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Gestionar el estado interactivo y el diseño (layout) del Dashboard central, 
 * orquestando la comunicación entre los núcleos de inteligencia y telemetría.
 * [REFORMA V28.0]: Resolución definitiva de TS2322 mediante la sincronización 
 * con 'UnifiedSearchBar' V7.0 (variantType) e 'IntelligenceFeed' V7.0. 
 * Aplicación integral de la Zero Abbreviations Policy (ZAP). 
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
import { SearchRadarResult } from "@/hooks/use-search-radar";
import { classNamesUtility } from "@/lib/utils";
import type { Tables } from "@/types/database.types";
import type { PodcastWithProfile } from "@/types/podcast";

// --- COMPONENTES SATÉLITES DE LA TERMINAL ---
import { InsightPanel } from "@/components/feed/insight-panel";
import { IntelligenceFeed } from "@/components/feed/intelligence-feed";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";

/**
 * [HARDWARE HYGIENE]: HIDRATACIÓN DIFERIDA Y PROTEGIDA
 * El motor de visualización de Mapbox se aísla para preservar el Hilo Principal (MTI).
 */
const MapPreviewFrame = dynamic(
  () => import("@/components/geo/map-preview-frame").then((module) => module.MapPreviewFrame),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full rounded-[2.5rem] bg-zinc-950/50 border border-white/5 animate-pulse flex items-center justify-center shadow-inner isolate">
        <div className="flex flex-col items-center gap-4 opacity-40">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            Sincronizando Malla Geodésica
          </span>
        </div>
      </div>
    )
  }
);

/**
 * INTERFAZ: DashboardClientProperties
 */
interface DashboardClientProperties {
  initialIntelligenceFeedCollection: {
    epicenterPodcastsCollection: PodcastWithProfile[];
    semanticConnectionsCollection: PodcastWithProfile[];
  };
  initialAdministratorProfile: Tables<'profiles'>;
  initialResonanceMetrics: Tables<'user_resonance_profiles'> | null;
  isAdministratorAuthorityStatus: boolean;
}

/**
 * COREOGRAFÍA DE ENTRADA (NicePod Industrial Motion Standard)
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
 * DashboardClient: El motor de orquestación de la interfaz central de la Workstation.
 */
export function DashboardClient({
  initialIntelligenceFeedCollection,
  initialAdministratorProfile,
  initialResonanceMetrics,
  isAdministratorAuthorityStatus
}: DashboardClientProperties) {

  // --- ESTADOS DE CONSOLA (RADAR SEMÁNTICO) ---
  const [searchRadarResultsCollection, setSearchRadarResultsCollection] = useState<SearchRadarResult[] | null>(null);
  const [isSearchProcessActiveStatus, setIsSearchProcessActiveStatus] = useState<boolean>(false);
  const [currentSearchQueryText, setCurrentSearchQueryText] = useState<string>("");

  /** userDisplayNameReference: Extracción pericial del apelativo del Voyager. */
  const userDisplayNameReference = initialAdministratorProfile?.full_name?.split(' ')[0] || "Curador";

  // --- CONTROLADORES DE ESTADO TÁCTICO (COMMAND CENTER) ---
  const handleSearchIdentificationResultsAction = useCallback((identificationResults: SearchRadarResult[] | null) => {
    setSearchRadarResultsCollection(identificationResults);
  }, []);

  const handleClearRadarAction = useCallback(() => {
    setSearchRadarResultsCollection(null);
    setIsSearchProcessActiveStatus(false);
    setCurrentSearchQueryText("");
  }, []);

  return (
    <main className="container mx-auto max-w-screen-xl min-h-screen px-4 lg:px-8 selection:bg-primary/30 isolate">

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
              <h1 className="text-3xl md:text-6xl font-black tracking-tighter uppercase italic leading-none drop-shadow-xl text-muted-foreground/80 truncate font-serif">
                Hola, <span className="text-foreground not-italic">{userDisplayNameReference}</span>
              </h1>
              {isAdministratorAuthorityStatus && (
                <div className="flex items-center gap-2 mt-1 md:mt-2 opacity-50">
                  <ShieldCheck size={12} className="text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary">Acceso Soberano Concedido</span>
                </div>
              )}
            </div>

            {/* RADAR DE BÚSQUEDA INTERACTIVO [SINCRO V28.0] */}
            <div className="shrink-0 z-50">
              <UnifiedSearchBar
                /** [RESOLUCIÓN TS2322]: Alineación con UnifiedSearchBar V7.0 */
                variantType="console"
                placeholderText={`¿Qué ecos buscamos?`}
                onSearchIdentificationResults={handleSearchIdentificationResultsAction}
                onLoadingStatusChange={setIsSearchProcessActiveStatus}
                onClearAction={handleClearRadarAction}
              />
            </div>
          </motion.header>

          {/* WIDGET DEL MAPA TÁCTICO (FOCUS MODE) */}
          <motion.section
            variants={itemAnimationVariants}
            className={classNamesUtility(
              "w-full transition-all duration-700 ease-in-out relative z-0",
              isSearchProcessActiveStatus || searchRadarResultsCollection
                ? "h-[140px] opacity-30 saturate-0 scale-[0.98] pointer-events-none"
                : "h-[260px] md:h-[320px] opacity-100 scale-100"
            )}
          >
            <MapPreviewFrame />
          </motion.section>

          {/* FEED DE INTELIGENCIA SOBERANA [SINCRO V28.0] */}
          <motion.div variants={itemAnimationVariants} className="relative z-10 min-h-[500px]">
            <IntelligenceFeed
              /** [RESOLUCIÓN TS2322]: Alineación con IntelligenceFeed V7.0 */
              userDisplayNameReference={userDisplayNameReference}
              isSearchingProcessActiveStatus={isSearchProcessActiveStatus}
              searchRadarResultsCollection={searchRadarResultsCollection}
              lastSearchQueryText={currentSearchQueryText}
              initialEpicenterPodcastsCollection={initialIntelligenceFeedCollection.epicenterPodcastsCollection}
              initialConnectionsCollection={initialIntelligenceFeedCollection.semanticConnectionsCollection}
              onClearSearchRadarAction={handleClearRadarAction}
            />
          </motion.div>
        </div>

        {/* --- COLUMNA DE TELEMETRÍA (BARRA LATERAL DE CONTROL) --- */}
        <aside className="hidden lg:block lg:col-span-1">
          <motion.div
            variants={itemAnimationVariants}
            className={classNamesUtility(
              "sticky top-[8rem] space-y-8 flex flex-col h-fit transition-all duration-700",
              isSearchProcessActiveStatus || searchRadarResultsCollection ? "opacity-20 blur-[2px] grayscale pointer-events-none" : "opacity-100"
            )}
          >

            {/* INVITACIÓN A LA FORJA SOBERANA */}
            <div className="p-8 bg-[#0a0a0a]/60 rounded-[2.5rem] border border-white/5 backdrop-blur-2xl relative overflow-hidden group shadow-xl hover:border-primary/30 transition-colors isolate">
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Terminal size={14} className="text-primary" />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Soberanía de Datos</p>
                </div>
                <h4 className="font-bold text-lg text-white leading-snug tracking-tight">
                  Su capital intelectual se expande con cada crónica de voz.
                </h4>
                <Link
                  href="/create"
                  className="group/button inline-flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-[0.3em] hover:text-primary/80 transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>INICIAR FORJA</span>
                </Link>
              </div>
            </div>

            {/* PANEL DE METADATOS SSR */}
            <InsightPanel
              initialAdministratorProfile={initialAdministratorProfile}
              initialResonanceMetrics={initialResonanceMetrics}
            />

            {/* IDENTIDAD DE MARCA INDUSTRIAL (NICEPOD RECOGNITION) */}
            <div className="p-10 text-center bg-white/[0.01] rounded-[3rem] border border-white/5 flex flex-col items-center space-y-5 shadow-inner group isolate">
              <div className="h-12 w-12 relative opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-1000">
                <Image
                  src="/nicepod-logo.png"
                  alt="Logotipo Soberano de NicePod"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 justify-center">
                  <Zap size={10} className="text-zinc-600" />
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">NicePod V4.9 Stable</p>
                </div>
                <div className="flex items-center gap-2.5 justify-center px-4 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">Sintonía Nominal Activa</span>
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
 * NOTA TÉCNICA DEL ARCHITECT (V28.0):
 * 1. Build Shield Sovereignty: Resolución definitiva de TS2322 mediante la 
 *    alineación con los descriptores industriales 'variantType' y 
 *    'userDisplayNameReference' de los componentes hijos V7.0.
 * 2. ZAP Compliance: Purificación total de nomenclatura. Se eliminaron abreviaciones 
 *    residuales en estados y callbacks para garantizar la legibilidad técnica.
 * 3. Atomic Handover: Se asegura que el despacho de datos del servidor ('initialAdministratorProfile') 
 *    fluya sin colisiones de tipado hacia el 'InsightPanel' normalizado.
 */