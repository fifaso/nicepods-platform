// components/geo/forge-context.tsx
// VERSIÓN: 3.0 (NiceCore V2.6 - Sovereign Memory & Step Consolidation Edition)
// Misión: Orquestar el ciclo de vida de captura multimodal simplificando la máquina de estados.
// [ESTABILIZACIÓN]: Eliminación de pasos redundantes (INGESTING/FORGING) para resolver el fallo de renderizado.

"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useReducer
} from "react";

// --- IMPORTACIÓN DE SOBERANÍA DE TIPOS ---
import { IngestionDossier } from "@/types/geo-sovereignty";

/**
 * ---------------------------------------------------------------------------
 * I. CONTRATOS DE DATOS (EL ADN DE LA FORJA V3.0)
 * ---------------------------------------------------------------------------
 */

/**
 * ForgeStep: Define exclusivamente las fases donde se requiere intervención humana.
 * [RESOLUCIÓN TÁCTICA]: Se eliminan INGESTING y FORGING. Son estados de carga, no de paso.
 */
export type ForgeStep =
  | 'ANCHORING'         // Fase 1: Posicionamiento y Categoría.
  | 'SENSORY_CAPTURE'   // Fase 2: Captura Visual y Acústica.
  | 'DOSSIER_REVIEW'    // Fase 3: Auditoría Humana del Peritaje de IA.
  | 'NARRATIVE_FORGE';  // Fase 4: Configuración Editorial del Agente 42.

/**
 * ForgeState: Estructura de memoria volátil del Administrador.
 */
export interface ForgeState {
  currentStep: ForgeStep;
  isSubmitting: boolean;
  isTranscribing: boolean; 

  // Fase 1: Anclaje Geográfico (Soberanía GPS)
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  categoryId: string;
  resonanceRadius: number;

  // Fase 2: Evidencia Física
  heroImageFile: File | null;       
  ocrImageFiles: File[];            
  ambientAudioBlob: Blob | null;    // Paisaje sonoro in situ.
  intentAudioBlob: Blob | null;     // Binario de voz para el Escriba.

  // Fase 3: Inteligencia Materializada (Retorno del Ingestor)
  ingestedPoiId: number | null;     
  ingestionDossier: IngestionDossier | null; 

  // Fase 4: Configuración Editorial (El Oráculo Urbano)
  intentText: string;               
  depth: 'flash' | 'cronica' | 'inmersion';
  tone: 'academico' | 'misterioso' | 'epico' | 'melancolico' | 'neutro';
  historicalFact: string;           // Matiz específico para la forja final.
}

/**
 * ---------------------------------------------------------------------------
 * II. MÁQUINA DE ESTADOS (REDUCER ACTIONS)
 * ---------------------------------------------------------------------------
 */

type ForgeAction =
  | { type: 'SET_STEP'; payload: ForgeStep }
  | { type: 'SET_IS_SUBMITTING'; payload: boolean }
  | { type: 'SET_TRANSCRIBING'; payload: boolean }
  | { type: 'SET_LOCATION'; payload: { lat: number; lng: number; acc: number } }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'SET_RADIUS'; payload: number }
  | { type: 'SET_HERO_IMAGE'; payload: File | null }
  | { type: 'ADD_OCR_IMAGE'; payload: File } 
  | { type: 'REMOVE_OCR_IMAGE'; payload: number } 
  | { type: 'SET_AMBIENT_AUDIO'; payload: Blob | null }
  | { type: 'SET_INTENT_AUDIO'; payload: Blob | null }
  | { type: 'SET_INGESTION_RESULT'; payload: { poiId: number; dossier: IngestionDossier } }
  | { type: 'SET_INTENT'; payload: string }
  | { type: 'SET_DEPTH'; payload: ForgeState['depth'] }
  | { type: 'SET_TONE'; payload: ForgeState['tone'] }
  | { type: 'SET_HISTORICAL_FACT'; payload: string }
  | { type: 'RESET_FORGE' };

const initialState: ForgeState = {
  currentStep: 'ANCHORING',
  isSubmitting: false,
  isTranscribing: false,
  latitude: null,
  longitude: null,
  accuracy: null,
  categoryId: 'historia',
  resonanceRadius: 35,
  heroImageFile: null,
  ocrImageFiles: [], 
  ambientAudioBlob: null,
  intentAudioBlob: null,
  ingestedPoiId: null,
  ingestionDossier: null,
  intentText: "",
  depth: 'cronica',
  tone: 'academico',
  historicalFact: ""
};

/**
 * forgeReducer: Transmutación determinista de la memoria táctica.
 * [RIGOR]: Implementa límites físicos en el array de imágenes OCR.
 */
