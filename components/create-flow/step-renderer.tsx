/**
 * ARCHIVO: components/create-flow/step-renderer.tsx
 * VERSIÓN: 9.0 (NicePod Master View Orchestrator - Industrial FSM Synchronization)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Orquestar la visualización determinista de las fases de creación, garantizando 
 * la compatibilidad absoluta entre la máquina de estados finitos (FSM) y la interfaz.
 * [REFORMA V9.0]: Resolución definitiva de TS2678 y TS2353. Sincronización nominal 
 * absoluta con 'FlowState' V4.0. Eliminación total de 'as any'.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from 'next/dynamic';
import React, { useMemo, useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";

// --- INFRAESTRUCTURA DE CONTEXTO Y NAVEGACIÓN SOBERANA ---
import { useCreationContext } from "./shared/context";
import { useFlowNavigation } from "./hooks/use-flow-navigation";
import { NarrativeOption } from "./shared/types";
import { DraftRow } from "@/actions/draft-actions";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";

// --- INFRAESTRUCTURA DE HARDWARE Y UTILIDADES ---
import { GeoRecorder } from "@/components/geo/geo-recorder";
import { GeographicScannerUserInterface } from "@/components/geo/scanner-ui";
import { nicepodLog } from "@/lib/utils";

// --- IMPORTACIONES DE PASOS: NÚCLEO (CORE STEPS) ---
import { PurposeSelectionStep } from "./steps/purpose-selection-step";
import { DnaInterviewStep } from "./steps/dna-interview-step";
import { PulseRadarStep } from "./steps/pulse-radar-step";
import { LocalDiscoveryStep } from "./steps/local-discovery-step";
import { DiscoveryResultStep } from "./steps/discovery-result-step";

// --- IMPORTACIONES: FLUJOS NARRATIVOS TÁCTICOS ---
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

const ScriptEditorStep = dynamic(
  () => import('./steps/script-editor-step').then((module) => module.ScriptEditorStep),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex flex-col items-center justify-center space-y-12 opacity-30 isolate">
        <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-primary italic">
          Sincronizando Terminal Editorial...
        </span>
      </div>
    )
  }
);

interface StepRendererProperties {
  narrativeOptionsCollection: NarrativeOption[];
  initialDraftsCollection: DraftRow[];
}

export function StepRenderer({ 
  narrativeOptionsCollection, 
  initialDraftsCollection 
}: StepRendererProperties) {
  
  const creationContextReference = useCreationContext();
  const { currentFlowState } = creationContextReference;
  
  const { watch, setValue } = useFormContext<PodcastCreationData>();
  const creationFormDataSnapshot = watch();

  const navigationAuthority = useFlowNavigation({
    currentMissionPurposeIdentification: creationFormDataSnapshot.purpose
  });

  const { 
    transitionToNextStateAction, 
    activePath: activeMasterFlowPathCollection 
  } = navigationAuthority;

  const [isAcousticCaptureProcessActive, setIsAcousticCaptureProcessActive] = useState<boolean>(false);

  const navigateToNextPhaseSovereignAction = useCallback(() => {
    const currentPhaseIndexMagnitude = activeMasterFlowPathCollection.indexOf(currentFlowState);
    if (currentPhaseIndexMagnitude !== -1 && currentPhaseIndexMagnitude < activeMasterFlowPathCollection.length - 1) {
      transitionToNextStateAction(activeMasterFlowPathCollection[currentPhaseIndexMagnitude + 1]);
    }
  }, [activeMasterFlowPathCollection, currentFlowState, transitionToNextStateAction]);

  const handleAcousticChronicleCaptureAction = useCallback(async (
    capturedAudioBinaryBlob: Blob, 
    capturedDurationSecondsMagnitude: number
  ) => {
    setIsAcousticCaptureProcessActive(true);
    try {
      setValue('userEmotionalReactionContent', `Captura Acústica: ${capturedDurationSecondsMagnitude}s`);
      navigateToNextPhaseSovereignAction();
    } catch (operationalHardwareException) {
      nicepodLog("🔥 [StepRenderer] Fallo acústico.", operationalHardwareException, 'error');
    } finally {
      setIsAcousticCaptureProcessActive(false);
    }
  }, [setValue, navigateToNextPhaseSovereignAction]);

  const activeStepComponentMarkup = useMemo(() => {
    switch (currentFlowState) {
      case 'SELECTING_PURPOSE': return <PurposeSelectionStep existingDraftsCollection={initialDraftsCollection} />;
      case 'DEOXYRIBONUCLEIC_ACID_SYNTHTESIS_CHECK': return <DnaInterviewStep />;
      case 'PULSE_RADAR_SCANNER': return <PulseRadarStep />;
      case 'BRIEFING_SANITIZATION_REVIEW': return <ScriptEditorStep />;
      case 'LOCAL_DISCOVERY_STEP': return <LocalDiscoveryStep />;
      case 'LOCAL_ANALYSIS_LOADER': return <DiscoveryResultStep />;
      case 'LOCAL_RESULT_STEP': return <DiscoveryResultStep />;
      case 'GEODETIC_ACUSTIC_RECORDER_STEP':
        return <GeoRecorder mode="CHRONICLE" narrativeScriptContent={creationFormDataSnapshot.finalScriptContent || ""} isExternalProcessActive={isAcousticCaptureProcessActive} onCaptureCompletionAction={handleAcousticChronicleCaptureAction} />;
      case 'LEARN_SUB_CATEGORY_SELECTION': return <LearnSubStep />;
      case 'SOLO_TALK_INPUT_FIELD': return <SoloTalkStep />;
      case 'INSPIRE_SUB_CATEGORY_SELECTION': return <InspireSubStep />;
      case 'LINK_POINTS_INPUT_FORM': return <LinkPointsStep />;
      case 'NARRATIVE_SELECTION_BRANCHING': return <NarrativeSelectionStep narrativeOptionsCollection={narrativeOptionsCollection} />;
      case 'LEGACY_LESSON_INPUT': return <LegacyStep />;
      case 'TECHNICAL_DETAILS_STEP': return <DetailsStep />;
      case 'AGENT_TONE_SELECTION': return <ToneSelectionStep />;
      case 'DRAFT_GENERATION_LOADER': return <DraftGenerationLoader formData={creationFormDataSnapshot} />;
      case 'SCRIPT_EDITING_CANVAS': return <ScriptEditorStep />;
      case 'AUDIO_STUDIO_CALIBRATION': return <AudioStudio />;
      case 'FINAL_MANIFESTO_STEP': return <FinalStep />;
      case 'SPECIFIC_QUESTION_INPUT': return <QuestionStep />;
      case 'FREESTYLE_MODE_SELECTION': return <StyleSelectionStep />;
      default: return null;
    }
  }, [currentFlowState, creationFormDataSnapshot, narrativeOptionsCollection, initialDraftsCollection, isAcousticCaptureProcessActive, handleAcousticChronicleCaptureAction]);

  return (
    <div className="relative flex-1 flex flex-col min-h-0 w-full overflow-hidden isolate">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={currentFlowState} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex-1 flex flex-col min-h-0 h-full isolate">
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-0">{activeStepComponentMarkup}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}