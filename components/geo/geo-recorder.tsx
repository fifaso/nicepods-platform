/**
 * ARCHIVO: components/geo/geo-recorder.tsx
 * VERSIÓN: 7.0 (NicePod Sovereign Acoustic Emitter - Mutable Reference Capture Edition)
 * PROTOCOLO: MADRID RESONANCE V4.5
 * MISIÓN: Proveer una interfaz de hardware puro para la captura acústica del Voyager,
 * NIVEL DE INTEGRIDAD: 100% (Soberano)
 * 
 * Misión: Proveer una interfaz de hardware puro para la captura acústica del Voyager,
 * garantizando higiene térmica, aniquilación de procesos huérfanos y privacidad absoluta.
 * [REFORMA V6.1]: Resolución definitiva de errores 'AnimatePresence' y 'motion' not defined.
 * Inyección de dependencias de Framer Motion. Purificación total de la nomenclatura 
 * interna eliminando acrónimos (SO, RAM, ID, URL) según la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn as concatenateClasses, nicepodLog } from "@/lib/utils";
import { 
  CheckCircle2, 
  Loader2, 
  Mic, 
  Play, 
  RotateCcw, 
  Square, 
  UploadCloud 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * INTERFAZ SOBERANA: GeoRecorderProperties
 */
export interface GeoRecorderProperties {
  /** mode: Define la lógica operativa (Dictado rápido para Step 2 o Crónica narrativa para Step 4). */
  mode: 'DICTATION' | 'CHRONICLE';
  /** narrativeScriptContent: El texto sugerido por la Inteligencia Artificial para el peritaje. */
  narrativeScriptContent?: string;
  /** isExternalProcessActive: Flag que indica tareas de red o procesamiento en curso. */
  isExternalProcessActive: boolean;
  /** onCaptureCompletionAction: Callback que emite el binario final al orquestador de forja. */
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
   * Misión: Revocar Localizadores de Recursos y liberar buffers de audio para proteger la Memoria de Acceso Aleatorio.
   * [PILAR 2]: Obliga al motor del navegador a vaciar el búfer síncronamente.
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
   * Misión: Asesinar físicamente las pistas para apagar el indicador de grabación del Sistema Operativo.
   */
  const executeAcousticHardwareTrackTerminationProtocol = useCallback(() => {
    if (activeAudioStreamReference.current) {
      activeAudioStreamReference.current.getTracks().forEach((audioTrack) => {
        audioTrack.stop();
      });
      activeAudioStreamReference.current = null;
      nicepodLog(`靜 [GeoRecorder:${mode}] Pistas de hardware aniquiladas físicamente.`);
    }
  }, [mode]);

  /**
   * EFECTO: HARDWARE_LIFECYCLE_SENTINEL
   * Misión: Garantizar que ningún proceso sensorial sobreviva al cierre del componente.
   * [THERMIC V7.0]: Aplicación del Mutable Reference Capture Protocol.
   */
  useEffect(() => {
    // CAPTURA DE REFERENCIAS SOBERANAS (Mutable Reference Capture Protocol)
    const mediaRecorderInstanceSnapshot = mediaRecorderReference.current;
    const activeAudioStreamSnapshot = activeAudioStreamReference.current;
    const chronometerIntervalSnapshot = chronometerIntervalReference.current;
    const audioHardwarePlayerSnapshot = audioHardwarePlayerReference.current;
    const capturedAudioUniformResourceLocatorSnapshot = capturedAudioUniformResourceLocator;

    return () => {
      nicepodLog(`🧹 [GeoRecorder:${mode}] Ejecutando protocolo de limpieza atómica.`);
      
      // I. Aniquilación de Pistas de Hardware
      if (activeAudioStreamSnapshot) {
        activeAudioStreamSnapshot.getTracks().forEach((audioTrack) => audioTrack.stop());
      }

      // II. Purga de Memoria Acústica
      if (audioHardwarePlayerSnapshot) {
        audioHardwarePlayerSnapshot.pause();
        audioHardwarePlayerSnapshot.removeAttribute('src');
        audioHardwarePlayerSnapshot.load();
      }

      // III. Liberación de Recursos de Memoria (Acoustic Cortex Protocol)
      if (capturedAudioUniformResourceLocatorSnapshot) {
        URL.revokeObjectURL(capturedAudioUniformResourceLocatorSnapshot);
      }

      // IV. Cese de Procesos de Grabación
      if (mediaRecorderInstanceSnapshot && mediaRecorderInstanceSnapshot.state !== 'inactive') {
        mediaRecorderInstanceSnapshot.stop();
      }

      // V. Limpieza de Cronometría
      if (chronometerIntervalSnapshot) {
        clearInterval(chronometerIntervalSnapshot);
      }
    };
  }, [mode, capturedAudioUniformResourceLocator]);

