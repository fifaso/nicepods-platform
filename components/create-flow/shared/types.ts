// components/create-flow/shared/types.ts
// VERSIÓN: 1.5 (Master Standard - Vocal Performance Type Safety)

import { PodcastCreationData } from "@/lib/validation/podcast-schema";

/**
 * 🎭 VOCAL PERFORMANCE TYPES (V3.0)
 * Definiciones estrictas alineadas con vocal-director-map.ts
 * Garantizan que el Studio de Audio y el Backend hablen el mismo idioma.
 */

export type VoiceStyle =
  | 'Calmado'
  | 'Energético'
  | 'Profesional'
  | 'Inspirador';

export type VoicePace =
  | 'Lento'
  | 'Moderado'
  | 'Rápido';

export type VoiceGender =
  | 'Masculino'
  | 'Femenino';

export type PersonalityType =
  | 'narrador'
  | 'esceptico'
  | 'mentor'
  | 'amigo'
  | 'rebelde'
  | 'minimalista';

/**
 * 🗺️ FLOW STATE ENGINE
 * Representa cada hito visual y lógico en la máquina de estados.
 */
export type FlowState =
  | 'SELECTING_PURPOSE'
  | 'LOCAL_DISCOVERY_STEP'
  | 'LOCAL_RESULT_STEP'
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
  | 'DRAFT_GENERATION_LOADER'
  | 'SCRIPT_EDITING'
  | 'AUDIO_STUDIO_STEP'
  | 'FINAL_STEP';

/**
 * 🛠️ CONTRATO DE CONTEXTO GLOBAL
 * Define los métodos de orquestación disponibles para cada 'step'.
 */
export interface CreationContextType {
  // Estado de navegación
  currentFlowState: FlowState;
  history: FlowState[];

  // Estado de procesamiento
  isGeneratingScript: boolean;
  setIsGeneratingScript: (val: boolean) => void;

  // Gestión de datos
  updateFormData: (data: Partial<PodcastCreationData>) => void;

  // Motores de transición
  transitionTo: (state: FlowState) => void;

  /**
   * jumpToStep: Realiza un salto atómico a un estado avanzado
   * reconstruyendo el historial previo para mantener la integridad del botón 'Atrás'.
   */
  jumpToStep: (state: FlowState) => void;

  /**
   * goBack: Retroceso seguro en el stack de navegación.
   */
  goBack: () => void;

  /**
   * getMasterPath: Recupera la genealogía de pasos según el propósito actual.
   */
  getMasterPath: () => FlowState[];
}

/**
 * 📚 NARRATIVE TYPES
 * Estructuras para la conexión de ideas (flujo 'Explore').
 */
export interface NarrativeOption {
  title: string;
  thesis: string;
}