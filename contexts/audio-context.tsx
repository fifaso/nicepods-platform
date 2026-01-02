// contexts/audio-context.tsx - VERSIÓN 20.0 (Queue & Collection Support)
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
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  duration: number;
  currentTime: number;
  volume: number;
  queue: PodcastWithProfile[]; // [NUEVO]
  playPodcast: (podcast: PodcastWithProfile, playlist?: PodcastWithProfile[]) => void; // [EXTENDIDO]
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
  const [queue, setQueue] = useState<PodcastWithProfile[]>([]); // [NUEVO]
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
      audioRef.current.removeAttribute('src');
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

  // [LÓGICA DISRUPTIVA]: Manejo automático del siguiente en la cola
  const playNextInQueue = useCallback(() => {
    if (queue.length > 0) {
      const currentIndex = queue.findIndex(p => p.id === currentPodcast?.id);
      const nextPodcast = queue[currentIndex + 1];
      if (nextPodcast) {
        playPodcast(nextPodcast, queue);
        return;
      }
    }
    closePodcast();
  }, [queue, currentPodcast, closePodcast]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none'; 
    audioRef.current = audio;

    const handleEnded = () => {
      // Registrar evento de fin antes de pasar al siguiente
      if (userRef.current && currentPodcast) {
        supabase.from('playback_events').insert({
          user_id: userRef.current.id,
          podcast_id: currentPodcast.id,
          event_type: 'completed_playback',
        }).then();
      }
      playNextInQueue(); // En lugar de cerrar, intenta el siguiente
    };

    audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
    audio.addEventListener("durationchange", () => setDuration(audio.duration));
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadstart", () => { setIsLoading(true); setError(null); });
    audio.addEventListener("canplay", () => setIsLoading(false));
    audio.addEventListener("playing", () => { setIsLoading(false); setIsPlaying(true); });
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("error", () => { setError("Error al cargar audio."); setIsLoading(false); });

    return () => {
      audio.pause();
      audio.removeEventListener("ended", handleEnded);
    };
  }, [supabase, playNextInQueue, currentPodcast]);

  const playPodcast = useCallback((podcast: PodcastWithProfile, playlist: PodcastWithProfile[] = []) => {
    if (!podcast.audio_url) {
      toast({ title: "Audio no disponible", variant: "destructive" });
      return;
    }
    
    const audio = audioRef.current;
    if (audio) {
      if (currentPodcast?.id === podcast.id) {
        if (isPlaying) audio.pause(); else audio.play();
        return;
      }
      
      setCurrentPodcast(podcast);
      if (playlist.length > 0) setQueue(playlist); // Carga la colección en la cola

      audio.preload = 'none';
      audio.src = podcast.audio_url;
      audio.volume = volume;
      audio.load();
      audio.play().catch(() => setError("Error de reproducción."));

      supabase.rpc('increment_play_count', { podcast_id: podcast.id }).then();
    }
  }, [currentPodcast, isPlaying, volume, supabase, toast]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !currentPodcast) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play().catch();
  }, [isPlaying, currentPodcast]);

  const contextValue: AudioContextType = {
    currentPodcast, isPlaying, isLoading, error, duration, currentTime, volume, queue,
    playPodcast, togglePlayPause, closePodcast, seekTo: (t) => { if(audioRef.current) audioRef.current.currentTime = t }, 
    skipForward: (s=15) => { if(audioRef.current) audioRef.current.currentTime += s },
    skipBackward: (s=15) => { if(audioRef.current) audioRef.current.currentTime -= s },
    setVolume: (v) => { if(audioRef.current) audioRef.current.volume = v; setVolumeState(v); },
    isPlayerExpanded, expandPlayer: () => setIsPlayerExpanded(true), collapsePlayer: () => setIsPlayerExpanded(false),
    logInteractionEvent: async (id, type) => { if(user) await supabase.from('playback_events').insert({ user_id: user.id, podcast_id: id, event_type: type }) }
  };

  return <AudioContext.Provider value={contextValue}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio debe ser usado dentro de un AudioProvider");
  return context;
}