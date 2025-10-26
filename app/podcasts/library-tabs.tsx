// app/podcasts/library-tabs.tsx
// VERSIÓN FINAL CON BARRA DE CONTROL MINIMALISTA Y RESPONSIVE

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { PodcastWithProfile } from '@/types/podcast';

// --- Importaciones para la UI ---
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Search, Hourglass, Bot, LayoutGrid, List } from 'lucide-react';
import { PodcastCard, PodcastListItem } from '@/components/podcast-card';

// --- Tipos de datos (sin cambios) ---
type UserCreatedPodcast = {
  id: number;
  created_at: string;
  title: string;
  description: string | null;
  status: string;
  audio_url: string | null;
  duration_seconds: number | null;
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

// --- Componentes internos (sin cambios) ---
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
  userCreatedPodcasts
}: LibraryTabsProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const renderContent = (podcasts: (PodcastWithProfile | UserCreatedPodcast)[]) => {
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {podcasts.map((podcast) => <PodcastCard key={podcast.id} podcast={podcast as PodcastWithProfile} />)}
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {podcasts.map((podcast) => <PodcastListItem key={podcast.id} podcast={podcast as PodcastWithProfile} />)}
      </div>
    );
  };

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      {/* ======================= INTERVENCIÓN QUIRÚRGICA ======================= */}
      {/* Se reemplaza toda la barra de control por una versión unificada en una sola línea, optimizada para móviles. */}
      <div className="flex w-full items-center gap-2 sm:gap-4 mb-8">
        {/* 1. Botón de Búsqueda (solo icono) */}
        <Button variant="ghost" size="icon" aria-label="Buscar" className="flex-shrink-0">
            <Search className="h-5 w-5" />
        </Button>

        {/* 2. Filtros de Contenido (ocupa el espacio central) */}
        <TabsList className="grid grid-cols-2 w-full flex-grow">
            <TabsTrigger value="discover">Descubrir</TabsTrigger>
            <TabsTrigger value="library">Biblioteca</TabsTrigger>
        </TabsList>

        {/* 3. Selectores de Vista */}
        <ToggleGroup 
            type="single" 
            value={viewMode} 
            onValueChange={(value) => { if (value) setViewMode(value as 'grid' | 'list'); }}
            className="flex-shrink-0"
        >
            <ToggleGroupItem value="grid" aria-label="Vista de cuadrícula">
                <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="Vista de lista">
                <List className="h-4 w-4" />
            </ToggleGroupItem>
        </ToggleGroup>
      </div>
      {/* ===================== FIN DE LA INTERVENCIÓN QUIRÚRGICA ===================== */}
      
      <TabsContent value="discover" className="mt-0">
        {publicPodcasts.length > 0 ? (
          renderContent(publicPodcasts)
        ) : (
          <div className="col-span-full text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-2xl font-semibold">El universo está por descubrir</h2>
            <p className="text-muted-foreground mt-2">
              Aún no hay micro-podcasts públicos. ¡Sé el primero en <Link href="/create" className="text-primary hover:underline">crear y publicar</Link> uno!
            </p>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="library" className="mt-0">
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
                  {renderContent(userCreatedPodcasts)}
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