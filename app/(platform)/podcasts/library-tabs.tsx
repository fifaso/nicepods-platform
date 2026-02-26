// app/podcasts/library-tabs.tsx
// VERSIÓN: 10.0

'use client';

import { createClient } from '@/lib/supabase/client';
import { PodcastWithProfile } from '@/types/podcast';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

// --- INFRAESTRUCTURA DE COMPONENTES ---
import { CompactPodcastCard } from '@/components/compact-podcast-card';
import { LibraryViewSwitcher } from '@/components/library-view-switcher';
import { PulsePillCard } from '@/components/pulse-pill-card';
import { SmartJobCard } from '@/components/smart-job-card';
import { StackedPodcastCard } from '@/components/stacked-podcast-card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UniverseCard } from '@/components/universe-card';

// --- RADAR UNIFICADO (V3.0) ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { SearchResult } from "@/hooks/use-search-radar";

// --- ICONOGRAFÍA ---
import {
    Archive,
    BrainCircuit,
    Loader2,
    Mic2,
    Sparkles,
    User as UserIcon
} from 'lucide-react';

import { groupPodcastsByThread } from '@/lib/podcast-utils';
import { cn } from '@/lib/utils';
import type { Tables } from '@/types/supabase';
import { CuratedShelvesData } from './page';

type UserCreationJob = Tables<'podcast_creation_jobs'>;
type LibraryViewMode = 'grid' | 'list' | 'compass';

