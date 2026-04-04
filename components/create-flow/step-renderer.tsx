/**
 * ARCHIVO: components/create-flow/step-renderer.tsx
 * VERSIÓN: 3.1 (NicePod Master View Orchestrator - Universal Recorder Integration)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Orquestar la visualización determinista de los pasos de creación, 
 * garantizando la compatibilidad entre flujos estándar y el hardware pericial.
 * [REFORMA V3.1]: Adaptación de GeoRecorder V3.0 mediante el patrón de captura 
 * polimórfica y eliminación de errores de contrato (draftId).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from 'next/dynamic';
import React, { useMemo, useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useCreationContext } from "./shared/context";

// --- INFRAESTRUCTURA DE HARDWARE Y MALLA ---
import { GeoRecorder } from "../geo/geo-recorder";
import { GeoScannerUI } from "../geo/scanner-ui";
import { nicepodLog } from "@/lib/utils";

// --- IMPORTACIONES DE PASOS: NÚCLEO ---
import { PurposeSelectionStep } from "./steps/purpose-selection-step";
import { DnaInterviewStep } from "./steps/dna-interview-step";
import { PulseRadarStep } from "./steps/pulse-radar-step";
import { LocalDiscoveryStep } from "./steps/local-discovery-step";

// --- IMPORTACIONES: FLUJOS NARRATIVOS ---
import { InspireSubStep } from "./steps/inspire-sub-step";
import { LearnSubStep } from "./steps/learn-sub-step";
import { LegacyStep } from "./steps/legacy-step";
import { LinkPointsStep } from "./steps/link-points";
import { NarrativeSelectionStep } from "./steps/narrative-selection-step";
import { QuestionStep } from "./steps/question-step";
import { SoloTalkStep } from "./steps/solo-talk-step";
import { StyleSelectionStep } from "./steps/style-selection";

// --- IMPORTACIONES: PRODUCCIÓN ---
import { AudioStudio } from "./steps/audio-studio";
import { DetailsStep } from "./steps/details-step";
import { DraftGenerationLoader } from "./steps/draft-generation-loader";
import { FinalStep } from "./steps/final-step";
import { ToneSelectionStep } from "./steps/tone-selection-step";

// CARGA DINÁMICA: Aislamiento de carga para el Editor de Guiones
const ScriptEditorStep = dynamic(
  () => import('./steps/script-editor-step').then((module) => module.ScriptEditorStep),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex flex-col items-center justify-center space-y-6 opacity-50">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Sincronizando Terminal Editorial...</span>
      </div>
    )
  }
);

interface StepRendererProps {
  narrativeOptions: any[];
  initialDrafts: any[];
}

/**
 * StepRenderer: El Reactor de Vistas Maestro de NicePod.
 */
