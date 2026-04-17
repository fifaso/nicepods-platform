/**
 * ARCHIVO: contexts/audio-context.tsx
 * VERSIÓN: 11.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 *
 * MISIÓN: Motor de audio neuronal con despacho de telemetría de alta frecuencia.
 * [REFORMA V11.0]: Sincronización axial completa con el contrato purificado V7.0.
 * Eliminación de fugas snake_case y alineación absoluta con la Doctrina ZAP.
 *
 * NIVEL DE INTEGRIDAD: 100% (Soberanía Nominal V7.0)
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
 * Misión: Definir el contrato público incluyendo firmas industriales.
 */
export interface AudioContextProperties {
  // --- FIRMA INDUSTRIAL V7.0 ---
  currentActivePodcast: PodcastWithProfile | null;
  playbackQueue: PodcastWithProfile[];
  isAudioPlayingStatus: boolean;
  isAudioLoadingStatus: boolean;
  audioElementReference: React.MutableRefObject<HTMLAudioElement | null>;

  /** @deprecated Use isAudioPlayingStatus instead. */
  isAudioPlaying: boolean;
  /** @deprecated Use isAudioLoadingStatus instead. */
  isAudioLoading: boolean;
  
  // --- MÉTODOS DE ACCIÓN SOBERANA ---
  playPodcastAction: (podcast: PodcastWithProfile, playlist?: PodcastWithProfile[]) => Promise<void>;
  togglePlayPauseAction: () => void;
  terminatePodcastPlayback: () => void;
  seekToTimeAction: (targetTimeSeconds: number) => void;
  skipForwardAction: (skipSeconds?: number) => void;
  skipBackwardAction: (skipSeconds?: number) => void;
  logInteractionEventAction: (interactionType: 'completed_playback' | 'liked' | 'shared') => Promise<void>;
  
