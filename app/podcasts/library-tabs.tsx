// app/podcasts/library-tabs.tsx
// VERSIÓN DE PRODUCCIÓN FINAL: Integra la "Brújula de Resonancia" como una nueva modalidad de visualización.

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { PodcastWithProfile } from '@/types/podcast';
import { createClient } from '@/lib/supabase/client';

// --- Importaciones de UI ---
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Hourglass, Bot, LayoutGrid, List, X, Loader2 } from 'lucide-react';
import { PodcastCard, PodcastListItem } from '@/components/podcast-card';

// --- [INTERVENCIÓN ESTRATÉGICA #1] Importamos los nuevos componentes y tipos ---
import { LibraryViewSwitcher } from '@/components/library-view-switcher';
import { ResonanceCompass } from '@/components/resonance-compass';
import type { Tables } from '@/types/supabase';

// --- Tipos de Datos Actualizados y Unificados ---
type UserCreationJob = Tables<'podcast_creation_jobs'>;
type ResonanceProfile = Tables<'user_resonance_profiles'>;
type LibraryViewMode = 'grid' | 'list' | 'compass';

// [INTERVENCIÓN ESTRATÉGICA #2] Actualizamos la interfaz de props para aceptar los datos de la Brújula.
interface LibraryTabsProps {
  defaultTab: 'discover' | 'library';
  user: User | null;
  publicPodcasts: PodcastWithProfile[];
  userCreationJobs: UserCreationJob[];
  userCreatedPodcasts: PodcastWithProfile[];
  compassProps: { 
    userProfile: ResonanceProfile | null;
    podcasts: PodcastWithProfile[];
    tags: string[];
  } | null;
}

// Componente interno para trabajos en proceso (sin cambios)
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
  defaultTab,
  user,
  publicPodcasts,
  userCreationJobs,
  userCreatedPodcasts,
  compassProps
}: LibraryTabsProps) {
    const supabase = createClient();
    const searchParams = useSearchParams();
    
    // [INTERVENCIÓN QUIRÚRGICA #3] La URL es ahora la única fuente de la verdad para la vista.
    const currentView = (searchParams.get('view') as LibraryViewMode) || 'grid';

    // Estados para la funcionalidad de búsqueda (sin cambios)
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<PodcastWithProfile[] | null>(null);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);

    // Efecto "debounce" para la búsqueda (sin cambios)
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

    // Función auxiliar para renderizar el contenido en cuadrícula o lista (lógica preservada)
    const renderGridOrListContent = (podcasts: PodcastWithProfile[]) => {
        if (currentView === 'grid') { // Ahora se basa en 'currentView' de la URL
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {podcasts.map((podcast) => <PodcastCard key={podcast.id} podcast={podcast} />)}
                </div>
            );
        }
        // Aunque el switcher no tiene 'list', preservamos la lógica por si se añade en el futuro
        return (
            <div className="space-y-4">
                {podcasts.map((podcast) => <PodcastListItem key={podcast.id} podcast={podcast} />)}
            </div>
        );
    };

    const activePodcastList = searchResults !== null ? searchResults : publicPodcasts;

    return (
        <Tabs defaultValue={defaultTab} className="w-full">
            <div className="flex w-full items-center gap-2 sm:gap-4 mb-8">
                {isSearchOpen ? (
                    <div className="flex w-full items-center gap-2 flex-grow">
                        <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <Input type="text" placeholder="Buscar por título, tema o creador..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-grow" autoFocus />
                        <Button variant="ghost" size="icon" onClick={handleClearSearch} aria-label="Cerrar búsqueda"><X className="h-5 w-5" /></Button>
                    </div>
                ) : (
                    <>
                        <Button variant="ghost" size="icon" aria-label="Buscar" className="flex-shrink-0" onClick={() => setIsSearchOpen(true)}>
                            <Search className="h-5 w-5" />
                        </Button>
                        <div className="flex flex-grow justify-center">
                           <TabsList className="grid grid-cols-2 w-full sm:w-auto sm:max-w-xs">
                                <TabsTrigger value="discover">Descubrir</TabsTrigger>
                                <TabsTrigger value="library" disabled={!user}>Biblioteca</TabsTrigger>
                            </TabsList>
                        </div>
                        {/* [INTERVENCIÓN QUIRÚRGICA #4] Reemplazamos el antiguo ToggleGroup por el nuevo Switcher. */}
                        <LibraryViewSwitcher />
                    </>
                )}
            </div>
      
            <TabsContent value="discover" className="mt-0">
                {isLoadingSearch ? (
                    <div className="flex justify-center items-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : activePodcastList.length > 0 ? (
                    renderGridOrListContent(activePodcastList)
                ) : (
                    <div className="col-span-full text-center py-16 border-2 border-dashed rounded-lg">
                        <h2 className="text-2xl font-semibold">{searchResults !== null ? 'No se encontraron resultados' : 'El universo está por descubrir'}</h2>
                        <p className="text-muted-foreground mt-2">{searchResults !== null ? `Intenta con otras palabras clave.` : `Aún no hay micro-podcasts públicos. ¡Sé el primero en crear y publicar uno!`}</p>
                    </div>
                )}
            </TabsContent>
      
            <TabsContent value="library" className="mt-0">
                {user ? (
                    // [INTERVENCIÓN ESTRATÉGICA #5] Renderizado condicional basado en la vista.
                    currentView === 'compass' ? (
                        compassProps ? (
                            <ResonanceCompass 
                                userProfile={compassProps.userProfile}
                                podcasts={compassProps.podcasts}
                                tags={compassProps.tags}
                            />
                        ) : (
                            <div className="flex justify-center items-center py-16">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="ml-4 text-muted-foreground">Cargando tu universo...</p>
                            </div>
                        )
                    ) : (
                        // Vista de 'grid' o 'list' (la lógica que ya tenías, 100% preservada).
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
                    )
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <h2 className="text-2xl font-semibold">Inicia sesión para ver tu biblioteca</h2>
                        <p className="text-muted-foreground mt-2"><Link href="/login?redirect=/podcasts?tab=library" className="text-primary hover:underline">Ingresa a tu cuenta</Link> para acceder a tus creaciones.</p>
                    </div>
                )}
            </TabsContent>
        </Tabs>
    );
}