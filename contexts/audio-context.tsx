// contexts/audio-context.tsx
// VERSIÓN FINAL Y MEJORADA: Ahora cierra el reproductor al finalizar y registra el evento de reproducción completada.

"use client";

import type React from "react";
import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { PodcastWithProfile } from "@/types/podcast";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient, User } from "@supabase/supabase-js";
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

  const userRef = useRef<User | null>(user);
  const currentPodcastRef = useRef<PodcastWithProfile | null>(currentPodcast);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { currentPodcastRef.current = currentPodcast; }, [currentPodcast]);

  const closePodcast = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
    setCurrentPodcast(null);
    setIsPlaying(false);
    setIsLoading(false);
    setError(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlayerExpanded(false);
  }, []);

  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      // La lógica para registrar el evento ya estaba aquí y era correcta.
      if (userRef.current && currentPodcastRef.current) {
        supabase
          .from('playback_events')
          .insert({
            user_id: userRef.current.id,
            podcast_id: currentPodcastRef.current.id,
            event_type: 'completed_playback',
          })
          .then(({ error: insertError }) => {
            if (insertError) console.error("Error al registrar evento:", insertError);
          });
      }
      
      // [CAMBIO QUIRÚRGICO #1]: Añadimos la llamada para limpiar la UI.
      // Esto implementa tu requisito de que el reproductor se esconda al finalizar.
      closePodcast();
    };
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
      if (audio) {
        audio.pause();
        audio.removeAttribute('src');
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
  // [CAMBIO QUIRÚRGICO #2]: Añadimos 'closePodcast' a las dependencias.
  // Es una función estable (gracias a useCallback), por lo que es seguro y no causará re-renderizados.
  }, [supabase, closePodcast]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !currentPodcast) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else if (audioRef.current.src) {
      audioRef.current.play().catch(e => {
        if (e.name !== 'AbortError') {
          console.error("Error al reanudar la reproducción:", e);
          setError("No se pudo reanudar el audio.");
        }
      });
    }
  }, [isPlaying, currentPodcast]);

  const playPodcast = useCallback((podcast: PodcastWithProfile) => {
    if (!podcast.audio_url) {
      toast({ title: "Audio no disponible", variant: "destructive" });
      return;
    }
    
    const audio = audioRef.current;
    if (audio) {
      if (currentPodcast?.id === podcast.id) {
        togglePlayPause();
        return;
      }
      
      setCurrentPodcast(podcast);
      audio.src = podcast.audio_url;
      audio.volume = volume;
      audio.load();
      audio.play().catch(e => {
        if (e.name !== 'AbortError') {
          console.error("Error al iniciar la reproducción:", e);
          setError("No se pudo reproducir el audio.");
        }
      });

      if (podcast.duration_seconds === 0 && supabase) {
        const handleMetadata = async () => {
          const newDuration = Math.round(audio.duration);
          if (newDuration > 0) {
            const { error: updateError } = await supabase.from('micro_pods').update({ duration_seconds: newDuration }).eq('id', podcast.id);
            if (updateError) console.error("Error al guardar la duración:", updateError);
          }
          audio.removeEventListener('loadedmetadata', handleMetadata);
        };
        audio.addEventListener('loadedmetadata', handleMetadata);
      }

      supabase.rpc('increment_play_count', { podcast_id: podcast.id }).then(({ error: rpcError }) => {
        if (rpcError) console.error(`Error al incrementar play_count:`, rpcError);
      });
    }
  }, [currentPodcast, togglePlayPause, volume, supabase, toast]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
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

  const expandPlayer = useCallback(() => setIsPlayerExpanded(true), []);
  const collapsePlayer = useCallback(() => setIsPlayerExpanded(false), []);
  
  const logInteractionEvent = useCallback(async (podcastId: number, eventType: 'liked' | 'shared') => {
    if (!user) {
        return;
    }
    await supabase.from('playback_events').insert({
        user_id: user.id,
        podcast_id: podcastId,
        event_type: eventType,
    });
  }, [user, supabase]);

  const contextValue: AudioContextType = {
    currentPodcast, isPlaying, isLoading, error, duration, currentTime, volume,
    playPodcast, togglePlayPause, closePodcast, seekTo, skipForward, skipBackward,
    setVolume, isPlayerExpanded, expandPlayer, collapsePlayer, logInteractionEvent,
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