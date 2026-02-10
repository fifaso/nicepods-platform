// app/(platform)/dashboard/page.tsx
// VERSIÓN: 13.0 (NicePod Architecture Standard - Total Structural Fix)
// Misión: Punto de entrada operativo. Estabilidad de capas, visibilidad de mapa y sidebar persistente.
// [FIX]: Eliminación de solapamiento visual, reducción de espacios muertos y corrección de gradientes.

import { DiscoveryHub } from "@/components/discovery-hub";
import { InsightPanel } from "@/components/insight-panel";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { createClient } from "@/lib/supabase/server";
import { PodcastWithProfile } from "@/types/podcast";
import type { Tables } from "@/types/supabase";
import {
  Activity,
  ChevronRight,
  Globe,
  Loader2,
  Map as MapIcon,
  Zap
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

/**
 * [TYPES]: Definiciones de integridad para el compilador.
 */
type ResonanceProfile = Tables<'user_resonance_profiles'>;

interface DiscoveryFeed {
  epicenter: PodcastWithProfile[] | null;
  semantic_connections: PodcastWithProfile[] | null;
  new_horizons: PodcastWithProfile[] | null;
}

/**
 * [SHIELD]: HIDRATACIÓN ESCALONADA (T2)
 * Cargamos el mapa solo en el cliente para proteger el hilo de renderizado del servidor.
 */
const MapPreviewFrame = dynamic(
  () => import("@/components/geo/map-preview-frame").then((mod) => mod.MapPreviewFrame),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[140px] md:h-[180px] rounded-[2.5rem] bg-zinc-900/50 border border-white/5 animate-pulse flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary/20" />
      </div>
    )
  }
);

/**
 * sanitizePodcasts
 * Garantiza que los metadatos JSONB sean procesables sin errores de hidratación.
 */
