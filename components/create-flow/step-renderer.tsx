// components/create-flow/step-renderer.tsx
// VERSIÓN: 2.1 (Pulse Integration Master - Full Flow Mapping & Zero-Drift Switch)

"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from 'next/dynamic';
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useCreationContext } from "./shared/context";

// --- IMPORTACIONES DE PASOS ESTÁNDAR ---
import { ArchetypeInputStep } from "./steps/archetype-input";
import { ArchetypeStep } from "./steps/archetype-step";
import { AudioStudio } from "./steps/audio-studio";
import { DetailsStep } from "./steps/details-step";
import { DiscoveryResultStep } from "./steps/discovery-result-step";
import { DraftGenerationLoader } from "./steps/draft-generation-loader";
import { FinalStep } from "./steps/final-step";
import { InspireSubStep } from "./steps/inspire-sub-step";
import { LearnSubStep } from "./steps/learn-sub-step";
import { LegacyStep } from "./steps/legacy-step";
import { LinkPointsStep } from "./steps/link-points";
import { LocalDiscoveryStep } from "./steps/local-discovery-step";
import { NarrativeSelectionStep } from "./steps/narrative-selection-step";
import { PurposeSelectionStep } from "./steps/purpose-selection-step";
import { QuestionStep } from "./steps/question-step";
import { SoloTalkStep } from "./steps/solo-talk-step";
import { StyleSelectionStep } from "./steps/style-selection";
import { ToneSelectionStep } from "./steps/tone-selection-step";

// --- [SISTEMA PULSE]: NUEVAS INTERFACES DE INTELIGENCIA ---
import { DnaInterviewStep } from "./steps/dna-interview-step";
import { PulseRadarStep } from "./steps/pulse-radar-step";

// CARGA DINÁMICA: Aísla el peso del editor de texto del bundle inicial
const ScriptEditorStep = dynamic(
  () => import('./steps/script-editor-step').then((m) => m.ScriptEditorStep),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex flex-col items-center justify-center space-y-4 opacity-40">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando Editor...</span>
      </div>
    )
  }
);

interface StepRendererProps {
  narrativeOptions: any[];
  initialDrafts: any[];
}

/**
 * StepRenderer
 * Actúa como el Director de Escena del formulario de creación.
 * Mapea el estado lógico del contexto con el componente visual correspondiente.
 */
export function StepRenderer({ narrativeOptions, initialDrafts }: StepRendererProps) {
  const { currentFlowState } = useCreationContext();
  const { getValues } = useFormContext();

  const stepContent = useMemo(() => {
    switch (currentFlowState) {
      // --- FASE 1: DEFINICIÓN DEL PROPÓSITO ---
      case 'SELECTING_PURPOSE':
        return <PurposeSelectionStep existingDrafts={initialDrafts} />;

      // --- FASE 2: CAPTURA DE INTENCIÓN Y CONTEXTO ---

      // [PULSE]: Motor de Actualidad Personalizada
      case 'DNA_CHECK':
        return <DnaInterviewStep />;
      case 'PULSE_RADAR':
        return <PulseRadarStep />;

      // [SITUATIONAL]: IA basada en ubicación
      case 'LOCAL_DISCOVERY_STEP': return <LocalDiscoveryStep />;
      case 'LOCAL_RESULT_STEP': return <DiscoveryResultStep />;

      // [LEARN]: Desglose de conceptos
      case 'LEARN_SUB_SELECTION': return <LearnSubStep />;
      case 'SOLO_TALK_INPUT': return <SoloTalkStep />;

      // [INSPIRE]: Arquetipos de personalidad
      case 'INSPIRE_SUB_SELECTION': return <InspireSubStep />;
      case 'ARCHETYPE_SELECTION': return <ArchetypeStep />;
      case 'ARCHETYPE_GOAL': return <ArchetypeInputStep />;

      // [EXPLORE]: Conexión de ideas
      case 'LINK_POINTS_INPUT': return <LinkPointsStep />;
      case 'NARRATIVE_SELECTION': return <NarrativeSelectionStep narrativeOptions={narrativeOptions} />;

      // [REFLECT]: Legado y lecciones
      case 'LEGACY_INPUT': return <LegacyStep />;

      // [LEGACY / MISC]
      case 'QUESTION_INPUT': return <QuestionStep />;
      case 'FREESTYLE_SELECTION': return <StyleSelectionStep />;

      // --- FASE 3: REFINAMIENTO TÉCNICO Y SÍNTESIS ---
      case 'DETAILS_STEP': return <DetailsStep />;
      case 'TONE_SELECTION': return <ToneSelectionStep />;
      case 'DRAFT_GENERATION_LOADER': return <DraftGenerationLoader formData={getValues() as any} />;

      // --- FASE 4: EDICIÓN, REVISIÓN Y LANZAMIENTO ---
      case 'SCRIPT_EDITING':
      case 'BRIEFING_SANTIZATION': // [FIX]: Mapeado oficial para el flujo Pulse
        return <ScriptEditorStep />;

      case 'AUDIO_STUDIO_STEP': return <AudioStudio />;
      case 'FINAL_STEP': return <FinalStep />;

      default:
        return (
          <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4">
            <div className="p-4 bg-primary/10 rounded-full text-primary animate-bounce">?</div>
            <p className="font-black uppercase tracking-widest text-[10px] opacity-50">
              Sintonizando frecuencia de flujo...
            </p>
          </div>
        );
    }
  }, [currentFlowState, getValues, narrativeOptions, initialDrafts]);

  return (
    <div className="relative flex-1 flex flex-col min-h-0 w-full overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentFlowState}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
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