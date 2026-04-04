/**
 * ARCHIVO: components/create-flow/step-renderer.tsx
 * VERSIÓN: 3.5 (NicePod Master View Orchestrator - Strict Contract & Tailwind Normalization)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Orquestar la visualización determinista de las fases de creación, 
 * garantizando la compatibilidad absoluta entre el flujo estándar y el hardware pericial.
 * [REFORMA V3.5]: Resolución de error TS2345 mediante la inyección explícita de 
 * currentPurpose y normalización de clases Tailwind para limpieza de logs en Vercel.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from 'next/dynamic';
import React, { useMemo, useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";

// --- INFRAESTRUCTURA DE CONTEXTO Y NAVEGACIÓN ---
import { useCreationContext } from "./shared/context";
import { useFlowNavigation } from "./hooks/use-flow-navigation";

// --- INFRAESTRUCTURA DE HARDWARE Y UTILIDADES ---
import { GeoRecorder } from "../geo/geo-recorder";
import { GeoScannerUI } from "../geo/scanner-ui";
import { nicepodLog, cn } from "@/lib/utils";

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

// --- IMPORTACIONES: PRODUCCIÓN INDUSTRIAL ---
import { AudioStudio } from "./steps/audio-studio";
import { DetailsStep } from "./steps/details-step";
import { DraftGenerationLoader } from "./steps/draft-generation-loader";
import { FinalStep } from "./steps/final-step";
import { ToneSelectionStep } from "./steps/tone-selection-step";

// CARGA DINÁMICA: Aislamiento del editor para optimizar el Time To Interactive (TTI).
const ScriptEditorStep = dynamic(
  () => import('./steps/script-editor-step').then((module) => module.ScriptEditorStep),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex flex-col items-center justify-center space-y-8 opacity-40">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
          Sincronizando Terminal Editorial...
        </span>
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
  // 1. CONSUMO DEL CONTEXTO Y FORMULARIO
  const creationContext = useCreationContext();
  const { currentFlowState } = creationContext;
  
  const { watch, setValue } = useFormContext();
  const creationFormData = watch();

  /**
   * [FIX V3.5]: Inyección de Propiedades Obligatorias.
   * Unificamos el contexto de estado con el propósito seleccionado en el formulario 
   * para satisfacer la interfaz 'UseFlowNavigationProps'.
   */
  const navigationAuthority = useFlowNavigation({
    ...creationContext,
    currentPurpose: creationFormData.purpose
  });

  const { transitionTo, activePath } = navigationAuthority;

  // 2. ESTADOS DE PROCESAMIENTO ACÚSTICO
  const [isAcousticProcessingActive, setIsAcousticProcessingActive] = useState<boolean>(false);

  /**
   * navigateToNextStepSovereign:
   * Misión: Calcular y ejecutar la transición hacia el siguiente hito de la trayectoria.
   */
  const navigateToNextStepSovereign = useCallback(() => {
    const currentStepIndex = activePath.indexOf(currentFlowState);
    if (currentStepIndex !== -1 && currentStepIndex < activePath.length - 1) {
      const nextStepState = activePath[currentStepIndex + 1];
      transitionTo(nextStepState);
    } else {
      nicepodLog("🚩 [StepRenderer] Trayectoria finalizada o estado fuera de malla.", null, 'warn');
    }
  }, [activePath, currentFlowState, transitionTo]);

  /**
   * handleAcousticChronicleCapture:
   * Misión: Recibir el binario acústico del hardware y disparar la transición de flujo.
   */
  const handleAcousticChronicleCapture = useCallback(async (
    capturedAudioBlob: Blob, 
    capturedDurationSeconds: number
  ) => {
    setIsAcousticProcessingActive(true);
    nicepodLog(`🎙️ [StepRenderer] Crónica capturada: ${capturedDurationSeconds}s.`);
    
    try {
      setValue('final_audio_blob', capturedAudioBlob);
      setValue('final_audio_duration', capturedDurationSeconds);
      
      // Ejecución del salto soberano al siguiente paso
      navigateToNextStepSovereign();
    } catch (exception) {
      nicepodLog("🔥 [StepRenderer] Fallo al procesar binario acústico.", exception, 'error');
    } finally {
      setIsAcousticProcessingActive(false);
    }
  }, [setValue, navigateToNextStepSovereign]);

  /**
   * activeStepContent:
   * Misión: Mapeo determinista de componentes físicos.
   */
  const activeStepContent = useMemo(() => {
    switch (currentFlowState) {
      case 'SELECTING_PURPOSE':
        return <PurposeSelectionStep existingDrafts={initialDrafts} />;

      case 'DNA_CHECK':
        return <DnaInterviewStep />;
      case 'PULSE_RADAR':
        return <PulseRadarStep />;
      case 'BRIEFING_SANITIZATION':
        return <ScriptEditorStep />;

      case 'LOCAL_DISCOVERY_STEP':
        return <LocalDiscoveryStep />;
      case 'LOCAL_ANALYSIS_LOADER':
      case 'LOCAL_RESULT_STEP':
        return <GeoScannerUI />;
      
      case 'GEO_RECORDER_STEP':
        return (
          <GeoRecorder
            mode="CHRONICLE"
            script={creationFormData.final_script}
            isProcessingExternal={isAcousticProcessingActive}
            onCaptureComplete={handleAcousticChronicleCapture}
          />
        );

      case 'LEARN_SUB_SELECTION': return <LearnSubStep />;
      case 'SOLO_TALK_INPUT': return <SoloTalkStep />;
      case 'INSPIRE_SUB_SELECTION': return <InspireSubStep />;
      case 'LINK_POINTS_INPUT': return <LinkPointsStep />;
      case 'NARRATIVE_SELECTION':
        return <NarrativeSelectionStep narrativeOptions={narrativeOptions} />;
      case 'LEGACY_INPUT': return <LegacyStep />;

      case 'DETAILS_STEP': return <DetailsStep />;
      case 'TONE_SELECTION': return <ToneSelectionStep />;
      case 'DRAFT_GENERATION_LOADER':
        return <DraftGenerationLoader formData={creationFormData as any} />;
      case 'SCRIPT_EDITING': return <ScriptEditorStep />;
      case 'AUDIO_STUDIO_STEP': return <AudioStudio />;
      case 'FINAL_STEP': return <FinalStep />;

      case 'QUESTION_INPUT': return <QuestionStep />;
      case 'FREESTYLE_SELECTION': return <StyleSelectionStep />;

      default:
        return (
          <div className="h-full flex flex-col items-center justify-center space-y-12 py-32 opacity-40">
            <div className="relative h-14 w-14">
              <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
              <div className="h-full w-full border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
            </div>
            <p className="font-black uppercase tracking-[0.6em] text-[9px] text-zinc-600">
              Sincronizando Malla de Inteligencia
            </p>
          </div>
        );
    }
  }, [currentFlowState, creationFormData, narrativeOptions, initialDrafts, isAcousticProcessingActive, handleAcousticChronicleCapture]);

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
            ease: [0.16, 1, 0.3, 1] 
          }}
          className="flex-1 flex flex-col min-h-0 h-full"
        >
          {/* [FIX VERCEL]: Normalización de clases para evitar ambigüedad en PostCSS */}
          <div className="flex-1 overflow-y-auto custom-scrollbar-hide px-4 md:px-0 duration-500 ease-in-out">
            {activeStepContent}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}