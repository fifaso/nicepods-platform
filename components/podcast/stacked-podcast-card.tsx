/**
 * ARCHIVO: components/podcast/stacked-podcast-card.tsx
 * VERSIÓN: 6.0 (NicePod Interactive Stack - Nominal Sovereignty Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Generar la ilusión de profundidad tridimensional para hilos de conocimiento,
 * permitiendo visualizar la genealogía de remixes sin comprometer la interactividad.
 * [REFORMA V6.0]: Sincronización nominal total con PodcastCard V9.0 y 
 * cumplimiento estricto de la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { PodcastCard } from "@/components/podcast/podcast-card";
import { PodcastWithProfile } from "@/types/podcast";
import { MessageCircle } from "lucide-react";
import { memo } from "react";

/**
 * INTERFAZ: StackedPodcastCardProperties
 */
interface StackedPodcastCardProperties {
  /** initialPodcastData: El nodo raíz de la crónica de conocimiento. */
  initialPodcastData: PodcastWithProfile;
  /** narrativeReplyCollection: Arreglo de crónicas vinculadas en formato de hilo. */
  narrativeReplyCollection?: PodcastWithProfile[];
}

/**
 * StackedPodcastCard: El componente de visualización de profundidad pericial.
 */
export const StackedPodcastCard = memo(function StackedPodcastCard({
  initialPodcastData, 
  narrativeReplyCollection = [] 
}: StackedPodcastCardProperties) {
  
  const replyTotalMagnitude = narrativeReplyCollection.length;

  /**
   * ESCENARIO 1: Nodo de Conocimiento Único (Sin Ramificaciones)
   * Si no existe una genealogía de respuestas, se proyecta la tarjeta base.
   */
  if (replyTotalMagnitude === 0) {
    return (
      <div className="h-full w-full relative">
        <PodcastCard initialPodcastData={initialPodcastData} />
      </div>
    );
  }

  /**
   * ESCENARIO 2: Nodo de Conocimiento Complejo (Con Malla de Remixes)
   * Se construye la ilusión de baraja apilada utilizando transformaciones cinemáticas.
   */
  return (
    <div className="relative group h-full w-full">
      
      {/* 
          CAPA PROFUNDA: Visualización de Extensión (Z-Index: -20)
          Proyecta la magnitud del hilo para hilos con alta densidad de respuestas.
      */}
      {replyTotalMagnitude > 1 && (
        <div 
          aria-hidden="true"
          className="absolute top-4 left-4 w-full h-full bg-zinc-900/60 backdrop-blur-sm rounded-[2.5rem] border border-white/5 rotate-3 scale-[0.88] -z-20 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-6 group-hover:top-5 group-hover:left-5 shadow-2xl" 
        />
      )}

      {/* 
          CAPA ESTRUCTURAL: Soporte de Identificación (Z-Index: -10)
          Alberga el metadato numérico de la magnitud del hilo.
      */}
      <div 
        aria-hidden="true"
        className="absolute top-2 left-2 w-full h-full bg-zinc-800/80 backdrop-blur-md rounded-[2.5rem] border border-white/10 rotate-1 scale-[0.94] -z-10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-3 group-hover:top-3 group-hover:left-3 shadow-xl"
      >
        {/* Badge de Magnitud: Indicador de Resonancia en el Hilo */}
        <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 z-50 flex items-center justify-center bg-primary text-white text-[9px] md:text-[10px] font-black tracking-widest px-3 py-1 md:px-3.5 md:py-1.5 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.6)] border-[3px] border-[#020202] transform transition-transform duration-500 group-hover:scale-110">
          <MessageCircle className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1.5 fill-current" />
          +{replyTotalMagnitude}
        </div>
      </div>

      {/* 
          CAPA PRIMARIA: Interfaz de Autoridad (Z-Index: 0)
          La tarjeta frontal que gestiona la navegación y los comandos acústicos.
          [FIX V6.0]: Sincronía nominal estricta con el contrato de PodcastCard V9.0.
      */}
      <div className="relative z-0 h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-2">
        <PodcastCard initialPodcastData={initialPodcastData} />
      </div>
      
    </div>
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Build Shield Compliance: Se sustituyó la propiedad 'podcast' por 'initialPodcastData' 
 *    en el componente PodcastCard, neutralizando los errores TS2322 de las líneas 28 y 75.
 * 2. Zero Abbreviations Policy: Purificación absoluta de términos. 'props' a 'properties', 
 *    'replies' a 'narrativeReplyCollection', 'count' a 'replyTotalMagnitude'.
 * 3. Cinematic Integrity: Se mantiene la función de easing 'cubic-bezier(0.16,1,0.3,1)' 
 *    como estándar industrial para garantizar una respuesta visual de alta fidelidad.
 */