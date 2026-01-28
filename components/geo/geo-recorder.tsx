// components/geo/geo-recorder.tsx
// VERSIÓN: 1.0 (Tactical Recorder - Teleprompter & Auto-Publish)

"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, Mic, Play, RotateCcw, Square, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface GeoRecorderProps {
  draftId: string | undefined;
  script: string | undefined;
  onUploadComplete: () => void;
}

export function GeoRecorder({ draftId, script, onUploadComplete }: GeoRecorderProps) {
  const { supabase, user } = useAuth();
  const { toast } = useToast();

  // Estados de la Máquina de Grabación
  const [permission, setPermission] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  // Referencias para lógica interna
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // 1. SOLICITAR PERMISOS AL MONTAR
  useEffect(() => {
    async function getMic() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermission(true);
        // Limpiar tracks para no dejar el micro abierto si no se usa
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.error("Mic Error:", err);
        toast({ title: "Microfono Bloqueado", description: "Habilita el acceso para grabar tu crónica.", variant: "destructive" });
      }
    }
    getMic();
  }, [toast]);

  // 2. LÓGICA DE GRABACIÓN
  const startRecording = async () => {
    if (!permission) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop()); // Apagar luz roja hardware
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Timer simple
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      toast({ title: "Error al iniciar", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // 3. LÓGICA DE PUBLICACIÓN (El Cierre del Ciclo)
  const handlePublish = async () => {
    if (!audioBlob || !draftId || !user) return;
    setIsUploading(true);

    try {
      // A. Subir Archivo a Storage
      const fileName = `geo/${user.id}/${draftId}_${Date.now()}.webm`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('podcasts') // Asegúrate que este bucket existe
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm',
          upsert: true
        });

      if (uploadError) throw new Error("Fallo al subir audio a la nube.");

      // Obtener URL Pública
      const { data: { publicUrl } } = supabase.storage
        .from('podcasts')
        .getPublicUrl(fileName);

      // B. Ejecutar Función de Publicación (Commit en DB)
      const { data: funcData, error: funcError } = await supabase.functions.invoke('geo-publish-geo-content', {
        body: {
          draft_id: draftId,
          audio_path: publicUrl,
          duration: duration
        }
      });

      if (funcError || !funcData.success) throw new Error("Fallo al publicar la memoria.");

      toast({
        title: "¡Memoria Sincronizada!",
        description: "Tu voz ahora es parte de la ciudad.",
        className: "bg-green-600 border-green-700 text-white"
      });

      onUploadComplete(); // Avisar al padre para cambiar de pantalla

    } catch (error: any) {
      console.error("Publish Error:", error);
      toast({
        title: "Error de Publicación",
        description: error.message || "Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Helpers de UI
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">

      {/* 1. TELEPROMPTER (El Guion) */}
      <div className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 overflow-y-auto max-h-[300px] shadow-inner">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 sticky top-0 bg-black/80 backdrop-blur py-1 w-full">
          GUION SUGERIDO
        </h4>
        <p className="text-lg font-medium leading-relaxed text-white/90 whitespace-pre-wrap font-serif">
          {script || "Error: No hay guion disponible."}
        </p>
      </div>

      {/* 2. ZONA DE CONTROL */}
      <div className="bg-white/5 border-t border-white/10 -mx-4 -mb-4 p-4 mt-auto backdrop-blur-md">

        {/* Visualizador de Estado */}
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="flex items-center gap-2">
            {isRecording && <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />}
            <span className={cn("font-mono text-xl font-bold", isRecording ? "text-red-400" : "text-white/50")}>
              {formatTime(duration)}
            </span>
          </div>
          {audioBlob && !isRecording && (
            <span className="text-xs text-green-400 flex items-center gap-1 font-bold uppercase">
              <CheckCircle2 className="h-3 w-3" /> Audio Listo
            </span>
          )}
        </div>

        {/* Botonera */}
        <div className="flex gap-3 h-14">

          {/* MODO GRABACIÓN */}
          {!audioBlob ? (
            isRecording ? (
              <Button
                onClick={stopRecording}
                className="flex-1 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500 transition-all rounded-xl"
              >
                <Square className="fill-current h-6 w-6" />
              </Button>
            ) : (
              <Button
                onClick={startRecording}
                className="flex-1 bg-white text-black hover:bg-white/90 rounded-xl font-black text-sm tracking-widest"
              >
                <Mic className="mr-2 h-5 w-5" /> GRABAR
              </Button>
            )
          ) : (

            /* MODO REVISIÓN */
            <>
              <Button
                variant="outline"
                onClick={() => { setAudioBlob(null); setAudioUrl(null); setDuration(0); }}
                className="w-14 px-0 rounded-xl border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>

              <Button
                className="flex-1 flex gap-2 items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-xl"
                onClick={() => {
                  if (audioPlayerRef.current) {
                    if (isPlaying) { audioPlayerRef.current.pause(); setIsPlaying(false); }
                    else { audioPlayerRef.current.play(); setIsPlaying(true); }
                  }
                }}
              >
                {isPlaying ? <Square className="fill-current h-4 w-4" /> : <Play className="fill-current h-4 w-4" />}
                {isPlaying ? "Pausar" : "Escuchar"}
              </Button>

              <Button
                onClick={handlePublish}
                disabled={isUploading}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-900/20"
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <><UploadCloud className="mr-2 h-5 w-5" /> PUBLICAR</>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Reproductor Invisible (Helper) */}
        {audioUrl && (
          <audio
            ref={audioPlayerRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}
      </div>
    </div>
  );
}