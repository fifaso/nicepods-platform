// components/create-flow/shared/config.ts
// VERSIÓN: 1.7 (Master Standard - Final Path Mapping)

import { FlowState } from "./types";

/**
 * MASTER_FLOW_PATHS
 * Define el ADN de navegación para cada intención.
 * Todas las rutas convergen en el ciclo final de producción.
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
  ],
  inspire: [
    'SELECTING_PURPOSE', 
    'INSPIRE_SUB_SELECTION', 
    'ARCHETYPE_SELECTION', 
    'ARCHETYPE_GOAL',
    'TONE_SELECTION', 
    'DETAILS_STEP', 
    'DRAFT_GENERATION_LOADER', 
    'SCRIPT_EDITING', 
    'AUDIO_STUDIO_STEP', 
    'FINAL_STEP'
  ]
};