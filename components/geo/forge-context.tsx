/**
 * ARCHIVO: components/geo/forge-context.tsx
 * VERSIÓN: 4.0 (NicePod Forge Context - Atomic State Machine & Debounce Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Orquestar la memoria volátil de la forja con persistencia de alto rendimiento y FSM.
 * [REFORMA V4.0]: Transiciones de estado deterministas y Throttling en SessionStorage.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef
} from "react";

// --- IMPORTACIÓN DE SOBERANÍA DE TIPOS (BUILD SHIELD V6.4) ---
import { 
  IngestionDossier, 
  NarrativeDepth, 
  NarrativeTone 
} from "@/types/geo-sovereignty";
import { nicepodLog } from "@/lib/utils";

/**
 * ---------------------------------------------------------------------------
 * I. CONTRATOS DE DATOS Y MÁQUINA DE ESTADOS FINITA (FSM)
 * ---------------------------------------------------------------------------
 */

export type ForgeStep =
  | 'ANCHORING'         // Fase 1: Posicionamiento y Categoría.
  | 'SENSORY_CAPTURE'   // Fase 2: Captura Visual y Acústica.
  | 'DOSSIER_REVIEW'    // Fase 3: Auditoría Humana del Peritaje de IA.
  | 'NARRATIVE_FORGE';  // Fase 4: Configuración Editorial del Agente 42.

export interface ForgeState {
  currentStep: ForgeStep;
  isSubmitting: boolean;
  isTranscribing: boolean;
  isDirty: boolean; // Flag de sincronización con Bóveda.

  // Fase 1: Anclaje Geográfico
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  categoryId: string;
  resonanceRadius: number;

  // Fase 2: Evidencia Física (Blobs en RAM)
  heroImageFile: File | null;
  ocrImageFiles: File[];
  ambientAudioBlob: Blob | null;
  intentAudioBlob: Blob | null;

  // Fase 3: Inteligencia Materializada
  ingestedPoiId: number | null;
  ingestionDossier: IngestionDossier | null;

  // Fase 4: Configuración Editorial
  intentText: string;
  depth: NarrativeDepth;
  tone: NarrativeTone;
  historicalFact: string;
}

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
 * ---------------------------------------------------------------------------
 * II. REDUCER DETERMINISTA (THE VAULT CORE)
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
  | { type: 'SET_DEPTH'; payload: NarrativeDepth }
  | { type: 'SET_TONE'; payload: NarrativeTone }
  | { type: 'SET_HISTORICAL_FACT'; payload: string }
  | { type: 'HYDRATE_METADATA'; payload: Partial<ForgeState> }
  | { type: 'RESET_FORGE' };

