// components/ui/voice-input.tsx
// VERSIÓN MAESTRA: Compatible con Safari/iOS y Chrome, con gestión de errores robusta.

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
  
  // Refs para mantener persistencia sin provocar re-renders
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const { toast } = useToast();
  const supabase = createClient();

  // Función interna para procesar el audio una vez grabado
  const processAudio = useCallback(async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      
      const formData = new FormData();
      formData.append('audio', audioBlob);

      // Llamada a la Edge Function (Gemini 2.5 Flash)
      const { data, error } = await supabase.functions.invoke('transcribe-idea', {
        body: formData,
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
  }, [supabase, onTextGenerated, toast]);

  const startRecording = useCallback(async () => {
    try {
      // 1. Solicitar permisos
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 2. Crear Recorder (Sin forzar mimeType aquí para compatibilidad Safari)
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // 3. Capturar fragmentos de datos
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      // 4. Manejar el evento de parada
      mediaRecorder.onstop = async () => {
        // Apagar el micrófono (liberar hardware)
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());

        // DETECCIÓN INTELIGENTE DE FORMATO (CRÍTICO PARA SAFARI)
        // Safari usa 'audio/mp4' o 'audio/aac', Chrome usa 'audio/webm'.
        // Usamos la propiedad .mimeType del propio recorder.
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        
        console.log(`Grabación finalizada. Formato detectado: ${mimeType}`); // Log de diagnóstico
        
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        await processAudio(audioBlob);
      };

      // 5. Iniciar grabación
      mediaRecorder.start();
      setIsRecording(true);

    } catch (err) {
      console.error("Error accediendo al micrófono:", err);
      toast({
        title: "Error de micrófono",
        description: "Verifica que has dado permisos de micrófono al navegador.",
        variant: "destructive",
      });
    }
  }, [toast, processAudio]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // El estado isProcessing se activará dentro del evento onstop
    }
  }, []);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        type="button"
        // Cambiamos el estilo visual drásticamente si está grabando para dar feedback claro
        variant={isRecording ? "destructive" : "secondary"} 
        size="sm"
        className={cn(
          "transition-all duration-300 relative overflow-hidden font-medium",
          isRecording && "animate-pulse pr-4 ring-2 ring-offset-2 ring-red-500"
        )}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Pensando...
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
      
      {/* Indicador visual extra (Punto rojo parpadeante fuera del botón) */}
      {isRecording && (
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
    </div>
  );
}