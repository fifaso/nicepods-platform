// components/player/full-screen-player.tsx
// VERSIÓN: 27.0 (NicePod Inmersive Stage - Studio Mastery Edition)
// Misión: Orquestar la inmersión total con teleprompter síncrono y controles de alta fidelidad.
// [ESTABILIZACIÓN]: Resolución definitiva de errores de ámbito (handleSeek) y optimización de Layout Desktop.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Download,
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
import { ScriptViewer } from "@/components/podcast/script-viewer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAudio } from "@/contexts/audio-context";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn, formatTime, getSafeAsset, nicepodLog } from "@/lib/utils";

/**
 * FullScreenPlayer: La terminal de inmersión definitiva.
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

  // --- TELEMETRÍA DE REPRODUCCIÓN (Sincronía de Hardware) ---
  const [localTime, setLocalTime] = useState<number>(0);
  const [localDuration, setLocalDuration] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);

  /**
   * 1. SINCRO DE TIEMPO (Nerve System)
   * Capturamos el latido del motor de audio global para alimentar la barra de progreso.
   */
  useEffect(() => {
    const handleSync = (event: Event) => {
      const customEvent = event as CustomEvent<{ currentTime: number; duration: number }>;
      const { currentTime, duration } = customEvent.detail;

      setLocalTime(currentTime);
      if (duration > 0 && duration !== localDuration) {
        setLocalDuration(duration);
      }
    };

    window.addEventListener('nicepod-timeupdate', handleSync as EventListener);
    return () => window.removeEventListener('nicepod-timeupdate', handleSync as EventListener);
  }, [localDuration]);

  /**
   * 2. VERIFICACIÓN DE RESONANCIA (Bóveda de Likes)
   */
  useEffect(() => {
    if (!user || !currentPodcast) return;
    const checkLike = async () => {
      const { data } = await supabase
        .from('likes')
        .select('id')
        .match({ user_id: user.id, podcast_id: currentPodcast.id })
        .maybeSingle();
      setIsLiked(!!data);
    };
    checkLike();
  }, [user, currentPodcast, supabase]);

  // Guardia de Seguridad: Evita el renderizado ante estados nulos del contexto.
  if (!currentPodcast) return null;

  // --- MANEJADORES DE ACCIÓN (Saneados y Completos) ---

  /**
   * handleSeek: Sincroniza la posición del audio con el gesto del usuario.
   * [FIX]: Nombre unificado para resolver error ts(2304).
   */
  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setLocalTime(newTime);
    seekTo(newTime);
  };

  const handleToggleLike = async () => {
    if (!user || isLiking) return;
    setIsLiking(true);
    try {
      if (isLiked) {
        setIsLiked(false);
        await supabase.from('likes').delete().match({ user_id: user.id, podcast_id: currentPodcast.id });
      } else {
        setIsLiked(true);
        await supabase.from('likes').insert({ user_id: user.id, podcast_id: currentPodcast.id });
        toast({ title: "Resonancia Registrada" });
      }
    } catch (err: any) {
      nicepodLog("🔥 [Like-Fail]", err.message, 'error');
    } finally { setIsLiking(false); }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/podcast/${currentPodcast.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: currentPodcast.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Enlace copiado" });
      }
    } catch { nicepodLog("Share error"); }
  };

  const handleDownload = async () => {
    if (!currentPodcast.audio_url) return;
    toast({ title: "Preparando activo..." });
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
    } catch { toast({ title: "Error en descarga", variant: "destructive" }); }
  };

  const coverImage = getSafeAsset(currentPodcast.cover_image_url, 'cover');
  const authorName = currentPodcast.profiles?.full_name || "Cronista NicePod";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 35, stiffness: 300 }}
        className="fixed inset-0 z-[150] bg-[#020202] flex flex-col overflow-hidden"
      >
        {/* FONDO AURORA (Optimización de Inmersión) */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute -top-[20%] -left-[10%] w-[100%] h-[100%] bg-primary/10 rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 flex flex-col h-full w-full max-w-screen-2xl mx-auto">

          {/* CABECERA TÉCNICA */}
          <header className="flex items-center justify-between p-6 md:p-10">
            <Button onClick={collapsePlayer} variant="ghost" size="icon" className="text-white/20 hover:text-white rounded-full h-12 w-12 transition-all">
              <ChevronDown className="h-8 w-8" />
            </Button>

            <div className="flex-1 px-8 overflow-hidden text-center flex flex-col items-center">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/60 mb-2">Sincronía Nominal Activa</span>
              <div className="w-full max-w-md overflow-hidden">
                <motion.h2
                  animate={currentPodcast.title.length > 25 ? { x: [0, -150, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                  className="font-black text-xs md:text-sm text-white uppercase italic tracking-[0.2em] whitespace-nowrap"
                >
                  {currentPodcast.title}
                </motion.h2>
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
              <Volume2 className="h-5 w-5 text-primary/40" />
            </div>
          </header>

          {/* CUERPO PRINCIPAL (Layout Dual) */}
          <main className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 px-6 md:px-16 items-center">

            {/* ÁREA VISUAL */}
            <div className="hidden md:flex flex-col items-center justify-center space-y-10">
              <div className="relative w-full max-w-sm aspect-square shadow-[0_40px_100px_rgba(0,0,0,0.8)] rounded-[3.5rem] overflow-hidden border border-white/10">
                <Image src={coverImage} alt="" fill className="object-cover opacity-80" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="flex items-center gap-3 bg-primary/5 px-6 py-2.5 rounded-full border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Resonancia Inteligente</span>
              </div>
            </div>

            {/* ÁREA NARRATIVA (Teleprompter) */}
            <div className="h-full w-full bg-zinc-900/40 rounded-[2.5rem] border border-white/5 relative overflow-hidden shadow-inner group">
              <ScriptViewer
                scriptText={currentPodcast.script_text}
                duration={localDuration}
                className="no-scrollbar"
              />
              <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#020202] to-transparent z-20 pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#020202] to-transparent z-20 pointer-events-none" />
            </div>
          </main>

          {/* PIE DE PÁGINA: TERMINAL DE CONTROL */}
          <footer className="p-8 md:p-14 space-y-10 md:space-y-14">

            {/* PROGRESO */}
            <div className="space-y-5 max-w-4xl mx-auto">
              <Slider
                value={[localTime]}
                max={localDuration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="cursor-pointer"
              />
              <div className="flex justify-between items-center text-[11px] font-black font-mono text-white/20 tracking-[0.2em] px-1">
                <span className="bg-white/5 px-3 py-1 rounded-lg">{formatTime(localTime)}</span>
                <div className="h-px flex-1 mx-10 bg-white/5" />
                <span className="bg-white/5 px-3 py-1 rounded-lg">{formatTime(localDuration)}</span>
              </div>
            </div>

            {/* CONTROLES CENTRALES */}
            <div className="flex items-center justify-between max-w-4xl mx-auto w-full px-4 md:px-0">

              <Button
                onClick={handleToggleLike}
                variant="ghost"
                className={cn("h-14 w-14 rounded-full border transition-all", isLiked ? "bg-primary/20 border-primary/40" : "bg-white/5 border-white/5")}
              >
                <Heart className={cn("h-6 w-6 transition-all duration-500", isLiked ? "fill-primary text-primary scale-110" : "text-white/20")} />
              </Button>

              <div className="flex items-center gap-8 md:gap-14">
                <Button onClick={() => skipBackward(15)} variant="ghost" className="text-white/30 hover:text-white transition-all">
                  <SkipBack size={28} />
                </Button>

                <Button
                  onClick={togglePlayPause}
                  disabled={isLoading}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                >
                  {isLoading ? (
                    <Loader2 className="h-10 w-10 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-10 w-10 fill-current" />
                  ) : (
                    <Play className="h-10 w-10 fill-current ml-1.5" />
                  )}
                </Button>

                <Button onClick={() => skipForward(15)} variant="ghost" className="text-white/30 hover:text-white transition-all">
                  <SkipForward size={28} />
                </Button>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleShare} variant="ghost" className="h-14 w-14 rounded-full bg-white/5 border border-white/5 text-white/30 hover:text-white">
                  <Share2 size={20} />
                </Button>
                <Button onClick={handleDownload} variant="ghost" className="h-14 w-14 rounded-full bg-white/5 border border-white/10 text-white/30 hover:text-white hidden sm:flex">
                  <Download size={20} />
                </Button>
              </div>
            </div>

            <div className="flex justify-center items-center gap-4 opacity-20">
              <div className="h-px w-8 bg-white/40" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Cronista: {authorName}</span>
              <div className="h-px w-8 bg-white/40" />
            </div>
          </footer>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V27.0):
 * 1. Reparación de Nomenclatura: Se unificó el manejador de Slider como 'handleSeek', eliminando 
 *    el error ts(2304) de referencia inexistente.
 * 2. Estabilidad de Callbacks: Las funciones 'handleShare' y 'handleDownload' han sido 
 *    re-inyectadas al cuerpo principal, asegurando operatividad total de exportación.
 * 3. Diseño Spotify Premium: Se ha recalibrado la escala de los botones de control 
 *    centrales (w-20 en móvil, w-24 en desktop) para una ergonomía superior.
 * 4. Integridad de Sincronía: El componente 'ScriptViewer' recibe la 'duration' real 
 *    extraída del evento nativo del navegador, habilitando el resaltado cinemático.
 */