// components/geo/steps/step-2-sensory-capture.tsx
// VERSIÓN: 2.6 (NicePod Sovereign Sensory Capture - OOM Prevention Edition)
// Misión: Capturar evidencia física (Visión y Sonido) manteniendo la RAM intacta.
// [ESTABILIZACIÓN]: Erradicación de Base64. Uso de File Objects y Blob URLs locales.

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
  Volume2
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

  // --- PUNTEROS DE MEMORIA LIGERA (BLOB URLs) ---
  const [heroPreviewUrl, setHeroPreviewUrl] = useState<string | null>(null);
  const [ocrPreviewUrl, setOcrPreviewUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false); // Bloqueo de UI durante subida

  // Referencias Tácticas
  const heroInputRef = useRef<HTMLInputElement>(null);
  const ocrInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  /**
   * PROTOCOLO DE HIGIENE DE RAM (Garbage Collection)
   * Libera la memoria de las Blob URLs cuando el componente se desmonta
   * o cuando el Admin descarta una foto para tomar otra.
   */
  useEffect(() => {
    // Si ya existe un File en el contexto (ej. volver atrás desde otro paso), generamos la preview
    if (state.heroImageFile && !heroPreviewUrl) {
      setHeroPreviewUrl(URL.createObjectURL(state.heroImageFile));
    }
    if (state.ocrImageFile && !ocrPreviewUrl) {
      setOcrPreviewUrl(URL.createObjectURL(state.ocrImageFile));
    }

    return () => {
      // Limpieza exhaustiva al destruir el componente
      if (heroPreviewUrl) URL.revokeObjectURL(heroPreviewUrl);
      if (ocrPreviewUrl) URL.revokeObjectURL(ocrPreviewUrl);
    };
  }, [state.heroImageFile, state.ocrImageFile]);

  /**
   * handleFileCapture:
   * Captura el binario puro de la cámara y genera un puntero local efímero.
   * Cero estrés térmico para el dispositivo móvil.
   */
  const handleFileCapture = (e: React.ChangeEvent<HTMLInputElement>, type: 'HERO' | 'OCR') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);

    if (type === 'HERO') {
      if (heroPreviewUrl) URL.revokeObjectURL(heroPreviewUrl); // Purgamos la anterior
      setHeroPreviewUrl(localUrl);
      dispatch({ type: 'SET_HERO_IMAGE', payload: file });
    } else {
      if (ocrPreviewUrl) URL.revokeObjectURL(ocrPreviewUrl); // Purgamos la anterior
      setOcrPreviewUrl(localUrl);
      dispatch({ type: 'SET_OCR_IMAGE', payload: file });
    }
  };

  /**
   * toggleRecording:
   * Protocolo de captura de Soundscape ambiental.
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
      console.error("🔥 [Step-Sensory] Error de hardware (Micrófono):", err);
    }
  };

  /**
   * handleInitiateIngestion:
   * Ejecuta el salto cuántico entre Hardware y Servidor.
   * Detona la acción que sube los binarios y llama a Gemini Flash para el OCR.
   */
  const handleInitiateIngestion = async () => {
    if (!state.heroImageFile) return;

    setIsIngesting(true);

    try {
      await geoEngine.ingestSensoryData({
        heroImage: state.heroImageFile,
        ocrImage: state.ocrImageFile,
        intent: state.intentText, // Pasamos la intención aunque esté vacía por ahora
        categoryId: state.categoryId,
        radius: state.resonanceRadius
      });

      // Nota: No llamamos a nextStep() aquí manualmente.
      // El motor cambiará su estado a 'DOSSIER_READY' tras el éxito, 
      // y el scanner-ui.tsx lo detectará y renderizará el Step 3 automáticamente.

    } catch (error) {
      console.error("🔥 [Step-Sensory] Fallo al iniciar Ingesta:", error);
      setIsIngesting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-8 animate-in fade-in duration-700 overflow-y-auto custom-scrollbar pb-20">

      {/* --- HEADER TÁCTICO --- */}
      <div className="px-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={prevStep}
          disabled={isIngesting}
          className="rounded-full h-10 w-10 p-0 bg-white/5 border border-white/5 text-zinc-500 hover:text-white"
        >
          <ChevronLeft size={20} />
        </Button>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Fase 02</p>
          <h2 className="text-xl font-black uppercase text-white italic">Sensores</h2>
        </div>
      </div>

      {/* --- I. MÓDULO DE VISIÓN (OPTICAL SENSORS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6">

        {/* Cámara 1: VISTA HERO (Obligatoria) */}
        <div className="space-y-3">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 px-2 flex items-center gap-2">
            <Camera size={12} className="text-primary" /> Captura Monumental
          </span>
          <div
            onClick={() => !isIngesting && heroInputRef.current?.click()}
            className={cn(
              "relative aspect-video rounded-[2rem] border-2 border-dashed transition-all duration-500 cursor-pointer overflow-hidden",
              heroPreviewUrl ? "border-primary/40" : "border-white/10 hover:border-white/20 bg-white/[0.02]",
              isIngesting && "opacity-50 pointer-events-none"
            )}
          >
            {heroPreviewUrl ? (
              <Image src={heroPreviewUrl} alt="Hero Preview" fill className="object-cover animate-in zoom-in-95 duration-500" unoptimized />
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 opacity-20">
                <Camera size={32} />
                <span className="text-[8px] font-bold uppercase tracking-widest text-center px-4">Fijar objetivo principal</span>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" ref={heroInputRef} className="hidden" onChange={(e) => handleFileCapture(e, 'HERO')} />
          </div>
        </div>

        {/* Cámara 2: EVIDENCIA OCR (Opcional pero Recomendada) */}
        <div className="space-y-3">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 px-2 flex items-center gap-2">
            <FileText size={12} className="text-blue-500" /> Placa o Inscripción
          </span>
          <div
            onClick={() => !isIngesting && ocrInputRef.current?.click()}
            className={cn(
              "relative aspect-video rounded-[2rem] border-2 border-dashed transition-all duration-500 cursor-pointer overflow-hidden",
              ocrPreviewUrl ? "border-blue-500/40" : "border-white/10 hover:border-white/20 bg-white/[0.02]",
              isIngesting && "opacity-50 pointer-events-none"
            )}
          >
            {ocrPreviewUrl ? (
              <Image src={ocrPreviewUrl} alt="OCR Preview" fill className="object-cover animate-in zoom-in-95 duration-500 grayscale" unoptimized />
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 opacity-20">
                <FileText size={32} />
                <span className="text-[8px] font-bold uppercase tracking-widest text-center px-4">Evidencia histórica para la IA</span>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" ref={ocrInputRef} className="hidden" onChange={(e) => handleFileCapture(e, 'OCR')} />
          </div>
        </div>
      </div>

      {/* --- II. MÓDULO ACÚSTICO (SOUNDSCAPE) --- */}
      <div className="px-6">
        <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 shadow-inner flex flex-col items-center gap-6">
          <div className="text-center space-y-2">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-400 flex items-center justify-center gap-3">
              <Volume2 size={14} className="text-primary" /> Paisaje Sonoro
            </h3>
            <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Congela el audio ambiente del lugar (15s)</p>
          </div>

          <button
            onMouseDown={toggleRecording}
            onMouseUp={toggleRecording}
            onTouchStart={toggleRecording}
            onTouchEnd={toggleRecording}
            disabled={isIngesting}
            className={cn(
              "h-24 w-24 rounded-full flex items-center justify-center transition-all duration-500 relative",
              isRecording ? "bg-red-500 scale-110" : "bg-primary/20 hover:bg-primary/30 border border-primary/40 shadow-2xl",
              isIngesting && "opacity-30 cursor-not-allowed"
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
              <span className="text-[9px] font-black uppercase tracking-widest">Frecuencia asegurada</span>
            </div>
          )}
        </div>
      </div>

      {/* --- III. DISPARADOR DE INGESTA (GATEWAY) --- */}
      <div className="px-6 mt-auto pb-4">
        <Button
          onClick={handleInitiateIngestion}
          disabled={!state.heroImageFile || isIngesting}
          className="w-full h-16 rounded-[1.5rem] bg-primary text-white font-black uppercase tracking-[0.3em] shadow-2xl hover:brightness-110 transition-all group overflow-hidden relative"
        >
          {isIngesting ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-black/50" />
              <span className="text-black">Ingestando...</span>
            </div>
          ) : (
            <span className="relative z-10 flex items-center gap-4 text-black">
              PROCESAR EVIDENCIA
              <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </span>
          )}
        </Button>
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.6):
 * 1. OOM Prevention Lograda: Al no usar Base64 en el componente, la memoria 
 *    RAM de la Workstation nunca excede el límite crítico de iOS/Android Safari.
 * 2. Upload en Background: Al pulsar 'PROCESAR EVIDENCIA', la Server Action
 *    inicia la subida binaria. El componente muestra el spinner sin bloquear el DOM.
 * 3. Transición Orgánica: El botón final llama a `geoEngine.ingestSensoryData()`. 
 *    Esto cambia el estado general a `INGESTING`, lo cual dispara la pantalla 
 *    de carga en el orquestador padre (`scanner-ui.tsx`), garantizando una UX cinemática.
 */