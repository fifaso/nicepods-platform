// app/podcasts/library-tabs.tsx
// VERSIÓN FINAL Y COMPLETA: Gestiona el estado de la biblioteca en tiempo real.

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { PodcastWithProfile } from '@/types/podcast';
import { createClient } from '@/lib/supabase/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Compass, X, Loader2 } from 'lucide-react';
import { PodcastCard } from '@/components/podcast-card';
import { LibraryViewSwitcher } from '@/components/library-view-switcher';
import { CompactPodcastCard } from '@/components/compact-podcast-card';
import { PodcastShelf } from '@/components/podcast-shelf';
import { CuratedShelvesData } from './page';
import { UniverseCard } from '@/components/universe-card';
import { SmartJobCard } from '@/components/smart-job-card';
import type { Tables } from '@/types/supabase';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';

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
    const isMobile = useMobile();
    
    const currentTab = searchParams.get('tab') || defaultTab;
    const currentView = (searchParams.get('view') as LibraryViewMode) || 'grid';
    const activeUniverseKey = searchParams.get('universe') || (user ? 'most_resonant' : 'tech_and_innovation');

    const [jobs, setJobs] = useState(initialJobs);
    const [podcasts, setPodcasts] = useState(initialPodcasts);
    
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<PodcastWithProfile[] | null>(null);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);

    useEffect(() => {
        if (!user) return;

        const jobsChannel = supabase.channel(`realtime-jobs:${user.id}`)
            .on<UserCreationJob>('postgres_changes', { event: '*', schema: 'public', table: 'podcast_creation_jobs', filter: `user_id=eq.${user.id}` },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setJobs(currentJobs => [payload.new as UserCreationJob, ...currentJobs]);
                    }
                    if (payload.eventType === 'UPDATE') {
                        if (payload.new.status === 'completed' || payload.new.status === 'failed') {
                            setTimeout(() => {
                                setJobs(currentJobs => currentJobs.filter(job => job.id !== payload.new.id));
                            }, 2000);
                        } else {
                            setJobs(currentJobs => currentJobs.map(job => job.id === payload.new.id ? payload.new as UserCreationJob : job));
                        }
                    }
                }
            ).subscribe();

        const podsChannel = supabase.channel(`realtime-pods:${user.id}`)
            .on<PodcastWithProfile>('postgres_changes', { event: '*', schema: 'public', table: 'micro_pods', filter: `user_id=eq.${user.id}` },
                async (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const { data: newPodcast, error } = await supabase
                            .from('micro_pods').select('*, profiles(full_name, avatar_url, username)').eq('id', payload.new.id).single();
                        if (!error && newPodcast) {
                            setPodcasts(currentPodcasts => [newPodcast as PodcastWithProfile, ...currentPodcasts]);
                        }
                    }
                    if (payload.eventType === 'UPDATE') {
                        setPodcasts(currentPodcasts => 
                            currentPodcasts.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p)
                        );
                    }
                }
            ).subscribe();

        return () => {
            supabase.removeChannel(jobsChannel);
            supabase.removeChannel(podsChannel);
        };
    }, [user, supabase]);

    const handleClearSearch = () => {
        setSearchQuery('');
        setSearchResults(null);
        setIsSearchOpen(false);
    };

    const handleTabChange = (tab: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        params.delete('view');
        params.delete('universe');
        router.push(`${pathname}?${params.toString()}`);
    };

    const renderGridOrListContent = (podcastsToRender: PodcastWithProfile[]) => {
        if (currentView === 'list') {
            return <div className="space-y-4">{podcastsToRender.map(p => <CompactPodcastCard key={p.id} podcast={p} />)}</div>;
        }
        return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{podcastsToRender.map(p => <PodcastCard key={p.id} podcast={p} />)}</div>;
    };

    return (
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
            <div className="flex w-full items-center justify-between gap-2 sm:gap-4 mb-8">
                {isSearchOpen ? (
                    <div className="flex w-full items-center gap-2 flex-grow">
                        <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <Input type="text" placeholder="Buscar por título, tema o creador..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-grow" autoFocus />
                        <Button variant="ghost" size="icon" onClick={handleClearSearch} aria-label="Cerrar búsqueda"><X className="h-5 w-5" /></Button>
                    </div>
                ) : (
                    <>
                        <div>
                          <Button variant="ghost" size="icon" aria-label="Buscar" onClick={() => setIsSearchOpen(true)}>
                            <Search className="h-5 w-5" />
                          </Button>
                        </div>
                        <TabsList className="grid grid-cols-2 w-full sm:w-auto sm:max-w-xs">
                            <TabsTrigger value="discover">Descubrir</TabsTrigger>
                            <TabsTrigger value="library" disabled={!user}>Biblioteca</TabsTrigger>
                        </TabsList>
                        <LibraryViewSwitcher />
                    </>
                )}
            </div>
      
            <TabsContent value="discover">
                <div className="space-y-8">
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
                    <section>
                        <h2 className="text-3xl font-bold tracking-tight mb-4">
                            {universeCategories.find(c => c.key === activeUniverseKey)?.title || "Descubre"}
                        </h2>
                        {renderGridOrListContent(curatedShelves?.[activeUniverseKey as keyof CuratedShelvesData] || [])}
                    </section>
                </div>
            </TabsContent>
      
            <TabsContent value="library">
                {user ? (
                    (jobs.length > 0 || podcasts.length > 0) ? (
                        <div className="space-y-10">
                            {jobs.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-semibold tracking-tight mb-4">En Proceso</h2>
                                    <div className="space-y-4">
                                        {jobs.map((job) => <SmartJobCard key={`job-${job.id}`} job={job} />)}
                                    </div>
                                </section>
                            )}
                            {podcasts.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-semibold tracking-tight mb-4">Mis Creaciones</h2>
                                    {renderGridOrListContent(podcasts)}
                                </section>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <h2 className="text-2xl font-semibold">Tu biblioteca está vacía</h2>
                            <p className="text-muted-foreground mt-2"><Link href="/create" className="text-primary hover:underline">Crea tu primer micro-podcast</Link> para empezar.</p>
                        </div>
                    )
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <h2 className="text-2xl font-semibold">Inicia sesión para ver tu biblioteca</h2>
                        <p className="text-muted-foreground mt-2"><Link href={`/login?redirect=${pathname}?tab=library`} className="text-primary hover:underline">Ingresa a tu cuenta</Link> para acceder a tus creaciones.</p>
                    </div>
                )}
            </TabsContent>
        </Tabs>
    );
}