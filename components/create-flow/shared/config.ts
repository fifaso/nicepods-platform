// components/create-flow/shared/config.ts
// VERSIÓN: 1.0 (Sovereign Flow Configuration)

import { FlowState } from "./types";

/**
 * MASTER_FLOW_PATHS
 * Define el orden secuencial de pantallas para cada propósito del usuario.
 * Cualquier cambio en la estrategia de pasos se realiza exclusivamente aquí.
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