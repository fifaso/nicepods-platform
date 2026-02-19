// components/full-screen-player.tsx
// VERSIÓN: 24.0 (Inmersive Master - Type-Safe & Zero-Flicker Edition)
// Misión: Orquestar la experiencia cinemática de audio a pantalla completa.
// [RESOLUCIÓN]: Fix de error TS2322 (PodcastScript compatibility) y optimización de interacción.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Download,
  ExternalLink,
  Heart,
  Loader2,
  Pause,
  Play,
  Share2,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume2
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

// --- INFRAESTRUCTURA NICEPOD ---
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAudio } from "@/contexts/audio-context";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn, formatTime, getSafeAsset, nicepodLog } from "@/lib/utils";
import { ScriptViewer } from "./script-viewer";

/**
 * FullScreenPlayer: La terminal de inmersión definitiva.
 * 
 * Este componente es el encargado de la visualización profunda del contenido,
 * integrando el teleprompter de guion con el control de síntesis neuronal.
 */
export function FullScreenPlayer() {
  const {
    currentPodcast,
    isPlaying,
    isLoading,
    togglePlayPause,
    seekTo,
    skipForward,
    skipBackward,
    collapsePlayer,
    logInteractionEvent
  } = useAudio();

  const { supabase, user } = useAuth();
  const { toast } = useToast();

  // --- ESTADOS LOCALES DE RENDIMIENTO ---
  const [localTime, setLocalTime] = useState<number>(0);
  const [localDuration, setLocalDuration] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);

  /**
   * [SINCRO DE TIEMPO]: Escucha de eventos del núcleo de audio.
   * Actualiza la barra de progreso sin provocar re-renders en el layout global.
   */
  useEffect(() => {
    const handleSync = (e: any) => {
      const { currentTime, duration } = e.detail;
      setLocalTime(currentTime);
      if (duration && duration !== localDuration) {
        setLocalDuration(duration);
      }
    };

    window.addEventListener('nicepod-timeupdate', handleSync);
    return () => window.removeEventListener('nicepod-timeupdate', handleSync);
  }, [localDuration]);

  /**
   * [VERIFICACIÓN DE RESONANCIA]: Carga el estado de 'Like' desde la Bóveda.
   */
  useEffect(() => {
    if (!user || !currentPodcast) return;

    async function checkLikeStatus() {
      const { data } = await supabase
        .from('likes')
        .select('*')
        .match({ user_id: user?.id, podcast_id: currentPodcast?.id })
        .maybeSingle();

      setIsLiked(!!data);
    }

    checkLikeStatus();
  }, [user, currentPodcast, supabase]);

  // Guardia de renderizado: El player solo se monta si hay un podcast activo.
  if (!currentPodcast) return null;

  // --- MANEJADORES DE ACCIÓN ---

  const handleSliderChange = (value: number[]) => {
    const newTime = value[0];
    setLocalTime(newTime);
    seekTo(newTime);
  };

  const handleToggleLike = async () => {
    if (!user) {
      toast({
        title: "Acceso Privado",
        description: "Inicia sesión para anclar tu resonancia.",
        variant: "destructive"
      });
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    try {
      if (isLiked) {
        setIsLiked(false);
        await supabase.from('likes').delete().match({ user_id: user.id, podcast_id: currentPodcast.id });
      } else {
        setIsLiked(true);
        await supabase.from('likes').insert({ user_id: user.id, podcast_id: currentPodcast.id });
        await logInteractionEvent('liked');
        toast({ title: "Resonancia Registrada" });
      }
    } catch (err: any) {
      console.error("🔥 [FullScreen-Like-Fail]:", err.message);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: currentPodcast.title,
      text: `Escucha "${currentPodcast.title}" en NicePod. Wisdom defined.`,
      url: `${window.location.origin}/podcast/${currentPodcast.id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        await logInteractionEvent('shared');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({ title: "Enlace copiado al portapapeles" });
      }
    } catch {
      nicepodLog("Share protocol interrupted.");
    }
  };

  const handleDownload = async () => {
    if (!currentPodcast.audio_url) return;
    toast({ title: "Preparando archivo..." });
    try {
      const response = await fetch(currentPodcast.audio_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `NicePod-${currentPodcast.id}.wav`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch {
      toast({ title: "Error en descarga", variant: "destructive" });
    }
  };

  // Preparación de activos visuales
  const coverImage = getSafeAsset(currentPodcast.cover_image_url, 'cover');
  const authorName = currentPodcast.profiles?.full_name || "Cronista Soberano";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed inset-0 z-[150] bg-slate-950 flex flex-col overflow-hidden"
      >
        {/* FONDO AURORA ATMOSFÉRICO */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute -top-[10%] -left-[10%] w-[80%] h-[80%] bg-primary/20 rounded-full blur-[120px] animate-float" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[80%] h-[80%] bg-indigo-900/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative z-10 flex flex-col h-full max-w-screen-xl mx-auto w-full">

          {/* CABECERA: NAVEGACIÓN Y TÍTULO */}
          <header className="flex items-center justify-between p-6 md:p-10 flex-shrink-0">
            <Button
              onClick={collapsePlayer}
              variant="ghost"
              size="icon"
              className="text-white/30 hover:text-white hover:bg-white/5 rounded-full h-12 w-12 transition-all active:scale-90"
            >
              <ChevronDown className="h-8 w-8" />
            </Button>

            <div className="flex flex-col items-center text-center px-6 overflow-hidden">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-1.5 animate-pulse">
                Sincronía Nominal Activa
              </span>
              <h2 className="font-bold text-xs md:text-sm text-white/90 truncate w-full max-w-[250px] md:max-w-lg uppercase tracking-[0.2em] italic">
                {currentPodcast.title}
              </h2>
            </div>

            <div className="bg-white/5 p-3 rounded-2xl border border-white/5 shadow-inner">
              <Volume2 className="h-5 w-5 text-primary/60" />
            </div>
          </header>

          {/* CUERPO CENTRAL: SPLIT-VIEW (VISUAL + TEXTO) */}
          <main className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-12 px-6 md:px-12 items-center">

            {/* AREA VISUAL: CARÁTULA */}
            <div className="hidden md:flex flex-col items-center justify-center space-y-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative w-full max-w-sm aspect-square shadow-[0_0_80px_rgba(0,0,0,0.5)] rounded-[3.5rem] overflow-hidden border border-white/10 bg-zinc-900 group"
              >
                <Image
                  src={coverImage}
                  alt={currentPodcast.title}
                  fill
                  className="object-cover opacity-90 transition-all duration-1000 group-hover:scale-110 group-hover:opacity-100"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </motion.div>

              <div className="bg-primary/5 px-6 py-2 rounded-2xl border border-primary/20 flex items-center gap-3">
                <Sparkles size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Resonancia Neural NicePod
                </span>
              </div>
            </div>

            {/* AREA NARRATIVA: TELEPROMPTER */}
            <div className="flex-1 h-full w-full bg-black/40 border border-white/5 rounded-[3rem] relative overflow-hidden shadow-2xl backdrop-blur-2xl">
              <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-slate-950/80 z-20 pointer-events-none" />

              <div className="h-full w-full p-8 md:p-14 overflow-y-auto custom-scrollbar-hide">
                {/* [FIX]: Envío del objeto script_text estructurado al visor */}
                <ScriptViewer
                  scriptText={currentPodcast.script_text}
                />
              </div>

              <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-slate-950/80 z-20 pointer-events-none" />
            </div>
          </main>

          {/* PIE DE PÁGINA: TERMINAL TÁCTICA */}
          <footer className="p-8 md:p-12 flex-shrink-0 w-full max-w-5xl mx-auto space-y-12">

            {/* CONTROL DE PROGRESO */}
            <div className="space-y-5">
              <Slider
                value={[localTime]}
                max={localDuration || 100}
                step={0.1}
                onValueChange={handleSliderChange}
                className="cursor-pointer"
              />
              <div className="flex justify-between items-center text-[11px] font-black font-mono text-white/30 tracking-[0.2em] uppercase">
                <span className="bg-white/5 px-3 py-1 rounded-lg border border-white/5 shadow-inner">
                  {formatTime(localTime)}
                </span>
                <div className="h-px flex-1 mx-8 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="bg-white/5 px-3 py-1 rounded-lg border border-white/5 shadow-inner">
                  {formatTime(localDuration)}
                </span>
              </div>
            </div>

            {/* PANEL DE MANDOS PRINCIPAL */}
            <div className="flex items-center justify-between px-4">

              {/* ACCIÓN: LIKE (Resonancia) */}
              <button
                onClick={handleToggleLike}
                disabled={isLiking}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={cn(
                  "p-5 rounded-full border transition-all duration-500",
                  isLiked
                    ? "bg-red-500/20 border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.3)]"
                    : "bg-white/5 border-white/10 group-hover:bg-white/10"
                )}>
                  <Heart className={cn(
                    "h-7 w-7 transition-all duration-700",
                    isLiked ? "fill-red-500 text-red-500 scale-110" : "text-white/20"
                  )} />
                </div>
              </button>

              {/* CONTROLES NATIVOS DE AUDIO */}
              <div className="flex items-center gap-8 md:gap-14">
                <Button
                  onClick={() => skipBackward(15)}
                  variant="ghost" size="icon"
                  className="text-white/20 hover:text-white h-16 w-16 rounded-full transition-all hover:bg-white/5"
                >
                  <SkipBack size={32} />
                </Button>

                <Button
                  onClick={togglePlayPause}
                  size="icon"
                  disabled={isLoading}
                  className="w-28 h-28 rounded-full bg-white text-slate-950 hover:scale-105 active:scale-95 transition-all shadow-[0_0_80px_rgba(255,255,255,0.15)]"
                >
                  {isLoading ? (
                    <Loader2 className="h-14 w-14 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-16 w-16 fill-current" />
                  ) : (
                    <Play className="h-16 w-16 fill-current ml-2" />
                  )}
                </Button>

                <Button
                  onClick={() => skipForward(15)}
                  variant="ghost" size="icon"
                  className="text-white/20 hover:text-white h-16 w-16 rounded-full transition-all hover:bg-white/5"
                >
                  <SkipForward size={32} />
                </Button>
              </div>

              {/* ACCIONES DE EXPORTACIÓN */}
              <div className="flex gap-4">
                <button
                  onClick={handleShare}
                  className="p-5 rounded-full bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300"
                  aria-label="Compartir"
                >
                  <Share2 className="h-6 w-6 text-white/30" />
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!currentPodcast.audio_url}
                  className="p-5 rounded-full bg-white/5 border border-white/10 hover:bg-green-500/10 hover:border-green-500/40 transition-all duration-300 disabled:opacity-20"
                  aria-label="Descargar"
                >
                  <Download className="h-6 w-6 text-white/30" />
                </button>
              </div>
            </div>

            {/* CRÉDITOS DE AUTORÍA */}
            <div className="flex items-center justify-center gap-4 opacity-40 hover:opacity-80 transition-opacity duration-700">
              <div className="h-px w-10 bg-white/20" />
              <div className="flex items-center gap-3 bg-zinc-900 px-6 py-2.5 rounded-full border border-white/5 shadow-2xl">
                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-primary/40">
                  <Image
                    src={getSafeAsset(currentPodcast.profiles?.avatar_url, 'avatar')}
                    alt={authorName}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300">
                  Cronista: <span className="text-white">{authorName}</span>
                </span>
                <ExternalLink size={12} className="text-primary/60" />
              </div>
              <div className="h-px w-10 bg-white/20" />
            </div>

          </footer>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}