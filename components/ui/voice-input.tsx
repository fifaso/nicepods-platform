// components/ui/voice-input.tsx
// VERSIÓN: 2.0 (Burst Mode: 10s Limit + Visual Feedback Loop)

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Sparkles, Loader2, Zap, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

// --- CONFIGURACIÓN ---
const MAX_RECORDING_MS = 10000; // 10 segundos exactos
const UPDATE_INTERVAL_MS = 100; // Fluidez de la barra

interface VoiceInputProps {
  onTextGenerated: (text: string) => void;
  className?: string;
  placeholder?: string;
}

export function VoiceInput({ onTextGenerated, className }: VoiceInputProps) {
  // Estados: Idle -> Recording -> Processing
  const [status, setStatus] = useState<'idle' | 'recording-clarify' | 'recording-fast' | 'processing'>('idle');
  const [progress, setProgress] = useState(100); // 100% = 10s restantes
  const [timeLeft, setTimeLeft] = useState(10); // Segundos visuales
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();
  const supabase = createClient();

  // --- AUDIO FEEDBACK ---
  const playTone = (type: 'start' | 'end' | 'error') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'start') {
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
      } else if (type === 'end') {
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
      }
    } catch(e) {}
  };

  // --- LOGICA DE LIMPIEZA ---
  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  // --- PROCESAMIENTO (Cerebro) ---
  const processAudio = useCallback(async (audioBlob: Blob, mode: 'clarify' | 'fast') => {
    try {
      setStatus('processing');
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('mode', mode);

      const { data, error } = await supabase.functions.invoke('transcribe-idea', {
        body: formData,
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || "Error desconocido.");

      onTextGenerated(data.clarified_text);
      playTone('end');
      // Toast sutil para no invadir
      // toast({ title: mode === 'clarify' ? "✨ Idea capturada" : "⚡ Texto listo" });

    } catch (error) {
      console.error("Error voz:", error);
      playTone('error');
      toast({ title: "Error", description: "No te escuché bien. Intenta de nuevo.", variant: "destructive" });
    } finally {
      setStatus('idle');
      setProgress(100);
      setTimeLeft(10);
    }
  }, [supabase, onTextGenerated, toast]);

  // --- INICIAR GRABACIÓN ---
  const startRecording = useCallback(async (mode: 'clarify' | 'fast') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      playTone('start');
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // Limpieza de streams
        stream.getTracks().forEach(track => track.stop());
        
        // Procesar si hay datos
        if (chunksRef.current.length > 0) {
            const mimeType = mediaRecorder.mimeType || 'audio/webm';
            const audioBlob = new Blob(chunksRef.current, { type: mimeType });
            await processAudio(audioBlob, mode);
        } else {
            setStatus('idle');
        }
      };

      mediaRecorder.start();
      setStatus(mode === 'clarify' ? 'recording-clarify' : 'recording-fast');
      
      // RESETEO VISUAL
      setProgress(100);
      setTimeLeft(10);
      const startTime = Date.now();

      // TEMPORIZADOR VISUAL (Barra y números)
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, MAX_RECORDING_MS - elapsed);
        
        const percent = (remaining / MAX_RECORDING_MS) * 100;
        setProgress(percent);
        setTimeLeft(Math.ceil(remaining / 1000));

        if (remaining <= 0) {
            stopRecording(); // Auto-stop al llegar a 0
        }
      }, UPDATE_INTERVAL_MS);

    } catch (err) {
      playTone('error');
      toast({ title: "Sin micrófono", description: "Permite el acceso al micrófono.", variant: "destructive" });
      setStatus('idle');
    }
  }, [processAudio, toast]);

  const stopRecording = useCallback(() => {
    clearTimers();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Limpieza al desmontar
  useEffect(() => {
    return () => clearTimers();
  }, []);


  // --- RENDERIZADO CONDICIONAL ---

  // ESTADO 1: GRABANDO (Cuenta Regresiva)
  if (status === 'recording-clarify' || status === 'recording-fast') {
    const isUrgent = progress < 30; // Color rojo si queda poco tiempo

    return (
      <div className={cn("w-full relative h-12 rounded-full overflow-hidden shadow-inner bg-slate-900 border border-slate-800", className)}>
        {/* BARRA DE PROGRESO (Fondo que se encoge) */}
        <div 
            className={cn(
                "absolute inset-y-0 left-0 transition-all duration-100 ease-linear",
                isUrgent ? "bg-red-500/20" : "bg-primary/20"
            )}
            style={{ width: `${progress}%` }}
        />
        
        {/* CONTENIDO SUPERPUESTO */}
        <div className="absolute inset-0 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full animate-pulse", isUrgent ? "bg-red-500" : "bg-red-400")} />
                <span className={cn("font-mono font-bold text-sm", isUrgent ? "text-red-400" : "text-foreground")}>
                    00:{timeLeft.toString().padStart(2, '0')}
                </span>
            </div>
            
            <span className="text-xs text-muted-foreground font-medium animate-pulse">
                {status === 'recording-clarify' ? "Capturando idea..." : "Escuchando..."}
            </span>

            <Button 
                size="sm" 
                variant="ghost" 
                onClick={stopRecording}
                className="h-8 w-8 p-0 rounded-full hover:bg-red-500/20 hover:text-red-500 text-foreground transition-colors"
            >
                <Square className="h-4 w-4 fill-current" />
            </Button>
        </div>
      </div>
    );
  }

  // ESTADO 2: PROCESANDO (Barra Invertida)
  if (status === 'processing') {
    return (
      <div className={cn("w-full relative h-12 rounded-full overflow-hidden bg-slate-950 border border-purple-500/30 shadow-lg", className)}>
        {/* BARRA ANIMADA (Indeterminada / Scanner) */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent w-full animate-shimmer" />
        
        <div className="absolute inset-0 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
            <span className="text-sm font-medium text-purple-200">
                Transformando voz en texto...
            </span>
        </div>
      </div>
    );
  }

  // ESTADO 3: IDLE (Botones Originales)
  return (
    <div className={cn("grid grid-cols-2 gap-3 w-full", className)}>
      <Button
        type="button"
        onClick={() => startRecording('clarify')}
        className="h-12 rounded-full bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-medium shadow-lg shadow-purple-900/20 border-0 transition-transform active:scale-95 group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Sparkles className="h-5 w-5 mr-2 group-hover:text-yellow-200 transition-colors" />
        <span>Idea Mágica</span>
      </Button>

      <Button
        type="button"
        onClick={() => startRecording('fast')}
        className="h-12 rounded-full bg-secondary/80 hover:bg-secondary text-secondary-foreground font-medium border border-border/50 shadow-sm transition-transform active:scale-95"
      >
        <Zap className="h-5 w-5 mr-2 text-amber-500" />
        <span>Dictar</span>
      </Button>
    </div>
  );
}