/**
 * ARCHIVO: components/geo/forge-context.tsx
 * VERSIÓN: 3.1 (NicePod Forge Context - Persistence & Dirty-State Guard Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Orquestar la memoria volátil de la forja con persistencia de metadatos.
 * [REFORMA V3.1]: Implementación de isDirty, unificación taxonómica y persistencia en sessionStorage.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useMemo
} from "react";

// --- IMPORTACIÓN DE SOBERANÍA DE TIPOS ---
import { IngestionDossier } from "@/types/geo-sovereignty";
import { nicepodLog } from "@/lib/utils";

/**
 * ---------------------------------------------------------------------------
 * I. CONTRATOS DE DATOS (EL ADN DE LA FORJA V3.1)
 * ---------------------------------------------------------------------------
 */

export type ForgeStep =
  | 'ANCHORING'         // Fase 1: Posicionamiento y Categoría.
  | 'SENSORY_CAPTURE'   // Fase 2: Captura Visual y Acústica.
  | 'DOSSIER_REVIEW'    // Fase 3: Auditoría Humana.
  | 'NARRATIVE_FORGE';  // Fase 4: Configuración Editorial.

/**
 * ForgeState: Estructura de memoria volátil del Administrador.
 * [V3.1]: Se añade isDirty para gobernanza de UI y persistencia de metadatos.
 */
export interface ForgeState {
  currentStep: ForgeStep;
  isSubmitting: boolean;
  isTranscribing: boolean;
  isDirty: boolean; // Indica si hay datos capturados sin persistir en la Bóveda NKV.

  // Fase 1: Anclaje Geográfico
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  categoryId: string;
  resonanceRadius: number;

  // Fase 2: Evidencia Física (Objetos no serializables)
  heroImageFile: File | null;
  ocrImageFiles: File[];
  ambientAudioBlob: Blob | null;
  intentAudioBlob: Blob | null;

  // Fase 3: Inteligencia Materializada
  ingestedPoiId: number | null;
  ingestionDossier: IngestionDossier | null;

  // Fase 4: Configuración Editorial
  // Taxonomía Unificada: 'academico' | 'misterioso' | 'epico' | 'neutro'
  intentText: string;
  depth: 'flash' | 'cronica' | 'inmersion';
  tone: 'academico' | 'misterioso' | 'epico' | 'neutro';
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
  | { type: 'HYDRATE_METADATA'; payload: Partial<ForgeState> }
  | { type: 'RESET_FORGE' };

const initialState: ForgeState = {
  currentStep: 'ANCHORING',
  isSubmitting: false,
  isTranscribing: false,
  isDirty: false,
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
 * forgeReducer: Transmutación de la memoria táctica.
 * [V3.1]: Se añade lógica de marcado isDirty automático.
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
        accuracy: action.payload.acc,
        isDirty: true
      };
      
    case 'SET_CATEGORY': return { ...state, categoryId: action.payload, isDirty: true };
    case 'SET_RADIUS': return { ...state, resonanceRadius: action.payload, isDirty: true };
    case 'SET_HERO_IMAGE': return { ...state, heroImageFile: action.payload, isDirty: true };
    
    case 'ADD_OCR_IMAGE':
      if (state.ocrImageFiles.length >= 3) return state;
      return { ...state, ocrImageFiles: [...state.ocrImageFiles, action.payload], isDirty: true };
      
    case 'REMOVE_OCR_IMAGE':
      return { ...state, ocrImageFiles: state.ocrImageFiles.filter((_, i) => i !== action.payload) };
      
    case 'SET_AMBIENT_AUDIO': return { ...state, ambientAudioBlob: action.payload, isDirty: true };
    case 'SET_INTENT_AUDIO': return { ...state, intentAudioBlob: action.payload, isDirty: true };
    
    case 'SET_INGESTION_RESULT': return {
      ...state,
      ingestedPoiId: action.payload.poiId,
      ingestionDossier: action.payload.dossier,
      isDirty: true
    };
    
    case 'SET_INTENT': return { ...state, intentText: action.payload, isDirty: true };
    case 'SET_DEPTH': return { ...state, depth: action.payload, isDirty: true };
    case 'SET_TONE': return { ...state, tone: action.payload, isDirty: true };
    case 'SET_HISTORICAL_FACT': return { ...state, historicalFact: action.payload, isDirty: true };
    
