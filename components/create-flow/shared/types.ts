// components/create-flow/shared/types.ts
// VERSIÓN: 1.0 (Enterprise Flow Typings)

import { PodcastCreationData } from "@/lib/validation/podcast-schema";

/**
 * Estados finitos del flujo de creación.
 * Define cada pantalla posible dentro del Orquestador.
 */
export type FlowState = 
  | 'SELECTING_PURPOSE' 
  | 'LOCAL_DISCOVERY_STEP' 
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

/**
 * Interfaz del Contexto de Creación.
 * El "túnel" por el cual los componentes hijos envían órdenes al Orquestador.
 */
export interface CreationContextType {
  currentFlowState: FlowState;
  history: FlowState[];
  isGeneratingScript: boolean;
  setIsGeneratingScript: (val: boolean) => void;
  updateFormData: (data: Partial<PodcastCreationData>) => void;
  transitionTo: (state: FlowState) => void;
  goBack: () => void;
}