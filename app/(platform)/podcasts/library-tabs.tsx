// app/(platform)/podcasts/library-tabs.tsx
// VERSIÓN: 9.1

'use client';

import { createClient } from '@/lib/supabase/client';
import { PodcastWithProfile } from '@/types/podcast';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// --- INFRAESTRUCTURA DE COMPONENTES DE ALTA FIDELIDAD ---
import { LibraryViewSwitcher } from '@/components/library-view-switcher';
import { SmartJobCard } from '@/components/smart-job-card';
import { StackedPodcastCard } from '@/components/stacked-podcast-card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UniverseCard } from '@/components/universe-card';

// --- NUEVO SISTEMA DE RADAR UNIFICADO ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { SearchResult } from "@/hooks/use-search-radar";

// --- ICONOGRAFÍA TÉCNICA ---
import {
    BookOpen,
    History,
    Loader2,
    Mic2,
    TrendingUp,
    User as UserIcon
} from 'lucide-react';

import type { Tables } from '@/types/supabase';
import { CuratedShelvesData } from './page';

/**
 * Definiciones de tipos para el ecosistema de la biblioteca.
 */
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

/**
 * Configuración de Universos Semánticos (Frecuencias).
 */
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

    // --- ESTADOS DE NAVEGACIÓN Y FILTRADO ---
    const currentTab = searchParams.get('tab') || defaultTab;
    const activeUniverseKey = searchParams.get('universe') || (user ? 'most_resonant' : 'tech_and_innovation');
    const contentFilter = searchParams.get('filter') || 'all';

    // --- ESTADOS DE DATOS LOCALES ---
    const [jobs, setJobs] = useState<UserCreationJob[]>(initialJobs);
    const [podcasts, setPodcasts] = useState<PodcastWithProfile[]>(initialPodcasts);
    const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
    const [isSearching, setIsSearching] = useState<boolean>(false);

    /**
     * [CORE] SINCRONIZACIÓN REALTIME
     * Mantiene la biblioteca actualizada ante nuevos podcasts o tareas de IA.
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

        return () => {
            supabase.removeChannel(jobsChannel);
        };
    }, [user, supabase]);

    /**
     * renderSearchResults (V4.0 - Master Intelligence Display)
     * Despliega impactos unificados: Podcasts, Usuarios y Hechos de la Bóveda.
     */
    const renderSearchResults = () => {
        if (!searchResults) return null;

        if (searchResults.length === 0) {
            return (
                <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[3rem] bg-black/20 animate-in fade-in duration-500">
                    <p className="font-bold uppercase tracking-[0.4em] text-[10px] opacity-30 mb-6 text-white">Frecuencia no detectada</p>
                    <Button
                        variant="ghost"
                        className="text-primary font-black uppercase text-[10px] tracking-widest border border-primary/20 hover:bg-primary/10 rounded-full px-8"
                        onClick={() => setSearchResults(null)}
                    >
                        Reiniciar Escáner
                    </Button>
                </div>
            );
        }

        const userHits = searchResults.filter(r => r.result_type === 'user');
        const podcastHits = searchResults.filter(r => r.result_type === 'podcast');
        const vaultHits = searchResults.filter(r => r.result_type === 'vault_chunk');

        return (
            <div className="space-y-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                {/* CURADORES HALLADOS */}
                {userHits.length > 0 && (
                    <section className="space-y-8">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] flex items-center gap-3">
                            <UserIcon size={12} className="text-primary/60" /> Curadores del Archivo
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {userHits.map(hit => (
                                <Link key={hit.id} href={`/profile/${hit.subtitle.replace('@', '')}`}>
                                    <div className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/40 hover:bg-white/[0.04] transition-all group shadow-xl">
                                        <Avatar className="h-14 w-14 border border-white/10 group-hover:border-primary transition-colors">
                                            <AvatarImage src={hit.image_url} />
                                            <AvatarFallback className="font-black text-sm bg-zinc-900 text-primary">{hit.title.substring(0, 1).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="font-black text-sm text-white truncate uppercase tracking-tight group-hover:text-primary transition-colors">{hit.title}</p>
                                            <p className="text-[10px] text-zinc-500 font-bold truncate tracking-widest uppercase mt-0.5">{hit.subtitle}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* CRÓNICAS SONORAS */}
                {podcastHits.length > 0 && (
                    <section className="space-y-8">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] flex items-center gap-3">
                            <Mic2 size={12} className="text-primary/60" /> Crónicas de Sabiduría
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {podcastHits.map(hit => (
                                <Link key={hit.id} href={`/podcast/${hit.id}`}>
                                    <div className="group flex gap-6 p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/50 hover:bg-black/40 transition-all h-full shadow-2xl">
                                        <div className="relative h-28 w-28 flex-shrink-0 rounded-3xl overflow-hidden border border-white/10 bg-black/20">
                                            <Image
                                                src={hit.image_url || '/placeholder.jpg'}
                                                alt={hit.title}
                                                fill
                                                sizes="112px"
                                                className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h4 className="font-black text-sm md:text-base text-white group-hover:text-primary transition-colors line-clamp-2 uppercase tracking-tight leading-tight">
                                                {hit.title}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-4">
                                                <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">
                                                    <TrendingUp className="h-3 w-3 inline mr-1" />
                                                    {Math.round(hit.similarity * 100)}% Resonancia
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* HECHOS DE LA BÓVEDA NKV */}
                {vaultHits.length > 0 && (
                    <section className="space-y-8">
                        <h3 className="text-[10px] font-black text-primary/60 uppercase tracking-[0.5em] flex items-center gap-3">
                            <BookOpen size={12} /> Hechos Atómicos de la Bóveda
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {vaultHits.map(hit => (
                                <div key={hit.id} className="p-8 rounded-[2.5rem] bg-primary/[0.02] border border-primary/10 hover:border-primary/30 transition-all shadow-inner group">
                                    <h4 className="text-[10px] font-black text-primary uppercase mb-4 tracking-[0.3em] opacity-60 flex items-center gap-3">
                                        <History size={12} /> {hit.title}
                                    </h4>
                                    <p className="text-xs text-zinc-400 font-medium italic leading-relaxed">
                                        "{hit.subtitle}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        );
    };

    return (
        <Tabs value={searchResults ? 'search' : currentTab} className="w-full">

            {/* CABECERA TÁCTICA: RADAR UNIFICADO */}
            <div className="flex flex-col gap-10 md:gap-0 md:flex-row w-full items-center justify-between mb-16">
                <div className="w-full md:max-w-2xl">
                    <UnifiedSearchBar
                        onLoading={setIsSearching}
                        onResults={(res) => {
                            setSearchResults(res);
                            setIsSearching(false);
                        }}
                        onClear={() => {
                            setSearchResults(null);
                            setIsSearching(false);
                        }}
                        placeholder="Escribe un concepto para activar el radar semántico..."
                    />
                </div>

                {!searchResults && (
                    <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-[1.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
                        <TabsList className="bg-transparent border-none p-0 h-auto">
                            <TabsTrigger
                                value="discover"
                                onClick={() => router.push('?tab=discover')}
                                className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest h-10"
                            >
                                Descubrir
                            </TabsTrigger>
                            <TabsTrigger
                                value="library"
                                disabled={!user}
                                onClick={() => router.push('?tab=library')}
                                className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest h-10"
                            >
                                Mi Estación
                            </TabsTrigger>
                        </TabsList>
                        <Separator orientation="vertical" className="h-8 bg-white/10 mx-1" />
                        <LibraryViewSwitcher />
                    </div>
                )}
            </div>

            {/* CUERPO DINÁMICO */}
            {searchResults ? (
                <div className="animate-in fade-in duration-1000 outline-none">
                    {renderSearchResults()}
                </div>
            ) : (
                <>
                    <TabsContent value="discover" className="mt-0 space-y-20 animate-in fade-in duration-1000 outline-none">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
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

                        <section className="space-y-12">
                            <div className="flex items-center justify-between border-b border-white/5 pb-8">
                                <h2 className="text-4xl font-black uppercase tracking-tighter text-white italic">
                                    {universeCategories.find(c => c.key === activeUniverseKey)?.title || "Explora NicePod"}
                                </h2>
                                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase px-5 py-2 rounded-full">
                                    {isSearching ? 'Sincronizando...' : 'Conexión Nominal'}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {(curatedShelves?.[activeUniverseKey as keyof CuratedShelvesData] || []).map(p => (
                                    <StackedPodcastCard key={p.id} podcast={p} />
                                ))}
                            </div>
                        </section>
                    </TabsContent>

                    <TabsContent value="library" className="mt-0 space-y-20 animate-in slide-in-from-bottom-4 duration-1000 outline-none">
                        {jobs.length > 0 && (
                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20"><Loader2 className="h-5 w-5 text-primary animate-spin" /></div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter text-white italic">Procesando Crónicas</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {jobs.map((job) => <SmartJobCard key={job.id} job={job} />)}
                                </div>
                            </section>
                        )}
                        <section className="space-y-10">
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-white px-2 italic">Mi Bóveda</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {podcasts.map(p => <StackedPodcastCard key={p.id} podcast={p} />)}
                            </div>
                        </section>
                    </TabsContent>
                </>
            )}
        </Tabs>
    );
}