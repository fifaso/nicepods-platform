// app/(platform)/podcasts/library-tabs.tsx
// VERSIÓN: 12.0 (NicePod Intelligence Station - Full Integrity Edition)
// Misión: Orquestar la intersección entre la red global y la soberanía privada.
// [ESTABILIZACIÓN]: Garantía de integridad estructural de JSX y protección Radix Context.

"use client";

import { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// --- INFRAESTRUCTURA DE DATOS ---
import { groupPodcastsByThread } from "@/lib/podcast-utils";
import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/types/database.types";
import { PodcastWithProfile } from "@/types/podcast";

// --- COMPONENTE DE NAVEGACIÓN SEMÁNTICA ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { SearchResult } from "@/hooks/use-search-radar";

// --- COMPONENTES DE INTERFAZ DE ALTA DENSIDAD ---
import { CompactPodcastCard } from "@/components/compact-podcast-card";
import { LibraryViewSwitcher } from "@/components/library-view-switcher";
import { SmartJobCard } from "@/components/smart-job-card";
import { StackedPodcastCard } from "@/components/stacked-podcast-card";
import { UniverseCard } from "@/components/universe-card";

// --- UI ATÓMICA ---
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- ICONOGRAFÍA INDUSTRIAL ---
import {
  Archive,
  Loader2,
  Mic2,
  Search,
  Sparkles,
  User as UserIcon,
  Zap
} from "lucide-react";

/**
 * INTERFAZ: CuratedShelvesData
 */
export interface CuratedShelvesData {
  most_resonant: PodcastWithProfile[] | null;
  deep_thought: PodcastWithProfile[] | null;
  practical_tools: PodcastWithProfile[] | null;
  tech_and_innovation: PodcastWithProfile[] | null;
  wellness_and_mind: PodcastWithProfile[] | null;
  narrative_and_stories: PodcastWithProfile[] | null;
}

type UserCreationJob = Tables<'podcast_creation_jobs'>;
type LibraryViewMode = 'grid' | 'list' | 'compass';

interface LibraryTabsProps {
  defaultTab: 'discover' | 'library';
  user: User | null;
  userCreationJobs: UserCreationJob[];
  userCreatedPodcasts: PodcastWithProfile[];
  allPodcasts: PodcastWithProfile[];
  curatedShelves: CuratedShelvesData;
}

const universeCategories = [
  { key: 'most_resonant', title: 'Lo más resonante', image: '/images/universes/resonant.png' },
  { key: 'deep_thought', title: 'Pensamiento', image: '/images/universes/deep-thought.png' },
  { key: 'practical_tools', title: 'Herramientas', image: '/images/universes/practical-tools.png' },
  { key: 'tech_and_innovation', title: 'Innovación', image: '/images/universes/tech.png' },
  { key: 'wellness_and_mind', title: 'Bienestar', image: '/images/universes/wellness.png' },
  { key: 'narrative_and_stories', title: 'Narrativa', image: '/images/universes/narrative.png' },
];

export function LibraryTabs({
  defaultTab,
  user,
  userCreationJobs: initialJobs,
  userCreatedPodcasts: initialPodcasts,
  allPodcasts,
  curatedShelves,
}: LibraryTabsProps) {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // 1. ESTADOS DE CONTROL DE HIDRATACIÓN
  const [isMounted, setIsMounted] = useState(false);

  // 2. GESTIÓN DE DATOS DINÁMICOS
  const [jobs, setJobs] = useState<UserCreationJob[]>(initialJobs);
  const [podcasts, setPodcasts] = useState<PodcastWithProfile[]>(initialPodcasts);
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // 3. SINCRONIZACIÓN DE PERSPECTIVA
  const activeTab = searchParams.get("tab") || defaultTab;
  const currentView = (searchParams.get("view") as LibraryViewMode) || "grid";
  const activeUniverseKey = searchParams.get("universe") || "most_resonant";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * [LIFECYCLE]: Protocolo Realtime
   */
  useEffect(() => {
    if (!user || !isMounted) return;

    const jobsChannel = supabase.channel(`library_jobs_${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'podcast_creation_jobs', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') setJobs(p => [payload.new as UserCreationJob, ...p]);
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as UserCreationJob;
            if (updated.status === 'completed') {
              setTimeout(() => setJobs(p => p.filter(j => j.id !== updated.id)), 2000);
            } else {
              setJobs(p => p.map(j => j.id === updated.id ? updated : j));
            }
          }
        }
      ).subscribe();

    const podsChannel = supabase.channel(`library_pods_${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'micro_pods', filter: `user_id=eq.${user.id}` },
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const { data } = await supabase.from('micro_pods').select('*, profiles(*)').eq('id', payload.new.id).single();
            if (data) {
              setPodcasts(prev => {
                const filtered = prev.filter(p => p.id !== data.id);
                return [data as PodcastWithProfile, ...filtered];
              });
            }
          }
        }
      ).subscribe();

    return () => {
      supabase.removeChannel(jobsChannel);
      supabase.removeChannel(podsChannel);
    };
  }, [user, supabase, isMounted]);

  const isShowSearchResults = useMemo(() => {
    return isMounted && searchResults !== null;
  }, [searchResults, isMounted]);

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  /**
   * RENDER: Resultados del Radar Semántico
   */
  const renderSearchResults = () => {
    if (!searchResults) return null;

    if (searchResults.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-32 bg-black/40 rounded-[3rem] border border-dashed border-white/5 animate-in fade-in duration-500">
          <Search size={48} className="text-zinc-800 mb-6" />
          <h3 className="text-xl font-black uppercase tracking-[0.3em] text-zinc-600">Sin impacto semántico</h3>
          <Button variant="link" onClick={() => setSearchResults(null)} className="mt-4 text-primary font-black uppercase text-xs tracking-widest">
            Reiniciar Escáner
          </Button>
        </div>
      );
    }

    const podcastHits = searchResults.filter(r => r.result_type === 'podcast');
    const userHits = searchResults.filter(r => r.result_type === 'user');

    return (
      <div className="space-y-20 animate-in slide-in-from-bottom-4 duration-1000">
        {userHits.length > 0 && (
          <section className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40 flex items-center gap-3">
              <UserIcon size={12} /> Curadores de la Bóveda
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {userHits.map(hit => (
                <Link key={hit.id} href={`/profile/${hit.subtitle.replace('@', '')}`}>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/40 transition-all group">
                    <Avatar className="h-12 w-12 border border-white/10 group-hover:border-primary transition-colors">
                      <AvatarImage src={hit.image_url} />
                      <AvatarFallback className="bg-zinc-900 text-primary font-black uppercase">{hit.title[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-black text-sm text-white truncate uppercase tracking-tight group-hover:text-primary transition-colors">{hit.title}</p>
                      <p className="text-[9px] font-bold text-zinc-500 tracking-widest uppercase">{hit.subtitle}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {podcastHits.length > 0 && (
          <section className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40 flex items-center gap-3">
              <Mic2 size={12} /> Resonancias Detectadas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {podcastHits.map(hit => (
                <Link key={hit.id} href={`/podcast/${hit.id}`}>
                  <div className="group flex gap-6 p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/50 transition-all h-full shadow-2xl">
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden border border-white/5 bg-black/40">
                      <Image src={hit.image_url || '/placeholder.jpg'} alt={hit.title} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                    </div>
                    <div className="flex flex-col justify-center min-w-0 flex-1">
                      <h5 className="font-black text-sm text-white line-clamp-2 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{hit.title}</h5>
                      <div className="mt-4">
                        <Badge className="bg-primary/10 text-primary text-[8px] font-black px-2 py-0.5 rounded-md border-none uppercase tracking-widest">
                          {Math.round(hit.similarity * 100)}% Match
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  /**
   * RENDER: Listado Matriz (Bóveda / Descubrimiento)
   */
  const renderPodcastList = (data: PodcastWithProfile[]) => {
    if (data.length === 0) {
      return (
        <div className="py-32 text-center border border-dashed border-white/5 rounded-[3rem] bg-black/20 animate-in fade-in duration-700">
          <Archive className="mx-auto h-12 w-12 text-zinc-800 mb-6" />
          <h3 className="text-sm font-black uppercase tracking-[0.4em] text-zinc-600 italic">Silencio Semántico</h3>
          <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest mt-2">La Bóveda espera su primer nodo de conocimiento.</p>
        </div>
      );
    }

    if (currentView === 'list') {
      return (
        <div className="space-y-4">
          {data.map(p => <CompactPodcastCard key={p.id} podcast={p} />)}
        </div>
      );
    }

    const groupedData = groupPodcastsByThread(data);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {groupedData.map((p: any) => (
          <StackedPodcastCard key={p.id} podcast={p} replies={p.replies} />
        ))}
      </div>
    );
  };

  // PROTECCIÓN DE HIDRATACIÓN
  if (!isMounted) {
    return (
      <div className="w-full flex items-center justify-center py-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary/20" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-16 animate-in fade-in duration-1000">

      {/* 
          [FIX TOPOLÓGICO CRÍTICO]: Todo envuelto dentro del proveedor <Tabs>
      */}
      <Tabs value={isShowSearchResults ? 'search' : activeTab} className="w-full">

        {/* --- HEADER TÁCTICO --- */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-10 mb-16">
          <div className="w-full md:max-w-3xl">
            <UnifiedSearchBar
              onLoading={setIsSearching}
              onResults={setSearchResults}
              onClear={() => setSearchResults(null)}
              placeholder="Escribe una idea para activar el radar de Madrid..."
            />
          </div>

          {/* 
              SWITCHER DE VISTA (TabsList)
              CSS gestiona la visibilidad sin desmontar el componente del DOM.
          */}
          <div className={`flex items-center gap-4 p-2 bg-zinc-950/40 rounded-[2rem] border border-white/5 backdrop-blur-3xl shadow-inner transition-all duration-500 ${isShowSearchResults ? 'opacity-0 pointer-events-none absolute' : 'opacity-100 relative'}`}>
            <TabsList className="bg-transparent border-none p-0 h-auto gap-1">
              <TabsTrigger
                value="discover"
                onClick={() => handleTabChange('discover')}
                className="rounded-xl px-10 font-black text-[10px] uppercase tracking-[0.2em] h-12 data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
              >
                <Zap className="h-3.5 w-3.5 mr-2" /> Descubrir
              </TabsTrigger>
              <TabsTrigger
                value="library"
                disabled={!user}
                onClick={() => handleTabChange('library')}
                className="rounded-xl px-10 font-black text-[10px] uppercase tracking-[0.2em] h-12 data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
              >
                Mi Estación
              </TabsTrigger>
            </TabsList>
            <Separator orientation="vertical" className="h-8 bg-white/10 mx-2" />
            <LibraryViewSwitcher />
          </div>
        </section>

        {/* --- VISTAS DINÁMICAS --- */}

        {/* VISTA A: RESULTADOS RADAR */}
        <TabsContent value="search" className="mt-0 outline-none">
          {renderSearchResults()}
        </TabsContent>

        {/* VISTA B: DESCUBRIMIENTO GLOBAL */}
        <TabsContent value="discover" className="mt-0 space-y-24 outline-none animate-in fade-in duration-1000">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {universeCategories.map(cat => (
              <UniverseCard
                key={cat.key}
                title={cat.title}
                image={cat.image}
                isActive={activeUniverseKey === cat.key}
                href={`${pathname}?tab=discover&universe=${cat.key}`}
              />
            ))}
          </div>

          <section className="space-y-12">
            <div className="flex items-center gap-4 border-b border-white/5 pb-8">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tighter italic text-white">
                {universeCategories.find(c => c.key === activeUniverseKey)?.title || "Resonancias"}
              </h2>
            </div>
            {renderPodcastList(curatedShelves[activeUniverseKey as keyof CuratedShelvesData] || allPodcasts)}
          </section>
        </TabsContent>

        {/* VISTA C: SOBERANÍA PERSONAL */}
        <TabsContent value="library" className="mt-0 space-y-20 outline-none animate-in slide-in-from-bottom-6 duration-1000">

          {jobs.length > 0 && (
            <section className="space-y-10 p-10 rounded-[3.5rem] bg-primary/[0.03] border border-primary/10 shadow-2xl">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <Zap className="h-4 w-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-white italic">Forjando Sabiduría</h2>
                  <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.3em]">Sincronía neuronal con Madrid en curso...</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {jobs.map(job => <SmartJobCard key={job.id} job={job} />)}
              </div>
            </section>
          )}

          <section className="space-y-12">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                  <Zap className="h-6 w-6 text-primary fill-primary" />
                </div>
                <h2 className="text-5xl font-black uppercase tracking-tighter text-white italic">Mi Bóveda</h2>
              </div>
              <div className="flex flex-col items-end">
                <Badge variant="outline" className="border-white/10 text-zinc-500 font-black text-[10px] uppercase tracking-[0.3em] px-5 py-2 rounded-full backdrop-blur-xl">
                  {podcasts.length} RESONANCIAS ACTIVAS
                </Badge>
              </div>
            </div>

            {renderPodcastList(podcasts)}
          </section>
        </TabsContent>

      </Tabs>
    </div>
  );
}