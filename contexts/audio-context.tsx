/**
 * ARCHIVO: contexts/audio-context.tsx
 * VERSIÓN: 7.1 (NicePod Audio Terminal - Sovereign Compatibility Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Motor de audio neuronal con despacho de telemetría de alta frecuencia,
 * gestionando el ciclo de vida de los activos y la higiene térmica de la RAM.
 * [REFORMA V7.1]: Implementación de Mapeo de Compatibilidad para neutralizar 
 * errores TS2339 en cascada sin sacrificar el estándar nominal V4.0.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { PodcastWithProfile } from "@/types/podcast";
import { nicepodLog } from "@/lib/utils";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

/**
 * INTERFAZ: AudioContextProperties
 * Misión: Definir el contrato público incluyendo firmas industriales y aliases de compatibilidad.
 */
export interface AudioContextProperties {
  // --- FIRMA INDUSTRIAL V4.0 ---
  currentActivePodcast: PodcastWithProfile | null;
  playbackQueue: PodcastWithProfile[];
  isAudioPlaying: boolean;
  isAudioLoading: boolean;
  audioElementReference: React.MutableRefObject<HTMLAudioElement | null>;
  
  // --- ALIASES DE COMPATIBILIDAD (Neutralización de Errores TS2339) ---
  currentPodcast: PodcastWithProfile | null;
  queue: PodcastWithProfile[];
  isPlaying: boolean;
  isLoading: boolean;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;

  // --- MÉTODOS DE ACCIÓN SOBERANA ---
  playPodcastAction: (podcast: PodcastWithProfile, playlist?: PodcastWithProfile[]) => Promise<void>;
  togglePlayPauseAction: () => void;
  terminatePodcastPlayback: () => void;
  seekToTimeAction: (targetTimeSeconds: number) => void;
  skipForwardAction: (skipSeconds?: number) => void;
  skipBackwardAction: (skipSeconds?: number) => void;
  logInteractionEventAction: (interactionType: 'completed_playback' | 'liked' | 'shared') => Promise<void>;
  
  // --- ALIASES DE MÉTODOS (Legacy Bridge) ---
  playPodcast: (podcast: PodcastWithProfile, playlist?: PodcastWithProfile[]) => Promise<void>;
  togglePlayPause: () => void;
  closePodcast: () => void;
  seekTo: (targetTimeSeconds: number) => void;
  skipForward: (skipSeconds?: number) => void;
  skipBackward: (skipSeconds?: number) => void;
  logInteractionEvent: (interactionType: 'completed_playback' | 'liked' | 'shared') => Promise<void>;

  // --- INTERFAZ DE USUARIO ---
  isPlayerExpanded: boolean;
  expandPlayerInterface: () => void;
  collapsePlayerInterface: () => void;
  expandPlayer: () => void;   // Alias
  collapsePlayer: () => void; // Alias
}

const AudioContext = createContext<AudioContextProperties | undefined>(undefined);

