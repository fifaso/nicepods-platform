// components/podcast-shelf.tsx
// VERSIÓN: 2.0 (Shielded Shelf - Production Status Aware)

"use client";

import { StackedPodcastCard } from "@/components/stacked-podcast-card";
import { Button } from "@/components/ui/button";
import { groupPodcastsByThread } from "@/lib/podcast-utils";
import { PodcastWithProfile } from "@/types/podcast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface PodcastShelfProps {
  title: string;
  podcasts: PodcastWithProfile[];
  variant?: 'default' | 'compact';
}

export function PodcastShelf({ title, podcasts, variant = 'default' }: PodcastShelfProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Agrupamos por hilos para mantener la arquitectura social
  const stackedPodcasts = groupPodcastsByThread(podcasts);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [stackedPodcasts]);

  if (stackedPodcasts.length === 0) return null;

  return (
    <section className="relative group/shelf py-4 md:py-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white">
          {title}
        </h2>

        {/* Controles de Navegación (Solo Desktop) */}
        <div className="hidden md:flex gap-2 opacity-0 group-hover/shelf:opacity-100 transition-opacity duration-300">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full bg-black/50 border-white/10 hover:bg-primary hover:border-primary transition-all"
            onClick={() => scroll('left')}
            disabled={!showLeftArrow}
          >
            <ChevronLeft className="h-4 w-4 text-white" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full bg-black/50 border-white/10 hover:bg-primary hover:border-primary transition-all"
            onClick={() => scroll('right')}
            disabled={!showRightArrow}
          >
            <ChevronRight className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto gap-5 pb-6 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0"
      >
        {stackedPodcasts.map((podcast: any) => (
          <div key={podcast.id} className="min-w-[280px] md:min-w-[320px] snap-start">
            {/* 
              [SISTEMA]: StackedPodcastCard internamente debe manejar 
              la opacidad si podcast.processing_status !== 'completed'
            */}
            <StackedPodcastCard
              podcast={podcast}
              replies={podcast.replies}
            />
          </div>
        ))}
      </div>
    </section>
  );
}