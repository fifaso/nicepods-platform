// components/create-flow/step-renderer.tsx
// VERSIÓN: 1.4 (Sovereign Architecture - Loader Integration)

"use client";

import React, { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCreationContext } from "./shared/context";
import { useFormContext } from "react-hook-form";

// Pasos Individuales
import { PurposeSelectionStep } from "./steps/purpose-selection-step";
import { LearnSubStep } from "./steps/learn-sub-step";
import { SoloTalkStep } from "./steps/solo-talk-step";
import { DetailsStep } from "./steps/details-step";
import { FinalStep } from "./steps/final-step";
import { ToneSelectionStep } from "./steps/tone-selection-step";
import { DraftGenerationLoader } from "./draft-generation-loader";

// Importación Dinámica para el Editor (Pesado)
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
      case 'LEARN_SUB_SELECTION':    return <LearnSubStep />;
      case 'SOLO_TALK_INPUT':        return <SoloTalkStep />;
      case 'DETAILS_STEP':           return <DetailsStep />;
      case 'TONE_SELECTION':         return <ToneSelectionStep />;
      case 'SCRIPT_EDITING':         return <ScriptEditorStep />;
      case 'FINAL_STEP':             return <FinalStep />;
      
      // CASO CRÍTICO: Pantalla de carga cognitiva
      case 'DRAFT_GENERATION_LOADER': 
        return <DraftGenerationLoader formData={getValues() as any} />;
      
      default:                       return <PurposeSelectionStep />;
    }
  }, [currentFlowState, getValues]);

  return (
    <div className="relative flex-1 flex flex-col min-h-0 w-full overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentFlowState}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          className="flex-1 flex flex-col min-h-0 h-full"
        >
          <div className="flex-1 overflow-y-auto custom-scrollbar-hide">
            {stepContent}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}