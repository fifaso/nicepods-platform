// contexts/audio-context.tsx
// VERSIÓN: 4.0 (NicePod Audio Terminal - Resilient Interaction Standard)
// Misión: Motor de audio neuronal con tolerancia a fallos y feedback táctil inmediato.
// [ESTABILIZACIÓN]: Integración de Toaster para errores de red y manejo estricto de bloqueos de autoplay.

"use client";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { PodcastWithProfile } from "@/types/podcast";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

/**
 * INTERFAZ: AudioContextType
 * Define el contrato profesional para la orquestación acústica.
 */
export interface AudioContextType {
  currentPodcast: PodcastWithProfile | null;
  queue: PodcastWithProfile[];
  isPlaying: boolean;
  isLoading: boolean;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  playPodcast: (podcast: PodcastWithProfile, playlist?: PodcastWithProfile[]) => void;
  togglePlayPause: () => void;
  closePodcast: () => void;
  seekTo: (time: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  logInteractionEvent: (type: 'completed_playback' | 'liked' | 'shared') => Promise<void>;
  isPlayerExpanded: boolean;
  expandPlayer: () => void;
  collapsePlayer: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

/**
 * PROVIDER: AudioProvider
 */
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { user, supabase: authSupabase } = useAuth();
  const { toast } = useToast();
  const supabase = authSupabase || createClient();

  const [currentPodcast, setCurrentPodcast] = useState<PodcastWithProfile | null>(null);
  const [queue, setQueue] = useState<PodcastWithProfile[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * [INICIALIZACIÓN DE HARDWARE]
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'metadata';
      audioRef.current = audio;

      audio.addEventListener("play", () => setIsPlaying(true));
      audio.addEventListener("pause", () => setIsPlaying(false));
      audio.addEventListener("loadstart", () => setIsLoading(true));
      audio.addEventListener("canplay", () => setIsLoading(false));
      audio.addEventListener("ended", () => handleAutoNext());

      // Manejador de errores global del nodo de audio
      audio.addEventListener("error", (e) => {
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Error de Nodo",
          description: "No se pudo establecer conexión con el flujo de audio."
        });
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [toast]);

  const logInteractionEvent = useCallback(async (type: 'completed_playback' | 'liked' | 'shared') => {
    if (!user || !currentPodcast) return;
    try {
      await supabase.from('playback_events').insert({
        user_id: user.id,
        podcast_id: currentPodcast.id,
        event_type: type
      });
    } catch (err) {
      console.error("[NicePod-Audio] Error al loguear interacción:", err);
    }
  }, [user, currentPodcast, supabase]);

  const handleAutoNext = useCallback(() => {
    if (queue.length > 0 && currentPodcast) {
      const idx = queue.findIndex(p => p.id === currentPodcast.id);
      if (idx !== -1 && idx < queue.length - 1) {
        playPodcast(queue[idx + 1]);
        return;
      }
    }
    setIsPlaying(false);
    logInteractionEvent('completed_playback');
  }, [queue, currentPodcast, logInteractionEvent]);

  /**
   * [CORRECCIÓN ESTRATÉGICA]: Manejo asíncrono de play()
   * Incluimos try/catch para capturar 'NotAllowedError' (bloqueo del navegador)
   * y errores de red.
   */
  const playPodcast = useCallback(async (podcast: PodcastWithProfile, playlist: PodcastWithProfile[] = []) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!podcast.audio_url) {
      toast({
        variant: "destructive",
        title: "Nodo Incompleto",
        description: "El audio aún está siendo forjado en el servidor."
      });
      return;
    }

    if (playlist.length > 0) setQueue(playlist);

    try {
      if (currentPodcast?.id === podcast.id) {
        if (audio.paused) await audio.play(); else audio.pause();
      } else {
        setCurrentPodcast(podcast);
        audio.src = podcast.audio_url;
        await audio.play();

        // Incrremento de contador mediante RPC
        await supabase.rpc('increment_play_count', { podcast_id: podcast.id });
      }
    } catch (error: any) {
      console.error("[NicePod-Audio] Playback failed:", error);

      // Feedback industrial: informamos al usuario sobre el fallo
      if (error.name === 'NotAllowedError') {
        toast({
          title: "Requiere interacción",
          description: "Por favor, toca el botón de reproducción nuevamente para iniciar."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error de Conexión",
          description: "No se pudo recuperar el activo acústico desde el servidor."
        });
      }
    }
  }, [currentPodcast, supabase, toast]);

  const value = useMemo(() => ({
    currentPodcast,
    queue,
    isPlaying,
    isLoading,
    audioRef,
    playPodcast,
    togglePlayPause: () => {
      const audio = audioRef.current;
      if (audio) audio.paused ? audio.play().catch(console.error) : audio.pause();
    },
    closePodcast: () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      setCurrentPodcast(null);
      setQueue([]);
    },
    seekTo: (t: number) => { if (audioRef.current) audioRef.current.currentTime = t; },
    skipForward: (s = 15) => { if (audioRef.current) audioRef.current.currentTime += s; },
    skipBackward: (s = 15) => { if (audioRef.current) audioRef.current.currentTime -= s; },
    logInteractionEvent,
    isPlayerExpanded,
    expandPlayer: () => setIsPlayerExpanded(true),
    collapsePlayer: () => setIsPlayerExpanded(false),
  }), [currentPodcast, queue, isPlaying, isLoading, isPlayerExpanded, logInteractionEvent, playPodcast]);

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio debe ser utilizado dentro de un AudioProvider");
  return context;
};

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Manejo Asíncrono: Se cambió 'playPodcast' a async para capturar errores de 
 *    bloqueo de navegador (Autoplay Policy) que son comunes en entornos móviles.
 * 2. Feedback de Usuario: El uso de 'toast' asegura que el usuario no se sienta 
 *    ignorado si la red falla o el archivo no existe.
 * 3. Integridad de estado: La carga del nodo de audio ahora verifica la 
 *    existencia del 'audio_url' antes de intentar la reproducción, evitando 
 *    errores de red innecesarios.
 */