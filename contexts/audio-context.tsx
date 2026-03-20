// contexts/audio-context.tsx
// VERSIÓN: 6.0 (NicePod Audio Terminal - Hardware Sync Edition)
// Misión: Motor de audio neuronal con despacho de telemetría de alta frecuencia.
// [ESTABILIZACIÓN]: Implementación de 'nicepod-timeupdate' para aniquilar el re-renderizado de React.

"use client";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { PodcastWithProfile } from "@/types/podcast";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export interface AudioContextType {
  currentPodcast: PodcastWithProfile | null;
  queue: PodcastWithProfile[];
  isPlaying: boolean;
  isLoading: boolean;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  playPodcast: (podcast: PodcastWithProfile, playlist?: PodcastWithProfile[]) => Promise<void>;
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
  const currentPodcastRef = useRef<PodcastWithProfile | null>(null);

  useEffect(() => { currentPodcastRef.current = currentPodcast; }, [currentPodcast]);

  /**
   * 1. INICIALIZACIÓN DE HARDWARE SOBERANO
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'metadata';
      audioRef.current = audio;

      // Listeners de Estado Base
      audio.addEventListener("play", () => setIsPlaying(true));
      audio.addEventListener("pause", () => setIsPlaying(false));
      audio.addEventListener("loadstart", () => setIsLoading(true));
      audio.addEventListener("canplay", () => setIsLoading(false));
      audio.addEventListener("ended", () => handleAutoNext());

      /**
       * [TELEMETRÍA DE ALTA FRECUENCIA]
       * Despachamos un evento nativo para que los componentes (ProgressBar, ScriptViewer)
       * se actualicen mediante REFS de DOM, puenteando a React.
       */
      audio.addEventListener("timeupdate", () => {
        if (!audioRef.current) return;
        const currentTime = audioRef.current.currentTime;
        const duration = audioRef.current.duration || 0;
        
        window.dispatchEvent(new CustomEvent('nicepod-timeupdate', {
          detail: { 
            currentTime, 
            duration,
            percentage: duration > 0 ? (currentTime / duration) * 100 : 0
          }
        }));
      });

      audio.addEventListener("error", (e) => {
        setIsLoading(false);
        const target = e.target as HTMLAudioElement;
        if (!currentPodcastRef.current) return;
        if (target.error && target.src && target.src !== window.location.href) {
          toast({
            variant: "destructive",
            title: "Frecuencia Inestable",
            description: "No se pudo recuperar el activo acústico."
          });
        }
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
      }
    };
  }, [toast]);

  // [LÓGICA DE INTERACCIÓN MANTENIDA...]
  const logInteractionEvent = useCallback(async (type: 'completed_playback' | 'liked' | 'shared') => {
    if (!user || !currentPodcast) return;
    try {
      await supabase.from('playback_events').insert({
        user_id: user.id,
        podcast_id: currentPodcast.id,
        event_type: type
      });
    } catch (err) { }
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

  const playPodcast = useCallback(async (podcast: PodcastWithProfile, playlist: PodcastWithProfile[] = []) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!podcast.audio_url) {
      toast({ variant: "destructive", title: "Nodo Incompleto", description: "Audio en forja." });
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
        supabase.rpc('increment_play_count', { podcast_id: podcast.id }).then();
      }
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        toast({ title: "Sistema Bloqueado", description: "Requiere interacción manual." });
      }
    }
  }, [currentPodcast, supabase, toast]);

  const value = useMemo(() => ({
    currentPodcast, queue, isPlaying, isLoading, audioRef, playPodcast,
    togglePlayPause: () => {
      const audio = audioRef.current;
      if (audio) audio.paused ? audio.play().catch(console.error) : audio.pause();
    },
    closePodcast: () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
      }
      setCurrentPodcast(null);
      setQueue([]);
      setIsPlayerExpanded(false);
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