export function StepRenderer({ narrativeOptions, initialDrafts }: StepRendererProps) {
  const { currentFlowState, nextStep } = useCreationContext();
  const { watch, setValue } = useFormContext();

  // 1. MONITORIZACIÓN DE DATOS PERSISTENTES
  const formData = watch();
  const [isProcessingAudio, setIsProcessingAudio] = useState<boolean>(false);

  /**
   * handleChronicleCapture:
   * Misión: Recibir el binario acústico desde el hardware y prepararlo para la 
   * persistencia en el flujo de creación.
   */
  const handleChronicleCapture = useCallback(async (audioBlob: Blob, durationSeconds: number) => {
    setIsProcessingAudio(true);
    nicepodLog(`🎙️ [StepRenderer] Crónica capturada: ${durationSeconds} segundos.`);
    
    try {
      // Almacenamos el blob en el estado del formulario para su posterior publicación
      setValue('final_audio_blob', audioBlob);
      setValue('final_audio_duration', durationSeconds);
      
      // En este flujo, el éxito de la captura permite avanzar al cierre
      nextStep();
    } catch (error) {
      nicepodLog("🔥 [StepRenderer] Fallo al procesar binario acústico.", error, 'error');
    } finally {
      setIsProcessingAudio(false);
    }
  }, [setValue, nextStep]);

  /**
   * activeStepContent:
   * Misión: Mapeo determinista entre el estado de la FlowState Machine y el componente físico.
   */
  const activeStepContent = useMemo(() => {
    switch (currentFlowState) {
      // --- FASE 1: INTENCIONALIDAD ---
      case 'SELECTING_PURPOSE':
        return <PurposeSelectionStep existingDrafts={initialDrafts} />;

      // --- RUTA: PULSE (INTELIGENCIA Y ACTUALIDAD) ---
      case 'DNA_CHECK':
        return <DnaInterviewStep />;
      case 'PULSE_RADAR':
        return <PulseRadarStep />;
      case 'BRIEFING_SANITIZATION':
        return <ScriptEditorStep />;

      // --- RUTA: LOCAL SOUL (MADRID RESONANCE) ---
      case 'LOCAL_DISCOVERY_STEP':
        return <LocalDiscoveryStep />;
      case 'LOCAL_ANALYSIS_LOADER':
      case 'LOCAL_RESULT_STEP':
        return <GeoScannerUI />;
      
      case 'GEO_RECORDER_STEP':
        /**
         * [INTEGRACIÓN V3.1]: Uso del GeoRecorder Universal.
         * Se elimina la dependencia de draftId y se pasa al modo CHRONICLE.
         */
        return (
          <GeoRecorder
            mode="CHRONICLE"
            script={formData.final_script}
            isProcessingExternal={isProcessingAudio}
            onCaptureComplete={handleChronicleCapture}
          />
        );

      // --- RUTAS NARRATIVAS MULTIDIMENSIONALES ---
      case 'LEARN_SUB_SELECTION': return <LearnSubStep />;
      case 'SOLO_TALK_INPUT': return <SoloTalkStep />;
      case 'INSPIRE_SUB_SELECTION': return <InspireSubStep />;
      case 'LINK_POINTS_INPUT': return <LinkPointsStep />;
      case 'NARRATIVE_SELECTION':
        return <NarrativeSelectionStep narrativeOptions={narrativeOptions} />;
      case 'LEGACY_INPUT': return <LegacyStep />;

      // --- FASES DE PRODUCCIÓN INDUSTRIAL ---
      case 'DETAILS_STEP': return <DetailsStep />;
      case 'TONE_SELECTION': return <ToneSelectionStep />;

      case 'DRAFT_GENERATION_LOADER':
        return <DraftGenerationLoader formData={formData as any} />;

      case 'SCRIPT_EDITING': return <ScriptEditorStep />;
      case 'AUDIO_STUDIO_STEP': return <AudioStudio />;
      case 'FINAL_STEP': return <FinalStep />;

      // --- COMPATIBILIDAD DE LEGADO ---
      case 'QUESTION_INPUT': return <QuestionStep />;
      case 'FREESTYLE_SELECTION': return <StyleSelectionStep />;

      default:
        return (
          <div className="h-full flex flex-col items-center justify-center space-y-8 py-20 opacity-60">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 bg-primary/10 blur-3xl animate-pulse rounded-full" />
              <div className="h-full w-full border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
            <p className="font-black uppercase tracking-[0.5em] text-[9px] text-zinc-500">
              Sincronizando Malla...
            </p>
          </div>
        );
    }
  }, [currentFlowState, formData, narrativeOptions, initialDrafts, isProcessingAudio, handleChronicleCapture]);

  return (
    <div className="relative flex-1 flex flex-col min-h-0 w-full overflow-hidden isolate">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentFlowState}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1] // Industrial Quint Ease-Out
          }}
          className="flex-1 flex flex-col min-h-0 h-full"
        >
          <div className="flex-1 overflow-y-auto custom-scrollbar-hide px-4 md:px-0">
            {activeStepContent}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}