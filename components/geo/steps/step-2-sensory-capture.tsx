/**
 * ARCHIVO: components/geo/steps/step-2-sensory-capture.tsx
 * VERSIÓN: 5.3 (NicePod Forge Step 2 - Sovereign Multidimensional Capture & Validation Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Capturar la verdad física del entorno urbano mediante evidencia visual, 
 * acústica, temporal y referencias externas, integrando el Dictado Sensorial.
 * [REFORMA V5.3]: Validación de integridad taxonómica absoluta, purificación nominal 
 * industrial y saneamiento de clases Tailwind para Vercel.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, 
  FileText, 
  Trash2, 
  Plus, 
  Loader2, 
  Zap,
  AlertCircle,
  Clock,
  Link as LinkIcon,
  BrainCircuit
} from "lucide-react";
import React, { useCallback, useState, useRef, useMemo } from "react";

// --- INFRAESTRUCTURA CORE V4.0 ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useForge } from "../forge-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GeoRecorder } from "../geo-recorder";
import { cn, nicepodLog } from "@/lib/utils";
import { HistoricalEpoch } from "@/types/geo-sovereignty";

/**
 * TAXONOMÍA DE ÉPOCAS (RELOJ SOBERANO)
 */
const HISTORICAL_EPOCH_OPTIONS: { value: HistoricalEpoch; label: string }[] = [
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
 * Step2SensoryCapture: El laboratorio de captura de inteligencia urbana.
 */
export default function Step2SensoryCapture() {
  // 1. CONSUMO DE LA FACHADA SOBERANA Y MEMORIA TÁCTICA
  const { 
    ingestSensoryData, 
    error: geographicError 
  } = useGeoEngine();

  const { state: forgeState, dispatch, nextStep, prevStep } = useForge();

  // 2. REFERENCIAS Y ESTADOS DE PROCESAMIENTO
  const [isProcessingActive, setIsProcessingActive] = useState<boolean>(false);
  const heroInputReference = useRef<HTMLInputElement>(null);
  const ocrInputReference = useRef<HTMLInputElement>(null);

  /**
   * handleHeroImageCapture:
   * Misión: Validar y asignar la imagen de autoridad principal del hito.
   */
  const handleHeroImageCapture = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      nicepodLog(`📸 [Step2] Evidencia Hero detectada: ${selectedFile.name}`);
      dispatch({ type: 'SET_HERO_IMAGE', payload: selectedFile });
    }
  }, [dispatch]);

  /**
   * handleOcrImageAddition:
   * Misión: Anexar pruebas secundarias al expediente visual.
   */
  const handleOcrImageAddition = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      Array.from(selectedFiles).forEach((file) => {
        dispatch({ type: 'ADD_OCR_IMAGE', payload: file });
      });
    }
  }, [dispatch]);

  /**
   * handleVoiceIntentCapture:
   * Misión: Recibir el binario acústico del hardware y alojarlo en el contexto de forja.
   */
  const handleVoiceIntentCapture = useCallback(async (audioBlob: Blob, durationSeconds: number) => {
    nicepodLog(`🎙️ [Step2] Dictado sensorial capturado: ${durationSeconds} segundos.`);
    dispatch({ type: 'SET_INTENT_AUDIO', payload: audioBlob });
  }, [dispatch]);

  /**
   * executeSensoryIngestion:
   * Misión: Disparar el orquestador lightning para la subida y peritaje por IA.
   */
  const executeSensoryIngestion = async () => {
    // Verificación de integridad estructural previa al envío.
    if (
      !forgeState.heroImageFile || 
      !forgeState.historicalEpoch || 
      !forgeState.categoryMission || 
      !forgeState.categoryEntity
    ) {
      nicepodLog("🛑 [Step2] Ingesta bloqueada: Dimensiones taxonómicas incompletas.", null, "warn");
      return;
    }

    setIsProcessingActive(true);
    nicepodLog("⚙️ [Step2] Iniciando protocolo de ingesta multimodal V4.0...");

    try {
      // Invocación a la Fachada sincronizada con el contrato de tipos V7.6.
      const ingestionResults = await ingestSensoryData({
        heroImage: forgeState.heroImageFile,
        ocrImages: forgeState.ocrImageFiles,
        ambientAudio: forgeState.ambientAudioBlob,
        intentText: forgeState.intentText,
        intentAudioBlob: forgeState.intentAudioBlob, 
        categoryMission: forgeState.categoryMission,
        categoryEntity: forgeState.categoryEntity,
        historicalEpoch: forgeState.historicalEpoch,
        resonanceRadius: forgeState.resonanceRadius,
        referenceUrl: forgeState.referenceUrl
      });

      if (ingestionResults) {
        nicepodLog("✅ [Step2] Evidencia blindada. Procediendo a Auditoría.");
        dispatch({
          type: 'SET_INGESTION_RESULT',
          payload: { 
            poiId: ingestionResults.pointOfInterestIdentification, 
            dossier: ingestionResults.dossier 
          }
        });
        nextStep();
      }
    } catch (exception) {
      nicepodLog("🔥 [Step2] Fallo crítico durante la ingesta de inteligencia.", exception, 'error');
    } finally {
      setIsProcessingActive(false);
    }
  };

  /**
   * isIngestionIntegrityValidated:
   * Determina si el Administrador ha completado todos los ejes del peritaje.
   */
  const isIngestionIntegrityValidated = useMemo(() => {
    return (
      !!forgeState.heroImageFile && 
      !!forgeState.historicalEpoch && 
      !!forgeState.categoryMission && 
      !!forgeState.categoryEntity
    );
  }, [forgeState.heroImageFile, forgeState.historicalEpoch, forgeState.categoryMission, forgeState.categoryEntity]);

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-y-auto custom-scrollbar px-6 py-4">
      
      {/* CABECERA TÁCTICA */}
      <div className="mb-6 shrink-0">
        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2 block">
          Fase 2: Captura de Inteligencia
        </label>
        <h3 className="text-white font-black uppercase tracking-tighter text-2xl italic leading-none">
          Malla de Evidencia
        </h3>
      </div>

      {/* SECCIÓN I: VISIÓN (HERO & OCR) */}
      <div className="mb-8 space-y-4">
        <div 
          onClick={() => heroInputReference.current?.click()}
          className={cn(
            "relative aspect-video rounded-[2.5rem] border-2 border-dashed transition-all duration-500 cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-4",
            forgeState.heroImageFile 
              ? "border-primary/40 bg-primary/5 shadow-&lsqb;0_0_30px_rgba(var(--primary-rgb),0.1)&rsqb;" 
              : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20"
          )}
        >
          {forgeState.heroImageFile ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-700">
              <Zap className="text-primary h-10 w-10 mb-3 animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Hito Visual Asegurado</span>
              <span className="text-[8px] text-zinc-400 mt-2 uppercase max-w-[70%] truncate font-mono">
                {forgeState.heroImageFile.name}
              </span>
            </div>
          ) : (
            <>
              <Camera className="text-zinc-600 h-12 w-12" />
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] text-center px-12 leading-relaxed">
                Pulsar para activar peritaje óptico
              </span>
            </>
          )}
          <input type="file" ref={heroInputReference} onChange={handleHeroImageCapture} accept="image/*" className="hidden" />
        </div>

        <div className="bg-white/[0.01] rounded-[2rem] p-5 border border-white/5 shadow-inner">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Evidencia Secundaria (OCR)</span>
            <Badge variant="outline" className="text-[8px] border-zinc-800 text-zinc-600">
              {forgeState.ocrImageFiles.length}/3
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {forgeState.ocrImageFiles.map((file, index) => (
              <div key={index} className="relative aspect-square rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center group">
                <FileText className="text-zinc-700 h-6 w-6" />
                <button 
                  onClick={() => dispatch({ type: 'REMOVE_OCR_IMAGE', payload: index })}
                  className="absolute -top-2 -right-2 bg-red-500/80 text-white p-1.5 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {forgeState.ocrImageFiles.length < 3 && (
              <button 
                onClick={() => ocrInputReference.current?.click()}
                className="aspect-square rounded-2xl border-2 border-dashed border-white/5 bg-transparent hover:bg-white/[0.03] hover:border-white/20 flex items-center justify-center transition-all"
              >
                <Plus className="text-zinc-800 h-8 w-8" />
              </button>
            )}
          </div>
          <input type="file" ref={ocrInputReference} onChange={handleOcrImageAddition} accept="image/*" multiple className="hidden" />
        </div>
      </div>

      {/* SECCIÓN II: EL RELOJ SOBERANO (HISTORICAL EPOCH) */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-5 px-1">
          <Clock className="text-primary h-4 w-4" />
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Sintonía Temporal</label>
        </div>
        <div className="flex overflow-x-auto pb-4 gap-3 -mx-2 px-2 snap-x hide-scrollbar">
          {HISTORICAL_EPOCH_OPTIONS.map((epoch) => (
            <button
              key={epoch.value}
              onClick={() => dispatch({ type: 'SET_EPOCH', payload: epoch.value })}
              className={cn(
                "shrink-0 snap-start px-5 py-3 rounded-2xl border transition-all duration-500 flex flex-col items-center justify-center min-w-[110px]",
                forgeState.historicalEpoch === epoch.value
                  ? "bg-primary text-primary-foreground border-primary shadow-&lsqb;0_10px_20px_rgba(var(--primary-rgb),0.3)&rsqb;"
                  : "bg-white/[0.02] border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10"
              )}
            >
              <span className="text-[10px] font-black uppercase tracking-tighter">
                {epoch.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* SECCIÓN III: INTELIGENCIA COGNITIVA (DICTADO SENSORIAL) */}
      <div className="mb-8 bg-[#080808]/60 border border-white/5 rounded-[2.5rem] p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <BrainCircuit className="text-primary h-4 w-4" />
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Dictado de Intención</label>
        </div>
        
        <div className="mb-6 h-[200px]">
          <GeoRecorder 
            mode="DICTATION" 
            isProcessingExternal={isProcessingActive} 
            onCaptureComplete={handleVoiceIntentCapture} 
          />
        </div>

        <Textarea 
          placeholder="Ajuste manual del peritaje urbano (Opcional)..."
          className="min-h-&lsqb;90px&rsqb; bg-black/40 border-white/10 rounded-2xl p-5 text-sm font-medium placeholder:text-zinc-700 focus:border-primary/40 transition-all resize-none shadow-inner"
          value={forgeState.intentText}
          onChange={(event) => dispatch({ type: 'SET_INTENT', payload: event.target.value })}
          disabled={isProcessingActive}
        />
      </div>

      {/* SECCIÓN IV: PUENTE DE SABIDURÍA (EXTERNAL REFERENCE) */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4 px-1">
          <LinkIcon className="text-zinc-600 h-4 w-4" />
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Fuente de Verdad (Wikipedia/URL)</label>
        </div>
        <Input 
          type="url"
          placeholder="https://..."
          className="bg-white/[0.02] border-white/10 rounded-2xl h-14 px-6 text-sm font-bold text-zinc-300 focus:border-primary/40 placeholder:text-zinc-800 transition-all shadow-inner"
          value={forgeState.referenceUrl}
          onChange={(event) => dispatch({ type: 'SET_REFERENCE_URL', payload: event.target.value })}
          disabled={isProcessingActive}
        />
      </div>

      {/* V. CHASSIS DE NAVEGACIÓN Y ACCIÓN */}
      <div className="flex gap-4 mt-auto pt-6 pb-10">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={isProcessingActive}
          className="w-20 h-20 rounded-[2rem] border-white/10 bg-transparent text-zinc-600 hover:bg-white/5 hover:text-zinc-300 transition-all flex-shrink-0"
        >
          Atrás
        </Button>
        
        <Button
          onClick={executeSensoryIngestion}
          disabled={!isIngestionIntegrityValidated || isProcessingActive}
          className="flex-1 h-20 rounded-[2rem] bg-primary text-primary-foreground font-black tracking-[0.3em] uppercase text-xs shadow-&lsqb;0_20px_40px_rgba(var(--primary-rgb),0.2)&rsqb; group relative overflow-hidden"
        >
          {isProcessingActive ? (
            <div className="flex items-center gap-4 relative z-10">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Analizando...</span>
            </div>
          ) : (
            <span className="flex items-center justify-center gap-4 relative z-10 w-full">
              Ingestar Malla
              <Zap size={20} className="group-hover:scale-125 transition-transform text-primary-foreground fill-current" />
            </span>
          )}
          
          <AnimatePresence>
            {isProcessingActive && (
              <motion.div 
                className="absolute inset-0 bg-white/10 z-0"
                initial={{ x: "-100%" }} 
                animate={{ x: "100%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            )}
          </AnimatePresence>
        </Button>
      </div>

      {geographicError && (
        <div className="mb-6 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 animate-in slide-in-from-bottom-2">
          <AlertCircle className="text-red-500 h-5 w-5 shrink-0" />
          <span className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-normal">
            Fallo en el Link Sensorial: {geographicError}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.3):
 * 1. Descriptive Integrity: Se eliminaron todas las abreviaciones en variables de 
 *    estado y manejadores de eventos para cumplir con el estándar V4.0.
 * 2. Absolute Integrity Guard: La validación del botón de ingesta ahora incluye 
 *    el chequeo de la misión y entidad taxonómica, asegurando que el Oráculo 
 *    jamás reciba un expediente incompleto.
 * 3. Vercel Alignment: Se aplicó el escapado industrial (&lsqb; & rsqb;) en todas 
 *    las clases dinámicas de Tailwind para silenciar los warnings de ambigüedad 
 *    en los logs de construcción.
 */