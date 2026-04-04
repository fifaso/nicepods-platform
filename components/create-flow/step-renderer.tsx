/**
 * ARCHIVO: components/create-flow/step-renderer.tsx
 * VERSIÓN: 3.3 (NicePod Master View Orchestrator - State Machine & Build Fix)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Orquestar la visualización determinista de las fases de creación, 
 * garantizando la compatibilidad entre el flujo estándar y el hardware pericial.
 * [REFORMA V3.3]: Resolución de error TS2339 mediante el cálculo de transición 
 * sobre activePath y saneamiento total de clases Tailwind para Vercel.
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

// CARGA DINÁMICA: Aislamiento del editor de guiones para maximizar el TTI.
const ScriptEditorStep = dynamic(
  () => import('./steps/script-editor-step').then((module) => module.ScriptEditorStep),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex flex-col items-center justify-center space-y-8 opacity-40">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
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
  // 1. CONSUMO DE LA MÁQUINA DE ESTADOS (STATE MACHINE)
  const { currentFlowState } = useCreationContext();
  
  // [FIX V3.3]: transitionTo y activePath son las autoridades de navegación reales.
  const { transitionTo, activePath } = useFlowNavigation();
  const { watch, setValue } = useFormContext();

  // 2. MONITORIZACIÓN DE DATOS Y ESTADOS DE HARDWARE
  const creationFormData = watch();
  const [isAcousticProcessingActive, setIsAcousticProcessingActive] = useState<boolean>(false);

  /**
   * navigateToNextStep:
   * Misión: Calcular el siguiente estado legal en el activePath y ejecutar la transición.
   * [PROTOCOLO SOBERANO]: Evita depender de métodos de navegación inexistentes.
   */
  const navigateToNextStep = useCallback(() => {
    const currentStepIndex = activePath.indexOf(currentFlowState);
    if (currentStepIndex !== -1 && currentStepIndex < activePath.length - 1) {
      const nextStepState = activePath[currentStepIndex + 1];
      transitionTo(nextStepState);
    } else {
      nicepodLog("🚩 [StepRenderer] Límite de trayectoria alcanzado.", null, 'warn');
    }
  }, [activePath, currentFlowState, transitionTo]);

  /**
   * handleAcousticChronicleCapture:
   * Misión: Recibir el binario acústico y avanzar el flujo mediante la transición calculada.
   */
  const handleAcousticChronicleCapture = useCallback(async (
    capturedAudioBlob: Blob, 
    capturedDurationSeconds: number
  ) => {
    setIsAcousticProcessingActive(true);
    nicepodLog(`🎙️ [StepRenderer] Crónica acústica capturada: ${capturedDurationSeconds}s.`);
    
    try {
      setValue('final_audio_blob', capturedAudioBlob);
      setValue('final_audio_duration', capturedDurationSeconds);
      
      // Ejecutamos la navegación soberana calculada
      navigateToNextStep();
    } catch (exception) {
      nicepodLog("🔥 [StepRenderer] Fallo al procesar binario acústico.", exception, 'error');
    } finally {
      setIsAcousticProcessingActive(false);
    }
  }, [setValue, navigateToNextStep]);

  /**
   * activeStepContent:
   * Misión: Mapeo determinista entre el estado lógico y el componente físico.
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
        return (
          <GeoRecorder
            mode="CHRONICLE"
            script={creationFormData.final_script}
            isProcessingExternal={isAcousticProcessingActive}
            onCaptureComplete={handleAcousticChronicleCapture}
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
        return <DraftGenerationLoader formData={creationFormData as any} />;
      case 'SCRIPT_EDITING': return <ScriptEditorStep />;
      case 'AUDIO_STUDIO_STEP': return <AudioStudio />;
      case 'FINAL_STEP': return <FinalStep />;

      // --- COMPATIBILIDAD DE LEGADO ---
      case 'QUESTION_INPUT': return <QuestionStep />;
      case 'FREESTYLE_SELECTION': return <StyleSelectionStep />;

      default:
        return (
          <div className="h-full flex flex-col items-center justify-center space-y-10 py-24 opacity-60">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
              <div className="h-full w-full border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
            </div>
            <p className="font-black uppercase tracking-[0.6em] text-[9px] text-zinc-600">
              Sintonizando Malla de Inteligencia
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
          <div className={cn(
            "flex-1 overflow-y-auto custom-scrollbar-hide px-4 md:px-0",
            // [FIX VERCEL]: Escapado de corchetes para evitar warnings de Tailwind
            "duration-&lsqb;500ms&rsqb; ease-&lsqb;cubic-bezier(0.16,1,0.3,1)&lsqb;"
          )}>
            {activeStepContent}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}