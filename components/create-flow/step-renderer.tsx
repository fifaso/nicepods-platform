// components/create-flow/step-renderer.tsx
// VERSIÓN: 3.0 (Master View Orchestrator - Full Flow Integration & Realtime Handover)

"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from 'next/dynamic';
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useCreationContext } from "./shared/context";

// --- IMPORTACIONES DE PASOS: NÚCLEO ---
import { PurposeSelectionStep } from "./steps/purpose-selection-step";

// --- IMPORTACIONES: FLUJO PULSE (ACTUALIDAD) ---
import { DnaInterviewStep } from "./steps/dna-interview-step";
import { PulseRadarStep } from "./steps/pulse-radar-step";

// --- IMPORTACIONES: FLUJO GEO-ALMA (VIVE LO LOCAL) ---
import { GeoRecorder } from "../geo/geo-recorder";
import { GeoScannerUI } from "../geo/scanner-ui";
import { LocalDiscoveryStep } from "./steps/local-discovery-step";

// --- IMPORTACIONES: FLUJOS NARRATIVOS (LEARN, EXPLORE, REFLECT, INSPIRE) ---
import { InspireSubStep } from "./steps/inspire-sub-step";
import { LearnSubStep } from "./steps/learn-sub-step";
import { LegacyStep } from "./steps/legacy-step";
import { LinkPointsStep } from "./steps/link-points";
import { NarrativeSelectionStep } from "./steps/narrative-selection-step";
import { QuestionStep } from "./steps/question-step";
import { SoloTalkStep } from "./steps/solo-talk-step";
import { StyleSelectionStep } from "./steps/style-selection";

// --- IMPORTACIONES: FASES TRANSVERSALES DE PRODUCCIÓN ---
import { AudioStudio } from "./steps/audio-studio";
import { DetailsStep } from "./steps/details-step";
import { DraftGenerationLoader } from "./steps/draft-generation-loader";
import { FinalStep } from "./steps/final-step";
import { ToneSelectionStep } from "./steps/tone-selection-step";

// CARGA DINÁMICA: Aísla el peso del editor de texto para maximizar performance
const ScriptEditorStep = dynamic(
  () => import('./steps/script-editor-step').then((m) => m.ScriptEditorStep),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex flex-col items-center justify-center space-y-4 opacity-40">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Sincronizando Editor...</span>
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
 * Orquesta la visualización de los componentes según el estado de la FlowState Machine.
 */
export function StepRenderer({ narrativeOptions, initialDrafts }: StepRendererProps) {
  const { currentFlowState } = useCreationContext();
  const { watch } = useFormContext();

  // Observamos el formData para inyectar estados persistidos (como draft_id) en los sub-pasos
  const formData = watch();

  /**
   * stepContent
   * Mapeo determinista entre el estado lógico y el componente físico.
   */
  const stepContent = useMemo(() => {
    switch (currentFlowState) {
      // --- FASE 1: DEFINICIÓN DE INTENCIÓN ---
      case 'SELECTING_PURPOSE':
        return <PurposeSelectionStep existingDrafts={initialDrafts} />;

      // --- RUTA: PULSE (ACTUALIDAD E INTELIGENCIA) ---
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
        // GeoScannerUI gestiona internamente el estado de carga y resultado geosemántico
        return <GeoScannerUI />;
      case 'GEO_RECORDER_STEP':
        return (
          <GeoRecorder
            draftId={formData.draft_id?.toString()}
            script={formData.final_script}
            onUploadComplete={() => { }}
          />
        );

      // --- RUTAS NARRATIVAS (LEARN / INSPIRE / EXPLORE / REFLECT) ---
      case 'LEARN_SUB_SELECTION': return <LearnSubStep />;
      case 'SOLO_TALK_INPUT': return <SoloTalkStep />;
      case 'INSPIRE_SUB_SELECTION': return <InspireSubStep />;
      case 'LINK_POINTS_INPUT': return <LinkPointsStep />;
      case 'NARRATIVE_SELECTION':
        return <NarrativeSelectionStep narrativeOptions={narrativeOptions} />;
      case 'LEGACY_INPUT': return <LegacyStep />;

      // --- FASES COMUNES DE PRODUCCIÓN ---
      case 'DETAILS_STEP': return <DetailsStep />;
      case 'TONE_SELECTION': return <ToneSelectionStep />;

      // Monitor de Inteligencia Realtime (Asíncrono)
      case 'DRAFT_GENERATION_LOADER':
        return <DraftGenerationLoader formData={formData as any} />;

      case 'SCRIPT_EDITING': return <ScriptEditorStep />;
      case 'AUDIO_STUDIO_STEP': return <AudioStudio />;
      case 'FINAL_STEP': return <FinalStep />;

      // --- COMPATIBILIDAD ---
      case 'QUESTION_INPUT': return <QuestionStep />;
      case 'FREESTYLE_SELECTION': return <StyleSelectionStep />;

      default:
        return (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse rounded-full" />
              <div className="h-12 w-12 border-2 border-primary border-t-transparent rounded-full animate-spin relative z-10" />
            </div>
            <p className="font-black uppercase tracking-[0.4em] text-[10px] text-white/40">
              Sincronizando Malla de Inteligencia...
            </p>
          </div>
        );
    }
  }, [currentFlowState, formData, narrativeOptions, initialDrafts]);

  return (
    <div className="relative flex-1 flex flex-col min-h-0 w-full overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentFlowState}
          initial={{ opacity: 0, x: 20, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 1.02 }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
          }}
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