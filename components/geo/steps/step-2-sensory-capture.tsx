/**
 * ARCHIVO: components/geo/steps/step-2-sensory-capture.tsx
 * VERSIÓN: 5.0 (NicePod Forge Step 2 - Sovereign Multidimensional Capture Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Capturar la verdad física del entorno urbano mediante evidencia visual, 
 * acústica, temporal y referencias externas.
 * [REFORMA V5.0]: Integración del GeoRecorder (Voz), Selector de Época, Enlace de 
 * Sabiduría y alineación del payload con la Taxonomía Granular.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { motion } from "framer-motion";
import { 
  Camera, 
  FileText, 
  Trash2, 
  Plus, 
  Loader2, 
  Zap,
  AlertCircle,
  Clock,
  Link as LinkIcon
} from "lucide-react";
import React, { useCallback, useState, useRef, useMemo } from "react";

// --- INFRAESTRUCTURA CORE V4.0 ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useForge } from "../forge-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { GeoRecorder } from "../geo-recorder";
import { cn, nicepodLog } from "@/lib/utils";
import { HistoricalEpoch } from "@/types/geo-sovereignty";

/**
 * TAXONOMÍA DE ÉPOCAS (RELÓJ SOBERANO)
 */
const EPOCH_OPTIONS: { value: HistoricalEpoch; label: string }[] = [
  { value: 'origen_geologico', label: 'Geológico' },
  { value: 'pre_industrial', label: 'Pre-Industrial' },
  { value: 'siglo_de_oro', label: 'Siglo de Oro' },
  { value: 'ilustracion_borbonica', label: 'Ilustración' },
  { value: 'modernismo_expansion', label: 'Modernismo' },
  { value: 'contemporaneo', label: 'Contemporáneo' },
  { value: 'futuro_especulativo', label: 'Especulativo' },
  { value: 'atemporal', label: 'Atemporal' }
];

/**
 * Step2SensoryCapture: El laboratorio de captura multidimensional.
 */
