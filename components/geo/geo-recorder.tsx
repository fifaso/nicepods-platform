/**
 * ARCHIVO: components/geo/geo-recorder.tsx
 * VERSIÓN: 3.1 (NicePod Sovereign Acoustic Emitter - Industrial Standard Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Proveer una interfaz de hardware puro para la captura acústica del Voyager,
 * garantizando higiene de memoria y polimorfismo entre los pasos de la forja.
 * [REFORMA V3.1]: Purificación total de nomenclatura, blindaje de estados de proceso
 * y eliminación de cualquier acoplamiento con la persistencia de datos.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn, nicepodLog } from "@/lib/utils";
import { 
  CheckCircle2, 
  Loader2, 
  Mic, 
  Play, 
  RotateCcw, 
  Square, 
  UploadCloud, 
  BrainCircuit 
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * INTERFAZ SOBERANA: GeoRecorderProps
 * Define el contrato de comunicación con los componentes orquestadores de la plataforma.
 */
export interface GeoRecorderProps {
  /** mode: Define la lógica visual y operativa (Dictado rápido o Crónica leída). */
  mode: 'DICTATION' | 'CHRONICLE';
  /** script: El texto sugerido por la IA para ser leído en modo crónica. */
  script?: string;
  /** isProcessingExternal: Flag que indica si el orquestador está realizando tareas de red. */
  isProcessingExternal: boolean;
  /** onCaptureComplete: Callback que emite el binario capturado hacia el orquestador. */
  onCaptureComplete: (audioBlob: Blob, durationSeconds: number) => Promise<void>;
}

/**
 * GeoRecorder: El Centinela Acústico de NicePod.
 */
