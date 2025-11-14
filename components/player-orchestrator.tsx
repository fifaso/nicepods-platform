//components/player-orchestrator.tsx
"use client";

import { useAudio } from "@/contexts/audio-context";
import { MiniPlayerBar } from "@/components/mini-player-bar";
import { FullScreenPlayer } from "@/components/full-screen-player";

export function PlayerOrchestrator() {
  const { currentPodcast, isPlayerExpanded } = useAudio();

  if (!currentPodcast) {
    return null;
  }
  
  // ================== INTERVENCIÓN QUIRÚRGICA: LA DECISIÓN ==================
  // Ahora, el orquestador comprueba el estado `isPlayerExpanded` y renderiza
  // el componente correspondiente.
  if (isPlayerExpanded) {
    return <FullScreenPlayer />;
  }
  
  return <MiniPlayerBar />;
  // ========================================================================
}