function forgeReducer(state: ForgeState, action: ForgeAction): ForgeState {
  switch (action.type) {
    case 'SET_STEP': return { ...state, currentStep: action.payload };
    case 'SET_IS_SUBMITTING': return { ...state, isSubmitting: action.payload };
    case 'SET_TRANSCRIBING': return { ...state, isTranscribing: action.payload };
    case 'SET_LOCATION':
      return {
        ...state,
        latitude: action.payload.lat,
        longitude: action.payload.lng,
        accuracy: action.payload.acc
      };
    case 'SET_CATEGORY': return { ...state, categoryId: action.payload };
    case 'SET_RADIUS': return { ...state, resonanceRadius: action.payload };
    case 'SET_HERO_IMAGE': return { ...state, heroImageFile: action.payload };
    case 'ADD_OCR_IMAGE':
      if (state.ocrImageFiles.length >= 3) return state; // Barrera física (Max 3 OCR)
      return { ...state, ocrImageFiles: [...state.ocrImageFiles, action.payload] };
    case 'REMOVE_OCR_IMAGE':
      return { ...state, ocrImageFiles: state.ocrImageFiles.filter((_, i) => i !== action.payload) };
    case 'SET_AMBIENT_AUDIO': return { ...state, ambientAudioBlob: action.payload };
    case 'SET_INTENT_AUDIO': return { ...state, intentAudioBlob: action.payload };
    case 'SET_INGESTION_RESULT': return {
      ...state,
      ingestedPoiId: action.payload.poiId,
      ingestionDossier: action.payload.dossier
    };
    case 'SET_INTENT': return { ...state, intentText: action.payload };
    case 'SET_DEPTH': return { ...state, depth: action.payload };
    case 'SET_TONE': return { ...state, tone: action.payload };
    case 'SET_HISTORICAL_FACT': return { ...state, historicalFact: action.payload };
    case 'RESET_FORGE': return initialState;
    default: return state;
  }
}

/**
 * ---------------------------------------------------------------------------
 * III. CONTEXTO Y PROVEEDOR SOBERANO
 * ---------------------------------------------------------------------------
 */

interface ForgeContextProps {
  state: ForgeState;
  dispatch: React.Dispatch<ForgeAction>;
  nextStep: () => void;
  prevStep: () => void;
}

const ForgeContext = createContext<ForgeContextProps | undefined>(undefined);

export function ForgeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(forgeReducer, initialState);

  /**
   * nextStep: Navegación de Flujo Síncrono (Human-Only).
   * [MEJORA V3.0]: Salto atómico entre fases de decisión, eliminando el 
   * paso por estados técnicos de servidor.
   */
  const nextStep = useCallback(() => {
    switch (state.currentStep) {
      case 'ANCHORING':
        if (state.latitude && state.longitude) {
          dispatch({ type: 'SET_STEP', payload: 'SENSORY_CAPTURE' });
        }
        break;
      case 'SENSORY_CAPTURE':
        if (state.heroImageFile) {
          dispatch({ type: 'SET_STEP', payload: 'DOSSIER_REVIEW' });
        }
        break;
      case 'DOSSIER_REVIEW':
        dispatch({ type: 'SET_STEP', payload: 'NARRATIVE_FORGE' });
        break;
      default:
        nicepodLog("Misión alcanzada: Fin del secuenciador UI.");
    }
  }, [state.currentStep, state.latitude, state.longitude, state.heroImageFile]);

  /**
   * prevStep: Retroceso Táctico.
   */
  const prevStep = useCallback(() => {
    switch (state.currentStep) {
      case 'SENSORY_CAPTURE':
        dispatch({ type: 'SET_STEP', payload: 'ANCHORING' });
        break;
      case 'DOSSIER_REVIEW':
        dispatch({ type: 'SET_STEP', payload: 'SENSORY_CAPTURE' });
        break;
      case 'NARRATIVE_FORGE':
        dispatch({ type: 'SET_STEP', payload: 'DOSSIER_REVIEW' });
        break;
    }
  }, [state.currentStep]);

  return (
    <ForgeContext.Provider value={{ state, dispatch, nextStep, prevStep }}>
      {children}
    </ForgeContext.Provider>
  );
}

/**
 * ---------------------------------------------------------------------------
 * IV. HOOK DE CONSUMO
 * ---------------------------------------------------------------------------
 */
export function useForge() {
  const context = useContext(ForgeContext);
  if (context === undefined) {
    throw new Error("useForge debe ser invocado dentro de un ForgeProvider nominal.");
  }
  return context;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Curación de Estados: Se erradicó el 'INGESTING' de la lógica del Stepper. 
 *    Esto garantiza que 'ScannerUI' nunca renderice null, resolviendo el bug 
 *    de la pantalla blanca en la Fase 3.
 * 2. Atomicidad de Transición: Al usar un switch-case en 'nextStep', forzamos 
 *    un flujo unidireccional y robusto para el Administrador.
 * 3. Preparado para V3.0: La estructura de memoria volátil es ahora compatible 
 *    con el Pipeline JIT de compresión, ya que mantiene los File objects 
 *    separados del resultado de inteligencia (dossier).
 */