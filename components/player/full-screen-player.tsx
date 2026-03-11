// components/player/full-screen-player.tsx
// VERSIÓN: 28.0 (NicePod Immersive Stage - Industrial Studio Standard)
// Misión: Proveer una terminal de escucha de alta fidelidad, síncrona y ergonómica.
// [ESTABILIZACIÓN]: Rediseño total de la malla de control y motor de teleprompter activo.

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
    logInteractionEvent,
    audioRef
  } = useAudio();

  const { supabase, user } = useAuth();
  const { toast } = useToast();

  // --- TELEMETRÍA DE ALTA FRECUENCIA ---
  const [localTime, setLocalTime] = useState<number>(0);
  const [localDuration, setLocalDuration] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);

  /**
   * [MOTOR DE SINCRO V5.0]: 
   * Captura el pulso del hardware de audio. Si la duración en DB es nula,
   * el sistema la extrae directamente del objeto de audio nativo.
   */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const syncInternal = () => {
      setLocalTime(audio.currentTime);
      if (audio.duration && audio.duration !== localDuration) {
        setLocalDuration(audio.duration);
      }
    };

    audio.addEventListener('timeupdate', syncInternal);
    return () => audio.removeEventListener('timeupdate', syncInternal);
  }, [audioRef, localDuration]);

  /**
   * [VERIFICACIÓN DE RESONANCIA]
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

  if (!currentPodcast) return null;

  // --- MANEJADORES DE ACCIÓN ---

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

  const coverImage = getSafeAsset(currentPodcast.cover_image_url, 'cover');
  const authorName = currentPodcast.profiles?.full_name || "Cronista NicePod";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
        className="fixed inset-0 z-[200] bg-[#020202] flex flex-col overflow-hidden"
      >
        {/* --- CAPA 0: ATMÓSFERA AURORA --- */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-indigo-950/20 blur-[120px]" />
        </div>

        <div className="relative z-10 flex flex-col h-full w-full max-w-screen-2xl mx-auto">

          {/* --- CAPA 1: CABECERA DE CONTROL --- */}
          <header className="flex items-center justify-between p-6 md:p-10 flex-shrink-0">
            <Button
              onClick={collapsePlayer}
              variant="ghost"
              className="text-white/20 hover:text-white hover:bg-white/5 rounded-full h-14 w-14 transition-all"
            >
              <ChevronDown className="h-10 w-10" />
            </Button>

            <div className="flex flex-col items-center text-center overflow-hidden px-4">
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-primary/80 mb-2 animate-pulse">Sincronía Nominal Activa</span>
              <div className="max-w-[280px] md:max-w-xl overflow-hidden">
                <motion.h2
                  animate={currentPodcast.title.length > 30 ? { x: [0, -200, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                  className="font-black text-sm md:text-lg text-white uppercase italic tracking-[0.1em] whitespace-nowrap"
                >
                  {currentPodcast.title}
                </motion.h2>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner">
              <Volume2 className="h-6 w-6 text-primary/40" />
            </div>
          </header>

          {/* --- CAPA 2: ESCENARIO PRINCIPAL (DENSITY GRID) --- */}
          <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 px-6 md:px-14 items-center">

            {/* IZQUIERDA: ARTE VISUAL (5 Columnas) */}
            <div className="hidden lg:flex lg:col-span-5 flex-col items-center justify-center space-y-12">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative w-full max-w-md aspect-square shadow-[0_50px_100px_rgba(0,0,0,0.9)] rounded-[4rem] overflow-hidden border border-white/10"
              >
                <Image src={coverImage} alt="" fill className="object-cover opacity-90" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </motion.div>

              <div className="flex items-center gap-4 bg-primary/5 px-8 py-4 rounded-3xl border border-primary/20 backdrop-blur-3xl shadow-2xl">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-300">Resonancia Neural Activa</span>
              </div>
            </div>

            {/* DERECHA: TELEPROMPTER NARRATIVO (7 Columnas) */}
            <div className="lg:col-span-7 h-full w-full bg-[#050505]/60 rounded-[3.5rem] border border-white/5 relative overflow-hidden shadow-2xl group">
              {/* Desvanecimiento superior/inferior para enfoque central */}
              <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#020202] to-transparent z-20 pointer-events-none" />

              <div className="h-full w-full overflow-hidden">
                <ScriptViewer
                  scriptText={currentPodcast.script_text}
                  duration={localDuration}
                  className="px-10 md:px-16"
                />
              </div>

              <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#020202] to-transparent z-20 pointer-events-none" />
            </div>
          </main>

          {/* --- CAPA 3: DOCK DE CONTROL (TELEMETRÍA) --- */}
          <footer className="p-10 md:p-16 space-y-10 md:space-y-14 flex-shrink-0 bg-gradient-to-t from-black/80 to-transparent">

            {/* BARRA DE AVANCE TÉCNICO */}
            <div className="max-w-5xl mx-auto w-full space-y-6">
              <Slider
                value={[localTime]}
                max={localDuration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="cursor-pointer"
              />
              <div className="flex justify-between items-center text-[12px] font-black font-mono text-white/30 tracking-[0.3em] uppercase px-2">
                <span className="bg-white/5 px-4 py-1.5 rounded-xl border border-white/5 shadow-inner text-primary">
                  {formatTime(localTime)}
                </span>
                <div className="h-px flex-1 mx-12 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="bg-white/5 px-4 py-1.5 rounded-xl border border-white/5 shadow-inner">
                  {formatTime(localDuration)}
                </span>
              </div>
            </div>

            {/* PANEL DE MANDOS ERGONÓMICO */}
            <div className="flex items-center justify-between max-w-5xl mx-auto w-full">

              {/* RESONANCIA SOCIAL */}
              <Button
                onClick={handleToggleLike}
                variant="ghost"
                className={cn(
                  "h-16 w-16 rounded-full border transition-all duration-500",
                  isLiked ? "bg-red-500/10 border-red-500/40 shadow-2xl" : "bg-white/5 border-white/5 hover:bg-white/10"
                )}
              >
                <Heart className={cn("h-7 w-7 transition-all duration-700", isLiked ? "fill-red-500 text-red-500 scale-110" : "text-white/20")} />
              </Button>

              {/* MANDOS NATIVOS ACÚSTICOS */}
              <div className="flex items-center gap-10 md:gap-20">
                <Button onClick={() => skipBackward(15)} variant="ghost" className="text-white/20 hover:text-white transition-all scale-125">
                  <SkipBack size={36} />
                </Button>

                <Button
                  onClick={togglePlayPause}
                  disabled={isLoading}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_60px_rgba(255,255,255,0.2)]"
                >
                  {isLoading ? (
                    <Loader2 className="h-12 w-12 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-14 w-14 fill-current" />
                  ) : (
                    <Play className="h-14 w-14 fill-current ml-2" />
                  )}
                </Button>

                <Button onClick={() => skipForward(15)} variant="ghost" className="text-white/20 hover:text-white transition-all scale-125">
                  <SkipForward size={36} />
                </Button>
              </div>

              {/* EXPORTACIÓN */}
              <div className="flex gap-4">
                <Button variant="ghost" className="h-16 w-16 rounded-full bg-white/5 border border-white/5 text-white/20 hover:text-white">
                  <Share2 size={24} />
                </Button>
                <Button variant="ghost" className="h-16 w-16 rounded-full bg-white/5 border border-white/5 text-white/20 hover:text-white hidden lg:flex">
                  <Download size={24} />
                </Button>
              </div>
            </div>

            {/* CRÉDITOS DE SOBERANÍA */}
            <div className="flex justify-center items-center gap-6 opacity-20 group hover:opacity-100 transition-opacity duration-1000">
              <div className="h-px w-20 bg-white/40" />
              <div className="flex items-center gap-3">
                <div className="relative h-6 w-6 rounded-full overflow-hidden border border-primary/40">
                  <Image src={getSafeAsset(currentPodcast.profiles?.avatar_url, 'avatar')} alt="" fill className="object-cover" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white italic">
                  Cronista: <span className="text-primary">{authorName}</span>
                </span>
              </div>
              <div className="h-px w-20 bg-white/40" />
            </div>
          </footer>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V28.0):
 * 1. Sincronía por Hardware: Se eliminó la dependencia de CustomEvents para el tiempo. 
 *    Ahora el componente lee directamente del 'audioRef.current' nativo, resolviendo 
 *    la parálisis de la barra de progreso.
 * 2. Densidad Industrial: Se aplicó un layout de 12 columnas para Desktop, donde el 
 *    guion es el protagonista absoluto. Se inyectaron degradados de profundidad 
 *    para mejorar el contraste del teleprompter.
 * 3. Erradicación de Deformidad: Los botones tienen tamaños 'px' fijos dentro de 
 *    un contenedor 'flex-between', garantizando su forma circular perfecta 
 *    independientemente del ancho de la pantalla.
 */