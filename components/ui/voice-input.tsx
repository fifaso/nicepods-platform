// components/ui/voice-input.tsx
// VERSIÓN FINAL CONTRASTE: Botones legibles en cualquier modo (Light/Dark).

"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, Sparkles, Loader2, Zap, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface VoiceInputProps {
  onTextGenerated: (text: string) => void;
  className?: string;
  placeholder?: string;
}

export function VoiceInput({ onTextGenerated, className }: VoiceInputProps) {
  const [status, setStatus] = useState<'idle' | 'recording-clarify' | 'recording-fast' | 'processing'>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const supabase = createClient();

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
      toast({ title: mode === 'clarify' ? "Idea pulida ✨" : "Texto capturado ⚡" });

    } catch (error) {
      console.error("Error voz:", error);
      playTone('error');
      toast({ title: "Error", description: "No se pudo procesar el audio.", variant: "destructive" });
    } finally {
      setStatus('idle');
    }
  }, [supabase, onTextGenerated, toast]);

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
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        await processAudio(audioBlob, mode);
      };

      mediaRecorder.start();
      setStatus(mode === 'clarify' ? 'recording-clarify' : 'recording-fast');

    } catch (err) {
      playTone('error');
      toast({ title: "Sin micrófono", variant: "destructive" });
    }
  }, [processAudio, toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // UI: Estado Grabando/Procesando
  if (status !== 'idle') {
    return (
      <div className={cn("w-full", className)}>
        <Button
            type="button"
            // CAMBIO: Fondo rojo sólido (destructive) para garantizar visibilidad en cualquier modo
            variant="destructive"
            size="lg"
            onClick={status === 'processing' ? undefined : stopRecording}
            disabled={status === 'processing'}
            className="w-full h-12 rounded-full font-medium shadow-lg animate-pulse transition-all"
        >
            {status === 'processing' ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <StopCircle className="h-5 w-5 mr-2 fill-current" />}
            {status === 'processing' ? "Procesando..." : "Detener Grabación"}
        </Button>
      </div>
    );
  }

  // UI: Estado Inactivo (Botones de Acción)
  return (
    <div className={cn("grid grid-cols-2 gap-3 w-full", className)}>
      
      {/* Botón 1: Idea Mágica (Principal - Violeta Brand) 
          Se mantiene igual porque el violeta funciona bien en ambos modos.
      */}
      <Button
        type="button"
        onClick={() => startRecording('clarify')}
        className="h-12 rounded-full bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-medium shadow-lg shadow-purple-900/20 border-0 transition-transform active:scale-95 group"
      >
        <Sparkles className="h-5 w-5 mr-2 group-hover:text-yellow-200 transition-colors" />
        <span>Idea Mágica</span>
      </Button>

      {/* Botón 2: Dictar (Secundario - Adaptativo Light/Dark) 
          CAMBIO: Usamos 'bg-secondary' y 'text-secondary-foreground' para contraste automático.
      */}
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