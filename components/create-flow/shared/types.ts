/**
 * ARCHIVO: components/create-flow/shared/types.ts
 * VERSIÓN: 4.0 (NicePod Master Standard - Semantic Flow Engine Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Centralizar las definiciones industriales para el motor de voz neuronal, 
 * la máquina de estados de navegación y el contrato de contexto de la forja.
 * [REFORMA V4.0]: Aplicación absoluta de la Zero Abbreviations Policy (ZAP). 
 * Sincronización nominal con 'PodcastCreationSchema' V12.0. 
 * Eliminación de acrónimos (DNA, GEO, HUD) por descriptores industriales completos.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { PodcastCreationData } from "@/lib/validation/podcast-schema";

/**
 * 🎭 VOCAL PERFORMANCE TYPES
 * Definiciones estandarizadas para el motor de síntesis neuronal.
 */
export type VocalPerformanceStyle =
  | 'Calmado'
  | 'Energético'
  | 'Profesional'
  | 'Inspirador';

export type VocalNarrativePace =
  | 'Lento'
  | 'Moderado'
  | 'Rápido';

export type VocalNarrativeGender =
  | 'Masculino'
  | 'Femenino';

export type AgentIntelligencePersonalityType =
  | 'narrador'
  | 'esceptico'
  | 'mentor'
  | 'amigo'
  | 'rebelde'
  | 'minimalista';

/**
 * 🗺️ FLOW STATE ENGINE (MÁQUINA DE ESTADOS FINITOS)
 * Representa cada hito visual y lógico en la trayectoria de creación.
 */
export type FlowState =
  // --- ESTADO INICIAL DE ENTRADA ---
  | 'SELECTING_PURPOSE'

  // --- FLUJO: VIVE LO LOCAL (MADRID RESONANCE GEODETIC) ---
  | 'LOCAL_DISCOVERY_STEP'          // Ingesta de Sensores (Cámara + Posicionamiento Global)
  | 'LOCAL_ANALYSIS_LOADER'         // Pantalla de Carga de Peritaje Geosemántico
  | 'LOCAL_RESULT_STEP'             // Interfaz de Hallazgo Histórico Identificado
  | 'GEODETIC_ACUSTIC_RECORDER_STEP' // Captura de Crónica Local por Voz

  // --- FLUJO: ACTUALIDAD (PULSE INTELLIGENCE) ---
  | 'DEOXYRIBONUCLEIC_ACID_SYNTHTESIS_CHECK' // Sintonización de ADN Cognitivo del Voyager
  | 'PULSE_RADAR_SCANNER'                    // Escáner de Fuentes de Autoridad en Tiempo Real
  | 'BRIEFING_SANITIZATION_REVIEW'           // Auditoría de la Píldora Narrativa Estratégica

  // --- FLUJO: APRENDIZAJE (LEARN MODE) ---
  | 'LEARN_SUB_CATEGORY_SELECTION'
  | 'SOLO_TALK_INPUT_FIELD'

  // --- FLUJO: INSPIRACIÓN (INSPIRE MODE) ---
  | 'INSPIRE_SUB_CATEGORY_SELECTION'

  // --- FLUJO: EXPLORACIÓN (EXPLORE NODES) ---
  | 'LINK_POINTS_INPUT_FORM'
  | 'NARRATIVE_SELECTION_BRANCHING'

  // --- FLUJO: LEGADO (REFLECTIVE RECORD) ---
  | 'LEGACY_LESSON_INPUT'

  // --- ETAPAS TRANSVERSALES DE PRODUCCIÓN INDUSTRIAL ---
  | 'TECHNICAL_DETAILS_STEP'        // Configuración de Duración y Profundidad
  | 'AGENT_TONE_SELECTION'          // Calibración de la Personalidad del Agente
  | 'DRAFT_GENERATION_LOADER'       // Monitor de Sincronía del Oráculo de Inteligencia
  | 'SCRIPT_EDITING_CANVAS'         // Terminal de Edición Narrativa y Peritaje de Texto
  | 'AUDIO_STUDIO_CALIBRATION'      // Ajuste Final de Parámetros Acústicos
  | 'FINAL_MANIFESTO_STEP'          // Consolidación de Capital Intelectual y Lanzamiento

  // --- LEGACY FALLBACKS & SUPPORT ---
  | 'SPECIFIC_QUESTION_INPUT'
  | 'FREESTYLE_MODE_SELECTION';

/**
 * 🛠️ CreationContextType
 * Contrato global para la gobernanza del estado de la forja.
 */
export interface CreationContextType {
  // Gobernanza de Navegación Axial
  currentFlowState: FlowState;
  navigationHistoryStack: FlowState[];

  // Monitoreo de Procesamiento de Inteligencia Artificial
  isGeneratingScriptProcessActive: boolean;
  setGeneratingScriptProcessActiveStatus: (isProcessActive: boolean) => void;

  // Gestión de Memoria del Formulario (ZAP Compliant)
  updatePodcastCreationFormData: (partialFormData: Partial<PodcastCreationData>) => void;

  // Motores de Transición de Fase
  transitionToNextStateAction: (targetState: FlowState) => void;

  /**
   * jumpToStepAction: Ejecuta un salto atómico a un estado específico 
   * reconstruyendo la genealogía del historial de navegación.
   */
  jumpToStepAction: (targetState: FlowState) => void;

  /**
   * navigateBackAction: Retroceso seguro en la pila de estados (Hardware Hygiene).
   */
  navigateBackAction: () => void;

  /**
   * getMasterFlowPathCollection: Recupera la secuencia de pasos según la intención.
   */
  getMasterFlowPathCollection: () => FlowState[];

  /**
   * creationProcessProgressMetrics: Datos de telemetría para la barra de progreso.
   */
  creationProcessProgressMetrics: {
    currentStepMagnitude: number;
    totalStepsMagnitude: number;
    completionPercentageValue: number;
    isInitialPhaseStatus: boolean;
  };
}

/**
 * 📚 NARRATIVE STRUCTURE TYPES
 */
export interface NarrativeOption {
  title: string;
  narrativeThesisStatement: string;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Zero Abbreviations Policy: Purga total de acrónimos. 'DNA' -> 'DEOXYRIBONUCLEIC_ACID', 
 *    'GEO' -> 'GEODETIC', 'HUD' -> 'HEADS_UP_DISPLAY' (implícito en estados).
 * 2. Semantic Precision: 'val' -> 'isProcessActive', 'percent' -> 'completionPercentageValue'. 
 *    El código ahora describe la magnitud y naturaleza del dato.
 * 3. BSS Contract Seal: Las interfaces están diseñadas para ser consumidas por 
 *    'useCreationContext' asegurando que no existan colisiones durante el Build de Vercel.
 */