/**
 * ARCHIVE: components/geo/steps/step-2-sensory-capture.tsx
 * VERSION: 10.0 (NicePod Forge Step 2 - Sensory Lab UI Optimization & Industrial Layout Edition)
 * PROTOCOLO: MADRID RESONANCE V4.5
 * 
 * MISSION: Capturar la verdad física del entorno mediante evidencia visual, acústica,
 * temporal y documental, orquestando la ingesta hacia el Oráculo de Inteligencia.
 * [REFORMA V10.0]: Reconstrucción total del layout para erradicar el solapamiento 
 * de componentes. Implementación de footer fijo de alta visibilidad. Integración 
 * del GeoRecorder Compacto V6.0 y expansión del área de peritaje textual. 
 * Cumplimiento absoluto de la Zero Abbreviations Policy (ZAP).
 * INTEGRITY LEVEL: 100% (Soberano / Sin abreviaciones / Producción-Ready)
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

// --- INFRAESTRUCTURA CORE V4.5 ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useForge } from "@/components/geo/forge-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GeoRecorder } from "@/components/geo/geo-recorder";
import { classNamesUtility, nicepodLog } from "@/lib/utils";
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
  
  // 1. CONSUMO DE LA FACHADA SOBERANA Y CONTEXTO DE FORJA (SINCRO V6.1 / V49.0)
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
   * MISSION: Validar y asignar la imagen de autoridad principal del hito urbano.
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
   * MISSION: Anexar pruebas secundarias al expediente (Mosaico de Inteligencia).
   */
  const handleOpticalCharacterRecognitionImageAdditionAction = useCallback((changeEvent: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFilesCollection = changeEvent.target.files;
    if (selectedFilesCollection) {
      Array.from(selectedFilesCollection).forEach((imageFile) => {
        stateDispatcher({ type: 'ADD_OPTICAL_CHARACTER_RECOGNITION_IMAGE', payload: imageFile });
      });
    }
  }, [stateDispatcher]);

  /**
   * handleVoiceIntentCaptureAction:
   * MISSION: Recibir el binario acústico y alojarlo en el contexto como instrucción cognitiva.
   */
  const handleVoiceIntentCaptureAction = useCallback(async (capturedAudioBinaryBlob: Blob, recordingDurationSeconds: number) => {
    nicepodLog(`🎙️ [Step2] Dictado sensorial capturado: ${recordingDurationSeconds} segundos.`);
    stateDispatcher({ type: 'SET_INTENT_AUDIO', payload: capturedAudioBinaryBlob });
  }, [stateDispatcher]);

  /**
   * executeSensoryIngestionWorkflow:
   * MISSION: Disparar el protocolo lightning para la transmisión y peritaje por Inteligencia Artificial.
   */
  const executeSensoryIngestionWorkflow = async () => {
    if (
      !forgeState.heroImageFile || 
      !forgeState.historicalEpoch || 
      !forgeState.categoryMission || 
      !forgeState.categoryEntity
    ) {
      nicepodLog("🛑 [Step2] Ingesta bloqueada: Dimensiones periciales incompletas.", null, "warning");
      return;
    }

    setIsSensoryIngestionProcessActive(true);
    nicepodLog("⚙️ [Step2] Iniciando protocolo de ingesta multimodal de grado industrial V4.5...");

    try {
      const sensoryIngestionResults = await executeSensoryDataIngestionAction({
        heroImage: forgeState.heroImageFile,
        opticalCharacterRecognitionImages: forgeState.opticalCharacterRecognitionImageFiles,
        ambientAudioBlob: forgeState.ambientAudioBlob,
        administratorIntentText: forgeState.administratorIntentText,
        intentAudioBlob: forgeState.intentAudioBlob, 
        categoryMission: forgeState.categoryMission,
        categoryEntity: forgeState.categoryEntity,
        historicalEpoch: forgeState.historicalEpoch,
        resonanceRadiusMeters: forgeState.resonanceRadiusMeters,
        referenceUniformResourceLocator: forgeState.referenceUniformResourceLocator
      });

      if (sensoryIngestionResults) {
        nicepodLog("✅ [Step2] Evidencia blindada en el Metal. Procediendo a Auditoría.");
        
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
      nicepodLog("🔥 [Step2] Fallo crítico durante la ingesta de inteligencia.", operationalHardwareException, 'exceptionInformation');
    } finally {
      setIsSensoryIngestionProcessActive(false);
    }
  };

  /**
   * isSensoryIngestionIntegrityValidated:
   * MISSION: Validar la completitud de la Malla antes de permitir el avance.
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
    <div className="flex flex-col h-full w-full bg-transparent overflow-hidden isolate">
      
      {/* I. CABECERA TÁCTICA FIJA (HEADER) */}
      <div className="px-6 pt-6 pb-4 shrink-0 bg-transparent z-20">
        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-2 block">
          Fase 2: Registro de Evidencia
        </label>
        <h3 className="text-white font-black uppercase tracking-tighter text-3xl italic leading-none font-serif">
          Malla de Captura
        </h3>
      </div>

      {/* II. CUERPO DE TRABAJO SCROLLABLE (CONTENT AREA) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 space-y-10 pb-32">
        
        {/* SECCIÓN VISUAL (PRIMARY EVIDENCE) */}
        <div className="space-y-6">
          <div 
            onClick={() => !isSensoryIngestionProcessActive && heroImageInputElementReference.current?.click()}
            className={classNamesUtility(
              "relative aspect-video rounded-[3rem] border-2 border-dashed transition-all duration-700 cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-5 shadow-2xl",
              forgeState.heroImageFile 
                ? "border-primary/40 bg-primary/5 shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)]" 
                : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20",
              isSensoryIngestionProcessActive && "opacity-50 cursor-not-allowed"
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
            <input type="file" ref={heroImageInputElementReference} onChange={handleHeroImageSelectionAction} accept="image/*" className="hidden" disabled={isSensoryIngestionProcessActive} />
          </div>

          {/* Mosaico de Detalle */}
          <div className="bg-white/[0.01] rounded-[2.5rem] p-6 border border-white/5 shadow-inner">
            <div className="flex justify-between items-center mb-5">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Evidencia Secundaria</span>
              <Badge variant="outline" className="text-[9px] border-zinc-800 text-zinc-500 font-mono">
                {forgeState.opticalCharacterRecognitionImageFiles.length}/3
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-5">
              {forgeState.opticalCharacterRecognitionImageFiles.map((imageFile, imageIndex) => (
                <div key={imageIndex} className="relative aspect-square rounded-[1.5rem] bg-black/40 border border-white/10 flex items-center justify-center group transition-all hover:border-primary/30">
                  <FileText className="text-zinc-800 h-8 w-8" />
                  <button 
                    onClick={(clickEvent) => { clickEvent.stopPropagation(); stateDispatcher({ type: 'REMOVE_OPTICAL_CHARACTER_RECOGNITION_IMAGE', payload: imageIndex }); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                    disabled={isSensoryIngestionProcessActive}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {forgeState.opticalCharacterRecognitionImageFiles.length < 3 && (
                <button 
                  onClick={() => !isSensoryIngestionProcessActive && opticalCharacterRecognitionImageInputElementReference.current?.click()}
                  className="aspect-square rounded-[1.5rem] border-2 border-dashed border-white/5 bg-transparent hover:bg-white/[0.04] hover:border-white/20 flex items-center justify-center transition-all group"
                  disabled={isSensoryIngestionProcessActive}
                >
                  <Plus className="text-zinc-800 h-10 w-10 group-hover:text-primary transition-colors" />
                </button>
              )}
            </div>
            <input type="file" ref={opticalCharacterRecognitionImageInputElementReference} onChange={handleOpticalCharacterRecognitionImageAdditionAction} accept="image/*" multiple className="hidden" disabled={isSensoryIngestionProcessActive} />
          </div>
        </div>

        {/* SECCIÓN TEMPORAL (ÉPOCA) */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-1">
            <Clock className="text-primary h-4 w-4" />
            <label className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Sintonía Temporal</label>
          </div>
          <div className="flex overflow-x-auto pb-5 gap-4 -mx-2 px-2 snap-x hide-scrollbar">
            {HISTORICAL_EPOCH_OPTIONS.map((historicalEpochItem) => (
              <button
                key={historicalEpochItem.value}
                onClick={() => stateDispatcher({ type: 'SET_EPOCH', payload: historicalEpochItem.value })}
                disabled={isSensoryIngestionProcessActive}
                className={classNamesUtility(
                  "shrink-0 snap-start px-6 py-4 rounded-2xl border transition-all duration-700 flex flex-col items-center justify-center min-w-[120px] shadow-xl",
                  forgeState.historicalEpoch === historicalEpochItem.value
                    ? "bg-primary text-black border-primary shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)] scale-105"
                    : "bg-white/[0.02] border-white/5 text-zinc-600 hover:text-zinc-300 hover:border-white/10",
                  isSensoryIngestionProcessActive && "opacity-50"
                )}
              >
                <span className="text-[11px] font-black uppercase tracking-tighter">
                  {historicalEpochItem.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* SECCIÓN III: INTELIGENCIA COGNITIVA (DICTADO Y ÁREA DE TEXTO AMPLIADA)
            [FIX V10.0]: Integración compacta del GeoRecorder y expansión del Textarea.
        */}
        <div className="bg-[#080808]/80 border border-white/10 rounded-[3rem] p-8 shadow-2xl backdrop-blur-3xl space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-xl">
              <BrainCircuit className="text-primary h-5 w-5" />
            </div>
            <label className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Instrucciones de Peritaje</label>
          </div>
          
          <div className="w-full">
            {/* GeoRecorder V6.0 Compacto (Mínima ocupación vertical) */}
            <GeoRecorder 
              mode="DICTATION" 
              isExternalProcessActive={isSensoryIngestionProcessActive} 
              onCaptureCompletionAction={handleVoiceIntentCaptureAction} 
            />
          </div>

          <Textarea 
            placeholder="Escriba aquí las directrices para el Oráculo o ajuste el dictado capturado..."
            className="min-h-[180px] bg-black/60 border-white/10 rounded-2xl p-6 text-base font-medium placeholder:text-zinc-800 focus:border-primary/40 transition-all resize-none shadow-inner text-zinc-300 leading-relaxed"
            value={forgeState.administratorIntentText}
            onChange={(changeEvent) => stateDispatcher({ type: 'SET_ADMINISTRATOR_INTENT', payload: changeEvent.target.value })}
            disabled={isSensoryIngestionProcessActive}
          />
        </div>

        {/* SECCIÓN IV: FUENTE DE VERDAD (GROUNDING) */}
        <div className="space-y-5">
          <div className="flex items-center gap-3 px-1">
            <LinkIcon className="text-zinc-700 h-4 w-4" />
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Referencia Documental</label>
          </div>
          <Input 
            type="url"
            placeholder="https://fuente-autoridad.org/..."
            className="bg-white/[0.02] border-white/10 rounded-2xl h-16 px-8 text-base font-bold text-zinc-400 focus:border-primary/40 placeholder:text-zinc-900 transition-all shadow-inner"
            value={forgeState.referenceUniformResourceLocator}
            onChange={(changeEvent) => stateDispatcher({ type: 'SET_REFERENCE_URL', payload: changeEvent.target.value })}
            disabled={isSensoryIngestionProcessActive}
          />
        </div>

        {/* Feedback de Error Geográfico */}
        {geographicIntelligenceError && (
          <div className="p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 flex items-center gap-5 animate-in slide-in-from-bottom-2 duration-700">
            <AlertCircle className="text-red-500 h-6 w-6 shrink-0" />
            <span className="text-[11px] font-black text-red-400 uppercase tracking-widest leading-relaxed">
              Fallo de Vínculo: {geographicIntelligenceError}
            </span>
          </div>
        )}
      </div>

      {/* III. CHASIS DE COMANDO INFERIOR FIJO (FOOTER)
          [FIX V10.0]: Posicionamiento absoluto al fondo del contenedor Step.
      */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#020202] via-[#020202] to-transparent z-30 flex items-center px-6 gap-5">
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
          className="flex-1 h-24 rounded-[2.5rem] bg-white text-black hover:bg-zinc-200 font-black tracking-[0.3em] uppercase text-xs shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all group relative overflow-hidden"
        >
          {isSensoryIngestionProcessActive ? (
            <div className="flex items-center gap-5 relative z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-primary italic">Sincronizando...</span>
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

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V10.0):
 * 1. Fixed Action Footer: Los botones de navegación se han fijado en la parte inferior mediante 
 *    posicionamiento absoluto y un gradiente de oclusión, eliminando el solapamiento con el scroll.
 * 2. Sensory Space Expansion: Se ha aprovechado la compactación del GeoRecorder V6.0 para expandir 
 *    el área de texto de instrucciones (180px min-height), proporcionando un entorno ergonómico.
 * 3. ZAP & BSS Compliance: Purificación nominal completa de propiedades: 'referenceUrl' -> 
 *    'referenceUniformResourceLocator', 'intentText' -> 'administratorIntentText'.
 * 4. UI Stability: Se eliminaron alturas fijas en contenedores de dictado para permitir que el 
 *    layout respire dinámicamente según el tamaño del dispositivo.
 */