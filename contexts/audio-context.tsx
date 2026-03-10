// contexts/audio-context.tsx
// VERSIÓN: 5.0 (NicePod Audio Terminal - Pure Resilience Edition)
// Misión: Motor de audio neuronal invulnerable a falsos positivos del DOM.
// [ESTABILIZACIÓN]: Erradicación de errores de MediaSource y blindaje de Listeners.

"use client";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { PodcastWithProfile } from "@/types/podcast";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export interface AudioContextType {
  currentPodcast: PodcastWithProfile | null;
  queue: PodcastWithProfile[];
  isPlaying: boolean;
  isLoading: boolean;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  playPodcast: (podcast: PodcastWithProfile, playlist?: PodcastWithProfile[]) => Promise<void>;
  togglePlayPause: () => void;
  closePodcast: () => void;
  seekTo: (time: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  logInteractionEvent: (type: 'completed_playback' | 'liked' | 'shared') => Promise<void>;
  isPlayerExpanded: boolean;
  expandPlayer: () => void;
  collapsePlayer: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { user, supabase: authSupabase } = useAuth();
  const { toast } = useToast();
  const supabase = authSupabase || createClient();

  const [currentPodcast, setCurrentPodcast] = useState<PodcastWithProfile | null>(null);
  const [queue, setQueue] = useState<PodcastWithProfile[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Referencia mutada silenciosamente para que el listener de error sepa si hay un podcast activo
  // sin necesidad de meter currentPodcast en las dependencias del useEffect (que causaría re-renders).
  const currentPodcastRef = useRef<PodcastWithProfile | null>(null);
  useEffect(() => { currentPodcastRef.current = currentPodcast; }, [currentPodcast]);

  /**
   * [INICIALIZACIÓN DE HARDWARE Y EVENTOS NATIVOS]
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'metadata';
      audioRef.current = audio;

      audio.addEventListener("play", () => setIsPlaying(true));
      audio.addEventListener("pause", () => setIsPlaying(false));
      audio.addEventListener("loadstart", () => setIsLoading(true));
      audio.addEventListener("canplay", () => setIsLoading(false));
      audio.addEventListener("ended", () => handleAutoNext());

      /**
       * [ESCUDO ANTI-FALSOS POSITIVOS]
       * El motor de HTML5 lanza errores cuando se vacía el 'src' o cuando la carga se interrumpe
       * intencionadamente al cambiar de página. Esta lógica filtra la "basura" del DOM.
       */
      audio.addEventListener("error", (e) => {
        setIsLoading(false);
        const target = e.target as HTMLAudioElement;

        // Si no hay un podcast activo en la UI, el error es producto de una purga de memoria. Lo ignoramos.
        if (!currentPodcastRef.current) return;

        // Código 3: Error de red al descargar. Código 4: Formato no soportado (o URL rota).
        // Ignoramos el error si el 'src' está vacío (provocado por closePodcast).
        if (target.error && target.src && target.src !== window.location.href) {
          console.warn(`[AudioContext] Falla de reproducción. Código: ${target.error.code}`);
          toast({
            variant: "destructive",
            title: "Frecuencia Inestable",
            description: "No se pudo recuperar el activo acústico. Verifique su conexión a la red de Madrid."
          });
        }
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  const logInteractionEvent = useCallback(async (type: 'completed_playback' | 'liked' | 'shared') => {
    if (!user || !currentPodcast) return;
    try {
      await supabase.from('playback_events').insert({
        user_id: user.id,
        podcast_id: currentPodcast.id,
        event_type: type
      });
    } catch (err) { }
  }, [user, currentPodcast, supabase]);

  const handleAutoNext = useCallback(() => {
    if (queue.length > 0 && currentPodcast) {
      const idx = queue.findIndex(p => p.id === currentPodcast.id);
      if (idx !== -1 && idx < queue.length - 1) {
        playPodcast(queue[idx + 1]);
        return;
      }
    }
    setIsPlaying(false);
    logInteractionEvent('completed_playback');
  }, [queue, currentPodcast, logInteractionEvent]);

  const playPodcast = useCallback(async (podcast: PodcastWithProfile, playlist: PodcastWithProfile[] = []) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!podcast.audio_url) {
      toast({
        variant: "destructive",
        title: "Nodo Incompleto",
        description: "El audio aún está siendo forjado por los agentes de IA."
      });
      return;
    }

    if (playlist.length > 0) setQueue(playlist);

    try {
      if (currentPodcast?.id === podcast.id) {
        if (audio.paused) await audio.play(); else audio.pause();
      } else {
        setCurrentPodcast(podcast);
        audio.src = podcast.audio_url;
        await audio.play();

        // Operación "fire and forget" para telemetría
        supabase.rpc('increment_play_count', { podcast_id: podcast.id }).then();
      }
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        toast({
          title: "Sistema Bloqueado",
          description: "El navegador requiere una pulsación manual para iniciar el audio."
        });
      }
    }
  }, [currentPodcast, supabase, toast]);

  const value = useMemo(() => ({
    currentPodcast,
    queue,
    isPlaying,
    isLoading,
    audioRef,
    playPodcast,
    togglePlayPause: () => {
      const audio = audioRef.current;
      if (audio) audio.paused ? audio.play().catch(console.error) : audio.pause();
    },
    closePodcast: () => {
      if (audioRef.current) {
        audioRef.current.pause();
        // [FIX CRÍTICO]: Eliminación del anti-patrón de asignación de cadena vacía.
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
      }
      setCurrentPodcast(null);
      setQueue([]);
      setIsPlayerExpanded(false);
    },
    seekTo: (t: number) => { if (audioRef.current) audioRef.current.currentTime = t; },
    skipForward: (s = 15) => { if (audioRef.current) audioRef.current.currentTime += s; },
    skipBackward: (s = 15) => { if (audioRef.current) audioRef.current.currentTime -= s; },
    logInteractionEvent,
    isPlayerExpanded,
    expandPlayer: () => setIsPlayerExpanded(true),
    collapsePlayer: () => setIsPlayerExpanded(false),
  }), [currentPodcast, queue, isPlaying, isLoading, isPlayerExpanded, logInteractionEvent, playPodcast]);

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio debe ser utilizado dentro de un AudioProvider");
  return context;
};

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Erradicación de "Error de Nodo": Se reemplazó el anti-patrón 'audioRef.current.src = ""' 
 *    por '.removeAttribute("src")' en la función closePodcast, evitando que el navegador 
 *    dispare excepciones MediaError al cerrar el reproductor o navegar fuera de la vista.
 * 2. Auditoría Estricta de Listeners: El listener de 'error' utiliza ahora un 'currentPodcastRef' 
 *    para saber si la app tiene intención de reproducir audio o si el error del DOM 
 *    puede ser ignorado silenciosamente como parte de la gestión de memoria.
 */