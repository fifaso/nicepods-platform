// contexts/audio-context.tsx
// VERSIÓN: 3.0 (Madrid Resonance - Engagement Sensor & Audio Engine)

"use client";

import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { PodcastWithProfile } from "@/types/podcast";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

/**
 * INTERFAZ MAESTRA: AudioContextType
 * Define el contrato para el control de medios y el registro de resonancia.
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
  logInteractionEvent: (type: 'completed_playback' | 'liked' | 'shared') => Promise<void>; // [NUEVO]: Fix para error de tipos
  isPlayerExpanded: boolean;
  expandPlayer: () => void;
  collapsePlayer: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

/**
 * PROVIDER: AudioProvider
 * El motor que da voz a NicePod y mide la atención de la audiencia.
 */
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { user, supabase: authSupabase } = useAuth();

  // Usamos el cliente compartido de auth o creamos uno de cliente si no hay sesión
  const supabase = authSupabase || createClient();

  const [currentPodcast, setCurrentPodcast] = useState<PodcastWithProfile | null>(null);
  const [queue, setQueue] = useState<PodcastWithProfile[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);

  // Referencia persistente al motor de audio del navegador
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * INITIALIZATION
   * Configuramos el listener de alta frecuencia fuera de React para performance.
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'metadata';
      audioRef.current = audio;

      const handleTimeUpdate = () => {
        window.dispatchEvent(new CustomEvent('nicepod-timeupdate', {
          detail: { currentTime: audio.currentTime, duration: audio.duration }
        }));
      };

      audio.addEventListener("play", () => setIsPlaying(true));
      audio.addEventListener("pause", () => setIsPlaying(false));
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("loadstart", () => setIsLoading(true));
      audio.addEventListener("canplay", () => setIsLoading(false));
      audio.addEventListener("ended", () => handleAutoNext());
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  /**
   * logInteractionEvent [SISTEMA DE RESONANCIA]
   * Registra eventos de usuario en la base de datos para alimentar el motor de IA.
   */
  const logInteractionEvent = useCallback(async (type: 'completed_playback' | 'liked' | 'shared') => {
    if (!user || !currentPodcast) return;

    try {
      await supabase.from('playback_events').insert({
        user_id: user.id,
        podcast_id: currentPodcast.id,
        event_type: type
      });
      console.log(`[NicePod-Audio] Evento '${type}' registrado.`);
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
    logInteractionEvent('completed_playback'); // Log automático al terminar
  }, [queue, currentPodcast, logInteractionEvent]);

  const playPodcast = useCallback((podcast: PodcastWithProfile, playlist: PodcastWithProfile[] = []) => {
    const audio = audioRef.current;
    if (!audio || !podcast.audio_url) return;

    if (playlist.length > 0) setQueue(playlist);

    if (currentPodcast?.id === podcast.id) {
      audio.paused ? audio.play() : audio.pause();
    } else {
      setCurrentPodcast(podcast);
      audio.src = podcast.audio_url;
      audio.play().catch(err => console.error("[NicePod-Audio] Playback failed:", err));

      // Incrementar contador global (RPC)
      supabase.rpc('increment_play_count', { podcast_id: podcast.id }).then();
    }
  }, [currentPodcast, supabase]);

  const value = useMemo(() => ({
    currentPodcast,
    queue,
    isPlaying,
    isLoading,
    audioRef,
    playPodcast,
    togglePlayPause: () => audioRef.current?.paused ? audioRef.current.play() : audioRef.current?.pause(),
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

/**
 * useAudio
 * Hook de acceso al motor de audio y analíticas.
 */
export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio debe ser utilizado dentro de un AudioProvider");
  return context;
};