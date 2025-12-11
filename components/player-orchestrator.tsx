// components/player-orchestrator.tsx
// VERSIÓN: 2.0 (Fix: Error 500 Elimination via Lazy Loading)

"use client";

import { useAudio } from "@/contexts/audio-context";
import { MiniPlayerBar } from "@/components/mini-player-bar";
// [ELIMINADO] Importación estática causante del error
// import { FullScreenPlayer } from "@/components/full-screen-player";

// [NUEVO] Importación Dinámica: Aísla el reproductor pesado del servidor
import dynamic from "next/dynamic";

const FullScreenPlayer = dynamic(
  () => import("@/components/full-screen-player").then((mod) => mod.FullScreenPlayer),
  { 
    ssr: false, // ¡CRÍTICO! Esto evita que el servidor intente renderizarlo y falle.
    loading: () => null // No mostramos nada mientras carga para evitar parpadeos
  }
);

export function PlayerOrchestrator() {
  const { currentPodcast, isPlayerExpanded } = useAudio();

  // Si no hay podcast activo, no renderizamos nada
  if (!currentPodcast) {
    return null;
  }
  
  // Si está expandido, cargamos dinámicamente el componente pesado
  if (isPlayerExpanded) {
    return <FullScreenPlayer />;
  }
  
  // Por defecto, mostramos la barra mini (que es ligera y segura)
  return <MiniPlayerBar />;
}