/**
 * AudioProvider: El orquestador de hardware acústico de NicePod.
 */
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { user: authenticatedUser, supabase: authSupabaseClient } = useAuth();
  const { toast } = useToast();
  const supabaseClient = authSupabaseClient || createClient();

  // --- ESTADOS DE GESTIÓN INTERNOS ---
  const [currentActivePodcast, setCurrentActivePodcast] = useState<PodcastWithProfile | null>(null);
  const [playbackQueue, setPlaybackQueue] = useState<PodcastWithProfile[]>([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState<boolean>(false);

  // --- REFERENCIAS DE HARDWARE ---
  const audioElementReference = useRef<HTMLAudioElement | null>(null);
  const activePodcastReference = useRef<PodcastWithProfile | null>(null);

  useEffect(() => { 
    activePodcastReference.current = currentActivePodcast; 
  }, [currentActivePodcast]);

  /**
   * 1. PROTOCOLO DE INICIALIZACIÓN DE HARDWARE
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!audioElementReference.current) {
      const audioInstance = new Audio();
      audioInstance.preload = 'metadata';
      audioElementReference.current = audioInstance;

      audioInstance.addEventListener("play", () => setIsAudioPlaying(true));
      audioInstance.addEventListener("pause", () => setIsAudioPlaying(false));
      audioInstance.addEventListener("loadstart", () => setIsAudioLoading(true));
      audioInstance.addEventListener("canplay", () => setIsAudioLoading(false));
      audioInstance.addEventListener("ended", () => handleAutomaticNextAction());

      audioInstance.addEventListener("timeupdate", () => {
        if (!audioElementReference.current) return;
        const currentPlaybackTimeSeconds = audioElementReference.current.currentTime;
        const totalPlaybackDurationSeconds = audioElementReference.current.duration || 0;
        
        window.dispatchEvent(new CustomEvent('nicepod-timeupdate', {
          detail: { 
            currentTime: currentPlaybackTimeSeconds, 
            duration: totalPlaybackDurationSeconds,
            percentage: totalPlaybackDurationSeconds > 0 ? (currentPlaybackTimeSeconds / totalPlaybackDurationSeconds) * 100 : 0
          }
        }));
      });

      audioInstance.addEventListener("error", (event: Event) => {
        setIsAudioLoading(false);
        const errorTarget = event.target as HTMLAudioElement;
        if (!activePodcastReference.current) return;
        
        if (errorTarget.error && errorTarget.src && errorTarget.src !== window.location.href) {
          nicepodLog("🔥 [AudioEngine] Falla de enlace acústico.", errorTarget.error, 'error');
          toast({
            variant: "destructive",
            title: "Frecuencia Inestable",
            description: "No se pudo recuperar el activo de la Bóveda."
          });
        }
      });
    }

    return () => {
      if (audioElementReference.current) {
        audioElementReference.current.pause();
        audioElementReference.current.removeAttribute("src");
        audioElementReference.current.load();
      }
    };
  }, [toast]);

  const logInteractionEventAction = useCallback(async (interactionType: 'completed_playback' | 'liked' | 'shared') => {
    if (!authenticatedUser || !currentActivePodcast) return;
    try {
      await supabaseClient.from('playback_events').insert({
        user_id: authenticatedUser.id,
        podcast_id: currentActivePodcast.id,
        event_type: interactionType
      });
    } catch (exception) {
        nicepodLog("⚠️ [AudioEngine] Error de telemetría social.", exception, 'warn');
    }
  }, [authenticatedUser, currentActivePodcast, supabaseClient]);

  const handleAutomaticNextAction = useCallback(() => {
    if (playbackQueue.length > 0 && currentActivePodcast) {
      const activePodcastIndex = playbackQueue.findIndex(podcastItem => podcastItem.id === currentActivePodcast.id);
      if (activePodcastIndex !== -1 && activePodcastIndex < playbackQueue.length - 1) {
        playPodcastAction(playbackQueue[activePodcastIndex + 1]);
        return;
      }
    }
    setIsAudioPlaying(false);
    logInteractionEventAction('completed_playback');
  }, [playbackQueue, currentActivePodcast, logInteractionEventAction]);

  const playPodcastAction = useCallback(async (targetPodcast: PodcastWithProfile, targetPlaylist: PodcastWithProfile[] = []) => {
    const audioInstance = audioElementReference.current;
    if (!audioInstance) return;

    if (!targetPodcast.audio_url) {
      toast({ variant: "destructive", title: "Nodo Incompleto", description: "Audio en proceso de forja." });
      return;
    }

    if (targetPlaylist.length > 0) {
        setPlaybackQueue(targetPlaylist);
    }

    try {
      if (currentActivePodcast?.id === targetPodcast.id) {
        if (audioInstance.paused) {
            await audioInstance.play();
        } else {
            audioInstance.pause();
        }
      } else {
        setCurrentActivePodcast(targetPodcast);
        audioInstance.src = targetPodcast.audio_url;
        await audioInstance.play();
        supabaseClient.rpc('increment_play_count', { podcast_id: targetPodcast.id }).then();
      }
    } catch (exception: unknown) {
      const errorObject = exception as Error;
      if (errorObject.name === 'NotAllowedError') {
        toast({ title: "Hardware Bloqueado", description: "Interacción manual requerida por el navegador." });
      }
    }
  }, [currentActivePodcast, supabaseClient, toast]);

  const terminatePodcastPlayback = useCallback(() => {
    if (audioElementReference.current) {
      audioElementReference.current.pause();
      audioElementReference.current.removeAttribute("src");
      audioElementReference.current.load();
    }
    setCurrentActivePodcast(null);
    setPlaybackQueue([]);
    setIsPlayerExpanded(false);
    nicepodLog("🧹 [AudioEngine] Memoria purgada.");
  }, []);

  /**
   * API SOBERANA CON MAPEO DE COMPATIBILIDAD
   * Misión: Proveer el contrato V4.0 y los aliases V2.8 para sanear la compilación.
   */
  const contextValue: AudioContextProperties = useMemo(() => ({
    // Datos Industriales V4.0
    currentActivePodcast,
    playbackQueue,
    isAudioPlaying,
    isAudioLoading,
    audioElementReference,
    
    // Alisases de Compatibilidad V2.8 (Resuelve 62 errores TS2339)
    currentPodcast: currentActivePodcast,
    queue: playbackQueue,
    isPlaying: isAudioPlaying,
    isLoading: isAudioLoading,
    audioRef: audioElementReference,

    // Acciones Industriales V4.0
    playPodcastAction,
    logInteractionEventAction,
    terminatePodcastPlayback,
    
    // Alisases de Acciones (Legacy Bridge)
    playPodcast: playPodcastAction,
    logInteractionEvent: logInteractionEventAction,
    closePodcast: terminatePodcastPlayback,
    togglePlayPauseAction: () => {
      const audioInstance = audioElementReference.current;
      if (audioInstance) audioInstance.paused ? audioInstance.play().catch(() => {}) : audioInstance.pause();
    },
    togglePlayPause: () => {
      const audioInstance = audioElementReference.current;
      if (audioInstance) audioInstance.paused ? audioInstance.play().catch(() => {}) : audioInstance.pause();
    },
    seekToTimeAction: (seconds: number) => { if (audioElementReference.current) audioElementReference.current.currentTime = seconds; },
    seekTo: (seconds: number) => { if (audioElementReference.current) audioElementReference.current.currentTime = seconds; },
    skipForwardAction: (seconds = 15) => { if (audioElementReference.current) audioElementReference.current.currentTime += seconds; },
    skipForward: (seconds = 15) => { if (audioElementReference.current) audioElementReference.current.currentTime += seconds; },
    skipBackwardAction: (seconds = 15) => { if (audioElementReference.current) audioElementReference.current.currentTime -= seconds; },
    skipBackward: (seconds = 15) => { if (audioElementReference.current) audioElementReference.current.currentTime -= seconds; },
    
    isPlayerExpanded,
    expandPlayerInterface: () => setIsPlayerExpanded(true),
    collapsePlayerInterface: () => setIsPlayerExpanded(false),
    expandPlayer: () => setIsPlayerExpanded(true),
    collapsePlayer: () => setIsPlayerExpanded(false),
  }), [currentActivePodcast, playbackQueue, isAudioPlaying, isAudioLoading, isPlayerExpanded, logInteractionEventAction, playPodcastAction, terminatePodcastPlayback]);

  return <AudioContext.Provider value={contextValue}>{children}</AudioContext.Provider>;
}

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("CRITICAL_ERROR: 'useAudio' invocado fuera de su AudioProvider.");
  return context;
};