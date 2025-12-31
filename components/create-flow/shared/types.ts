// components/create-flow/shared/types.ts
// VERSIÓN: 1.1 (Sovereign Flow Typings - Added Local Result)

import { PodcastCreationData } from "@/lib/validation/podcast-schema";

export type FlowState = 
  | 'SELECTING_PURPOSE' 
  | 'LOCAL_DISCOVERY_STEP' 
  | 'LOCAL_RESULT_STEP' // <--- NUEVO ESTADO DE RESULTADOS
  | 'LEARN_SUB_SELECTION' 
  | 'INSPIRE_SUB_SELECTION' 
  | 'SOLO_TALK_INPUT' 
  | 'ARCHETYPE_SELECTION' 
  | 'ARCHETYPE_GOAL' 
  | 'LINK_POINTS_INPUT' 
  | 'NARRATIVE_SELECTION' 
  | 'LEGACY_INPUT' 
  | 'QUESTION_INPUT' 
  | 'FREESTYLE_SELECTION' 
  | 'DETAILS_STEP' 
  | 'TONE_SELECTION' 
  | 'SCRIPT_EDITING' 
  | 'AUDIO_STUDIO_STEP' 
  | 'FINAL_STEP';

export interface CreationContextType {
  currentFlowState: FlowState;
  history: FlowState[];
  isGeneratingScript: boolean;
  setIsGeneratingScript: (val: boolean) => void;
  updateFormData: (data: Partial<PodcastCreationData>) => void;
  transitionTo: (state: FlowState) => void;
  goBack: () => void;
  getMasterPath: () => FlowState[]; // Requerido para el botón Siguiente
}