// contexts/audio-context.tsx
"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { PodcastWithProfile } from "@/types/podcast";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";

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
  isPlayerExpanded: boolean;
  expandPlayer: () => void;
  collapsePlayer: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const supabase = useRef(createClient()).current;

  const [currentPodcast, setCurrentPodcast] = useState<PodcastWithProfile | null>(null);
  const [queue, setQueue] = useState<PodcastWithProfile[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current && typeof window !== 'undefined') {
      const audio = new Audio();
      audio.preload = 'metadata';
      audioRef.current = audio;

      // EVENTO DE ALTA FRECUENCIA: Se emite al Window, no al Estado de React
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
      audio.addEventListener("ended", () => handleNext());
    }
  }, []);

  const handleNext = useCallback(() => {
    if (queue.length > 0 && currentPodcast) {
      const idx = queue.findIndex(p => p.id === currentPodcast.id);
      if (idx !== -1 && idx < queue.length - 1) {
        playPodcast(queue[idx + 1]);
        return;
      }
    }
    setIsPlaying(false);
  }, [queue, currentPodcast]);

  const playPodcast = useCallback((podcast: PodcastWithProfile, playlist: PodcastWithProfile[] = []) => {
    const audio = audioRef.current;
    if (!audio || !podcast.audio_url) return;

    if (playlist.length > 0) setQueue(playlist);

    if (currentPodcast?.id === podcast.id) {
      audio.paused ? audio.play() : audio.pause();
    } else {
      setCurrentPodcast(podcast);
      audio.src = podcast.audio_url;
      audio.play().catch(console.error);

      // Analytics & Logs
      supabase.rpc('increment_play_count', { podcast_id: podcast.id }).then();
      if (user) {
        supabase.from('playback_events').insert({
          user_id: user.id,
          podcast_id: podcast.id,
          event_type: 'completed_playback'
        }).then();
      }
    }
  }, [currentPodcast, user, supabase]);

  const contextValue = {
    currentPodcast, queue, isPlaying, isLoading, audioRef,
    playPodcast,
    togglePlayPause: () => audioRef.current?.paused ? audioRef.current.play() : audioRef.current?.pause(),
    closePodcast: () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; } setCurrentPodcast(null); setQueue([]); },
    seekTo: (t: number) => { if (audioRef.current) audioRef.current.currentTime = t; },
    skipForward: (s = 15) => { if (audioRef.current) audioRef.current.currentTime += s; },
    skipBackward: (s = 15) => { if (audioRef.current) audioRef.current.currentTime -= s; },
    isPlayerExpanded,
    expandPlayer: () => setIsPlayerExpanded(true),
    collapsePlayer: () => setIsPlayerExpanded(false),
  };

  return <AudioContext.Provider value={contextValue}>{children}</AudioContext.Provider>;
}

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used within AudioProvider");
  return context;
};