// components/geo/forge-context.tsx
// VERSIÓN: 1.1

"use client";

import React, {
  createContext, // [FIX TS2304]: Importación restaurada
  ReactNode,
  useCallback,
  useContext,
  useReducer
} from "react";

/**
 * ---------------------------------------------------------------------------
 * I. CONTRATOS DE DATOS (EL ADN DE LA FORJA)
 * ---------------------------------------------------------------------------
 */

/**
 * ForgeStep: Define las fases del ciclo de vida de la creación de un POI.
 */
export type ForgeStep = 'ANCHORING' | 'EVIDENCE' | 'INTENTION' | 'FORGING';

/**
 * ForgeState: Estructura de datos completa almacenada en la memoria de forja.
 */
export interface ForgeState {
  // Metadatos de Control
  currentStep: ForgeStep;
  isSubmitting: boolean;

  // Fase 1: Anclaje Geográfico
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  categoryId: string;          // Taxonomía: 'historia', 'arte', etc.
  resonanceRadius: number;     // Radio de activación en metros.

  // Fase 2: Evidencia Multimodal
  heroImageBase64: string | null;  // Foto estética del lugar
  ocrImageBase64: string | null;   // Foto de placa/texto (para IA)
  ambientAudioBlob: Blob | null;   // Sonido real del entorno

  // Fase 3: Semilla Narrativa e Intención
  intentText: string;          // Descripción base del Administrador
  depth: 'flash' | 'cronica' | 'inmersion';
  tone: 'academico' | 'misterioso' | 'epico' | 'melancolico' | 'neutro';
  historicalFact: string;      // Frase gancho para la interfaz del usuario
}

/**
 * ---------------------------------------------------------------------------
 * II. MÁQUINA DE ESTADOS (REDUCER ACTIONS)
 * ---------------------------------------------------------------------------
 */

type ForgeAction =
  | { type: 'SET_STEP'; payload: ForgeStep }
  | { type: 'SET_IS_SUBMITTING'; payload: boolean }
  | { type: 'SET_LOCATION'; payload: { lat: number; lng: number; acc: number } }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'SET_RADIUS'; payload: number }
  | { type: 'SET_HERO_IMAGE'; payload: string | null }
  | { type: 'SET_OCR_IMAGE'; payload: string | null }
  | { type: 'SET_AMBIENT_AUDIO'; payload: Blob | null }
  | { type: 'SET_INTENT'; payload: string }
  | { type: 'SET_DEPTH'; payload: ForgeState['depth'] }
  | { type: 'SET_TONE'; payload: ForgeState['tone'] }
  | { type: 'SET_HISTORICAL_FACT'; payload: string }
  | { type: 'RESET_FORGE' };

const initialState: ForgeState = {
  currentStep: 'ANCHORING',
  isSubmitting: false,
  latitude: null,
  longitude: null,
  accuracy: null,
  categoryId: 'historia',
  resonanceRadius: 30,    // Valor estándar NicePod (30m)
  heroImageBase64: null,
  ocrImageBase64: null,
  ambientAudioBlob: null,
  intentText: "",
  depth: 'cronica',       // Predeterminado: 2 minutos de sabiduría
  tone: 'academico',
  historicalFact: ""
};

/**
 * forgeReducer: Procesa mutaciones atómicas sobre el estado de la forja.
 */
function forgeReducer(state: ForgeState, action: ForgeAction): ForgeState {
  switch (action.type) {
    case 'SET_STEP': return { ...state, currentStep: action.payload };
    case 'SET_IS_SUBMITTING': return { ...state, isSubmitting: action.payload };
    case 'SET_LOCATION':
      return {
        ...state,
        latitude: action.payload.lat,
        longitude: action.payload.lng,
        accuracy: action.payload.acc
      };
    case 'SET_CATEGORY': return { ...state, categoryId: action.payload };
    case 'SET_RADIUS': return { ...state, resonanceRadius: action.payload };
    case 'SET_HERO_IMAGE': return { ...state, heroImageBase64: action.payload };
    case 'SET_OCR_IMAGE': return { ...state, ocrImageBase64: action.payload };
    case 'SET_AMBIENT_AUDIO': return { ...state, ambientAudioBlob: action.payload };
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

export function ForgeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(forgeReducer, initialState);

  /**
   * nextStep: Valida la integridad de la fase actual antes de permitir el progreso.
   * [UX]: Actúa como una barrera de calidad para asegurar datos densos.
   */
  const nextStep = useCallback(() => {
    if (state.currentStep === 'ANCHORING') {
      if (!state.latitude || !state.longitude) {
        console.warn("⚠️ [Forge] Bloqueo: Coordenadas GPS no detectadas.");
        return;
      }
      dispatch({ type: 'SET_STEP', payload: 'EVIDENCE' });
    }
    else if (state.currentStep === 'EVIDENCE') {
      if (!state.heroImageBase64) {
        console.warn("⚠️ [Forge] Bloqueo: Imagen principal obligatoria.");
        return;
      }
      dispatch({ type: 'SET_STEP', payload: 'INTENTION' });
    }
  }, [state.currentStep, state.latitude, state.longitude, state.heroImageBase64]);

  /**
   * prevStep: Retroceso seguro entre fases.
   */
  const prevStep = useCallback(() => {
    if (state.currentStep === 'EVIDENCE') dispatch({ type: 'SET_STEP', payload: 'ANCHORING' });
    if (state.currentStep === 'INTENTION') dispatch({ type: 'SET_STEP', payload: 'EVIDENCE' });
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
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Aislamiento de Estado: El uso de 'useReducer' garantiza que el estado de 
 *    la forja sea inmutable, lo cual es crítico al manejar archivos pesados 
 *    como imágenes 4K en base64.
 * 2. Transiciones cinemáticas: Al estar centralizado el paso actual, el 
 *    orquestador de página puede animar los cambios de paso con total suavidad.
 * 3. Escalabilidad Multimodal: La estructura está preparada para añadir 
 *    nuevas fases (ej. Realidad Aumentada) simplemente extendiendo el Reducer.
 */