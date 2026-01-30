// components/create-flow/shared/config.ts
// VERSIÓN: 5.0 (Master Navigation Paths - Unified 360 Architecture)

import { FlowState } from "./types";

/**
 * MASTER_FLOW_PATHS
 * Define el ADN de navegación para cada intención de creación en NicePod.
 * Cada array representa la secuencia obligatoria de estados (pasos) que el
 * orquestador debe seguir.
 */
export const MASTER_FLOW_PATHS: Record<string, FlowState[]> = {
  /**
   * 📡 PULSE: Actualidad Personalizada
   * Misión: Transformar señales de alta autoridad en briefings estratégicos.
   */
  pulse: [
    'SELECTING_PURPOSE',      // Selección inicial
    'DNA_CHECK',              // Sintonización de intereses (Tags + Voz)
    'PULSE_RADAR',            // Escáner y selección de fuentes (Top 20)
    'TONE_SELECTION',         // Elección de personalidad del agente
    'DETAILS_STEP',           // Configuración de extensión y profundidad
    'DRAFT_GENERATION_LOADER',// Monitor de investigación y redacción asíncrona
    'BRIEFING_SANITIZATION',  // Edición y validación humana del guion
    'FINAL_STEP'              // Lanzamiento y Curaduría Soberana
  ],

  /**
   * 🌍 LOCAL_SOUL: Geo-Alma (Vive lo Local)
   * Misión: Descubrir y anclar crónicas históricas basadas en ubicación y visión.
   */
  local_soul: [
    'SELECTING_PURPOSE',
    'LOCAL_DISCOVERY_STEP',   // Captura de Sensores (Cámara + GPS)
    'LOCAL_ANALYSIS_LOADER',  // HUD de análisis geosemántico asíncrono
    'LOCAL_RESULT_STEP',      // Revelación de hallazgo y teleprompter AI
    'GEO_RECORDER_STEP',      // Generación y anclaje del activo sonoro
    'FINAL_STEP'              // Publicación en el mapa 3D
  ],

  /**
   * 🧠 LEARN: Aprendizaje Profundo
   * Misión: Desglose de conceptos complejos con base académica.
   */
  learn: [
    'SELECTING_PURPOSE',
    'LEARN_SUB_SELECTION',    // Especialización del tema
    'SOLO_TALK_INPUT',        // Captura de la idea semilla
    'TONE_SELECTION',         // Selección del Agente Narrativo
    'DETAILS_STEP',           // Configuración de análisis
    'DRAFT_GENERATION_LOADER',// Proceso de investigación profunda
    'SCRIPT_EDITING',         // Revisión del guion narrativo
    'AUDIO_STUDIO_STEP',      // Calibración de voz actoral
    'FINAL_STEP'              // Handover final
  ],

  /**
   * 🔗 EXPLORE: Conexión de Ideas
   * Misión: Unir puntos dispares para generar pensamiento lateral.
   */
  explore: [
    'SELECTING_PURPOSE',
    'LINK_POINTS_INPUT',      // Tesis A + Tesis B
    'NARRATIVE_SELECTION',    // Selección de arco de conexión
    'TONE_SELECTION',
    'DETAILS_STEP',
    'DRAFT_GENERATION_LOADER',
    'SCRIPT_EDITING',
    'AUDIO_STUDIO_STEP',
    'FINAL_STEP'
  ],

  /**
   * 📜 REFLECT: Legado y Testimonio
   * Misión: Capturar la esencia de experiencias y lecciones de vida.
   */
  reflect: [
    'SELECTING_PURPOSE',
    'LEGACY_INPUT',           // Captura narrativa del testimonio
    'TONE_SELECTION',
    'DETAILS_STEP',
    'DRAFT_GENERATION_LOADER',
    'SCRIPT_EDITING',
    'AUDIO_STUDIO_STEP',
    'FINAL_STEP'
  ],

  /**
   * ✨ INSPIRE: Chispa Creativa
   * [SISTEMA]: Flujo simplificado tras la eliminación de Arquetipos.
   */
  inspire: [
    'SELECTING_PURPOSE',
    'INSPIRE_SUB_SELECTION',  // Área de inspiración
    'SOLO_TALK_INPUT',        // Semilla creativa
    'TONE_SELECTION',
    'DETAILS_STEP',
    'DRAFT_GENERATION_LOADER',
    'SCRIPT_EDITING',
    'AUDIO_STUDIO_STEP',
    'FINAL_STEP'
  ]
};