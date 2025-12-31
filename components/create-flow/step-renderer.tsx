// components/create-flow/step-renderer.tsx
// VERSIÓN: 1.3 (Sovereign Architecture - Full Discovery Integration & Vercel Fix)

"use client";

import React, { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCreationContext } from "./shared/context";

// IMPORTACIONES ESTANDARIZADAS (kebab-case) - Sincronizadas con el Sistema de Archivos
import { PurposeSelectionStep } from "./steps/purpose-selection-step";
import { LocalDiscoveryStep } from "./steps/local-discovery-step";
import { DiscoveryResultStep } from "./steps/discovery-result-step"; // <--- NUEVO
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

// Importación Dinámica para componentes de alto peso (Editor)
import dynamic from 'next/dynamic';
import { Loader2 } from "lucide-react";

const ScriptEditorStep = dynamic(
  () => import('./steps/script-editor-step').then((mod) => mod.ScriptEditorStep),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
        <span className="text-xs font-bold tracking-widest uppercase opacity-30 mt-4">Cargando Estación de Guion</span>
      </div>
    ) 
  }
);

interface StepRendererProps {
  narrativeOptions: any[]; // Opciones generadas para el flujo de conexión de ideas
}

/**
 * StepRenderer
 * Responsable único de decidir qué pantalla mostrar basándose en el Contexto de Creación.
 * Implementa transiciones animadas y garantiza la estabilidad del viewport.
 */
export function StepRenderer({ narrativeOptions }: StepRendererProps) {
  const { currentFlowState } = useCreationContext();

  /**
   * Mapeo Lógico de Estados a Componentes
   * useMemo asegura que no haya parpadeos innecesarios durante el cambio de pasos.
   */
  const stepContent = useMemo(() => {
    switch (currentFlowState) {
      // ETAPA INICIAL
      case 'SELECTING_PURPOSE':     return <PurposeSelectionStep />;
      
      // RAMA: VIVIR LO LOCAL (SITUACIONAL)
      case 'LOCAL_DISCOVERY_STEP':  return <LocalDiscoveryStep />;
      case 'LOCAL_RESULT_STEP':     return <DiscoveryResultStep />;
      
      // RAMA: APRENDER / CONCEPTO SOLO
      case 'LEARN_SUB_SELECTION':   return <LearnSubStep />;
      case 'SOLO_TALK_INPUT':       return <SoloTalkStep />;
      
      // RAMA: INSPIRAR / ARQUETIPOS
      case 'INSPIRE_SUB_SELECTION': return <InspireSubStep />;
      case 'ARCHETYPE_SELECTION':   return <ArchetypeStep />;
      case 'ARCHETYPE_GOAL':        return <ArchetypeInputStep />;
      
      // RAMA: EXPLORAR / CONEXIÓN
      case 'LINK_POINTS_INPUT':     return <LinkPointsStep />;
      case 'NARRATIVE_SELECTION':   return <NarrativeSelectionStep narrativeOptions={narrativeOptions} />;
      
      // RAMA: REFLEXIONAR / LEGADO
      case 'LEGACY_INPUT':          return <LegacyStep />;
      
      // RAMA: PREGUNTAR / QA
      case 'QUESTION_INPUT':        return <QuestionStep />;
      
      // RAMA: LIBRE / FREESTYLE
      case 'FREESTYLE_SELECTION':   return <StyleSelectionStep />;
      
      // ETAPAS COMUNES DE CIERRE Y PRODUCCIÓN
      case 'DETAILS_STEP':          return <DetailsStep />;
      case 'TONE_SELECTION':        return <ToneSelectionStep />;
      case 'SCRIPT_EDITING':        return <ScriptEditorStep />;
      case 'AUDIO_STUDIO_STEP':     return <AudioStudio />;
      case 'FINAL_STEP':            return <FinalStep />;
      
      // FALLBACK DE SEGURIDAD
      default:                      return <PurposeSelectionStep />;
    }
  }, [currentFlowState, narrativeOptions]);

  return (
    <div className="relative flex-1 flex flex-col min-h-0 w-full overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentFlowState}
          initial={{ opacity: 0, x: 15, filter: "blur(5px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: -15, filter: "blur(5px)" }}
          transition={{ duration: 0.4, ease: "circOut" }}
          className="flex-1 flex flex-col min-h-0 w-full h-full"
        >
          {/* 
            SCROLL CONTAINER:
            Es el único punto que permite el scroll dentro del formulario,
            manteniendo el Header y Footer del LayoutShell siempre fijos.
          */}
          <div className="flex-1 overflow-y-auto custom-scrollbar-hide px-4 md:px-0">
            {stepContent}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}