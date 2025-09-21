// app/podcasts/page.tsx

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { PodcastWithProfile } from '@/types/podcast';
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Hourglass, CheckCircle, Search, Bot, PlayCircle, User } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from '@/components/ui/input'

type UserCreatedPodcast = {
  id: number;
  created_at: string;
  title: string;
  description: string | null;
  status: string;
};

type UserCreationJob = {
  id: number;
  created_at: string;
  job_title: string | null;
  status: string;
  error_message: string | null;
  micro_pod_id: number | null;
};

export default async function PodcastsPage({ searchParams }: { searchParams: { tab: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  let publicPodcasts: PodcastWithProfile[] = [];
  try {
    const { data, error } = await supabase
      .from('micro_pods')
      .select(`*, profiles(full_name, avatar_url)`)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    publicPodcasts = data || [];
  } catch (error) {
    console.error("Error al obtener podcasts públicos:", error);
    publicPodcasts = [];
  }

  let userCreationJobs: UserCreationJob[] = [];
  let userCreatedPodcasts: UserCreatedPodcast[] = [];
  if (user) {
    try {
      const { data, error } = await supabase.from('podcast_creation_jobs').select('id, created_at, job_title, status, error_message, micro_pod_id').eq('user_id', user.id).in('status', ['pending', 'processing']).eq('archived', false).order('created_at', { ascending: false });
      if (error) throw error;
      userCreationJobs = data || [];
    } catch (error) { console.error("Error al obtener trabajos de creación del usuario:", error); userCreationJobs = []; }
    try {
      const { data, error } = await supabase.from('micro_pods').select('id, created_at, title, description, status').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      userCreatedPodcasts = data || [];
    } catch (error) { console.error("Error al obtener micro-podcasts del usuario:", error); userCreatedPodcasts = []; }
  }

  const currentTab = searchParams.tab;
  const defaultTab = currentTab === 'library' && user ? 'library' : 'discover';

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Centro de Descubrimiento</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Descubre conocimiento en experiencias de audio concisas.
        </p>
        <div className="mt-6 max-w-2xl mx-auto relative">
          <Input placeholder="Buscar podcasts, temas o creadores..." className="pr-10" />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
      </header>
      
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mx-auto max-w-md">
          <TabsTrigger value="discover">Descubrir</TabsTrigger>
          <TabsTrigger value="library">Mi Biblioteca</TabsTrigger>
          <TabsTrigger value="trending" disabled>Tendencias</TabsTrigger>
          <TabsTrigger value="recently-played" disabled>Recientes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="discover" className="mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {publicPodcasts.length > 0 ? (
              publicPodcasts.map((podcast) => <PublicPodcastCard key={podcast.id} podcast={podcast} />)
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
                    <h2 className="text-2xl font-semibold tracking-tight mb-4">Mis Creaciones</h2>
                     <div className="space-y-4">
                      {userCreatedPodcasts.map((podcast) => <UserPodcastCard key={`pod-${podcast.id}`} podcast={podcast} />)}
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
    </div>
  );
}


// ===============================================================
// Sub-Componentes de Tarjeta
// ===============================================================

function PublicPodcastCard({ podcast }: { podcast: PodcastWithProfile }) {
  const authorName = podcast.profiles?.full_name || 'Anónimo';

  return (
    <Card className="flex flex-col h-full hover:shadow-primary/10 transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg leading-tight">{podcast.title}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground pt-1">
          <User className="h-4 w-4 mr-2" />
          <span>{authorName}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{podcast.description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/podcasts/${podcast.id}`}>
            <PlayCircle className="mr-2 h-4 w-4" />
            Escuchar ahora
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

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
  const isPublished = podcast.status === 'published';
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{podcast.title}</CardTitle>
          <Badge variant={isPublished ? 'default' : 'outline'}>
            {isPublished ? <CheckCircle className="mr-2 h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />}
            {isPublished ? 'Publicado' : 'Borrador'}
          </Badge>
        </div>
        <CardDescription>Creado el: {new Date(podcast.created_at).toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent>
         <Button asChild variant="link" className="p-0 h-auto">
            <Link href={`/podcasts/${podcast.id}`}>Ver Guion</Link>
         </Button>
      </CardContent>
    </Card>
  );
}