interface LibraryTabsProps {
    defaultTab: 'discover' | 'library';
    user: User | null;
    userCreationJobs: UserCreationJob[];
    userCreatedPodcasts: PodcastWithProfile[];
    curatedShelves: CuratedShelvesData | null;
    compassProps: any;
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
    curatedShelves,
}: LibraryTabsProps) {
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // --- ESTADOS DE NAVEGACIÓN ---
    const currentTab = searchParams.get('tab') || defaultTab;
    const currentView = (searchParams.get('view') as LibraryViewMode) || 'grid';
    const activeUniverseKey = searchParams.get('universe') || (user ? 'most_resonant' : 'tech_and_innovation');

    // Filtro interno para la vista privada: 'narrative' | 'pulse'
    const [privateFilter, setPrivateFilter] = useState<'narrative' | 'pulse'>('narrative');

    // --- ESTADOS DE DATOS ---
    const [jobs, setJobs] = useState<UserCreationJob[]>(initialJobs);
    const [podcasts, setPodcasts] = useState<PodcastWithProfile[]>(initialPodcasts);
    const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
    const [isSearching, setIsSearching] = useState<boolean>(false);

    /**
     * SEGMENTACIÓN INTELIGENTE:
     * Dividimos la colección personal en Narrativa (Podcasts largos) y Pulse (Píldoras/Noticias).
     */
    const { regularPodcasts, pulsePills } = useMemo(() => {
        return {
            regularPodcasts: podcasts.filter(p => p.creation_mode !== 'pulse'),
            pulsePills: podcasts.filter(p => p.creation_mode === 'pulse')
        };
    }, [podcasts]);

    /**
     * SINCRONIZACIÓN REALTIME (Bóveda Personal)
     */
    useEffect(() => {
        if (!user) return;

        const jobsChannel = supabase.channel(`library_jobs_${user.id}`)
            .on<UserCreationJob>(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'podcast_creation_jobs', filter: `user_id=eq.${user.id}` },
                (payload) => {
                    if (payload.eventType === 'INSERT') setJobs((p) => [payload.new as UserCreationJob, ...p]);
                    if (payload.eventType === 'UPDATE') {
                        if (payload.new.status === 'completed') {
                            setTimeout(() => setJobs((p) => p.filter(j => j.id !== payload.new.id)), 3000);
                        } else {
                            setJobs((p) => p.map(j => j.id === payload.new.id ? payload.new as UserCreationJob : j));
                        }
                    }
                }
            ).subscribe();

        const podsChannel = supabase.channel(`library_pods_${user.id}`)
            .on<PodcastWithProfile>(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'micro_pods', filter: `user_id=eq.${user.id}` },
                async (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const { data } = await supabase.from('micro_pods').select('*, profiles(*)').eq('id', payload.new.id).single();
                        if (data) setPodcasts((prev) => [data as PodcastWithProfile, ...prev]);
                    }
                }
            ).subscribe();

        return () => {
            supabase.removeChannel(jobsChannel);
            supabase.removeChannel(podsChannel);
        };
    }, [user, supabase]);

    /**
     * RENDERIZADOR DE CONTENIDO (GRID/LISTA)
     */
    const renderContent = (data: PodcastWithProfile[]) => {
        if (data.length === 0) {
            return (
                <div className="py-24 text-center border border-dashed border-white/10 rounded-[2rem] bg-white/[0.01] animate-in fade-in duration-700">
                    <Archive className="mx-auto h-12 w-12 text-zinc-700 mb-4" />
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Colección Vacía</p>
                    <Link href="/create">
                        <Button variant="link" className="mt-2 text-primary text-xs font-bold uppercase tracking-widest">
                            Iniciar primera grabación
                        </Button>
                    </Link>
                </div>
            );
        }

        if (currentView === 'list') {
            return (
                <div className="space-y-3">
                    {data.map(p => <CompactPodcastCard key={p.id} podcast={p} />)}
                </div>
            );
        }

        // Agrupación por hilos para vista Grid
        const displayData = privateFilter === 'pulse' ? data : groupPodcastsByThread(data);

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayData.map((p: any) => (
                    privateFilter === 'pulse'
                        ? <PulsePillCard key={p.id} podcast={p} />
                        : <StackedPodcastCard key={p.id} podcast={p} replies={p.replies} />
                ))}
            </div>
        );
    };

    /**
     * RENDERIZADOR DE RESULTADOS DE BÚSQUEDA (RADAR)
     */
    const renderSearchResults = () => {
        if (!searchResults) return null;

        if (searchResults.length === 0) {
            return (
                <div className="text-center py-32 bg-white/[0.02] rounded-[3rem] border border-white/5 animate-in fade-in">
                    <p className="font-bold uppercase tracking-[0.3em] text-xs opacity-40 mb-6 text-white">Sin Resonancia</p>
                    <Button variant="outline" className="rounded-full border-white/10 text-xs uppercase tracking-widest hover:bg-white hover:text-black" onClick={() => setSearchResults(null)}>
                        Limpiar Radar
                    </Button>
                </div>
            );
        }

        const userHits = searchResults.filter(r => r.result_type === 'user');
        const podcastHits = searchResults.filter(r => r.result_type === 'podcast');
        const vaultHits = searchResults.filter(r => r.result_type === 'vault_chunk');

        return (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {userHits.length > 0 && (
                    <section>
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-2"><UserIcon size={12} /> Curadores</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {userHits.map(hit => (
                                <Link key={hit.id} href={`/profile/${hit.subtitle.replace('@', '')}`}>
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/40 transition-all group">
                                        <Avatar className="h-10 w-10 border border-white/10"><AvatarImage src={hit.image_url} /><AvatarFallback>U</AvatarFallback></Avatar>
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-sm text-white truncate group-hover:text-primary transition-colors">{hit.title}</p>
                                            <p className="text-[9px] text-zinc-500 font-medium truncate">{hit.subtitle}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {podcastHits.length > 0 && (
                    <section>
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-2"><Mic2 size={12} /> Podcasts</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {podcastHits.map(hit => (
                                <Link key={hit.id} href={`/podcast/${hit.id}`}>
                                    <div className="group flex gap-4 p-4 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-primary/40 transition-all h-full">
                                        <div className="h-20 w-20 rounded-xl bg-zinc-900 overflow-hidden relative shrink-0">
                                            <Image src={hit.image_url || '/placeholder.jpg'} alt="" fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center min-w-0">
                                            <h4 className="font-bold text-sm text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors">{hit.title}</h4>
                                            <Badge variant="outline" className="mt-2 w-fit text-[9px] border-white/10 text-zinc-400">{Math.round(hit.similarity * 100)}% Match</Badge>
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

    return (
        <div className="w-full min-h-screen">

            {/* 1. HEADER MONUMENTAL DE BIBLIOTECA */}
            <header className="mb-10 space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-white leading-none">
                            Archivo <span className="text-primary">Global</span>
                        </h1>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">
                            {currentTab === 'discover' ? 'Explorando la red neuronal' : 'Gestionando bóveda personal'}
                        </p>
                    </div>

                    {/* SELECTOR DE MODO DE VISTA */}
                    {!searchResults && (
                        <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
                            <Tabs list-none value={currentTab} className="w-auto">
                                <TabsList className="bg-transparent h-9 p-0 gap-1">
                                    <TabsTrigger
                                        value="discover"
                                        onClick={() => router.push('?tab=discover')}
                                        className="rounded-lg px-4 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black"
                                    >
                                        Descubrir
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="library"
                                        disabled={!user}
                                        onClick={() => router.push('?tab=library')}
                                        className="rounded-lg px-4 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black"
                                    >
                                        Mi Estación
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <Separator orientation="vertical" className="h-5 bg-white/10" />
                            <LibraryViewSwitcher />
                        </div>
                    )}
                </div>

                {/* BUSCADOR HEROICO */}
                <div className="w-full">
                    <UnifiedSearchBar
                        onLoading={setIsSearching}
                        onResults={(res) => { setSearchResults(res); setIsSearching(false); }}
                        onClear={() => { setSearchResults(null); setIsSearching(false); }}
                        placeholder="Buscar en el archivo global..."
                        className="shadow-2xl"
                    />
                </div>
            </header>

            {/* 2. CUERPO DE CONTENIDO */}
            {searchResults ? (
                <div className="animate-in fade-in duration-500">{renderSearchResults()}</div>
            ) : (
                <div className="animate-in slide-in-from-bottom-4 duration-700">

                    {/* VISTA: DESCUBRIR */}
                    {currentTab === 'discover' && (
                        <div className="space-y-12">
                            {/* UNIVERSOS (SCROLL HORIZONTAL) */}
                            <ScrollArea className="w-full whitespace-nowrap pb-4">
                                <div className="flex w-max space-x-4">
                                    {universeCategories.map(cat => (
                                        <div key={cat.key} className="w-[160px] md:w-[200px]">
                                            <UniverseCard
                                                key={cat.key}
                                                title={cat.title}
                                                image={cat.image}
                                                href={`${pathname}?tab=discover&universe=${cat.key}`}
                                                isActive={activeUniverseKey === cat.key}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <ScrollBar orientation="horizontal" className="hidden" />
                            </ScrollArea>

                            {/* ESTANTE PRINCIPAL */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <Sparkles className="text-primary h-5 w-5" />
                                    <h2 className="text-xl font-black uppercase tracking-tighter text-white italic">
                                        {universeCategories.find(c => c.key === activeUniverseKey)?.title || "Destacados"}
                                    </h2>
                                </div>
                                {renderContent(curatedShelves?.[activeUniverseKey as keyof CuratedShelvesData] || [])}
                            </section>
                        </div>
                    )}

                    {/* VISTA: MI ESTACIÓN (PRIVADA) */}
                    {currentTab === 'library' && (
                        <div className="space-y-12">

                            {/* FORJA ACTIVA (JOBS) */}
                            {jobs.length > 0 && (
                                <section className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-6">
                                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                                        <Loader2 className="animate-spin h-3 w-3" /> Procesando
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {jobs.map((job) => <SmartJobCard key={job.id} job={job} />)}
                                    </div>
                                </section>
                            )}

                            {/* FILTROS PRIVADOS (TOGGLE) */}
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <h2 className="text-xl font-black uppercase tracking-tighter text-white italic">Inventario Personal</h2>
                                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setPrivateFilter('narrative')}
                                        className={cn(
                                            "h-7 text-[9px] font-black uppercase tracking-widest rounded-md transition-all",
                                            privateFilter === 'narrative' ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-white"
                                        )}
                                    >
                                        <Mic2 className="h-3 w-3 mr-1.5" /> Narrativa
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setPrivateFilter('pulse')}
                                        className={cn(
                                            "h-7 text-[9px] font-black uppercase tracking-widest rounded-md transition-all",
                                            privateFilter === 'pulse' ? "bg-primary text-black shadow-sm" : "text-zinc-500 hover:text-white"
                                        )}
                                    >
                                        <BrainCircuit className="h-3 w-3 mr-1.5" /> Pulse
                                    </Button>
                                </div>
                            </div>

                            {/* CONTENIDO FILTRADO */}
                            {renderContent(privateFilter === 'narrative' ? regularPodcasts : pulsePills)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}