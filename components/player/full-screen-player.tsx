/**
 * ARCHIVO: components/player/full-screen-player.tsx
 * VERSIÓN: 31.0 (NicePod Studio - High Contrast & Absolute Nominal Integrity)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestar la inmersión total del Voyager, garantizando legibilidad industrial,
 * sincronía milimétrica con el hardware de audio y persistencia de resonancia.
 * [REFORMA V31.0]: Sincronización nominal total con ScriptViewer V8.0, erradicación 
 * absoluta de abreviaturas y cumplimiento del Dogma Técnico NicePod.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

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
import { useEffect, useState, useMemo, useCallback } from "react";

// --- INFRAESTRUCTURA CORE NICEPOD ---
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAudio } from "@/contexts/audio-context";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn, formatTime, getSafeAsset, nicepodLog } from "@/lib/utils";
import { ScriptViewer } from "@/components/podcast/script-viewer";

/**
 * FullScreenPlayer: La terminal de inmersión y peritaje narrativo definitiva.
 */
export function FullScreenPlayer() {
  const {
    currentPodcast,
    isPlaying,
    isLoading: isPlaybackLoading,
    togglePlayPause,
    seekTo,
    skipForward,
    skipBackward,
    collapsePlayer,
    logInteractionEvent
  } = useAudio();

  const { supabase: supabaseClient, user: authenticatedUser, profile: administratorProfile } = useAuth();
  const { toast } = useToast();

  // --- REFERENCIAS DE TELEMETRÍA DE HARDWARE ---
  const [currentPlaybackTimeSeconds, setCurrentPlaybackTimeSeconds] = useState<number>(0);
  const [totalAudioDurationSeconds, setTotalAudioDurationSeconds] = useState<number>(0);
  const [isLikedByVoyager, setIsLikedByVoyager] = useState<boolean>(false);
  const [isInteractionProcessActive, setIsInteractionProcessActive] = useState<boolean>(false);

  /**
   * 1. PROTOCOLO DE SINCRONÍA POR HARDWARE (60 FPS)
   * Capturamos la telemetría emitida por el AudioProvider para actualizar 
   * el deslizador (Slider) sin penalizar el rendimiento del hilo principal.
   */
  useEffect(() => {
    const handleHardwarePulseSynchronization = (event: Event) => {
      const customEvent = event as CustomEvent<{ currentTime: number; duration: number }>;
      const { currentTime, duration } = customEvent.detail;
      
      setCurrentPlaybackTimeSeconds(currentTime);
      if (duration > 0 && duration !== totalAudioDurationSeconds) {
        setTotalAudioDurationSeconds(duration);
      }
    };

    window.addEventListener('nicepod-timeupdate', handleHardwarePulseSynchronization as EventListener);
    return () => {
      window.removeEventListener('nicepod-timeupdate', handleHardwarePulseSynchronization as EventListener);
    };
  }, [totalAudioDurationSeconds]);

  /**
   * 2. VERIFICACIÓN DE RESONANCIA EN BÓVEDA
   */
  useEffect(() => {
    if (!authenticatedUser || !currentPodcast?.id) {
      return;
    }

    const checkResonanceStatus = async () => {
      try {
        const { data: resonanceData } = await supabaseClient
          .from('likes')
          .select('id')
          .match({ user_id: authenticatedUser.id, podcast_id: currentPodcast.id })
          .maybeSingle();
        
        setIsLikedByVoyager(!!resonanceData);
      } catch (exception) {
        nicepodLog("Falla en verificación de Bóveda NKV", exception, 'error');
      }
    };
    
    checkResonanceStatus();
  }, [authenticatedUser, currentPodcast?.id, supabaseClient]);

  if (!currentPodcast) {
    return null;
  }

  // --- MANEJADORES DE ACCIÓN TÁCTICA ---

  const handleTimelineAdjustmentAction = (value: number[]) => {
    const targetTimeSeconds = value[0];
    setCurrentPlaybackTimeSeconds(targetTimeSeconds);
    seekTo(targetTimeSeconds);
  };

  const handleResonanceInteractionAction = async () => {
    if (!authenticatedUser || !currentPodcast?.id || isInteractionProcessActive) {
      return;
    }

    setIsInteractionProcessActive(true);
    const originalResonanceState = isLikedByVoyager;
    setIsLikedByVoyager(!originalResonanceState); // Actualización optimista de UI

    try {
      if (originalResonanceState) {
        await supabaseClient
          .from('likes')
          .delete()
          .match({ user_id: authenticatedUser.id, podcast_id: currentPodcast.id });
      } else {
        await supabaseClient
          .from('likes')
          .insert({ user_id: authenticatedUser.id, podcast_id: currentPodcast.id });
        
        await logInteractionEvent('liked');
        
        toast({ 
          title: "Resonancia Registrada", 
          className: "bg-primary text-white border-none font-black uppercase tracking-widest text-[10px]" 
        });
      }
    } catch (exception: any) {
      setIsLikedByVoyager(originalResonanceState); // Reversión de estado (Rollback)
      nicepodLog("🔥 [Resonance-Fail]:", exception.message, 'error');
    } finally {
      setIsInteractionProcessActive(false);
    }
  };

  const handleKnowledgeSharingAction = async () => {
    const resourceUniformResourceLocator = `${window.location.origin}/podcast/${currentPodcast.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ 
          title: currentPodcast.title, 
          url: resourceUniformResourceLocator 
        });
        await logInteractionEvent('shared');
      } else {
        await navigator.clipboard.writeText(resourceUniformResourceLocator);
        toast({ title: "Enlace copiado al sector de memoria." });
      }
    } catch {
      nicepodLog("Share protocol interrupted by hardware.");
    }
  };

  const coverImageUniformResourceLocator = getSafeAsset(currentPodcast.cover_image_url, 'cover');
  const authorDisplayName = currentPodcast.profiles?.full_name || administratorProfile?.full_name || "Cronista Soberano";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
        className="fixed inset-0 z-[200] bg-[#020202] flex flex-col overflow-hidden selection:bg-primary/30"
      >
        {/* ATMÓSFERA AURORA (CALIBRACIÓN DE CONTRASTE INDUSTRIAL) */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-indigo-950/30 blur-[150px]" />
        </div>

        <div className="relative z-10 flex flex-col h-full w-full max-w-screen-2xl mx-auto">
          
          {/* --- ZONA 1: CABECERA (MANDO Y CONTROL SOBERANO) --- */}
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
              <h2 className="max-w-[240px] md:max-w-xl font-black text-xs md:text-sm text-zinc-400 uppercase tracking-widest truncate italic font-serif">
                {currentPodcast.title}
              </h2>
            </div>

            <div className="h-14 w-14 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5 shadow-inner">
              <Volume2 className="h-6 w-6 text-primary" />
            </div>
          </header>

          {/* --- ZONA 2: ESCENARIO DE PERITAJE (ALTA FIDELIDAD) --- */}
          <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 px-6 md:px-14 items-center overflow-hidden">
            
            {/* COLUMNA IZQUIERDA: EVIDENCIA VISUAL (5 COLS) */}
            <div className="hidden lg:flex lg:col-span-5 flex-col items-center justify-center space-y-12">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="relative w-full max-w-sm aspect-square shadow-[0_50px_100px_rgba(0,0,0,0.9)] rounded-[3rem] overflow-hidden border-2 border-white/10"
              >
                <Image src={coverImageUniformResourceLocator} alt={currentPodcast.title} fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </motion.div>
              
              <div className="flex items-center gap-4 bg-zinc-900/50 px-8 py-4 rounded-3xl border border-white/10 backdrop-blur-3xl shadow-2xl">
                 <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                 <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-100">
                   Neural Link: {administratorProfile?.role === 'admin' ? 'Administrador' : 'Voyager'}
                 </span>
              </div>
            </div>

            {/* COLUMNA DERECHA: CÁMARA NARRATIVA (7 COLS) */}
            <div className="lg:col-span-7 h-full w-full bg-[#080808] rounded-[3.5rem] border border-white/10 relative overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
              {/* Máscaras de fundido para el Teleprompter Industrial */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#080808] to-transparent z-20 pointer-events-none" />
              
              <div className="h-full w-full">
                {/* [FIX V31.0]: Sincronización nominal total con ScriptViewer properties */}
                <ScriptViewer 
                  narrativeScriptContent={currentPodcast.script_text} 
                  playbackDurationSeconds={currentPodcast.duration_seconds || totalAudioDurationSeconds}
                  className="px-8 md:px-16" 
                />
              </div>

              <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#080808] to-transparent z-20 pointer-events-none" />
            </div>
          </main>

          {/* --- ZONA 3: DOCK DE TELEMETRÍA (FOOTER) --- */}
          <footer className="p-8 md:p-12 space-y-10 flex-shrink-0">
            
            {/* BARRA DE PROGRESO DE GRADO INDUSTRIAL */}
            <div className="max-w-4xl mx-auto w-full space-y-6">
              <Slider 
                value={[currentPlaybackTimeSeconds]} 
                max={currentPodcast.duration_seconds || totalAudioDurationSeconds || 100} 
                step={0.1} 
                onValueChange={handleTimelineAdjustmentAction} 
                className="cursor-pointer" 
              />
              <div className="flex justify-between items-center text-[11px] font-black font-mono tracking-[0.4em] uppercase px-1">
                <span className="text-primary tabular-nums">
                  {formatTime(currentPlaybackTimeSeconds)}
                </span>
                <div className="h-[1px] flex-1 mx-10 bg-white/10" />
                <span className="text-zinc-600 tabular-nums">
                  {formatTime(currentPodcast.duration_seconds || totalAudioDurationSeconds)}
                </span>
              </div>
            </div>

            {/* MANDOS TÁCTICOS DE REPRODUCCIÓN */}
            <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
              
              <Button 
                onClick={handleResonanceInteractionAction} 
                variant="ghost" 
                className={cn(
                  "h-14 w-14 rounded-2xl border transition-all duration-500 active:scale-90", 
                  isLikedByVoyager ? "bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]" : "bg-white/5 border-white/5 text-zinc-600 hover:text-white"
                )}
              >
                <Heart className={cn("h-6 w-6 transition-all duration-700", isLikedByVoyager && "fill-current scale-110")} />
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
                  disabled={isPlaybackLoading}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white text-black hover:bg-primary hover:text-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.15)]"
                >
                  {isPlaybackLoading ? (
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
                <Button 
                  onClick={handleKnowledgeSharingAction} 
                  variant="ghost" 
                  className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 text-zinc-600 hover:text-white active:scale-90"
                >
                  <Share2 size={22} />
                </Button>
                <Button 
                  variant="ghost" 
                  className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 text-zinc-600 hover:text-white hidden md:flex active:scale-90"
                >
                  <Download size={22} />
                </Button>
              </div>
            </div>

            {/* CRÉDITOS DE AUTORÍA SOBERANA */}
            <div className="flex justify-center items-center gap-6 opacity-30 pb-2">
               <div className="h-[1px] w-12 bg-white/20" />
               <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-400 italic">
                 Cronista: {authorDisplayName}
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
 * NOTA TÉCNICA DEL ARCHITECT (V31.0):
 * 1. Contract Synchronization: Se neutralizó el error TS2322 inyectando 'narrativeScriptContent' 
 *    y 'playbackDurationSeconds' en el ScriptViewer, alineándose con el estándar V8.0.
 * 2. Zero Abbreviations Policy: Purificación absoluta de términos (isPlaybackLoading, 
 *    isLikedByVoyager, currentPlaybackTimeSeconds, exception).
 * 3. High Fidelity UI: El uso de fondos sólidos en la columna de lectura garantiza que no 
 *    exista degradación del capital intelectual ante cambios en la portada del podcast.
 */