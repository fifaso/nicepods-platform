// contexts/audio-context.tsx
// VERSIÓN: 22.0 (Enterprise Journey Engine: Queue, Auto-Advance & Analytics)

"use client";

import type React from "react";
import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { PodcastWithProfile } from "@/types/podcast";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "@/hooks/use-auth";

export interface AudioContextType {
  currentPodcast: PodcastWithProfile | null;
  queue: PodcastWithProfile[]; // Cola de reproducción actual
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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userRef = useRef<User | null>(user);
  useEffect(() => { userRef.current = user; }, [user]);

  const closePodcast = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
    }
    setCurrentPodcast(null);
    setQueue([]);
    setIsPlaying(false);
    setIsLoading(false);
    setError(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlayerExpanded(false);
  }, []);

  // Lógica de avance automático (Next in Queue)
  const playNext = useCallback(() => {
    if (queue.length === 0) return closePodcast();
    
    const currentIndex = queue.findIndex(p => p.id === currentPodcast?.id);
    const nextPodcast = queue[currentIndex + 1];

    if (nextPodcast) {
      playPodcast(nextPodcast, queue);
      toast({ title: "Continuando viaje", description: nextPodcast.title });
    } else {
      closePodcast(); // Fin de la lista
    }
  }, [queue, currentPodcast, closePodcast]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none'; 
    audioRef.current = audio;

    const handleEnded = () => {
      if (userRef.current && currentPodcast) {
        supabase.from('playback_events').insert({
          user_id: userRef.current.id,
          podcast_id: currentPodcast.id,
          event_type: 'completed_playback',
        }).then();
      }
      playNext();
    };

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handlePlaying = () => { setIsLoading(false); setIsPlaying(true); };
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleError = (e: any) => {
      console.error("Audio error:", e);
      setError("Error al cargar el audio.");
      setIsLoading(false);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("error", handleError);

    return () => {
      audio.pause();
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [supabase, playNext, currentPodcast]);

  const playPodcast = useCallback((podcast: PodcastWithProfile, playlist: PodcastWithProfile[] = []) => {
    if (!podcast.audio_url) {
      toast({ title: "Audio no disponible", variant: "destructive" });
      return;
    }
    
    const audio = audioRef.current;
    if (!audio) return;

    if (currentPodcast?.id === podcast.id) {
      isPlaying ? audio.pause() : audio.play().catch(() => {});
      return;
    }
    
    setCurrentPodcast(podcast);
    if (playlist.length > 0) setQueue(playlist);

    audio.src = podcast.audio_url;
    audio.volume = volume;
    audio.load();
    audio.play().catch(() => setError("No se pudo iniciar la reproducción."));

    // Guardar duración si no existe
    if (!podcast.duration_seconds) {
      const saveMeta = () => {
        if (audio.duration > 0) {
          supabase.from('micro_pods').update({ duration_seconds: Math.round(audio.duration) }).eq('id', podcast.id).then();
        }
        audio.removeEventListener('loadedmetadata', saveMeta);
      };
      audio.addEventListener('loadedmetadata', saveMeta);
    }

    supabase.rpc('increment_play_count', { podcast_id: podcast.id }).then();
  }, [currentPodcast, isPlaying, volume, supabase, toast]);

  const contextValue: AudioContextType = {
    currentPodcast, queue, isPlaying, isLoading, error, duration, currentTime, volume,
    playPodcast, 
    togglePlayPause: () => isPlaying ? audioRef.current?.pause() : audioRef.current?.play(),
    closePodcast,
    seekTo: (t) => { if(audioRef.current) audioRef.current.currentTime = t },
    skipForward: (s=15) => { if(audioRef.current) audioRef.current.currentTime += s },
    skipBackward: (s=15) => { if(audioRef.current) audioRef.current.currentTime -= s },
    setVolume: (v) => { if(audioRef.current) audioRef.current.volume = v; setVolumeState(v); },
    isPlayerExpanded,
    expandPlayer: () => setIsPlayerExpanded(true),
    collapsePlayer: () => setIsPlayerExpanded(false),
    logInteractionEvent: async (id, type) => { if(user) await supabase.from('playback_events').insert({ user_id: user.id, podcast_id: id, event_type: type }) }
  };

  return <AudioContext.Provider value={contextValue}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio debe ser usado dentro de un AudioProvider");
  return context;
}