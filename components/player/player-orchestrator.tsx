// components/player-orchestrator.tsx
// VERSIÓN: 3.0 (NicePod Audio Orchestrator - Seamless Transition Standard)
// Misión: Orquestar la transición cinemática entre el control táctico (Mini) y la inmersión (Full).
// [ESTABILIZACIÓN]: Implementación de AnimatePresence para transiciones sin parpadeo y carga diferida.

"use client";

import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

// --- INFRAESTRUCTURA CORE ---
import { MiniPlayerBar } from "@/components/player/mini-player-bar";
import { useAudio } from "@/contexts/audio-context";

/**
 * [SHIELD]: FullScreenPlayer (Lazy Loaded)
 * Aislamos el componente de inmersión total. Al ser un componente de alta 
 * densidad gráfica (blobs aurora, teleprompter), solo se carga cuando el 
 * usuario activa el comando de expansión, optimizando el LCP.
 */
const FullScreenPlayer = dynamic(
  () => import("@/components/player/full-screen-player").then((mod) => mod.FullScreenPlayer),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-[200] bg-[#020202] animate-pulse" />
    )
  }
);

/**
 * COMPONENTE: PlayerOrchestrator
 * El director de orquesta que decide qué terminal de audio proyectar en el viewport.
 */
export function PlayerOrchestrator() {
  const { currentActivePodcast, isPlayerExpanded } = useAudio();

  /**
   * [GUARDIAN DE SOBERANÍA]:
   * Si no existe un podcast cargado en el contexto global, el orquestador 
   * repliega todas las interfaces para liberar espacio visual en la plataforma.
   */
  if (!currentActivePodcast) {
    return null;
  }

  return (
    /**
     * AnimatePresence permite que los componentes hijos ejecuten sus 
     * animaciones de 'exit' antes de ser removidos del DOM, logrando 
     * el efecto de fluidez de grado Spotify Premium.
     */
    <div className="relative">
      <AnimatePresence mode="wait">

        {isPlayerExpanded ? (
          /**
           * CAPA DE INMERSIÓN TOTAL (Full Screen)
           * Se despliega desde el eje inferior cubriendo toda la Workstation.
           */
          <FullScreenPlayer key="full-player" />
        ) : (
          /**
           * TERMINAL TÁCTICA (Mini Player)
           * Se mantiene fija en la base de la pantalla como un HUD persistente.
           */
          <MiniPlayerBar key="mini-player" />
        )}

      </AnimatePresence>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Gestión de Capas (Z-Index): El orquestador opera en un nivel superior al 
 *    Dashboard y al Mapa, asegurando que la música sea el hilo conductor 
 *    inalienable de la experiencia NicePod.
 * 2. Rendimiento Adaptativo: Al usar 'mode="wait"', React espera a que la 
 *    barra mini desaparezca antes de renderizar el reproductor pesado, 
 *    evitando picos de uso de CPU que podrían congelar las animaciones de la Aurora.
 * 3. Integridad de Estado: Al depender únicamente del 'AudioContext', este 
 *    componente es inmune a los cambios de ruta, garantizando que si el usuario 
 *    pasa de la Biblioteca al Mapa, el reproductor no sufra reinicializaciones.
 */