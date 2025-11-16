// components/podcast-shelf.tsx
// Un componente reutilizable para mostrar una colección de podcasts en un carrusel horizontal.

import { PodcastWithProfile } from "@/types/podcast";
import { PodcastCard } from "@/components/podcast-card";

interface PodcastShelfProps {
  title: string;
  podcasts: PodcastWithProfile[] | null;
}

export function PodcastShelf({ title, podcasts }: PodcastShelfProps) {
  // Guarda de robustez: Si no hay podcasts, no se renderiza nada.
  if (!podcasts || podcasts.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-4 px-4 md:px-0">{title}</h2>
      {/* 
        Contenedor flexible con overflow para el carrusel. 
        El padding se aplica aquí para que el scroll comience desde el borde de la pantalla en móviles.
      */}
      <div className="flex overflow-x-auto space-x-4 pb-4 px-4 md:px-0 scrollbar-thin scrollbar-thumb-gray-700/50 hover:scrollbar-thumb-gray-600/50 scrollbar-track-transparent scrollbar-thumb-rounded-full">
        {podcasts.map((podcast) => (
          // Contenedor de cada tarjeta para controlar su tamaño y evitar que se encoja.
          <div key={podcast.id} className="flex-shrink-0 w-64 md:w-72">
            <PodcastCard podcast={podcast} />
          </div>
        ))}
        {/* Espaciador final para asegurar que el último elemento no quede pegado al borde en pantallas sin padding */}
        <div className="flex-shrink-0 w-1 md:w-0" />
      </div>
    </section>
  );
}