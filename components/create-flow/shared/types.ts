// components/create-flow/shared/types.ts
// VERSIÓN: 1.6 (Master Standard - Pulse & DNA Flow Integration)

import { PodcastCreationData } from "@/lib/validation/podcast-schema";

/**
 * 🎭 VOCAL PERFORMANCE TYPES (V3.0)
 * Definiciones estrictas alineadas con vocal-director-map.ts
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
 * 🗺️ FLOW STATE ENGINE (V2.0)
 * Representa cada hito visual y lógico en la máquina de estados de NicePod.
 * 
 * [ACTUALIZACIÓN 1.6]: Se inyectan los estados para el motor de Inteligencia Pulse.
 */
export type FlowState =
  | 'SELECTING_PURPOSE'
  // --- FLUJO SITUACIONAL ---
  | 'LOCAL_DISCOVERY_STEP'
  | 'LOCAL_RESULT_STEP'
  // --- FLUJO DE APRENDIZAJE ---
  | 'LEARN_SUB_SELECTION'
  | 'SOLO_TALK_INPUT'
  // --- FLUJO DE INSPIRACIÓN ---
  | 'INSPIRE_SUB_SELECTION'
  | 'ARCHETYPE_SELECTION'
  | 'ARCHETYPE_GOAL'
  // --- FLUJO DE EXPLORACIÓN ---
  | 'LINK_POINTS_INPUT'
  | 'NARRATIVE_SELECTION'
  // --- FLUJO DE LEGADO ---
  | 'LEGACY_INPUT'
  // --- [NUEVO] FLUJO PULSE (ACTUALIDAD) ---
  | 'DNA_CHECK'              // Entrevista IA e intereses
  | 'PULSE_RADAR'            // Escáner y selección de fuentes
  | 'BRIEFING_SANTIZATION'   // Revisión de la píldora informativa
  // --- FLUJOS COMPLEMENTARIOS ---
  | 'QUESTION_INPUT'
  | 'FREESTYLE_SELECTION'
  // --- ETAPAS TRANSVERSALES DE PRODUCCIÓN ---
  | 'DETAILS_STEP'
  | 'TONE_SELECTION'
  | 'DRAFT_GENERATION_LOADER'
  | 'SCRIPT_EDITING'
  | 'AUDIO_STUDIO_STEP'
  | 'FINAL_STEP';

/**
 * 🛠️ CONTRATO DE CONTEXTO GLOBAL
 * Interfaz que deben cumplir los orquestadores para la gestión del estado.
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
   * reconstruyendo el historial previo.
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
 */
export interface NarrativeOption {
  title: string;
  thesis: string;
}