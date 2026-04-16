/**
 * ARCHIVE: components/ui/voice-input.tsx
 * VERSION: 4.0 (NicePod Voice Input - Acoustic Transcription Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * MISSION: Provide a high-fidelity interface for capturing acoustic intelligence
 * and orchestrating serverless transcription workflows.
 * INTEGRITY LEVEL: 100% (Soberano / No abbreviations / Production-Ready)
 */

"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { classNamesUtility, getSharedAudioCtx } from "@/lib/utils";
import { Loader2, Sparkles, Square, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const MAXIMUM_RECORDING_DURATION_MILLISECONDS = 10000;

/**
 * INTERFACE: VoiceInputComponentProperties
 */
interface VoiceInputComponentProperties {
  onTextGeneratedAction: (generatedText: string) => void;
  /** className: Alias de compatibilidad axial. */
  className?: string;
  additionalTailwindClassName?: string;
}

/**
 * VoiceInput: The tactical acoustic terminal for cognitive dictation.
 */
export function VoiceInput({
  onTextGeneratedAction,
  className,
  additionalTailwindClassName
}: VoiceInputComponentProperties) {

  const resolvedClassName = className || additionalTailwindClassName;

  const [operationalStatus, setOperationalStatus] = useState<'idle' | 'recording-clarify' | 'recording-fast' | 'processing'>('idle');
  const [recordingProgressPercentage, setRecordingProgressPercentage] = useState(100);
  const [remainingSecondsMagnitude, setRemainingSecondsMagnitude] = useState(10);

  const mediaRecorderReference = useRef<MediaRecorder | null>(null);
  const capturedAudioChunksReference = useRef<Blob[]>([]);
  const animationFrameReference = useRef<number>();
  const recordingStartTimeReference = useRef<number>(0);

  const { toast } = useToast();
  const supabaseSovereignClient = createClient();

  /**
   * playHapticTone:
   * Mission: Provide auditory feedback for state transitions.
   */
  const playHapticTone = (toneType: 'start' | 'end' | 'error') => {
    const audioContextInstance = getSharedAudioCtx();
    if (!audioContextInstance) return;

    if (audioContextInstance.state === 'suspended') {
        audioContextInstance.resume();
    }

    const oscillatorNode = audioContextInstance.createOscillator();
    const gainNode = audioContextInstance.createGain();

    oscillatorNode.connect(gainNode);
    gainNode.connect(audioContextInstance.destination);

    const currentTimestamp = audioContextInstance.currentTime;

    if (toneType === 'start') {
      oscillatorNode.frequency.setValueAtTime(440, currentTimestamp);
      oscillatorNode.frequency.exponentialRampToValueAtTime(880, currentTimestamp + 0.1);
      gainNode.gain.setValueAtTime(0.05, currentTimestamp);
    } else if (toneType === 'end') {
      oscillatorNode.frequency.setValueAtTime(660, currentTimestamp);
      gainNode.gain.setValueAtTime(0.05, currentTimestamp);
    } else {
      oscillatorNode.type = 'sawtooth';
      oscillatorNode.frequency.setValueAtTime(220, currentTimestamp);
      gainNode.gain.setValueAtTime(0.05, currentTimestamp);
    }

    oscillatorNode.start();
    oscillatorNode.stop(currentTimestamp + 0.2);
  };

  const stopRecordingSequenceAction = useCallback(() => {
    if (animationFrameReference.current) {
        cancelAnimationFrame(animationFrameReference.current);
    }
    if (mediaRecorderReference.current && mediaRecorderReference.current.state !== "inactive") {
      mediaRecorderReference.current.stop();
    }
  }, []);

  const executeAnimationLoopAction = useCallback(() => {
    const currentTimestamp = Date.now();
    const elapsedMilliseconds = currentTimestamp - recordingStartTimeReference.current;
    const remainingMilliseconds = Math.max(0, MAXIMUM_RECORDING_DURATION_MILLISECONDS - elapsedMilliseconds);

    setRecordingProgressPercentage((remainingMilliseconds / MAXIMUM_RECORDING_DURATION_MILLISECONDS) * 100);
    setRemainingSecondsMagnitude(Math.ceil(remainingMilliseconds / 1000));

    if (remainingMilliseconds > 0) {
      animationFrameReference.current = requestAnimationFrame(executeAnimationLoopAction);
    } else {
      stopRecordingSequenceAction();
    }
  }, [stopRecordingSequenceAction]);

  const startRecordingSequenceAction = useCallback(async (recordingMode: 'clarify' | 'fast') => {
    try {
      const mediaStreamInstance = await navigator.mediaDevices.getUserMedia({ audio: true });
      playHapticTone('start');

      mediaRecorderReference.current = new MediaRecorder(mediaStreamInstance);
      capturedAudioChunksReference.current = [];

      mediaRecorderReference.current.ondataavailable = (dataAvailableEvent) => {
        capturedAudioChunksReference.current.push(dataAvailableEvent.data);
      };

      mediaRecorderReference.current.onstop = async () => {
        mediaStreamInstance.getTracks().forEach(audioTrack => audioTrack.stop());

        if (capturedAudioChunksReference.current.length > 0) {
          setOperationalStatus('processing');
          const audioBinaryBlob = new Blob(capturedAudioChunksReference.current, { type: 'audio/webm' });
          const multiPartFormData = new FormData();

          multiPartFormData.append('audio', audioBinaryBlob);
          multiPartFormData.append('mode', recordingMode);

          const { data, error: invocationException } = await supabaseSovereignClient.functions.invoke('transcribe-idea', { body: multiPartFormData });

          if (invocationException || !data?.success) {
            throw new Error("Fallo en la sincronización de la transcripción.");
          }

          onTextGeneratedAction(data.clarified_text);
          playHapticTone('end');
        }
        setOperationalStatus('idle');
        setRecordingProgressPercentage(100);
      };

      mediaRecorderReference.current.start();
      setOperationalStatus(recordingMode === 'clarify' ? 'recording-clarify' : 'recording-fast');

      recordingStartTimeReference.current = Date.now();
      animationFrameReference.current = requestAnimationFrame(executeAnimationLoopAction);

    } catch (hardwareException) {
      toast({
        title: "Fallo de Hardware",
        description: "Acceso al micrófono denegado o interrumpido.",
        variant: "destructive"
      });
    }
  }, [supabaseSovereignClient, onTextGeneratedAction, toast, executeAnimationLoopAction]);

  useEffect(() => {
    return () => {
        if (animationFrameReference.current) {
            cancelAnimationFrame(animationFrameReference.current);
        }
    };
  }, []);

  return (
    <div className={classNamesUtility("w-full", resolvedClassName)}>
      {operationalStatus === 'idle' ? (
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => startRecordingSequenceAction('clarify')}
            className="h-12 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all active:scale-95 shadow-md"
          >
            <Sparkles className="h-5 w-5 mr-2" /> Idea Mágica
          </Button>
          <Button
            onClick={() => startRecordingSequenceAction('fast')}
            variant="secondary"
            className="h-12 rounded-full font-bold transition-all active:scale-95 border-border/40"
          >
            <Zap className="h-5 w-5 mr-2 text-amber-500" /> Dictar
          </Button>
        </div>
      ) : operationalStatus === 'processing' ? (
        <div className="h-12 rounded-full border border-purple-500/30 flex items-center justify-center gap-3 bg-purple-500/5 animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
          <span className="text-sm font-bold text-purple-200 uppercase tracking-tighter">Procesando Inteligencia...</span>
        </div>
      ) : (
        <div className="relative h-12 rounded-full overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-between px-4">
          <div
            className="absolute inset-y-0 left-0 bg-primary/20 transition-all duration-100 ease-linear"
            style={{ width: `${recordingProgressPercentage}%` }}
          />
          <div className="relative flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono font-bold text-sm text-white">
                00:{remainingSecondsMagnitude.toString().padStart(2, '0')}
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={stopRecordingSequenceAction}
            className="relative h-8 w-8 p-0 rounded-full hover:bg-red-500/20 text-red-500"
          >
            <Square className="h-4 w-4 fill-current" />
          </Button>
        </div>
      )}
    </div>
  );
}
