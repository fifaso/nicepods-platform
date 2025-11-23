// components/ui/voice-input.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, Square, Loader2, Sparkles } from "lucide-react";
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

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop()); // Apagar micrófono

        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' }); // O el tipo nativo del navegador
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accediendo al micrófono:", err);
      toast({
        title: "Error de micrófono",
        description: "No pudimos acceder a tu micrófono. Verifica los permisos.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  }, [isRecording]);

  const processAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      // Invocación a la Edge Function
      const { data, error } = await supabase.functions.invoke('transcribe-idea', {
        body: formData,
        // Importante: No establecemos Content-Type manualmente para que el navegador 
        // configure el boundary del multipart/form-data correctamente.
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || "Error desconocido al procesar audio.");

      onTextGenerated(data.clarified_text);
      toast({
        title: "¡Idea capturada!",
        description: "Tu voz ha sido transformada en texto claro.",
      });

    } catch (error) {
      console.error("Error processing audio:", error);
      toast({
        title: "Error de procesamiento",
        description: "No pudimos entender el audio. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        type="button"
        variant={isRecording ? "destructive" : "secondary"}
        size="sm"
        className={cn(
          "transition-all duration-300 relative overflow-hidden",
          isRecording && "animate-pulse pr-4"
        )}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Clarificando...
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
      
      {/* Indicador visual extra si está grabando */}
      {isRecording && (
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
    </div>
  );
}