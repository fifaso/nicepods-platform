// components/podcast-shelf.tsx
// VERSIÓN CORREGIDA: Se añade 'relative' para arreglar el efecto de fade-out.

import { PodcastWithProfile } from "@/types/podcast";
import { PodcastCard } from "@/components/podcast-card";
import { CompactPodcastCard } from "@/components/compact-podcast-card";

interface PodcastShelfProps {
  title: string;
  podcasts: PodcastWithProfile[] | null;
  variant?: 'default' | 'compact';
}

export function PodcastShelf({ title, podcasts, variant = 'default' }: PodcastShelfProps) {
  if (!podcasts || podcasts.length === 0) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <section className="w-full">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 px-4 md:px-0">{title}</h2>
        {/* [CAMBIO QUIRÚRGICO]: Se añade 'relative' para que el degradado absoluto se posicione correctamente. */}
        <div className="relative">
          <div className="space-y-4 max-h-[calc(3*88px+3*1rem)] overflow-y-auto pr-2
                        scrollbar-thin scrollbar-thumb-gray-700/50 scrollbar-track-transparent">
            {podcasts.map((podcast) => (
              <CompactPodcastCard key={podcast.id} podcast={podcast} />
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </div>
      </section>
    );
  }

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