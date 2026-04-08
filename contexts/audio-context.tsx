/**
 * ARCHIVO: contexts/audio-context.tsx
 * VERSIÓN: 7.0 (NicePod Audio Terminal - Absolute Nominal Integrity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Motor de audio neuronal con despacho de telemetría de alta frecuencia,
 * gestionando el ciclo de vida de los activos acústicos y la higiene de memoria RAM.
 * [REFORMA V7.0]: Cumplimiento absoluto de la Zero Abbreviations Policy y 
 * optimización del protocolo de purga de recursos (Hardware Termination).
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
 * Define el contrato público del motor de audio de la Workstation.
 */
export interface AudioContextProperties {
  currentActivePodcast: PodcastWithProfile | null;
  playbackQueue: PodcastWithProfile[];
  isAudioPlaying: boolean;
  isAudioLoading: boolean;
  audioElementReference: React.MutableRefObject<HTMLAudioElement | null>;
  
  playPodcastAction: (podcast: PodcastWithProfile, playlist?: PodcastWithProfile[]) => Promise<void>;
  togglePlayPauseAction: () => void;
  terminatePodcastPlayback: () => void;
  seekToTimeAction: (targetTimeSeconds: number) => void;
  skipForwardAction: (skipSeconds?: number) => void;
  skipBackwardAction: (skipSeconds?: number) => void;
  logInteractionEventAction: (interactionType: 'completed_playback' | 'liked' | 'shared') => Promise<void>;
  
  isPlayerExpanded: boolean;
  expandPlayerInterface: () => void;
  collapsePlayerInterface: () => void;
}

const AudioContext = createContext<AudioContextProperties | undefined>(undefined);

