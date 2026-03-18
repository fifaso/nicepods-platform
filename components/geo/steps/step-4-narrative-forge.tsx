// components/geo/steps/step-2-sensory-capture.tsx
// VERSIÓN: 5.0 (NicePod Sovereign Sensory Capture - Compression Pro Edition)
// Misión: Captura monumental, mosaico OCR, paisaje sonoro y dictado cognitivo.
// [ESTABILIZACIÓN]: Integración de Motor de Compresión en Cliente para erradicar Error 413.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Camera,
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
  X
} from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";

// --- INFRAESTRUCTURA SOBERANA ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useForge } from "../forge-context";

// --- COMPONENTES UI ---
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * ---------------------------------------------------------------------------
 * UTILIDAD MAESTRA: COMPRESIÓN CLIENT-SIDE (OOM & 413 PREVENTION)
 * ---------------------------------------------------------------------------
 * Reduce el peso de las imágenes originales de la cámara (5MB-15MB) a 
 * activos WebP/JPEG ultraligeros (<1MB) antes de tocar el Server Action de Vercel.
 */
const compressImage = (file: File, maxWidth = 1920, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image(); // Usamos window.Image nativo
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Mantenemos el aspect ratio si la imagen excede el ancho máximo
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo iniciar el contexto 2D para compresión."));
          return;
        }

        // Pintamos la imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Convertimos a Blob comprimido (preferiblemente WebP, con fallback a JPEG)
        const format = "image/webp";
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                type: format,
                lastModified: Date.now(),
              });
              resolve(newFile);
            } else {
              reject(new Error("La compresión generó un Blob vacío."));
            }
          },
          format,
          quality
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * COMPONENTE: StepSensoryCapture
 * La terminal de ingesta física y cognitiva de alta fidelidad.
 */
