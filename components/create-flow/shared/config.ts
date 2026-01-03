// components/create-flow/shared/config.ts
// VERSIÓN: 1.4 (Full Journey Persistence - Pathing Fix)

import { FlowState } from "./types";

/**
 * MASTER_FLOW_PATHS
 * [CORRECCIÓN CRÍTICA]: Se añaden DRAFT_GENERATION_LOADER y SCRIPT_EDITING
 * para que el motor de navegación no pierda el índice y reinicie el flujo.
 */
export const MASTER_FLOW_PATHS: Record<string, FlowState[]> = {
  learn: [
    'SELECTING_PURPOSE', 
    'LEARN_SUB_SELECTION', 
    'SOLO_TALK_INPUT', 
    'TONE_SELECTION', 
    'DETAILS_STEP', 
    'DRAFT_GENERATION_LOADER', // Paso técnico registrado
    'SCRIPT_EDITING',          // Paso técnico registrado
    'AUDIO_STUDIO_STEP',       // DESTINO TRAS EL GUION
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