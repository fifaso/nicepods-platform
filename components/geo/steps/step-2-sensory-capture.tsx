// components/geo/steps/step-2-sensory-capture.tsx
// VERSIÓN: 4.1 (NicePod Sovereign Sensory Capture - Lint-Safe Pro)
// Misión: Captura monumental, mosaico OCR y paisaje sonoro con gestión de memoria atómica.
// [ESTABILIZACIÓN]: Erradicación de advertencias de linter y soporte multimodal completo.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  ChevronLeft,
  FileText,
  Image as ImageIcon,
  Loader2,
  Mic,
  Pause,
  Play,
  Plus,
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
import { cn } from "@/lib/utils";

/**
 * COMPONENTE: StepSensoryCapture
 * La terminal de captura física de alta fidelidad.
 */
export function StepSensoryCapture() {
  // 1. CONSUMO DE CONTEXTOS Y MOTORES SINCRO-ESTABLES
  const { state, dispatch, prevStep } = useForge();
  const geoEngine = useGeoEngine();

  // --- ESTADOS DE PREVISUALIZACIÓN LOCAL ---
  const [heroUrl, setHeroUrl] = useState<string | null>(null);
  const [ocrUrls, setOcrUrls] = useState<string[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Estados Operativos
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);

  // Referencias de Hardware
  const heroInputRef = useRef<HTMLInputElement>(null);
  const ocrInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  /**
   * ---------------------------------------------------------------------------
   * PROTOCOLO DE HIGIENE DE RAM (V4.1): EFECTOS ATÓMICOS
   * Misión: Eliminar 'exhaustive-deps' y garantizar limpieza de memoria.
   * ---------------------------------------------------------------------------
   */

  // I. GESTIÓN SOBERANA DE IMAGEN HERO
  useEffect(() => {
    if (!state.heroImageFile) {
      setHeroUrl(null);
      return;
    }
    const url = URL.createObjectURL(state.heroImageFile);
    setHeroUrl(url);
    // Cleanup Protocol: Libera RAM al cambiar o desmontar
    return () => URL.revokeObjectURL(url);
  }, [state.heroImageFile]);

  // II. GESTIÓN SOBERANA DE MOSAICO OCR
  useEffect(() => {
    if (state.ocrImageFiles.length === 0) {
      setOcrUrls([]);
      return;
    }
    const urls = state.ocrImageFiles.map(file => URL.createObjectURL(file));
    setOcrUrls(urls);
    // Cleanup Protocol: Purgar todas las URLs del mosaico
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [state.ocrImageFiles]);

  // III. GESTIÓN SOBERANA DE AUDIO AMBIENTE
  useEffect(() => {
    if (!state.ambientAudioBlob) {
      setAudioUrl(null);
      return;
    }
    const url = URL.createObjectURL(state.ambientAudioBlob);
    setAudioUrl(url);
    // Cleanup Protocol: Libera el activo acústico de la memoria volátil
    return () => URL.revokeObjectURL(url);
  }, [state.ambientAudioBlob]);

  /**
   * ---------------------------------------------------------------------------
   * IV. MANEJADORES DE CAPTURA FÍSICA
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
    // Reseteamos el valor para permitir re-capturar el mismo nombre de archivo
    if (ocrInputRef.current) ocrInputRef.current.value = "";
  };

  const removeOcrImage = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_OCR_IMAGE', payload: index });
  }, [dispatch]);

  /**
   * PROTOCOLO ACÚSTICO: Captura Soundscape
   */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        dispatch({ type: 'SET_AMBIENT_AUDIO', payload: blob });
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      if (navigator.vibrate) navigator.vibrate(50);
    } catch (err) {
      console.error("🔥 [Step-Sensory] Error de hardware (Micrófono):", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (navigator.vibrate) navigator.vibrate([20, 50]);
    }
  };

  /**
   * handleInitiateIngestion: 
   * Despacho multimodal hacia el Ingestor V8.0.
   */
  const handleInitiateIngestion = async () => {
    if (!state.heroImageFile) return;
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
      // El éxito disparará automáticamente el cambio a DOSSIER_REVIEW en el orquestador
    } catch (err) {
      setIsIngesting(false);
      console.error("Fallo en la cadena de ingesta Step 2.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-10 animate-in fade-in duration-700 overflow-y-auto custom-scrollbar pb-32 px-6 pt-2">

      {/* --- CABECERA DE OPERACIONES --- */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={prevStep}
          disabled={isIngesting}
          className="rounded-full h-12 w-12 p-0 bg-white/5 border border-white/10 text-zinc-400 hover:text-white"
        >
          <ChevronLeft size={24} />
        </Button>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Fase 02</p>
          <h2 className="text-2xl font-black uppercase text-white italic tracking-tighter">Sensores</h2>
        </div>
      </div>

      {/* --- I. CAPTURA MONUMENTAL (HERO) --- */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2 opacity-50">
          <Camera size={14} className="text-primary" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Imagen Principal</h3>
        </div>

        <div
          onClick={() => !isIngesting && heroInputRef.current?.click()}
          className={cn(
            "relative aspect-video rounded-[3rem] border-2 border-dashed transition-all duration-500 cursor-pointer overflow-hidden group",
            heroUrl ? "border-primary/40 shadow-[0_0_50px_rgba(var(--primary),0.15)]" : "border-white/10 bg-white/[0.01] hover:border-white/20"
          )}
        >
          {heroUrl ? (
            <>
              <Image src={heroUrl} alt="Hero Preview" fill className="object-cover animate-in zoom-in-95 duration-700" unoptimized />
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

      {/* --- II. MOSAICO DE EVIDENCIA (OCR ARRAY) --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3 opacity-50">
            <FileText size={14} className="text-blue-400" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Mosaico de Placas</h3>
          </div>
          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest tabular-nums">
            {state.ocrImageFiles.length} / 3 Capturas
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {ocrUrls.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-[1.5rem] overflow-hidden border border-white/10 group animate-in zoom-in-90 duration-500">
              <Image src={url} alt={`OCR ${index}`} fill className="object-cover" unoptimized />
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
              onClick={() => ocrInputRef.current?.click()}
              className="aspect-square rounded-[1.5rem] border-2 border-dashed border-white/5 bg-white/[0.01] hover:bg-white/[0.04] hover:border-blue-500/30 flex flex-col items-center justify-center gap-2 transition-all group"
            >
              <Plus size={24} className="text-zinc-700 group-hover:text-blue-400 transition-colors" />
              <span className="text-[7px] font-black uppercase tracking-widest text-zinc-800 group-hover:text-blue-400/60">Añadir</span>
            </button>
          )}
        </div>
        <input type="file" accept="image/*" ref={ocrInputRef} className="hidden" onChange={handleOcrCapture} />
      </div>

      {/* --- III. PAISAJE SONORO (VALIDACIÓN ACÚSTICA) --- */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2 opacity-50">
          <Volume2 size={14} className="text-emerald-400" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Resonancia Ambiental</h3>
        </div>

        <div className="p-10 rounded-[3.5rem] bg-white/[0.01] border border-white/5 shadow-inner flex flex-col items-center gap-8 relative overflow-hidden">

          <div className="text-center space-y-2 relative z-10">
            <p className={cn(
              "text-[10px] font-black uppercase tracking-[0.4em] transition-colors",
              isRecording ? "text-red-400 animate-pulse" : audioUrl ? "text-emerald-400" : "text-zinc-600"
            )}>
              {isRecording ? "Capturando frecuencia..." : audioUrl ? "Frecuencia lista para auditoría" : "Graba 15s del entorno"}
            </p>
          </div>

          <div className="flex items-center gap-8 relative z-10">
            {/* Botón Maestro de Grabación */}
            {!audioUrl && (
              <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={cn(
                  "h-28 w-28 rounded-full flex items-center justify-center transition-all duration-700 relative",
                  isRecording
                    ? "bg-red-500 scale-110 shadow-[0_0_60px_rgba(239,68,68,0.4)]"
                    : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20"
                )}
              >
                <Mic size={40} className={cn(isRecording && "animate-pulse")} />
                <AnimatePresence>
                  {isRecording && (
                    <motion.div
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 bg-red-500 rounded-full"
                    />
                  )}
                </AnimatePresence>
              </button>
            )}

            {/* Consola de Auditoría Post-Grabación */}
            {audioUrl && (
              <div className="flex items-center gap-6 animate-in zoom-in-90 duration-500">
                <Button
                  onClick={() => {
                    if (audioPlayerRef.current) {
                      if (isPlayingAudio) audioPlayerRef.current.pause();
                      else audioPlayerRef.current.play();
                    }
                  }}
                  className="h-20 w-20 rounded-full bg-white text-black hover:bg-zinc-200 shadow-2xl"
                >
                  {isPlayingAudio ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => {
                    dispatch({ type: 'SET_AMBIENT_AUDIO', payload: null });
                  }}
                  className="h-16 w-16 rounded-full border border-white/10 text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 size={24} />
                </Button>
              </div>
            )}
          </div>

          <audio
            ref={audioPlayerRef}
            src={audioUrl || ""}
            onPlay={() => setIsPlayingAudio(true)}
            onPause={() => setIsPlayingAudio(false)}
            onEnded={() => setIsPlayingAudio(false)}
            className="hidden"
          />
        </div>
      </div>

      {/* --- IV. ACCIÓN DE PROGRESO (EL DESPACHO) --- */}
      <div className="mt-8">
        <Button
          onClick={handleInitiateIngestion}
          disabled={!state.heroImageFile || isIngesting || isRecording}
          className="w-full h-24 rounded-[3rem] bg-primary text-black font-black uppercase tracking-[0.5em] shadow-2xl hover:brightness-110 active:scale-[0.98] group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
          {isIngesting ? (
            <div className="flex items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-xl">Transmitiendo...</span>
            </div>
          ) : (
            <div className="flex items-center gap-5 text-2xl">
              PROCESAR DOSSIER
              <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform duration-500" />
            </div>
          )}
        </Button>
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.1):
 * 1. Muerte de la Advertencia react-hooks/exhaustive-deps: Al dividir el efecto monolítico
 *    en 3 efectos atómicos (Líneas 64-94), eliminamos las dependencias cruzadas que 
 *    Vercel marcaba como riesgo, garantizando un build 100% limpio.
 * 2. Monitor Acústico Profesional: Se mantiene el flujo de auditoría sónica para 
 *    garantizar que la sabiduría urbana de Madrid nazca con alta fidelidad.
 * 3. Gestión JIT (Just-In-Time): Las URLs de previsualización se generan y 
 *    revocan dinámicamente, manteniendo la huella de memoria del dispositivo 
 *    móvil en su mínimo nivel histórico.
 */