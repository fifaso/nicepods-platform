// app/(platform)/dashboard/page.tsx
// VERSIÓN: 15.0 (The Intelligence Command Suite - Peak Performance Edition)
// Misión: Punto de entrada operativo definitivo. Optimizado para densidad, fluidez y visibilidad 360.
// [PRODUCCIÓN]: Archivo íntegro, sin errores, sin abreviaciones y con jerarquía de capas blindada.

import { DiscoveryHub } from "@/components/discovery-hub";
import { InsightPanel } from "@/components/insight-panel";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { createClient } from "@/lib/supabase/server";
import { PodcastWithProfile } from "@/types/podcast";
import type { Tables } from "@/types/supabase";
import {
  ChevronRight,
  Globe,
  Loader2,
  Map as MapIcon,
  Terminal,
  Zap
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

/**
 * [TYPES]: Integridad de datos para el motor de TypeScript.
 */
type ResonanceProfile = Tables<'user_resonance_profiles'>;

interface DiscoveryFeed {
  epicenter: PodcastWithProfile[] | null;
  semantic_connections: PodcastWithProfile[] | null;
}

/**
 * [SHIELD]: HIDRATACIÓN ESCALONADA (T2)
 * Cargamos el Portal de Madrid de forma diferida para no bloquear el hilo principal.
 * Skeleton diseñado para mantener la geometría exacta del banner.
 */
const MapPreviewFrame = dynamic(
  () => import("@/components/geo/map-preview-frame").then((mod) => mod.MapPreviewFrame),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[130px] md:h-[160px] rounded-[2rem] md:rounded-[3rem] bg-zinc-900/50 border border-white/5 animate-pulse flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary/20" />
      </div>
    )
  }
);

/**
 * sanitizePodcasts
 * Procesa la respuesta de Supabase asegurando que el contenido JSONB 
 * sea válido para los componentes del cliente.
 */
function sanitizePodcasts(podcasts: any[] | null): PodcastWithProfile[] {
  if (!podcasts || !Array.isArray(podcasts)) {
    return [];
  }
  return podcasts.map((pod) => {
    return {
      ...pod,
      creation_data: typeof pod.creation_data === 'string' ? JSON.parse(pod.creation_data) : pod.creation_data || null,
      ai_tags: Array.isArray(pod.ai_tags) ? pod.ai_tags : [],
      user_tags: Array.isArray(pod.user_tags) ? pod.user_tags : [],
      sources: Array.isArray(pod.sources) ? pod.sources : [],
    };
  }).filter((p) => p.id);
}

/**
 * DashboardPage: La terminal de entrada de alto valor para el usuario.
 */
