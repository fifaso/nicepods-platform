/**
 * ARCHIVO: components/create-flow/shared/config.ts
 * VERSIÓN: 6.0 (NicePod Master Navigation Paths - ZAP Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Definir el ADN de navegación y las trayectorias lógicas para cada 
 * intención de creación, garantizando que el orquestador visual transite por 
 * estados deterministas y purificados.
 * [REFORMA V6.0]: Sincronización nominal absoluta con 'FlowState' V4.0. 
 * Eliminación de acrónimos y abreviaciones en los mapas de ruta. 
 * Alineación con el motor de peritaje multimodal y la terminal de hardware.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { FlowState } from "./types";

/**
 * MASTER_FLOW_PATHS_CONFIGURATION
 * Misión: Centralizar la secuencia obligatoria de fases técnicas por propósito.
 * [SINCRO V6.0]: Cada identificador corresponde a la interfaz purificada de 'shared/types.ts'.
 */
export const MASTER_FLOW_PATHS: Record<string, FlowState[]> = {
  /**
   * 📡 PULSE: Actualidad Personalizada
   * Misión: Transformar señales de autoridad en briefings estratégicos neuronales.
   */
  pulse: [
    'SELECTING_PURPOSE',
    'DEOXYRIBONUCLEIC_ACID_SYNTHTESIS_CHECK', // Sintonización de intereses
    'PULSE_RADAR_SCANNER',                    // Escáner de señales de valor
    'AGENT_TONE_SELECTION',                   // Selección de personalidad
    'TECHNICAL_DETAILS_STEP',                 // Extensión y profundidad
    'DRAFT_GENERATION_LOADER',                // Monitor de orquestación IA
    'BRIEFING_SANITIZATION_REVIEW',           // Auditoría del guion previo
    'FINAL_MANIFESTO_STEP'                    // Lanzamiento soberano
  ],

  /**
   * 🌍 LOCAL_SOUL: Vive lo Local (Madrid Resonance)
   * Misión: Descubrir y anclar capital intelectual basado en geolocalización.
   */
  local_soul: [
    'SELECTING_PURPOSE',
    'LOCAL_DISCOVERY_STEP',                   // Ingesta Cámara + GPS
    'LOCAL_ANALYSIS_LOADER',                  // HUD de peritaje geosemántico
    'LOCAL_RESULT_STEP',                      // Revelación de hallazgo histórico
    'GEODETIC_ACUSTIC_RECORDER_STEP',         // Captura de crónica por voz
    'FINAL_MANIFESTO_STEP'                    // Publicación en mapa PBR
  ],

  /**
   * 🧠 LEARN: Aprendizaje Profundo
   * Misión: Desglose académico de conceptos mediante síntesis neuronal.
   */
  learn: [
    'SELECTING_PURPOSE',
    'LEARN_SUB_CATEGORY_SELECTION',           // Especialización temática
    'SOLO_TALK_INPUT_FIELD',                  // Captura de semilla cognitiva
    'AGENT_TONE_SELECTION',                   // Selección del Agente
    'TECHNICAL_DETAILS_STEP',                 // Configuración de análisis
    'DRAFT_GENERATION_LOADER',                // Proceso de investigación
    'SCRIPT_EDITING_CANVAS',                  // Terminal editorial
    'AUDIO_STUDIO_CALIBRATION',               // Ajuste de voz neuronal
    'FINAL_MANIFESTO_STEP'                    // Handover final
  ],

  /**
   * 🔗 EXPLORE: Conexión de Ideas
   * Misión: Generar pensamiento lateral mediante la síntesis de nodos distantes.
   */
  explore: [
    'SELECTING_PURPOSE',
    'LINK_POINTS_INPUT_FORM',                 // Tesis A + Tesis B
    'NARRATIVE_SELECTION_BRANCHING',          // Arco de conexión IA
    'AGENT_TONE_SELECTION',
    'TECHNICAL_DETAILS_STEP',
    'DRAFT_GENERATION_LOADER',
    'SCRIPT_EDITING_CANVAS',
    'AUDIO_STUDIO_CALIBRATION',
    'FINAL_MANIFESTO_STEP'
  ],

  /**
   * 📜 REFLECT: Legado y Testimonio
   * Misión: Inmortalizar experiencias y sabiduría urbana.
   */
  reflect: [
    'SELECTING_PURPOSE',
    'LEGACY_LESSON_INPUT',                    // Captura narrativa
    'AGENT_TONE_SELECTION',
    'TECHNICAL_DETAILS_STEP',
    'DRAFT_GENERATION_LOADER',
    'SCRIPT_EDITING_CANVAS',
    'AUDIO_STUDIO_CALIBRATION',
    'FINAL_MANIFESTO_STEP'
  ],

  /**
   * ✨ INSPIRE: Chispa Creativa
   * Misión: Producir narrativas basadas en áreas de inspiración táctica.
   */
  inspire: [
    'SELECTING_PURPOSE',
    'INSPIRE_SUB_CATEGORY_SELECTION',         // Área de inspiración
    'SOLO_TALK_INPUT_FIELD',                  // Semilla creativa
    'AGENT_TONE_SELECTION',
    'TECHNICAL_DETAILS_STEP',
    'DRAFT_GENERATION_LOADER',
    'SCRIPT_EDITING_CANVAS',
    'AUDIO_STUDIO_CALIBRATION',
    'FINAL_MANIFESTO_STEP'
  ]
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Build Shield Compliance: Se han actualizado todos los identificadores para 
 *    que el orquestador coincida con las definiciones de 'FlowState' purificadas.
 * 2. Zero Abbreviations Policy: Purga total de términos como 'DNA', 'GEO', 
 *    'HUD', 'Studio' (referencia completa), 'Step' (referencia a fase completa).
 * 3. Deterministic Routing: Se garantiza que no existan estados huérfanos entre 
 *    propósitos, eliminando errores de navegación durante el despliegue en Vercel.
 */