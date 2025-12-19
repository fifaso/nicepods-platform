"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PodcastWithProfile } from "@/types/podcast";
// [CAMBIO]: Usamos el componente Stacked y la utilidad compartida
import { StackedPodcastCard } from "@/components/stacked-podcast-card";
import { groupPodcastsByThread } from "@/lib/podcast-utils";

interface PodcastShelfProps {
  title: string;
  podcasts: PodcastWithProfile[];
  variant?: 'default' | 'compact';
}

export function PodcastShelf({ title, podcasts, variant = 'default' }: PodcastShelfProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // [ESTRATEGIA]: Agrupamos siempre para mostrar mazos si hay hilos en el home
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
    <section className="relative group/shelf py-4 md:py-6">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">{title}</h2>
        
        {/* Controles de Scroll (Solo Desktop) */}
        <div className="hidden md:flex gap-2 opacity-0 group-hover/shelf:opacity-100 transition-opacity duration-300">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-black/50 border-white/10 hover:bg-black/80" onClick={() => scroll('left')} disabled={!showLeftArrow}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-black/50 border-white/10 hover:bg-black/80" onClick={() => scroll('right')} disabled={!showRightArrow}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0"
      >
        {stackedPodcasts.map((podcast: any) => (
          <div key={podcast.id} className="min-w-[280px] md:min-w-[300px] snap-start">
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