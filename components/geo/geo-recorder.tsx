/**
 * ARCHIVO: components/geo/geo-recorder.tsx
 * VERSIÓN: 2.0 (NicePod Tactical Recorder - RAM Hygiene & Vault Alignment Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Capturar la crónica acústica del Administrador con rigor industrial.
 * [REFORMA V2.0]: Implementación de revocación de Blobs, limpieza de hardware 
 * y alineación con el bucket de evidencias de la Bóveda NKV.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn, nicepodLog } from "@/lib/utils";
import { CheckCircle2, Loader2, Mic, Play, RotateCcw, Square, UploadCloud } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface GeoRecorderProps {
  draftId: string | undefined;
  script: string | undefined;
  onUploadComplete: () => void;
}

export function GeoRecorder({ draftId, script, onUploadComplete }: GeoRecorderProps) {
  const { supabase, user } = useAuth();
  const { toast } = useToast();

  // --- I. ESTADO DE LA MÁQUINA DE GRABACIÓN ---
  const [permission, setPermission] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  // Referencias de hardware y memoria
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  /**
   * 1. PROTOCOLO DE HIGIENE DE RAM
   * Misión: Revocar URLs de objetos para liberar memoria de video/sistema.
   */
  const cleanupAudioUrl = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  }, [audioUrl]);

  // Limpieza al desmontar el componente
  useEffect(() => {
    return () => cleanupAudioUrl();
  }, [cleanupAudioUrl]);

  /**
   * 2. SOLICITUD DE AUTORIDAD DE HARDWARE
   */
  useEffect(() => {
    async function getMicPermission() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermission(true);
        // Liberamos el micro inmediatamente tras verificar el permiso
        stream.getTracks().forEach(track => track.stop());
        nicepodLog("🎙️ [GeoRecorder] Autoridad de hardware concedida.");
      } catch (err) {
        nicepodLog("🛑 [GeoRecorder] Micrófono bloqueado por el sistema.", err, 'error');
        toast({
          title: "Acceso Interceptado",
          description: "Habilite el micrófono para registrar su peritaje acústico.",
          variant: "destructive"
        });
      }
    }
    getMicPermission();
  }, [toast]);

  /**
   * 3. LÓGICA DE CAPTURA (IGNICIÓN)
   */
  const startRecording = async () => {
    if (!permission) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

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
        stream.getTracks().forEach(track => track.stop()); // Apagado físico de hardware
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      nicepodLog("⏺️ [GeoRecorder] Grabación en curso...");
    } catch (err) {
      nicepodLog("🔥 [GeoRecorder] Fallo al iniciar captura.", err, 'error');
      toast({ title: "Fallo de Ignición", description: "No se pudo iniciar el MediaRecorder.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  /**
   * 4. LÓGICA DE PERSISTENCIA (COMMIT EN BÓVEDA NKV)
   */
  const handlePublish = async () => {
    if (!audioBlob || !draftId || !user) return;
    setIsUploading(true);

    try {
      // A. SUBIDA SOBERANA (Alineada con el Protocolo Janitor)
      const timestamp = Date.now();
      const filePath = `poi-evidence/${user.id}/${draftId}_${timestamp}_vocal.webm`;

      nicepodLog(`📡 [GeoRecorder] Transportando crónica acústica: ${filePath}`);

      const { error: uploadError } = await supabase.storage
        .from('podcasts')
        .upload(filePath, audioBlob, {
          contentType: 'audio/webm',
          upsert: true
        });

      if (uploadError) throw new Error(`STORAGE_FAIL: ${uploadError.message}`);

      const { data: { publicUrl } } = supabase.storage
        .from('podcasts')
        .getPublicUrl(filePath);

      // B. CIERRE DE EXPEDIENTE (Edge Function)
      const { data: funcData, error: funcError } = await supabase.functions.invoke('geo-publish-geo-content', {
        body: {
          draft_id: draftId,
          audio_url: publicUrl,
          duration: duration
        }
      });

      if (funcError || !funcData.success) throw new Error(funcError?.message || "FAIL_POST_INGESTION");

      toast({
        title: "¡Sabiduría Anclada!",
        description: "Su crónica ha sido materializada en la Malla de Madrid.",
        className: "bg-emerald-600 border-emerald-700 text-white font-bold"
      });

      onUploadComplete();

    } catch (error: any) {
      nicepodLog("🔥 [GeoRecorder] Error en publicación final.", error, 'error');
      toast({
        title: "Error de Sincronía",
        description: error.message || "Fallo en la comunicación con el metal.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatTimeDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-5 w-full h-full">

      {/* 1. TELEPROMPTER SOBERANO */}
      <div className="flex-1 bg-black/60 border border-white/5 rounded-2xl p-5 overflow-y-auto max-h-[320px] shadow-2xl backdrop-blur-xl">
        <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-3 sticky top-0 bg-transparent py-1">
          Guion de Inteligencia
        </h4>
        <p className="text-xl font-medium leading-relaxed text-zinc-100 whitespace-pre-wrap font-serif antialiased">
          {script || "No se detectó narrativa previa."}
        </p>
      </div>

      {/* 2. CHASSIS DE COMANDO */}
      <div className="bg-white/[0.03] border-t border-white/10 -mx-6 -mb-6 p-6 mt-auto backdrop-blur-3xl">

        {/* Telemetría de Grabación */}
        <div className="flex justify-between items-center mb-5 px-1">
          <div className="flex items-center gap-3">
            {isRecording && <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />}
            <span className={cn("font-mono text-2xl font-black tracking-tighter", isRecording ? "text-red-400" : "text-zinc-500")}>
              {formatTimeDisplay(duration)}
            </span>
          </div>
          {audioBlob && !isRecording && (
            <div className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="text-[9px] text-emerald-400 flex items-center gap-1.5 font-black uppercase tracking-widest">
                <CheckCircle2 className="h-3 w-3" /> Captura Blindada
              </span>
            </div>
          )}
        </div>

        {/* Mallas de Acción */}
        <div className="flex gap-4 h-16">
          {!audioBlob ? (
            isRecording ? (
              <Button
                onClick={stopRecording}
                className="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/50 transition-all rounded-2xl"
              >
                <Square className="fill-current h-6 w-6" />
              </Button>
            ) : (
              <Button
                onClick={startRecording}
                disabled={!permission}
                className="flex-1 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black text-xs tracking-[0.2em] shadow-xl"
              >
                <Mic className="mr-3 h-5 w-5" /> INICIAR CRÓNICA
              </Button>
            )
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => { cleanupAudioUrl(); setAudioBlob(null); setDuration(0); }}
                className="w-16 px-0 rounded-2xl border-white/10 bg-transparent text-zinc-400 hover:bg-white/5 hover:text-white"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>

              <Button
                className="flex-1 flex gap-3 items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10"
                onClick={() => {
                  if (audioPlayerRef.current) {
                    if (isPlaying) { audioPlayerRef.current.pause(); setIsPlaying(false); }
                    else { audioPlayerRef.current.play(); setIsPlaying(true); }
                  }
                }}
              >
                {isPlaying ? <Square className="fill-current h-4 w-4" /> : <Play className="fill-current h-4 w-4 text-primary" />}
                <span className="text-[10px] font-black uppercase tracking-widest">{isPlaying ? "PAUSAR" : "AUDITAR"}</span>
              </Button>

              <Button
                onClick={handlePublish}
                disabled={isUploading}
                className="flex-1 bg-primary text-primary-foreground font-black text-[10px] tracking-widest rounded-2xl shadow-2xl shadow-primary/20 hover:opacity-90"
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

        {/* Puente de Audio Helper */}
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. RAM Hygiene: Se implementó cleanupAudioUrl para evitar que los Blobs de audio
 *    persistan en la memoria del dispositivo móvil tras múltiples tomas.
 * 2. Path Alignment: Se cambió la ruta de subida a 'poi-evidence/' para cumplir con 
 *    el contrato del Protocolo Janitor y la estructura de la Bóveda NKV.
 * 3. Industrial UI: Se refinaron las escalas, tipografías (serif para guion) y 
 *    contrastes para un peritaje urbano bajo condiciones de luz solar.
 */