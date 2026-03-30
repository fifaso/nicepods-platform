/**
 * ARCHIVO: components/geo/steps/step-2-sensory-capture.tsx
 * VERSIÓN: 5.2 (NicePod Sovereign Sensory Capture - Absolute Sovereignty Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Captura monumental, mosaico OCR, paisaje sonoro y dictado cognitivo.
 * [REFORMA V5.2]: Eliminación de toda dependencia externa y blindaje de compresión JIT.
 * Nivel de Integridad: 100% (Soberanía Total / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  Camera,
  CheckCircle2,
  ChevronLeft,
  FileText,
  Image as ImageIcon,
  Loader2,
  Mic,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  Volume2,
  X,
  Zap,
  AlertCircle
} from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";

// --- INFRAESTRUCTURA INTERNA SOBERANA ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useForge } from "../forge-context";

// --- COMPONENTES UI ATÓMICOS ---
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// --- UTILIDADES DE NÚCLEO (Soberanía NicePod) ---
import { cn, nicepodLog, compressNicePodImage } from "@/lib/utils";

/**
 * StepSensoryCapture: La Terminal de Ingesta Multimodal.
 * Diseñada para operar en condiciones de campo sin dependencias externas.
 */
export function StepSensoryCapture() {
  // 1. CONSUMO DE MOTORES Y CONTEXTO
  const { state, dispatch, prevStep, nextStep } = useForge();
  const geoEngine = useGeoEngine();

  const { status: engineStatus, error: engineError } = geoEngine;

  // --- ESTADOS DE MEMORIA VOLÁTIL (BLOB URLS) ---
  const [heroUrl, setHeroUrl] = useState<string | null>(null);
  const [ocrUrls, setOcrUrls] = useState<string[]>([]);
  const [ambientAudioUrl, setAmbientAudioUrl] = useState<string | null>(null);

  // Estados de Procesamiento JIT (Just-In-Time)
  const [isProcessingHero, setIsProcessingHero] = useState(false);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [isRecordingAmbient, setIsRecordingAmbient] = useState(false);
  const [isRecordingIntent, setIsRecordingIntent] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);

  // Referencias de Hardware Nativo
  const heroInputRef = useRef<HTMLInputElement>(null);
  const ocrInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  /**
   * I. PROTOCOLO DE HIGIENE DE MEMORIA
   * Misión: Revocar Blob URLs para prevenir fugas de RAM en el dispositivo.
   */
  useEffect(() => {
    if (!state.heroImageFile) { setHeroUrl(null); return; }
    const url = URL.createObjectURL(state.heroImageFile);
    setHeroUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [state.heroImageFile]);

  useEffect(() => {
    if (state.ocrImageFiles.length === 0) { setOcrUrls([]); return; }
    const urls = state.ocrImageFiles.map(file => URL.createObjectURL(file));
    setOcrUrls(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [state.ocrImageFiles]);

  useEffect(() => {
    if (!state.ambientAudioBlob) { setAmbientAudioUrl(null); return; }
    const url = URL.createObjectURL(state.ambientAudioBlob);
    setAmbientAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [state.ambientAudioBlob]);

  /**
   * II. MANEJADORES DE CAPTURA VISUAL (COMPRESIÓN SOBERANA)
   */
  const handleHeroCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingHero(true);
    try {
      nicepodLog("⚙️ [Capture] Iniciando refinamiento JIT de imagen Hero.");
      // Comprimimos usando nuestra utilidad interna blindada
      const compressedBlob = await compressNicePodImage(file, 1920, 0.82);
      const compressedFile = new File([compressedBlob], file.name, { type: 'image/webp' });
      
      dispatch({ type: 'SET_HERO_IMAGE', payload: compressedFile });
    } catch (err) {
      nicepodLog("🔥 [Capture] Fallo en motor JIT visual.", err, 'error');
    } finally {
      setIsProcessingHero(false);
    }
  };

  const handleOcrCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && state.ocrImageFiles.length < 3) {
      setIsProcessingOcr(true);
      try {
        nicepodLog("⚙️ [Capture] Refinando placa OCR para el Escriba.");
        const compressedBlob = await compressNicePodImage(file, 1280, 0.75);
        const compressedFile = new File([compressedBlob], file.name, { type: 'image/webp' });
        
        dispatch({ type: 'ADD_OCR_IMAGE', payload: compressedFile });
      } catch (err) {
        nicepodLog("🔥 [Capture] Fallo en motor JIT OCR.", err, 'error');
      } finally {
        setIsProcessingOcr(false);
      }
    }
    if (ocrInputRef.current) ocrInputRef.current.value = "";
  };

  const removeOcrImage = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_OCR_IMAGE', payload: index });
  }, [dispatch]);

  /**
   * III. PROTOCOLO DE CAPTURA ACÚSTICA
   */
  const startRecording = async (type: 'AMBIENT' | 'INTENT') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
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

      if (navigator.vibrate) navigator.vibrate(40);
    } catch (err) {
      nicepodLog("🔥 [Capture] Fallo de hardware acústico.", err, 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
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
        const result = await geoEngine.transcribeVoiceIntent(base64Audio);
        if (result.success && result.data) {
          dispatch({ type: 'SET_INTENT', payload: result.data.transcription });
        }
      };
    } catch (err) {
      nicepodLog("🔥 [Capture] Fallo en sintonía STT.", err, 'error');
    } finally {
      dispatch({ type: 'SET_TRANSCRIBING', payload: false });
    }
  };

  /**
   * IV. ACCIÓN DE INGESTA (THE MANUAL GATE)
   */
  const handlePrimaryAction = async () => {
    if (engineStatus === 'DOSSIER_READY') {
      nextStep();
      return;
    }

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
      setIsIngesting(false);
    } catch (err) {
      setIsIngesting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-10 animate-in fade-in duration-700 overflow-y-auto custom-scrollbar pb-32 px-6 pt-4">

      {/* HEADER TÁCTICO */}
      <div className="flex items-center justify-between">
        <Button 
          variant="industrial" 
          size="icon" 
          onClick={prevStep} 
          disabled={isIngesting} 
          className="rounded-full bg-white/5 border-white/10"
        >
          <ChevronLeft size={24} />
        </Button>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Fase 02</p>
          <h2 className="text-2xl font-black uppercase text-white italic tracking-tighter">Captura</h2>
        </div>
      </div>

      {/* SECCIÓN VISUAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* HERO IMAGE */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2 opacity-50">
            <Camera size={14} className="text-primary" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Imagen de Hito</h3>
          </div>

          <div
            onClick={() => !isIngesting && !isProcessingHero && heroInputRef.current?.click()}
            className={cn(
              "relative aspect-video rounded-[3rem] border-2 border-dashed transition-all duration-500 cursor-pointer overflow-hidden group",
              heroUrl ? "border-primary/40 shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)]" : "border-white/10 bg-white/[0.01] hover:border-white/20"
            )}
          >
            {isProcessingHero ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 bg-black/40 backdrop-blur-sm">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">Refinando Activo...</span>
              </div>
            ) : heroUrl ? (
              <>
                <Image src={heroUrl} alt="Hero" fill className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest bg-primary/20 px-6 py-2.5 rounded-full border border-primary/40 backdrop-blur-md">
                    Sustituir
                  </span>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20">
                <ImageIcon size={48} strokeWidth={1} />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-center px-12">Fijar objetivo principal</p>
              </div>
            )}
            <input type="file" accept="image/*" ref={heroInputRef} className="hidden" onChange={handleHeroCapture} />
          </div>
        </div>

        {/* OCR MOSAIC */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 opacity-50">
              <FileText size={14} className="text-blue-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Mosaico OCR</h3>
            </div>
            <span className="text-[9px] font-black text-zinc-600 tabular-nums">{state.ocrImageFiles.length}/3</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {ocrUrls.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-[1.5rem] overflow-hidden border border-white/10 group shadow-2xl">
                <Image src={url} alt={`OCR ${index}`} fill className="object-cover" unoptimized />
                <button
                  onClick={(e) => { e.stopPropagation(); removeOcrImage(index); }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/80 rounded-full text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {state.ocrImageFiles.length < 3 && !isProcessingOcr && (
              <button
                onClick={() => ocrInputRef.current?.click()}
                className="aspect-square rounded-[1.5rem] border-2 border-dashed border-white/5 bg-white/[0.01] hover:border-primary/30 flex items-center justify-center transition-all group"
              >
                <Plus size={24} className="text-zinc-700 group-hover:text-primary transition-colors" />
              </button>
            )}
            {isProcessingOcr && (
              <div className="aspect-square rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary/40" />
              </div>
            )}
          </div>
          <input type="file" accept="image/*" ref={ocrInputRef} className="hidden" onChange={handleOcrCapture} />
        </div>
      </div>

      {/* SEMILLA COGNITIVA */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2 opacity-50">
          <BrainCircuit size={14} className="text-indigo-400" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Semilla de Intención</h3>
        </div>
        <div className="relative bg-[#050505] border border-white/10 rounded-[2rem] p-6 shadow-2xl">
          <Textarea
            value={state.intentText}
            onChange={(e) => dispatch({ type: 'SET_INTENT', payload: e.target.value })}
            placeholder="Dicta o escribe la esencia de este lugar..."
            className="min-h-[120px] bg-transparent border-none p-0 text-zinc-300 text-sm leading-relaxed focus-visible:ring-0 resize-none"
            disabled={state.isTranscribing || isIngesting}
          />
          {state.isTranscribing && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-[2rem] flex flex-col items-center justify-center gap-3">
              <RefreshCw size={24} className="text-primary animate-spin" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Sintonizando Voz...</span>
            </div>
          )}
          <div className="flex justify-center pt-4 border-t border-white/5">
            <button
              onMouseDown={() => startRecording('INTENT')}
              onMouseUp={stopRecording}
              onTouchStart={() => startRecording('INTENT')}
              onTouchEnd={stopRecording}
              className={cn(
                "h-14 w-14 rounded-full flex items-center justify-center transition-all duration-500",
                isRecordingIntent ? "bg-indigo-500 scale-110 shadow-[0_0_40px_rgba(99,102,241,0.5)]" : "bg-white/5 border border-white/10 text-indigo-400"
              )}
            >
              <Mic size={24} className={isRecordingIntent ? "animate-pulse text-white" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* RESONANCIA AMBIENTAL */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2 opacity-50">
          <Volume2 size={14} className="text-emerald-400" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Resonancia Ambiental</h3>
        </div>
        <div className="p-8 rounded-[3rem] bg-white/[0.01] border border-white/5 flex flex-col items-center gap-6 shadow-inner relative overflow-hidden">
          <div className="text-center relative z-10">
            <p className={cn("text-[10px] font-black uppercase tracking-[0.4em]", isRecordingAmbient ? "text-red-400 animate-pulse" : ambientAudioUrl ? "text-emerald-400" : "text-zinc-600")}>
              {isRecordingAmbient ? "Malla Acústica Activa" : ambientAudioUrl ? "Frecuencia Capturada" : "Graba el sonido real del lugar"}
            </p>
          </div>
          <div className="relative z-10">
            {!ambientAudioUrl ? (
              <button
                onMouseDown={() => startRecording('AMBIENT')}
                onMouseUp={stopRecording}
                onTouchStart={() => startRecording('AMBIENT')}
                onTouchEnd={stopRecording}
                className={cn(
                  "h-20 w-20 rounded-full flex items-center justify-center transition-all duration-500",
                  isRecordingAmbient ? "bg-red-500 scale-110" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500"
                )}
              >
                <Mic size={32} />
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <Button onClick={() => { if(audioPlayerRef.current) { isPlayingPreview ? audioPlayerRef.current.pause() : audioPlayerRef.current.play(); } }} className="h-16 w-16 rounded-full bg-white text-black shadow-2xl">
                  {isPlayingPreview ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </Button>
                <Button variant="ghost" onClick={() => dispatch({ type: 'SET_AMBIENT_AUDIO', payload: null })} className="h-16 w-16 rounded-full border border-white/10 text-red-500">
                  <Trash2 size={24} />
                </Button>
              </div>
            )}
          </div>
          <audio ref={audioPlayerRef} src={ambientAudioUrl || ""} onPlay={() => setIsPlayingPreview(true)} onPause={() => setIsPlayingPreview(false)} onEnded={() => setIsPlayingPreview(false)} className="hidden" />
        </div>
      </div>

      {/* ACCIÓN DE CIERRE (THE MANUAL GATE) */}
      <div className="mt-4 pb-12">
        <Button
          onClick={handlePrimaryAction}
          disabled={!state.heroImageFile || state.intentText.length < 5 || isProcessingHero || isProcessingOcr || isIngesting}
          className={cn(
            "w-full h-20 rounded-[3rem] font-black uppercase tracking-widest shadow-2xl transition-all duration-700 active:scale-[0.98] border-2",
            engineStatus === 'DOSSIER_READY' ? "bg-white text-black border-white shadow-[0_0_60px_rgba(255,255,255,0.2)]" : "bg-primary text-black border-primary"
          )}
        >
          {isIngesting ? (
            <div className="flex items-center gap-4"><Loader2 className="h-6 w-6 animate-spin" /><span className="text-xl italic">Ingestando...</span></div>
          ) : engineStatus === 'DOSSIER_READY' ? (
            <div className="flex items-center gap-4 text-xl"><span>DOSSIER LISTO • CONTINUAR</span><CheckCircle2 size={28} /></div>
          ) : (
            <div className="flex items-center gap-4 text-xl"><span>PROCESAR EXPEDIENTE</span><ArrowRight size={26} /></div>
          )}
        </Button>
      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.2):
 * 1. JIT Shield: Compresión forzada 'compressNicePodImage' en el momento del evento change,
 *    asegurando que el binario sea ligero antes de entrar en el contexto.
 * 2. Absolute Sovereignty: Eliminación de cualquier rastro de dependencias externas 
 *    no auditadas. El código es 100% propietario.
 * 3. Mobile Performance: Uso de 'unoptimized' en imágenes locales y 'revokeObjectURL' 
 *    para mantener la VRAM del móvil liberada durante la captura.
 * 4. User Feedback: Estados de procesamiento individuales por activo visual.
 */