// components/player/mini-player-bar.tsx
// VERSIÓN: 4.0 (NicePod Mini-Terminal - Spotify Elegance Standard)
// Misión: Proveer control persistente, síncrono y elegante de la reproducción global.
// [ESTABILIZACIÓN]: Implementación de Marquee de título, tipado estricto y blindaje de hidratación.

"use client";

import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Mic, Pause, Play, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

// --- INFRAESTRUCTURA CORE ---
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAudio } from "@/contexts/audio-context";
import { cn, formatTime, getSafeAsset } from "@/lib/utils";

/**
 * COMPONENTE: MiniPlayerBar
 * El guardián de la continuidad acústica en la Workstation NicePod.
 */
export function MiniPlayerBar() {
  const {
    currentPodcast,
    isPlaying,
    togglePlayPause,
    closePodcast,
    expandPlayer
  } = useAudio();

  const { toast } = useToast();

  // --- TELEMETRÍA LOCAL ---
  const [progress, setProgress] = useState<number>(0);
  const [localTime, setLocalTime] = useState<number>(0);
  const [localDuration, setLocalDuration] = useState<number>(0);

  /**
   * 1. PROTOCOLO DE SINCRO (Event-Driven)
   * Captura el pulso del AudioProvider sin causar re-renders globales.
   */
  useEffect(() => {
    const handleSync = (event: Event) => {
      const customEvent = event as CustomEvent<{ currentTime: number; duration: number }>;
      const { currentTime, duration } = customEvent.detail;

      setLocalTime(currentTime);
      if (duration > 0) {
        setLocalDuration(duration);
        setProgress((currentTime / duration) * 100);
      }
    };

    window.addEventListener('nicepod-timeupdate', handleSync as EventListener);
    return () => window.removeEventListener('nicepod-timeupdate', handleSync as EventListener);
  }, []);

  /**
   * 2. VALIDACIÓN DE SOBERANÍA (Integrity Check)
   */
  const isReady = useMemo(() =>
    currentPodcast?.processing_status === 'completed',
    [currentPodcast?.processing_status]
  );

  const handleActionClick = () => {
    if (!isReady) {
      toast({
        title: "Forja en curso",
        description: "El activo se está materializando. Paciencia, curador.",
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
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-[120] px-4 pb-4 pointer-events-none"
    >
      <div className="max-w-5xl mx-auto w-full pointer-events-auto">

        {/* BARRA DE PROGRESO FLOTANTE (Sutil) */}
        <div className="px-6 mb-[-2px] relative z-10">
          <Progress value={progress} className="h-[2px] w-full rounded-none bg-primary/10" />
        </div>

        {/* CHASIS DEL REPRODUCTOR (Glassmorphism) */}
        <div className="h-16 md:h-20 bg-[#0A0A0A]/90 backdrop-blur-3xl border border-white/5 rounded-2xl md:rounded-[2rem] flex items-center justify-between px-4 md:px-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">

          {/* SECCIÓN A: INFO & MARQUEE */}
          <div
            className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
            onClick={handleActionClick}
          >
            {/* PORTADA MINI */}
            <div className={cn(
              "relative w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden border border-white/10 transition-all duration-700",
              !isReady && "grayscale opacity-40 blur-[1px]"
            )}>
              <Image
                src={getSafeAsset(currentPodcast.cover_image_url, 'cover')}
                alt=""
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-1000"
              />
            </div>

            {/* TEXTOS (Con lógica de desplazamiento si es necesario) */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="w-full max-w-[180px] md:max-w-md overflow-hidden relative">
                <motion.p
                  animate={{ x: currentPodcast.title.length > 25 ? [0, -150, 0] : 0 }}
                  transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                  className="font-black text-xs md:text-sm truncate uppercase tracking-tight text-white whitespace-nowrap italic"
                >
                  {currentPodcast.title}
                </motion.p>
              </div>

              <div className="flex items-center gap-3">
                {isReady ? (
                  <>
                    <p className="text-[9px] md:text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] truncate">
                      {authorName}
                    </p>
                    <span className="text-[8px] font-mono text-primary/40 hidden md:block">
                      {formatTime(localTime)} / {formatTime(localDuration)}
                    </span>
                  </>
                ) : (
                  <span className="flex items-center gap-1.5 text-[8px] md:text-[9px] text-primary font-black uppercase animate-pulse tracking-widest">
                    <Mic size={10} /> Sintetizando...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN B: CONTROLES */}
          <div className="flex items-center gap-2 md:gap-4 ml-4">

            {/* BOTÓN PLAY/PAUSE */}
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
                  ? "bg-white text-black hover:bg-primary hover:text-white shadow-xl hover:scale-105"
                  : "bg-zinc-900 text-zinc-700 opacity-20"
              )}
            >
              {isPlaying && isReady ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current ml-0.5" />
              )}
            </Button>

            {/* BOTÓN CERRAR (Purga de Sesión) */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                closePodcast();
              }}
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-xl"
            >
              <X className="h-5 w-5" />
            </Button>

          </div>
        </div>

        {/* BORDE DE RESONANCIA (Aurora Glow) */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      </div>
    </motion.div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Ergonomía Marquee: Se inyectó una animación de desplazamiento lateral mediante 
 *    Framer Motion que solo se activa visualmente si el título excede la zona de 
 *    seguridad, evitando el truncamiento agresivo de información.
 * 2. Métrica Síncrona: Al visualizar el tiempo local (mm:ss) junto al autor, 
 *    cumplimos con el estándar de telemetría profesional de audio, permitiendo 
 *    que el usuario sepa su posición sin expandir el reproductor.
 * 3. Diseño de Inmersión: Se reemplazó el fondo 'background/95' por '#0A0A0A/90' 
 *    con 'backdrop-blur-3xl', logrando el efecto de cristal oscuro de Spotify Premium, 
 *    pero manteniendo la firma estética de la Workstation NicePod.
 */