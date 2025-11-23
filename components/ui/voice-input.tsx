// components/ui/voice-input.tsx
// VERSIÓN ENTERPRISE: Feedback Sonoro, Compatible con Safari y Streaming

"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface VoiceInputProps {
  onTextGenerated: (text: string) => void;
  className?: string;
  placeholder?: string;
}

export function VoiceInput({ onTextGenerated, className, placeholder = "Grabar idea" }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const supabase = createClient();

  // --- 1. FEEDBACK DE AUDIO (WEB AUDIO API) ---
  const playFeedbackTone = (type: 'start' | 'success' | 'error') => {
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
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      // Ignorar errores de audio
    }
  };

  const processAudio = useCallback(async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/transcribe-idea`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 429) throw new Error("Has excedido el límite de velocidad. Espera un minuto.");
        const errText = await response.text();
        throw new Error(errText || "Error conectando con la IA.");
      }

      if (!response.body) throw new Error("Sin respuesta del servidor.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      // Lectura del Stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        // NOTA: Podríamos llamar a onTextGenerated(fullText) aquí para streaming visual,
        // pero para estabilidad con el estado del formulario padre, lo enviamos al final.
      }

      onTextGenerated(fullText); // Enviamos el texto completo final
      playFeedbackTone('success');
      toast({ title: "¡Idea capturada!", className: "bg-green-500/10 border-green-500/20" });

    } catch (error) {
      console.error("Error processing audio:", error);
      playFeedbackTone('error');
      toast({
        title: "Error",
        description: error instanceof Error ? tryParseError(error.message) : "Error al procesar.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [supabase, onTextGenerated, toast]);

  const tryParseError = (msg: string) => {
      try {
          const parsed = JSON.parse(msg);
          return parsed.error || msg;
      } catch {
          return msg;
      }
  }

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      playFeedbackTone('start');
      
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
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);

    } catch (err) {
      playFeedbackTone('error');
      toast({ title: "Error de micrófono", description: "Verifica permisos.", variant: "destructive" });
    }
  }, [processAudio, toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        type="button"
        variant={isRecording ? "destructive" : "secondary"}
        size="sm"
        className={cn(
          "transition-all duration-300 relative overflow-hidden font-medium border shadow-sm",
          isRecording ? "animate-pulse pr-4 ring-2 ring-offset-2 ring-red-500" : "hover:bg-secondary/80",
          isProcessing && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
        )}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span className="animate-pulse">Escribiendo...</span>
          </>
        ) : isRecording ? (
          <>
            <Square className="h-4 w-4 mr-2 fill-current" />
            Detener
          </>
        ) : (
          <>
            <Mic className="h-4 w-4 mr-2" />
            {placeholder}
          </>
        )}
      </Button>
      {isRecording && (
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
    </div>
  );
}