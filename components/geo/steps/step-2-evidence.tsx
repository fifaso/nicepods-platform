// components/geo/steps/step-2-evidence.tsx
// VERSIÓN: 1.0

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronLeft,
  FileText,
  Mic,
  Volume2
} from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";

// --- INFRAESTRUCTURA DE ESTADO ---
import { useForge } from "../forge-context";

// --- COMPONENTES UI ---
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * COMPONENTE: StepEvidence
 * La terminal de captura sensorial.
 */
export function StepEvidence() {
  const { state, dispatch, nextStep, prevStep } = useForge();

  // --- ESTADOS LOCALES DE PREVISUALIZACIÓN ---
  const [heroPreview, setHeroPreview] = useState<string | null>(state.heroImageBase64);
  const [ocrPreview, setOcrPreview] = useState<string | null>(state.ocrImageBase64);
  const [isRecording, setIsRecording] = useState(false);

  // Referencias para disparar los inputs de cámara ocultos
  const heroInputRef = useRef<HTMLInputElement>(null);
  const ocrInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  /**
   * handleImageCapture:
   * Convierte el archivo físico de la cámara en una cadena Base64 
   * apta para el transporte hacia las Edge Functions.
   */
  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>, type: 'HERO' | 'OCR') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'HERO') {
          setHeroPreview(base64);
          dispatch({ type: 'SET_HERO_IMAGE', payload: base64 });
        } else {
          setOcrPreview(base64);
          dispatch({ type: 'SET_OCR_IMAGE', payload: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * toggleRecording:
   * Gestiona el hardware del micrófono para capturar el Soundscape real del lugar.
   */
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        dispatch({ type: 'SET_AMBIENT_AUDIO', payload: blob });
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error("🔥 [Step-Evidence] Error al acceder al micrófono:", err);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-8 animate-in fade-in duration-700 overflow-y-auto custom-scrollbar pb-20">

      {/* HEADER TÁCTICO */}
      <div className="px-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={prevStep}
          className="rounded-full h-10 w-10 p-0 bg-white/5 border border-white/5 text-zinc-500"
        >
          <ChevronLeft size={20} />
        </Button>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Fase 02</p>
          <h2 className="text-xl font-black uppercase text-white italic">Evidencia</h2>
        </div>
      </div>

      {/* 
          I. MODULO DE VISIÓN (CAMERAS) 
          Diseño simétrico para Hero Image y OCR Image.
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6">

        {/* CÁMARA 1: LA VISTA HERO (Obligatoria) */}
        <div className="space-y-3">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 px-2 flex items-center gap-2">
            <Camera size={12} className="text-primary" /> Captura Principal
          </span>
          <div
            onClick={() => heroInputRef.current?.click()}
            className={cn(
              "relative aspect-video rounded-[2rem] border-2 border-dashed transition-all duration-500 cursor-pointer overflow-hidden",
              heroPreview ? "border-primary/40" : "border-white/10 hover:border-white/20 bg-white/[0.02]"
            )}
          >
            {heroPreview ? (
              <Image src={heroPreview} alt="Hero" fill className="object-cover animate-in zoom-in-95 duration-500" unoptimized />
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 opacity-20">
                <Camera size={32} />
                <span className="text-[8px] font-bold uppercase tracking-widest text-center px-4">Tocar para capturar monumento</span>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" ref={heroInputRef} className="hidden" onChange={(e) => handleImageCapture(e, 'HERO')} />
          </div>
        </div>

        {/* CÁMARA 2: EVIDENCIA OCR (Opcional pero Recomendada) */}
        <div className="space-y-3">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 px-2 flex items-center gap-2">
            <FileText size={12} className="text-blue-500" /> Placa / Infografía
          </span>
          <div
            onClick={() => ocrInputRef.current?.click()}
            className={cn(
              "relative aspect-video rounded-[2rem] border-2 border-dashed transition-all duration-500 cursor-pointer overflow-hidden",
              ocrPreview ? "border-blue-500/40" : "border-white/10 hover:border-white/20 bg-white/[0.02]"
            )}
          >
            {ocrPreview ? (
              <Image src={ocrPreview} alt="OCR" fill className="object-cover animate-in zoom-in-95 duration-500 grayscale" unoptimized />
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 opacity-20">
                <FileText size={32} />
                <span className="text-[8px] font-bold uppercase tracking-widest text-center px-4">Capturar texto histórico</span>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" ref={ocrInputRef} className="hidden" onChange={(e) => handleImageCapture(e, 'OCR')} />
          </div>
        </div>
      </div>

      {/* 
          II. MODULO ACÚSTICO (AMBIENT SOUND) 
          Permite al Admin "congelar" el sonido real del lugar.
      */}
      <div className="px-6">
        <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 shadow-inner flex flex-col items-center gap-6">
          <div className="text-center space-y-2">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-400 flex items-center justify-center gap-3">
              <Volume2 size={14} className="text-primary" /> Paisaje Sonoro
            </h3>
            <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Graba 15s del sonido ambiente para inmersión total</p>
          </div>

          <button
            onMouseDown={toggleRecording}
            onMouseUp={toggleRecording}
            onTouchStart={toggleRecording}
            onTouchEnd={toggleRecording}
            className={cn(
              "h-24 w-24 rounded-full flex items-center justify-center transition-all duration-500 relative",
              isRecording ? "bg-red-500 scale-110" : "bg-primary/20 hover:bg-primary/30 border border-primary/40 shadow-2xl"
            )}
          >
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 bg-red-500 rounded-full"
                />
              )}
            </AnimatePresence>
            <Mic className={cn("relative z-10 h-10 w-10", isRecording ? "text-white" : "text-primary")} />
          </button>

          {state.ambientAudioBlob && !isRecording && (
            <div className="flex items-center gap-2 text-emerald-500 animate-in fade-in zoom-in-95">
              <CheckCircle2 size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">Señal de ambiente capturada</span>
            </div>
          )}
        </div>
      </div>

      {/* 
          III. BOTÓN DE AVANCE 
          Solo se habilita si el Hero Shot está presente.
      */}
      <div className="px-6 mt-auto">
        <Button
          onClick={nextStep}
          disabled={!heroPreview}
          className="w-full h-16 rounded-[1.5rem] bg-primary text-white font-black uppercase tracking-[0.3em] shadow-2xl hover:brightness-110 transition-all group"
        >
          <span className="relative z-10 flex items-center gap-4">
            CONFIGURAR INTENCIÓN
            <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
          </span>
        </Button>
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Procesamiento Base64: Almacenamos las fotos en formato base64 directamente 
 *    en el contexto. Esto permite que las previsualizaciones sean instantáneas y 
 *    que el payload esté listo para la Server Action del siguiente paso.
 * 2. Ergonomía de Grabación: El botón de audio utiliza eventos de 'Touch' y 'Mouse' 
 *    para una experiencia 'Push-to-Talk' natural, ideal para capturar ráfagas 
 *    de sonido ambiente sin distracciones.
 * 3. Integridad Visual: Los componentes de imagen utilizan 'unoptimized' de Next.js
 *    porque los Base64 dinámicos no pueden ser cacheados por el CDN en esta fase.
 */