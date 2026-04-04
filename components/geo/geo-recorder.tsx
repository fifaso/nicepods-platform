/**
 * ARCHIVO: components/geo/geo-recorder.tsx
 * VERSIÓN: 3.0 (NicePod Sovereign Acoustic Emitter - Polymorphic Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Componente de hardware puro para la captura acústica del Administrador.
 * [REFORMA V3.0]: Implementación de Patrón Emisor (Emitter Pattern), extirpación 
 * de lógica de red (Supabase) y soporte dual: Dictado de Intención y Crónica Final.
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
 * INTERFAZ SOBERANA
 * Define el contrato de comunicación con los Orquestadores de Pasos.
 */
export interface GeoRecorderProps {
  mode: 'DICTATION' | 'CHRONICLE';
  script?: string; // Solo requerido en modo CHRONICLE
  isProcessingExternal: boolean; // Permite al padre bloquear la UI mientras procesa
  onCaptureComplete: (audioBlob: Blob, durationSeconds: number) => Promise<void>;
}

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
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  const [capturedAudioBlob, setCapturedAudioBlob] = useState<Blob | null>(null);
  const [capturedAudioUrl, setCapturedAudioUrl] = useState<string | null>(null);
  const [recordingDurationSeconds, setRecordingDurationSeconds] = useState<number>(0);

  // --- II. REFERENCIAS DE MEMORIA (High-Speed Pointers) ---
  const mediaRecorderReference = useRef<MediaRecorder | null>(null);
  const audioChunksReference = useRef<Blob[]>([]);
  const timerIntervalReference = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerReference = useRef<HTMLAudioElement | null>(null);

  /**
   * PROTOCOLO DE HIGIENE DE RAM
   * Misión: Revocar URLs de objetos para liberar memoria del sistema operativo móvil.
   */
  const cleanupAudioMemory = useCallback(() => {
    if (capturedAudioUrl) {
      URL.revokeObjectURL(capturedAudioUrl);
      setCapturedAudioUrl(null);
    }
  }, [capturedAudioUrl]);

  useEffect(() => {
    // Purga atómica al desmontar el componente
    return () => cleanupAudioMemory();
  }, [cleanupAudioMemory]);

  /**
   * SOLICITUD DE AUTORIDAD DE HARDWARE
   */
  useEffect(() => {
    async function requestMicrophoneAuthority() {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasMicrophonePermission(true);
        // Liberamos el bus de audio inmediatamente tras verificar el permiso
        audioStream.getTracks().forEach(track => track.stop());
        nicepodLog(`🎙️ [GeoRecorder:${mode}] Autoridad de hardware concedida.`);
      } catch (error) {
        nicepodLog(`🛑 [GeoRecorder:${mode}] Hardware acústico interceptado.`, error, 'error');
        toast({
          title: "Acceso Denegado",
          description: "La plataforma requiere acceso al micrófono para el peritaje urbano.",
          variant: "destructive"
        });
      }
    }
    requestMicrophoneAuthority();
  }, [toast, mode]);

  /**
   * IGNICIÓN DE CAPTURA
   */
  const executeStartRecording = async () => {
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
        const finalBlob = new Blob(audioChunksReference.current, { type: 'audio/webm' });
        const generatedUrl = URL.createObjectURL(finalBlob);
        
        setCapturedAudioBlob(finalBlob);
        setCapturedAudioUrl(generatedUrl);
        
        // Apagado físico del hardware (Luz roja de grabación)
        audioStream.getTracks().forEach(track => track.stop()); 
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDurationSeconds(0);

      timerIntervalReference.current = setInterval(() => {
        setRecordingDurationSeconds(previous => previous + 1);
      }, 1000);

      nicepodLog(`⏺️ [GeoRecorder:${mode}] Captura acústica en progreso...`);
    } catch (error) {
      nicepodLog(`🔥 [GeoRecorder:${mode}] Fallo mecánico en ignición.`, error, 'error');
      toast({ title: "Fallo de Ignición", description: "El hardware no respondió.", variant: "destructive" });
    }
  };

  /**
   * DETENCIÓN DE CAPTURA
   */
  const executeStopRecording = () => {
    if (mediaRecorderReference.current && isRecording) {
      mediaRecorderReference.current.stop();
      setIsRecording(false);
      if (timerIntervalReference.current) {
        clearInterval(timerIntervalReference.current);
      }
    }
  };

  /**
   * EMISIÓN DE CAPITAL INTELECTUAL (Emitter Pattern)
   * Delega la responsabilidad de red al componente orquestador padre.
   */
  const handleDataEmission = async () => {
    if (!capturedAudioBlob) return;
    nicepodLog(`📡 [GeoRecorder:${mode}] Emitiendo binarios al orquestador padre.`);
    await onCaptureComplete(capturedAudioBlob, recordingDurationSeconds);
  };

  /**
   * UTILIDAD: Formateo de cronómetro táctico
   */
  const formatTimeDisplay = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-5 w-full h-full">

      {/* I. CHASSIS DE CONTEXTO (POLIMÓRFICO) */}
      {mode === 'CHRONICLE' ? (
        // MODO CRÓNICA: Teleprompter Soberano
        <div className="flex-1 bg-black/60 border border-white/5 rounded-2xl p-5 overflow-y-auto custom-scrollbar max-h-[320px] shadow-2xl backdrop-blur-xl">
          <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-3 sticky top-0 bg-transparent py-1">
            Guion de Inteligencia
          </h4>
          <p className="text-xl font-medium leading-relaxed text-zinc-100 whitespace-pre-wrap font-serif antialiased">
            {script || "No se detectó narrativa previa."}
          </p>
        </div>
      ) : (
        // MODO DICTADO: Interfaz Minimalista de Enfoque Cognitivo
        <div className="flex-1 flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-2xl p-8 shadow-inner">
          <BrainCircuit className={cn(
            "h-16 w-16 transition-all duration-1000",
            isRecording ? "text-red-500 animate-pulse" : "text-zinc-600"
          )} />
          <h3 className="text-white font-black uppercase tracking-[0.3em] text-[10px] mt-6 mb-2">
            Dictado Sensorial
          </h3>
          <p className="text-xs text-zinc-500 font-medium text-center leading-relaxed">
            Hable con claridad. El Oráculo procesará su intención para extraer la esencia del lugar.
          </p>
        </div>
      )}

      {/* II. CHASSIS DE COMANDO ACÚSTICO */}
      <div className="bg-white/[0.03] border-t border-white/10 -mx-6 -mb-6 p-6 mt-auto backdrop-blur-3xl">

        {/* Telemetría de Grabación */}
        <div className="flex justify-between items-center mb-5 px-1">
          <div className="flex items-center gap-3">
            {isRecording && <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />}
            <span className={cn("font-mono text-2xl font-black tracking-tighter", isRecording ? "text-red-400" : "text-zinc-500")}>
              {formatTimeDisplay(recordingDurationSeconds)}
            </span>
          </div>
          {capturedAudioBlob && !isRecording && (
            <div className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="text-[9px] text-emerald-400 flex items-center gap-1.5 font-black uppercase tracking-widest">
                <CheckCircle2 className="h-3 w-3" /> Pista Estabilizada
              </span>
            </div>
          )}
        </div>

        {/* Mallas de Acción */}
        <div className="flex gap-4 h-16">
          {!capturedAudioBlob ? (
            isRecording ? (
              <Button
                onClick={executeStopRecording}
                className="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/50 transition-all rounded-2xl"
              >
                <Square className="fill-current h-6 w-6" />
              </Button>
            ) : (
              <Button
                onClick={executeStartRecording}
                disabled={!hasMicrophonePermission}
                className="flex-1 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black text-[10px] tracking-[0.2em] shadow-xl uppercase"
              >
                <Mic className="mr-3 h-5 w-5" /> 
                {mode === 'CHRONICLE' ? "Iniciar Crónica" : "Iniciar Dictado"}
              </Button>
            )
          ) : (
            <>
              {/* Reset Control */}
              <Button
                variant="outline"
                disabled={isProcessingExternal}
                onClick={() => { 
                  cleanupAudioMemory(); 
                  setCapturedAudioBlob(null); 
                  setRecordingDurationSeconds(0); 
                }}
                className="w-16 px-0 rounded-2xl border-white/10 bg-transparent text-zinc-400 hover:bg-white/5 hover:text-white"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>

              {/* Playback Control */}
              <Button
                disabled={isProcessingExternal}
                className="flex-1 flex gap-3 items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10"
                onClick={() => {
                  if (audioPlayerReference.current) {
                    if (isPlaying) { 
                      audioPlayerReference.current.pause(); 
                      setIsPlaying(false); 
                    } else { 
                      audioPlayerReference.current.play(); 
                      setIsPlaying(true); 
                    }
                  }
                }}
              >
                {isPlaying ? <Square className="fill-current h-4 w-4" /> : <Play className="fill-current h-4 w-4 text-primary" />}
                <span className="text-[10px] font-black uppercase tracking-widest">{isPlaying ? "PAUSAR" : "AUDITAR"}</span>
              </Button>

              {/* Emission Control */}
              <Button
                onClick={handleDataEmission}
                disabled={isProcessingExternal}
                className="flex-1 bg-primary text-primary-foreground font-black text-[10px] tracking-widest rounded-2xl shadow-2xl shadow-primary/20 hover:opacity-90 uppercase"
              >
                {isProcessingExternal ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <UploadCloud className="mr-2 h-5 w-5" /> 
                    {mode === 'CHRONICLE' ? "PUBLICAR" : "TRANSCRIBIR"}
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Reproductor de Hardware Oculto */}
        {capturedAudioUrl && (
          <audio
            ref={audioPlayerReference}
            src={capturedAudioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}
      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Emitter Pattern: El componente ya no interactúa con Supabase o Edge Functions.
 *    Actúa como un sensor de hardware que emite un Blob limpio a su padre, 
 *    permitiendo su reutilización en cualquier paso de la Forja (DRY Principle).
 * 2. Polymorphic UI: El prop 'mode' altera el DOM y los copys de los botones 
 *    para adaptarse al contexto cognitivo del Administrador (Dictado vs Lectura).
 * 3. External State Control: El prop 'isProcessingExternal' permite al Orquestador 
 *    bloquear la interfaz de grabación mientras la IA transcribe o sube archivos, 
 *    evitando race conditions por doble click.
 */