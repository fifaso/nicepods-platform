/**
 * ARCHIVO: components/geo/forge-context.tsx
 * VERSIÓN: 3.2 (NicePod Forge Context - Type Unified & Asset Guard Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Orquestar la memoria volátil de la forja con persistencia y protección de binarios.
 * [REFORMA V3.2]: Alineación con NarrativeTone/Depth, Guardia 'beforeunload' y Fallback SSR.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer
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
 * I. CONTRATOS DE DATOS (EL ADN DE LA FORJA V3.2)
 * ---------------------------------------------------------------------------
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
  isDirty: boolean; // Flag de modificaciones no persistidas en DB.

  // Fase 1: Anclaje Geográfico
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  categoryId: string;
  resonanceRadius: number;

  // Fase 2: Evidencia Física (Binarios no serializables en SessionStorage)
  heroImageFile: File | null;
  ocrImageFiles: File[];
  ambientAudioBlob: Blob | null;
  intentAudioBlob: Blob | null;

  // Fase 3: Inteligencia Materializada
  ingestedPoiId: number | null;
  ingestionDossier: IngestionDossier | null;

  // Fase 4: Configuración Editorial
  // [FIX V3.2]: Tipos inyectados directamente de la Constitución para evitar TS2345.
  intentText: string;
  depth: NarrativeDepth;
  tone: NarrativeTone;
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
  | { type: 'SET_DEPTH'; payload: NarrativeDepth }
  | { type: 'SET_TONE'; payload: NarrativeTone }
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
        accuracy: action.payload.acc,
        isDirty: true
      };
      
    case 'SET_CATEGORY': return { ...state, categoryId: action.payload, isDirty: true };
    case 'SET_RADIUS': return { ...state, resonanceRadius: action.payload, isDirty: true };
    case 'SET_HERO_IMAGE': return { ...state, heroImageFile: action.payload, isDirty: true };
    
    case 'ADD_OCR_IMAGE':
      if (state.ocrImageFiles.length >= 3) return state; // Límite físico
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
    
    case 'HYDRATE_METADATA': {
      const hydrated = { ...state, ...action.payload };
      /**
       * [FALLBACK DE RESILIENCIA]: 
       * Si hidratamos desde SessionStorage, los objetos File/Blob se habrán perdido (no serializables).
       * Si el Admin estaba en DOSSIER_REVIEW pero el dossier no está en memoria, lo devolvemos
       * a SENSORY_CAPTURE para que re-inserte la foto, evitando un bloqueo en pantalla blanca.
       */
      if (hydrated.currentStep === 'DOSSIER_REVIEW' && !hydrated.ingestionDossier) {
        nicepodLog("⚠️ [ForgeContext] Evidencia volátil perdida. Revirtiendo a captura sensorial.");
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

  /**
   * EFECTO: RECUPERACIÓN T0 (HYDRATION)
   * Restaura textos y coordenadas tras un refresco accidental de página.
   */
  useEffect(() => {
    const saved = sessionStorage.getItem('nicepod_forge_metadata');
    if (saved) {
      try {
        const metadata = JSON.parse(saved);
        nicepodLog("🧠 [ForgeContext] Restaurando metadatos de sesión (Anti-Amnesia).");
        dispatch({ type: 'HYDRATE_METADATA', payload: metadata });
      } catch (e) {
        nicepodLog("⚠️ [ForgeContext] Fallo en hidratación de sesión.", null, 'warn');
      }
    }
  }, []);

  /**
   * EFECTO: PERSISTENCIA SELECTIVA
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
   * EFECTO: GUARDIÁN DE NAVEGACIÓN (ASSET GUARD)
   * Evita que el usuario cierre o recargue la pestaña si tiene binarios (fotos/audio)
   * en RAM que aún no han sido ingestados en Supabase.
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasUnsavedBinaries = state.heroImageFile || state.ambientAudioBlob || state.ocrImageFiles.length > 0;
      const isNotIngested = !state.ingestionDossier;

      if (state.isDirty && hasUnsavedBinaries && isNotIngested) {
        e.preventDefault();
        e.returnValue = ''; // Gatilla el diálogo nativo del navegador ("¿Seguro que quieres salir?")
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.isDirty, state.heroImageFile, state.ambientAudioBlob, state.ocrImageFiles, state.ingestionDossier]);

  /**
   * nextStep: Navegación de Flujo Síncrono
   */
  const nextStep = useCallback(() => {
    switch (state.currentStep) {
      case 'ANCHORING':
        if (state.latitude && state.longitude) {
          dispatch({ type: 'SET_STEP', payload: 'SENSORY_CAPTURE' });
        }
        break;
      case 'SENSORY_CAPTURE':
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

export function useForge() {
  const context = useContext(ForgeContext);
  if (context === undefined) {
    throw new Error("useForge debe invocarse dentro de un ForgeProvider.");
  }
  return context;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.2):
 * 1. Type Alignment: Se importa NarrativeTone y NarrativeDepth de geo-sovereignty
 *    para sellar la compatibilidad estricta con las Server Actions.
 * 2. Asset Guardian: El evento 'beforeunload' protege la evidencia física en 
 *    RAM, advirtiendo al Voyager antes de que destruya sus fotos por accidente.
 * 3. Hydration Fallback: Si se restaura la sesión pero los binarios se perdieron, 
 *    el sistema revierte inteligentemente al Paso 2, evitando el crash fatal.
 */