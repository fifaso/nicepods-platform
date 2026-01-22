// components/create-flow/shared/config.ts
// VERSIÓN: 1.8 (Pulse Architecture - Evolutionary Path Mapping)

import { FlowState } from "./types";

/**
 * MASTER_FLOW_PATHS
 * Define el ADN de navegación para cada intención.
 * 
 * [ACTUALIZACIÓN 1.8]: Se integra la ruta 'pulse' para actualidad personalizada,
 * sustituyendo el flujo de QA ('answer') por inteligencia estratégica.
 */
export const MASTER_FLOW_PATHS: Record<string, FlowState[]> = {
  /**
   * PULSE: El nuevo motor de actualidad proactiva.
   * Flujo: Identificación de intereses -> Selección de señales -> Producción ejecutiva.
   */
  pulse: [
    'SELECTING_PURPOSE',      // Selección inicial
    'DNA_CHECK',              // Verificación o entrevista de ADN Cognitivo
    'PULSE_RADAR',            // Selección de las 5 fuentes del Top 20
    'TONE_SELECTION',         // Selección del Agente (Briefing Architect)
    'DETAILS_STEP',           // Configuración de duración y profundidad
    'DRAFT_GENERATION_LOADER',// IA trabajando en la síntesis
    'SCRIPT_EDITING',         // Sanitización y revisión del briefing
    'AUDIO_STUDIO_STEP',      // Configuración de voz neuronal
    'FINAL_STEP'              // Handover de producción soberana
  ],

  /**
   * LEARN: Desglose de conceptos complejos.
   */
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

  /**
   * EXPLORE: Conexión de ideas dispares (Pensamiento Lateral).
   */
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

  /**
   * REFLECT: Legado, lecciones de vida y testimonios.
   */
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

  /**
   * LOCAL_SOUL: IA Situacional basada en ubicación y visión.
   */
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

  /**
   * INSPIRE: Creación basada en arquetipos de personalidad.
   */
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