export function GeoRecorder({ 
  mode, 
  script, 
  isProcessingExternal, 
  onCaptureComplete 
}: GeoRecorderProps) {
  
  const { toast } = useToast();

  // --- I. MÁQUINA DE ESTADOS DE HARDWARE ---
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPlaybackActive, setIsPlaybackActive] = useState<boolean>(false);
  
  const [capturedAudioBlob, setCapturedAudioBlob] = useState<Blob | null>(null);
  const [capturedAudioUniformResourceLocator, setCapturedAudioUniformResourceLocator] = useState<string | null>(null);
  const [recordingDurationSeconds, setRecordingDurationSeconds] = useState<number>(0);

  // --- II. REFERENCIAS DE MEMORIA Y HARDWARE (MutableRef) ---
  const mediaRecorderReference = useRef<MediaRecorder | null>(null);
  const audioChunksReference = useRef<Blob[]>([]);
  const timerIntervalReference = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerReference = useRef<HTMLAudioElement | null>(null);

  /**
   * cleanupAcousticMemory:
   * Misión: Revocar URLs de objetos para liberar memoria del sistema operativo móvil.
   */
  const cleanupAcousticMemory = useCallback(() => {
    if (capturedAudioUniformResourceLocator) {
      URL.revokeObjectURL(capturedAudioUniformResourceLocator);
      setCapturedAudioUniformResourceLocator(null);
    }
  }, [capturedAudioUniformResourceLocator]);

  useEffect(() => {
    // Purga física de memoria al desmontar el componente.
    return () => cleanupAcousticMemory();
  }, [cleanupAcousticMemory]);

  /**
   * requestMicrophoneAuthority:
   * Misión: Solicitar el permiso de uso del bus de audio al navegador.
   */
  useEffect(() => {
    async function requestMicrophonePermission() {
      if (typeof window === "undefined") return;

      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasMicrophonePermission(true);
        // Liberamos el stream inmediatamente tras verificar el permiso.
        audioStream.getTracks().forEach(track => track.stop());
        nicepodLog(`🎙️ [GeoRecorder:${mode}] Autoridad acústica concedida.`);
      } catch (error) {
        nicepodLog(`🛑 [GeoRecorder:${mode}] Hardware bloqueado por política de seguridad.`, error, 'error');
        toast({
          title: "Acceso Interceptado",
          description: "Habilite el micrófono para registrar su peritaje en la Malla.",
          variant: "destructive"
        });
      }
    }
    requestMicrophonePermission();
  }, [toast, mode]);

  /**
   * executeIgnitionOfRecording:
   * Misión: Iniciar la captura de audio en formato WebM de alta fidelidad.
   */
  const executeIgnitionOfRecording = async () => {
    if (!hasMicrophonePermission) return;

    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(audioStream, { mimeType: 'audio/webm' });

      mediaRecorderReference.current = mediaRecorder;
      audioChunksReference.current = [];

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksReference.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const finalAudioBlob = new Blob(audioChunksReference.current, { type: 'audio/webm' });
        const generatedUniformResourceLocator = URL.createObjectURL(finalAudioBlob);
        
        setCapturedAudioBlob(finalAudioBlob);
        setCapturedAudioUniformResourceLocator(generatedUniformResourceLocator);
        
        // Apagado físico de los sensores para ahorro de batería.
        audioStream.getTracks().forEach(track => track.stop()); 
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDurationSeconds(0);

      timerIntervalReference.current = setInterval(() => {
        setRecordingDurationSeconds(previousValue => previousValue + 1);
      }, 1000);

      nicepodLog(`⏺️ [GeoRecorder:${mode}] Captura acústica en progreso.`);
    } catch (error) {
      nicepodLog(`🔥 [GeoRecorder:${mode}] Fallo crítico en la ignición.`, error, 'error');
      toast({ title: "Fallo de Hardware", description: "El dispositivo no respondió al comando.", variant: "destructive" });
    }
  };

  /**
   * executeCeaseOfRecording:
   * Misión: Detener la grabación y liberar el reloj del sistema.
   */
  const executeCeaseOfRecording = () => {
    if (mediaRecorderReference.current && isRecording) {
      mediaRecorderReference.current.stop();
      setIsRecording(false);
      if (timerIntervalReference.current) {
        clearInterval(timerIntervalReference.current);
      }
    }
  };

  /**
   * handleIntellectualEmission:
   * Misión: Emitir el binario capturado hacia el componente padre (Orquestador).
   */
  const handleIntellectualEmission = async () => {
    if (!capturedAudioBlob) return;
    nicepodLog(`📡 [GeoRecorder:${mode}] Emitiendo evidencia al orquestador.`);
    await onCaptureComplete(capturedAudioBlob, recordingDurationSeconds);
  };

  /**
   * formatTimerDisplay:
   * Utilidad de formato para cronometría industrial.
   */
  const formatTimerDisplay = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-5 w-full h-full min-h-0">

      {/* I. CHASSIS DE CONTEXTO COGNITIVO */}
      {mode === 'CHRONICLE' ? (
        <div className="flex-1 bg-black/60 border border-white/5 rounded-2xl p-5 overflow-y-auto custom-scrollbar shadow-2xl backdrop-blur-xl">
          <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-3 sticky top-0 bg-transparent py-1">
            Narrativa de Inteligencia
          </h4>
          <p className="text-xl font-medium leading-relaxed text-zinc-100 whitespace-pre-wrap font-serif antialiased">
            {script || "Error de sincronía: No se recibió narrativa del Oráculo."}
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8 shadow-inner">
          <BrainCircuit className={cn(
            "h-16 w-16 transition-all duration-[1000ms]",
            isRecording ? "text-red-500 animate-pulse" : "text-zinc-700"
          )} />
          <h3 className="text-white font-black uppercase tracking-[0.4em] text-[10px] mt-8 mb-2">
            Dictado Sensorial Activo
          </h3>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-center leading-relaxed px-6">
            Hable con claridad. Su intención será transmutada en metadatos para la Bóveda.
          </p>
        </div>
      )}

      {/* II. CHASSIS DE COMANDO TÁCTICO */}
      <div className="bg-white/[0.02] border-t border-white/5 -mx-6 -mb-6 p-6 mt-auto backdrop-blur-3xl">

        {/* Telemetría Acústica */}
        <div className="flex justify-between items-center mb-6 px-1">
          <div className="flex items-center gap-3">
            {isRecording && <div className="w-2 h-2 rounded-full bg-red-500 animate-ping shadow-[0_0_10px_rgba(239,68,68,0.4)]" />}
            <span className={cn("font-mono text-2xl font-black tracking-tighter", isRecording ? "text-red-400" : "text-zinc-600")}>
              {formatTimerDisplay(recordingDurationSeconds)}
            </span>
          </div>
          {capturedAudioBlob && !isRecording && (
            <div className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="text-[8px] text-emerald-400 flex items-center gap-1.5 font-black uppercase tracking-[0.2em]">
                <CheckCircle2 className="h-3 w-3" /> Evidencia Consolidada
              </span>
            </div>
          )}
        </div>

        {/* Mallas de Acción (Botonera) */}
        <div className="flex gap-4 h-16">
          {!capturedAudioBlob ? (
            isRecording ? (
              <Button
                onClick={executeCeaseOfRecording}
                className="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 transition-all rounded-2xl"
              >
                <Square className="fill-current h-6 w-6" />
              </Button>
            ) : (
              <Button
                onClick={executeIgnitionOfRecording}
                disabled={!hasMicrophonePermission || isProcessingExternal}
                className="flex-1 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black text-[11px] tracking-[0.2em] shadow-xl uppercase"
              >
                <Mic className="mr-3 h-5 w-5" /> 
                {mode === 'CHRONICLE' ? "Iniciar Crónica" : "Capturar Dictado"}
              </Button>
            )
          ) : (
            <>
              {/* Acción: Reinicio */}
              <Button
                variant="outline"
                disabled={isProcessingExternal}
                onClick={() => { 
                  cleanupAcousticMemory(); 
                  setCapturedAudioBlob(null); 
                  setRecordingDurationSeconds(0); 
                }}
                className="w-16 px-0 rounded-2xl border-white/10 bg-transparent text-zinc-500 hover:bg-white/5 hover:text-white transition-all"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>

              {/* Acción: Auditoría (Playback) */}
              <Button
                disabled={isProcessingExternal}
                className="flex-1 flex gap-3 items-center justify-center bg-white/[0.03] hover:bg-white/[0.08] text-white rounded-2xl border border-white/5"
                onClick={() => {
                  if (audioPlayerReference.current) {
                    if (isPlaybackActive) { 
                      audioPlayerReference.current.pause(); 
                      setIsPlaybackActive(false); 
                    } else { 
                      audioPlayerReference.current.play(); 
                      setIsPlaybackActive(true); 
                    }
                  }
                }}
              >
                {isPlaybackActive ? <Square className="fill-current h-4 w-4" /> : <Play className="fill-current h-4 w-4 text-primary" />}
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">{isPlaybackActive ? "PAUSAR" : "AUDITAR"}</span>
              </Button>

              {/* Acción: Emisión Final */}
              <Button
                onClick={handleIntellectualEmission}
                disabled={isProcessingExternal}
                className="flex-1 bg-primary text-primary-foreground font-black text-[9px] tracking-[0.3em] rounded-2xl shadow-2xl shadow-primary/20 hover:opacity-90 uppercase group"
              >
                {isProcessingExternal ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <div className="flex items-center gap-2.5">
                    <UploadCloud className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform" /> 
                    <span>{mode === 'CHRONICLE' ? "PUBLICAR" : "PROCESAR"}</span>
                  </div>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Puente de Audio Hardware (Invisibile) */}
        {capturedAudioUniformResourceLocator && (
          <audio
            ref={audioPlayerReference}
            src={capturedAudioUniformResourceLocator}
            onEnded={() => setIsPlaybackActive(false)}
            className="hidden"
          />
        )}
      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.1):
 * 1. Emitter Sovereignty: El componente actúa como un sensor puro. Emite un binario 
 *    (Blob) tras la captura, permitiendo que orquestadores externos gestionen 
 *    la lógica de red, cumpliendo el principio de responsabilidad única.
 * 2. Tailwind Sanitization: Se corrigieron las clases ambiguas de duración 
 *    (duration-[1000ms]) para evitar advertencias de compilación en Vercel.
 * 3. Atomic Memory: La purga de Object URLs mediante cleanupAcousticMemory asegura 
 *    que la aplicación mantenga su fluidez en sesiones prolongadas de peritaje urbano.
 */