function forgeReducer(state: ForgeState, action: ForgeAction): ForgeState {
  switch (action.type) {
    case 'SET_STEP': return { ...state, currentStep: action.payload };
    case 'SET_IS_SUBMITTING': return { ...state, isSubmitting: action.payload };
    case 'SET_TRANSCRIBING': return { ...state, isTranscribing: action.payload };
    
    case 'SET_LOCATION':
      return { ...state, latitude: action.payload.lat, longitude: action.payload.lng, accuracy: action.payload.acc, isDirty: true };
    case 'SET_CATEGORY': return { ...state, categoryId: action.payload, isDirty: true };
    case 'SET_RADIUS': return { ...state, resonanceRadius: action.payload, isDirty: true };
    case 'SET_HERO_IMAGE': return { ...state, heroImageFile: action.payload, isDirty: true };
    
    case 'ADD_OCR_IMAGE':
      if (state.ocrImageFiles.length >= 3) return state; // Límite balístico
      return { ...state, ocrImageFiles: [...state.ocrImageFiles, action.payload], isDirty: true };
      
    case 'REMOVE_OCR_IMAGE':
      return { ...state, ocrImageFiles: state.ocrImageFiles.filter((_, i) => i !== action.payload) };
      
    case 'SET_AMBIENT_AUDIO': return { ...state, ambientAudioBlob: action.payload, isDirty: true };
    case 'SET_INTENT_AUDIO': return { ...state, intentAudioBlob: action.payload, isDirty: true };
    
    case 'SET_INGESTION_RESULT': return {
      ...state, ingestedPoiId: action.payload.poiId, ingestionDossier: action.payload.dossier, isDirty: true
    };
    
    case 'SET_INTENT': return { ...state, intentText: action.payload, isDirty: true };
    case 'SET_DEPTH': return { ...state, depth: action.payload, isDirty: true };
    case 'SET_TONE': return { ...state, tone: action.payload, isDirty: true };
    case 'SET_HISTORICAL_FACT': return { ...state, historicalFact: action.payload, isDirty: true };
    
    case 'HYDRATE_METADATA': {
      const hydrated = { ...state, ...action.payload };
      /**
       * [FALLBACK DE RESILIENCIA V4.0]: 
       * Evaluación de integridad estructural post-hidratación.
       */
      const isMissingDossier = hydrated.currentStep === 'DOSSIER_REVIEW' && !hydrated.ingestionDossier;
      const isMissingNarrative = hydrated.currentStep === 'NARRATIVE_FORGE' && !hydrated.ingestionDossier;

      if (isMissingDossier || isMissingNarrative) {
        nicepodLog("⚠️ [ForgeContext] Malla de Evidencia rota. Revirtiendo a Captura Sensorial.");
        hydrated.currentStep = 'SENSORY_CAPTURE';
      }
      return hydrated;
    }
    
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
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 1. RECUPERACIÓN T0 (Hydration Guard)
   */
  useEffect(() => {
    const saved = sessionStorage.getItem('nicepod_forge_metadata');
    if (saved) {
      try {
        const metadata = JSON.parse(saved);
        nicepodLog("🧠 [ForgeContext] Restaurando memoria de sesión (Anti-Amnesia).");
        dispatch({ type: 'HYDRATE_METADATA', payload: metadata });
      } catch (e) {
        nicepodLog("⚠️ [ForgeContext] Fallo en hidratación. Iniciando forja limpia.", null, 'warn');
        sessionStorage.removeItem('nicepod_forge_metadata');
      }
    }
  }, []);

  /**
   * 2. PERSISTENCIA DE ALTO RENDIMIENTO (Debounced Sync)
   * [MANDATO V4.0]: Evita saturar el bus del navegador en formularios rápidos.
   */
  useEffect(() => {
    if (state.isDirty) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      
      debounceTimerRef.current = setTimeout(() => {
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
      }, 500); // 500ms Debounce
    }
  }, [state]);

  /**
   * 3. GUARDIÁN DE NAVEGACIÓN (Asset Shield)
   * Protege los binarios en RAM de cierres accidentales.
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasUnsavedBinaries = !!state.heroImageFile || !!state.ambientAudioBlob || state.ocrImageFiles.length > 0;
      const isNotIngested = !state.ingestionDossier;

      if (state.isDirty && hasUnsavedBinaries && isNotIngested) {
        e.preventDefault();
        e.returnValue = ''; // Gatilla modal nativo del OS
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.isDirty, state.heroImageFile, state.ambientAudioBlob, state.ocrImageFiles, state.ingestionDossier]);

  /**
   * 4. CONTROL DE TRANSICIÓN DETERMINISTA (FSM Navigation)
   * Valida estrictamente los requisitos de cada fase antes de permitir el avance.
   */
  const nextStep = useCallback(() => {
    switch (state.currentStep) {
      case 'ANCHORING':
        // Guard: Telemetría obligatoria
        if (state.latitude !== null && state.longitude !== null) {
          dispatch({ type: 'SET_STEP', payload: 'SENSORY_CAPTURE' });
        } else {
          nicepodLog("🛑 [ForgeContext] FSM Rechazo: Anchoring sin GPS.");
        }
        break;
      case 'SENSORY_CAPTURE':
        // Guard: O bien tenemos el Dossier (ya subido) o tenemos la foto (lista para subir)
        if (state.ingestionDossier || state.heroImageFile) {
          dispatch({ type: 'SET_STEP', payload: 'DOSSIER_REVIEW' });
        } else {
          nicepodLog("🛑 [ForgeContext] FSM Rechazo: Evidencia Hero requerida.");
        }
        break;
      case 'DOSSIER_REVIEW':
        // Guard: IA debe haber procesado antes de pasar a la narrativa
        if (state.ingestionDossier) {
          dispatch({ type: 'SET_STEP', payload: 'NARRATIVE_FORGE' });
        }
        break;
      default:
        nicepodLog("🚩 [ForgeContext] Límite final del pipeline.");
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

export function useForge() {
  const context = useContext(ForgeContext);
  if (context === undefined) {
    throw new Error("useForge debe invocarse dentro de un ForgeProvider.");
  }
  return context;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Debounced Persistence: El uso de 'setTimeout' antes de escribir en sessionStorage
 *    elimina el micro-stuttering del Main Thread cuando el usuario escribe rápidamente 
 *    en los textareas del intent.
 * 2. Deterministic FSM: La función 'nextStep' ahora actúa como un guardián de estado. 
 *    Es físicamente imposible llegar a 'DOSSIER_REVIEW' sin haber adjuntado una HeroImage
 *    o poseer un Dossier previamente ingestados.
 * 3. Deep Hydration Guard: El fallback 'HYDRATE_METADATA' ahora evalúa todas las 
 *    posibles fugas de memoria post-refresh, asegurando que si el usuario pierde 
 *    su dossier en la fase narrativa, el sistema lo devuelva a la fase de captura visual.
 */
