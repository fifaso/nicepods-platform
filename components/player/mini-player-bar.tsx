// components/player/mini-player-bar.tsx
// VERSIÓN: 3.0 (NicePod Audio Terminal - Robust Interaction Standard)
// Misión: Barra de control de audio persistente con validación de estado industrial.
// [ESTABILIZACIÓN]: Tipado estricto de eventos y bloqueo de navegación en estados de forja.

"use client";

import { useToast } from "@/hooks/use-toast";
import { Mic, Pause, Play, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAudio } from "@/contexts/audio-context";
import { cn, getSafeAsset } from "@/lib/utils";

export function MiniPlayerBar() {
  const {
    currentPodcast,
    isPlaying,
    togglePlayPause,
    closePodcast,
    expandPlayer
  } = useAudio();
  const { toast } = useToast();

  const [progress, setProgress] = useState(0);

  /**
   * Sincronización local con el pulso del motor de audio.
   * [FIX]: Tipado estricto para eliminar cualquier 'any' residual.
   */
  useEffect(() => {
    const handleTimeUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ currentTime: number; duration: number }>;
      const { currentTime, duration } = customEvent.detail;
      if (duration > 0) {
        setProgress((currentTime / duration) * 100);
      }
    };

    window.addEventListener('nicepod-timeupdate', handleTimeUpdate as EventListener);
    return () => window.removeEventListener('nicepod-timeupdate', handleTimeUpdate as EventListener);
  }, []);

  // Validación industrial: El activo debe estar completo para ser funcional.
  const isReady = useMemo(() =>
    currentPodcast?.processing_status === 'completed',
    [currentPodcast?.processing_status]
  );

  const handleContainerClick = () => {
    if (!isReady) {
      toast({
        title: "Forja en curso",
        description: "El contenido aún está siendo sintetizado por la IA.",
        variant: "default"
      });
      return;
    }
    expandPlayer();
  };

  if (!currentPodcast) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] animate-in slide-in-from-bottom-2 duration-500">
      {/* Barra de progreso de alta precisión */}
      <Progress value={progress} className="h-1 w-full rounded-none bg-primary/20" />

      <div className="h-16 bg-zinc-950/95 backdrop-blur-3xl border-t border-white/5 flex items-center justify-between px-4 shadow-2xl">

        {/* LADO IZQUIERDO: INFORMACIÓN Y ESTADO */}
        <div
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
          onClick={handleContainerClick}
        >
          <div className={cn(
            "relative w-10 h-10 rounded-lg overflow-hidden border border-white/5 transition-all duration-500",
            !isReady && "grayscale opacity-50 blur-[1px]"
          )}>
            <Image
              src={getSafeAsset(currentPodcast.cover_image_url, 'cover')}
              alt={currentPodcast.title}
              fill
              sizes="40px"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-xs truncate uppercase tracking-tight text-white group-hover:text-primary transition-colors">
              {currentPodcast.title}
            </p>
            <div className="flex items-center gap-2">
              {isReady ? (
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest truncate">
                  {currentPodcast.profiles?.full_name || "NicePod Curator"}
                </p>
              ) : (
                <span className="flex items-center gap-1.5 text-[8px] text-primary font-black uppercase animate-pulse tracking-widest">
                  <Mic size={9} /> Sintetizando...
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
              "h-10 w-10 rounded-full transition-all duration-300",
              isReady
                ? "hover:bg-primary/10 text-white hover:text-primary"
                : "opacity-20 cursor-not-allowed text-zinc-600"
            )}
          >
            {isPlaying ? (
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
            className="h-10 w-10 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-all rounded-xl"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Sanitización de Eventos: El uso de 'as CustomEvent' junto a un listener tipado 
 *    elimina la advertencia sobre 'any', haciendo que el sistema de telemetría de 
 *    audio cumpla con el estándar de tipado estricto.
 * 2. Blindaje de Interacción: El componente ahora bloquea inteligentemente la 
 *    expansión al reproductor full-screen si el nodo no está listo, informando 
 *    al usuario mediante el componente 'toast'.
 * 3. Integridad de Cierre: Se ha refinado la lógica del 'AudioProvider' para 
 *    liberar recursos sin disparar falsos errores de 'src'.
 */