export default function Step2SensoryCapture() {
  // 1. CONSUMO DE LA FACHADA Y MEMORIA
  const { 
    ingestSensoryData, 
    error: geographicError 
  } = useGeoEngine();

  const { state: forgeState, dispatch, nextStep, prevStep } = useForge();

  // 2. ESTADOS LOCALES DE PROCESAMIENTO
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const heroInputReference = useRef<HTMLInputElement>(null);
  const ocrInputReference = useRef<HTMLInputElement>(null);

  /**
   * 3. MANEJADORES DE EVIDENCIA FÍSICA
   */
  const handleHeroCapture = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      nicepodLog(`📸 [Step2] Captura Hero detectada: ${selectedFile.name}`);
      dispatch({ type: 'SET_HERO_IMAGE', payload: selectedFile });
    }
  }, [dispatch]);

  const handleOcrAddition = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      Array.from(selectedFiles).forEach((file) => {
        dispatch({ type: 'ADD_OCR_IMAGE', payload: file });
      });
    }
  }, [dispatch]);

  /**
   * 4. MANEJADOR DE DICTADO SENSORIAL
   * Misión: Recibir el Blob desde la Grabadora Universal y alojarlo en la RAM de la Forja.
   */
  const handleVoiceIntentCapture = useCallback(async (audioBlob: Blob, duration: number) => {
    nicepodLog(`🎙️ [Step2] Dictado acústico retenido en RAM (${duration}s).`);
    dispatch({ type: 'SET_INTENT_AUDIO', payload: audioBlob });
  }, [dispatch]);

  /**
   * 5. INGESTA SOBERANA MULTIDIMENSIONAL
   */
  const handleSensoryIngestion = async () => {
    // Validamos requerimientos mínimos de la Máquina de Estados (Hero y Época)
    if (!forgeState.heroImageFile || !forgeState.historicalEpoch || !forgeState.categoryMission || !forgeState.categoryEntity) {
      nicepodLog("🛑 [Step2] Intento de ingesta abortado por Malla incompleta.", null, "warn");
      return;
    }

    setIsProcessing(true);
    nicepodLog("⚙️ [Step2] Iniciando ingesta multimodal (Visión + Acústica + Datos)...");

    try {
      // Invocación a la Fachada con el Payload V4.0 completo
      const ingestionResult = await ingestSensoryData({
        heroImage: forgeState.heroImageFile,
        ocrImages: forgeState.ocrImageFiles,
        ambientAudio: forgeState.ambientAudioBlob, // Opcional (paisaje sonoro)
        intentText: forgeState.intentText,
        intentAudioBlob: forgeState.intentAudioBlob, // El dictado que la Fachada transcribirá
        categoryMission: forgeState.categoryMission,
        categoryEntity: forgeState.categoryEntity,
        historicalEpoch: forgeState.historicalEpoch,
        resonanceRadius: forgeState.resonanceRadius,
        referenceUrl: forgeState.referenceUrl
      });

      if (ingestionResult) {
        nicepodLog("✅ [Step2] Evidencia blindada. Avanzando a Auditoría de Dossier.");
        dispatch({
          type: 'SET_INGESTION_RESULT',
          payload: { 
            poiId: ingestionResult.poiId, 
            dossier: ingestionResult.dossier 
          }
        });
        nextStep();
      }
    } catch (error) {
      nicepodLog("🔥 [Step2] Fallo crítico en ingesta sensorial.", error, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * VALIDACIÓN ACTIVA PARA EL BOTÓN DE SUBIDA
   */
  const isPayloadReady = useMemo(() => {
    return !!forgeState.heroImageFile && !!forgeState.historicalEpoch;
  }, [forgeState.heroImageFile, forgeState.historicalEpoch]);

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-y-auto custom-scrollbar px-6 py-4">
      
      {/* CABECERA */}
      <div className="mb-6 shrink-0">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2 block">
          Fase 2: Evidencia Física
        </label>
        <h3 className="text-white font-black uppercase tracking-tight text-xl leading-none">
          Peritaje Multidimensional
        </h3>
      </div>

      {/* BLOQUE I: VISIÓN (HERO & OCR) */}
      <div className="mb-8 space-y-4">
        {/* HERO IMAGE */}
        <div 
          onClick={() => heroInputReference.current?.click()}
          className={cn(
            "relative aspect-video rounded-[2rem] border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-3",
            forgeState.heroImageFile 
              ? "border-primary/40 bg-primary/5" 
              : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20"
          )}
        >
          {forgeState.heroImageFile ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
              <Zap className="text-primary h-8 w-8 mb-2 animate-pulse" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Evidencia Primaria Asegurada</span>
              <span className="text-[8px] text-zinc-400 mt-1 uppercase max-w-[80%] truncate">{forgeState.heroImageFile.name}</span>
            </div>
          ) : (
            <>
              <Camera className="text-zinc-600 h-10 w-10" />
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest text-center px-8">
                Capturar Imagen de Autoridad
              </span>
            </>
          )}
          <input type="file" ref={heroInputReference} onChange={handleHeroCapture} accept="image/*" className="hidden" />
        </div>

        {/* OCR MOSAIC */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Mosaico de Detalle (Placas)</span>
            <span className="text-[9px] font-bold text-zinc-600 uppercase">{forgeState.ocrImageFiles.length} / 3</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {forgeState.ocrImageFiles.map((file, index) => (
              <div key={index} className="relative aspect-square rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center group">
                <FileText className="text-zinc-700 h-5 w-5" />
                <button 
                  onClick={() => dispatch({ type: 'REMOVE_OCR_IMAGE', payload: index })}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white p-1.5 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
            {forgeState.ocrImageFiles.length < 3 && (
              <button 
                onClick={() => ocrInputReference.current?.click()}
                className="aspect-square rounded-[1.5rem] border-2 border-dashed border-white/5 bg-white/[0.01] hover:bg-white/[0.04] flex items-center justify-center transition-colors"
              >
                <Plus className="text-zinc-700 h-5 w-5" />
              </button>
            )}
          </div>
          <input type="file" ref={ocrInputReference} onChange={handleOcrAddition} accept="image/*" multiple className="hidden" />
        </div>
      </div>

      {/* BLOQUE II: EL RELOJ SOBERANO (ÉPOCA) */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-primary h-4 w-4" />
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Temporalidad (Requerido)</label>
        </div>
        <div className="flex overflow-x-auto custom-scrollbar pb-2 gap-2 -mx-2 px-2 snap-x">
          {EPOCH_OPTIONS.map((epoch) => (
            <button
              key={epoch.value}
              onClick={() => dispatch({ type: 'SET_EPOCH', payload: epoch.value })}
              className={cn(
                "shrink-0 snap-start px-4 py-2.5 rounded-2xl border transition-all duration-300 flex flex-col gap-1",
                forgeState.historicalEpoch === epoch.value
                  ? "bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)]"
                  : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
              )}
            >
              <span className={cn("text-[9px] font-black uppercase tracking-widest", forgeState.historicalEpoch === epoch.value ? "text-primary" : "text-zinc-400")}>
                {epoch.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* BLOQUE III: INTELIGENCIA COGNITIVA (VOZ + TEXTO) */}
      <div className="mb-8 bg-white/[0.02] border border-white/5 rounded-[2rem] p-5">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-4 block">
          Semilla de Intención
        </label>
        
        {/* Grabadora Universal V3.0 en Modo Dictado */}
        <div className="mb-4">
          <GeoRecorder 
            mode="DICTATION" 
            isProcessingExternal={isProcessing} 
            onCaptureComplete={handleVoiceIntentCapture} 
          />
        </div>

        <Textarea 
          placeholder="Opcional: Escriba detalles o corrija su dictado aquí..."
          className="min-h-[80px] bg-black/40 border-white/10 rounded-xl p-4 text-xs font-medium placeholder:text-zinc-700 focus:border-primary/40 transition-all resize-none"
          value={forgeState.intentText}
          onChange={(event) => dispatch({ type: 'SET_INTENT', payload: event.target.value })}
          disabled={isProcessing}
        />
      </div>

      {/* BLOQUE IV: PUENTE DE SABIDURÍA (ENLACE) */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <LinkIcon className="text-zinc-500 h-3 w-3" />
          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Referencia Documental (Opcional)</label>
        </div>
        <Input 
          type="url"
          placeholder="https://es.wikipedia.org/wiki/..."
          className="bg-white/[0.02] border-white/5 rounded-xl h-12 text-xs font-medium focus:border-primary/40 placeholder:text-zinc-700"
          value={forgeState.referenceUrl}
          onChange={(event) => dispatch({ type: 'SET_REFERENCE_URL', payload: event.target.value })}
          disabled={isProcessing}
        />
      </div>

      {/* V. CHASSIS DE NAVEGACIÓN */}
      <div className="flex gap-4 mt-auto pt-4 pb-8">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={isProcessing}
          className="w-16 h-16 rounded-2xl border-white/10 bg-transparent text-zinc-500 hover:bg-white/5 flex-shrink-0"
        >
          Atrás
        </Button>
        
        <Button
          onClick={handleSensoryIngestion}
          disabled={!isPayloadReady || isProcessing}
          className="flex-1 h-16 rounded-2xl bg-primary text-primary-foreground font-black tracking-[0.2em] uppercase text-[10px] shadow-2xl shadow-primary/20 group relative overflow-hidden"
        >
          {isProcessing ? (
            <div className="flex items-center gap-3 relative z-10">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Transmutando...</span>
            </div>
          ) : (
            <span className="flex items-center justify-center gap-3 relative z-10 w-full">
              Ingestar Evidencia
              <Zap size={16} className="group-hover:scale-125 transition-transform text-black fill-current" />
            </span>
          )}
          {isProcessing && (
            <motion.div 
              className="absolute inset-0 bg-white/20 z-0"
              initial={{ x: "-100%" }} animate={{ x: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          )}
        </Button>
      </div>

      {geographicError && (
        <div className="mt-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
          <AlertCircle className="text-red-500 h-4 w-4 shrink-0" />
          <span className="text-[8px] font-black text-red-400 uppercase tracking-widest leading-normal">
            Error: {geographicError}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Deep Ingestion Dashboard: El componente ha dejado de ser un formulario para 
 *    convertirse en un panel de control pericial. Integramos captura óptica, acústica, 
 *    temporal y documental en una sola vista ergonómica.
 * 2. Voice-First Fallback: El uso del GeoRecorder en modo DICTATION permite que el 
 *    Administrador grabe el audio, y el Orquestador Fachada se encarga de enviarlo a 
 *    la Edge Function de transcripción de forma paralela a la compresión de imágenes.
 * 3. Validation Logic: El botón de ingesta no se habilita hasta que la Máquina de Estados 
 *    detecte la Foto Hero y la Época Histórica (Requerimientos mínimos V4.0).
 */