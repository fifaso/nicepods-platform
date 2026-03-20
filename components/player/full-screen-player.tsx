// components/player/full-screen-player.tsx
// VERSIÓN: 30.0 (NicePod Studio - High Contrast & Performance Edition)
// Misión: Orquestar inmersión total con legibilidad industrial y sincronía de hardware.
// [ESTABILIZACIÓN]: Resolución de ceguera de contraste y optimización de Main Thread.

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
import { useEffect, useState, useMemo, useCallback, useRef } from "react";

// --- INFRAESTRUCTURA NICEPOD ---
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAudio } from "@/contexts/audio-context";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn, formatTime, getSafeAsset, nicepodLog } from "@/lib/utils";
import { ScriptViewer } from "@/components/podcast/script-viewer";

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

  const { supabase, user, profile } = useAuth();
  const { toast } = useToast();

  // --- REFERENCIAS DE HARDWARE (Zero-Wait Sync) ---
  const [localTime, setLocalTime] = useState<number>(0);
  const [localDuration, setLocalDuration] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);

  /**
   * 1. PROTOCOLO DE SINCRONÍA POR HARDWARE (60FPS)
   * Capturamos el evento nativo para actualizar el Slider sin despertar a todo el árbol de React.
   */
  useEffect(() => {
    const handleSync = (event: Event) => {
      const customEvent = event as CustomEvent<{ currentTime: number; duration: number }>;
      const { currentTime, duration } = customEvent.detail;
      
      // Solo actualizamos el estado local para el Slider.
      // El ScriptViewer ya se suscribe internamente al mismo evento para su propia lógica.
      setLocalTime(currentTime);
      if (duration > 0 && duration !== localDuration) {
        setLocalDuration(duration);
      }
    };

    window.addEventListener('nicepod-timeupdate', handleSync as EventListener);
    return () => window.removeEventListener('nicepod-timeupdate', handleSync as EventListener);
  }, [localDuration]);

  /**
   * 2. VERIFICACIÓN DE RESONANCIA (Like Status)
   */
  useEffect(() => {
    if (!user || !currentPodcast?.id) return;

    const checkLikeStatus = async () => {
      try {
        const { data } = await supabase
          .from('likes')
          .select('id')
          .match({ user_id: user.id, podcast_id: currentPodcast.id })
          .maybeSingle();
        setIsLiked(!!data);
      } catch (err) {
        nicepodLog("Falla en verificación de Bóveda", err, 'error');
      }
    };
    
    checkLikeStatus();
  }, [user, currentPodcast?.id, supabase]);

  if (!currentPodcast) return null;

  // --- MANEJADORES DE ACCIÓN ---

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setLocalTime(newTime);
    seekTo(newTime);
  };

  const handleToggleLike = async () => {
    if (!user || !currentPodcast?.id || isLiking) return;
    setIsLiking(true);
    const originalState = isLiked;
    setIsLiked(!originalState); // Optimistic UI update

    try {
      if (originalState) {
        await supabase.from('likes').delete().match({ user_id: user.id, podcast_id: currentPodcast.id });
      } else {
        await supabase.from('likes').insert({ user_id: user.id, podcast_id: currentPodcast.id });
        await logInteractionEvent('liked');
        toast({ title: "Resonancia Registrada", className: "bg-primary text-white border-none" });
      }
    } catch (err: any) {
      setIsLiked(originalState); // Rollback
      nicepodLog("🔥 [Social-Fail]", err.message, 'error');
    } finally { setIsLiking(false); }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/podcast/${currentPodcast.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: currentPodcast.title, url });
        await logInteractionEvent('shared');
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Enlace copiado al sector de memoria." });
      }
    } catch { nicepodLog("Share protocol interrupted."); }
  };

  const coverImage = getSafeAsset(currentPodcast.cover_image_url, 'cover');
  const authorName = currentPodcast.profiles?.full_name || profile?.full_name || "Cronista Soberano";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
        className="fixed inset-0 z-[200] bg-[#020202] flex flex-col overflow-hidden selection:bg-primary/30"
      >
        {/* FONDO AURORA (Calibración de Contraste) */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-indigo-950/30 blur-[150px]" />
        </div>

        <div className="relative z-10 flex flex-col h-full w-full max-w-screen-2xl mx-auto">
          
          {/* --- ZONA 1: HEADER (Mando y Control) --- */}
          <header className="flex items-center justify-between p-6 md:p-10 flex-shrink-0">
            <Button 
              onClick={collapsePlayer} 
              variant="ghost" 
              size="icon" 
              className="text-zinc-500 hover:text-white hover:bg-white/5 rounded-full h-14 w-14 transition-all"
            >
              <ChevronDown className="h-10 w-10" />
            </Button>

            <div className="flex flex-col items-center text-center overflow-hidden px-4">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/80 mb-2 animate-pulse">
                Sincronía Nominal Activa
              </span>
              <h2 className="max-w-[240px] md:max-w-xl font-black text-xs md:text-sm text-zinc-400 uppercase tracking-widest truncate italic">
                {currentPodcast.title}
              </h2>
            </div>

            <div className="h-14 w-14 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5 shadow-inner">
              <Volume2 className="h-6 w-6 text-primary" />
            </div>
          </header>

          {/* --- ZONA 2: ESCENARIO (Alta Fidelidad) --- */}
          <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 px-6 md:px-14 items-center overflow-hidden">
            
            {/* COLUMNA IZQUIERDA: EVIDENCIA VISUAL (5 Cols) */}
            <div className="hidden lg:flex lg:col-span-5 flex-col items-center justify-center space-y-12">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="relative w-full max-w-sm aspect-square shadow-[0_50px_100px_rgba(0,0,0,0.9)] rounded-[3rem] overflow-hidden border-2 border-white/10"
              >
                <Image src={coverImage} alt={currentPodcast.title} fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </motion.div>
              
              <div className="flex items-center gap-4 bg-zinc-900/50 px-8 py-4 rounded-3xl border border-white/10 backdrop-blur-3xl shadow-2xl">
                 <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                 <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-100">
                   Neural Link: {profile?.role === 'admin' ? 'Administrador' : 'Voyager'}
                 </span>
              </div>
            </div>

            {/* COLUMNA DERECHA: CÁMARA NARRATIVA (7 Cols) */}
            {/* [MEJORA CRÍTICA]: Se aumentó el contraste del fondo para legibilidad total */}
            <div className="lg:col-span-7 h-full w-full bg-[#080808] rounded-[3.5rem] border border-white/10 relative overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
              {/* Máscaras de fundido para el Teleprompter */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#080808] to-transparent z-20 pointer-events-none" />
              
              <div className="h-full w-full">
                <ScriptViewer 
                  scriptText={currentPodcast.script_text} 
                  duration={currentPodcast.duration_seconds || localDuration}
                  className="px-8 md:px-16" 
                />
              </div>

              <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#080808] to-transparent z-20 pointer-events-none" />
            </div>
          </main>

          {/* --- ZONA 3: DOCK DE TELEMETRÍA (Footer) --- */}
          <footer className="p-8 md:p-12 space-y-10 flex-shrink-0">
            
            {/* BARRA DE PROGRESO INDUSTRIAL */}
            <div className="max-w-4xl mx-auto w-full space-y-6">
              <Slider 
                value={[localTime]} 
                max={currentPodcast.duration_seconds || localDuration || 100} 
                step={0.1} 
                onValueChange={handleSeek} 
                className="cursor-pointer" 
              />
              <div className="flex justify-between items-center text-[11px] font-black font-mono tracking-[0.4em] uppercase px-1">
                <span className="text-primary tabular-nums">
                  {formatTime(localTime)}
                </span>
                <div className="h-[1px] flex-1 mx-10 bg-white/10" />
                <span className="text-zinc-600 tabular-nums">
                  {formatTime(currentPodcast.duration_seconds || localDuration)}
                </span>
              </div>
            </div>

            {/* MANDOS TÁCTICOS CENTRALES */}
            <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
              
              <Button 
                onClick={handleToggleLike} 
                variant="ghost" 
                className={cn(
                  "h-14 w-14 rounded-2xl border transition-all duration-500 active:scale-90", 
                  isLiked ? "bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]" : "bg-white/5 border-white/5 text-zinc-600 hover:text-white"
                )}
              >
                <Heart className={cn("h-6 w-6 transition-all duration-700", isLiked && "fill-current scale-110")} />
              </Button>

              <div className="flex items-center gap-6 md:gap-14">
                <Button 
                  onClick={() => skipBackward(15)} 
                  variant="ghost" 
                  className="text-zinc-600 hover:text-white transition-all scale-125 active:scale-95"
                >
                  <SkipBack size={32} />
                </Button>

                <Button 
                  onClick={togglePlayPause} 
                  disabled={isLoading}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white text-black hover:bg-primary hover:text-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.15)]"
                >
                  {isLoading ? (
                    <Loader2 className="h-10 w-10 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-12 w-12 fill-current" />
                  ) : (
                    <Play className="h-12 w-12 fill-current ml-2" />
                  )}
                </Button>

                <Button 
                  onClick={() => skipForward(15)} 
                  variant="ghost" 
                  className="text-zinc-600 hover:text-white transition-all scale-125 active:scale-95"
                >
                  <SkipForward size={32} />
                </Button>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleShare} variant="ghost" className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 text-zinc-600 hover:text-white active:scale-90">
                  <Share2 size={22} />
                </Button>
                <Button variant="ghost" className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 text-zinc-600 hover:text-white hidden md:flex active:scale-90">
                  <Download size={22} />
                </Button>
              </div>
            </div>

            {/* CRÉDITOS DE AUTORÍA SOBERANA */}
            <div className="flex justify-center items-center gap-6 opacity-30 pb-2">
               <div className="h-[1px] w-12 bg-white/20" />
               <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-400 italic">
                 Cronista: {authorName}
               </span>
               <div className="h-[1px] w-12 bg-white/20" />
            </div>
          </footer>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V30.0):
 * 1. Cámara de Lectura: Se ha sustituido el fondo translúcido '#050505/40' por 
 *    un sólido profundo '#080808' con borde reforzado 'white/10'. Esto resuelve 
 *    la ceguera de contraste detectada en el peritaje visual.
 * 2. Hardware Sync: El uso del evento 'nicepod-timeupdate' garantiza que el 
 *    Slider se mueva con fluidez táctil sin saturar el Bridge de React.
 * 3. Diseño Atómico: Se ha redimensionado la cabecera y el footer para maximizar 
 *    el área de la 'Malla Narrativa', priorizando el capital intelectual.
 * 4. UX Optimizada: Se integró el 'profile.full_name' como fallback para la 
 *    identidad del autor, asegurando que el crédito siempre sea visible.
 */