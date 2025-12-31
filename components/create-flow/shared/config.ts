// components/create-flow/shared/config.ts
// VERSIÓN: 1.3 (Sovereign Configuration - Complete Discovery Path)

import { FlowState } from "./types";

/**
 * MASTER_FLOW_PATHS
 * Define la secuencia exacta de pantallas para cada intención del usuario.
 */
export const MASTER_FLOW_PATHS: Record<string, FlowState[]> = {
  learn: [
    'SELECTING_PURPOSE', 
    'LEARN_SUB_SELECTION', 
    'SOLO_TALK_INPUT', 
    'TONE_SELECTION', 
    'DETAILS_STEP', 
    'SCRIPT_EDITING', 
    'AUDIO_STUDIO_STEP', 
    'FINAL_STEP'
  ],
  explore: [
    'SELECTING_PURPOSE', 
    'LINK_POINTS_INPUT', 
    'NARRATIVE_SELECTION', 
    'TONE_SELECTION', 
    'DETAILS_STEP', 
    'SCRIPT_EDITING', 
    'AUDIO_STUDIO_STEP', 
    'FINAL_STEP'
  ],
  reflect: [
    'SELECTING_PURPOSE', 
    'LEGACY_INPUT', 
    'TONE_SELECTION', 
    'DETAILS_STEP', 
    'SCRIPT_EDITING', 
    'AUDIO_STUDIO_STEP', 
    'FINAL_STEP'
  ],
  answer: [
    'SELECTING_PURPOSE', 
    'QUESTION_INPUT', 
    'TONE_SELECTION', 
    'DETAILS_STEP', 
    'SCRIPT_EDITING', 
    'AUDIO_STUDIO_STEP', 
    'FINAL_STEP'
  ],
  local_soul: [
    'SELECTING_PURPOSE', 
    'LOCAL_DISCOVERY_STEP', 
    'LOCAL_RESULT_STEP', // Hito de resultados de IA Situacional
    'DETAILS_STEP', 
    'SCRIPT_EDITING', 
    'AUDIO_STUDIO_STEP', 
    'FINAL_STEP'
  ],
  freestyle: [
    'SELECTING_PURPOSE', 
    'FREESTYLE_SELECTION'
  ],
};