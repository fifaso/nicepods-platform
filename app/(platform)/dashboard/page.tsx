// app/(platform)/dashboard/page.tsx
// VERSIÓN: 12.0 (The Intelligence Command Suite - Operational Excellence)
// Misión: Punto de entrada operativo de NicePod V2.5. Optimizado para densidad y estabilidad absoluta.
// [ESTABILIDAD]: Resolución definitiva de solapamiento visual y tipado estricto para Vercel.

import { DiscoveryHub } from "@/components/discovery-hub";
import { InsightPanel } from "@/components/insight-panel";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { createClient } from "@/lib/supabase/server";
import { PodcastWithProfile } from "@/types/podcast";
import type { Tables } from "@/types/supabase";
import {
  Activity,
  BrainCircuit,
  ChevronRight,
  Globe,
  Loader2,
  Map as MapIcon
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

/**
 * [TYPES]: Definiciones de integridad para el compilador de TypeScript.
 * Garantizamos que ResonanceProfile sea reconocido correctamente en el casting de datos.
 */
type ResonanceProfile = Tables<'user_resonance_profiles'>;

interface DiscoveryFeed {
  epicenter: PodcastWithProfile[] | null;
  semantic_connections: PodcastWithProfile[] | null;
  new_horizons: PodcastWithProfile[] | null;
}

/**
 * [SHIELD]: HIDRATACIÓN ESCALONADA (T2)
 * El Mapa se carga de forma diferida con un skeleton que mantiene el aspect-ratio banner.
 */
const MapPreviewFrame = dynamic(
  () => import("@/components/geo/map-preview-frame").then((mod) => mod.MapPreviewFrame),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[140px] md:h-[180px] rounded-[2.5rem] bg-zinc-950 border border-white/5 animate-pulse flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary/20" />
      </div>
    )
  }
);

/**
 * sanitizePodcasts
 * Normalización de la materia prima narrativa para evitar errores de hidratación JSONB.
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
 * DashboardPage: La terminal de entrada soberana de NicePod.
 */
export default async function DashboardPage() {
  const supabase = createClient();

  // 1. PROTOCOLO DE IDENTIDAD (Server-Side Handshake)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. RECOPILACIÓN DE INTELIGENCIA PARALELA
  // Invocamos el RPC optimizado y recuperamos perfiles en una sola ráfaga de red.
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

  // Procesamiento de datos para los estantes de contenido
  const safeEpicenter = sanitizePodcasts(feed?.epicenter || []);
  const safeConnections = sanitizePodcasts(feed?.semantic_connections || []);

  return (
    <main className="container mx-auto max-w-screen-xl min-h-screen px-4 lg:px-6 overflow-x-hidden">

      {/* GRID MAESTRO DE LA WORKSTATION */}
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12 pt-6 pb-24">

        {/* COLUMNA CENTRAL: CENTRO DE OPERACIONES */}
        <div className="lg:col-span-3 space-y-8">

          {/* SECCIÓN I: COMMAND BAR DINÁMICA
              [ESTABILIDAD]: Contenedor con altura mínima bloqueada (min-h) 
              para evitar que el contenido inferior suba y tape el saludo.
          */}
          <header className="relative w-full min-h-[100px] md:min-h-[120px] flex items-center justify-between z-40 bg-transparent">

            {/* SALUDO DE IDENTIDAD (Capa Estática en el eje visual) */}
            <div className="flex flex-col justify-center animate-in fade-in slide-in-from-left-4 duration-1000">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/70">
                  Sincronía de Red Estable
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
                Hola, <span className="text-primary not-italic">{userName}</span>
              </h1>
            </div>

            {/* BUSCADOR EXPANSIVO (Orquestador de Búsqueda)
                Posicionado absolutamente para permitir la cobertura del saludo sin desplazar el layout.
            */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full flex justify-end pointer-events-none">
              <div className="pointer-events-auto w-full max-w-full">
                <DiscoveryHub
                  userName={userName}
                  showOnlySearch={true}
                />
              </div>
            </div>

          </header>

          {/* SECCIÓN II: PORTAL MADRID (Banner Panorámico Inteligente)
              Altura reducida (140px/180px) para maximizar la visibilidad de los podcasts.
          */}
          <section className="relative rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border border-white/5 bg-zinc-950 shadow-2xl transition-all duration-700 hover:border-primary/20 group">
            <div className="h-[140px] md:h-[180px] w-full relative z-0 opacity-40 group-hover:opacity-60 transition-opacity">
              <MapPreviewFrame />
            </div>

            {/* Capa de atmósfera Aurora integrada */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none z-10" />

            {/* HUD de Localización sutil */}
            <div className="absolute bottom-4 left-8 z-20 flex items-center gap-4">
              <div className="p-2.5 bg-primary/20 backdrop-blur-xl rounded-2xl border border-primary/30 shadow-inner">
                <MapIcon size={16} className="text-primary" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-white font-black text-xs md:text-sm uppercase tracking-tighter italic drop-shadow-lg leading-none">
                  Madrid <span className="text-primary">Resonance Live</span>
                </h3>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest hidden md:block">
                  Inmersión 3D Activa
                </p>
              </div>
            </div>
          </section>

          {/* SECCIÓN III: FEED DE INTELIGENCIA
              [INTEGRACIÓN]: Esta instancia gestiona categorías y estantes de forma estática 
              para que el scroll sea natural y los elementos no se solapen.
          */}
          <div className="relative z-0">
            <DiscoveryHub
              userName={userName}
              showShelvesOnNoSearch={true}
              epicenterPodcasts={safeEpicenter}
              connectionsPodcasts={safeConnections}
              showOnlyCategories={false}
            />
          </div>

        </div>

        {/* COLUMNA LATERAL: INSIGHTS Y TELEMETRÍA (Derecha) */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[7.5rem] space-y-8">

            {/* Card de Misión Táctica */}
            <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 backdrop-blur-md relative overflow-hidden group shadow-xl shadow-primary/5">
              <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000">
                <Globe size={70} className="text-primary" />
              </div>
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-2">
                  <BrainCircuit size={14} className="text-primary" />
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Estado de Misión</p>
                </div>
                <h4 className="font-bold text-sm text-foreground leading-snug tracking-tight">
                  Tu Bóveda se expande con cada crónica. Fortalece la memoria colectiva de Madrid anclando tus ideas.
                </h4>
                <Link
                  href="/create"
                  className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:translate-x-1 transition-transform"
                >
                  Iniciar Forja <ChevronRight size={12} />
                </Link>
              </div>
            </div>

            {/* Panel de Gráficos de Resonancia Semántica */}
            <InsightPanel resonanceProfile={resonanceProfile} />

            {/* Branding Sutil del Ecosistema */}
            <div className="p-10 text-center bg-white/[0.02] rounded-[3rem] border border-white/5 flex flex-col items-center space-y-4 shadow-inner">
              <div className="h-10 w-10 relative opacity-20 hover:opacity-50 transition-opacity">
                <Image
                  src="/nicepod-logo.png"
                  alt="NicePod"
                  fill
                  className="object-contain grayscale"
                />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">Intelligence Shell V2.5.12</p>
                <div className="flex items-center gap-1.5 justify-center">
                  <Activity size={10} className="text-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-widest">Neural Link OK</span>
                </div>
              </div>
            </div>

          </div>
        </aside>

      </div>

      {/* ACCIÓN FLOTANTE UNIVERSAL */}
      <FloatingActionButton />
    </main>
  );
}