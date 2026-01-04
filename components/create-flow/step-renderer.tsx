// components/create-flow/step-renderer.tsx
// VERSIÓN: 1.7 (Sovereign Architecture - Total State Coverage)

"use client";

import React, { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCreationContext } from "./shared/context";
import { useFormContext } from "react-hook-form";

import { PurposeSelectionStep } from "./steps/purpose-selection-step";
import { LearnSubStep } from "./steps/learn-sub-step";
import { SoloTalkStep } from "./steps/solo-talk-step";
import { DetailsStep } from "./steps/details-step";
import { FinalStep } from "./steps/final-step";
import { ToneSelectionStep } from "./steps/tone-selection-step";
import { DraftGenerationLoader } from "./steps/draft-generation-loader";
import { AudioStudio } from "./steps/audio-studio"; // [CRÍTICO]: Asegurar importación
import { LocalDiscoveryStep } from "./steps/local-discovery-step";
import { DiscoveryResultStep } from "./steps/discovery-result-step";
import { InspireSubStep } from "./steps/inspire-sub-step";
import { ArchetypeStep } from "./steps/archetype-step";
import { ArchetypeInputStep } from "./steps/archetype-input";
import { LinkPointsStep } from "./steps/link-points";
import { NarrativeSelectionStep } from "./steps/narrative-selection-step";
import { LegacyStep } from "./steps/legacy-step";
import { QuestionStep } from "./steps/question-step";
import { StyleSelectionStep } from "./steps/style-selection";

import dynamic from 'next/dynamic';
const ScriptEditorStep = dynamic(
  () => import('./steps/script-editor-step').then((m) => m.ScriptEditorStep),
  { ssr: false }
);

export function StepRenderer({ narrativeOptions }: { narrativeOptions: any[] }) {
  const { currentFlowState } = useCreationContext();
  const { getValues } = useFormContext();

  const stepContent = useMemo(() => {
    switch (currentFlowState) {
      case 'SELECTING_PURPOSE':      return <PurposeSelectionStep />;
      case 'LOCAL_DISCOVERY_STEP':   return <LocalDiscoveryStep />;
      case 'LOCAL_RESULT_STEP':      return <DiscoveryResultStep />;
      case 'LEARN_SUB_SELECTION':    return <LearnSubStep />;
      case 'INSPIRE_SUB_SELECTION':  return <InspireSubStep />;
      case 'SOLO_TALK_INPUT':        return <SoloTalkStep />;
      case 'ARCHETYPE_SELECTION':    return <ArchetypeStep />;
      case 'ARCHETYPE_GOAL':         return <ArchetypeInputStep />;
      case 'LINK_POINTS_INPUT':      return <LinkPointsStep />;
      case 'NARRATIVE_SELECTION':    return <NarrativeSelectionStep narrativeOptions={narrativeOptions} />;
      case 'LEGACY_INPUT':           return <LegacyStep />;
      case 'QUESTION_INPUT':         return <QuestionStep />;
      case 'FREESTYLE_SELECTION':    return <StyleSelectionStep />;
      case 'DETAILS_STEP':           return <DetailsStep />;
      case 'TONE_SELECTION':         return <ToneSelectionStep />;
      case 'DRAFT_GENERATION_LOADER': return <DraftGenerationLoader formData={getValues() as any} />;
      case 'SCRIPT_EDITING':         return <ScriptEditorStep />;
      case 'AUDIO_STUDIO_STEP':      return <AudioStudio />; // [FIJO]: Mapeado correctamente
      case 'FINAL_STEP':             return <FinalStep />;
      default:                       return <div className="text-white p-10">Error de flujo: Estado no reconocido.</div>;
    }
  }, [currentFlowState, getValues, narrativeOptions]);

  return (
    <div className="relative flex-1 flex flex-col min-h-0 w-full overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentFlowState}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="flex-1 flex flex-col min-h-0 h-full"
        >
          <div className="flex-1 overflow-y-auto custom-scrollbar-hide px-4 md:px-0">
            {stepContent}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}