// app/podcasts/library-tabs.tsx
// VERSIÓN FINAL Y COMPLETA: Implementa el "Atrio del Descubrimiento" sin abreviaciones.

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { PodcastWithProfile } from '@/types/podcast';
import { createClient } from '@/lib/supabase/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Hourglass, Bot, Compass, X, Loader2 } from 'lucide-react';
import { PodcastCard } from '@/components/podcast-card';
import { LibraryViewSwitcher } from '@/components/library-view-switcher';
import { ResonanceCompass } from '@/components/resonance-compass';
import type { Tables } from '@/types/supabase';
import { useMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { CompactPodcastCard } from '@/components/compact-podcast-card';
import { PodcastShelf } from '@/components/podcast-shelf';
import { CuratedShelvesData } from './page';
import { UniverseCard } from '@/components/universe-card';

type UserCreationJob = Tables<'podcast_creation_jobs'>;
type ResonanceProfile = Tables<'user_resonance_profiles'>;
type LibraryViewMode = 'grid' | 'list' | 'compass';

interface LibraryTabsProps {
  defaultTab: 'discover' | 'library';
  user: User | null;
  userCreationJobs: UserCreationJob[];
  userCreatedPodcasts: PodcastWithProfile[];
  compassProps: { 
    userProfile: ResonanceProfile | null;
    podcasts: PodcastWithProfile[];
    tags: string[];
  } | null;
  curatedShelves: CuratedShelvesData | null;
}

const universeCategories = [
  { key: 'most_resonant', title: 'Lo más resonante', image: '/images/universes/resonant.png' },
  { key: 'deep_thought', title: 'Pensamiento Profundo', image: '/images/universes/deep-thought.png' },
  { key: 'practical_tools', title: 'Herramientas Prácticas', image: '/images/universes/practical-tools.png' },
  { key: 'tech_and_innovation', title: 'Innovación y Tec.', image: '/images/universes/tech.png' },
  { key: 'wellness_and_mind', title: 'Bienestar y Mente', image: '/images/universes/wellness.png' },
  { key: 'narrative_and_stories', title: 'Narrativa e Historias', image: '/images/universes/narrative.png' },
];

function JobCard({ job }: { job: UserCreationJob }) {
    return (
        <Card className="bg-background/50 border-primary/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{job.job_title || "Creación en progreso..."}</CardTitle>
                    <Badge variant="secondary" className="animate-pulse">
                        <Hourglass className="mr-2 h-4 w-4" />
                        {job.status === 'pending' ? 'Pendiente' : 'Procesando'}
                    </Badge>
                </div>
                <CardDescription>Iniciado el: {new Date(job.created_at).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                    <Bot className="mr-2 h-4 w-4" />
                    <p>Nuestros agentes de IA están trabajando. Refresca la página en un momento para ver el resultado.</p>
                </div>
            </CardContent>
        </Card>
    );
}

export function LibraryTabs({
  defaultTab, user, userCreationJobs, userCreatedPodcasts, compassProps, curatedShelves,
}: LibraryTabsProps) {
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isMobile = useMobile();
    
    const currentTab = searchParams.get('tab') || defaultTab;
    const currentView = (searchParams.get('view') as LibraryViewMode) || 'grid';
    const activeUniverseKey = searchParams.get('universe') || (user ? 'most_resonant' : 'tech_and_innovation');

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<PodcastWithProfile[] | null>(null);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults(null);
            return;
        }
        const delayDebounceFn = setTimeout(async () => {
            setIsLoadingSearch(true);
            const { data, error } = await supabase.rpc('search_podcasts', { search_term: searchQuery });
            if (error) {
                console.error('Error en la búsqueda:', error);
                setSearchResults([]);
            } else {
                setSearchResults(data as PodcastWithProfile[]);
            }
            setIsLoadingSearch(false);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, supabase]);

    const handleClearSearch = () => {
        setSearchQuery('');
        setSearchResults(null);
        setIsSearchOpen(false);
    };

    const handleTabChange = (tab: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        // Reseteamos los filtros de vista y universo al cambiar de pestaña
        params.delete('view');
        params.delete('universe');
        router.push(`${pathname}?${params.toString()}`);
    };

    const setView = (view: LibraryViewMode) => {
        const params = new URLSearchParams(searchParams);
        params.set('view', view);
        router.push(`${pathname}?${params.toString()}`);
    };

    const renderGridOrListContent = (podcasts: PodcastWithProfile[]) => {
        if (currentView === 'list') {
            return <div className="space-y-4">{podcasts.map(p => <CompactPodcastCard key={p.id} podcast={p} />)}</div>;
        }
        return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{podcasts.map(p => <PodcastCard key={p.id} podcast={p} />)}</div>;
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
                    (userCreationJobs.length > 0 || userCreatedPodcasts.length > 0) ? (
                        <div className="space-y-10">
                            {userCreationJobs.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-semibold tracking-tight mb-4">En Proceso</h2>
                                    <div className="space-y-4">
                                        {userCreationJobs.map((job) => <JobCard key={`job-${job.id}`} job={job} />)}
                                    </div>
                                </section>
                            )}
                            {userCreatedPodcasts.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-semibold tracking-tight mb-4">Mis Creaciones</h2>
                                    {renderGridOrListContent(userCreatedPodcasts)}
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