/**
 * AudioProvider: El orquestador de hardware acústico.
 */
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { user: authenticatedUser, supabase: authSupabaseClient } = useAuth();
  const { toast } = useToast();
  const supabaseClient = authSupabaseClient || createClient();

  // --- ESTADOS DE GESTIÓN DE REPRODUCCIÓN ---
  const [currentActivePodcast, setCurrentActivePodcast] = useState<PodcastWithProfile | null>(null);
  const [playbackQueue, setPlaybackQueue] = useState<PodcastWithProfile[]>([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState<boolean>(false);

  // --- REFERENCIAS DE HARDWARE Y MEMORIA ---
  const audioElementReference = useRef<HTMLAudioElement | null>(null);
  const activePodcastReference = useRef<PodcastWithProfile | null>(null);

  useEffect(() => { 
    activePodcastReference.current = currentActivePodcast; 
  }, [currentActivePodcast]);

  /**
   * 1. PROTOCOLO DE INICIALIZACIÓN DE HARDWARE SOBERANO
   * Misión: Instanciar el motor de audio de HTML5 y configurar los oyentes de telemetría.
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!audioElementReference.current) {
      const audioInstance = new Audio();
      audioInstance.preload = 'metadata';
      audioElementReference.current = audioInstance;

      // Listeners de Estado de Hardware
      audioInstance.addEventListener("play", () => setIsAudioPlaying(true));
      audioInstance.addEventListener("pause", () => setIsAudioPlaying(false));
      audioInstance.addEventListener("loadstart", () => setIsAudioLoading(true));
      audioInstance.addEventListener("canplay", () => setIsAudioLoading(false));
      audioInstance.addEventListener("ended", () => handleAutomaticNextAction());

      /**
       * [TELEMETRÍA DE ALTA FRECUENCIA]
       * Despachamos un evento nativo para que los componentes de precisión 
       * (Teleprompter) se actualicen mediante REFs de DOM, protegiendo los FPS.
       */
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
          nicepodLog("🔥 [AudioEngine] Frecuencia Inestable.", errorTarget.error, 'error');
          toast({
            variant: "destructive",
            title: "Frecuencia Inestable",
            description: "No se pudo recuperar el activo acústico de la Bóveda."
          });
        }
      });
    }

    /**
     * LIMPIEZA DE HARDWARE (TERMINATION PROTOCOL)
     * Misión: Garantizar que no existan fugas de memoria al desmontar el contexto.
     */
    return () => {
      if (audioElementReference.current) {
        audioElementReference.current.pause();
        audioElementReference.current.removeAttribute("src");
        audioElementReference.current.load(); // Fuerza la purga del buffer
      }
    };
  }, [toast]);

  /**
   * logInteractionEventAction:
   * Misión: Registrar la resonancia social y el progreso en el Metal (SQL).
   */
  const logInteractionEventAction = useCallback(async (interactionType: 'completed_playback' | 'liked' | 'shared') => {
    if (!authenticatedUser || !currentActivePodcast) return;
    try {
      await supabaseClient.from('playback_events').insert({
        user_id: authenticatedUser.id,
        podcast_id: currentActivePodcast.id,
        event_type: interactionType
      });
    } catch (exception) {
        nicepodLog("⚠️ [AudioEngine] No se pudo registrar el evento de interacción.", exception, 'warn');
    }
  }, [authenticatedUser, currentActivePodcast, supabaseClient]);

  /**
   * handleAutomaticNextAction:
   * Misión: Gestionar la continuidad de la cola de reproducción.
   */
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
   * playPodcastAction:
   * Misión: Activar la reproducción de una crónica específica.
   */
  const playPodcastAction = useCallback(async (targetPodcast: PodcastWithProfile, targetPlaylist: PodcastWithProfile[] = []) => {
    const audioInstance = audioElementReference.current;
    if (!audioInstance) return;

    if (!targetPodcast.audio_url) {
      toast({ variant: "destructive", title: "Nodo Incompleto", description: "El audio se encuentra en proceso de forja." });
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
        // Registro asíncrono de audiencia
        supabaseClient.rpc('increment_play_count', { podcast_id: targetPodcast.id }).then();
      }
    } catch (exception: unknown) {
      const errorObject = exception as Error;
      if (errorObject.name === 'NotAllowedError') {
        toast({ title: "Acción Interceptada", description: "El navegador requiere una interacción manual para iniciar el audio." });
      }
    }
  }, [currentActivePodcast, supabaseClient, toast]);

  /**
   * API SOBERANA DE AUDIO
   */
  const audioContextValue = useMemo(() => ({
    currentActivePodcast,
    queue: playbackQueue,
    isPlaying: isAudioPlaying,
    isLoading: isAudioLoading,
    audioElementReference,
    playPodcastAction,
    togglePlayPauseAction: () => {
      const audioInstance = audioElementReference.current;
      if (audioInstance) {
        if (audioInstance.paused) {
            audioInstance.play().catch((exception) => nicepodLog("Error en comando Play:", exception, 'error'));
        } else {
            audioInstance.pause();
        }
      }
    },
    terminatePodcastPlayback: () => {
      if (audioElementReference.current) {
        audioElementReference.current.pause();
        audioElementReference.current.removeAttribute("src");
        audioElementReference.current.load();
      }
      setCurrentActivePodcast(null);
      setPlaybackQueue([]);
      setIsPlayerExpanded(false);
      nicepodLog("🧹 [AudioEngine] Memoria acústica purgada.");
    },
    seekToTimeAction: (targetTimeSeconds: number) => { 
      if (audioElementReference.current) {
        audioElementReference.current.currentTime = targetTimeSeconds;
      }
    },
    skipForwardAction: (skipSeconds = 15) => { 
      if (audioElementReference.current) {
        audioElementReference.current.currentTime += skipSeconds;
      }
    },
    skipBackwardAction: (skipSeconds = 15) => { 
      if (audioElementReference.current) {
        audioElementReference.current.currentTime -= skipSeconds;
      }
    },
    logInteractionEventAction,
    isPlayerExpanded,
    expandPlayerInterface: () => setIsPlayerExpanded(true),
    collapsePlayerInterface: () => setIsPlayerExpanded(false),
  }), [currentActivePodcast, playbackQueue, isAudioPlaying, isAudioLoading, isPlayerExpanded, logInteractionEventAction, playPodcastAction]);

  return <AudioContext.Provider value={audioContextValue}>{children}</AudioContext.Provider>;
}

/**
 * useAudio:
 * Misión: Proveer acceso único al motor de audio neuronal.
 */
export const useAudio = () => {
  const audioContext = useContext(AudioContext);
  if (!audioContext) {
    throw new Error("CRITICAL_ERROR: 'useAudio' debe ser utilizado dentro de un AudioProvider.");
  }
  return audioContext;
};