export function StepSensoryCapture() {
  // 1. CONSUMO DE CONTEXTOS Y MOTORES SINCRO-ESTABLES
  const { state, dispatch, prevStep } = useForge();
  const geoEngine = useGeoEngine();

  const { status: engineStatus, data: engineData, error: engineError } = geoEngine;

  // --- ESTADOS DE PREVISUALIZACIÓN LOCAL (BLOB URLS) ---
  const [heroUrl, setHeroUrl] = useState<string | null>(null);
  const [ocrUrls, setOcrUrls] = useState<string[]>([]);
  const [ambientAudioUrl, setAmbientAudioUrl] = useState<string | null>(null);

  // Estados Operativos de Carga y UX
  const [isRecordingAmbient, setIsRecordingAmbient] = useState(false);
  const [isRecordingIntent, setIsRecordingIntent] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // Feedback visual de compresión en progreso
  const [isCompressing, setIsCompressing] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);

  // Referencias de Hardware
  const heroInputRef = useRef<HTMLInputElement>(null);
  const ocrInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  /**
   * ---------------------------------------------------------------------------
   * I. PROTOCOLO DE HIGIENE DE RAM (EFECTOS ATÓMICOS)
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
   * II. MANEJADORES DE CAPTURA VISUAL (CON COMPRESIÓN)
   * ---------------------------------------------------------------------------
   */

  const handleHeroCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      // Optimizamos la imagen antes de guardarla en el contexto global
      const compressedFile = await compressImage(file);
      dispatch({ type: 'SET_HERO_IMAGE', payload: compressedFile });
    } catch (err) {
      console.error("Fallo en compresión Hero:", err);
      // Fallback seguro: Si la compresión falla, intentamos usar la original
      dispatch({ type: 'SET_HERO_IMAGE', payload: file });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleOcrCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || state.ocrImageFiles.length >= 3) return;

    setIsCompressing(true);
    try {
      // Las placas necesitan un poco más de resolución para el OCR, max 2048px
      const compressedFile = await compressImage(file, 2048, 0.85);
      dispatch({ type: 'ADD_OCR_IMAGE', payload: compressedFile });
    } catch (err) {
      console.error("Fallo en compresión OCR:", err);
      dispatch({ type: 'ADD_OCR_IMAGE', payload: file });
    } finally {
      setIsCompressing(false);
      if (ocrInputRef.current) ocrInputRef.current.value = "";
    }
  };

  const removeOcrImage = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_OCR_IMAGE', payload: index });
  }, [dispatch]);

  /**
   * ---------------------------------------------------------------------------
   * III. PROTOCOLO ACÚSTICO Y DICTADO
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
        const result = await geoEngine.transcribeVoiceIntent(base64Audio);

        if (result.success && result.data) {
          dispatch({ type: 'SET_INTENT', payload: result.data.transcription });
        }
      };
    } catch (err) {
      console.error("Error en transcripción neuronal:", err);
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
      // El éxito disparará automáticamente el cambio a DOSSIER_REVIEW
    } catch (err: any) {
      console.error("🔥 [Step-Sensory] Ingesta Abortada:", err.message);
      setIsIngesting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-10 animate-in fade-in duration-700 overflow-y-auto custom-scrollbar pb-32 px-6 pt-4">

      {/* HEADER DE OPERACIONES */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={prevStep} disabled={isIngesting || isCompressing} className="rounded-full h-12 w-12 p-0 bg-white/5 border border-white/10 text-zinc-400 hover:text-white">
          <ChevronLeft size={24} />
        </Button>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Fase 02</p>
          <h2 className="text-2xl font-black uppercase text-white italic tracking-tighter">Captura</h2>
        </div>
      </div>

      {/* BLOQUE I: VISIÓN MULTIMODAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* IMAGEN HERO */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2 opacity-50">
            <Camera size={14} className="text-primary" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Imagen Principal</h3>
          </div>

          <div
            onClick={() => !isIngesting && !isCompressing && heroInputRef.current?.click()}
            className={cn(
              "relative aspect-video rounded-[3rem] border-2 border-dashed transition-all duration-500 cursor-pointer overflow-hidden group",
              heroUrl ? "border-primary/40 shadow-[0_0_50px_rgba(var(--primary),0.15)]" : "border-white/10 bg-white/[0.01] hover:border-white/20",
              isCompressing && "opacity-50 cursor-wait"
            )}
          >
            {isCompressing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 z-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-[8px] font-black uppercase tracking-widest text-primary">Optimizando Píxeles...</span>
              </div>
            ) : heroUrl ? (
              <>
                <Image src={heroUrl} alt="Hero Capture" fill className="object-cover animate-in zoom-in-95 duration-700" unoptimized />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/60 px-6 py-2.5 rounded-full border border-white/10 backdrop-blur-md">
                    Sustituir Captura
                  </span>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <ImageIcon size={48} strokeWidth={1} />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-center px-12">
                  Fijar objetivo principal
                </p>
              </div>
            )}
            <input type="file" accept="image/*" ref={heroInputRef} className="hidden" onChange={handleHeroCapture} />
          </div>
        </div>

        {/* MOSAICO OCR */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 opacity-50">
              <FileText size={14} className="text-blue-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Mosaico OCR</h3>
            </div>
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest tabular-nums">
              {state.ocrImageFiles.length} / 3 Capturas
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {ocrUrls.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-[1.5rem] overflow-hidden border border-white/10 group animate-in zoom-in-90 duration-500">
                <Image src={url} alt={`OCR Evidence ${index}`} fill className="object-cover" unoptimized />
                <button
                  onClick={(e) => { e.stopPropagation(); removeOcrImage(index); }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {state.ocrImageFiles.length < 3 && (
              <button
                onClick={() => !isCompressing && ocrInputRef.current?.click()}
                disabled={isCompressing}
                className={cn(
                  "aspect-square rounded-[1.5rem] border-2 border-dashed border-white/5 bg-white/[0.01] hover:bg-white/[0.04] flex flex-col items-center justify-center gap-2 transition-all group",
                  isCompressing ? "opacity-50 cursor-wait" : "hover:border-blue-500/30"
                )}
              >
                <Plus size={24} className="text-zinc-700 group-hover:text-blue-400 transition-colors" />
                <span className="text-[7px] font-black uppercase tracking-widest text-zinc-800 group-hover:text-blue-400/60">Añadir</span>
              </button>
            )}
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
                disabled={state.isTranscribing || isIngesting}
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
                disabled={isIngesting}
                className={cn(
                  "h-14 w-14 rounded-full flex items-center justify-center transition-all duration-500",
                  isRecordingIntent ? "bg-indigo-500 scale-110 shadow-[0_0_30px_rgba(99,102,241,0.4)]" : "bg-white/5 border border-white/10 text-indigo-400 hover:bg-white/10",
                  isIngesting && "opacity-30 cursor-not-allowed"
                )}
              >
                <Mic size={24} className={isRecordingIntent ? "animate-pulse text-white" : ""} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE III: PAISAJE SONORO (AMBIENTE) */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2 opacity-50"><Volume2 size={14} className="text-emerald-400" /><h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Resonancia del Lugar</h3></div>
        <div className="p-8 rounded-[3rem] bg-white/[0.01] border border-white/5 shadow-inner flex flex-col items-center gap-6 relative overflow-hidden">

          <div className="text-center space-y-2 relative z-10">
            <p className={cn(
              "text-[10px] font-black uppercase tracking-[0.4em] transition-colors",
              isRecordingAmbient ? "text-red-400 animate-pulse" : ambientAudioUrl ? "text-emerald-400" : "text-zinc-600"
            )}>
              {isRecordingAmbient ? "Capturando Ambiente..." : ambientAudioUrl ? "Frecuencia Lista para Auditoría" : "Graba 15s de ruido real"}
            </p>
          </div>

          <div className="flex items-center gap-6 relative z-10">
            {!ambientAudioUrl && (
              <button
                onMouseDown={() => startRecording('AMBIENT')}
                onMouseUp={stopRecording}
                onTouchStart={() => startRecording('AMBIENT')}
                onTouchEnd={stopRecording}
                disabled={isIngesting}
                className={cn(
                  "h-20 w-20 rounded-full flex items-center justify-center transition-all duration-500 relative",
                  isRecordingAmbient ? "bg-red-500 scale-110 shadow-[0_0_40px_rgba(239,68,68,0.4)]" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20",
                  isIngesting && "opacity-30 cursor-not-allowed"
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

            {ambientAudioUrl && (
              <div className="flex items-center gap-4 animate-in zoom-in-95">
                <Button
                  onClick={() => {
                    if (audioPlayerRef.current) {
                      if (isPlayingPreview) audioPlayerRef.current.pause();
                      else audioPlayerRef.current.play();
                    }
                  }}
                  disabled={isIngesting}
                  className="h-16 w-16 rounded-full bg-white text-black hover:bg-zinc-200 shadow-2xl"
                >
                  {isPlayingPreview ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => dispatch({ type: 'SET_AMBIENT_AUDIO', payload: null })}
                  disabled={isIngesting}
                  className="h-16 w-16 rounded-full border border-white/10 text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 size={24} />
                </Button>
              </div>
            )}
          </div>
          <audio ref={audioPlayerRef} src={ambientAudioUrl || ""} onPlay={() => setIsPlayingPreview(true)} onPause={() => setIsPlayingPreview(false)} onEnded={() => setIsPlayingPreview(false)} className="hidden" />
        </div>
      </div>

      {/* PANEL DE CRISIS (TRANSPARENCIA DE ERROR) */}
      <AnimatePresence>
        {engineStatus === 'REJECTED' && (engineData?.rejectionReason || engineError) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex flex-col gap-2 mt-4 shadow-xl"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
                Misión Rechazada
              </span>
            </div>
            <p className="text-xs font-bold text-red-400/80 leading-relaxed uppercase">
              {engineError || engineData?.rejectionReason}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* IV. ACCIÓN DE PROGRESO */}
      <div className="mt-4 pb-8">
        <Button
          onClick={handleInitiateIngestion}
          disabled={!state.heroImageFile || state.intentText.length < 5 || isIngesting || isCompressing || isRecordingAmbient || isRecordingIntent || state.isTranscribing}
          className="w-full h-20 rounded-[2.5rem] bg-primary text-black font-black uppercase tracking-widest shadow-2xl hover:brightness-110 active:scale-[0.98] group relative overflow-hidden transition-all duration-300 disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />

          {isIngesting ? (
            <div className="flex items-center gap-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg uppercase">Transmitiendo...</span>
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Muerte del Límite de Payload (Error 413): Al inyectar 'compressImage' 
 *    en el frontend, las fotos de alta resolución del Admin son reducidas 
 *    a activos WebP ultraligeros antes de la codificación Base64. El servidor 
 *    Vercel nunca se ahogará.
 * 2. Visualización de Optimización: El estado 'isCompressing' informa al Admin 
 *    de que el hardware local está trabajando ("Optimizando Píxeles..."), 
 *    evitando clics múltiples o frustración.
 * 3. Integridad del Mosaico: La cuadrícula de 3 fotos OCR permite aportar un 
 *    contexto visual denso para la IA sin saturar la RAM del dispositivo.
 */