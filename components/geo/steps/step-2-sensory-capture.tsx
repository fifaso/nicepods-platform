// components/geo/steps/step-2-sensory-capture.tsx
// VERSIÓN: 4.5 (NicePod Sovereign Sensory Capture - Final Build Safe Edition)
// Misión: Captura multimodal avanzada con reporte de errores en tiempo real y UI ergonómica.
// [ESTABILIZACIÓN]: Corrección de Variable Huérfana (TS2304) y saneamiento acústico total.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronLeft,
  FileText,
  Loader2,
  Mic,
  Volume2,
  X,
  Play,
  Trash2,
  Plus,
  Pause,
  BrainCircuit,
  RefreshCw,
  AlertTriangle,
  Image as ImageIcon
} from "lucide-react";
import Image from "next/image";
import React, { useRef, useState, useEffect, useCallback } from "react";

// --- INFRAESTRUCTURA SOBERANA ---
import { useForge } from "../forge-context";
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// [IA SENSORIAL]: Pasarela directa para transcripción (STT)
import { transcribeVoiceIntentAction } from "@/actions/geo-actions";

export function StepSensoryCapture() {
  const { state, dispatch, prevStep } = useForge();
  const geoEngine = useGeoEngine();

  // Consumimos el estado de error del motor para mostrarlo al Admin
  const { status: engineStatus, data: engineData } = geoEngine;

  // --- ESTADOS DE PREVISUALIZACIÓN LOCAL ---
  const [heroUrl, setHeroUrl] = useState<string | null>(null);
  const [ocrUrls, setOcrUrls] = useState<string[]>([]);
  // [FIX TS2304]: Variable unificada de Paisaje Sonoro
  const [ambientAudioUrl, setAmbientAudioUrl] = useState<string | null>(null);
  
  // Estados Operativos
  const [isRecordingAmbient, setIsRecordingAmbient] = useState(false);
  const [isRecordingIntent, setIsRecordingIntent] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);

  // Referencias de Hardware
  const heroInputRef = useRef<HTMLInputElement>(null);
  const ocrInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  /**
   * ---------------------------------------------------------------------------
   * I. PROTOCOLO DE HIGIENE DE RAM
   * ---------------------------------------------------------------------------
   */

  useEffect(() => {
    if (!state.heroImageFile) {
      setHeroUrl(null);
      return;
    }
    const url = URL.createObjectURL(state.heroImageFile);
    setHeroUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [state.heroImageFile]);

  useEffect(() => {
    if (state.ocrImageFiles.length === 0) {
      setOcrUrls([]);
      return;
    }
    const urls = state.ocrImageFiles.map(file => URL.createObjectURL(file));
    setOcrUrls(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [state.ocrImageFiles]);

  // [SINCRO ACÚSTICA]: Mantenemos la URL del ambiente alineada con el Blob
  useEffect(() => {
    if (!state.ambientAudioBlob) {
      setAmbientAudioUrl(null);
      return;
    }
    const url = URL.createObjectURL(state.ambientAudioBlob);
    setAmbientAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [state.ambientAudioBlob]);

  /**
   * ---------------------------------------------------------------------------
   * II. MANEJADORES DE CAPTURA VISUAL
   * ---------------------------------------------------------------------------
   */

  const handleHeroCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) dispatch({ type: 'SET_HERO_IMAGE', payload: file });
  };

  const handleOcrCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && state.ocrImageFiles.length < 3) {
      dispatch({ type: 'ADD_OCR_IMAGE', payload: file });
    }
    if (ocrInputRef.current) ocrInputRef.current.value = "";
  };

  const removeOcrImage = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_OCR_IMAGE', payload: index });
  }, [dispatch]);

  /**
   * ---------------------------------------------------------------------------
   * III. PROTOCOLO ACÚSTICO
   * ---------------------------------------------------------------------------
   */

  const startRecording = async (type: 'AMBIENT' | 'INTENT') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());

        if (type === 'AMBIENT') {
          dispatch({ type: 'SET_AMBIENT_AUDIO', payload: blob });
          setIsRecordingAmbient(false);
        } else {
          handleTranscription(blob);
          setIsRecordingIntent(false);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      
      if (type === 'AMBIENT') setIsRecordingAmbient(true);
      else setIsRecordingIntent(true);
      
      if (navigator.vibrate) navigator.vibrate(50);
    } catch (err) {
      console.error("Fallo de hardware acústico:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleTranscription = async (blob: Blob) => {
    dispatch({ type: 'SET_TRANSCRIBING', payload: true });
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const result = await transcribeVoiceIntentAction({ audioBase64: base64Audio });
        
        if (result.success && result.data) {
          dispatch({ type: 'SET_INTENT', payload: result.data.transcription });
        }
      };
    } catch (err) {
      console.error("Error en transcripción:", err);
    } finally {
      dispatch({ type: 'SET_TRANSCRIBING', payload: false });
    }
  };

  /**
   * ---------------------------------------------------------------------------
   * IV. ACCIÓN DE PROGRESO (THE FINAL PUSH)
   * ---------------------------------------------------------------------------
   */

  const handleInitiateIngestion = async () => {
    // Si falta la imagen o el texto es muy corto (Zod rule), bloqueamos
    if (!state.heroImageFile || state.intentText.length < 5) return;
    setIsIngesting(true);

    try {
      await geoEngine.ingestSensoryData({
        heroImage: state.heroImageFile,
        ocrImages: state.ocrImageFiles,
        ambientAudio: state.ambientAudioBlob,
        intent: state.intentText,
        categoryId: state.categoryId,
        radius: state.resonanceRadius
      });
      // El éxito cambiará el engineStatus a DOSSIER_READY
    } catch (err) {
      // Liberamos UI ante fallo (El error se mostrará en el AlertTriangle)
      setIsIngesting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-10 animate-in fade-in duration-700 overflow-y-auto custom-scrollbar pb-32 px-6 pt-4">

      {/* HEADER DE OPERACIONES */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={prevStep} disabled={isIngesting} className="rounded-full h-12 w-12 p-0 bg-white/5 border border-white/10 text-zinc-400 hover:text-white">
          <ChevronLeft size={24} />
        </Button>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Fase 02</p>
          <h2 className="text-2xl font-black uppercase text-white italic tracking-tighter">Captura</h2>
        </div>
      </div>

      {/* BLOQUE I: VISIÓN (HERO + MOSAICO) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* IMAGEN HERO */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2 opacity-50"><Camera size={14} className="text-primary" /><h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Imagen Principal</h3></div>
          <div onClick={() => !isIngesting && heroInputRef.current?.click()} className={cn("relative aspect-video rounded-[2.5rem] border-2 border-dashed transition-all duration-500 cursor-pointer overflow-hidden group", heroUrl ? "border-primary/40 shadow-[0_0_50px_rgba(var(--primary),0.15)]" : "border-white/10 bg-white/[0.01]")}>
            {heroUrl ? (
              <>
                <Image src={heroUrl} alt="Hero" fill className="object-cover animate-in zoom-in-95 duration-700" unoptimized />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/60 px-6 py-2.5 rounded-full border border-white/10 backdrop-blur-md">Sustituir Captura</span>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 opacity-20"><ImageIcon size={40} /><span className="text-[8px] font-black uppercase tracking-widest text-center px-8">Capturar Monumento</span></div>
            )}
            <input type="file" accept="image/*" ref={heroInputRef} className="hidden" onChange={handleHeroCapture} />
          </div>
        </div>

        {/* MOSAICO OCR */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 opacity-50"><FileText size={14} className="text-blue-400" /><h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Mosaico OCR</h3></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {ocrUrls.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group animate-in zoom-in-90">
                <Image src={url} alt="OCR" fill className="object-cover" unoptimized />
                <button onClick={(e) => { e.stopPropagation(); removeOcrImage(index); }} className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
              </div>
            ))}
            {state.ocrImageFiles.length < 3 && (<button onClick={() => ocrInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-white/5 bg-white/[0.01] flex items-center justify-center"><Plus size={20} className="text-zinc-700" /></button>)}
          </div>
          <input type="file" accept="image/*" ref={ocrInputRef} className="hidden" onChange={handleOcrCapture} />
        </div>
      </div>

      {/* BLOQUE II: SEMILLA COGNITIVA (DICTADO) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3 opacity-50">
            <BrainCircuit size={14} className="text-indigo-400" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Semilla de Intención</h3>
          </div>
          <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest italic">Voz a Texto</span>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-primary/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative bg-[#020202] border border-white/10 rounded-[2rem] p-6 space-y-4">
            
            <div className="relative">
              <Textarea 
                value={state.intentText}
                onChange={(e) => dispatch({ type: 'SET_INTENT', payload: e.target.value })}
                placeholder="Pulsa el micrófono para dictar la historia o escribe aquí..."
                className="min-h-[120px] bg-transparent border-none p-0 text-zinc-300 text-sm leading-relaxed focus-visible:ring-0 resize-none custom-scrollbar"
                disabled={state.isTranscribing}
              />
              {state.isTranscribing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center gap-3">
                  <RefreshCw size={16} className="text-primary animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">El Escriba está procesando...</span>
                </div>
              )}
            </div>

            <div className="flex justify-center pt-2 border-t border-white/5">
              <button
                onMouseDown={() => startRecording('INTENT')}
                onMouseUp={stopRecording}
                onTouchStart={() => startRecording('INTENT')}
                onTouchEnd={stopRecording}
                className={cn(
                  "h-14 w-14 rounded-full flex items-center justify-center transition-all duration-500",
                  isRecordingIntent ? "bg-indigo-500 scale-110 shadow-[0_0_30px_rgba(99,102,241,0.4)]" : "bg-white/5 border border-white/10 text-indigo-400 hover:bg-white/10"
                )}
              >
                <Mic size={24} className={isRecordingIntent ? "animate-pulse text-white" : ""} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE III: ACÚSTICA AMBIENTAL */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2 opacity-50"><Volume2 size={14} className="text-emerald-400" /><h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Resonancia del Lugar</h3></div>
        <div className="p-8 rounded-[3rem] bg-white/[0.01] border border-white/5 shadow-inner flex flex-col items-center gap-6 relative overflow-hidden">
          
          {/* [FIX TS2304]: Sincronización de variable ambientAudioUrl */}
          <p className={cn(
            "text-[10px] font-black uppercase tracking-[0.4em] transition-colors",
            isRecordingAmbient ? "text-red-400 animate-pulse" : ambientAudioUrl ? "text-emerald-400" : "text-zinc-600"
          )}>
            {isRecordingAmbient ? "Capturando Ambiente..." : ambientAudioUrl ? "Frecuencia Lista para Auditoría" : "Graba 15s de ruido real"}
          </p>

          <div className="flex items-center gap-6 relative z-10">
            {/* Botón Maestro de Grabación */}
            {!ambientAudioUrl && (
              <button
                onMouseDown={() => startRecording('AMBIENT')}
                onMouseUp={stopRecording}
                onTouchStart={() => startRecording('AMBIENT')}
                onTouchEnd={stopRecording}
                className={cn(
                  "h-20 w-20 rounded-full flex items-center justify-center transition-all duration-500 relative",
                  isRecordingAmbient ? "bg-red-500 scale-110 shadow-[0_0_40px_rgba(239,68,68,0.4)]" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20"
                )}
              >
                <Mic size={32} className={cn(isRecordingAmbient && "animate-pulse")} />
                <AnimatePresence>
                  {isRecordingAmbient && (
                    <motion.div initial={{ scale: 1, opacity: 0.6 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 bg-red-500 rounded-full" />
                  )}
                </AnimatePresence>
              </button>
            )}

            {/* Consola de Auditoría Post-Grabación */}
            {ambientAudioUrl && (
              <div className="flex items-center gap-4 animate-in zoom-in-95">
                <Button onClick={() => isPlayingPreview ? audioPlayerRef.current?.pause() : audioPlayerRef.current?.play()} className="h-16 w-16 rounded-full bg-white text-black hover:bg-zinc-200 shadow-2xl">
                  {isPlayingPreview ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                </Button>
                <Button variant="ghost" onClick={() => dispatch({ type: 'SET_AMBIENT_AUDIO', payload: null })} className="h-16 w-16 rounded-full border border-white/10 text-red-500 hover:bg-red-500/10">
                  <Trash2 size={20} />
                </Button>
              </div>
            )}
          </div>
          <audio ref={audioPlayerRef} src={ambientAudioUrl || ""} onPlay={() => setIsPlayingPreview(true)} onPause={() => setIsPlayingPreview(false)} onEnded={() => setIsPlayingPreview(false)} className="hidden" />
        </div>
      </div>

      {/* --- PANEL DE CRISIS (TRANSPARENCIA DE ERROR) --- */}
      <AnimatePresence>
        {engineStatus === 'REJECTED' && engineData?.rejectionReason && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex flex-col gap-2 mt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Misión Rechazada por la Bóveda</span>
            </div>
            <p className="text-xs font-bold text-red-400/80 leading-relaxed">
              {engineData.rejectionReason}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- IV. ACCIÓN DE PROGRESO (THE GATEWAY) --- */}
      <div className="mt-4 pb-8">
        <Button
          onClick={handleInitiateIngestion}
          // Validamos heroImage y la regla de 5 caracteres de Zod
          disabled={!state.heroImageFile || state.intentText.length < 5 || isIngesting || isRecordingAmbient || isRecordingIntent || state.isTranscribing}
          // [FIX CSS]: 'tracking-widest' evita el desbordamiento horizontal en móviles
          className="w-full h-20 rounded-[2.5rem] bg-primary text-black font-black uppercase tracking-widest shadow-2xl hover:brightness-110 active:scale-[0.98] group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
          {isIngesting ? (
            <div className="flex items-center gap-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg uppercase">Transmitiendo Activos...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-lg md:text-xl">
               PROCESAR EXPEDIENTE
               <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform duration-500" />
            </div>
          )}
        </Button>
      </div>

    </div>
  );
}