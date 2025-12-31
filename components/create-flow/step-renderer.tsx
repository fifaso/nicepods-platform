// components/create-flow/step-renderer.tsx
// VERSIÓN: 1.0 (Professional Viewport Manager & Step Orchestrator)

"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCreationContext } from "./shared/context";
import { FlowState } from "./shared/types";

// Importación de Pasos (Ya existentes en tu carpeta steps/)
import { PurposeSelectionStep } from "./steps/purpose-selection-step";
import { LocalDiscoveryStep } from "./steps/local-discovery-step";
import { LearnSubStep } from "./steps/LearnSubStep";
import { InspireSubStep } from "./steps/InspireSubStep";
import { LegacyStep } from "./steps/LegacyStep";
import { QuestionStep } from "./steps/QuestionStep";
import { StyleSelectionStep } from "./steps/style-selection";
import { SoloTalkStep } from "./steps/solo-talk-step";
import { LinkPointsStep } from "./steps/link-points";
import { NarrativeSelectionStep } from "./steps/narrative-selection-step";
import { DetailsStep } from "./steps/details-step";
import { FinalStep } from "./steps/final-step";
import { AudioStudio } from "./steps/audio-studio";
import { ToneSelectionStep } from "./steps/tone-selection-step";

// Importación especial para el Editor (mantenemos la carga dinámica por peso)
import dynamic from 'next/dynamic';
import { Loader2 } from "lucide-react";

const ScriptEditorStep = dynamic(
  () => import('./steps/script-editor-step').then((mod) => mod.ScriptEditorStep),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    )
  }
);

interface StepRendererProps {
  narrativeOptions: any[]; // Datos temporales para el flujo de conexión
}

/**
 * StepRenderer
 * Orquesta la transición visual entre las diferentes etapas del formulario.
 * Utiliza Framer Motion para asegurar una experiencia "vibrante" y profesional.
 */
export function StepRenderer({ narrativeOptions }: StepRendererProps) {
  const { currentFlowState } = useCreationContext();

  /**
   * ComponentMap: Definición estática de componentes por estado.
   * Evita re-renders innecesarios y centraliza la jerarquía visual.
   */
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
          initial={{ opacity: 0, x: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: -10, filter: "blur(4px)" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-1 flex flex-col min-h-0 w-full h-full"
        >
          {/* 
            ESTRATEGIA DE VIEWPORT DVH:
            Este contenedor interno es el único que puede hacer scroll.
            Garantiza que el header y el footer (en el bloque 5) se mantengan fijos.
          */}
          <div className="flex-1 overflow-y-auto custom-scrollbar-hide px-1 md:px-0">
            {stepContent}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}