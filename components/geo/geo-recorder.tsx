/**
 * ARCHIVO: components/geo/geo-recorder.tsx
 * VERSIÓN: 5.0 (NicePod Sovereign Acoustic Emitter - Industrial Hardware & Memory Purge Edition)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * 
 * Misión: Proveer una interfaz de hardware puro para la captura acústica del Voyager,
 * garantizando higiene térmica, aniquilación de procesos huérfanos y privacidad absoluta
 * mediante la desconexión física de transductores.
 * [REFORMA V5.0]: Implementación absoluta de la Zero Abbreviations Policy (ZAP). 
 * Refuerzo del protocolo de purga de memoria RAM acústica y aniquilación de pistas 
 * de hardware (Track Killer) sincronizado con el ciclo de vida de React.
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
  /** mode: Define la lógica operativa (Dictado rápido o Crónica narrativa). */
  mode: 'DICTATION' | 'CHRONICLE';
  /** narrativeScriptContent: El texto sugerido por el Oráculo para el peritaje. */
  narrativeScriptContent?: string;
  /** isExternalProcessActive: Flag que indica tareas de red o IA en curso. */
  isExternalProcessActive: boolean;
  /** onCaptureCompletionAction: Callback que emite el binario final al orquestador. */
  onCaptureCompletionAction: (capturedAudioBinaryBlob: Blob, recordingDurationSeconds: number) => Promise<void>;
}

/**
 * GeoRecorder: El Centinela Acústico de la Workstation NicePod.
 */
