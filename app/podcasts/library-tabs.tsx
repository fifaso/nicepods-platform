// app/podcasts/library-tabs.tsx
// VERSIÓN: 6.2 (Production Ready - Full Integrity & Zero Console Errors)

'use client';

import { createClient } from '@/lib/supabase/client';
import { PodcastWithProfile } from '@/types/podcast';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { CompactPodcastCard } from '@/components/compact-podcast-card';
import { LibraryOmniSearch, SearchResult } from '@/components/library-omni-search';
import { LibraryViewSwitcher } from '@/components/library-view-switcher';
import { PulsePillCard } from '@/components/pulse-pill-card';
import { SmartJobCard } from '@/components/smart-job-card';
import { StackedPodcastCard } from '@/components/stacked-podcast-card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge"; // [FIX]: Importación de Badge restaurada
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UniverseCard } from '@/components/universe-card';

import {
    BrainCircuit,
    Loader2,
    Sparkles,
    TrendingUp
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
    defaultTab, user, userCreationJobs: initialJobs, userCreatedPodcasts: initialPodcasts, curatedShelves,
}: LibraryTabsProps) {
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // --- ESTADOS DE NAVEGACIÓN ---
    const currentTab = searchParams.get('tab') || defaultTab;
    const currentView = (searchParams.get('view') as LibraryViewMode) || 'grid';
    const activeUniverseKey = searchParams.get('universe') || (user ? 'most_resonant' : 'tech_and_innovation');
    const contentFilter = searchParams.get('filter') || 'all';

    const [jobs, setJobs] = useState(initialJobs);
    const [podcasts, setPodcasts] = useState(initialPodcasts);
    const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
    const [isSearching, setIsSearching] = useState(false); // [FIX]: Estado para onSearchStart

    // --- SEGMENTACIÓN ESTRATÉGICA ---
    const { regularPodcasts, pulsePills } = useMemo(() => {
        return {
            regularPodcasts: podcasts.filter(p => p.creation_mode !== 'pulse'),
            pulsePills: podcasts.filter(p => p.creation_mode === 'pulse')
        };
    }, [podcasts]);

    // --- SINCRONIZACIÓN REALTIME ---
    useEffect(() => {
        if (!user) return;

        const jobsChannel = supabase.channel(`library_jobs:${user.id}`)
            .on<UserCreationJob>('postgres_changes', { event: '*', schema: 'public', table: 'podcast_creation_jobs', filter: `user_id=eq.${user.id}` },
                (payload) => {
                    if (payload.eventType === 'INSERT') { setJobs(prev => [payload.new as UserCreationJob, ...prev]); }
                    if (payload.eventType === 'UPDATE') {
                        if (payload.new.status === 'completed' || payload.new.status === 'failed') {
                            setTimeout(() => setJobs(prev => prev.filter(job => job.id !== payload.new.id)), 2000);
                        } else {
                            setJobs(prev => prev.map(job => job.id === payload.new.id ? payload.new as UserCreationJob : job));
                        }
                    }
                }
            ).subscribe();

        const podsChannel = supabase.channel(`library_pods:${user.id}`)
            .on<PodcastWithProfile>('postgres_changes', { event: '*', schema: 'public', table: 'micro_pods', filter: `user_id=eq.${user.id}` },
                async (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const { data: newPodcast } = await supabase.from('micro_pods').select('*, profiles(*)').eq('id', payload.new.id).single();
                        if (newPodcast) setPodcasts(prev => [newPodcast as PodcastWithProfile, ...prev]);
                    }
                    if (payload.eventType === 'UPDATE') {
                        setPodcasts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new as PodcastWithProfile } : p));
                    }
                }
            ).subscribe();

        return () => {
            supabase.removeChannel(jobsChannel);
            supabase.removeChannel(podsChannel);
        };
    }, [user, supabase]);

    const handleFilterChange = (filter: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('filter', filter);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // --- RENDERIZADORES DE CONTENIDO ---
    const renderContent = (data: PodcastWithProfile[]) => {
        if (data.length === 0) {
            return (
                <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01] animate-in fade-in duration-700">
                    <Sparkles className="mx-auto h-12 w-12 text-primary opacity-20 mb-4" />
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-white/30 italic">Frecuencia Vacía</p>
                </div>
            );
        }

        if (currentView === 'list') {
            return <div className="space-y-4">{data.map(p => <CompactPodcastCard key={p.id} podcast={p} />)}</div>;
        }

        const displayData = contentFilter === 'pills' ? data : groupPodcastsByThread(data);

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayData.map((p: any) => (
                    contentFilter === 'pills'
                        ? <PulsePillCard key={p.id} podcast={p} />
                        : <StackedPodcastCard key={p.id} podcast={p} replies={p.replies} />
                ))}
            </div>
        );
    };

    const renderSearchResults = () => {
        if (!searchResults) return null;
        if (searchResults.length === 0) return (
            <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[3rem] bg-black/20">
                <p className="font-bold uppercase tracking-widest text-xs opacity-50 mb-4 text-white">Sin señales detectadas</p>
                <Button variant="ghost" className="text-primary font-black uppercase text-[10px]" onClick={() => setSearchResults(null)}>Reiniciar Escáner</Button>
            </div>
        );

        const podcastHits = searchResults.filter(r => r.type === 'podcast');
        const userHits = searchResults.filter(r => r.type === 'user');

        return (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {userHits.length > 0 && (
                    <section>
                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-6 pl-1">Curadores</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {userHits.map(hit => (
                                <Link key={hit.id} href={`/profile/${hit.subtitle.replace('@', '')}`}>
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/40 transition-all group">
                                        <Avatar className="h-12 w-12 border border-white/10 group-hover:border-primary transition-colors">
                                            <AvatarImage src={hit.image_url} />
                                            <AvatarFallback className="font-bold">{hit.title[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="font-black text-sm text-white truncate uppercase">{hit.title}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium truncate tracking-tighter">{hit.subtitle}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {podcastHits.length > 0 && (
                    <section>
                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-6 pl-1">Impactos Semánticos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {podcastHits.map(hit => (
                                <Link key={hit.id} href={`/podcast/${hit.id}`}>
                                    <div className="group flex gap-5 p-5 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-black/40 transition-all h-full shadow-2xl">
                                        <div className="relative h-24 w-24 flex-shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-black/20">
                                            <img src={hit.image_url} alt="" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h4 className="font-black text-sm md:text-base text-white group-hover:text-primary transition-colors line-clamp-2 uppercase tracking-tight">{hit.title}</h4>
                                            <div className="flex items-center gap-2 mt-3">
                                                <div className="px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-[9px] font-black text-primary uppercase">
                                                    <TrendingUp className="h-3 w-3 inline mr-1" />
                                                    {Math.round(hit.similarity * 100)}% Match
                                                </div>
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

    return (
        <Tabs value={searchResults ? 'search' : currentTab} className="w-full">

            {/* BARRA DE HERRAMIENTAS SUPERIOR */}
            <div className="flex flex-col gap-6 md:gap-0 md:flex-row w-full items-center justify-between mb-12">
                <div className="w-full md:max-w-xl">
                    {/* [FIX]: onSearchStart añadido para cumplir con LibraryOmniSearchProps */}
                    <LibraryOmniSearch
                        onSearchStart={() => setIsSearching(true)}
                        onResults={(res) => {
                            setSearchResults(res);
                            setIsSearching(false);
                        }}
                        onClear={() => {
                            setSearchResults(null);
                            setIsSearching(false);
                        }}
                    />
                </div>

                {!searchResults && (
                    <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-[1.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
                        <TabsList className="bg-transparent border-none p-0 h-auto">
                            <TabsTrigger
                                value="discover"
                                onClick={() => router.push('?tab=discover')}
                                className="rounded-xl px-6 font-black text-[9px] uppercase tracking-widest h-9"
                            >
                                Descubrir
                            </TabsTrigger>
                            <TabsTrigger
                                value="library"
                                disabled={!user}
                                onClick={() => router.push('?tab=library')}
                                className="rounded-xl px-6 font-black text-[9px] uppercase tracking-widest h-9"
                            >
                                Mi Estación
                            </TabsTrigger>
                        </TabsList>
                        <Separator orientation="vertical" className="h-6 bg-white/10 mx-1" />

                        {/* FILTRO PULSE PREMIUM */}
                        {currentTab === 'library' && (
                            <div className="flex items-center gap-1.5 px-2 border-r border-white/10 mr-1">
                                <Button
                                    variant="ghost" size="sm"
                                    onClick={() => handleFilterChange('all')}
                                    className={cn("rounded-lg h-8 text-[9px] font-black uppercase px-3", contentFilter === 'all' ? "bg-white text-black" : "text-white/40")}
                                >
                                    Narrativa
                                </Button>
                                <Button
                                    variant="ghost" size="sm"
                                    onClick={() => handleFilterChange('pills')}
                                    className={cn(
                                        "rounded-lg h-8 text-[9px] font-black uppercase px-3 transition-all duration-500",
                                        contentFilter === 'pills' ? "bg-aurora animate-aurora text-white shadow-lg" : "text-white/40"
                                    )}
                                >
                                    <BrainCircuit className="mr-1.5 h-3.5 w-3.5" /> Pulse
                                </Button>
                            </div>
                        )}

                        <LibraryViewSwitcher />
                    </div>
                )}
            </div>

            {searchResults ? renderSearchResults() : (
                <>
                    <TabsContent value="discover" className="mt-0 space-y-12 animate-in fade-in duration-700 outline-none">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {universeCategories.map(cat => (
                                <UniverseCard
                                    key={cat.key}
                                    title={cat.title}
                                    image={cat.image}
                                    href={`${pathname}?tab=discover&universe=${cat.key}`}
                                    isActive={activeUniverseKey === cat.key}
                                />
                            ))}
                        </div>
                        <section className="space-y-8">
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
                                    {universeCategories.find(c => c.key === activeUniverseKey)?.title || "Descubre"}
                                </h2>
                                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase">
                                    Actualizado
                                </Badge>
                            </div>
                            {renderContent(curatedShelves?.[activeUniverseKey as keyof CuratedShelvesData] || [])}
                        </section>
                    </TabsContent>

                    <TabsContent value="library" className="mt-0 animate-in slide-in-from-bottom-2 duration-700 outline-none">
                        <div className="space-y-12">
                            {/* ESTACIÓN DE TRABAJO (JOBS) */}
                            {jobs.length > 0 && (
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-xl"><Loader2 className="h-4 w-4 text-primary animate-spin" /></div>
                                        <h2 className="text-xl font-black uppercase tracking-tighter text-white">Forjando Sabiduría</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {jobs.map((job) => <SmartJobCard key={job.id} job={job} />)}
                                    </div>
                                </section>
                            )}

                            {/* INVENTARIO PERSONAL */}
                            <section className="space-y-8">
                                <h2 className="text-3xl font-black uppercase tracking-tighter text-white px-1">
                                    {contentFilter === 'pills' ? 'Dossier de Inteligencia Pulse' : 'Mis Creaciones Narrativas'}
                                </h2>
                                {renderContent(contentFilter === 'pills' ? pulsePills : regularPodcasts)}
                            </section>
                        </div>
                    </TabsContent>
                </>
            )}
        </Tabs>
    );
}