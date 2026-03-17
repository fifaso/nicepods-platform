// components/geo/steps/step-2-sensory-capture.tsx
// VERSIÓN: 3.0 (NicePod Sovereign Sensory Capture - Multi-Evidence Pro)
// Misión: Captura monumental, mosaico OCR y paisaje sonoro con validación acústica.
// [ESTABILIZACIÓN]: Soporte para 3 imágenes OCR, pre-escucha de audio y JIT Blob URLs.

"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  ChevronLeft,
  FileText,
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
import React, { useEffect, useRef, useState } from "react";

// --- INFRAESTRUCTURA SOBERANA ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useForge } from "../forge-context";

// --- COMPONENTES UI ---
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StepSensoryCapture() {
  const { state, dispatch, prevStep } = useForge();
  const geoEngine = useGeoEngine();

  // --- ESTADOS DE PREVISUALIZACIÓN (MEMORIA EFÍMERA) ---
  const [heroUrl, setHeroUrl] = useState<string | null>(null);
  const [ocrUrls, setOcrUrls] = useState<string[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Estados de Máquina de Grabación
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
   * PROTOCOLO DE HIGIENE DE RAM (Garbage Collection)
   * Gestionamos el ciclo de vida de las URLs locales para evitar OOM.
   */
  useEffect(() => {
    // 1. Sincronía Hero
    if (state.heroImageFile && !heroUrl) {
      const url = URL.createObjectURL(state.heroImageFile);
      setHeroUrl(url);
    }
    // 2. Sincronía OCR Mosaic
    if (state.ocrImageFiles.length > 0 && ocrUrls.length === 0) {
      const urls = state.ocrImageFiles.map(file => URL.createObjectURL(file));
      setOcrUrls(urls);
    }
    // 3. Sincronía Audio
    if (state.ambientAudioBlob && !audioUrl) {
      const url = URL.createObjectURL(state.ambientAudioBlob);
      setAudioUrl(url);
    }

    return () => {
      if (heroUrl) URL.revokeObjectURL(heroUrl);
      ocrUrls.forEach(url => URL.revokeObjectURL(url));
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [state.heroImageFile, state.ocrImageFiles, state.ambientAudioBlob]);

  /**
   * handleHeroCapture: 
   * Captura la imagen principal del monumento.
   */
  const handleHeroCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (heroUrl) URL.revokeObjectURL(heroUrl);
    const url = URL.createObjectURL(file);
    setHeroUrl(url);
    dispatch({ type: 'SET_HERO_IMAGE', payload: file });
  };

  /**
   * handleOcrCapture:
   * Añade una nueva evidencia de texto al mosaico (Límite 3).
   */
  const handleOcrCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || state.ocrImageFiles.length >= 3) return;

    const url = URL.createObjectURL(file);
    setOcrUrls(prev => [...prev, url]);
    dispatch({ type: 'ADD_OCR_IMAGE', payload: file });

    // Limpiamos el input para permitir capturar la misma foto si se desea
    if (ocrInputRef.current) ocrInputRef.current.value = "";
  };

  /**
   * removeOcrImage:
   * Purgar una foto del mosaico de evidencia.
   */
  const removeOcrImage = (index: number) => {
    URL.revokeObjectURL(ocrUrls[index]);
    setOcrUrls(prev => prev.filter((_, i) => i !== index));
    dispatch({ type: 'REMOVE_OCR_IMAGE', payload: index });
  };

  /**
   * PROTOCOLO ACÚSTICO: Grabación de Paisaje Sonoro
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
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        dispatch({ type: 'SET_AMBIENT_AUDIO', payload: blob });
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      if (navigator.vibrate) navigator.vibrate(50);
    } catch (err) {
      console.error("🔥 [Acoustic-Fail]:", err);
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
   * Despacho atómico hacia el Ingestor Multimodal (Edge).
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
      // El motor cambiará a DOSSIER_REVIEW automáticamente al terminar.
    } catch (err) {
      setIsIngesting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-8 animate-in fade-in duration-700 overflow-y-auto custom-scrollbar pb-24 px-6">

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
          <h2 className="text-2xl font-black uppercase text-white italic">Sensores</h2>
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
            "relative aspect-video rounded-[2.5rem] border-2 border-dashed transition-all duration-500 cursor-pointer overflow-hidden group",
            heroUrl ? "border-primary/40 shadow-[0_0_40px_rgba(var(--primary),0.1)]" : "border-white/10 bg-white/[0.02] hover:border-white/20"
          )}
        >
          {heroUrl ? (
            <>
              <Image src={heroUrl} alt="Monument" fill className="object-cover animate-in zoom-in-95 duration-700" unoptimized />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/60 px-4 py-2 rounded-full">Cambiar Captura</span>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20">
              <Camera size={40} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-center px-12">Capture el monumento principal</p>
            </div>
          )}
          <input type="file" accept="image/*" ref={heroInputRef} className="hidden" onChange={handleHeroCapture} />
        </div>
      </div>

      {/* --- II. MOSAICO DE EVIDENCIA (OCR ARRAY) --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3 opacity-50">
            <FileText size={14} className="text-blue-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Mosaico de Placas</h3>
          </div>
          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{state.ocrImageFiles.length}/3 fotos</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {ocrUrls.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group animate-in zoom-in-90">
              <Image src={url} alt={`Evidence ${index}`} fill className="object-cover" unoptimized />
              <button
                onClick={() => removeOcrImage(index)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {state.ocrImageFiles.length < 3 && (
            <button
              onClick={() => ocrInputRef.current?.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 flex items-center justify-center transition-all"
            >
              <Plus size={24} className="text-zinc-700" />
            </button>
          )}
        </div>
        <input type="file" accept="image/*" ref={ocrInputRef} className="hidden" onChange={handleOcrCapture} />
      </div>

      {/* --- III. PAISAJE SONORO (VALIDACIÓN ACÚSTICA) --- */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2 opacity-50">
          <Volume2 size={14} className="text-emerald-500" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Resonancia Ambiental</h3>
        </div>

        <div className="p-8 rounded-[3rem] bg-white/[0.02] border border-white/5 shadow-inner flex flex-col items-center gap-8 relative overflow-hidden">

          {/* Monitor de Estado */}
          <div className="text-center space-y-2 relative z-10">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">
              {isRecording ? "Capturando Frecuencia..." : audioUrl ? "Audio Listo para Auditoría" : "Graba 15s de ambiente"}
            </p>
          </div>

          <div className="flex items-center gap-6 relative z-10">
            {/* Botón de Grabación */}
            {!audioUrl && (
              <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={cn(
                  "h-24 w-24 rounded-full flex items-center justify-center transition-all duration-500 relative",
                  isRecording ? "bg-red-500 scale-110 shadow-[0_0_40px_rgba(239,68,68,0.4)]" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20"
                )}
              >
                <Mic size={32} className={cn(isRecording && "animate-pulse")} />
                {isRecording && (
                  <motion.div
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute inset-0 bg-red-500 rounded-full"
                  />
                )}
              </button>
            )}

            {/* Reproductor de Revisión */}
            {audioUrl && (
              <div className="flex items-center gap-4 animate-in slide-in-from-bottom-2">
                <Button
                  onClick={() => isPlayingAudio ? audioPlayerRef.current?.pause() : audioPlayerRef.current?.play()}
                  className="h-16 w-16 rounded-full bg-white text-black hover:bg-zinc-200"
                >
                  {isPlayingAudio ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setAudioUrl(null);
                    dispatch({ type: 'SET_AMBIENT_AUDIO', payload: null });
                  }}
                  className="h-16 w-16 rounded-full border border-white/5 text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 size={20} />
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

      {/* --- IV. ACCIÓN DE PROGRESO (THE GATEWAY) --- */}
      <div className="mt-auto">
        <Button
          onClick={handleInitiateIngestion}
          disabled={!state.heroImageFile || isIngesting || isRecording}
          className="w-full h-20 rounded-[2.5rem] bg-primary text-black font-black uppercase tracking-[0.5em] shadow-2xl hover:brightness-110 active:scale-95 group relative overflow-hidden"
        >
          {isIngesting ? (
            <div className="flex items-center gap-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>TRANSMITIENDO...</span>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-xl">
              PROCESAR DOSSIER
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-500" />
            </div>
          )}
        </Button>
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Monitor Acústico Real: Se ha implementado el flujo 'Grabación -> Pre-escucha -> Confirmación'. 
 *    Esto garantiza que el Admin no suba sonidos accidentales o de baja calidad.
 * 2. Mosaico Multimodal: El componente ahora maneja un array de hasta 3 fotos OCR. 
 *    Al pulsar 'Procesar', el 'useGeoEngine' las sube en paralelo para alimentar la IA.
 * 3. Gestión de Hardware Flex: Se eliminó el atributo 'capture' para permitir al Admin 
 *    usar fotos de la galería, otorgando una soberanía total sobre el activo visual.
 */