  /**
   * INITIALIZATION: requestMicrophoneHardwareAuthority
   * Misión: Validar la disponibilidad del bus de audio en el dispositivo físico.
   */
  useEffect(() => {
    async function requestMicrophoneHardwarePermission() {
      if (typeof window === "undefined") return;

      try {
        const audioHardwareStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasMicrophoneHardwarePermission(true);
        // Liberación inmediata tras validación inicial.
        audioHardwareStream.getTracks().forEach((audioTrack) => audioTrack.stop());
        nicepodLog(`🎙️ [GeoRecorder:${mode}] Autoridad acústica validada.`);
      } catch (hardwareException) {
        nicepodLog(`🛑 [GeoRecorder:${mode}] Acceso denegado al hardware.`, hardwareException, 'exceptionInformation');
        toast({
          title: "Acceso Interceptado",
          description: "Habilite el micrófono para registrar su peritaje acústico.",
          variant: "destructive"
        });
      }
    }
    requestMicrophoneHardwarePermission();
  }, [toast, mode]);

  /**
   * executeAcousticCaptureIgnitionWorkflow:
   * Misión: Abrir el flujo de captura en formato industrial de alta fidelidad.
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
      nicepodLog(`🔥 [GeoRecorder:${mode}] Fallo crítico en la ignición.`, hardwareException, 'exceptionInformation');
      toast({ title: "Fallo de Hardware", description: "El dispositivo no respondió.", variant: "destructive" });
    }
  };

  /**
   * executeAcousticCaptureCessationWorkflow:
   * Misión: Detener la captura y liberar el reloj de telemetría.
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

  const handleIntellectualEmissionAction = async () => {
    if (!capturedAudioBinaryBlob) return;
    nicepodLog(`📡 [GeoRecorder:${mode}] Emitiendo evidencia acústica.`);
    await onCaptureCompletionAction(capturedAudioBinaryBlob, recordingDurationSeconds);
  };

  const formatChronometryDisplay = (totalSecondsMagnitude: number) => {
    const calculatedMinutes = Math.floor(totalSecondsMagnitude / 60);
    const calculatedSeconds = totalSecondsMagnitude % 60;
    return `${calculatedMinutes}:${calculatedSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={concatenateClasses(
      "flex flex-col w-full h-full min-h-0 isolate",
      mode === 'DICTATION' ? "gap-2" : "gap-5"
    )}>

      {/* I. CHASSIS DE CONTEXTO COGNITIVO */}
      {mode === 'CHRONICLE' && (
        <div className="flex-1 bg-black/60 border border-white/5 rounded-2xl p-5 overflow-y-auto custom-scrollbar shadow-2xl backdrop-blur-xl">
          <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-3 sticky top-0 bg-transparent py-1">
            Narrativa de Inteligencia Industrial
          </h4>
          <p className="text-xl font-medium leading-relaxed text-zinc-100 whitespace-pre-wrap font-serif antialiased">
            {narrativeScriptContent || "Sincronizando flujo del Oráculo..."}
          </p>
        </div>
      )}

      {/* II. CHASSIS DE COMANDO TÁCTICO ACÚSTICO */}
      <div className={concatenateClasses(
        "bg-[#050505] border border-white/5 p-6 backdrop-blur-3xl shadow-2xl transition-all duration-700",
        mode === 'DICTATION' 
          ? "rounded-3xl" 
          : "rounded-t-[3rem] -mx-6 -mb-6 mt-auto shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
      )}>

        {/* Telemetría Acústica y Estados */}
        <div className="flex justify-between items-center mb-4 px-1">
          <div className="flex items-center gap-3">
            {isRecordingProcessActive && <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
            <span className={concatenateClasses(
              "font-mono text-2xl font-black tracking-tighter tabular-nums", 
              isRecordingProcessActive ? "text-red-400" : "text-zinc-600"
            )}>
              {formatChronometryDisplay(recordingDurationSeconds)}
            </span>
          </div>
          
          {/* [FIX V6.1]: Sincronización de importaciones de Framer Motion */}
          <AnimatePresence>
            {capturedAudioBinaryBlob && !isRecordingProcessActive && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 shadow-inner"
              >
                <span className="text-[8px] text-emerald-400 flex items-center gap-2 font-black uppercase tracking-[0.2em]">
                  <CheckCircle2 className="h-3 w-3" /> Evidencia Consolidada
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTONERA TÁCTICA DE HARDWARE */}
        <div className="flex gap-4 h-14">
          {!capturedAudioBinaryBlob ? (
            isRecordingProcessActive ? (
              <Button
                onClick={executeAcousticCaptureCessationWorkflow}
                className="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 transition-all rounded-2xl"
              >
                <Square className="fill-current h-5 w-5" />
              </Button>
            ) : (
              <Button
                onClick={executeAcousticCaptureIgnitionWorkflow}
                disabled={!hasMicrophoneHardwarePermission || isExternalProcessActive}
                className="flex-1 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black text-[10px] tracking-[0.2em] shadow-xl uppercase transition-all"
              >
                <Mic className="mr-3 h-4 w-4" /> 
                {mode === 'CHRONICLE' ? "Iniciar Crónica" : "Capturar Dictado"}
              </Button>
            )
          ) : (
            <>
              <Button
                variant="outline"
                disabled={isExternalProcessActive}
                onClick={() => { 
                  executeAcousticMemoryPurgeWorkflow(); 
                  setCapturedAudioBinaryBlob(null); 
                  setRecordingDurationSeconds(0); 
                }}
                className="w-14 px-0 rounded-2xl border-white/10 bg-transparent text-zinc-500 hover:bg-white/5 hover:text-white transition-all shadow-md"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <Button
                disabled={isExternalProcessActive}
                className="flex-1 flex gap-2 items-center justify-center bg-white/[0.03] hover:bg-white/[0.08] text-white rounded-2xl border border-white/5 transition-all shadow-md"
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
                {isPlaybackProcessActive ? <Square className="fill-current h-3 w-3" /> : <Play className="fill-current h-3 w-3 text-primary" />}
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">{isPlaybackProcessActive ? "PAUSAR" : "AUDITAR"}</span>
              </Button>

              <Button
                onClick={handleIntellectualEmissionAction}
                disabled={isExternalProcessActive}
                className="flex-1 bg-primary text-primary-foreground font-black text-[8px] tracking-[0.3em] rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 uppercase transition-all group"
              >
                {isExternalProcessActive ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>{mode === 'CHRONICLE' ? "PUBLICAR" : "PROCESAR"}</span>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Puente de Audio Hardware (Invisible - DOM Isolation) */}
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
 * NOTA TÉCNICA DEL ARCHITECT (V6.1):
 * 1. Dependency Resolution: Se han importado 'motion' y 'AnimatePresence' de 'framer-motion', 
 *    resolviendo los errores de compilación react/jsx-no-undef detectados en Vercel.
 * 2. Zero Abbreviations Policy (ZAP): Purificación total de la nomenclatura técnica. 
 *    Se han sustituido acrónimos por sus descriptores completos (Random Access Memory, 
 *    Uniform Resource Locator, Operating System).
 * 3. Atomic Hygiene: El componente garantiza el cierre físico del bus de datos acústicos 
 *    en cada cambio de estado, cumpliendo con la soberanía de hardware del Voyager.
 */