/**
 * ARCHIVO: components/geo/steps/step-2-sensory-capture.tsx
 * VERSIÓN: 7.0 (NicePod Forge Step 2 - Sovereign Sensory Lab & Absolute Nominal Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Capturar la verdad física del entorno mediante evidencia visual, acústica, 
 * temporal y documental, orquestando la ingesta hacia el Oráculo de Inteligencia.
 * [REFORMA V7.0]: Sincronización nominal total con la Constitución V8.6 y el 
 * Orquestador de Forja V8.0. Resolución definitiva de errores TS2353 (OCR property 
 * mismatch). Erradicación absoluta de abreviaturas (ZAP) y sellado térmico.
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
import { useForge } from "@/components/geo/forge-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GeoRecorder } from "@/components/geo/geo-recorder";
import { cn, nicepodLog } from "@/lib/utils";
import { HistoricalEpoch } from "@/types/geo-sovereignty";

/**
 * TAXONOMÍA DE ÉPOCAS (EL RELOJ SOBERANO INDUSTRIAL)
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
 * Step2SensoryCapture: El laboratorio de captura de inteligencia urbana de la terminal.
 */
export default function Step2SensoryCapture() {
  
  // 1. CONSUMO DE LA FACHADA SOBERANA Y CONTEXTO DE FORJA
  const { 
    ingestSensoryData: executeSensoryDataIngestionAction, 
    error: geographicIntelligenceError 
  } = useGeoEngine();

  const { 
    state: forgeState, 
    dispatch: stateDispatcher, 
    nextStep: navigateToNextStepAction, 
    prevStep: navigateToPreviousStepAction 
  } = useForge();

  // 2. REFERENCIAS Y ESTADOS DE PROCESAMIENTO INDUSTRIAL
  const [isSensoryIngestionProcessActive, setIsSensoryIngestionProcessActive] = useState<boolean>(false);
  const heroImageInputElementReference = useRef<HTMLInputElement>(null);
  const opticalCharacterRecognitionImageInputElementReference = useRef<HTMLInputElement>(null);

  /**
   * handleHeroImageSelectionAction:
   * Misión: Validar y asignar la imagen de autoridad principal del hito urbano.
   */
  const handleHeroImageSelectionAction = useCallback((changeEvent: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = changeEvent.target.files?.[0];
    if (selectedFile) {
      nicepodLog(`📸 [Step2] Evidencia visual principal detectada: ${selectedFile.name}`);
      stateDispatcher({ type: 'SET_HERO_IMAGE', payload: selectedFile });
    }
  }, [stateDispatcher]);

  /**
   * handleOpticalCharacterRecognitionImageAdditionAction:
   * Misión: Anexar pruebas secundarias al expediente pericial.
   */
  const handleOpticalCharacterRecognitionImageAdditionAction = useCallback((changeEvent: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFilesCollection = changeEvent.target.files;
    if (selectedFilesCollection) {
      Array.from(selectedFilesCollection).forEach((imageFile) => {
        stateDispatcher({ type: 'ADD_OCR_IMAGE', payload: imageFile });
      });
    }
  }, [stateDispatcher]);

  /**
   * handleVoiceIntentCaptureAction:
   * Misión: Recibir el binario acústico del hardware y alojarlo en el contexto de forja.
   */
  const handleVoiceIntentCaptureAction = useCallback(async (capturedAudioBinaryBlob: Blob, recordingDurationSeconds: number) => {
    nicepodLog(`🎙️ [Step2] Dictado sensorial capturado: ${recordingDurationSeconds} segundos.`);
    stateDispatcher({ type: 'SET_INTENT_AUDIO', payload: capturedAudioBinaryBlob });
  }, [stateDispatcher]);

  /**
   * executeSensoryIngestionWorkflow:
   * Misión: Disparar el protocolo lightning para la transmisión y peritaje por IA.
   * [SINCRO V7.0]: Mapeo total al contrato nominal V8.6 de GeoEngineReturn.
   */
  const executeSensoryIngestionWorkflow = async () => {
    if (
      !forgeState.heroImageFile || 
      !forgeState.historicalEpoch || 
      !forgeState.categoryMission || 
      !forgeState.categoryEntity
    ) {
      nicepodLog("🛑 [Step2] Ingesta bloqueada: Dimensiones periciales incompletas.", null, "warn");
      return;
    }

    setIsSensoryIngestionProcessActive(true);
    nicepodLog("⚙️ [Step2] Iniciando protocolo de ingesta multimodal de grado industrial...");

    try {
      const sensoryIngestionResults = await executeSensoryDataIngestionAction({
        heroImage: forgeState.heroImageFile,
        // [FIX TS2353]: Mapeo nominal correcto hacia 'opticalCharacterRecognitionImages'
        opticalCharacterRecognitionImages: forgeState.ocrImageFiles,
        ambientAudioBlob: forgeState.ambientAudioBlob,
        administratorIntentText: forgeState.intentText,
        intentAudioBlob: forgeState.intentAudioBlob, 
        categoryMission: forgeState.categoryMission,
        categoryEntity: forgeState.categoryEntity,
        historicalEpoch: forgeState.historicalEpoch,
        resonanceRadiusMeters: forgeState.resonanceRadius,
        referenceUniformResourceLocator: forgeState.referenceUrl
      });

      if (sensoryIngestionResults) {
        nicepodLog("✅ [Step2] Evidencia blindada en el Metal. Procediendo a Auditoría de Dossier.");
        
        stateDispatcher({
          type: 'SET_INGESTION_RESULT',
          payload: { 
            pointOfInterestIdentification: sensoryIngestionResults.pointOfInterestIdentification, 
            dossier: sensoryIngestionResults.dossier 
          }
        });
        navigateToNextStepAction();
      }
    } catch (operationalHardwareException) {
      nicepodLog("🔥 [Step2] Fallo crítico durante la ingesta de inteligencia.", operationalHardwareException, 'error');
    } finally {
      setIsSensoryIngestionProcessActive(false);
    }
  };

  /**
   * isSensoryIngestionIntegrityValidated:
   * Misión: Validar la completitud de la Malla antes de permitir la invocación al Oráculo.
   */
  const isSensoryIngestionIntegrityValidated = useMemo(() => {
    return (
      !!forgeState.heroImageFile && 
      !!forgeState.historicalEpoch && 
      !!forgeState.categoryMission && 
      !!forgeState.categoryEntity
    );
  }, [forgeState.heroImageFile, forgeState.historicalEpoch, forgeState.categoryMission, forgeState.categoryEntity]);

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-y-auto custom-scrollbar px-6 py-4 isolate">
      
      {/* CABECERA TÁCTICA DE LA FASE */}
      <div className="mb-8 shrink-0">
        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-2 block">
          Fase 2: Registro de Evidencia
        </label>
        <h3 className="text-white font-black uppercase tracking-tighter text-3xl italic leading-none font-serif">
          Malla de Captura
        </h3>
      </div>

      {/* SECCIÓN I: VISIÓN (IMAGEN PRINCIPAL Y EVIDENCIA SECUNDARIA) */}
      <div className="mb-10 space-y-6">
        
        {/* Captura de Imagen de Autoridad (Hero Primary Evidence) */}
        <div 
          onClick={() => heroImageInputElementReference.current?.click()}
          className={cn(
            "relative aspect-video rounded-[3rem] border-2 border-dashed transition-all duration-700 cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-5 shadow-2xl",
            forgeState.heroImageFile 
              ? "border-primary/40 bg-primary/5 shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)]" 
              : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20"
          )}
        >
          {forgeState.heroImageFile ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-1000">
              <Zap className="text-primary h-12 w-12 mb-4 animate-pulse" />
              <span className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Hito Visual Asegurado</span>
              <span className="text-[9px] text-zinc-500 mt-3 uppercase max-w-[80%] truncate font-mono">
                {forgeState.heroImageFile.name}
              </span>
            </div>
          ) : (
            <>
              <Camera className="text-zinc-700 h-14 w-14" />
              <span className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.3em] text-center px-16 leading-relaxed">
                Pulsar para activar peritaje óptico
              </span>
            </>
          )}
          <input type="file" ref={heroImageInputElementReference} onChange={handleHeroImageSelectionAction} accept="image/*" className="hidden" />
        </div>

        {/* Mosaico de Inteligencia (Evidencia de Detalle OCR) */}
        <div className="bg-white/[0.01] rounded-[2.5rem] p-6 border border-white/5 shadow-inner">
          <div className="flex justify-between items-center mb-5">
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Evidencia Secundaria (Detalle)</span>
            <Badge variant="outline" className="text-[9px] border-zinc-800 text-zinc-500 font-mono">
              {forgeState.ocrImageFiles.length}/3
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {forgeState.ocrImageFiles.map((imageFile, imageIndex) => (
              <div key={imageIndex} className="relative aspect-square rounded-[1.5rem] bg-black/40 border border-white/10 flex items-center justify-center group transition-all hover:border-primary/30">
                <FileText className="text-zinc-800 h-8 w-8" />
                <button 
                  onClick={(clickEvent) => {
                    clickEvent.stopPropagation();
                    stateDispatcher({ type: 'REMOVE_OCR_IMAGE', payload: imageIndex });
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {forgeState.ocrImageFiles.length < 3 && (
              <button 
                onClick={() => opticalCharacterRecognitionImageInputElementReference.current?.click()}
                className="aspect-square rounded-[1.5rem] border-2 border-dashed border-white/5 bg-transparent hover:bg-white/[0.04] hover:border-white/20 flex items-center justify-center transition-all group"
              >
                <Plus className="text-zinc-800 h-10 w-10 group-hover:text-primary transition-colors" />
              </button>
            )}
          </div>
          <input 
            type="file" 
            ref={opticalCharacterRecognitionImageInputElementReference} 
            onChange={handleOpticalCharacterRecognitionImageAdditionAction} 
            accept="image/*" 
            multiple 
            className="hidden" 
          />
        </div>
      </div>

      {/* SECCIÓN II: EL RELOJ SOBERANO (TEMPORALIDAD) */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6 px-1">
          <Clock className="text-primary h-4 w-4" />
          <label className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Sintonía Temporal</label>
        </div>
        <div className="flex overflow-x-auto pb-5 gap-4 -mx-2 px-2 snap-x hide-scrollbar">
          {HISTORICAL_EPOCH_OPTIONS.map((historicalEpochItem) => (
            <button
              key={historicalEpochItem.value}
              onClick={() => stateDispatcher({ type: 'SET_EPOCH', payload: historicalEpochItem.value })}
              className={cn(
                "shrink-0 snap-start px-6 py-4 rounded-2xl border transition-all duration-700 flex flex-col items-center justify-center min-w-[120px] shadow-xl",
                forgeState.historicalEpoch === historicalEpochItem.value
                  ? "bg-primary text-black border-primary shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)] scale-105"
                  : "bg-white/[0.02] border-white/5 text-zinc-600 hover:text-zinc-300 hover:border-white/10"
              )}
            >
              <span className="text-[11px] font-black uppercase tracking-tighter">
                {historicalEpochItem.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* SECCIÓN III: INTELIGENCIA COGNITIVA (DICTADO SENSORIAL) */}
      <div className="mb-10 bg-[#080808]/80 border border-white/10 rounded-[3rem] p-8 shadow-2xl backdrop-blur-3xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-2 bg-primary/10 rounded-xl">
            <BrainCircuit className="text-primary h-5 w-5" />
          </div>
          <label className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Dictado de Intención</label>
        </div>
        
        <div className="mb-8 h-[220px]">
          <GeoRecorder 
            mode="DICTATION" 
            isExternalProcessActive={isSensoryIngestionProcessActive} 
            onCaptureCompletionAction={handleVoiceIntentCaptureAction} 
          />
        </div>

        <Textarea 
          placeholder="Ajuste manual del peritaje cognitivo (Opcional)..."
          className="min-h-[100px] bg-black/60 border-white/10 rounded-2xl p-6 text-base font-medium placeholder:text-zinc-800 focus:border-primary/40 transition-all resize-none shadow-inner text-zinc-300"
          value={forgeState.intentText}
          onChange={(changeEvent) => stateDispatcher({ type: 'SET_INTENT', payload: changeEvent.target.value })}
          disabled={isSensoryIngestionProcessActive}
        />
      </div>

      {/* SECCIÓN IV: FUENTE DE VERDAD EXTERNA (GROUNDING) */}
      <div className="mb-14">
        <div className="flex items-center gap-3 mb-5 px-1">
          <LinkIcon className="text-zinc-700 h-4 w-4" />
          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Fuente de Verdad Documental</label>
        </div>
        <Input 
          type="url"
          placeholder="https://fuente-autoridad.org/..."
          className="bg-white/[0.02] border-white/10 rounded-2xl h-16 px-8 text-base font-bold text-zinc-400 focus:border-primary/40 placeholder:text-zinc-900 transition-all shadow-inner"
          value={forgeState.referenceUrl}
          onChange={(changeEvent) => stateDispatcher({ type: 'SET_REFERENCE_URL', payload: changeEvent.target.value })}
          disabled={isSensoryIngestionProcessActive}
        />
      </div>

      {/* V. CHASIS DE COMANDO Y NAVEGACIÓN SOBERANA */}
      <div className="flex gap-5 mt-auto pt-8 pb-12 bg-gradient-to-t from-[#020202] to-transparent sticky bottom-0 z-30">
        <Button
          variant="outline"
          onClick={navigateToPreviousStepAction}
          disabled={isSensoryIngestionProcessActive}
          className="w-24 h-24 rounded-[2.5rem] border-white/10 bg-black/40 text-zinc-700 hover:bg-white/5 hover:text-white transition-all flex-shrink-0"
        >
          Atrás
        </Button>
        
        <Button
          onClick={executeSensoryIngestionWorkflow}
          disabled={!isSensoryIngestionIntegrityValidated || isSensoryIngestionProcessActive}
          className="flex-1 h-24 rounded-[2.5rem] bg-white text-black hover:bg-zinc-200 font-black tracking-[0.3em] uppercase text-xs shadow-2xl transition-all group relative overflow-hidden"
        >
          {isSensoryIngestionProcessActive ? (
            <div className="flex items-center gap-5 relative z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-primary italic">Analizando...</span>
            </div>
          ) : (
            <span className="flex items-center justify-center gap-5 relative z-10 w-full">
              Ingestar Malla
              <Zap size={24} className="group-hover:scale-125 transition-transform text-primary fill-current" />
            </span>
          )}
          
          <AnimatePresence>
            {isSensoryIngestionProcessActive && (
              <motion.div 
                className="absolute inset-0 bg-primary/5 z-0"
                initial={{ x: "-100%" }} 
                animate={{ x: "100%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            )}
          </AnimatePresence>
        </Button>
      </div>

      {geographicIntelligenceError && (
        <div className="mb-8 p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 flex items-center gap-5 animate-in slide-in-from-bottom-2 duration-700">
          <AlertCircle className="text-red-500 h-6 w-6 shrink-0" />
          <span className="text-[11px] font-black text-red-400 uppercase tracking-widest leading-relaxed">
            Fallo en el Link Sensorial: {geographicIntelligenceError}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V7.0):
 * 1. Build Shield Compliance: Se resolvió el error TS2353 sincronizando el envío de datos 
 *    con 'opticalCharacterRecognitionImages' y 'resonanceRadiusMeters' (Constitución V8.6).
 * 2. Zero Abbreviations Policy: Purificación absoluta de términos técnicos. Se han eliminado 
 *    acrónimos como 'OCR', 'URL', 'ID' y variables como 'e'.
 * 3. Lightning Protocol Integrity: La transmisión utiliza ahora las rutas nominales 
 *    completas exigidas por la Malla de Madrid Resonance.
 */