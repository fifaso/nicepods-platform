// components/create-flow/shared/types.ts
// VERSIÓN: 3.1 (Master Standard - Type Sync & Progress Metrics Integration)

import { PodcastCreationData } from "@/lib/validation/podcast-schema";

/**
 * 🎭 VOCAL PERFORMANCE TYPES
 * Definiciones estandarizadas para el motor de voz neuronal de Gemini.
 * Alineadas estrictamente con vocal-director-map.ts
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
 * 🗺️ FLOW STATE ENGINE
 * Representa cada hito visual y lógico en la máquina de estados de NicePod.
 */
export type FlowState =
  // --- ESTADO INICIAL ---
  | 'SELECTING_PURPOSE'

  // --- FLUJO: VIVE LO LOCAL (MADRID RESONANCE) ---
  | 'LOCAL_DISCOVERY_STEP'  // Sensor Ingest (Cámara + GPS)
  | 'LOCAL_ANALYSIS_LOADER' // HUD de Análisis Geosemántico
  | 'LOCAL_RESULT_STEP'     // Vista de Hallazgo Histórico
  | 'GEO_RECORDER_STEP'     // Generación de Crónica Local

  // --- FLUJO: ACTUALIDAD (PULSE) ---
  | 'DNA_CHECK'              // Sintonización de ADN Cognitivo
  | 'PULSE_RADAR'            // Escáner de fuentes de autoridad
  | 'BRIEFING_SANITIZATION'  // Revisión de la píldora estratégica

  // --- FLUJO: APRENDIZAJE (LEARN) ---
  | 'LEARN_SUB_SELECTION'
  | 'SOLO_TALK_INPUT'

  // --- FLUJO: INSPIRACIÓN (INSPIRE) ---
  | 'INSPIRE_SUB_SELECTION'

  // --- FLUJO: EXPLORACIÓN (EXPLORE) ---
  | 'LINK_POINTS_INPUT'
  | 'NARRATIVE_SELECTION'

  // --- FLUJO: LEGADO (REFLECT) ---
  | 'LEGACY_INPUT'

  // --- ETAPAS TRANSVERSALES DE PRODUCCIÓN ---
  | 'DETAILS_STEP'           // Configuración técnica (Duración/Profundidad)
  | 'TONE_SELECTION'         // Selección de Personalidad del Agente
  | 'DRAFT_GENERATION_LOADER' // Monitor Realtime de Inteligencia
  | 'SCRIPT_EDITING'         // Lienzo de Edición Narrativa
  | 'AUDIO_STUDIO_STEP'      // Calibración de Voz
  | 'FINAL_STEP'             // Manifiesto Final y Lanzamiento

  // --- LEGACY & FALLBACKS ---
  | 'QUESTION_INPUT'
  | 'FREESTYLE_SELECTION';

/**
 * 🛠️ CreationContextType
 * Contrato global para la gestión del estado de creación.
 * [ACTUALIZACIÓN 3.1]: Se añade progressMetrics para sincronización de UI.
 */
export interface CreationContextType {
  // Estado de navegación
  currentFlowState: FlowState;
  history: FlowState[];

  // Estado de procesamiento IA
  isGeneratingScript: boolean;
  setIsGeneratingScript: (val: boolean) => void;

  // Gestión de datos del formulario
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

  /**
   * progressMetrics
   * [SISTEMA]: Provee los datos calculados para la barra de progreso del Header.
   */
  progressMetrics: {
    step: number;
    total: number;
    percent: number;
    isInitial: boolean;
  };
}

/**
 * 📚 NARRATIVE TYPES
 */
export interface NarrativeOption {
  title: string;
  thesis: string;
}