    case 'HYDRATE_METADATA': return { ...state, ...action.payload };
    case 'RESET_FORGE': 
      if (typeof window !== 'undefined') sessionStorage.removeItem('nicepod_forge_metadata');
      return initialState;
      
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
   * EFECTO: RECUPERACIÓN T0 (HYDRATION)
   * Intenta restaurar metadatos desde sessionStorage para mitigar recargas accidentales.
   */
  useEffect(() => {
    const saved = sessionStorage.getItem('nicepod_forge_metadata');
    if (saved) {
      try {
        const metadata = JSON.parse(saved);
        nicepodLog("🧠 [ForgeContext] Restaurando metadatos de sesión.");
        dispatch({ type: 'HYDRATE_METADATA', payload: metadata });
      } catch (e) {
        nicepodLog("⚠️ [ForgeContext] Fallo en hidratación de sesión.");
      }
    }
  }, []);

  /**
   * EFECTO: PERSISTENCIA SELECTIVA
   * Mantiene los metadatos sincronizados con el Storage. 
   * Blobs y Files se omiten por limitaciones de serialización.
   */
  useEffect(() => {
    if (state.isDirty) {
      const serializableState = {
        currentStep: state.currentStep,
        latitude: state.latitude,
        longitude: state.longitude,
        accuracy: state.accuracy,
        categoryId: state.categoryId,
        resonanceRadius: state.resonanceRadius,
        intentText: state.intentText,
        depth: state.depth,
        tone: state.tone,
        historicalFact: state.historicalFact,
        ingestedPoiId: state.ingestedPoiId,
        ingestionDossier: state.ingestionDossier
      };
      sessionStorage.setItem('nicepod_forge_metadata', JSON.stringify(serializableState));
    }
  }, [state]);

  /**
   * nextStep: Navegación por fases.
   */
  const nextStep = useCallback(() => {
    switch (state.currentStep) {
      case 'ANCHORING':
        if (state.latitude && state.longitude) {
          dispatch({ type: 'SET_STEP', payload: 'SENSORY_CAPTURE' });
        }
        break;
      case 'SENSORY_CAPTURE':
        // Avanza si el dossier ya existe o si el Hero Image está presente
        if (state.ingestionDossier || state.heroImageFile) {
          dispatch({ type: 'SET_STEP', payload: 'DOSSIER_REVIEW' });
        }
        break;
      case 'DOSSIER_REVIEW':
        dispatch({ type: 'SET_STEP', payload: 'NARRATIVE_FORGE' });
        break;
      default:
        nicepodLog("🚩 [ForgeContext] Fin del secuenciador.");
    }
  }, [state.currentStep, state.latitude, state.longitude, state.heroImageFile, state.ingestionDossier]);

  const prevStep = useCallback(() => {
    switch (state.currentStep) {
      case 'SENSORY_CAPTURE': dispatch({ type: 'SET_STEP', payload: 'ANCHORING' }); break;
      case 'DOSSIER_REVIEW': dispatch({ type: 'SET_STEP', payload: 'SENSORY_CAPTURE' }); break;
      case 'NARRATIVE_FORGE': dispatch({ type: 'SET_STEP', payload: 'DOSSIER_REVIEW' }); break;
    }
  }, [state.currentStep]);

  return (
    <ForgeContext.Provider value={{ state, dispatch, nextStep, prevStep }}>
      {children}
    </ForgeContext.Provider>
  );
}

/**
 * useForge: Hook soberano de consumo.
 */
export function useForge() {
  const context = useContext(ForgeContext);
  if (context === undefined) {
    throw new Error("useForge debe invocarse dentro de un ForgeProvider.");
  }
  return context;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.1):
 * 1. Dirty-State Logic: El flag isDirty permite al sistema saber que existen datos 
 *    volátiles, activando la persistencia en sessionStorage y preparando el 
 *    camino para avisos de navegación.
 * 2. Unrestricted Re-Hydration: Si el Administrador refresca la app, recuperará
 *    su posición, intenciones y peritaje previo, exigiendo solo re-subir los binarios.
 * 3. Unified Editorial Taxonomy: Los tonos se han alineado con el Agente 42 
 *    (academico, misterioso, epico, neutro), erradicando fallos de sintonía IA.
 * 4. Step Resilience: Se optimizó 'nextStep' para permitir el bypass de captura 
 *    si el dossier ya fue materializado en un intento previo de la misma sesión.
 */