function sanitizePodcasts(podcasts: any[] | null): PodcastWithProfile[] {
  if (!podcasts || !Array.isArray(podcasts)) return [];
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
 * DashboardPage: La terminal de entrada táctica de NicePod V2.5.
 */
export default async function DashboardPage() {
  const supabase = createClient();

  // 1. VALIDACIÓN DE IDENTIDAD (Handshake en Servidor)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. RECOPILACIÓN DE INTELIGENCIA PARALELA (NKV & Social)
  const [
    { data: feedData },
    { data: resonanceData },
    { data: profileData }
  ] = await Promise.all([
    supabase.rpc('get_user_discovery_feed', { p_user_id: user.id }),
    supabase.from('user_resonance_profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('profiles').select('full_name, reputation_score').eq('id', user.id).single()
  ]);

  const feed = feedData as DiscoveryFeed;
  const resonanceProfile = resonanceData as ResonanceProfile;
  const userName = profileData?.full_name?.split(' ')[0] || "Curador";

  const safeEpicenter = sanitizePodcasts(feed?.epicenter || []);
  const safeConnections = sanitizePodcasts(feed?.semantic_connections || []);

  return (
    <main className="container mx-auto max-w-screen-xl px-4 lg:px-6">

      {/* 
          GRID MAESTRO: Dividido en 4 columnas. 
          3 columnas para operaciones y 1 para el Panel de Insights persistente.
      */}
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12 pb-24">

        {/* COLUMNA CENTRAL (OP-CENTER) */}
        <div className="lg:col-span-3 space-y-6">

          {/* SECCIÓN I: COMMAND HEADER (Optimizado en altura)
              Reducimos el min-h y los márgenes para ganar espacio operativo.
          */}
          <header className="relative w-full min-h-[80px] md:min-h-[100px] flex items-center justify-between z-40 bg-transparent">

            {/* SALUDO TÁCTICO */}
            <div className="flex flex-col justify-center animate-in fade-in slide-in-from-left-4 duration-1000">
              <div className="flex items-center gap-2 mb-1.5 opacity-50">
                <div className="h-1 w-1 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary">
                  Sincronía de Bóveda Estable
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
                Hola, <span className="text-primary not-italic">{userName}</span>
              </h1>
            </div>

            {/* BUSCADOR EXPANSIVO
                Posicionado absolutamente para cubrir el saludo sin mover el mapa.
            */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full flex justify-end pointer-events-none">
              <div className="pointer-events-auto w-full max-w-full">
                <DiscoveryHub
                  userName={userName}
                  showShelvesOnNoSearch={true}
                  epicenterPodcasts={safeEpicenter}
                  connectionsPodcasts={safeConnections}
                  showOnlyCategories={false}
                />
              </div>
            </div>
          </header>

          {/* SECCIÓN II: PORTAL MADRID (Banner Panorámico - Visibilidad Mejorada)
              [FIX]: Reducimos la intensidad del degradado para dejar ver el mapa.
          */}
          <section className="relative rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border border-white/5 bg-zinc-950 shadow-2xl transition-all duration-700 hover:border-primary/20">
            <div className="h-[140px] md:h-[180px] w-full relative z-0 opacity-50 group-hover:opacity-80 transition-opacity">
              <MapPreviewFrame />
            </div>

            {/* [MEJORA]: Capa de atmósfera suavizada (del 100% al 60% de opacidad en la base) */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none z-10" />

            {/* HUD de localización sutil con z-index superior al gradiente */}
            <div className="absolute bottom-4 left-8 z-20 flex items-center gap-4">
              <div className="p-2.5 bg-primary/20 backdrop-blur-xl rounded-2xl border border-primary/30 shadow-inner">
                <MapIcon size={16} className="text-primary" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-white font-black text-xs md:text-sm uppercase tracking-tighter italic drop-shadow-lg leading-none">
                  Madrid <span className="text-primary">Resonance Live</span>
                </h3>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest hidden md:block">
                  Portal de Memorias 3D Activo
                </p>
              </div>
            </div>
          </section>

          {/* [ARQUITECTURA]: 
              El DiscoveryHub (V9.2) se encarga de renderizar los estantes y las categorías 
              para permitir que desaparezcan instantáneamente cuando se activa la búsqueda.
          */}

        </div>

        {/* COLUMNA LATERAL (GUÍA PERMANENTE)
            [FIX]: Recuperamos el estado 'sticky' absoluto.
        */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[7rem] space-y-6 flex flex-col h-fit">

            {/* Bloque de Misión: Contenido Mejorado */}
            <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 backdrop-blur-md relative overflow-hidden group shadow-xl">
              <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000">
                <Globe size={70} className="text-primary" />
              </div>
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-primary" />
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Estado de Misión</p>
                </div>
                <h4 className="font-bold text-sm text-foreground leading-snug tracking-tight">
                  Tu Bóveda se expande. Registra nuevas crónicas urbanas para aumentar tu influencia en la red global de NicePod.
                </h4>
                <Link
                  href="/create"
                  className="group/link flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest"
                >
                  <span>INICIAR FORJA</span>
                  <ChevronRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Componente de Telemetría Dinámica */}
            <InsightPanel resonanceProfile={resonanceProfile} />

            {/* Branding Técnico de Versión */}
            <div className="p-8 text-center bg-white/[0.02] rounded-[3rem] border border-white/5 flex flex-col items-center space-y-4 shadow-inner">
              <div className="h-8 w-8 relative opacity-20 hover:opacity-50 transition-opacity">
                <Image
                  src="/nicepod-logo.png"
                  alt="NicePod"
                  fill
                  className="object-contain grayscale"
                />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">Intelligence Shell V2.5.15</p>
                <div className="flex items-center gap-1.5 justify-center">
                  <Zap size={10} className="text-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-widest">Neural Link OK</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

      </div>

      {/* Gatillo Universal de Creación */}
      <FloatingActionButton />
    </main>
  );
}