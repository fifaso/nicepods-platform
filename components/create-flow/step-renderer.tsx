// components/create-flow/step-renderer.tsx
// VERSIÓN: 1.2 (Final Case-Sensitive Fix - Vercel Optimized)

"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCreationContext } from "./shared/context";

// IMPORTACIONES ESTANDARIZADAS (kebab-case)
import { PurposeSelectionStep } from "./steps/purpose-selection-step";
import { LocalDiscoveryStep } from "./steps/local-discovery-step";
import { LearnSubStep } from "./steps/learn-sub-step";
import { InspireSubStep } from "./steps/inspire-sub-step";
import { LegacyStep } from "./steps/legacy-step";
import { QuestionStep } from "./steps/question-step";
import { StyleSelectionStep } from "./steps/style-selection";
import { SoloTalkStep } from "./steps/solo-talk-step";
import { LinkPointsStep } from "./steps/link-points";
import { NarrativeSelectionStep } from "./steps/narrative-selection-step";
import { DetailsStep } from "./steps/details-step";
import { FinalStep } from "./steps/final-step";
import { AudioStudio } from "./steps/audio-studio";
import { ToneSelectionStep } from "./steps/tone-selection-step";
import { ArchetypeStep } from "./steps/archetype-step";
import { ArchetypeInputStep } from "./steps/archetype-input";

import dynamic from 'next/dynamic';
import { Loader2 } from "lucide-react";

const ScriptEditorStep = dynamic(
  () => import('./steps/script-editor-step').then((mod) => mod.ScriptEditorStep),
  { ssr: false, loading: () => <div className="h-40 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary/30" /></div> }
);

export function StepRenderer({ narrativeOptions }: { narrativeOptions: any[] }) {
  const { currentFlowState } = useCreationContext();

  const stepContent = useMemo(() => {
    switch (currentFlowState) {
      case 'SELECTING_PURPOSE':     return <PurposeSelectionStep />;
      case 'LOCAL_DISCOVERY_STEP':  return <LocalDiscoveryStep />;
      case 'LEARN_SUB_SELECTION':   return <LearnSubStep />;
      case 'INSPIRE_SUB_SELECTION': return <InspireSubStep />;
      case 'LEGACY_INPUT':          return <LegacyStep />;
      case 'QUESTION_INPUT':        return <QuestionStep />;
      case 'SOLO_TALK_INPUT':       return <SoloTalkStep />;
      case 'ARCHETYPE_SELECTION':   return <ArchetypeStep />;
      case 'ARCHETYPE_GOAL':        return <ArchetypeInputStep />;
      case 'LINK_POINTS_INPUT':     return <LinkPointsStep />;
      case 'NARRATIVE_SELECTION':   return <NarrativeSelectionStep narrativeOptions={narrativeOptions} />;
      case 'FREESTYLE_SELECTION':   return <StyleSelectionStep />;
      case 'DETAILS_STEP':          return <DetailsStep />;
      case 'TONE_SELECTION':        return <ToneSelectionStep />;
      case 'SCRIPT_EDITING':        return <ScriptEditorStep />;
      case 'AUDIO_STUDIO_STEP':     return <AudioStudio />;
      case 'FINAL_STEP':            return <FinalStep />;
      default:                      return null;
    }
  }, [currentFlowState, narrativeOptions]);

  return (
    <div className="relative flex-1 flex flex-col min-h-0 w-full overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentFlowState}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="flex-1 flex flex-col min-h-0 w-full h-full"
        >
          <div className="flex-1 overflow-y-auto custom-scrollbar-hide px-2">
            {stepContent}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}