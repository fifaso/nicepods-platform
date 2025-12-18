// app/podcasts/library-tabs.tsx
// VERSIÓN: 2.0 (Omni-Search Integration)

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { PodcastWithProfile } from '@/types/podcast';
import { createClient } from '@/lib/supabase/client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PodcastCard } from '@/components/podcast-card';
import { LibraryViewSwitcher } from '@/components/library-view-switcher';
import { CompactPodcastCard } from '@/components/compact-podcast-card';
import { CuratedShelvesData } from './page';
import { UniverseCard } from '@/components/universe-card';
import { SmartJobCard } from '@/components/smart-job-card';
import type { Tables } from '@/types/supabase';
import { useMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// [NUEVO] Importamos el Buscador Inteligente
import { LibraryOmniSearch, SearchResult } from '@/components/library-omni-search';

type UserCreationJob = Tables<'podcast_creation_jobs'>;
type ResonanceProfile = Tables<'user_resonance_profiles'>;
type LibraryViewMode = 'grid' | 'list' | 'compass';

interface LibraryTabsProps {
  defaultTab: 'discover' | 'library';
  user: User | null;
  userCreationJobs: UserCreationJob[];
  userCreatedPodcasts: PodcastWithProfile[];
  curatedShelves: CuratedShelvesData | null;
  compassProps: { 
    userProfile: ResonanceProfile | null;
    podcasts: PodcastWithProfile[];
    tags: string[];
  } | null;
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
  defaultTab, user, userCreationJobs: initialJobs, userCreatedPodcasts: initialPodcasts, curatedShelves, compassProps,
}: LibraryTabsProps) {
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const currentTab = searchParams.get('tab') || defaultTab;
    const currentView = (searchParams.get('view') as LibraryViewMode) || 'grid';
    const activeUniverseKey = searchParams.get('universe') || (user ? 'most_resonant' : 'tech_and_innovation');

    const [jobs, setJobs] = useState(initialJobs);
    const [podcasts, setPodcasts] = useState(initialPodcasts);
    
    // [ESTADO BÚSQUEDA]: Si no es null, estamos en modo búsqueda
    const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Realtime (Sin cambios)
    useEffect(() => {
        if (!user) return;
        const jobsChannel = supabase.channel(`realtime-jobs:${user.id}`)
            .on<UserCreationJob>('postgres_changes', { event: '*', schema: 'public', table: 'podcast_creation_jobs', filter: `user_id=eq.${user.id}` },
                (payload) => {
                    if (payload.eventType === 'INSERT') { setJobs(prev => [payload.new as UserCreationJob, ...prev]); }
                    if (payload.eventType === 'UPDATE') { setJobs(prev => prev.map(job => job.id === payload.new.id ? payload.new as UserCreationJob : job)); }
                }
            ).subscribe();
        return () => { supabase.removeChannel(jobsChannel); };
    }, [user, supabase]);

    const handleTabChange = (tab: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        params.delete('view');
        params.delete('universe');
        router.push(`${pathname}?${params.toString()}`);
        setSearchResults(null); // Limpiar búsqueda al cambiar tab
    };

    const renderGridOrListContent = (podcastsToRender: PodcastWithProfile[]) => {
        if (currentView === 'list') {
            return <div className="space-y-4">{podcastsToRender.map(p => <CompactPodcastCard key={p.id} podcast={p} />)}</div>;
        }
        return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{podcastsToRender.map(p => <PodcastCard key={p.id} podcast={p} />)}</div>;
    };

    // Renderizador de Resultados de Búsqueda
    const renderSearchResults = () => {
        if (!searchResults) return null;
        if (searchResults.length === 0) return (
             <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
                <p>No encontramos coincidencias semánticas o textuales.</p>
                <Button variant="link" onClick={() => setSearchResults(null)}>Volver a la biblioteca</Button>
             </div>
        );

        // Separamos podcasts y usuarios
        const podcastHits = searchResults.filter(r => r.type === 'podcast');
        const userHits = searchResults.filter(r => r.type === 'user');

        return (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {userHits.length > 0 && (
                    <section>
                         <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 pl-1">Creadores</h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {userHits.map(hit => (
                                <Link key={hit.id} href={`/profile/${hit.subtitle.replace('@', '')}`}>
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 hover:bg-slate-800 border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={hit.image_url} />
                                            <AvatarFallback>{hit.title[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm truncate">{hit.title}</p>
                                            <p className="text-xs text-muted-foreground truncate">{hit.subtitle}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                         </div>
                    </section>
                )}

                {podcastHits.length > 0 && (
                    <section>
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 pl-1">Podcasts Encontrados</h3>
                        <div className="space-y-4">
                            {podcastHits.map(hit => (
                                <Link key={hit.id} href={`/podcast/${hit.id}`}>
                                    <div className="group flex gap-4 p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:border-purple-500/50 hover:bg-slate-900/80 transition-all">
                                        <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-black/20">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={hit.image_url} alt={hit.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-lg text-white group-hover:text-purple-300 transition-colors line-clamp-1">{hit.title}</h4>
                                                <span className="text-[10px] bg-purple-900/30 text-purple-200 px-2 py-0.5 rounded border border-purple-800">
                                                    {Math.round(hit.similarity * 100)}% Match
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{hit.subtitle || "Sin descripción disponible."}</p>
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
        <Tabs value={searchResults ? 'search' : currentTab} onValueChange={handleTabChange} className="w-full">
            
            {/* CABECERA: Buscador + Controles */}
            <div className="flex flex-col md:flex-row w-full items-start md:items-center justify-between gap-4 mb-8">
                
                {/* 1. BUSCADOR INTELIGENTE (Ocupa espacio flexible) */}
                <div className="w-full md:max-w-md">
                    <LibraryOmniSearch 
                        onSearchStart={() => setIsSearching(true)}
                        onResults={(res) => setSearchResults(res)}
                        onClear={() => setSearchResults(null)}
                    />
                </div>

                {/* 2. CONTROLES (Tabs + View Switcher) */}
                {/* Se ocultan visualmente si hay búsqueda activa para limpiar la UI */}
                {!searchResults && (
                    <div className="flex w-full md:w-auto justify-between md:justify-end items-center gap-4 animate-in fade-in">
                        <TabsList className="grid grid-cols-2 w-full md:w-auto">
                            <TabsTrigger value="discover">Descubrir</TabsTrigger>
                            <TabsTrigger value="library" disabled={!user}>Mi Biblioteca</TabsTrigger>
                        </TabsList>
                        <div className="hidden md:block">
                             <LibraryViewSwitcher />
                        </div>
                    </div>
                )}
            </div>
      
            {/* CONTENIDO PRINCIPAL */}
            {searchResults ? (
                // MODO BÚSQUEDA ACTIVA
                renderSearchResults()
            ) : (
                // MODO NORMAL (TABS)
                <>
                    <TabsContent value="discover" className="mt-0">
                        <div className="space-y-12">
                            {/* Universos */}
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
                            
                            {/* Estantería Temática */}
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-3xl font-bold tracking-tight">
                                        {universeCategories.find(c => c.key === activeUniverseKey)?.title || "Descubre"}
                                    </h2>
                                    {/* View Switcher móvil (solo si no estamos buscando) */}
                                    <div className="md:hidden"><LibraryViewSwitcher /></div>
                                </div>
                                {renderGridOrListContent(curatedShelves?.[activeUniverseKey as keyof CuratedShelvesData] || [])}
                            </section>
                        </div>
                    </TabsContent>
            
                    <TabsContent value="library" className="mt-0">
                        {user ? (
                            (jobs.length > 0 || podcasts.length > 0) ? (
                                <div className="space-y-12">
                                    {jobs.length > 0 && (
                                        <section>
                                            <h2 className="text-xl font-semibold tracking-tight mb-4 text-muted-foreground uppercase">Procesando</h2>
                                            <div className="space-y-4">
                                                {jobs.map((job) => <SmartJobCard key={`job-${job.id}`} job={job} />)}
                                            </div>
                                        </section>
                                    )}
                                    {podcasts.length > 0 && (
                                        <section>
                                            <div className="flex items-center justify-between mb-6">
                                                <h2 className="text-2xl font-bold tracking-tight">Mis Creaciones</h2>
                                                <div className="md:hidden"><LibraryViewSwitcher /></div>
                                            </div>
                                            {renderGridOrListContent(podcasts)}
                                        </section>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                                    <h2 className="text-xl font-semibold text-slate-300">Tu biblioteca está vacía</h2>
                                    <p className="text-slate-500 mt-2"><Link href="/create" className="text-purple-400 hover:text-purple-300 hover:underline">Crea tu primer micro-podcast</Link> para empezar.</p>
                                </div>
                            )
                        ) : (
                            <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                                <h2 className="text-xl font-semibold text-slate-300">Acceso Restringido</h2>
                                <p className="text-slate-500 mt-2"><Link href={`/login?redirect=${pathname}?tab=library`} className="text-purple-400 hover:text-purple-300 hover:underline">Ingresa a tu cuenta</Link> para ver tus creaciones.</p>
                            </div>
                        )}
                    </TabsContent>
                </>
            )}
        </Tabs>
    );
}