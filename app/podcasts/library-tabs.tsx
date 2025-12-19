// app/podcasts/library-tabs.tsx
// VERSIÓN: 4.0 (Remix Stacked Cards + OmniSearch Integration)

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { PodcastWithProfile } from '@/types/podcast';
import { createClient } from '@/lib/supabase/client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PodcastCard } from '@/components/podcast-card';
import { StackedPodcastCard } from '@/components/stacked-podcast-card';
import { LibraryViewSwitcher } from '@/components/library-view-switcher';
import { CompactPodcastCard } from '@/components/compact-podcast-card';
import { CuratedShelvesData } from './page';
import { UniverseCard } from '@/components/universe-card';
import { SmartJobCard } from '@/components/smart-job-card';
import type { Tables } from '@/types/supabase';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { LibraryOmniSearch, SearchResult } from '@/components/library-omni-search';
import { Search, X, Loader2 } from 'lucide-react';

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

// Extensión Local de Tipos para Genealogía
interface PodcastWithGenealogy extends PodcastWithProfile {
    parent_id?: number | null;
    root_id?: number | null;
    replies?: PodcastWithProfile[];
}

// ALGORITMO DE AGRUPACIÓN (Remix Threading)
function groupPodcastsByThread(flatList: PodcastWithProfile[]) {
    // 1. Casting seguro
    const list = flatList as PodcastWithGenealogy[];
    const parentMap = new Map<number, PodcastWithGenealogy>();
    
    // 2. Identificar Padres (Roots)
    list.forEach(pod => {
        if (!pod.parent_id) {
            parentMap.set(pod.id, { ...pod, replies: [] });
        }
    });

    // 3. Asignar Hijos (Remixes)
    list.forEach(pod => {
        if (pod.parent_id) {
            const parent = parentMap.get(pod.parent_id);
            if (parent && parent.replies) {
                parent.replies.push(pod);
            } else {
                // Si el padre no está (ej: es ajeno), el hijo se convierte en carta independiente
                parentMap.set(pod.id, { ...pod, replies: [] });
            }
        }
    });

    // 4. Ordenar Cronológicamente (Más reciente primero)
    return Array.from(parentMap.values()).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

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
    
    // Memoización de la lista agrupada (se recalcula solo si cambia 'podcasts')
    const stackedPodcasts = useMemo(() => groupPodcastsByThread(podcasts), [podcasts]);

    const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!user) return;
        const jobsChannel = supabase.channel(`realtime-jobs:${user.id}`)
            .on<UserCreationJob>('postgres_changes', { event: '*', schema: 'public', table: 'podcast_creation_jobs', filter: `user_id=eq.${user.id}` },
                (payload) => {
                    if (payload.eventType === 'INSERT') { setJobs(prev => [payload.new as UserCreationJob, ...prev]); }
                    if (payload.eventType === 'UPDATE') {
                        if (payload.new.status === 'completed' || payload.new.status === 'failed') {
                            setTimeout(() => {
                                setJobs(prev => prev.filter(job => job.id !== payload.new.id));
                            }, 2000);
                        } else {
                            setJobs(prev => prev.map(job => job.id === payload.new.id ? payload.new as UserCreationJob : job));
                        }
                    }
                }
            ).subscribe();

        const podsChannel = supabase.channel(`realtime-pods:${user.id}`)
            .on<PodcastWithProfile>('postgres_changes', { event: '*', schema: 'public', table: 'micro_pods', filter: `user_id=eq.${user.id}` },
                async (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const { data: newPodcast } = await supabase
                            .from('micro_pods').select('*, profiles(full_name, avatar_url, username)').eq('id', payload.new.id).single();
                        if (newPodcast) setPodcasts(prev => [newPodcast as PodcastWithProfile, ...prev]);
                    }
                    if (payload.eventType === 'UPDATE') {
                        setPodcasts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
                    }
                }
            ).subscribe();

        return () => {
            supabase.removeChannel(jobsChannel);
            supabase.removeChannel(podsChannel);
        };
    }, [user, supabase]);

    const handleTabChange = (tab: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        params.delete('view');
        params.delete('universe');
        router.push(`${pathname}?${params.toString()}`);
        setSearchResults(null);
    };

    // RENDERIZADO DE CONTENIDO (GRID/LISTA)
    const renderGridOrListContent = (podcastsToRender: PodcastWithProfile[]) => {
        if (currentView === 'list') {
            return <div className="space-y-4">{podcastsToRender.map(p => <CompactPodcastCard key={p.id} podcast={p} />)}</div>;
        }

        // Lógica de Selección de Lista:
        // Si la lista que vamos a renderizar es la biblioteca del usuario ("Mis Creaciones"),
        // usamos la versión Agrupada (Stacked).
        // Si es una lista curada (Descubrir), la usamos tal cual pero aplicando el mismo algoritmo por si acaso.
        
        let listToUse = podcastsToRender;
        if (podcastsToRender === podcasts) {
            listToUse = stackedPodcasts; // Versión cacheada para mi librería
        } else {
            listToUse = groupPodcastsByThread(podcastsToRender); // Versión al vuelo para otras listas
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listToUse.map((p: any) => (
                    // Aquí usamos el componente Stacked. Si no tiene replies, se ve normal.
                    <StackedPodcastCard key={p.id} podcast={p} replies={p.replies} />
                ))}
            </div>
        );
    };

    const renderSearchResults = () => {
        if (!searchResults) return null;
        if (searchResults.length === 0) return (
             <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
                <p>No encontramos coincidencias.</p>
                <Button variant="link" onClick={() => setSearchResults(null)}>Volver a la biblioteca</Button>
             </div>
        );

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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {podcastHits.map(hit => (
                                <Link key={hit.id} href={`/podcast/${hit.id}`}>
                                    <div className="group flex gap-4 p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:border-purple-500/50 hover:bg-slate-900/80 transition-all h-full">
                                        <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-black/20">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={hit.image_url} alt={hit.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h4 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors line-clamp-2">{hit.title}</h4>
                                            <span className="text-[10px] bg-purple-900/30 text-purple-200 px-2 py-0.5 rounded border border-purple-800 w-fit mt-2">
                                                {Math.round(hit.similarity * 100)}% Match
                                            </span>
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
            <div className="flex flex-col md:flex-row w-full items-start md:items-center justify-between gap-4 mb-8">
                <div className="w-full md:max-w-md">
                    <LibraryOmniSearch 
                        onSearchStart={() => setIsSearching(true)}
                        onResults={(res) => setSearchResults(res)}
                        onClear={() => setSearchResults(null)}
                    />
                </div>
                {!searchResults && (
                    <div className="flex w-full md:w-auto justify-between md:justify-end items-center gap-4 animate-in fade-in">
                        <TabsList className="grid grid-cols-2 w-full md:w-auto">
                            <TabsTrigger value="discover">Descubrir</TabsTrigger>
                            <TabsTrigger value="library" disabled={!user}>Mi Biblioteca</TabsTrigger>
                        </TabsList>
                        <div className="hidden md:block"><LibraryViewSwitcher /></div>
                    </div>
                )}
            </div>
            {searchResults ? renderSearchResults() : (
                <>
                    <TabsContent value="discover" className="mt-0">
                        <div className="space-y-12">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {universeCategories.map(cat => (
                                    <UniverseCard key={cat.key} title={cat.title} image={cat.image} href={`${pathname}?tab=discover&universe=${cat.key}`} isActive={activeUniverseKey === cat.key} />
                                ))}
                            </div>
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-3xl font-bold tracking-tight">{universeCategories.find(c => c.key === activeUniverseKey)?.title || "Descubre"}</h2>
                                    <div className="md:hidden"><LibraryViewSwitcher /></div>
                                </div>
                                {renderGridOrListContent(curatedShelves?.[activeUniverseKey as keyof CuratedShelvesData] || [])}
                            </section>
                        </div>
                    </TabsContent>
                    <TabsContent value="library" className="mt-0">
                        {user ? ((jobs.length > 0 || podcasts.length > 0) ? (
                                <div className="space-y-12">
                                    {jobs.length > 0 && <section><h2 className="text-xl font-semibold tracking-tight mb-4 text-muted-foreground uppercase">Procesando</h2><div className="space-y-4">{jobs.map((job) => <SmartJobCard key={`job-${job.id}`} job={job} />)}</div></section>}
                                    {podcasts.length > 0 && <section><div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold tracking-tight">Mis Creaciones</h2><div className="md:hidden"><LibraryViewSwitcher /></div></div>{renderGridOrListContent(podcasts)}</section>}
                                </div>
                            ) : (<div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30"><h2 className="text-xl font-semibold text-slate-300">Tu biblioteca está vacía</h2><p className="text-slate-500 mt-2"><Link href="/create" className="text-purple-400 hover:text-purple-300 hover:underline">Crea tu primer micro-podcast</Link> para empezar.</p></div>)
                        ) : (<div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30"><h2 className="text-xl font-semibold text-slate-300">Acceso Restringido</h2><p className="text-slate-500 mt-2"><Link href={`/login?redirect=${pathname}?tab=library`} className="text-purple-400 hover:text-purple-300 hover:underline">Ingresa a tu cuenta</Link> para ver tus creaciones.</p></div>)}
                    </TabsContent>
                </>
            )}
        </Tabs>
    );
}