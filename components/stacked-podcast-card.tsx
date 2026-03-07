// components/stacked-podcast-card.tsx
// VERSIÓN: 5.0 (NicePod Interactive Stack - Decoupled Routing & Cinematic Mastery)
// Misión: Generar la ilusión de profundidad 3D para hilos de conocimiento sin violar la semántica HTML5.
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
   * ESCENARIO 1: Nodo Único (Sin Remixes)
   * Si no hay hilo de respuestas, no necesitamos el efecto "Stack". 
   * Devolvemos directamente la tarjeta principal, la cual gestionará su propio enlace.
   */
  if (replyCount === 0) {
    return (
      <div className="h-full w-full relative">
        <PodcastCard podcast={podcast} />
      </div>
    );
  }

  /**
   * ESCENARIO 2: Nodo Complejo (Con Genealogía/Remixes)
   * Renderizamos el efecto de "Baraja Apilada" utilizando Z-Index y transformaciones.
   * [CRÍTICO]: Este contenedor NO es un <Link>. Es un <div> interactivo (group).
   */
  return (
    <div className="relative group h-full w-full">
      
      {/* 
          CAPA PROFUNDA (Z: -20)
          La carta más lejana. Solo existe visualmente si el hilo tiene más de 1 respuesta.
          Usamos aria-hidden="true" para mantener el DOM limpio para Screen Readers.
      */}
      {replyCount > 1 && (
        <div 
          aria-hidden="true"
          className="absolute top-4 left-4 w-full h-full bg-zinc-900/60 backdrop-blur-sm rounded-[2.5rem] border border-white/5 rotate-3 scale-[0.88] -z-20 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-6 group-hover:top-5 group-hover:left-5 shadow-2xl" 
        />
      )}

      {/* 
          CAPA ESTRUCTURAL (Z: -10)
          La carta intermedia. Alberga el indicador numérico de "Remixes".
      */}
      <div 
        aria-hidden="true"
        className="absolute top-2 left-2 w-full h-full bg-zinc-800/80 backdrop-blur-md rounded-[2.5rem] border border-white/10 rotate-1 scale-[0.94] -z-10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-3 group-hover:top-3 group-hover:left-3 shadow-xl"
      >
        {/* Badge Flotante: Indicador de Hilo de Conversación */}
        <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 z-50 flex items-center justify-center bg-primary text-white text-[9px] md:text-[10px] font-black tracking-widest px-3 py-1 md:px-3.5 md:py-1.5 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.6)] border-[3px] border-[#020202] transform transition-transform duration-500 group-hover:scale-110">
          <MessageCircle className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1.5 fill-current" />
          +{replyCount}
        </div>
      </div>

      {/* 
          CAPA CERO (Z: 0)
          La carta frontal y motor interactivo. 
          Al no estar asfixiada por un <Link> padre, el PodcastCard puede tener
          su propio enlace (Absolute Overlay) y botones internos funcionando perfectamente.
      */}
      <div className="relative z-0 h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-2">
        <PodcastCard podcast={podcast} />
      </div>
      
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Independencia Funcional: Al desvincular la navegación del contenedor padre,
 *    eliminamos los errores de renderizado de React en Safari/iOS provocados por 
 *    la anidación ilegal de elementos interactivos (<a> dentro de <a>).
 * 2. Transición Natural: Reemplazamos las clases genéricas de easing por la función 
 *    física 'ease-[cubic-bezier(0.16,1,0.3,1)]' (estándar NicePod) para que 
 *    el efecto de apilamiento responda con inercia visual táctil.
 * 3. Responsividad de Badge: Los tamaños del indicador de Remixes se adaptaron 
 *    (md:) para no invadir excesivamente las portadas en las pantallas móviles.
 */