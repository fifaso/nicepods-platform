// components/podcast-shelf.tsx
// VERSIÓN ACTUALIZADA: Acepta una prop 'variant' para renderizar tarjetas estándar o compactas.

import { PodcastWithProfile } from "@/types/podcast";
import { PodcastCard } from "@/components/podcast-card";
import { CompactPodcastCard } from "@/components/compact-podcast-card";

interface PodcastShelfProps {
  title: string;
  podcasts: PodcastWithProfile[] | null;
  variant?: 'default' | 'compact'; // Nueva prop para controlar el layout
}

export function PodcastShelf({ title, podcasts, variant = 'default' }: PodcastShelfProps) {
  if (!podcasts || podcasts.length === 0) {
    return null;
  }

  // Si la variante es 'compact', renderizamos una lista vertical optimizada para móvil.
  if (variant === 'compact') {
    return (
      <section className="w-full py-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 px-4 md:px-0">{title}</h2>
        <div className="space-y-4">
          {podcasts.map((podcast) => (
            <CompactPodcastCard key={podcast.id} podcast={podcast} />
          ))}
        </div>
      </section>
    );
  }

  // Por defecto (variante 'default'), renderizamos el carrusel horizontal con las tarjetas grandes.
  return (
    <section className="w-full py-8">
      <h2 className="text-2xl font-bold mb-4 px-4 md:px-0">{title}</h2>
      <div className="flex overflow-x-auto space-x-4 pb-4 px-4 md:px-0 scrollbar-thin scrollbar-thumb-gray-700/50 hover:scrollbar-thumb-gray-600/50 scrollbar-track-transparent scrollbar-thumb-rounded-full">
        {podcasts.map((podcast) => (
          <div key={podcast.id} className="flex-shrink-0 w-64 md:w-72">
            <PodcastCard podcast={podcast} />
          </div>
        ))}
        <div className="flex-shrink-0 w-1 md:w-0" />
      </div>
    </section>
  );
}