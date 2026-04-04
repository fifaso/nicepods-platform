/**
 * ARCHIVO: components/geo/forge-context.tsx
 * VERSIÓN: 5.0 (NicePod Forge Context - Sovereign Cortex & Multidimensional Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestar la memoria volátil de la forja con persistencia de alto rendimiento,
 * soportando la nueva taxonomía granular, el reloj histórico y los enlaces de sabiduría.
 * [REFORMA V5.0]: Integración de CategoryMission/Entity, HistoricalEpoch y ReferenceUrl.
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

// --- IMPORTACIÓN DE SOBERANÍA DE TIPOS (BUILD SHIELD V7.5) ---
import { 
  CategoryEntity,
  CategoryMission,
  HistoricalEpoch,
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
  | 'ANCHORING'         // Fase 1: Posicionamiento y Taxonomía Granular.
  | 'SENSORY_CAPTURE'   // Fase 2: Captura Visual, Acústica, Época y Fuentes.
  | 'DOSSIER_REVIEW'    // Fase 3: Auditoría Humana del Peritaje de IA.
  | 'NARRATIVE_FORGE';  // Fase 4: Configuración Editorial del Agente 42.

export interface ForgeState {
  currentStep: ForgeStep;
  isSubmitting: boolean;
  isTranscribing: boolean;
  isDirty: boolean; // Flag de sincronización con Bóveda.

  // Fase 1: Anclaje y Misión
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  categoryMission: CategoryMission | undefined;
  categoryEntity: CategoryEntity | undefined;
  resonanceRadius: number;

  // Fase 2: Evidencia Física (Blobs) e Intelectual
  heroImageFile: File | null;
  ocrImageFiles: File[];
  ambientAudioBlob: Blob | null;
  intentAudioBlob: Blob | null;
  historicalEpoch: HistoricalEpoch | undefined;
  referenceUrl: string;

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
  categoryMission: undefined,
  categoryEntity: undefined,
  resonanceRadius: 35,
  
  heroImageFile: null,
  ocrImageFiles: [],
  ambientAudioBlob: null,
  intentAudioBlob: null,
  historicalEpoch: undefined,
  referenceUrl: "",
  
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
  | { type: 'SET_MISSION'; payload: CategoryMission }
  | { type: 'SET_ENTITY'; payload: CategoryEntity }
  | { type: 'SET_RADIUS'; payload: number }
  | { type: 'SET_HERO_IMAGE'; payload: File | null }
  | { type: 'ADD_OCR_IMAGE'; payload: File }
  | { type: 'REMOVE_OCR_IMAGE'; payload: number }
  | { type: 'SET_AMBIENT_AUDIO'; payload: Blob | null }
  | { type: 'SET_INTENT_AUDIO'; payload: Blob | null }
  | { type: 'SET_EPOCH'; payload: HistoricalEpoch }
  | { type: 'SET_REFERENCE_URL'; payload: string }
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
    case 'SET_MISSION': return { ...state, categoryMission: action.payload, isDirty: true };
    case 'SET_ENTITY': return { ...state, categoryEntity: action.payload, isDirty: true };
    case 'SET_RADIUS': return { ...state, resonanceRadius: action.payload, isDirty: true };
    
    case 'SET_HERO_IMAGE': return { ...state, heroImageFile: action.payload, isDirty: true };
    case 'ADD_OCR_IMAGE':
      if (state.ocrImageFiles.length >= 3) return state; // Límite de carga cognitiva
      return { ...state, ocrImageFiles: [...state.ocrImageFiles, action.payload], isDirty: true };
    case 'REMOVE_OCR_IMAGE':
      return { ...state, ocrImageFiles: state.ocrImageFiles.filter((_, index) => index !== action.payload) };
      
    case 'SET_AMBIENT_AUDIO': return { ...state, ambientAudioBlob: action.payload, isDirty: true };
    case 'SET_INTENT_AUDIO': return { ...state, intentAudioBlob: action.payload, isDirty: true };
    
    case 'SET_EPOCH': return { ...state, historicalEpoch: action.payload, isDirty: true };
    case 'SET_REFERENCE_URL': return { ...state, referenceUrl: action.payload, isDirty: true };
    
    case 'SET_INGESTION_RESULT': return {
      ...state, ingestedPoiId: action.payload.poiId, ingestionDossier: action.payload.dossier, isDirty: true
    };
    
    case 'SET_INTENT': return { ...state, intentText: action.payload, isDirty: true };
    case 'SET_DEPTH': return { ...state, depth: action.payload, isDirty: true };
    case 'SET_TONE': return { ...state, tone: action.payload, isDirty: true };
    case 'SET_HISTORICAL_FACT': return { ...state, historicalFact: action.payload, isDirty: true };
    
    case 'HYDRATE_METADATA': {
      const hydratedState = { ...state, ...action.payload };
      /**
       * [FALLBACK DE RESILIENCIA V5.0]: 
       * Si el usuario refresca la página, los 'Blobs' no se serializan.
       * Si estaba auditando pero perdió el dossier, volvemos a la captura.
       */
      const isMissingDossier = hydratedState.currentStep === 'DOSSIER_REVIEW' && !hydratedState.ingestionDossier;
      const isMissingNarrative = hydratedState.currentStep === 'NARRATIVE_FORGE' && !hydratedState.ingestionDossier;

      if (isMissingDossier || isMissingNarrative) {
        nicepodLog("⚠️ [ForgeContext] Amnesia de binarios detectada. Revirtiendo a Captura Sensorial.");
        hydratedState.currentStep = 'SENSORY_CAPTURE';
      }
      return hydratedState;
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
  const debounceTimerReference = useRef<NodeJS.Timeout | null>(null);

  /**
   * 1. RECUPERACIÓN T0 (Hydration Guard)
   */
  useEffect(() => {
    const savedMetadata = sessionStorage.getItem('nicepod_forge_metadata');
    if (savedMetadata) {
      try {
        const parsedMetadata = JSON.parse(savedMetadata);
        nicepodLog("🧠 [ForgeContext] Restaurando memoria táctica de sesión.");
        dispatch({ type: 'HYDRATE_METADATA', payload: parsedMetadata });
      } catch (error) {
        nicepodLog("⚠️ [ForgeContext] Fallo en hidratación. Iniciando forja limpia.", null, 'warn');
        sessionStorage.removeItem('nicepod_forge_metadata');
      }
    }
  }, []);

  /**
   * 2. PERSISTENCIA DE ALTO RENDIMIENTO (Debounced Sync)
   * [MANDATO V5.0]: Ampliación de campos serializados.
   */
  useEffect(() => {
    if (state.isDirty) {
      if (debounceTimerReference.current) clearTimeout(debounceTimerReference.current);
      
      debounceTimerReference.current = setTimeout(() => {
        const serializableState = {
          currentStep: state.currentStep,
          latitude: state.latitude,
          longitude: state.longitude,
          accuracy: state.accuracy,
          categoryMission: state.categoryMission,
          categoryEntity: state.categoryEntity,
          resonanceRadius: state.resonanceRadius,
          historicalEpoch: state.historicalEpoch,
          referenceUrl: state.referenceUrl,
          intentText: state.intentText,
          depth: state.depth,
          tone: state.tone,
          historicalFact: state.historicalFact,
          ingestedPoiId: state.ingestedPoiId,
          ingestionDossier: state.ingestionDossier
        };
        sessionStorage.setItem('nicepod_forge_metadata', JSON.stringify(serializableState));
      }, 500); 
    }
  }, [state]);

  /**
   * 3. GUARDIÁN DE NAVEGACIÓN (Asset Shield)
   */
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const hasUnsavedBinaries = !!state.heroImageFile || !!state.ambientAudioBlob || !!state.intentAudioBlob || state.ocrImageFiles.length > 0;
      const isNotIngested = !state.ingestionDossier;

      if (state.isDirty && hasUnsavedBinaries && isNotIngested) {
        event.preventDefault();
        event.returnValue = ''; 
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.isDirty, state.heroImageFile, state.ambientAudioBlob, state.intentAudioBlob, state.ocrImageFiles, state.ingestionDossier]);

  /**
   * 4. CONTROL DE TRANSICIÓN DETERMINISTA (FSM Navigation V5.0)
   * Misión: Validar la completitud de la Taxonomía antes de avanzar.
   */
  const nextStep = useCallback(() => {
    switch (state.currentStep) {
      case 'ANCHORING':
        // Guard: GPS + Misión + Entidad (La taxonomía V4.0 es innegociable)
        if (state.latitude !== null && state.longitude !== null && state.categoryMission && state.categoryEntity) {
          dispatch({ type: 'SET_STEP', payload: 'SENSORY_CAPTURE' });
        } else {
          nicepodLog("🛑 [ForgeContext] FSM Rechazo: Taxonomía o GPS incompleto.");
        }
        break;
      case 'SENSORY_CAPTURE':
        // Guard: O bien tenemos el Dossier o tenemos la foto y la Época
        if (state.ingestionDossier || (state.heroImageFile && state.historicalEpoch)) {
          dispatch({ type: 'SET_STEP', payload: 'DOSSIER_REVIEW' });
        } else {
          nicepodLog("🛑 [ForgeContext] FSM Rechazo: Evidencia Hero o Época requerida.");
        }
        break;
      case 'DOSSIER_REVIEW':
        if (state.ingestionDossier) {
          dispatch({ type: 'SET_STEP', payload: 'NARRATIVE_FORGE' });
        }
        break;
      default:
        nicepodLog("🚩 [ForgeContext] Límite final del pipeline de forja.");
    }
  }, [state.currentStep, state.latitude, state.longitude, state.categoryMission, state.categoryEntity, state.heroImageFile, state.historicalEpoch, state.ingestionDossier]);

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
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Multidimensional Expansion: El ForgeState ahora soporta el Reloj Soberano 
 *    (historicalEpoch) y el Puente de Sabiduría (referenceUrl) requeridos para 
 *    alimentar al Agente 42.
 * 2. Strict Progression Shield: 'nextStep' ha sido blindado. El Voyager no puede
 *    llegar a la fase de captura sin haber definido la Misión y la Entidad; ni 
 *    puede llegar a la Auditoría sin haber establecido la Época de la evidencia.
 * 3. RAM Hierarchy: Se inyectó 'intentAudioBlob' en la memoria para soportar el 
 *    Dictado Sensorial del GeoRecorder V3.0 antes de su transcripción.
 */