// components/geo/forge-context.tsx
// VERSIÓN: 2.8 (NicePod Sovereign Memory Manager - Cognitive Seed Edition)
// Misión: Orquestar el ciclo de vida de captura multimodal incluyendo dictado sónico.
// [ESTABILIZACIÓN]: Soporte para intentAudioBlob y estado de transcripción AI.

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
 * I. CONTRATOS DE DATOS (EL ADN DE LA FORJA V2.8)
 * ---------------------------------------------------------------------------
 */

export type ForgeStep =
  | 'ANCHORING'
  | 'SENSORY_CAPTURE'
  | 'INGESTING'
  | 'DOSSIER_REVIEW'
  | 'NARRATIVE_FORGE'
  | 'FORGING';

/**
 * ForgeState: Estructura de memoria volátil del Administrador.
 * Diseñada para soportar la ingesta de datos físicos y cognitivos.
 */
export interface ForgeState {
  currentStep: ForgeStep;
  isSubmitting: boolean;
  isTranscribing: boolean; // [NUEVO]: Indica si la IA está convirtiendo voz a texto

  // Fase 1: Anclaje Geográfico
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  categoryId: string;
  resonanceRadius: number;

  // Fase 2: Evidencia Física (Visual y Acústica)
  heroImageFile: File | null;       
  ocrImageFiles: File[];            
  ambientAudioBlob: Blob | null;    // Sonido real del lugar para el Voyager

  // Fase 2.5: Semilla de Intención (Dictado Admin)
  intentAudioBlob: Blob | null;     // [NUEVO]: Binario de voz para transcripción

  // Fase 3: Inteligencia Retornada de la Ingesta
  ingestedPoiId: number | null;     
  ingestionDossier: IngestionDossier | null; 

  // Fase 4: Configuración Editorial e Intención Final
  intentText: string;               // Texto final corregido por el Admin
  depth: 'flash' | 'cronica' | 'inmersion';
  tone: 'academico' | 'misterioso' | 'epico' | 'melancolico' | 'neutro';
  historicalFact: string;
}

/**
 * ---------------------------------------------------------------------------
 * II. MÁQUINA DE ESTADOS (REDUCER ACTIONS)
 * ---------------------------------------------------------------------------
 */

type ForgeAction =
  | { type: 'SET_STEP'; payload: ForgeStep }
  | { type: 'SET_IS_SUBMITTING'; payload: boolean }
  | { type: 'SET_TRANSCRIBING'; payload: boolean } // [NUEVO]
  | { type: 'SET_LOCATION'; payload: { lat: number; lng: number; acc: number } }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'SET_RADIUS'; payload: number }
  | { type: 'SET_HERO_IMAGE'; payload: File | null }
  | { type: 'ADD_OCR_IMAGE'; payload: File } 
  | { type: 'REMOVE_OCR_IMAGE'; payload: number } 
  | { type: 'SET_AMBIENT_AUDIO'; payload: Blob | null }
  | { type: 'SET_INTENT_AUDIO'; payload: Blob | null } // [NUEVO]
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
  intentAudioBlob: null, // Inicialización nula del dictado
  ingestedPoiId: null,
  ingestionDossier: null,
  intentText: "",
  depth: 'cronica',
  tone: 'academico',
  historicalFact: ""
};

/**
 * forgeReducer: Transmutación determinista de la memoria táctica.
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
      if (state.ocrImageFiles.length >= 3) return state;
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
   * nextStep: Navegación de Flujo Síncrono.
   */
  const nextStep = useCallback(() => {
    if (state.currentStep === 'ANCHORING') {
      if (state.latitude && state.longitude) {
        dispatch({ type: 'SET_STEP', payload: 'SENSORY_CAPTURE' });
      }
    }
    else if (state.currentStep === 'SENSORY_CAPTURE') {
      if (state.heroImageFile) {
        dispatch({ type: 'SET_STEP', payload: 'INGESTING' });
      }
    }
    else if (state.currentStep === 'DOSSIER_REVIEW') {
      dispatch({ type: 'SET_STEP', payload: 'NARRATIVE_FORGE' });
    }
  }, [state.currentStep, state.latitude, state.longitude, state.heroImageFile]);

  /**
   * prevStep: Retroceso Táctico.
   */
  const prevStep = useCallback(() => {
    if (state.currentStep === 'SENSORY_CAPTURE') dispatch({ type: 'SET_STEP', payload: 'ANCHORING' });
    if (state.currentStep === 'DOSSIER_REVIEW') dispatch({ type: 'SET_STEP', payload: 'SENSORY_CAPTURE' });
    if (state.currentStep === 'NARRATIVE_FORGE') dispatch({ type: 'SET_STEP', payload: 'DOSSIER_REVIEW' });
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
 * NOTA TÉCNICA DEL ARCHITECT (V2.8):
 * 1. Protocolo de Transcripción: La inyección de 'intentAudioBlob' y 'isTranscribing' 
 *    permite que la UI del Step 2 maneje un hilo secundario de inteligencia (STT) 
 *    sin contaminar el flujo principal de subida de imágenes.
 * 2. Soberanía Editorial: Al centralizar 'intentText' como receptor de la 
 *    transcripción, aseguramos que el Administrador siempre pueda editar el 
 *    resultado antes de enviarlo al Agente 42.
 * 3. Atomicidad: La acción 'RESET_FORGE' ahora purga también los binarios de 
 *    dictado, garantizando que no existan fugas de contexto entre misiones.
 */