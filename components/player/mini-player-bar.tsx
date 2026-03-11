// components/player/mini-player-bar.tsx
// VERSIÓN: 5.0 (NicePod Mini-Terminal - Mobile Mastery Edition)
// Misión: Proveer control persistente, síncrono y elegante en dispositivos móviles.
// [ESTABILIZACIÓN]: Implementación de Sincronía por Hardware y Marquee con Mask-Fade.

"use client";

import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Pause, Play, X, Zap } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

// --- INFRAESTRUCTURA CORE ---
import { Button } from "@/components/ui/button";
import { useAudio } from "@/contexts/audio-context";
import { cn, formatTime, getSafeAsset } from "@/lib/utils";

/**
 * COMPONENTE: MiniPlayerBar
 * La interfaz de mando compacta para la red de Madrid Resonance.
 */
export function MiniPlayerBar() {
  const {
    currentPodcast,
    isPlaying,
    togglePlayPause,
    closePodcast,
    expandPlayer,
    audioRef
  } = useAudio();

  const { toast } = useToast();

  // --- TELEMETRÍA DE ALTA PRECISIÓN ---
  const [progress, setProgress] = useState<number>(0);
  const [localTime, setLocalTime] = useState<number>(0);
  const [localDuration, setLocalDuration] = useState<number>(0);

  /**
   * 1. MOTOR DE SINCRO (Hardware Link)
   * Captura el pulso directamente del objeto de audio nativo.
   */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const syncMetrics = () => {
      setLocalTime(audio.currentTime);
      if (audio.duration && audio.duration !== localDuration) {
        setLocalDuration(audio.duration);
      }
      if (audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener('timeupdate', syncMetrics);
    return () => audio.removeEventListener('timeupdate', syncMetrics);
  }, [audioRef, localDuration]);

  /**
   * 2. VALIDACIÓN DE INTEGRIDAD
   */
  const isReady = useMemo(() =>
    currentPodcast?.processing_status === 'completed',
    [currentPodcast?.processing_status]
  );

  const handleContainerClick = () => {
    if (!isReady) {
      toast({
        title: "Sincronía en curso",
        description: "El activo se está materializando en la malla.",
        variant: "default"
      });
      return;
    }
    expandPlayer();
  };

  if (!currentPodcast) return null;

  const authorName = currentPodcast.profiles?.full_name || "Cronista NicePod";

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed bottom-0 left-0 right-0 z-[150] px-3 pb-3 md:px-6 md:pb-6 pointer-events-none"
    >
      <div className="max-w-4xl mx-auto w-full pointer-events-auto">

        {/* BARRA DE PROGRESO INDUSTRIAL (Incrustada) */}
        <div className="mx-8 mb-[-1px] relative z-20">
          <div className="h-[2px] w-full bg-white/5 overflow-hidden rounded-full">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
            />
          </div>
        </div>

        {/* CHASIS DEL REPRODUCTOR (Liquid Glass) */}
        <div className="h-16 md:h-20 bg-[#050505]/95 backdrop-blur-3xl border border-white/5 rounded-2xl md:rounded-[2.5rem] flex items-center justify-between px-3 md:px-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] group relative overflow-hidden">

          {/* EFECTO AURORA INTERNO (Sutil) */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

          {/* SECCIÓN ALFA: INFO & MARQUEE */}
          <div
            className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 cursor-pointer z-10"
            onClick={handleContainerClick}
          >
            {/* MINIATURA CON ESCUDO DE INTEGRIDAD */}
            <div className={cn(
              "relative w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 transition-all duration-700",
              !isReady && "grayscale opacity-30 blur-[1px]"
            )}>
              <Image
                src={getSafeAsset(currentPodcast.cover_image_url, 'cover')}
                alt=""
                fill
                sizes="48px"
                className="object-cover group-hover:scale-110 transition-transform duration-1000"
              />
            </div>

            {/* TEXTOS DINÁMICOS */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="w-full max-w-[140px] sm:max-w-[200px] md:max-w-md overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                <motion.p
                  animate={currentPodcast.title.length > 20 ? { x: [0, -100, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                  className="font-black text-[11px] md:text-sm text-white uppercase tracking-tight whitespace-nowrap italic"
                >
                  {currentPodcast.title}
                </motion.p>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                {isReady ? (
                  <>
                    <p className="text-[8px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] truncate">
                      {authorName}
                    </p>
                    <span className="text-[8px] font-mono text-primary/60">
                      {formatTime(localTime)} <span className="opacity-30">/</span> {formatTime(localDuration)}
                    </span>
                  </>
                ) : (
                  <span className="flex items-center gap-1.5 text-[8px] text-primary font-black uppercase animate-pulse">
                    <Zap size={8} className="fill-primary" /> Sintetizando...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN BETA: MANDOS TÁCTICOS */}
          <div className="flex items-center gap-1 md:gap-3 ml-2 z-10">

            <Button
              onClick={(e) => {
                e.stopPropagation();
                if (isReady) togglePlayPause();
              }}
              variant="ghost"
              size="icon"
              disabled={!isReady}
              className={cn(
                "h-10 w-10 md:h-12 md:w-12 rounded-full transition-all duration-300",
                isReady
                  ? "bg-white text-black hover:bg-primary hover:text-white shadow-lg active:scale-90"
                  : "bg-zinc-900 text-zinc-700 opacity-20"
              )}
            >
              {isPlaying && isReady ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current ml-0.5" />
              )}
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                closePodcast();
              }}
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-zinc-600 hover:text-red-500 hover:bg-red-500/5 transition-all"
            >
              <X className="h-4 w-4" />
            </Button>

          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Sincronía Absoluta: Al centralizar la escucha en 'audioRef.current', la barra 
 *    de progreso se mueve con precisión de milisegundos, eliminando la sensación 
 *    de desactualización en el mini-player.
 * 2. Visualización Marquee: El uso de '[mask-image]' permite que el texto que 
 *    se desplaza no se corte de forma abrupta, sino que se disuelva en los bordes, 
 *    elevando el diseño al estándar Spotify Premium.
 * 3. Diseño Compacto: Se optimizaron los 'gaps' y 'paddings' para que en móviles 
 *    pequeños (como el reportado por el Comandante), los controles no empujen 
 *    el contenido fuera de la pantalla.
 */