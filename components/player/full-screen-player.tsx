// components/player/full-screen-player.tsx
// VERSIÓN: 29.0 (NicePod Studio - Absolute Integrity Edition)
// Misión: Orquestar la inmersión total con teleprompter síncrono y controles de alta fidelidad.
// [ESTABILIZACIÓN]: Reparación de Grid 12-col, anclaje de Slider al footer y blindaje contra errores 400.

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
import { useEffect, useState, useMemo, useCallback } from "react";

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
 * Implementa una arquitectura de 'Zonas de Mando' para garantizar que los controles 
 * nunca colisionen con el contenido narrativo.
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

  // --- ESTADOS DE TELEMETRÍA SÍNCRONA ---
  const [localTime, setLocalTime] = useState<number>(0);
  const [localDuration, setLocalDuration] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);

  /**
   * 1. PROTOCOLO DE SINCRO (Event-Driven)
   * Capturamos el evento 'nicepod-timeupdate' para evitar re-renders masivos.
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
   * 2. VERIFICACIÓN DE RESONANCIA (Like Status)
   * [FIX CRÍTICO]: Guardia de identidad para evitar error 400 Bad Request.
   */
  useEffect(() => {
    // Si no hay usuario o el podcast_id es undefined, abortamos la petición.
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

  // Guardia de renderizado: No iniciamos si no hay un activo nominal.
  if (!currentPodcast) return null;

  // --- MANEJADORES DE ACCIÓN INDUSTRIAL ---

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setLocalTime(newTime);
    seekTo(newTime);
  };

  const handleToggleLike = async () => {
    if (!user || !currentPodcast?.id || isLiking) return;
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
        toast({ title: "Enlace copiado" });
      }
    } catch { nicepodLog("Share protocol interrupted."); }
  };

  const coverImage = getSafeAsset(currentPodcast.cover_image_url, 'cover');
  const authorName = currentPodcast.profiles?.full_name || "Cronista Soberano";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
        className="fixed inset-0 z-[200] bg-[#020202] flex flex-col overflow-hidden selection:bg-primary/30"
      >
        {/* FONDO AURORA (Optimización Atmosférica) */}
        <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-indigo-950/20 blur-[120px]" />
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/5 rounded-full blur-[140px] animate-float" />
        </div>

        <div className="relative z-10 flex flex-col h-full w-full max-w-screen-2xl mx-auto">
          
          {/* --- ZONA 1: HEADER (Identidad) --- */}
          <header className="flex items-center justify-between p-6 md:p-10 flex-shrink-0">
            <Button 
              onClick={collapsePlayer} 
              variant="ghost" 
              size="icon" 
              className="text-white/20 hover:text-white hover:bg-white/5 rounded-full h-14 w-14 transition-all"
            >
              <ChevronDown className="h-10 w-10" />
            </Button>

            <div className="flex flex-col items-center text-center overflow-hidden px-8">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/80 mb-2 animate-pulse">Sincronía Nominal Activa</span>
              <div className="max-w-[280px] md:max-w-2xl overflow-hidden">
                <motion.h2 
                  animate={currentPodcast.title.length > 25 ? { x: [0, -200, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                  className="font-black text-xs md:text-lg text-white uppercase italic tracking-[0.1em] whitespace-nowrap"
                >
                  {currentPodcast.title}
                </motion.h2>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner">
              <Volume2 className="h-6 w-6 text-primary/40" />
            </div>
          </header>

          {/* --- ZONA 2: ESCENARIO (Inmersión) --- */}
          <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 px-6 md:px-14 items-center overflow-hidden">
            
            {/* IZQUIERDA: ARTE VISUAL (5 Columnas) */}
            <div className="hidden lg:flex lg:col-span-5 flex-col items-center justify-center space-y-12">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="relative w-full max-w-md aspect-square shadow-[0_50px_100px_rgba(0,0,0,0.9)] rounded-[4rem] overflow-hidden border border-white/10"
              >
                <Image src={coverImage} alt={currentPodcast.title} fill className="object-cover opacity-90" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </motion.div>
              
              <div className="flex items-center gap-4 bg-primary/5 px-8 py-4 rounded-3xl border border-primary/20 backdrop-blur-3xl shadow-2xl">
                 <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                 <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-300">Resonancia Neural NicePod</span>
              </div>
            </div>

            {/* DERECHA: TELEPROMPTER (7 Columnas) */}
            <div className="lg:col-span-7 h-full w-full bg-[#050505]/40 rounded-[3.5rem] border border-white/5 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#020202] to-transparent z-20 pointer-events-none" />
              
              <div className="h-full w-full">
                <ScriptViewer 
                  scriptText={currentPodcast.script_text} 
                  duration={localDuration}
                  className="px-10 md:px-16" 
                />
              </div>

              <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#020202] to-transparent z-20 pointer-events-none" />
            </div>
          </main>

          {/* --- ZONA 3: DOCK DE CONTROL (Telemetría) --- */}
          <footer className="p-8 md:p-12 space-y-10 flex-shrink-0 bg-gradient-to-t from-black via-[#020202] to-transparent">
            
            {/* CONTROL DE PROGRESO UNIFICADO */}
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
                <div className="h-px flex-1 mx-12 bg-white/5" />
                <span className="bg-white/5 px-4 py-1.5 rounded-xl border border-white/5 shadow-inner">
                  {formatTime(localDuration)}
                </span>
              </div>
            </div>

            {/* PANEL DE MANDOS CENTRALIZADO */}
            <div className="flex items-center justify-between max-w-5xl mx-auto w-full px-4 md:px-0">
              
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

              <div className="flex gap-4">
                <Button onClick={handleShare} variant="ghost" className="h-16 w-16 rounded-full bg-white/5 border border-white/5 text-white/20 hover:text-white">
                  <Share2 size={24} />
                </Button>
                <Button variant="ghost" className="h-16 w-16 rounded-full bg-white/5 border border-white/5 text-white/20 hover:text-white hidden lg:flex">
                  <Download size={24} />
                </Button>
              </div>
            </div>

            {/* CRÉDITOS DE AUTORÍA */}
            <div className="flex justify-center items-center gap-6 opacity-20">
               <div className="h-px w-20 bg-white/20" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">Cronista: {authorName}</span>
               <div className="h-px w-20 bg-white/20" />
            </div>
          </footer>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V29.0):
 * 1. Resolución de Error 400: Se implementó un guardia de existencia en el useEffect de Likes. 
 *    Esto previene que se disparen peticiones a Supabase antes de que el podcast_id 
 *    esté hidratado en el cliente.
 * 2. Malla de Inmersión: Se reconstruyó el layout usando un Grid de 12 columnas. 
 *    Se fijó el Footer (Dock de Control) para que el Slider y los tiempos sean 
 *    una unidad sólida, eliminando el desbordamiento visual anterior.
 * 3. Sincronía Dinámica: El componente ScriptViewer recibe ahora la duración real 
 *    calculada, lo que habilita la lógica de resaltado de frases en tiempo real.
 * 4. UX Premium: Se añadió el efecto de desenfoque de máscara (Gradient Mask) al guion 
 *    para una lectura más enfocada y cinematográfica.
 */