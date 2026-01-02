// contexts/audio-context.tsx
// VERSIÓN: 23.0 (Audio Engine Core: Stable Singleton & Queue Fix)

"use client";

import type React from "react";
import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { PodcastWithProfile } from "@/types/podcast";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface AudioContextType {
  currentPodcast: PodcastWithProfile | null;
  queue: PodcastWithProfile[];
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  duration: number;
  currentTime: number;
  volume: number;
  playPodcast: (podcast: PodcastWithProfile, playlist?: PodcastWithProfile[]) => void;
  togglePlayPause: () => void;
  closePodcast: () => void;
  seekTo: (time: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  setVolume: (volume: number) => void;
  isPlayerExpanded: boolean;
  expandPlayer: () => void;
  collapsePlayer: () => void;
  logInteractionEvent: (podcastId: number, eventType: 'liked' | 'shared') => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const supabase = useRef(createClient()).current;
  
  const [currentPodcast, setCurrentPodcast] = useState<PodcastWithProfile | null>(null);
  const [queue, setQueue] = useState<PodcastWithProfile[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);

  // Mantenemos una única instancia de Audio durante toda la vida de la App
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inicialización única del objeto Audio
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'metadata'; // Mejoramos a metadata para obtener duración rápido
      audioRef.current = audio;

      // Listeners de estado estables
      audio.addEventListener("play", () => setIsPlaying(true));
      audio.addEventListener("pause", () => setIsPlaying(false));
      audio.addEventListener("loadstart", () => setIsLoading(true));
      audio.addEventListener("canplay", () => setIsLoading(false));
      audio.addEventListener("waiting", () => setIsLoading(true));
      audio.addEventListener("playing", () => setIsLoading(false));
      audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
      audio.addEventListener("durationchange", () => setDuration(audio.duration));
      audio.addEventListener("error", () => {
        setError("Error en la fuente de audio.");
        setIsLoading(false);
      });
    }
  }, []);

  const closePodcast = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setCurrentPodcast(null);
    setQueue([]);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const playNext = useCallback(() => {
    if (queue.length === 0) return closePodcast();
    const currentIndex = queue.findIndex(p => p.id === currentPodcast?.id);
    const nextPodcast = queue[currentIndex + 1];

    if (nextPodcast) {
      // Re-invocamos la reproducción para el siguiente item
      playPodcast(nextPodcast, queue);
    } else {
      closePodcast();
    }
  }, [queue, currentPodcast, closePodcast]);

  // Listener para el fin del audio (Auto-advance)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (user && currentPodcast) {
        supabase.from('playback_events').insert({
          user_id: user.id,
          podcast_id: currentPodcast.id,
          event_type: 'completed_playback',
        }).then();
      }
      playNext();
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [user, currentPodcast, playNext, supabase]);

  const playPodcast = useCallback((podcast: PodcastWithProfile, playlist: PodcastWithProfile[] = []) => {
    const audio = audioRef.current;
    if (!audio || !podcast.audio_url) return;

    // Si es el mismo podcast, hacemos toggle
    if (currentPodcast?.id === podcast.id) {
      audio.paused ? audio.play().catch(() => {}) : audio.pause();
      return;
    }

    // Si hay una playlist nueva, la cargamos en la cola
    if (playlist.length > 0) {
      setQueue(playlist);
    }

    // Cambio de fuente y reproducción
    setCurrentPodcast(podcast);
    setIsLoading(true);
    audio.src = podcast.audio_url;
    audio.load();
    audio.play().catch((e) => {
      console.error("Playback failed:", e);
      setError("No se pudo iniciar la reproducción.");
    });

    // Incrementar play count en segundo plano
    supabase.rpc('increment_play_count', { podcast_id: podcast.id }).then();
  }, [currentPodcast, supabase]);

  const contextValue: AudioContextType = {
    currentPodcast, queue, isPlaying, isLoading, error, duration, currentTime, volume,
    playPodcast, 
    togglePlayPause: () => {
        if (!audioRef.current) return;
        audioRef.current.paused ? audioRef.current.play().catch(() => {}) : audioRef.current.pause();
    },
    closePodcast,
    seekTo: (t) => { if (audioRef.current) audioRef.current.currentTime = t; },
    skipForward: (s = 15) => { if (audioRef.current) audioRef.current.currentTime += s; },
    skipBackward: (s = 15) => { if (audioRef.current) audioRef.current.currentTime -= s; },
    setVolume: (v) => { 
        if (audioRef.current) audioRef.current.volume = v;
        setVolumeState(v);
    },
    isPlayerExpanded,
    expandPlayer: () => setIsPlayerExpanded(true),
    collapsePlayer: () => setIsPlayerExpanded(false),
    logInteractionEvent: async (id, type) => {
        if (user) await supabase.from('playback_events').insert({ user_id: user.id, podcast_id: id, event_type: type });
    }
  };

  return <AudioContext.Provider value={contextValue}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio debe ser usado dentro de un AudioProvider");
  return context;
}