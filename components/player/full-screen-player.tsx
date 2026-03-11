// components/full-screen-player.tsx
// VERSIÓN: 25.0 (NicePod Immersive Engine - Atomic Sync Edition)
// Misión: Orquestar la experiencia cinemática de audio con resiliencia absoluta.
// [ESTABILIZACIÓN]: Sincronía atómica de estados y eliminación de efectos de memoria residual.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Download,
  Heart,
  Loader2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
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
import { ScriptViewer } from "components/podcast/script-viewer";

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

  // --- ESTADOS DE RENDIMIENTO (Sincronizados con el evento global) ---
  const [localTime, setLocalTime] = useState<number>(0);
  const [localDuration, setLocalDuration] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);

  /**
   * [SINCRO DE TIEMPO]: Escucha el evento global 'nicepod-timeupdate'.
   * Esto evita que el componente dependa de 'setInterval' costosos.
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
   * [SINCRO DE RESONANCIA]: Verifica el estado del 'Like' en montaje.
   */
  useEffect(() => {
    if (!user || !currentPodcast) return;

    async function checkLikeStatus() {
      const { data } = await supabase
        .from('likes')
        .select('id')
        .match({ user_id: user?.id, podcast_id: currentPodcast?.id })
        .maybeSingle();

      setIsLiked(!!data);
    }

    checkLikeStatus();
  }, [user, currentPodcast, supabase]);

  // Guardia de seguridad: Si no hay activo, cerramos inmersión.
  if (!currentPodcast) {
    collapsePlayer();
    return null;
  }

  // --- MANEJADORES DE ACCIÓN INDUSTRIAL ---

  const handleSliderChange = (value: number[]) => {
    const newTime = value[0];
    setLocalTime(newTime);
    seekTo(newTime);
  };

  const handleToggleLike = async () => {
    if (!user) {
      toast({ title: "Acceso Privado", description: "Inicia sesión para resonar.", variant: "destructive" });
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
      nicepodLog("🔥 [Like-Fail]:", err.message, 'error');
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/podcast/${currentPodcast.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: currentPodcast.title, url });
        await logInteractionEvent('shared');
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Enlace copiado al portapapeles" });
      }
    } catch {
      nicepodLog("Share protocol interrupted.");
    }
  };

  const handleDownload = async () => {
    if (!currentPodcast.audio_url) return;
    toast({ title: "Iniciando descarga..." });
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

  const coverImage = getSafeAsset(currentPodcast.cover_image_url, 'cover');
  const authorName = currentPodcast.profiles?.full_name || "Cronista Soberano";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed inset-0 z-[150] bg-zinc-950 flex flex-col overflow-hidden"
      >
        {/* ATMÓSFERA AURORA */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute -top-[10%] -left-[10%] w-[80%] h-[80%] bg-primary/20 rounded-full blur-[120px] animate-float" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[80%] h-[80%] bg-indigo-900/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative z-10 flex flex-col h-full max-w-screen-xl mx-auto w-full">
          {/* HEADER */}
          <header className="flex items-center justify-between p-6 md:p-10 flex-shrink-0">
            <Button onClick={collapsePlayer} variant="ghost" size="icon" className="text-white/30 hover:text-white rounded-full h-12 w-12">
              <ChevronDown className="h-8 w-8" />
            </Button>
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">Sincronía Nominal Activa</span>
              <h2 className="font-bold text-xs text-white/90 uppercase tracking-[0.2em] italic truncate max-w-[200px]">{currentPodcast.title}</h2>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5"><Volume2 className="h-5 w-5 text-primary/60" /></div>
          </header>

          {/* MAIN STAGE */}
          <main className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-12 px-6 md:px-12 items-center">
            <div className="hidden md:flex flex-col items-center justify-center space-y-8">
              <div className="relative w-full max-w-sm aspect-square shadow-[0_0_80px_rgba(0,0,0,0.5)] rounded-[3.5rem] overflow-hidden border border-white/10">
                <Image src={coverImage} alt={currentPodcast.title} fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
            </div>
            <div className="flex-1 h-full w-full bg-black/40 border border-white/5 rounded-[3rem] relative shadow-2xl backdrop-blur-2xl overflow-hidden">
              <div className="h-full w-full p-8 md:p-14 overflow-y-auto custom-scrollbar-hide">
                <ScriptViewer scriptText={currentPodcast.script_text} />
              </div>
            </div>
          </main>

          {/* FOOTER: CONTROLES */}
          <footer className="p-8 md:p-12 space-y-12">
            <div className="space-y-5">
              <Slider value={[localTime]} max={localDuration || 100} step={0.1} onValueChange={handleSliderChange} />
              <div className="flex justify-between text-[11px] font-black text-white/30 tracking-[0.2em] uppercase">
                <span>{formatTime(localTime)}</span>
                <span>{formatTime(localDuration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between px-4">
              <button onClick={handleToggleLike} className={cn("p-5 rounded-full transition-all", isLiked ? "bg-red-500/20" : "bg-white/5")}>
                <Heart className={cn("h-7 w-7", isLiked ? "fill-red-500 text-red-500" : "text-white/20")} />
              </button>
              <div className="flex items-center gap-8">
                <Button onClick={() => skipBackward(15)} variant="ghost" size="icon" className="h-16 w-16 rounded-full"><SkipBack size={32} /></Button>
                <Button onClick={togglePlayPause} size="icon" className="w-28 h-28 rounded-full bg-white text-black hover:scale-105">
                  {isLoading ? <Loader2 className="animate-spin" /> : isPlaying ? <Pause className="h-16 w-16" /> : <Play className="h-16 w-16 ml-2" />}
                </Button>
                <Button onClick={() => skipForward(15)} variant="ghost" size="icon" className="h-16 w-16 rounded-full"><SkipForward size={32} /></Button>
              </div>
              <button onClick={handleDownload} className="p-5 rounded-full bg-white/5 border border-white/10 hover:bg-green-500/10">
                <Download className="h-6 w-6 text-white/30" />
              </button>
            </div>
          </footer>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}