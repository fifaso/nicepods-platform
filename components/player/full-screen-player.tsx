/**
 * ARCHIVO: components/player/full-screen-player.tsx
 * VERSIÓN: 34.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: Thermal Isolation & Direct-DocumentObjectModel
 * 
 * MISIÓN: Orquestar la inmersión total del Voyager con telemetría de alto rendimiento.
 * [REFORMA 34.0]: Migración absoluta a Direct-DocumentObjectModel para métricas y progreso.
 * Erradicación de re-renderizados de React por pulso de hardware para máxima eficiencia térmica.
 *
 * NIVEL DE INTEGRIDAD: 100% (Soberanía Nominal V8.0)
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
import { useEffect, useState, useMemo, useCallback, useRef } from "react";

// --- INFRAESTRUCTURA CORE NICEPOD ---
import { Button } from "@/components/ui/button";
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
    currentActivePodcast: currentActivePodcastSnapshot,
    isAudioPlayingStatus,
    isAudioLoadingStatus,
    togglePlayPauseAction,
    seekToTimeAction,
    skipForwardAction,
    skipBackwardAction,
    collapsePlayerInterface,
    logInteractionEventAction
  } = useAudio();

  const { supabase: supabaseSovereignClient, user: authenticatedUser, profile: administratorProfile } = useAuth();
  const { toast } = useToast();

  // --- REFERENCIAS DE TELEMETRÍA DE HARDWARE (MainThreadIsolation) ---
  const currentTimeDisplayElementReference = useRef<HTMLSpanElement>(null);
  const totalDurationDisplayElementReference = useRef<HTMLSpanElement>(null);
  const timelineSliderInputElementReference = useRef<HTMLInputElement>(null);

  const lastTotalAudioDurationSecondsMagnitudeReference = useRef<number>(0);

  const [isLikedByVoyagerStatus, setIsLikedByVoyagerStatus] = useState<boolean>(false);
  const [isInteractionProcessActiveStatus, setIsInteractionProcessActiveStatus] = useState<boolean>(false);

  /**
   * 1. PROTOCOLO DE SINCRONÍA POR HARDWARE (60 FramesPerSecond - Direct-DocumentObjectModel)
   * Misión: Actualizar la Interfaz de Usuario sin disparar el ciclo de reconciliación de React.
   */
  useEffect(() => {
    const handleHardwarePulseSynchronizationAction = (operationalEvent: Event) => {
      // Background Thermal Isolation: Suspender actualizaciones si la pestaña no es visible
      if (document.hidden) return;

      const hardwareEventSnapshot = operationalEvent as CustomEvent<{ currentTime: number; duration: number }>;
      const { currentTime: currentPlaybackTimeSecondsMagnitude, duration: totalAudioDurationSecondsMagnitude } = hardwareEventSnapshot.detail;
      
      // Actualización Direct-DocumentObjectModel de etiquetas de cronometría
      if (currentTimeDisplayElementReference.current) {
        currentTimeDisplayElementReference.current.textContent = formatTime(currentPlaybackTimeSecondsMagnitude);
      }

      // Sincronización de la duración total si ocurre un cambio en el motor
      if (totalAudioDurationSecondsMagnitude > 0 && totalAudioDurationSecondsMagnitude !== lastTotalAudioDurationSecondsMagnitudeReference.current) {
        lastTotalAudioDurationSecondsMagnitudeReference.current = totalAudioDurationSecondsMagnitude;
        if (totalDurationDisplayElementReference.current) {
          totalDurationDisplayElementReference.current.textContent = formatTime(totalAudioDurationSecondsMagnitude);
        }
        if (timelineSliderInputElementReference.current) {
          timelineSliderInputElementReference.current.max = totalAudioDurationSecondsMagnitude.toString();
        }
      }

      // Sincronización del Deslizador (Slider) mediante Manipulación Directa
      if (timelineSliderInputElementReference.current) {
        timelineSliderInputElementReference.current.value = currentPlaybackTimeSecondsMagnitude.toString();

        // Actualización del gradiente visual del input range (estilización dinámica)
        const progressPercentageMagnitude = (currentPlaybackTimeSecondsMagnitude / (totalAudioDurationSecondsMagnitude || 1)) * 100;
        timelineSliderInputElementReference.current.style.setProperty('--range-progress', `${progressPercentageMagnitude}%`);
      }
    };

    window.addEventListener('nicepod-timeupdate', handleHardwarePulseSynchronizationAction as EventListener);

    return () => {
      window.removeEventListener('nicepod-timeupdate', handleHardwarePulseSynchronizationAction as EventListener);
    };
  }, []);

  /**
   * 2. VERIFICACIÓN DE RESONANCIA EN BÓVEDA NKV
   */
  useEffect(() => {
    if (!authenticatedUser || !currentActivePodcastSnapshot?.identification) {
      return;
    }

    const checkResonanceStatusAction = async () => {
      try {
        const { data: resonanceDataSnapshot } = await supabaseSovereignClient
          .from('likes')
          .select('id')
          .match({ user_id: authenticatedUser.id, podcast_id: currentActivePodcastSnapshot.identification })
          .maybeSingle();
        
        setIsLikedByVoyagerStatus(!!resonanceDataSnapshot);
      } catch (hardwareException: unknown) {
        nicepodLog("🔥 [Bóveda-NKV] Falla en verificación de resonancia.", hardwareException, 'exceptionInformation');
      }
    };
    
    checkResonanceStatusAction();
  }, [authenticatedUser, currentActivePodcastSnapshot?.identification, supabaseSovereignClient]);

  if (!currentActivePodcastSnapshot) {
    return null;
  }

  // --- MANEJADORES DE ACCIÓN TÁCTICA ---

  /**
   * handleTimelineAdjustmentAction:
   * Misión: Ejecutar el salto temporal (seek) en el motor de audio.
   */
  const handleTimelineAdjustmentAction = (mouseEvent: React.ChangeEvent<HTMLInputElement>) => {
    const targetTimeSecondsMagnitude = parseFloat(mouseEvent.target.value);
    seekToTimeAction(targetTimeSecondsMagnitude);
  };

  const handleResonanceInteractionAction = async () => {
    if (!authenticatedUser || !currentActivePodcastSnapshot?.identification || isInteractionProcessActiveStatus) {
      return;
    }

    setIsInteractionProcessActiveStatus(true);
    const originalResonanceStateStatus = isLikedByVoyagerStatus;
    setIsLikedByVoyagerStatus(!originalResonanceStateStatus); // Actualización optimista de UI

    try {
      if (originalResonanceStateStatus) {
        await supabaseSovereignClient
          .from('likes')
          .delete()
          .match({ user_id: authenticatedUser.id, podcast_id: currentActivePodcastSnapshot.identification });
      } else {
        await supabaseSovereignClient
          .from('likes')
          .insert({ user_id: authenticatedUser.id, podcast_id: currentActivePodcastSnapshot.identification });
        
        await logInteractionEventAction('liked');
        
        toast({ 
          title: "Resonancia Registrada", 
          className: "bg-primary text-white border-none font-black uppercase tracking-widest text-[10px]" 
        });
      }
    } catch (hardwareException: unknown) {
      setIsLikedByVoyagerStatus(originalResonanceStateStatus); // Reversión de estado (Rollback Determinista)
      nicepodLog("🔥 [Resonance-Fail]: Error en mutación de Bóveda.", hardwareException, 'exceptionInformation');
    } finally {
      setIsInteractionProcessActiveStatus(false);
    }
  };

  const handleKnowledgeSharingAction = async () => {
    const resourceUniformResourceLocator = `${window.location.origin}/podcast/${currentActivePodcastSnapshot.identification}`;
    try {
      if (navigator.share) {
        await navigator.share({ 
          title: currentActivePodcastSnapshot.titleTextContent,
          url: resourceUniformResourceLocator 
        });
        await logInteractionEventAction('shared');
      } else {
        await navigator.clipboard.writeText(resourceUniformResourceLocator);
        toast({ title: "Enlace copiado al sector de memoria local." });
      }
    } catch {
      nicepodLog("Protocolo de compartición interrumpido por el hardware.");
    }
  };

  const coverImageUniformResourceLocator = getSafeAsset(currentActivePodcastSnapshot.coverImageUniformResourceLocator, 'cover');
  const authorDisplayNameText = currentActivePodcastSnapshot.profiles?.fullName || administratorProfile?.full_name || "Cronista Soberano";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
        className="fixed inset-0 z-[200] bg-[#020202] flex flex-col overflow-hidden selection:bg-primary/30"
      >
        {/* EFECTOS VISUALES DE AURORA (Thermal Passive) */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-indigo-950/30 blur-[150px]" />
        </div>

        <div className="relative z-10 flex flex-col h-full w-full max-w-screen-2xl mx-auto">
          
          {/* CABECERA TÁCTICA */}
          <header className="flex items-center justify-between p-6 md:p-10 flex-shrink-0">
            <Button 
              onClick={collapsePlayerInterface}
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
                {currentActivePodcastSnapshot.titleTextContent}
              </h2>
            </div>

            <div className="h-14 w-14 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5 shadow-inner">
              <Volume2 className="h-6 w-6 text-primary" />
            </div>
          </header>

          {/* ESCENARIO PRINCIPAL (Media Stage) */}
          <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 px-6 md:px-14 items-center overflow-hidden">
            
            <div className="hidden lg:flex lg:col-span-5 flex-col items-center justify-center space-y-12">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="relative w-full max-w-sm aspect-square shadow-[0_50px_100px_rgba(0,0,0,0.9)] rounded-[3rem] overflow-hidden border-2 border-white/10"
              >
                <Image src={coverImageUniformResourceLocator} alt={currentActivePodcastSnapshot.titleTextContent} fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </motion.div>
              
              <div className="flex items-center gap-4 bg-zinc-900/50 px-8 py-4 rounded-3xl border border-white/10 backdrop-blur-3xl shadow-2xl">
                 <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                 <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-100">
                   Neural Link: {administratorProfile?.role === 'admin' ? 'Administrador' : 'Voyager'}
                 </span>
              </div>
            </div>

            {/* VISOR DE NARRATIVA (Teleprompter) */}
            <div className="lg:col-span-7 h-full w-full bg-[#080808] rounded-[3.5rem] border border-white/10 relative overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#080808] to-transparent z-20 pointer-events-none" />
              
              <div className="h-full w-full">
                <ScriptViewer 
                  narrativeScriptContent={currentActivePodcastSnapshot?.podcastScriptDossier ?? null}
                  playbackDurationSecondsMagnitude={currentActivePodcastSnapshot?.playbackDurationSecondsTotal || 0}
                  additionalTailwindClassName="px-8 md:px-16"
                />
              </div>

              <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#080808] to-transparent z-20 pointer-events-none" />
            </div>
          </main>

          {/* PANEL DE CONTROL ACÚSTICO */}
          <footer className="p-8 md:p-12 space-y-10 flex-shrink-0">
            
            {/* LÍNEA DE TIEMPO DE ALTA PRECISIÓN */}
            <div className="max-w-4xl mx-auto w-full space-y-6">
              <div className="relative w-full h-6 flex items-center group">
                <input
                  type="range"
                  ref={timelineSliderInputElementReference}
                  min="0"
                  max={currentActivePodcastSnapshot?.playbackDurationSecondsTotal || 100}
                  step="0.1"
                  defaultValue="0"
                  onChange={handleTimelineAdjustmentAction}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer outline-none transition-all group-hover:h-2"
                  style={{
                    accentColor: '#8b5cf6',
                    background: `linear-gradient(to right, #8b5cf6 var(--range-progress, 0%), rgba(255,255,255,0.1) var(--range-progress, 0%))`
                  }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] font-black font-mono tracking-[0.4em] uppercase px-1">
                <span className="text-primary tabular-nums">
                  <span ref={currentTimeDisplayElementReference}>00:00</span>
                </span>
                <div className="h-[1px] flex-1 mx-10 bg-white/10" />
                <span className="text-zinc-600 tabular-nums">
                  <span ref={totalDurationDisplayElementReference}>00:00</span>
                </span>
              </div>
            </div>

            {/* BOTONERA DE ACCIÓN SOBERANA */}
            <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
              
              <Button 
                onClick={handleResonanceInteractionAction} 
                variant="ghost" 
                className={cn(
                  "h-14 w-14 rounded-2xl border transition-all duration-500 active:scale-90", 
                  isLikedByVoyagerStatus ? "bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]" : "bg-white/5 border-white/5 text-zinc-600 hover:text-white"
                )}
              >
                <Heart className={cn("h-6 w-6 transition-all duration-700", isLikedByVoyagerStatus && "fill-current scale-110")} />
              </Button>

              <div className="flex items-center gap-6 md:gap-14">
                <Button 
                  onClick={() => skipBackwardAction(15)}
                  variant="ghost" 
                  className="text-zinc-600 hover:text-white transition-all scale-125 active:scale-95"
                >
                  <SkipBack size={32} />
                </Button>

                <Button 
                  onClick={togglePlayPauseAction}
                  disabled={isAudioLoadingStatus}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white text-black hover:bg-primary hover:text-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.15)]"
                >
                  {isAudioLoadingStatus ? (
                    <Loader2 className="h-10 w-10 animate-spin" />
                  ) : isAudioPlayingStatus ? (
                    <Pause className="h-12 w-12 fill-current" />
                  ) : (
                    <Play className="h-12 w-12 fill-current ml-2" />
                  )}
                </Button>

                <Button 
                  onClick={() => skipForwardAction(15)}
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

            <div className="flex justify-center items-center gap-6 opacity-30 pb-2">
               <div className="h-[1px] w-12 bg-white/20" />
               <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-400 italic">
                 Cronista: {authorDisplayNameText}
               </span>
               <div className="h-[1px] w-12 bg-white/20" />
            </div>
          </footer>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
