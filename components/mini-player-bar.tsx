// components/mini-player-bar.tsx
// VERSIÓN: 24.1 (Guardian Logic - Zero Error & Integrity Shield)

"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAudio } from "@/contexts/audio-context";
import { cn, getSafeAsset } from "@/lib/utils"; // [FIX]: Importación de 'cn' restaurada
import { Mic, Pause, Play, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export function MiniPlayerBar() {
  const {
    currentPodcast,
    isPlaying,
    togglePlayPause,
    closePodcast,
    expandPlayer
  } = useAudio();

  const [progress, setProgress] = useState(0);

  /**
   * Sincronización local con el pulso del motor de audio.
   * Escucha el evento global 'nicepod-timeupdate' para evitar re-renders en toda la App.
   */
  useEffect(() => {
    const onUpdate = (e: any) => {
      const { currentTime, duration } = e.detail;
      if (duration > 0) {
        setProgress((currentTime / duration) * 100);
      }
    };
    window.addEventListener('nicepod-timeupdate', onUpdate);
    return () => window.removeEventListener('nicepod-timeupdate', onUpdate);
  }, []);

  /**
   * [SISTEMA DE ESCUDO]: 
   * Verificamos si el podcast ha completado todas sus fases de producción.
   */
  const isReady = useMemo(() =>
    currentPodcast?.processing_status === 'completed',
    [currentPodcast?.processing_status]
  );

  if (!currentPodcast) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] animate-in slide-in-from-bottom-2 duration-500">
      {/* Barra de progreso sutil */}
      <Progress value={progress} className="h-1 w-full rounded-none bg-primary/20" />

      <div className="h-16 bg-background/95 backdrop-blur-2xl border-t border-border/40 flex items-center justify-between px-4 shadow-2xl">

        {/* LADO IZQUIERDO: INFORMACIÓN Y ESTADO */}
        <div
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
          onClick={expandPlayer}
        >
          <div className={cn(
            "relative w-10 h-10 rounded-lg overflow-hidden border border-white/5 transition-all duration-500",
            !isReady && "grayscale opacity-50 blur-[1px]"
          )}>
            <Image
              src={getSafeAsset(currentPodcast.cover_image_url, 'cover')}
              alt={currentPodcast.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate uppercase tracking-tight text-foreground">
              {currentPodcast.title}
            </p>
            <div className="flex items-center gap-2">
              {isReady ? (
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest truncate">
                  {currentPodcast.profiles?.full_name || "NicePod Curator"}
                </p>
              ) : (
                <span className="flex items-center gap-1.5 text-[9px] text-primary font-black uppercase animate-pulse">
                  <Mic size={10} /> Sintetizando Narrativa...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* LADO DERECHO: CONTROLES MAESTROS */}
        <div className="flex items-center gap-1 ml-4">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              if (isReady) togglePlayPause();
            }}
            variant="ghost"
            size="icon"
            disabled={!isReady}
            className={cn(
              "h-12 w-12 rounded-full transition-all duration-300",
              isReady
                ? "hover:bg-primary/10 text-foreground"
                : "opacity-20 cursor-not-allowed text-muted-foreground"
            )}
          >
            {isPlaying && isReady ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current" />
            )}
          </Button>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              closePodcast();
            }}
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}