export function GeoRecorder({ 
  mode, 
  narrativeScriptContent, 
  isExternalProcessActive, 
  onCaptureCompletionAction 
}: GeoRecorderProperties) {
  
  const { toast } = useToast();

  // --- I. MÁQUINA DE ESTADOS DE HARDWARE (NOMINAL INTEGRITY) ---
  const [hasMicrophoneHardwarePermission, setHasMicrophoneHardwarePermission] = useState<boolean>(false);
  const [isRecordingProcessActive, setIsRecordingProcessActive] = useState<boolean>(false);
  const [isPlaybackProcessActive, setIsPlaybackProcessActive] = useState<boolean>(false);
  
  const [capturedAudioBinaryBlob, setCapturedAudioBinaryBlob] = useState<Blob | null>(null);
  const [capturedAudioUniformResourceLocator, setCapturedAudioUniformResourceLocator] = useState<string | null>(null);
  const [recordingDurationSeconds, setRecordingDurationSeconds] = useState<number>(0);

  // --- II. REFERENCIAS DE MEMORIA Y HARDWARE (MUTABLE REFERENCES - PILAR 4) ---
  const mediaRecorderReference = useRef<MediaRecorder | null>(null);
  const activeAudioStreamReference = useRef<MediaStream | null>(null); 
  const audioChunksCollectionReference = useRef<Blob[]>([]);
  const chronometerIntervalReference = useRef<NodeJS.Timeout | null>(null);
  const audioHardwarePlayerReference = useRef<HTMLAudioElement | null>(null);

  /**
   * executeAcousticMemoryPurgeWorkflow:
   * Misión: Revocar URLs de objetos y liberar buffers de audio para proteger la RAM.
   * [PILAR 2]: Obliga al motor Webkit/Blink a vaciar el búfer síncronamente.
   */
  const executeAcousticMemoryPurgeWorkflow = useCallback(() => {
    if (audioHardwarePlayerReference.current) {
      audioHardwarePlayerReference.current.pause();
      audioHardwarePlayerReference.current.removeAttribute('src'); 
      audioHardwarePlayerReference.current.load();
    }
    
    if (capturedAudioUniformResourceLocator) {
      URL.revokeObjectURL(capturedAudioUniformResourceLocator);
      setCapturedAudioUniformResourceLocator(null);
    }
  }, [capturedAudioUniformResourceLocator]);

  /**
   * executeAcousticHardwareTrackTerminationProtocol (The Track Killer):
   * Misión: Asesinar físicamente las pistas para apagar el indicador de grabación del SO.
   * Garantiza la privacidad y el aislamiento térmico del terminal.
   */
  const executeAcousticHardwareTrackTerminationProtocol = useCallback(() => {
    if (activeAudioStreamReference.current) {
      activeAudioStreamReference.current.getTracks().forEach((audioTrack) => {
        audioTrack.stop();
      });
      activeAudioStreamReference.current = null;
      nicepodLog(`🔇 [GeoRecorder:${mode}] Pistas de hardware aniquiladas físicamente.`);
    }
  }, [mode]);

  /**
   * EFECTO: HARDWARE_LIFECYCLE_SENTINEL
   * Misión: Garantizar que ningún proceso sensorial sobreviva al cierre del componente.
   */
  useEffect(() => {
    return () => {
      nicepodLog(`🧹 [GeoRecorder:${mode}] Ejecutando protocolo de limpieza atómica.`);
      executeAcousticHardwareTrackTerminationProtocol();
      executeAcousticMemoryPurgeWorkflow();
      
      if (chronometerIntervalReference.current) {
        clearInterval(chronometerIntervalReference.current);
      }
    };
  }, [executeAcousticMemoryPurgeWorkflow, executeAcousticHardwareTrackTerminationProtocol, mode]);

  /**
   * INITIALIZATION: requestMicrophoneHardwareAuthority
   * Misión: Validar la disponibilidad del bus de audio en el dispositivo.
   */
  useEffect(() => {
    async function requestMicrophoneHardwarePermission() {
      if (typeof window === "undefined") return;

      try {
        const audioHardwareStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasMicrophoneHardwarePermission(true);
        // Liberación inmediata tras validación inicial del bus.
        audioHardwareStream.getTracks().forEach((audioTrack) => audioTrack.stop());
        nicepodLog(`🎙️ [GeoRecorder:${mode}] Autoridad acústica concedida por el sistema operativo.`);
      } catch (hardwareException) {
        nicepodLog(`🛑 [GeoRecorder:${mode}] Hardware interceptado por política de seguridad.`, hardwareException, 'error');
        toast({
          title: "Acceso Interceptado",
          description: "Habilite el micrófono en los ajustes del sitio para registrar su peritaje.",
          variant: "destructive"
        });
      }
    }
    requestMicrophoneHardwarePermission();
  }, [toast, mode]);

  /**
   * executeAcousticCaptureIgnitionWorkflow:
   * Misión: Abrir el flujo de captura en formato industrial de alta fidelidad (WebM).
   */
  const executeAcousticCaptureIgnitionWorkflow = async () => {
    if (!hasMicrophoneHardwarePermission) return;

    try {
      const audioHardwareStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeAudioStreamReference.current = audioHardwareStream;

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
        
        // Ejecución inmediata del Track Killer post-captura.
        executeAcousticHardwareTrackTerminationProtocol(); 
      };

      mediaRecorderInstance.start();
      setIsRecordingProcessActive(true);
      setRecordingDurationSeconds(0);

      chronometerIntervalReference.current = setInterval(() => {
        setRecordingDurationSeconds((previousDurationValue) => previousDurationValue + 1);
      }, 1000);

      nicepodLog(`⏺️ [GeoRecorder:${mode}] Captura acústica en progreso.`);
    } catch (hardwareException) {
      nicepodLog(`🔥 [GeoRecorder:${mode}] Fallo crítico en la ignición del bus de audio.`, hardwareException, 'error');
      toast({ 
        title: "Fallo de Hardware", 
        description: "El dispositivo no respondió al comando de grabación.", 
        variant: "destructive" 
      });
    }
  };

  /**
   * executeAcousticCaptureCessationWorkflow:
   * Misión: Detener la captura y liberar el reloj de telemetría acústica.
   */
  const executeAcousticCaptureCessationWorkflow = () => {
    if (mediaRecorderReference.current && isRecordingProcessActive) {
      mediaRecorderReference.current.stop();
      setIsRecordingProcessActive(false);
      
      if (chronometerIntervalReference.current) {
        clearInterval(chronometerIntervalReference.current);
      }
    }
  };

  /**
   * handleIntellectualEmissionAction:
   * Misión: Traspasar el binario acústico consolidado al orquestador de forja superior.
   */
  const handleIntellectualEmissionAction = async () => {
    if (!capturedAudioBinaryBlob) return;
    nicepodLog(`📡 [GeoRecorder:${mode}] Emitiendo evidencia acústica al orquestador.`);
    await onCaptureCompletionAction(capturedAudioBinaryBlob, recordingDurationSeconds);
  };

  /**
   * formatChronometryDisplay:
   * Misión: Formatear la magnitud temporal para visualización industrial (00:00).
   */
  const formatChronometryDisplay = (totalSecondsMagnitude: number) => {
    const calculatedMinutes = Math.floor(totalSecondsMagnitude / 60);
    const calculatedSeconds = totalSecondsMagnitude % 60;
    return `${calculatedMinutes}:${calculatedSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-5 w-full h-full min-h-0 isolate">

      {/* I. CHASSIS DE CONTEXTO COGNITIVO */}
      {mode === 'CHRONICLE' ? (
        <div className="flex-1 bg-black/60 border border-white/5 rounded-2xl p-5 overflow-y-auto custom-scrollbar shadow-2xl backdrop-blur-xl">
          <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-3 sticky top-0 bg-transparent py-1">
            Narrativa de Inteligencia Industrial
          </h4>
          <p className="text-xl font-medium leading-relaxed text-zinc-100 whitespace-pre-wrap font-serif antialiased selection:bg-primary/30">
            {narrativeScriptContent || "Sincronizando flujo del Oráculo..."}
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8 shadow-inner">
          <BrainCircuit className={cn(
            "h-16 w-16 transition-all duration-1000",
            isRecordingProcessActive ? "text-red-500 animate-pulse scale-110" : "text-zinc-700"
          )} />
          <h3 className="text-white font-black uppercase tracking-[0.4em] text-[10px] mt-8 mb-2">
            Dictado Sensorial Activo
          </h3>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-center leading-relaxed px-6">
            Sintonice su intención cognitiva. La voz será transmutada en capital intelectual digital.
          </p>
        </div>
      )}

      {/* II. CHASSIS DE COMANDO TÁCTICO ACÚSTICO */}
      <div className="bg-[#050505] border-t border-white/5 -mx-6 -mb-6 p-6 mt-auto backdrop-blur-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">

        {/* TELEMETRÍA ACÚSTICA EN TIEMPO REAL */}
        <div className="flex justify-between items-center mb-6 px-1">
          <div className="flex items-center gap-3">
            {isRecordingProcessActive && <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
            <span className={cn("font-mono text-2xl font-black tracking-tighter tabular-nums", isRecordingProcessActive ? "text-red-400" : "text-zinc-600")}>
              {formatChronometryDisplay(recordingDurationSeconds)}
            </span>
          </div>
          {capturedAudioBinaryBlob && !isRecordingProcessActive && (
            <div className="bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 shadow-inner">
              <span className="text-[8px] text-emerald-400 flex items-center gap-2 font-black uppercase tracking-[0.2em]">
                <CheckCircle2 className="h-3 w-3" /> Evidencia Consolidada
              </span>
            </div>
          )}
        </div>

        {/* MALLAS DE ACCIÓN (BOTONERA TÁCTICA) */}
        <div className="flex gap-4 h-16">
          {!capturedAudioBinaryBlob ? (
            isRecordingProcessActive ? (
              <Button
                onClick={executeAcousticCaptureCessationWorkflow}
                className="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 transition-all rounded-2xl"
              >
                <Square className="fill-current h-6 w-6" />
              </Button>
            ) : (
              <Button
                onClick={executeAcousticCaptureIgnitionWorkflow}
                disabled={!hasMicrophoneHardwarePermission || isExternalProcessActive}
                className="flex-1 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black text-[11px] tracking-[0.2em] shadow-xl uppercase transition-all"
              >
                <Mic className="mr-3 h-5 w-5" /> 
                {mode === 'CHRONICLE' ? "Iniciar Crónica" : "Capturar Dictado"}
              </Button>
            )
          ) : (
            <>
              {/* Acción: Reinicio Pericial (Recaptura) */}
              <Button
                variant="outline"
                disabled={isExternalProcessActive}
                onClick={() => { 
                  executeAcousticMemoryPurgeWorkflow(); 
                  setCapturedAudioBinaryBlob(null); 
                  setRecordingDurationSeconds(0); 
                }}
                className="w-16 px-0 rounded-2xl border-white/10 bg-transparent text-zinc-500 hover:bg-white/5 hover:text-white transition-all shadow-md"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>

              {/* Acción: Auditoría Acústica (Playback Local) */}
              <Button
                disabled={isExternalProcessActive}
                className="flex-1 flex gap-3 items-center justify-center bg-white/[0.03] hover:bg-white/[0.08] text-white rounded-2xl border border-white/5 transition-all shadow-md"
                onClick={() => {
                  if (audioHardwarePlayerReference.current) {
                    if (isPlaybackProcessActive) { 
                      audioHardwarePlayerReference.current.pause(); 
                      setIsPlaybackProcessActive(false); 
                    } else { 
                      audioHardwarePlayerReference.current.play(); 
                      setIsPlaybackProcessActive(true); 
                    }
                  }
                }}
              >
                {isPlaybackProcessActive ? <Square className="fill-current h-4 w-4" /> : <Play className="fill-current h-4 w-4 text-primary" />}
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">{isPlaybackProcessActive ? "PAUSAR" : "AUDITAR"}</span>
              </Button>

              {/* Acción: Emisión de Inteligencia (Commit) */}
              <Button
                onClick={handleIntellectualEmissionAction}
                disabled={isExternalProcessActive}
                className="flex-1 bg-primary text-primary-foreground font-black text-[9px] tracking-[0.3em] rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 uppercase group transition-all"
              >
                {isExternalProcessActive ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <div className="flex items-center gap-2.5">
                    <UploadCloud className="h-5 w-5 group-hover:-translate-y-1 transition-transform" /> 
                    <span>{mode === 'CHRONICLE' ? "PUBLICAR" : "PROCESAR"}</span>
                  </div>
                )}
              </Button>
            </>
          )}
        </div>

        {/* PUENTE DE AUDIO HARDWARE (INVISIBLE - DOM ISOLATION) */}
        {capturedAudioUniformResourceLocator && (
          <audio
            ref={audioHardwarePlayerReference}
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
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Hardware Track Killer: Se garantiza la aniquilación de MediaStreamTracks tanto al detener 
 *    la grabación como al desmontar el componente, eliminando fugas térmicas y de privacidad.
 * 2. RAM Flush Protocol: El vaciado del búfer de audio ('removeAttribute(source)') es mandatorio 
 *    antes de revocar la URL del objeto para liberar memoria en Safari iOS de forma inmediata.
 * 3. Zero Abbreviations Policy (ZAP): Refactorización nominal de todas las funciones 
 *    y referencias (chronometerIntervalReference, audioHardwarePlayerReference, etc.).
 */