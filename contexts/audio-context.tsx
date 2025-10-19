"use client";

import type React from "react";
import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { PodcastWithProfile } from "@/types/podcast";
import { createClient } from "@/lib/supabase/client";

export interface AudioContextType {
  currentPodcast: PodcastWithProfile | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  duration: number;
  currentTime: number;
  volume: number;
  playPodcast: (podcast: PodcastWithProfile) => void;
  togglePlayPause: () => void;
  closePodcast: () => void;
  seekTo: (time: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  setVolume: (volume: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const supabase = createClient();
  
  const [currentPodcast, setCurrentPodcast] = useState<PodcastWithProfile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
    setIsPlaying(false);
    setIsLoading(false);
    setError(null);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleLoadStart = () => { setIsLoading(true); setError(null); };
    const handleCanPlay = () => setIsLoading(false);
    const handlePlaying = () => { setIsLoading(false); setIsPlaying(true); };
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      setError("Error al cargar el audio.");
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);

    return () => {
      cleanup();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
    };
  }, [cleanup]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !currentPodcast) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else if (audioRef.current.src) {
      audioRef.current.play().catch(e => {
        console.error("Error al reanudar la reproducción:", e);
        setError("No se pudo reanudar el audio.");
      });
    }
  }, [isPlaying, currentPodcast]);

  const playPodcast = useCallback((podcast: PodcastWithProfile) => {
    if (!podcast.audio_url) {
      toast({ title: "Audio no disponible", description: "Este guion aún no ha sido procesado para generar el audio.", variant: "destructive" });
      return;
    }
    
    if (audioRef.current) {
      if (currentPodcast?.id === podcast.id) {
        togglePlayPause();
        return;
      }
      
      cleanup();
      setCurrentPodcast(podcast);
      audioRef.current.src = podcast.audio_url;
      audioRef.current.volume = volume;
      audioRef.current.play().catch(e => {
        console.error("Error al iniciar la reproducción:", e);
        setError("No se pudo reproducir el audio.");
      });

      // ================== INTERVENCIÓN QUIRÚRGICA: HITO 2 ==================
      // Se invoca la función RPC para registrar la reproducción de forma asíncrona ("fire-and-forget").
      supabase
        .rpc('increment_play_count', { podcast_id: podcast.id })
        .then(({ error }) => {
          if (error) {
            console.error(`Error al incrementar play_count para el podcast ${podcast.id}:`, error);
          }
        });
      // ====================================================================
    }
  }, [cleanup, toast, currentPodcast, togglePlayPause, volume, supabase]);

  const closePodcast = useCallback(() => {
    cleanup();
    setCurrentPodcast(null);
  }, [cleanup]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const skipForward = useCallback((seconds = 15) => {
    if (audioRef.current) {
      seekTo(Math.min(audioRef.current.currentTime + seconds, duration));
    }
  }, [duration, seekTo]);

  const skipBackward = useCallback((seconds = 15) => {
    if (audioRef.current) {
      seekTo(Math.max(audioRef.current.currentTime - seconds, 0));
    }
  }, [seekTo]);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    setVolumeState(clampedVolume);
  }, []);

  const contextValue: AudioContextType = {
    currentPodcast,
    isPlaying,
    isLoading,
    error,
    duration,
    currentTime,
    volume,
    playPodcast,
    togglePlayPause,
    closePodcast,
    seekTo,
    skipForward,
    skipBackward,
    setVolume,
  };

  return <AudioContext.Provider value={contextValue}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio debe ser usado dentro de un AudioProvider");
  }
  return context;
}