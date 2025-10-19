"use client";

import type React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { useAudio } from "@/contexts/audio-context";
import { formatTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// --- Importaciones de Componentes de UI ---
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, X, Loader2, AlertCircle } from "lucide-react";

export function MiniAudioPlayer() {
  const {
    currentPodcast,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoading,
    error,
    togglePlayPause,
    seekTo,
    skipForward,
    skipBackward,
    setVolume,
    closePodcast,
  } = useAudio();

  const [isMinimized, setIsMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error de Audio",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (currentPodcast && !isMinimized) {
      playerRef.current?.focus();
    }
  }, [currentPodcast, isMinimized]);

  const waveformBars = useMemo(() => Array.from({ length: 30 }, (_, i) => ({ id: i, height: Math.random() * 16 + 4 })), []);

  if (!isMounted || !currentPodcast) return null;

  const handleProgressChange = (value: number[]) => {
    if (typeof value[0] === 'number') seekTo(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    if (typeof value[0] === 'number') {
      const newVolume = value[0] / 100;
      setVolume(newVolume);
      if (newVolume > 0 && isMuted) setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.target !== playerRef.current) return;
    switch (event.key) {
      case " ": event.preventDefault(); togglePlayPause(); break;
      case "ArrowLeft": event.preventDefault(); skipBackward(); break;
      case "ArrowRight": event.preventDefault(); skipForward(); break;
      case "Escape": event.preventDefault(); closePodcast(); break;
      case "m": event.preventDefault(); toggleMute(); break;
    }
  };
  
  const authorName = currentPodcast.profiles?.full_name || "Creador Anónimo";
  const authorImage = currentPodcast.profiles?.avatar_url || "/images/placeholder.svg";

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 animate-in slide-in-from-bottom-4 duration-500"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        ref={playerRef}
        role="region"
        aria-label="Reproductor de audio"
      >
        <Card
          className={`glass-card border border-white/20 dark:border-white/10 shadow-glass-xl transition-all duration-300 ease-in-out ${
            isMinimized ? "w-16 h-16 rounded-full" : "w-80 sm:w-96 rounded-2xl"
          } overflow-hidden group`}
        >
          {isMinimized ? (
            <CardContent className="p-0 h-full w-full flex items-center justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setIsMinimized(false)}
                    variant="ghost"
                    size="icon"
                    className="w-full h-full rounded-full bg-black/10 hover:bg-black/20 backdrop-blur-md"
                    aria-label={`Expandir reproductor. Reproduciendo: ${currentPodcast.title}`}
                  >
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-white" /> :
                     isPlaying ? <Pause className="h-6 w-6 text-white" /> :
                     <Play className="h-6 w-6 text-white" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{currentPodcast.title}</p>
                </TooltipContent>
              </Tooltip>
            </CardContent>
          ) : (
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <Image src={currentPodcast.cover_image_url || authorImage} alt={currentPodcast.title} fill className="rounded-md object-cover"/>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-md truncate">{currentPodcast.title}</h3>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Image src={authorImage} alt={authorName} width={16} height={16} className="rounded-full mr-1.5"/>
                    <span className="truncate">{authorName}</span>
                  </div>
                </div>
                <Button onClick={closePodcast} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-black/10 flex-shrink-0"><X className="h-4 w-4" /></Button>
              </div>

              <div className="space-y-1.5">
                <Slider value={[currentTime]} max={duration || 100} step={1} onValueChange={handleProgressChange} disabled={isLoading || !!error} />
                <div className="flex justify-between text-xs text-muted-foreground font-mono"><span aria-live="polite">{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {/* ================== CORRECCIÓN QUIRÚRGICA #1 ================== */}
                  <Tooltip><TooltipTrigger asChild><Button onClick={() => skipBackward()} variant="ghost" size="icon" disabled={isLoading || !!error}><SkipBack className="h-5 w-5" /></Button></TooltipTrigger><TooltipContent>Retroceder 15s</TooltipContent></Tooltip>
                  <Button onClick={togglePlayPause} variant="default" size="icon" className="h-12 w-12 rounded-full shadow-lg" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 
                     error ? <AlertCircle className="h-6 w-6 text-red-500" /> :
                     isPlaying ? <Pause className="h-6 w-6" /> : 
                     <Play className="h-6 w-6" />}
                  </Button>
                  <Tooltip><TooltipTrigger asChild><Button onClick={() => skipForward()} variant="ghost" size="icon" disabled={isLoading || !!error}><SkipForward className="h-5 w-5" /></Button></TooltipTrigger><TooltipContent>Adelantar 15s</TooltipContent></Tooltip>
                  {/* ================================================================ */}
                </div>
                <div className="h-8 flex items-end justify-center gap-0.5" aria-hidden="true">
                  {waveformBars.map((bar) => (
                    <div key={bar.id} className="w-1 bg-primary/70 rounded-full" style={{ height: isPlaying && !error ? `${bar.height}px` : '4px', transition: 'height 0.3s ease-in-out' }} />
                  ))}
                </div>
                <Tooltip><TooltipTrigger asChild><Button onClick={toggleMute} variant="ghost" size="icon">{isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}</Button></TooltipTrigger><TooltipContent>{isMuted ? 'Quitar silencio' : 'Silenciar'}</TooltipContent></Tooltip>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </TooltipProvider>
  );
}