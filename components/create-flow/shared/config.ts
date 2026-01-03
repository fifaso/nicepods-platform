// components/create-flow/shared/config.ts
// VERSIÓN: 1.5 (Sovereign Configuration - Journey Integrity Fix)

import { FlowState } from "./types";

/**
 * MASTER_FLOW_PATHS
 * Define la secuencia lineal de cada rama creativa.
 * ORDEN TEÓRICO APLICADO: 
 * 1. Entrada -> 2. Materia Prima -> 3. Calibración -> 4. Carga -> 5. Editor -> 6. Studio -> 7. Final
 */
export const MASTER_FLOW_PATHS: Record<string, FlowState[]> = {
  learn: [
    'SELECTING_PURPOSE', 
    'LEARN_SUB_SELECTION', 
    'SOLO_TALK_INPUT', 
    'TONE_SELECTION', 
    'DETAILS_STEP', 
    'DRAFT_GENERATION_LOADER', 
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
    'DRAFT_GENERATION_LOADER', 
    'SCRIPT_EDITING', 
    'AUDIO_STUDIO_STEP', 
    'FINAL_STEP'
  ],
  reflect: [
    'SELECTING_PURPOSE', 
    'LEGACY_INPUT', 
    'TONE_SELECTION', 
    'DETAILS_STEP', 
    'DRAFT_GENERATION_LOADER', 
    'SCRIPT_EDITING', 
    'AUDIO_STUDIO_STEP', 
    'FINAL_STEP'
  ],
  answer: [
    'SELECTING_PURPOSE', 
    'QUESTION_INPUT', 
    'TONE_SELECTION', 
    'DETAILS_STEP', 
    'DRAFT_GENERATION_LOADER', 
    'SCRIPT_EDITING', 
    'AUDIO_STUDIO_STEP', 
    'FINAL_STEP'
  ],
  local_soul: [
    'SELECTING_PURPOSE', 
    'LOCAL_DISCOVERY_STEP', 
    'LOCAL_RESULT_STEP',
    'DETAILS_STEP', 
    'DRAFT_GENERATION_LOADER', 
    'SCRIPT_EDITING', 
    'AUDIO_STUDIO_STEP', 
    'FINAL_STEP'
  ]
};