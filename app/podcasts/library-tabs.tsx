"use client";

import { useState } from 'react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { PodcastWithProfile } from '@/types/podcast';

// --- Importaciones de UI ---
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Hourglass, CheckCircle, Bot } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PodcastCard } from '@/components/podcast-card';

// --- Tipos locales para los datos recibidos como props ---
type UserCreatedPodcast = {
  id: number;
  created_at: string;
  title: string;
  description: string | null;
  status: string;
  audio_url: string | null;
};

type UserCreationJob = {
  id: number;
  created_at: string;
  job_title: string | null;
  status: string;
  error_message: string | null;
  micro_pod_id: number | null;
};

interface LibraryTabsProps {
  defaultTab: 'discover' | 'library';
  user: User | null;
  publicPodcasts: PodcastWithProfile[];
  userCreationJobs: UserCreationJob[];
  userCreatedPodcasts: UserCreatedPodcast[];
}

type FilterStatus = 'all' | 'script' | 'audio';

// ================== INTERVENCIÓN QUIRÚRGICA #1: RE-INTRODUCCIÓN DE SUB-COMPONENTES ==================
// Se añaden las definiciones completas de JobCard y UserPodcastCard, que antes
// vivían en `page.tsx`, para que este componente pueda renderizarlos.

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

function UserPodcastCard({ podcast }: { podcast: UserCreatedPodcast }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{podcast.title}</CardTitle>
          {podcast.audio_url ? (
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Audio Disponible</Badge>
          ) : (
            <Badge variant="secondary">Solo Guion</Badge>
          )}
        </div>
        <CardDescription>Creado el: {new Date(podcast.created_at).toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent>
         <Button asChild variant="link" className="p-0 h-auto">
            <Link href={`/podcast/${podcast.id}`}>
              {podcast.audio_url ? 'Escuchar y ver guion' : 'Ver Guion'}
            </Link>
         </Button>
      </CardContent>
    </Card>
  );
}
// =================================================================================================

export function LibraryTabs({
  defaultTab,
  user,
  publicPodcasts,
  userCreationJobs,
  userCreatedPodcasts
}: LibraryTabsProps) {
  const [filter, setFilter] = useState<FilterStatus>('all');

  const filteredUserPodcasts = userCreatedPodcasts.filter(p => {
    if (filter === 'script') return !p.audio_url;
    if (filter === 'audio') return !!p.audio_url;
    return true; // 'all'
  });

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mx-auto max-w-xs">
        <TabsTrigger value="discover">Descubrir</TabsTrigger>
        <TabsTrigger value="library">Mi Biblioteca</TabsTrigger>
      </TabsList>
      
      <TabsContent value="discover" className="mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {publicPodcasts.length > 0 ? (
            publicPodcasts.map((podcast) => <PodcastCard key={podcast.id} podcast={podcast} />)
          ) : (
            <div className="col-span-full text-center py-16 border-2 border-dashed rounded-lg">
              <h2 className="text-2xl font-semibold">El universo está por descubrir</h2>
              <p className="text-muted-foreground mt-2">
                Aún no hay micro-podcasts públicos. ¡Sé el primero en <Link href="/create" className="text-primary hover:underline">crear y publicar</Link> uno!
              </p>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="library" className="mt-8">
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
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Mis Creaciones</h2>
                    <div className="flex gap-2">
                      <Button size="sm" variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>Todos</Button>
                      <Button size="sm" variant={filter === 'script' ? 'default' : 'outline'} onClick={() => setFilter('script')}>Solo Guion</Button>
                      <Button size="sm" variant={filter === 'audio' ? 'default' : 'outline'} onClick={() => setFilter('audio')}>Con Audio</Button>
                    </div>
                  </div>
                   <div className="space-y-4">
                    {filteredUserPodcasts.map((podcast) => <UserPodcastCard key={`pod-${podcast.id}`} podcast={podcast} />)}
                  </div>
                </section>
              )}
            </div>
          ) : (
             <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h2 className="text-2xl font-semibold">Tu biblioteca está vacía</h2>
                <p className="text-muted-foreground mt-2">
                  <Link href="/create" className="text-primary hover:underline">Crea tu primer micro-podcast</Link> para empezar.
                </p>
              </div>
          )
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-2xl font-semibold">Inicia sesión para ver tu biblioteca</h2>
            <p className="text-muted-foreground mt-2">
              <Link href="/login?redirect=/podcasts?tab=library" className="text-primary hover:underline">Ingresa a tu cuenta</Link> para acceder a tus creaciones.
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}