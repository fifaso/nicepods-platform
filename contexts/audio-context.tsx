// contexts/audio-context.tsx
// VERSIÓN: 21.0 (Production Queue Management & Auto-Advance)

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
  duration: number;
  currentTime: number;
  playPodcast: (podcast: PodcastWithProfile, playlist?: PodcastWithProfile[]) => void;
  togglePlayPause: () => void;
  closePodcast: () => void;
  seekTo: (time: number) => void;
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
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const closePodcast = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setCurrentPodcast(null);
    setQueue([]);
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const playNextInQueue = useCallback(() => {
    if (queue.length === 0) return closePodcast();
    const currentIndex = queue.findIndex(p => p.id === currentPodcast?.id);
    const nextPod = queue[currentIndex + 1];
    
    if (nextPod) {
      playPodcast(nextPod, queue);
      toast({ title: "Siguiente en la lista", description: nextPod.title });
    } else {
      closePodcast();
    }
  }, [queue, currentPodcast, closePodcast, toast]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audioRef.current = audio;

    const events = {
      timeupdate: () => setCurrentTime(audio.currentTime),
      durationchange: () => setDuration(audio.duration),
      loadstart: () => setIsLoading(true),
      canplay: () => setIsLoading(false),
      playing: () => setIsPlaying(true),
      pause: () => setIsPlaying(false),
      ended: () => {
        if (user && currentPodcast) {
           supabase.from('playback_events').insert({ 
             user_id: user.id, podcast_id: currentPodcast.id, event_type: 'completed_playback' 
           }).then();
        }
        playNextInQueue();
      },
      error: () => toast({ title: "Error de audio", variant: "destructive" })
    };

    Object.entries(events).forEach(([ev, fn]) => audio.addEventListener(ev, fn));
    return () => Object.entries(events).forEach(([ev, fn]) => audio.removeEventListener(ev, fn));
  }, [supabase, user, currentPodcast, playNextInQueue]);

  const playPodcast = (podcast: PodcastWithProfile, playlist: PodcastWithProfile[] = []) => {
    if (!podcast.audio_url || !audioRef.current) return;
    if (currentPodcast?.id === podcast.id) {
       isPlaying ? audioRef.current.pause() : audioRef.current.play();
       return;
    }
    if (playlist.length > 0) setQueue(playlist);
    setCurrentPodcast(podcast);
    audioRef.current.src = podcast.audio_url;
    audioRef.current.play().catch(() => {});
    supabase.rpc('increment_play_count', { podcast_id: podcast.id }).then();
  };

  const contextValue = {
    currentPodcast, queue, isPlaying, isLoading, duration, currentTime,
    playPodcast, togglePlayPause: () => isPlaying ? audioRef.current?.pause() : audioRef.current?.play(),
    closePodcast, seekTo: (t: number) => { if(audioRef.current) audioRef.current.currentTime = t; },
    isPlayerExpanded, expandPlayer: () => setIsPlayerExpanded(true), collapsePlayer: () => setIsPlayerExpanded(false),
    logInteractionEvent: (id: number, type: 'liked' | 'shared') => { if(user) supabase.from('playback_events').insert({ user_id: user.id, podcast_id: id, event_type: type }).then() }
  };

  return <AudioContext.Provider value={contextValue}>{children}</AudioContext.Provider>;
}

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) throw new Error("useAudio must be used within AudioProvider");
    return context;
};