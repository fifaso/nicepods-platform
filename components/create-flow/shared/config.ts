// components/create-flow/shared/config.ts
// VERSIÓN: 1.1 (Standard Discovery Route - Fixed Local Soul Path)

import { FlowState } from "./types";

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
  // [MODIFICACIÓN ESTRATÉGICA]: Inserción del paso de resultados
  local_soul: [
    'SELECTING_PURPOSE', 
    'LOCAL_DISCOVERY_STEP', 
    'LOCAL_RESULT_STEP', // <--- El usuario ve el Dossier aquí
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