  // --- INTERFAZ DE USUARIO ---
  isPlayerInterfaceExpandedStatus: boolean;
  /** @deprecated Use isPlayerInterfaceExpandedStatus instead. */
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
  const [isAudioPlayingStatus, setIsAudioPlayingStatus] = useState<boolean>(false);
  const [isAudioLoadingStatus, setIsAudioLoadingStatus] = useState<boolean>(false);
  const [isPlayerInterfaceExpandedStatus, setIsPlayerInterfaceExpandedStatus] = useState<boolean>(false);

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
        podcast_id: currentActivePodcast.identification,
        event_type: interactionType
      });
    } catch (exception: unknown) {
        nicepodLog("⚠️ [AudioEngine] Error de telemetría social.", exception, 'warn');
    }
  }, [authenticatedUser, currentActivePodcast, supabaseClient]);

  const handleAutomaticNextAction = useCallback(() => {
    if (playbackQueue.length > 0 && currentActivePodcast) {
      const activePodcastIndex = playbackQueue.findIndex(podcastItem => podcastItem.identification === currentActivePodcast.identification);
      if (activePodcastIndex !== -1 && activePodcastIndex < playbackQueue.length - 1) {
        playPodcastAction(playbackQueue[activePodcastIndex + 1]);
        return;
      }
    }
    setIsAudioPlayingStatus(false);
    logInteractionEventAction('completed_playback');
  }, [playbackQueue, currentActivePodcast, logInteractionEventAction]);

  /**
   * 1. PROTOCOLO DE INICIALIZACIÓN DE HARDWARE
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePlayAction = () => setIsAudioPlayingStatus(true);
    const handlePauseAction = () => setIsAudioPlayingStatus(false);
    const handleLoadStartAction = () => setIsAudioLoadingStatus(true);
    const handleCanPlayAction = () => setIsAudioLoadingStatus(false);
    const handleEndedAction = () => handleAutomaticNextAction();

    const handleTimeUpdateAction = () => {
      const audioElementInstance = audioElementReference.current;
      if (document.hidden || !audioElementInstance) return;
      const currentPlaybackTimeSeconds = audioElementInstance.currentTime;
      const totalPlaybackDurationSeconds = audioElementInstance.duration || 0;

      window.dispatchEvent(new CustomEvent('nicepod-timeupdate', {
        detail: {
          currentTime: currentPlaybackTimeSeconds,
          duration: totalPlaybackDurationSeconds,
          percentage: totalPlaybackDurationSeconds > 0 ? (currentPlaybackTimeSeconds / totalPlaybackDurationSeconds) * 100 : 0
        }
      }));
    };

    const handleErrorAction = (event: Event) => {
      setIsAudioLoadingStatus(false);
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

    if (!targetPodcast.audioUniformResourceLocator) {
      toast({ variant: "destructive", title: "Nodo Incompleto", description: "Audio en proceso de forja." });
      return;
    }

    if (targetPlaylist.length > 0) {
        setPlaybackQueue(targetPlaylist);
    }

    try {
      if (currentActivePodcast?.identification === targetPodcast.identification) {
        if (audioInstance.paused) {
            await audioInstance.play();
        } else {
            audioInstance.pause();
        }
      } else {
        audioInstance.pause();
        audioInstance.removeAttribute('src');
        audioInstance.load();

        setCurrentActivePodcast(targetPodcast);
        audioInstance.src = targetPodcast.audioUniformResourceLocator;
        await audioInstance.play();
        supabaseClient.rpc('increment_play_count', { podcast_id: targetPodcast.identification }).then();
      }
    } catch (exception: unknown) {
      const errorObject = exception as Error;
      if (errorObject.name === 'NotAllowedError') {
        toast({ title: "Hardware Bloqueado", description: "Interacción manual requerida por el navegador." });
      }
    }
  }, [currentActivePodcast, supabaseClient, toast]);

  const terminatePodcastPlayback = useCallback(() => {
    const audioElementInstance = audioElementReference.current;
    if (audioElementInstance) {
      audioElementInstance.pause();
      audioElementInstance.removeAttribute("src");
      audioElementInstance.load();
    }
    setCurrentActivePodcast(null);
    setPlaybackQueue([]);
    setIsPlayerInterfaceExpandedStatus(false);
    nicepodLog("🧹 [AudioEngine] Memoria purgada.");
  }, []);

  const togglePlayPauseAction = useCallback(() => {
    const audioElementInstance = audioElementReference.current;
    if (audioElementInstance) {
      if (audioElementInstance.paused) {
        audioElementInstance.play().catch((hardwareException: unknown) => {
          nicepodLog("⚠️ [AudioEngine] Error en reproducción manual.", hardwareException, 'warn');
        });
      } else {
        audioElementInstance.pause();
      }
    }
  }, []);

  const contextValue: AudioContextProperties = useMemo(() => ({
    currentActivePodcast,
    playbackQueue,
    isAudioPlayingStatus,
    isAudioLoadingStatus,
    audioElementReference,

    isAudioPlaying: isAudioPlayingStatus,
    isAudioLoading: isAudioLoadingStatus,
    isPlayerExpanded: isPlayerInterfaceExpandedStatus,
    
    playPodcastAction,
    logInteractionEventAction,
    terminatePodcastPlayback,
    togglePlayPauseAction,
    seekToTimeAction: (targetTimeSeconds: number) => {
      const audioElementInstance = audioElementReference.current;
      if (audioElementInstance) audioElementInstance.currentTime = targetTimeSeconds;
    },
    skipForwardAction: (skipSeconds = 15) => {
      const audioElementInstance = audioElementReference.current;
      if (audioElementInstance) audioElementInstance.currentTime += skipSeconds;
    },
    skipBackwardAction: (skipSeconds = 15) => {
      const audioElementInstance = audioElementReference.current;
      if (audioElementInstance) audioElementInstance.currentTime -= skipSeconds;
    },
    
    isPlayerInterfaceExpandedStatus,
    expandPlayerInterface: () => setIsPlayerInterfaceExpandedStatus(true),
    collapsePlayerInterface: () => setIsPlayerInterfaceExpandedStatus(false),
  }), [currentActivePodcast, playbackQueue, isAudioPlayingStatus, isAudioLoadingStatus, isPlayerInterfaceExpandedStatus, logInteractionEventAction, playPodcastAction, terminatePodcastPlayback, togglePlayPauseAction]);

  return <AudioContext.Provider value={contextValue}>{children}</AudioContext.Provider>;
}

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("CRITICAL_ERROR: 'useAudio' invocado fuera de su AudioProvider.");
  return context;
};
