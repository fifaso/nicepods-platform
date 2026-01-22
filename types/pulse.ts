// types/pulse.ts
// VERSIÓN: 1.0 (Pulse Intelligence Types - DNA, Signals & Matching)

/**
 * 🏷️ CATEGORÍAS DE AUTORIDAD NICEPOD
 * Sincronizado con el Enum 'content_category' de la base de datos.
 */
export type PulseCategory = 'paper' | 'report' | 'news' | 'analysis' | 'trend';

/**
 * 🛰️ PULSE SIGNAL
 * Representa una unidad de conocimiento crudo en el búfer (pulse_staging).
 */
export interface PulseSignal {
  id: string;
  content_hash: string;
  title: string;
  summary: string;
  url: string;
  source_name: string;
  content_type: PulseCategory;
  authority_score: number; // Escala 1.0 a 10.0
  veracity_verified: boolean;
  is_high_value: boolean;
  created_at: string;
  expires_at: string;
}

/**
 * 🎯 PULSE MATCH RESULT
 * Resultado procesado por el 'pulse-matcher'. 
 * Incluye la métrica de relevancia para el usuario específico.
 */
export interface PulseMatchResult extends PulseSignal {
  similarity: number;       // Valor decimal (0 a 1)
  match_percentage: number; // Valor entero (0 a 100) para visualización
  relevance_label: 'Prioritario' | 'Relevante' | 'Exploratorio';
}

/**
 * 🧠 USER COGNITIVE DNA
 * Representa la matriz de intereses e inteligencia del usuario.
 */
export interface UserCognitiveDNA {
  user_id: string;
  dna_vector: number[];        // Vector de 768 dimensiones (Text-embedding-004)
  professional_profile: string; // Resumen de la "Entrevista IA"
  negative_interests: string[]; // Conceptos marcados como "Ruido"
  expertise_level: number;     // Escala 1-10 para profundidad narrativa
  last_updated: string;
  total_pulses_generated: number;
}

/**
 * 📡 RADAR INTERFACE STATE
 * Tipos para la gestión de estado del componente PulseRadarStep.
 */
export interface PulseRadarState {
  signals: PulseMatchResult[];
  selectedIds: string[];
  isLoading: boolean;
  isScanning: boolean; // Estado específico para la animación del radar
  error: string | null;
  lastScanAt: string | null;
}

/**
 * 📊 DNA MAP NODE
 * Estructura para renderizar los intereses en el mapa de calor interactivo.
 */
export interface DNAMapNode {
  id: string;
  label: string;
  weight: number; // Define el tamaño visual del nodo
  x: number;      // Posición en el plano 2D de Framer Motion
  y: number;
  category: 'professional' | 'personal' | 'noise';
}