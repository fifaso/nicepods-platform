// components/ui/voice-input.tsx
// VERSIÓN DUAL: Botones separados para "Pulir" y "Dictar".

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
  placeholder?: string; // Ya no se usa tanto visualmente, pero mantenemos compatibilidad
}

export function VoiceInput({ onTextGenerated, className }: VoiceInputProps) {
  // Estado: 'idle' | 'recording-clarify' | 'recording-fast' | 'processing'
  const [status, setStatus] = useState<'idle' | 'recording-clarify' | 'recording-fast' | 'processing'>('idle');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
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

  const processAudio = useCallback(async (audioBlob: Blob, mode: 'clarify' | 'fast') => {
    try {
      setStatus('processing');
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('mode', mode); // Enviamos el modo al backend

      const { data, error } = await supabase.functions.invoke('transcribe-idea', {
        body: formData,
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || "Error desconocido.");

      // AQUÍ ESTÁ EL FIX DEL BUG JSON: Leemos la propiedad correcta
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

  // UI DUAL: Si estamos grabando o procesando, mostramos un botón de "STOP/LOADING".
  // Si estamos "idle", mostramos los dos botones de opción.

  if (status !== 'idle') {
    return (
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={status === 'processing' ? undefined : stopRecording}
        disabled={status === 'processing'}
        className={cn("w-full transition-all duration-300", className)}
      >
        {status === 'processing' ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <StopCircle className="h-4 w-4 mr-2 animate-pulse" />
            {status === 'recording-clarify' ? 'Detener (Pulir)' : 'Detener (Dictar)'}
          </>
        )}
      </Button>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Botón 1: Clarificar (El Mágico) */}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => startRecording('clarify')}
        className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
        title="Grabar y pulir idea (elimina ruido)"
      >
        <Sparkles className="h-4 w-4 mr-1 md:mr-2" />
        <span className="hidden md:inline">Pulir Idea</span>
        <span className="md:hidden">Idea</span>
      </Button>

      {/* Botón 2: Dictado Rápido (El Literal) */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => startRecording('fast')}
        className="text-muted-foreground hover:text-foreground"
        title="Dictado literal rápido"
      >
        <Zap className="h-4 w-4 md:mr-1" />
        <span className="hidden md:inline">Dictar</span>
      </Button>
    </div>
  );
}