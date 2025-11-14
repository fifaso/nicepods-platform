// contexts/audio-context.tsx
// VERSIÓN DEFINITIVA Y ROBUSTA: Se introduce audio.load() para un flujo de reproducción secuencial y seguro.

"use client";

import type React from "react";
import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { PodcastWithProfile } from "@/types/podcast";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(1);

  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const logCompletedPlayback = useCallback(() => {
    if (user && currentPodcast) {
      supabase
        .from('playback_events')
        .insert({ user_id: user.id, podcast_id: currentPodcast.id, event_type: 'completed_playback' })
        .then(({ error: insertError }) => {
          if (insertError) console.error("Error al registrar evento:", insertError);
        });
    }
  }, [user, currentPodcast, supabase]);

  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => { setIsPlaying(false); logCompletedPlayback(); };
    const handleLoadStart = () => { setIsLoading(true); setError(null); };
    const handleCanPlay = () => setIsLoading(false);
    const handlePlaying = () => { setIsLoading(false); setIsPlaying(true); };
    const handlePause = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      console.error("Audio Element Error:", e);
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
      if (audio) {
        audio.pause();
        audio.src = "";
        audio.load();
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("durationchange", handleDurationChange);
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("loadstart", handleLoadStart);
        audio.removeEventListener("canplay", handleCanPlay);
        audio.removeEventListener("playing", handlePlaying);
        audio.removeEventListener("pause", handlePause);
        audio.removeEventListener("error", handleError);
      }
    };
  }, [logCompletedPlayback]);

  const playPodcast = useCallback((podcast: PodcastWithProfile) => {
    if (!podcast.audio_url) {
      toast({ title: "Audio no disponible.", variant: "destructive" });
      return;
    }
    
    const audio = audioRef.current;
    if (!audio) return;

    if (currentPodcast?.id === podcast.id) {
      if (audio.paused) {
        audio.play().catch(e => console.error("Error al reanudar:", e));
      } else {
        audio.pause();
      }
      return;
    }
    
    // [SOLUCIÓN DEFINITIVA]: Se establece un flujo secuencial explícito para el navegador.
    setCurrentPodcast(podcast); // 1. Actualiza el estado de React.
    setError(null);
    audio.src = podcast.audio_url; // 2. Asigna la nueva fuente de audio.
    audio.load(); // 3. ¡CRÍTICO! Ordena al navegador que descarte el buffer antiguo y cargue la nueva fuente.
    
    const playPromise = audio.play(); // 4. Inicia la reproducción DESPUÉS de la carga.

    if (playPromise !== undefined) {
      playPromise.catch(e => {
        // El AbortError puede ocurrir legítimamente si el usuario hace clic muy rápido en otro podcast. Lo manejamos con gracia.
        if (e.name === 'AbortError') {
          console.log('La reproducción fue interrumpida por una nueva acción del usuario.');
        } else {
          console.error("Error al iniciar la reproducción:", e);
          setError("No se pudo reproducir el audio.");
          setCurrentPodcast(null);
          setIsPlaying(false);
        }
      });
    }

    supabase.rpc('increment_play_count', { podcast_id: podcast.id })
      .then(({ error: rpcError }) => {
        if (rpcError) console.error(`Error al incrementar play_count:`, rpcError);
      });
  }, [currentPodcast, supabase, toast]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentPodcast) return;
    if (isPlaying) audio.pause();
    else audio.play().catch(e => console.error("Error en togglePlayPause:", e));
  }, [isPlaying, currentPodcast]);

  const closePodcast = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setCurrentPodcast(null);
    setIsPlaying(false);
    setIsLoading(false);
    setError(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlayerExpanded(false);
  }, []);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  }, []);

  const skipForward = useCallback((seconds = 15) => {
    if (audioRef.current) seekTo(Math.min(audioRef.current.currentTime + seconds, duration));
  }, [duration, seekTo]);

  const skipBackward = useCallback((seconds = 15) => {
    if (audioRef.current) seekTo(Math.max(audioRef.current.currentTime - seconds, 0));
  }, [seekTo]);

  const setVolume = useCallback((newVolume: number) => {
    if (audioRef.current) audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(newVolume);
  }, []);

  const expandPlayer = useCallback(() => setIsPlayerExpanded(true), []);
  const collapsePlayer = useCallback(() => setIsPlayerExpanded(false), []);

  const logInteractionEvent = useCallback(async (podcastId: number, eventType: 'liked' | 'shared') => {
    if (!user) return;
    await supabase.from('playback_events').insert({ user_id: user.id, podcast_id: podcastId, event_type: eventType });
  }, [user, supabase]);

  const contextValue: AudioContextType = {
    currentPodcast, isPlaying, isLoading, error, duration, currentTime, volume, playPodcast,
    togglePlayPause, closePodcast, seekTo, skipForward, skipBackward, setVolume,
    isPlayerExpanded, expandPlayer, collapsePlayer, logInteractionEvent,
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