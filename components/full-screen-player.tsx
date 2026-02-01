// components/full-screen-player.tsx
// VERSIÓN: 23.0 (Madrid Resonance - Inmersive Master - Zero Errors)

"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAudio } from "@/contexts/audio-context";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn, formatTime, getSafeAsset } from "@/lib/utils";
import { motion } from "framer-motion";
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
import { ScriptViewer } from "./script-viewer";

/**
 * COMPONENTE: FullScreenPlayer
 * Orquestador de la experiencia visual y auditiva a pantalla completa.
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
  const [localTime, setLocalTime] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  /**
   * SINCRONIZACIÓN DE TIEMPO (High Frequency)
   * Escucha eventos de Window para actualizar progreso sin re-renderizar el árbol global.
   */
  useEffect(() => {
    const handleSync = (e: any) => {
      const { currentTime, duration } = e.detail;
      setLocalTime(currentTime);
      if (duration && duration !== localDuration) setLocalDuration(duration);
    };

    window.addEventListener('nicepod-timeupdate', handleSync);
    return () => window.removeEventListener('nicepod-timeupdate', handleSync);
  }, [localDuration]);

  /**
   * VERIFICACIÓN DE ESTADO DE RESOSNANCIA
   */
  useEffect(() => {
    if (!user || !currentPodcast) return;

    async function checkLikeStatus() {
      const { data } = await supabase
        .from('likes')
        .select('*')
        .match({ user_id: user?.id, podcast_id: currentPodcast?.id })
        .single();

      setIsLiked(!!data);
    }

    checkLikeStatus();
  }, [user, currentPodcast, supabase]);

  // Si no hay podcast cargado, el componente es invisible.
  if (!currentPodcast) return null;

  // --- MANEJADORES DE ACCIÓN ---

  const handleSliderChange = (value: number[]) => {
    const newTime = value[0];
    setLocalTime(newTime);
    seekTo(newTime);
  };

  const handleToggleLike = async () => {
    if (!user) {
      toast({ title: "Acceso Privado", description: "Inicia sesión para anclar tu resonancia.", variant: "destructive" });
      return;
    }

    setIsLiking(true);
    try {
      if (isLiked) {
        setIsLiked(false);
        await supabase.from('likes').delete().match({ user_id: user.id, podcast_id: currentPodcast.id });
      } else {
        setIsLiked(true);
        await supabase.from('likes').insert({ user_id: user.id, podcast_id: currentPodcast.id });
        // Sincronización con AudioContext 3.0: 1 argumento
        await logInteractionEvent('liked');
        toast({ title: "Resonancia Registrada" });
      }
    } catch (err) {
      console.error("Like error:", err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: currentPodcast.title,
      text: `Escucha "${currentPodcast.title}" en la malla NicePod`,
      url: `${window.location.origin}/podcast/${currentPodcast.id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        await logInteractionEvent('shared');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({ title: "Enlace Copiado" });
      }
    } catch (err) { console.warn("Share failed"); }
  };

  const handleDownload = async () => {
    if (!currentPodcast.audio_url) return;
    toast({ title: "Preparando descarga..." });
    try {
      const response = await fetch(currentPodcast.audio_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nicepod-${currentPodcast.title}.webm`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast({ title: "Fallo de descarga", variant: "destructive" });
    }
  };

  // --- PREPARACIÓN DE ASSETS ---
  const coverImage = getSafeAsset(currentPodcast.cover_image_url, 'cover');
  const authorName = currentPodcast.profiles?.full_name || "Cronista de NicePod";

  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[150] bg-slate-950 flex flex-col overflow-hidden"
    >
      {/* CAPA ATMOSFÉRICA (AURORA) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-[10%] -left-[10%] w-[70%] h-[70%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[70%] h-[70%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative z-10 flex flex-col h-full max-w-screen-xl mx-auto w-full">

        {/* HEADER: NAVEGACIÓN Y ESTADO */}
        <header className="flex items-center justify-between p-6 md:p-10 flex-shrink-0">
          <Button
            onClick={collapsePlayer}
            variant="ghost"
            size="icon"
            className="text-white/40 hover:text-white hover:bg-white/10 rounded-full h-12 w-12 transition-all active:scale-90"
          >
            <ChevronDown className="h-8 w-8" />
          </Button>

          <div className="flex flex-col items-center text-center px-4 overflow-hidden">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-1">
              Frecuencia Inmersiva
            </span>
            <h2 className="font-bold text-xs md:text-sm text-white/80 truncate w-full max-w-[200px] md:max-w-md uppercase tracking-widest">
              {currentPodcast.title}
            </h2>
          </div>

          <div className="bg-white/5 p-2.5 rounded-full border border-white/5">
            <Volume2 className="h-5 w-5 text-white/30" />
          </div>
        </header>

        {/* ÁREA DE CONTENIDO (SPLIT VIEW) */}
        <main className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-2 gap-8 px-6 md:px-12 items-center">

          {/* LADO A: IDENTIDAD VISUAL */}
          <div className="hidden md:flex flex-col items-center justify-center space-y-8">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="relative w-full max-w-sm aspect-square shadow-2xl rounded-[3rem] overflow-hidden border border-white/10 bg-zinc-900"
            >
              <Image src={coverImage} alt="" fill className="object-cover opacity-90 transition-transform duration-700 hover:scale-105" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </motion.div>

            <div className="flex flex-col items-center gap-2">
              <div className="bg-primary/10 px-4 py-1 rounded-full border border-primary/20 flex items-center gap-2">
                <Sparkles size={12} className="text-primary" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Garantía de Resonancia NicePod</span>
              </div>
            </div>
          </div>

          {/* LADO B: NARRATIVA (TELEPROMPTER) */}
          <div className="flex-1 md:h-full w-full bg-white/[0.02] border border-white/5 rounded-[2.5rem] relative overflow-hidden shadow-inner backdrop-blur-md">
            {/* Gradientes de focalización */}
            <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-slate-950 z-20 pointer-events-none" />

            <div className="h-full w-full p-8 md:p-12 overflow-y-auto custom-scrollbar-hide">
              {/* [FIX]: Sincronización con ScriptViewer (Propiedades estándar) */}
              <ScriptViewer
                scriptText={currentPodcast.script_text}
              />
            </div>

            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-slate-950 z-20 pointer-events-none" />
          </div>
        </main>

        {/* FOOTER: CONSOLA DE OPERACIONES */}
        <footer className="p-8 md:p-12 flex-shrink-0 w-full max-w-4xl mx-auto space-y-10">

          {/* BARRA DE PROGRESO */}
          <div className="space-y-4">
            <Slider
              value={[localTime]}
              max={localDuration || 100}
              step={0.1}
              onValueChange={handleSliderChange}
              className="cursor-pointer"
            />
            <div className="flex justify-between items-center text-[10px] font-black font-mono text-white/40 tracking-tighter uppercase">
              <span className="bg-white/5 px-2 py-1 rounded border border-white/5">{formatTime(localTime)}</span>
              <div className="h-px flex-1 mx-6 bg-white/5" />
              <span className="bg-white/5 px-2 py-1 rounded border border-white/5">{formatTime(localDuration)}</span>
            </div>
          </div>

          {/* BOTONERA TÁCTICA */}
          <div className="flex items-center justify-between px-2">

            {/* ACCIÓN: LIKE */}
            <button
              onClick={handleToggleLike}
              disabled={isLiking}
              className="group flex flex-col items-center transition-all"
              aria-label="Dar resonancia"
            >
              <div className={cn(
                "p-5 rounded-full border transition-all duration-300",
                isLiked ? "bg-red-500/10 border-red-500/40 shadow-lg shadow-red-900/10" : "bg-white/5 border-white/10 group-hover:bg-white/10"
              )}>
                <Heart className={cn("h-7 w-7 transition-all duration-500", isLiked ? "fill-red-500 text-red-500 scale-110" : "text-white/30")} />
              </div>
            </button>

            {/* CONTROLES DE REPRODUCCIÓN */}
            <div className="flex items-center gap-6 md:gap-10">
              <Button
                onClick={() => skipBackward(15)}
                variant="ghost" size="icon"
                className="text-white/30 hover:text-white h-14 w-14 rounded-full transition-all"
              >
                <SkipBack size={28} />
              </Button>

              <Button
                onClick={togglePlayPause}
                size="icon"
                disabled={isLoading}
                className="w-24 h-24 rounded-full bg-white text-slate-950 hover:scale-105 active:scale-95 transition-all shadow-[0_0_60px_rgba(255,255,255,0.1)]"
              >
                {isLoading ? (
                  <Loader2 className="h-12 w-12 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-14 w-14 fill-current" />
                ) : (
                  <Play className="h-14 w-14 fill-current ml-2" />
                )}
              </Button>

              <Button
                onClick={() => skipForward(15)}
                variant="ghost" size="icon"
                className="text-white/30 hover:text-white h-14 w-14 rounded-full transition-all"
              >
                <SkipForward size={28} />
              </Button>
            </div>

            {/* ACCIONES SECUNDARIAS */}
            <div className="flex gap-4">
              <button
                onClick={handleShare}
                className="p-5 rounded-full bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/40 transition-all group"
                aria-label="Compartir"
              >
                <Share2 className="h-6 w-6 text-white/30 group-hover:text-primary transition-colors" />
              </button>
              <button
                onClick={handleDownload}
                disabled={!currentPodcast.audio_url}
                className="p-5 rounded-full bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/40 transition-all group disabled:opacity-20"
                aria-label="Descargar"
              >
                <Download className="h-6 w-6 text-white/30 group-hover:text-primary transition-colors" />
              </button>
            </div>
          </div>

          {/* CRÉDITOS SOCIALES */}
          <div className="flex items-center justify-center gap-5 pt-4">
            <div className="flex items-center gap-3 bg-zinc-900/80 px-5 py-2.5 rounded-2xl border border-white/5 shadow-xl">
              <div className="relative w-7 h-7 rounded-full overflow-hidden border border-primary/20">
                <Image src={getSafeAsset(currentPodcast.profiles?.avatar_url, 'avatar')} alt="" fill className="object-cover" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                Resonando con <span className="text-white/80">{authorName}</span>
              </span>
              <ExternalLink size={12} className="text-zinc-700" />
            </div>
          </div>

        </footer>
      </div>
    </motion.div>
  );
}