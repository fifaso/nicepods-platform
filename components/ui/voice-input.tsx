// components/ui/voice-input.tsx
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Sparkles, Loader2, Zap, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, getSharedAudioCtx } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

const MAX_RECORDING_MS = 10000;
const UPDATE_INTERVAL_MS = 100;

interface VoiceInputProps {
  onTextGenerated: (text: string) => void;
  className?: string;
}

export function VoiceInput({ onTextGenerated, className }: VoiceInputProps) {
  const [status, setStatus] = useState<'idle' | 'recording-clarify' | 'recording-fast' | 'processing'>('idle');
  const [progress, setProgress] = useState(100);
  const [timeLeft, setTimeLeft] = useState(10);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervals = useRef<{ timer: any, progress: any }>({ timer: null, progress: null });

  const { toast } = useToast();
  const supabase = createClient();

  const playTone = (type: 'start' | 'end' | 'error') => {
    const ctx = getSharedAudioCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'start') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.1);
    } else if (type === 'end') {
      osc.frequency.setValueAtTime(660, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.2);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
    }
    osc.start();
    osc.stop(now + 0.3);
  };

  const stopRecording = useCallback(() => {
    if (intervals.current.progress) clearInterval(intervals.current.progress);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startRecording = useCallback(async (mode: 'clarify' | 'fast') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      playTone('start');

      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);

      mediaRecorderRef.current.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        if (chunksRef.current.length > 0) {
          setStatus('processing');
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('audio', audioBlob);
          formData.append('mode', mode);

          const { data, error } = await supabase.functions.invoke('transcribe-idea', { body: formData });
          if (error || !data?.success) throw new Error("Fallo en transcripción");

          onTextGenerated(data.clarified_text);
          playTone('end');
        }
        setStatus('idle');
        setProgress(100);
      };

      mediaRecorderRef.current.start();
      setStatus(mode === 'clarify' ? 'recording-clarify' : 'recording-fast');

      const start = Date.now();
      intervals.current.progress = setInterval(() => {
        const elapsed = Date.now() - start;
        const remain = Math.max(0, MAX_RECORDING_MS - elapsed);
        setProgress((remain / MAX_RECORDING_MS) * 100);
        setTimeLeft(Math.ceil(remain / 1000));
        if (remain <= 0) stopRecording();
      }, UPDATE_INTERVAL_MS);

    } catch (err) {
      toast({ title: "Error", description: "Acceso al micrófono denegado.", variant: "destructive" });
    }
  }, [supabase, onTextGenerated, toast, stopRecording]);

  return (
    <div className={cn("w-full", className)}>
      {status === 'idle' ? (
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => startRecording('clarify')} className="h-12 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all active:scale-95">
            <Sparkles className="h-5 w-5 mr-2" /> Idea Mágica
          </Button>
          <Button onClick={() => startRecording('fast')} variant="secondary" className="h-12 rounded-full font-bold transition-all active:scale-95">
            <Zap className="h-5 w-5 mr-2 text-amber-500" /> Dictar
          </Button>
        </div>
      ) : status === 'processing' ? (
        <div className="h-12 rounded-full border border-purple-500/30 flex items-center justify-center gap-3 bg-purple-500/5 animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
          <span className="text-sm font-bold text-purple-200 uppercase tracking-tighter">Procesando Voz...</span>
        </div>
      ) : (
        <div className="relative h-12 rounded-full overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-between px-4">
          <div className="absolute inset-y-0 left-0 bg-primary/20 transition-all duration-100" style={{ width: `${progress}%` }} />
          <div className="relative flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono font-bold text-sm text-white">00:{timeLeft.toString().padStart(2, '0')}</span>
          </div>
          <Button size="sm" variant="ghost" onClick={stopRecording} className="relative h-8 w-8 p-0 rounded-full hover:bg-red-500/20 text-red-500">
            <Square className="h-4 w-4 fill-current" />
          </Button>
        </div>
      )}
    </div>
  );
}