// components/stacked-podcast-card.tsx
// VERSIÓN: 4.0 (NicePod Interactive Stack - Decoupled Routing Edition)
// Misión: Generar la ilusión de profundidad 3D para hilos de conocimiento sin romper la semántica HTML5.
// [ESTABILIZACIÓN]: Eliminación de enlaces envolventes globales. Delegación de clics a la tarjeta frontal.

"use client";

import { PodcastCard } from "@/components/podcast-card";
import { PodcastWithProfile } from "@/types/podcast";
import { MessageCircle } from "lucide-react";

interface StackedPodcastCardProps {
  podcast: PodcastWithProfile;
  replies?: PodcastWithProfile[];
}

export function StackedPodcastCard({ podcast, replies = [] }: StackedPodcastCardProps) {
  const replyCount = replies.length;

  /**
   * ESCENARIO 1: Tarjeta Única (Sin hilos)
   * Si no hay respuestas, simplemente renderizamos la tarjeta principal.
   * La tarjeta frontal asume toda la responsabilidad de navegación e interacción.
   */
  if (replyCount === 0) {
    return (
      <div className="h-full w-full relative">
        <PodcastCard podcast={podcast} />
      </div>
    );
  }

  /**
   * ESCENARIO 2: Nodo Complejo (Con Remixes)
   * Renderizamos el efecto de "Baraja" (Stack).
   */
  return (
    <div className="relative group transition-all duration-500 hover:-translate-y-2 h-full w-full">
      
      {/* 
          CAPA -2: LA CARTA MÁS LEJANA (Sombras y Profundidad)
          Solo se renderiza si hay más de 1 respuesta (al menos 3 cartas en total).
      */}
      {replyCount > 1 && (
        <div 
          className="absolute top-4 left-4 w-full h-full bg-zinc-900/60 backdrop-blur-sm rounded-[2.5rem] border border-white/5 rotate-3 scale-[0.88] -z-20 transition-all duration-700 group-hover:rotate-6 group-hover:top-5 group-hover:left-5 shadow-2xl" 
          aria-hidden="true" 
        />
      )}

      {/* 
          CAPA -1: LA CARTA MEDIA (Soporte Estructural)
          Alberga el indicador numérico de la genealogía (Remixes).
      */}
      <div 
        className="absolute top-2 left-2 w-full h-full bg-zinc-800/80 backdrop-blur-md rounded-[2.5rem] border border-white/10 rotate-1 scale-[0.94] -z-10 transition-all duration-500 group-hover:rotate-3 group-hover:top-3 group-hover:left-3 shadow-xl"
        aria-hidden="true"
      >
        {/* Badge de contador de hilos (Resonancias derivadas) */}
        <div className="absolute -top-3 -right-3 z-50 flex items-center justify-center bg-primary text-white text-[10px] font-black tracking-widest px-3.5 py-1.5 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.6)] border-[3px] border-[#020202] transform transition-transform duration-500 group-hover:scale-110">
          <MessageCircle className="w-3 h-3 mr-1.5 fill-current" />
          +{replyCount}
        </div>
      </div>

      {/* 
          CAPA 0: LA CARTA PRINCIPAL (Frente Interactivo)
          Al no tener un <Link> que envuelva este contenedor padre, el PodcastCard 
          puede tener sus propios <Link> y <button> internos sin generar errores 
          de hidratación o bloqueos de DOM en Next.js.
      */}
      <div className="relative z-0 h-full w-full transition-transform duration-500">
        <PodcastCard podcast={podcast} />
      </div>
      
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Desacoplamiento de Enrutamiento: Al eliminar la etiqueta <Link> que envolvía 
 *    la estructura, evitamos el error "Nested <a> tags" que colapsaba Safari.
 *    La navegación ahora es exclusiva de 'PodcastCard'.
 * 2. Cinemática Física: Se ajustaron las rotaciones y escalas (scale-[0.94], top-2) 
 *    para dar un efecto de apilamiento más orgánico. Al hacer 'hover', las cartas 
 *    traseras se abren ligeramente como un abanico (group-hover:rotate-6).
 * 3. Accesibilidad Oculta: 'aria-hidden="true"' indica a los lectores de pantalla 
 *    que ignoren los 'divs' decorativos traseros para evitar que lean la tarjeta 
 *    múltiples veces.
 */