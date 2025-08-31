// app/podcasts/podcast-library-client.tsx

"use client"

import Link from "next/link";
import { PodcastCard, type PodcastWithProfile } from "@/components/podcast-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ListFilter, LayoutGrid, Library, Zap, Clock, TrendingUp } from "lucide-react";

interface PodcastLibraryClientProps {
  podcasts: PodcastWithProfile[];
  totalPodcasts: number;
}

export function PodcastLibraryClient({ podcasts, totalPodcasts }: PodcastLibraryClientProps) {
  return (
    // Usamos 'container' para centrar el contenido y 'py-8' para el espaciado vertical
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* --- CABECERA DE LA PÁGINA (DISEÑO RESTAURADO) --- */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Library className="h-5 w-5" />
          <p className="font-semibold">Content Discovery Hub</p>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
          Micro-pods
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover knowledge in bite-sized audio experiences • {totalPodcasts} podcasts available
        </p>
      </header>

      <main>
        {/* --- BARRA DE BÚSQUEDA Y FILTROS (DISEÑO RESTAURADO) --- */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search podcasts, topics, or creators..." 
              className="pl-11 h-12 text-base rounded-full bg-card/50 border-border/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-12 w-12 p-0 rounded-full bg-card/50 border-border/50">
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button variant="outline" className="h-12 rounded-full bg-card/50 border-border/50">
              <ListFilter className="h-5 w-5 mr-2" /> 
              Filter
            </Button>
          </div>
        </div>

        {/* --- PESTAÑAS DE NAVEGACIÓN (DISEÑO RESTAURADO) --- */}
        <Tabs defaultValue="discover" className="w-full">
          <TabsList>
            <TabsTrigger value="discover"><Zap className="h-4 w-4 mr-2"/>Discover</TabsTrigger>
            <TabsTrigger value="my-library">My Library</TabsTrigger>
            <TabsTrigger value="trending"><TrendingUp className="h-4 w-4 mr-2"/>Trending</TabsTrigger>
            <TabsTrigger value="recently-played"><Clock className="h-4 w-4 mr-2"/>Recently Played</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="mt-6">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Featured This Week</h2>
              <Button variant="ghost" asChild>
                <Link href="/podcasts">View All &gt;</Link>
              </Button>
            </div>
            
            {/* La lógica de renderizado de datos reales permanece intacta */}
            {(podcasts && podcasts.length > 0) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {podcasts.map((podcast) => (
                  <PodcastCard key={podcast.id} podcast={podcast} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-6 rounded-lg bg-muted/50">
                <h3 className="text-2xl font-semibold">The Library is Quiet... For Now</h3>
                <p className="text-muted-foreground mt-3 max-w-md mx-auto">
                  It seems there are no published podcasts yet. Why not be the first to create one?
                </p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="my-library"><p className="text-center py-12 text-muted-foreground">My Library feature coming soon!</p></TabsContent>
          <TabsContent value="trending"><p className="text-center py-12 text-muted-foreground">Trending feature coming soon!</p></TabsContent>
          <TabsContent value="recently-played"><p className="text-center py-12 text-muted-foreground">Recently Played feature coming soon!</p></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}