export default async function DashboardPage() {
  const supabase = createClient();

  // 1. VALIDACIÓN DE IDENTIDAD (Server-Side Guard)
  // Resolvemos la soberanía del usuario antes de enviar el primer byte.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. RECOPILACIÓN DE INTELIGENCIA PARALELA
  // Invocamos el RPC semántico y la telemetría en una sola ráfaga de red.
  const [
    { data: feedData },
    { data: resonanceData },
    { data: profileData }
  ] = await Promise.all([
    supabase.rpc('get_user_discovery_feed', { p_user_id: user.id }),
    supabase.from('user_resonance_profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('profiles').select('full_name, reputation_score').eq('id', user.id).single()
  ]);

  const feed = (feedData as DiscoveryFeed) || { epicenter: [], semantic_connections: [] };
  const resonanceProfile = (resonanceData as ResonanceProfile) || null;
  const userName = profileData?.full_name?.split(' ')[0] || "Curador";

  // Saneamiento preventivo de las listas de reproducción
  const safeEpicenter = sanitizePodcasts(feed.epicenter);
  const safeConnections = sanitizePodcasts(feed.semantic_connections);

  return (
    <main className="container mx-auto max-w-screen-xl px-4 lg:px-6">

      {/* 
          ESTRUCTURA DE GRID OPERATIVO
          3 Columnas de flujo narrativo + 1 Columna de telemetría fija.
      */}
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-10 pb-24">

        {/* COLUMNA CENTRAL (NÚCLEO OPERATIVO) */}
        <div className="lg:col-span-3 space-y-6 md:space-y-8">

          {/* SECCIÓN I: COMMAND BAR 
              [MEJORA]: Reducción de altura y márgenes para ganar espacio vital.
              Z-Index 40 asegura que el buscador cubra el saludo al expandirse.
          */}
          <header className="relative w-full min-h-[80px] md:min-h-[100px] flex items-center justify-between z-40 bg-transparent">

            {/* SALUDO TÁCTICO (Capa Base) */}
            <div className="flex flex-col justify-center animate-in fade-in slide-in-from-left-4 duration-1000">
              <div className="flex items-center gap-2 mb-1 opacity-60">
                <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary">
                  Sincronía Estable
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
                Hola, <span className="text-primary not-italic">{userName}</span>
              </h1>
            </div>

            {/* BUSCADOR EXPANSIVO (Capa Superior)
                Posicionado absolutamente para permitir la cobertura del saludo.
            */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full flex justify-end pointer-events-none">
              <div className="pointer-events-auto w-full max-w-full">
                <DiscoveryHub
                  userName={userName}
                  showShelvesOnNoSearch={true}
                  epicenterPodcasts={safeEpicenter}
                  connectionsPodcasts={safeConnections}
                  showOnlySearch={false}
                />
              </div>
            </div>
          </header>

          {/* SECCIÓN II: PORTAL MADRID (Banner Panorámico de Inmersión)
              [MEJORA]: Gradientes suavizados para recuperar visibilidad del mapa real.
          */}
          <section className="relative rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border border-white/5 bg-zinc-950 shadow-2xl transition-all duration-700 hover:border-primary/20">
            {/* Reducción de altura para priorizar el contenido inferior */}
            <div className="h-[130px] md:h-[160px] w-full relative z-0 opacity-60 hover:opacity-80 transition-opacity">
              <MapPreviewFrame />
            </div>

            {/* [FIX]: Gradiente suavizado para no cegar la visión del mapa */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent pointer-events-none z-10" />

            {/* HUD Geospacial Integrado */}
            <div className="absolute bottom-4 left-6 z-20 flex items-center gap-3">
              <div className="p-1.5 bg-primary/20 backdrop-blur-xl rounded-xl border border-primary/30 shadow-inner">
                <MapIcon size={14} className="text-primary" />
              </div>
              <div className="space-y-0">
                <h3 className="text-white font-black text-[10px] md:text-sm uppercase tracking-tighter italic drop-shadow-lg leading-none">
                  Madrid <span className="text-primary">Live Resonance</span>
                </h3>
                <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest hidden md:block">
                  Malla Geosemántica Activa
                </p>
              </div>
            </div>
          </section>

          {/* [ARQUITECTURA DE CONTENIDO]: 
              El DiscoveryHub gestiona dinámicamente las categorías y los resultados,
              garantizando que la interfaz no colapse visualmente tras el scroll.
          */}

        </div>

        {/* COLUMNA LATERAL (SISTEMA DE GUÍA Y TELEMETRÍA)
            [FIX]: Sidebar Sticky restaurado y coordinado con el padding superior.
        */}
        <aside className="hidden lg:block lg:col-span-1 relative">
          <div className="sticky top-[6.5rem] space-y-6 flex flex-col h-fit">

            {/* Ficha de Misión de Curador */}
            <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 backdrop-blur-md relative overflow-hidden group shadow-xl">
              <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000">
                <Globe size={70} className="text-primary" />
              </div>
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-primary" />
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Consola Operativa</p>
                </div>
                <h4 className="font-bold text-sm text-foreground leading-snug tracking-tight">
                  Tu Bóveda se expande con cada crónica. Fortalece la memoria colectiva de Madrid anclando tus ideas.
                </h4>
                <Link
                  href="/create"
                  className="group/btn flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest transition-all"
                >
                  <span>INICIAR NUEVA FORJA</span>
                  <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Panel de Insights Semánticos del NKV */}
            <InsightPanel resonanceProfile={resonanceProfile} />

            {/* Branding Técnico y Versión */}
            <div className="p-8 text-center bg-white/[0.01] rounded-[2.5rem] border border-white/5 flex flex-col items-center space-y-4 shadow-inner">
              <div className="h-8 w-8 relative opacity-20 hover:opacity-50 transition-opacity">
                <Image
                  src="/nicepod-logo.png"
                  alt="NicePod"
                  fill
                  className="object-contain grayscale"
                />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.5em]">Active Shell V2.5.21</p>
                <div className="flex items-center gap-1.5 justify-center opacity-40">
                  <Zap size={10} className="text-emerald-500" />
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Neural Sync OK</span>
                </div>
              </div>
            </div>

          </div>
        </aside>

      </div>

      {/* TRIGGER DE CREACIÓN UNIVERSAL */}
      <FloatingActionButton />
    </main>
  );
}