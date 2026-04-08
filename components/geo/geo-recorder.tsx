/**
 * ARCHIVO: components/geo/geo-recorder.tsx
 * VERSIÓN: 4.0 (NicePod Sovereign Acoustic Emitter - Track Killer Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Proveer una interfaz de hardware puro para la captura acústica del Voyager,
 * garantizando el apagado atómico del micrófono para preservar la batería y la privacidad.
 * [REFORMA V4.0]: Implementación del 'Track Killer Protocol' para aniquilar el MediaStream, 
 * purga absoluta de memoria VRAM/RAM y cumplimiento estricto del Dogma Nominal.
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
 * INTERFAZ SOBERANA: GeoRecorderProperties
 */
export interface GeoRecorderProperties {
  mode: 'DICTATION' | 'CHRONICLE';
  narrativeScriptContent?: string;
  isExternalProcessActive: boolean;
  onCaptureCompletionAction: (capturedAudioBlob: Blob, recordingDurationSeconds: number) => Promise<void>;
}

/**
 * GeoRecorder: El Centinela Acústico de la Workstation.
 */
export function GeoRecorder({ 
  mode, 
  narrativeScriptContent, 
  isExternalProcessActive, 
  onCaptureCompletionAction 
}: GeoRecorderProperties) {
  
  const { toast } = useToast();

  // --- I. MÁQUINA DE ESTADOS DE HARDWARE ---
  const [hasMicrophoneHardwarePermission, setHasMicrophoneHardwarePermission] = useState<boolean>(false);
  const [isRecordingProcessActive, setIsRecordingProcessActive] = useState<boolean>(false);
  const [isPlaybackProcessActive, setIsPlaybackProcessActive] = useState<boolean>(false);
  
  const [capturedAudioBinaryBlob, setCapturedAudioBinaryBlob] = useState<Blob | null>(null);
  const [capturedAudioUniformResourceLocator, setCapturedAudioUniformResourceLocator] = useState<string | null>(null);
  const [recordingDurationSeconds, setRecordingDurationSeconds] = useState<number>(0);

  // --- II. REFERENCIAS DE MEMORIA Y HARDWARE (MutableRef) ---
  const mediaRecorderReference = useRef<MediaRecorder | null>(null);
  const activeAudioStreamReference = useRef<MediaStream | null>(null); // [NUEVO]: Track Killer Ref
  const audioChunksCollectionReference = useRef<Blob[]>([]);
  const timerIntervalReference = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerReference = useRef<HTMLAudioElement | null>(null);

  /**
   * cleanupAcousticMemory:
   * Misión: Revocar URLs de objetos y liberar buffers de audio para proteger la RAM.
   */
  const cleanupAcousticMemory = useCallback(() => {
    if (audioPlayerReference.current) {
      audioPlayerReference.current.pause();
      audioPlayerReference.current.removeAttribute('src'); // Forzamos la liberación del buffer
      audioPlayerReference.current.load();
    }
    
    if (capturedAudioUniformResourceLocator) {
      URL.revokeObjectURL(capturedAudioUniformResourceLocator);
      setCapturedAudioUniformResourceLocator(null);
    }
  }, [capturedAudioUniformResourceLocator]);

  /**
   * terminateActiveAudioTracks (The Track Killer):
   * Misión: Asesinar físicamente las pistas de audio para apagar la luz del micrófono en el SO.
   */
  const terminateActiveAudioTracks = useCallback(() => {
    if (activeAudioStreamReference.current) {
      activeAudioStreamReference.current.getTracks().forEach(audioTrack => {
        audioTrack.stop();
      });
      activeAudioStreamReference.current = null;
      nicepodLog(`🔇 [GeoRecorder:${mode}] Pistas de hardware aniquiladas.`);
    }
  }, [mode]);

  useEffect(() => {
    // Purga física de memoria y hardware al desmontar el componente.
    return () => {
      terminateActiveAudioTracks();
      cleanupAcousticMemory();
    };
  }, [cleanupAcousticMemory, terminateActiveAudioTracks]);

  /**
   * requestMicrophoneAuthority:
   * Misión: Solicitar el permiso de uso del bus de audio al navegador.
   */
  useEffect(() => {
    async function requestMicrophoneHardwarePermission() {
      if (typeof window === "undefined") return;

      try {
        const audioHardwareStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasMicrophoneHardwarePermission(true);
        // Liberamos el stream inmediatamente tras verificar el permiso.
        audioHardwareStream.getTracks().forEach(audioTrack => audioTrack.stop());
        nicepodLog(`🎙️ [GeoRecorder:${mode}] Autoridad acústica concedida.`);
      } catch (exception) {
        nicepodLog(`🛑 [GeoRecorder:${mode}] Hardware bloqueado por política de seguridad.`, exception, 'error');
        toast({
          title: "Acceso Interceptado",
          description: "Habilite el micrófono para registrar su peritaje en la Malla.",
          variant: "destructive"
        });
      }
    }
    requestMicrophoneHardwarePermission();
  }, [toast, mode]);

  /**
   * executeIgnitionOfRecording:
   * Misión: Iniciar la captura de audio abriendo un stream persistente.
   */
  const executeIgnitionOfRecording = async () => {
    if (!hasMicrophoneHardwarePermission) return;

    try {
      const audioHardwareStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeAudioStreamReference.current = audioHardwareStream; // Guardamos la referencia para el Killer

      const mediaRecorderInstance = new MediaRecorder(audioHardwareStream, { mimeType: 'audio/webm' });

      mediaRecorderReference.current = mediaRecorderInstance;
      audioChunksCollectionReference.current = [];

      mediaRecorderInstance.ondataavailable = (blobEvent: BlobEvent) => {
        if (blobEvent.data.size > 0) {
          audioChunksCollectionReference.current.push(blobEvent.data);
        }
      };

      mediaRecorderInstance.onstop = () => {
        const finalAudioBinaryBlob = new Blob(audioChunksCollectionReference.current, { type: 'audio/webm' });
        const generatedUniformResourceLocator = URL.createObjectURL(finalAudioBinaryBlob);
        
        setCapturedAudioBinaryBlob(finalAudioBinaryBlob);
        setCapturedAudioUniformResourceLocator(generatedUniformResourceLocator);
        
        // Apagado físico atómico (Track Killer)
        terminateActiveAudioTracks(); 
      };

      mediaRecorderInstance.start();
      setIsRecordingProcessActive(true);
      setRecordingDurationSeconds(0);

      timerIntervalReference.current = setInterval(() => {
        setRecordingDurationSeconds(previousDurationValue => previousDurationValue + 1);
      }, 1000);

      nicepodLog(`⏺️ [GeoRecorder:${mode}] Captura acústica en progreso.`);
    } catch (exception) {
      nicepodLog(`🔥 [GeoRecorder:${mode}] Fallo crítico en la ignición.`, exception, 'error');
      toast({ title: "Fallo de Hardware", description: "El dispositivo no respondió al comando.", variant: "destructive" });
    }
  };

  /**
   * executeCeaseOfRecording:
   * Misión: Detener la grabación y liberar el reloj del sistema.
   */
  const executeCeaseOfRecording = () => {
    if (mediaRecorderReference.current && isRecordingProcessActive) {
      mediaRecorderReference.current.stop();
      setIsRecordingProcessActive(false);
      
      if (timerIntervalReference.current) {
        clearInterval(timerIntervalReference.current);
      }
    }
  };

  /**
   * handleIntellectualEmissionAction:
   * Misión: Emitir el binario capturado hacia el componente orquestador.
   */
  const handleIntellectualEmissionAction = async () => {
    if (!capturedAudioBinaryBlob) return;
    nicepodLog(`📡 [GeoRecorder:${mode}] Emitiendo evidencia al orquestador.`);
    await onCaptureCompletionAction(capturedAudioBinaryBlob, recordingDurationSeconds);
  };

  /**
   * formatChronometryDisplay:
   * Utilidad de formato para cronometría industrial.
   */
  const formatChronometryDisplay = (totalSecondsCount: number) => {
    const calculatedMinutes = Math.floor(totalSecondsCount / 60);
    const calculatedSeconds = totalSecondsCount % 60;
    return `${calculatedMinutes}:${calculatedSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-5 w-full h-full min-h-0">

      {/* I. CHASIS DE CONTEXTO COGNITIVO */}
      {mode === 'CHRONICLE' ? (
        <div className="flex-1 bg-black/60 border border-white/5 rounded-2xl p-5 overflow-y-auto custom-scrollbar shadow-2xl backdrop-blur-xl">
          <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-3 sticky top-0 bg-transparent py-1">
            Narrativa de Inteligencia
          </h4>
          <p className="text-xl font-medium leading-relaxed text-zinc-100 whitespace-pre-wrap font-serif antialiased">
            {narrativeScriptContent || "Error de sincronía: No se recibió narrativa del Oráculo."}
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8 shadow-inner">
          <BrainCircuit className={cn(
            "h-16 w-16 transition-all duration-1000",
            isRecordingProcessActive ? "text-red-500 animate-pulse" : "text-zinc-700"
          )} />
          <h3 className="text-white font-black uppercase tracking-[0.4em] text-[10px] mt-8 mb-2">
            Dictado Sensorial Activo
          </h3>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-center leading-relaxed px-6">
            Hable con claridad. Su intención será transmutada en metadatos para la Bóveda.
          </p>
        </div>
      )}

      {/* II. CHASIS DE COMANDO TÁCTICO */}
      <div className="bg-white/[0.02] border-t border-white/5 -mx-6 -mb-6 p-6 mt-auto backdrop-blur-3xl">

        {/* Telemetría Acústica */}
        <div className="flex justify-between items-center mb-6 px-1">
          <div className="flex items-center gap-3">
            {isRecordingProcessActive && <div className="w-2 h-2 rounded-full bg-red-500 animate-ping shadow-[0_0_10px_rgba(239,68,68,0.4)]" />}
            <span className={cn("font-mono text-2xl font-black tracking-tighter", isRecordingProcessActive ? "text-red-400" : "text-zinc-600")}>
              {formatChronometryDisplay(recordingDurationSeconds)}
            </span>
          </div>
          {capturedAudioBinaryBlob && !isRecordingProcessActive && (
            <div className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="text-[8px] text-emerald-400 flex items-center gap-1.5 font-black uppercase tracking-[0.2em]">
                <CheckCircle2 className="h-3 w-3" /> Evidencia Consolidada
              </span>
            </div>
          )}
        </div>

        {/* Mallas de Acción (Botonera Táctica) */}
        <div className="flex gap-4 h-16">
          {!capturedAudioBinaryBlob ? (
            isRecordingProcessActive ? (
              <Button
                onClick={executeCeaseOfRecording}
                className="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 transition-all rounded-2xl"
              >
                <Square className="fill-current h-6 w-6" />
              </Button>
            ) : (
              <Button
                onClick={executeIgnitionOfRecording}
                disabled={!hasMicrophoneHardwarePermission || isExternalProcessActive}
                className="flex-1 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black text-[11px] tracking-[0.2em] shadow-xl uppercase"
              >
                <Mic className="mr-3 h-5 w-5" /> 
                {mode === 'CHRONICLE' ? "Iniciar Crónica" : "Capturar Dictado"}
              </Button>
            )
          ) : (
            <>
              {/* Acción: Reinicio Pericial */}
              <Button
                variant="outline"
                disabled={isExternalProcessActive}
                onClick={() => { 
                  cleanupAcousticMemory(); 
                  setCapturedAudioBinaryBlob(null); 
                  setRecordingDurationSeconds(0); 
                }}
                className="w-16 px-0 rounded-2xl border-white/10 bg-transparent text-zinc-500 hover:bg-white/5 hover:text-white transition-all"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>

              {/* Acción: Auditoría Acústica (Playback) */}
              <Button
                disabled={isExternalProcessActive}
                className="flex-1 flex gap-3 items-center justify-center bg-white/[0.03] hover:bg-white/[0.08] text-white rounded-2xl border border-white/5"
                onClick={() => {
                  if (audioPlayerReference.current) {
                    if (isPlaybackProcessActive) { 
                      audioPlayerReference.current.pause(); 
                      setIsPlaybackProcessActive(false); 
                    } else { 
                      audioPlayerReference.current.play(); 
                      setIsPlaybackProcessActive(true); 
                    }
                  }
                }}
              >
                {isPlaybackProcessActive ? <Square className="fill-current h-4 w-4" /> : <Play className="fill-current h-4 w-4 text-primary" />}
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">{isPlaybackProcessActive ? "PAUSAR" : "AUDITAR"}</span>
              </Button>

              {/* Acción: Emisión de Inteligencia */}
              <Button
                onClick={handleIntellectualEmissionAction}
                disabled={isExternalProcessActive}
                className="flex-1 bg-primary text-primary-foreground font-black text-[9px] tracking-[0.3em] rounded-2xl shadow-2xl shadow-primary/20 hover:opacity-90 uppercase group"
              >
                {isExternalProcessActive ? (
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

        {/* Puente de Audio Hardware (Invisible) */}
        {capturedAudioUniformResourceLocator && (
          <audio
            ref={audioPlayerReference}
            src={capturedAudioUniformResourceLocator}
            onEnded={() => setIsPlaybackProcessActive(false)}
            className="hidden"
          />
        )}
      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Track Killer Protocol: La implementación de 'terminateActiveAudioTracks' asegura 
 *    que el hardware del micrófono se libere atómicamente, eliminando la luz roja del SO 
 *    y previniendo el drenaje de batería.
 * 2. VRAM Hygiene: Se forzó la liberación del buffer del elemento <audio> ('removeAttribute') 
 *    antes de revocar la URL del objeto, resolviendo el memory leak en Safari.
 * 3. Zero Abbreviations Policy: Erradicación absoluta de términos ambiguos ('script', 
 *    'isProcessingExternal', 'audioBlob').
 */