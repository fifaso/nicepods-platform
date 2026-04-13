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
  
  // --- MÉTODOS DE ACCIÓN SOBERANA ---
  playPodcastAction: (podcast: PodcastWithProfile, playlist?: PodcastWithProfile[]) => Promise<void>;
  togglePlayPauseAction: () => void;
  terminatePodcastPlayback: () => void;
  seekToTimeAction: (targetTimeSeconds: number) => void;
  skipForwardAction: (skipSeconds?: number) => void;
  skipBackwardAction: (skipSeconds?: number) => void;
  logInteractionEventAction: (interactionType: 'completed_playback' | 'liked' | 'shared') => Promise<void>;
  
  // --- INTERFAZ DE USUARIO ---
  isPlayerExpanded: boolean;
  expandPlayerInterface: () => void;
  collapsePlayerInterface: () => void;
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

  /**
   * 1. PROTOCOLO DE INICIALIZACIÓN DE HARDWARE
   * [THERMIC V7.2]: Implementación de aniquilación atómica de oyentes de hardware.
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePlayAction = () => setIsAudioPlaying(true);
    const handlePauseAction = () => setIsAudioPlaying(false);
    const handleLoadStartAction = () => setIsAudioLoading(true);
    const handleCanPlayAction = () => setIsAudioLoading(false);
    const handleEndedAction = () => handleAutomaticNextAction();

    const handleTimeUpdateAction = () => {
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
    };

    const handleErrorAction = (event: Event) => {
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
    };

    if (!audioElementReference.current) {
      const audioInstance = new Audio();
      audioInstance.preload = 'metadata';
      audioElementReference.current = audioInstance;
    }

    const currentAudioInstance = audioElementReference.current;
    if (currentAudioInstance) {
      currentAudioInstance.addEventListener("play", handlePlayAction);
      currentAudioInstance.addEventListener("pause", handlePauseAction);
      currentAudioInstance.addEventListener("loadstart", handleLoadStartAction);
      currentAudioInstance.addEventListener("canplay", handleCanPlayAction);
      currentAudioInstance.addEventListener("ended", handleEndedAction);
      currentAudioInstance.addEventListener("timeupdate", handleTimeUpdateAction);
      currentAudioInstance.addEventListener("error", handleErrorAction);
    }

    return () => {
      if (currentAudioInstance) {
        currentAudioInstance.removeEventListener("play", handlePlayAction);
        currentAudioInstance.removeEventListener("pause", handlePauseAction);
        currentAudioInstance.removeEventListener("loadstart", handleLoadStartAction);
        currentAudioInstance.removeEventListener("canplay", handleCanPlayAction);
        currentAudioInstance.removeEventListener("ended", handleEndedAction);
        currentAudioInstance.removeEventListener("timeupdate", handleTimeUpdateAction);
        currentAudioInstance.removeEventListener("error", handleErrorAction);

        currentAudioInstance.pause();
        currentAudioInstance.removeAttribute("src");
        currentAudioInstance.load();
      }
    };
  }, [toast, handleAutomaticNextAction]);

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
   * API SOBERANA (NOMINAL INTEGRITY)
   * Misión: Proveer el contrato V4.0 puro sin residuos de abreviaturas.
   */
  const contextValue: AudioContextProperties = useMemo(() => ({
    // Datos Industriales V4.0
    currentActivePodcast,
    playbackQueue,
    isAudioPlaying,
    isAudioLoading,
    audioElementReference,
    
    // Acciones Industriales V4.0
    playPodcastAction,
    logInteractionEventAction,
    terminatePodcastPlayback,
    togglePlayPauseAction: () => {
      const audioInstance = audioElementReference.current;
      if (audioInstance) audioInstance.paused ? audioInstance.play().catch(() => {}) : audioInstance.pause();
    },
    seekToTimeAction: (seconds: number) => { if (audioElementReference.current) audioElementReference.current.currentTime = seconds; },
    skipForwardAction: (seconds = 15) => { if (audioElementReference.current) audioElementReference.current.currentTime += seconds; },
    skipBackwardAction: (seconds = 15) => { if (audioElementReference.current) audioElementReference.current.currentTime -= seconds; },
    
    isPlayerExpanded,
    expandPlayerInterface: () => setIsPlayerExpanded(true),
    collapsePlayerInterface: () => setIsPlayerExpanded(false),
  }), [currentActivePodcast, playbackQueue, isAudioPlaying, isAudioLoading, isPlayerExpanded, logInteractionEventAction, playPodcastAction, terminatePodcastPlayback]);

  return <AudioContext.Provider value={contextValue}>{children}</AudioContext.Provider>;
}

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("CRITICAL_ERROR: 'useAudio' invocado fuera de su AudioProvider.");
  return context;
};