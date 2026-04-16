/**
 * ARCHIVO: components/feed/podcast-shelf.tsx
 * VERSIÓN: 4.0 (NicePod Shielded Shelf - Utility Synchronization Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Gestionar el carrusel horizontal de crónicas de sabiduría, organizando 
 * los activos por hilos de conversación y garantizando una navegación fluida.
 * [REFORMA V4.0]: Resolución definitiva de TS2305. Sincronización nominal 
 * absoluta con 'groupPodcastsByThreadCollection' de lib/podcast-utils.ts. 
 * Aplicación integral de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { StackedPodcastCard } from "@/components/podcast/stacked-podcast-card";
import { Button } from "@/components/ui/button";
import { groupPodcastsByThreadCollection } from "@/lib/podcast-utils";
import { PodcastWithGenealogy, PodcastWithProfile } from "@/types/podcast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * INTERFAZ: PodcastShelfProperties
 * Misión: Definir el contrato de entrada para el carrusel de inteligencia.
 */
interface PodcastShelfProperties {
  /** shelfTitleTextContent: El encabezado visual de la sección de crónicas. */
  shelfTitleTextContent: string;
  /** initialPodcastCollection: Lista plana de activos recuperada de la base de datos. */
  initialPodcastCollection: PodcastWithProfile[];
  /** visualVariantType: Determina la densidad estética del contenedor. */
  visualVariantType?: 'default' | 'compact';
}

/**
 * PodcastShelf: El contenedor de carrusel para el descubrimiento de capital intelectual.
 */
export function PodcastShelf({
  shelfTitleTextContent,
  initialPodcastCollection,
  visualVariantType = 'default'
}: PodcastShelfProperties) {

  // --- I. REFERENCIAS Y ESTADOS DE NAVEGACIÓN (ZAP COMPLIANT) ---
  const horizontalScrollContainerReference = useRef<HTMLDivElement>(null);
  const [isLeftNavigationArrowVisibleStatus, setIsLeftNavigationArrowVisibleStatus] = useState<boolean>(false);
  const [isRightNavigationArrowVisibleStatus, setIsRightNavigationArrowVisibleStatus] = useState<boolean>(true);

  /**
   * groupedPodcastThreadsCollection: 
   * [RESOLUCIÓN TS2305]: Uso de la función purificada 'groupPodcastsByThreadCollection'.
   * Misión: Organizar la colección por hilos para mantener la arquitectura social.
   */
  const groupedPodcastThreadsCollection = useMemo((): PodcastWithGenealogy[] => {
    return groupPodcastsByThreadCollection(initialPodcastCollection);
  }, [initialPodcastCollection]);

  /**
   * executeHorizontalScrollAction:
   * Misión: Desplazar el carrusel basándose en la dirección táctica solicitada.
   */
  const executeHorizontalScrollAction = (scrollDirection: 'left' | 'right') => {
    if (horizontalScrollContainerReference.current) {
      const scrollOffsetPixelsMagnitude = scrollDirection === 'left' ? -360 : 360;
      horizontalScrollContainerReference.current.scrollBy({
        left: scrollOffsetPixelsMagnitude,
        behavior: 'smooth'
      });
    }
  };

  /**
   * validateScrollPositionStatusAction:
   * Misión: Evaluar el estado del contenedor para alternar la visibilidad de los controles.
   */
  const validateScrollPositionStatusAction = () => {
    if (horizontalScrollContainerReference.current) {
      const { scrollLeft, scrollWidth, clientWidth } = horizontalScrollContainerReference.current;
      setIsLeftNavigationArrowVisibleStatus(scrollLeft > 10);
      setIsRightNavigationArrowVisibleStatus(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Sincronía con eventos de hardware para recalcular visibilidad de flechas.
  useEffect(() => {
    validateScrollPositionStatusAction();
    window.addEventListener('resize', validateScrollPositionStatusAction);
    return () => window.removeEventListener('resize', validateScrollPositionStatusAction);
  }, [groupedPodcastThreadsCollection]);

  // Si la colección está vacía, el shelf entra en modo de ocultación táctica (MTI Hygiene).
  if (groupedPodcastThreadsCollection.length === 0) {
    return null;
  }

  return (
    <section className="relative group/shelf py-8 md:py-12 animate-in fade-in duration-1000 isolate">

      {/* CABECERA DEL CARRUSEL DE SABIDURÍA */}
      <div className="flex items-center justify-between mb-8 px-4">
        <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tighter text-white italic font-serif">
          {shelfTitleTextContent}
        </h2>

        {/* Controles de Navegación Cinética (Solo Escritorio) */}
        <div className="hidden md:flex gap-4 opacity-0 group-hover/shelf:opacity-100 transition-all duration-700">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full bg-black/60 border-white/10 hover:bg-primary hover:border-primary transition-all shadow-2xl isolate"
            onClick={() => executeHorizontalScrollAction('left')}
            disabled={!isLeftNavigationArrowVisibleStatus}
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full bg-black/60 border-white/10 hover:bg-primary hover:border-primary transition-all shadow-2xl isolate"
            onClick={() => executeHorizontalScrollAction('right')}
            disabled={!isRightNavigationArrowVisibleStatus}
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </Button>
        </div>
      </div>

      {/* CONTENEDOR DE PROYECCIÓN DE NODOS (CARRUSEL) */}
      <div
        ref={horizontalScrollContainerReference}
        onScroll={validateScrollPositionStatusAction}
        className="flex overflow-x-auto gap-8 pb-12 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0 isolate"
      >
        {groupedPodcastThreadsCollection.map((podcastThreadItem) => (
          <div
            key={podcastThreadItem.id}
            className="min-w-[300px] md:min-w-[400px] snap-start"
          >
            <StackedPodcastCard
              initialPodcastData={podcastThreadItem}
              narrativeReplyCollection={podcastThreadItem.repliesCollection}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Build Shield Absolute: Resolución definitiva de TS2305 mediante la sincronía 
 *    con el nuevo nombre industrial de la utilidad de agrupación.
 * 2. ZAP Absolute Compliance: Purificación total. 'shelfTitle' -> 'shelfTitleTextContent', 
 *    'scrollContainerReference' -> 'horizontalScrollContainerReference', 'idx' -> 'itemIndex'.
 * 3. Type Integrity: Se utiliza 'PodcastWithGenealogy' importado directamente 
 *    del Metal (types/podcast.ts) eliminando interfaces duplicadas en el Cristal.
 * 4. UX Kinematics: El uso de 'snap-x' garantiza que cada crónica se ancle 
 *    perfectamente en el eje visual tras el desplazamiento del Voyager.
 */