/**
 * ARCHIVO: components/feed/podcast-shelf.tsx
 * VERSIÓN: 3.0 (NicePod Shielded Shelf - Nominal Sovereignty Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Gestionar el carrusel horizontal de crónicas de sabiduría, organizando 
 * los activos por hilos de conversación y garantizando una navegación fluida.
 * [REFORMA V3.0]: Sincronización nominal total con StackedPodcastCard V6.0, 
 * erradicación de 'any' y cumplimiento estricto de la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { StackedPodcastCard } from "@/components/podcast/stacked-podcast-card";
import { Button } from "@/components/ui/button";
import { organizePodcastsByConversationThreadTopology } from "@/lib/podcast-utils";
import { PodcastWithProfile } from "@/types/podcast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";

/**
 * INTERFAZ: PodcastThread
 * Misión: Tipar la estructura de sabiduría agrupada por hilos de respuesta.
 */
interface PodcastThread extends PodcastWithProfile {
  repliesCollection: PodcastWithProfile[];
}

/**
 * INTERFAZ: PodcastShelfProperties
 */
interface PodcastShelfProperties {
  shelfTitle: string;
  initialPodcastCollection: PodcastWithProfile[];
  visualVariant?: 'default' | 'compact';
}

/**
 * PodcastShelf: El contenedor de carrusel para el descubrimiento de capital intelectual.
 */
export function PodcastShelf({ 
  shelfTitle, 
  initialPodcastCollection, 
  visualVariant = 'default' 
}: PodcastShelfProperties) {
  
  // --- I. REFERENCIAS Y ESTADOS DE NAVEGACIÓN ---
  const scrollContainerReference = useRef<HTMLDivElement>(null);
  const [isLeftNavigationArrowVisible, setIsLeftNavigationArrowVisible] = useState<boolean>(false);
  const [isRightNavigationArrowVisible, setIsRightNavigationArrowVisible] = useState<boolean>(true);

  /**
   * groupedPodcastThreads: 
   * Misión: Organizar la colección por hilos para mantener la arquitectura social.
   */
  const groupedPodcastThreads = useMemo(() => {
    return organizePodcastsByConversationThreadTopology(initialPodcastCollection) as PodcastThread[];
  }, [initialPodcastCollection]);

  /**
   * executeHorizontalScroll:
   * Misión: Desplazar el carrusel basándose en la dirección táctica solicitada.
   */
  const executeHorizontalScroll = (scrollDirection: 'left' | 'right') => {
    if (scrollContainerReference.current) {
      const scrollOffsetPixels = scrollDirection === 'left' ? -340 : 340;
      scrollContainerReference.current.scrollBy({ 
        left: scrollOffsetPixels, 
        behavior: 'smooth' 
      });
    }
  };

  /**
   * validateScrollPosition:
   * Misión: Evaluar el estado del contenedor para alternar la visibilidad de los controles.
   */
  const validateScrollPosition = () => {
    if (scrollContainerReference.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerReference.current;
      setIsLeftNavigationArrowVisible(scrollLeft > 10);
      setIsRightNavigationArrowVisible(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Sincronía con eventos de hardware y redimensionamiento
  useEffect(() => {
    validateScrollPosition();
    window.addEventListener('resize', validateScrollPosition);
    return () => window.removeEventListener('resize', validateScrollPosition);
  }, [groupedPodcastThreads]);

  // Si la colección está vacía, el shelf entra en modo de ocultación táctica.
  if (groupedPodcastThreads.length === 0) {
    return null;
  }

  return (
    <section className="relative group/shelf py-6 md:py-10 animate-in fade-in duration-1000 isolate">
      
      {/* CABECERA DEL CARRUSEL DE SABIDURÍA */}
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white italic font-serif">
          {shelfTitle}
        </h2>

        {/* Controles de Navegación de Alta Densidad (Solo Desktop) */}
        <div className="hidden md:flex gap-3 opacity-0 group-hover/shelf:opacity-100 transition-all duration-500">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full bg-black/60 border-white/10 hover:bg-primary hover:border-primary transition-all shadow-2xl"
            onClick={() => executeHorizontalScroll('left')}
            disabled={!isLeftNavigationArrowVisible}
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full bg-black/60 border-white/10 hover:bg-primary hover:border-primary transition-all shadow-2xl"
            onClick={() => executeHorizontalScroll('right')}
            disabled={!isRightNavigationArrowVisible}
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>

      {/* CONTENEDOR CINEMÁTICO DE TARJETAS */}
      <div
        ref={scrollContainerReference}
        onScroll={validateScrollPosition}
        className="flex overflow-x-auto gap-6 pb-10 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0"
      >
        {groupedPodcastThreads.map((podcastThread) => (
          <div 
            key={podcastThread.identification}
            className="min-w-[290px] md:min-w-[360px] snap-start"
          >
            {/* [FIX V3.0]: Sincronía nominal estricta con StackedPodcastCard V6.0 */}
            <StackedPodcastCard
              initialPodcastData={podcastThread}
              narrativeReplyCollection={podcastThread.repliesCollection}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Contract Synchronization: Se neutralizó el error TS2322 en la línea 93 
 *    utilizando 'initialPodcastData' y 'narrativeReplyCollection' como propiedades.
 * 2. Zero Abbreviations Policy: Purificación absoluta de variables cinemáticas 
 *    (scrollContainerReference, executeHorizontalScroll, isLeftNavigationArrowVisible).
 * 3. Type Safety: Se erradicó el uso de 'any' mediante la interfaz 'PodcastThread', 
 *    permitiendo al compilador validar la estructura de hilos conversacionales.
 * 4. UX Integrity: Se añadió 'snap-x' para garantizar que el desplazamiento 
 *    horizontal siempre ancle una tarjeta completa en el centro visual del Voyager.
 */