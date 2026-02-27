// app/podcasts/podcast-library-client.tsx
// VERSIÓN: 4.0 (Madrid Resonance - Discovery Engine & URL-Sync)

"use client";

import { PodcastCard } from "@/components/podcast-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PodcastWithProfile } from "@/types/podcast"; // [FIX]: Importación de tipo corregida
import {
  LayoutGrid,
  Library,
  ListFilter,
  Mic,
  Search,
  Sparkles,
  TrendingUp,
  X,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

interface PodcastLibraryClientProps {
  podcasts: PodcastWithProfile[];
  totalPodcasts: number;
}

export function PodcastLibraryClient({ podcasts, totalPodcasts }: PodcastLibraryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. GESTIÓN DE ESTADO REACTIVO
  const [searchTerm, setSearchTerm] = useState("");
  const activeTab = searchParams.get("tab") || "discover";

  // 2. FILTRADO DINÁMICO (High Performance)
  const filteredPodcasts = useMemo(() => {
    if (!searchTerm.trim()) return podcasts;

    const query = searchTerm.toLowerCase();
    return podcasts.filter(pod =>
      pod.title.toLowerCase().includes(query) ||
      pod.profiles?.full_name?.toLowerCase().includes(query) ||
      pod.ai_tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [searchTerm, podcasts]);

  /**
   * handleTabChange
   * Sincroniza el estado de la UI con la URL para persistencia.
   */
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-700">

      {/* --- CABECERA ESTILO MADRID RESONANCE --- */}
      <header className="mb-10 relative overflow-hidden p-8 rounded-[2.5rem] bg-zinc-900/40 border border-white/5 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10" />

        <div className="flex items-center gap-3 text-primary mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Library className="h-6 w-6" />
          </div>
          <span className="font-black uppercase tracking-[0.3em] text-xs">Centro de Inteligencia Colectiva</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic leading-none">
              Micro-pods
            </h1>
            <p className="text-zinc-400 font-medium max-w-lg">
              Conocimiento en cápsulas audibles de alta densidad. <br />
              <span className="text-primary/80 font-bold">{totalPodcasts} resonancias disponibles en el mapa.</span>
            </p>
          </div>

          <Link href="/create">
            <Button className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
              <Mic className="mr-2 h-5 w-5" /> Crear ahora
            </Button>
          </Link>
        </div>
      </header>

      <main className="space-y-8">

        {/* --- BARRA DE HERRAMIENTAS TÁCTICA --- */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por tema, idea o cronista..."
              className="pl-12 h-14 text-base rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all placeholder:text-zinc-600"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full"
              >
                <X className="h-4 w-4 text-zinc-500" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-14 w-14 p-0 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10">
              <LayoutGrid className="h-6 w-6 text-zinc-400" />
            </Button>
            <Button variant="outline" className="h-14 px-6 rounded-2xl bg-white/5 border-white/10 font-bold hover:bg-white/10">
              <ListFilter className="h-5 w-5 mr-3 text-zinc-400" />
              Filtros Avanzados
            </Button>
          </div>
        </div>

        {/* --- NAVEGACIÓN POR PESTAÑAS (URL SYNCED) --- */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-8">
          <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/5 h-14">
            <TabsTrigger value="discover" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary">
              <Zap className="h-3.5 w-3.5 mr-2" /> Descubrir
            </TabsTrigger>
            <TabsTrigger value="my-library" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary">
              Mi Bóveda
            </TabsTrigger>
            <TabsTrigger value="trending" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary">
              <TrendingUp className="h-3.5 w-3.5 mr-2" /> Tendencias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="mt-0 outline-none animate-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Sparkles className="text-primary h-5 w-5" />
                <h2 className="text-2xl font-black tracking-tighter uppercase italic">Destacados de la semana</h2>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-black text-[10px]">
                {filteredPodcasts.length} RESULTADOS
              </Badge>
            </div>

            {filteredPodcasts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {filteredPodcasts.map((podcast) => (
                  <PodcastCard key={podcast.id} podcast={podcast} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 px-6 rounded-[3rem] bg-zinc-900/50 border border-dashed border-white/10 text-center">
                <div className="p-6 bg-zinc-800/50 rounded-full mb-6">
                  <Search size={48} className="text-zinc-600" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Sin resonancia detectada</h3>
                <p className="text-zinc-500 mt-2 max-w-sm font-medium">
                  No hay podcasts que coincidan con tu búsqueda. Prueba con otros términos o crea el primero.
                </p>
                <Button variant="link" onClick={() => setSearchTerm("")} className="mt-4 text-primary font-bold">
                  Limpiar filtros
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Placeholders funcionales para consistencia de UI */}
          <TabsContent value="my-library" className="py-20 text-center text-zinc-500 font-medium">
            Próximamente: Tu colección personal sincronizada con Madrid.
          </TabsContent>
          <TabsContent value="trending" className="py-20 text-center text-zinc-500 font-medium">
            Próximamente: Lo más escuchado en el epicentro de la ciudad.
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}