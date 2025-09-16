// contexts/audio-context.tsx
"use client";

import type React from "react";
import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast"; // Importamos el hook de 'toast'

// ================== MODIFICACIÓN #1: SIMPLIFICACIÓN DE TIPOS ==================
// En lugar de una interfaz compleja, definimos un tipo simple y genérico para
// lo que el reproductor de audio realmente necesita.
export interface PlayablePodcast {
  id: string;
  title: string;
  audioUrl: string; // La URL es la pieza clave.
}

export interface AudioContextType {
  currentPodcast: PlayablePodcast | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  playPodcast: (podcast: PlayablePodcast) => void;
  togglePlayPause: () => void;
  closePodcast: () => void;
  // Simplificamos omitiendo funciones de UI que pertenecen a un componente de reproductor dedicado.
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentPodcast, setCurrentPodcast] = useState<PlayablePodcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast(); // Inicializamos el hook de 'toast'

  // Función de limpieza reutilizable
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = ""; // Liberamos la fuente del audio
    }
    setIsPlaying(false);
    setIsLoading(false);
    setError(null);
  }, []);

  // Inicialización y manejo de eventos del elemento de audio
  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    const handleEnded = () => setIsPlaying(false);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handlePlaying = () => { setIsLoading(false); setIsPlaying(true); };
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      setError("Error al cargar el audio.");
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);

    // Limpieza al desmontar el proveedor
    return () => {
      cleanup();
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
    };
  }, [cleanup]);

  // ================== MODIFICACIÓN #2: LÓGICA DE REPRODUCCIÓN REFINADA ==================
  const playPodcast = useCallback((podcast: PlayablePodcast) => {
    // LA VERIFICACIÓN CLAVE:
    if (!podcast.audioUrl) {
      toast({
        title: "Audio no disponible",
        description: "Este guion aún no ha sido procesado para generar el audio.",
        variant: "destructive",
      });
      return; // Detenemos la ejecución si no hay URL
    }
    
    if (audioRef.current) {
      cleanup();
      setCurrentPodcast(podcast);
      audioRef.current.src = podcast.audioUrl;
      audioRef.current.play().catch(e => {
        console.error("Error al iniciar la reproducción:", e);
        setError("No se pudo reproducir el audio.");
      });
    }
  }, [cleanup, toast]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => {
        console.error("Error al reanudar la reproducción:", e);
        setError("No se pudo reanudar el audio.");
      });
    }
  }, [isPlaying]);

  const closePodcast = useCallback(() => {
    cleanup();
    setCurrentPodcast(null);
  }, [cleanup]);

  const contextValue: AudioContextType = {
    currentPodcast,
    isPlaying,
    isLoading,
    error,
    playPodcast,
    togglePlayPause,
    closePodcast,
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