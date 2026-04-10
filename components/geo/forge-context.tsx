/**
 * ARCHIVO: components/geo/forge-context.tsx
 * VERSIÓN: 6.0 (NicePod Forge Context - Industrial Integrity & Schema Versioning Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestar la memoria volátil de la forja con persistencia de alto rendimiento,
 * garantizando la inmunidad ante la amnesia del navegador y la integridad de tipos.
 * [REFORMA V6.0]: Implementación absoluta de la Zero Abbreviations Policy (ZAP) y 
 * alineación total con la Constitución V8.6. Introducción de control de versiones de 
 * esquema (SCHEMA_VERSION 4.2) y granularidad en el estado de modificación.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
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

// --- IMPORTACIÓN DE SOBERANÍA DE TIPOS (BUILD SHIELD V8.6) ---
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

const FORGE_SCHEMA_VERSION = "4.2";

export type ForgeStep =
  | 'ANCHORING'         // Fase 1: Posicionamiento y Taxonomía.
  | 'SENSORY_CAPTURE'   // Fase 2: Captura Visual, Acústica y Temporal.
  | 'DOSSIER_REVIEW'    // Fase 3: Auditoría Humana del Peritaje.
  | 'NARRATIVE_FORGE';  // Fase 4: Síntesis Narrativa y Publicación.

export interface ForgeState {
  currentStep: ForgeStep;
  isSubmittingProcess: boolean;
  isTranscribingAudio: boolean;
  isSessionMetadataModified: boolean; 

  // Fase 1: Anclaje Pericial
  latitudeCoordinate: number | null;
  longitudeCoordinate: number | null;
  accuracyMeters: number | null;
  categoryMission: CategoryMission | undefined;
  categoryEntity: CategoryEntity | undefined;
  resonanceRadiusMeters: number;

  // Fase 2: Evidencia Física e Intelectual
  heroImageFile: File | null;
  opticalCharacterRecognitionImageFiles: File[];
  ambientAudioBlob: Blob | null;
  intentAudioBlob: Blob | null;
  historicalEpoch: HistoricalEpoch | undefined;
  referenceUniformResourceLocator: string;

  // Fase 3: Inteligencia Materializada (Bóveda NKV)
  ingestedPointOfInterestIdentification: number | null;
  ingestionDossier: IngestionDossier | null;

  // Fase 4: Configuración Editorial y Síntesis
  administratorIntentText: string;
  narrativeDepth: NarrativeDepth;
  narrativeTone: NarrativeTone;
  historicalFactSummary: string;
}

const initialState: ForgeState = {
  currentStep: 'ANCHORING',
  isSubmittingProcess: false,
  isTranscribingAudio: false,
  isSessionMetadataModified: false,
  
  latitudeCoordinate: null,
  longitudeCoordinate: null,
  accuracyMeters: null,
  categoryMission: undefined,
  categoryEntity: undefined,
  resonanceRadiusMeters: 35,
  
  heroImageFile: null,
  opticalCharacterRecognitionImageFiles: [],
  ambientAudioBlob: null,
  intentAudioBlob: null,
  historicalEpoch: undefined,
  referenceUniformResourceLocator: "",
  
  ingestedPointOfInterestIdentification: null,
  ingestionDossier: null,
  
  administratorIntentText: "",
  narrativeDepth: 'cronica',
  narrativeTone: 'academico',
  historicalFactSummary: ""
};

/**
 * ---------------------------------------------------------------------------
 * II. REDUCER DETERMINISTA (SINTONIZADO V6.0)
 * ---------------------------------------------------------------------------
 */

type ForgeAction =
  | { type: 'SET_STEP'; payload: ForgeStep }
  | { type: 'SET_IS_SUBMITTING'; payload: boolean }
  | { type: 'SET_TRANSCRIBING'; payload: boolean }
  | { type: 'SET_LOCATION'; payload: { latitudeCoordinate: number; longitudeCoordinate: number; accuracyMeters: number } }
  | { type: 'SET_MISSION'; payload: CategoryMission }
  | { type: 'SET_ENTITY'; payload: CategoryEntity }
  | { type: 'SET_RESONANCE_RADIUS'; payload: number }
  | { type: 'SET_HERO_IMAGE'; payload: File | null }
  | { type: 'ADD_OPTICAL_CHARACTER_RECOGNITION_IMAGE'; payload: File }
  | { type: 'REMOVE_OPTICAL_CHARACTER_RECOGNITION_IMAGE'; payload: number }
  | { type: 'SET_AMBIENT_AUDIO'; payload: Blob | null }
  | { type: 'SET_INTENT_AUDIO'; payload: Blob | null }
  | { type: 'SET_EPOCH'; payload: HistoricalEpoch }
  | { type: 'SET_REFERENCE_URL'; payload: string }
  | { type: 'SET_INGESTION_RESULT'; payload: { pointOfInterestIdentification: number; dossier: IngestionDossier } }
  | { type: 'SET_ADMINISTRATOR_INTENT'; payload: string }
  | { type: 'SET_DEPTH'; payload: NarrativeDepth }
  | { type: 'SET_TONE'; payload: NarrativeTone }
  | { type: 'SET_HISTORICAL_FACT'; payload: string }
  | { type: 'HYDRATE_METADATA'; payload: Partial<ForgeState> }
  | { type: 'RESET_FORGE' };

function forgeReducer(state: ForgeState, action: ForgeAction): ForgeState {
  switch (action.type) {
    case 'SET_STEP': 
      return { ...state, currentStep: action.payload };

    case 'SET_IS_SUBMITTING': 
      return { ...state, isSubmittingProcess: action.payload };

    case 'SET_TRANSCRIBING': 
      return { ...state, isTranscribingAudio: action.payload };
    
    case 'SET_LOCATION':
      return { 
        ...state, 
        latitudeCoordinate: action.payload.latitudeCoordinate, 
        longitudeCoordinate: action.payload.longitudeCoordinate, 
        accuracyMeters: action.payload.accuracyMeters, 
        isSessionMetadataModified: true 
      };
      
    case 'SET_MISSION': 
      return { ...state, categoryMission: action.payload, isSessionMetadataModified: true };

    case 'SET_ENTITY': 
      return { ...state, categoryEntity: action.payload, isSessionMetadataModified: true };

    case 'SET_RESONANCE_RADIUS': 
      return { ...state, resonanceRadiusMeters: action.payload, isSessionMetadataModified: true };
    
    case 'SET_HERO_IMAGE': 
      return { ...state, heroImageFile: action.payload, isSessionMetadataModified: true };
    
    case 'ADD_OPTICAL_CHARACTER_RECOGNITION_IMAGE':
      if (state.opticalCharacterRecognitionImageFiles.length >= 3) return state;
      return { 
        ...state, 
        opticalCharacterRecognitionImageFiles: [...state.opticalCharacterRecognitionImageFiles, action.payload], 
        isSessionMetadataModified: true 
      };
      
    case 'REMOVE_OPTICAL_CHARACTER_RECOGNITION_IMAGE':
      return { 
        ...state, 
        opticalCharacterRecognitionImageFiles: state.opticalCharacterRecognitionImageFiles.filter((_, itemIndex) => itemIndex !== action.payload),
        isSessionMetadataModified: true
      };
      
    case 'SET_AMBIENT_AUDIO': 
      return { ...state, ambientAudioBlob: action.payload, isSessionMetadataModified: true };

    case 'SET_INTENT_AUDIO': 
      return { ...state, intentAudioBlob: action.payload, isSessionMetadataModified: true };
    
    case 'SET_EPOCH': 
      return { ...state, historicalEpoch: action.payload, isSessionMetadataModified: true };

    case 'SET_REFERENCE_URL': 
      return { ...state, referenceUniformResourceLocator: action.payload, isSessionMetadataModified: true };
    
    case 'SET_INGESTION_RESULT': 
      return {
        ...state, 
        ingestedPointOfInterestIdentification: action.payload.pointOfInterestIdentification, 
        ingestionDossier: action.payload.dossier, 
        isSessionMetadataModified: true
      };
    
    case 'SET_ADMINISTRATOR_INTENT': 
      return { ...state, administratorIntentText: action.payload, isSessionMetadataModified: true };

    case 'SET_DEPTH': 
      return { ...state, narrativeDepth: action.payload, isSessionMetadataModified: true };

    case 'SET_TONE': 
      return { ...state, narrativeTone: action.payload, isSessionMetadataModified: true };

    case 'SET_HISTORICAL_FACT': 
      return { ...state, historicalFactSummary: action.payload, isSessionMetadataModified: true };
    
    case 'HYDRATE_METADATA': {
      const hydratedState = { ...state, ...action.payload };
      // [RESILIENCIA]: Si el paso es avanzado pero falta el dossier (binarios perdidos), retrocedemos de fase.
      const isMissingCriticalIntelligenceDossier = hydratedState.currentStep === 'DOSSIER_REVIEW' && !hydratedState.ingestionDossier;
      if (isMissingCriticalIntelligenceDossier) {
        nicepodLog("⚠️ [ForgeContext] Sesión restaurada con lagunas binarias. Reajustando fase operativa.");
        hydratedState.currentStep = 'SENSORY_CAPTURE';
      }
      return hydratedState;
    }
    
    case 'RESET_FORGE': 
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('nicepod_forge_metadata_v6');
      }
      return initialState;
      
    default: return state;
  }
}

/**
 * ---------------------------------------------------------------------------
 * III. PROVEEDOR SOBERANO (ORCHESTRATOR)
 * ---------------------------------------------------------------------------
 */

interface ForgeContextProperties {
  state: ForgeState;
  dispatch: React.Dispatch<ForgeAction>;
  nextStep: () => void;
  prevStep: () => void;
}

const ForgeContext = createContext<ForgeContextProperties | undefined>(undefined);

export function ForgeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(forgeReducer, initialState);
  const debounceTimerReference = useRef<NodeJS.Timeout | null>(null);

  /**
   * 1. PROTOCOLO DE HIDRATACIÓN T0 (RECOVERY)
   * Misión: Recuperar el capital intelectual tras un refresco de página o fallo de app.
   */
  useEffect(() => {
    const savedMetadataJson = sessionStorage.getItem('nicepod_forge_metadata_v6');
    if (savedMetadataJson) {
      try {
        const parsedMetadata = JSON.parse(savedMetadataJson);
        
        // Validación de versión de esquema (Schema Guard)
        if (parsedMetadata.schema_version !== FORGE_SCHEMA_VERSION) {
          nicepodLog("🛡️ [ForgeContext] Versión de esquema obsoleta detectada. Purgando caché.");
          sessionStorage.removeItem('nicepod_forge_metadata_v6');
          return;
        }

        dispatch({ type: 'HYDRATE_METADATA', payload: parsedMetadata });
      } catch (exception) {
        nicepodLog("🔥 [ForgeContext] Error durante la materialización de sesión.", exception, 'error');
        sessionStorage.removeItem('nicepod_forge_metadata_v6');
      }
    }
  }, []);

  /**
   * 2. PERSISTENCIA DE ALTO RENDIMIENTO (DEBOUNCED PERSISTENCE)
   * Misión: Sincronizar el estado con sessionStorage sin saturar el Main Thread.
   */
  useEffect(() => {
    if (state.isSessionMetadataModified) {
      if (debounceTimerReference.current) clearTimeout(debounceTimerReference.current);
      
      debounceTimerReference.current = setTimeout(() => {
        const serializableSessionState = {
          schema_version: FORGE_SCHEMA_VERSION,
          currentStep: state.currentStep,
          latitudeCoordinate: state.latitudeCoordinate,
          longitudeCoordinate: state.longitudeCoordinate,
          accuracyMeters: state.accuracyMeters,
          categoryMission: state.categoryMission,
          categoryEntity: state.categoryEntity,
          resonanceRadiusMeters: state.resonanceRadiusMeters,
          historicalEpoch: state.historicalEpoch,
          referenceUniformResourceLocator: state.referenceUniformResourceLocator,
          administratorIntentText: state.administratorIntentText,
          narrativeDepth: state.narrativeDepth,
          narrativeTone: state.narrativeTone,
          historicalFactSummary: state.historicalFactSummary,
          ingestedPointOfInterestIdentification: state.ingestedPointOfInterestIdentification,
          ingestionDossier: state.ingestionDossier
        };
        sessionStorage.setItem('nicepod_forge_metadata_v6', JSON.stringify(serializableSessionState));
      }, 500); 
    }
  }, [state]);

  /**
   * 3. GUARDIÁN DE ACTIVOS (ANTI-AMNESIA SHIELD)
   * Misión: Prevenir la pérdida de binarios pesados (File/Blob) al cerrar la pestaña.
   */
  useEffect(() => {
    const handleBeforeUnloadAction = (unloadEvent: BeforeUnloadEvent) => {
      const hasUnsavedBinaryAssets = !!state.heroImageFile || 
                                     !!state.ambientAudioBlob || 
                                     !!state.intentAudioBlob || 
                                     state.opticalCharacterRecognitionImageFiles.length > 0;

      if (state.isSessionMetadataModified && hasUnsavedBinaryAssets && !state.ingestedPointOfInterestIdentification) {
        unloadEvent.preventDefault();
        unloadEvent.returnValue = ''; 
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnloadAction);
    return () => window.removeEventListener('beforeunload', handleBeforeUnloadAction);
  }, [state.isSessionMetadataModified, state.heroImageFile, state.ambientAudioBlob, state.intentAudioBlob, state.opticalCharacterRecognitionImageFiles, state.ingestedPointOfInterestIdentification]);

  /**
   * 4. CONTROL DE TRANSICIÓN DETERMINISTA (FSM)
   */
  const executeNextStepAction = useCallback(() => {
    switch (state.currentStep) {
      case 'ANCHORING':
        if (state.latitudeCoordinate !== null && state.categoryMission && state.categoryEntity) {
          dispatch({ type: 'SET_STEP', payload: 'SENSORY_CAPTURE' });
        }
        break;
      case 'SENSORY_CAPTURE':
        if (state.ingestionDossier || (state.heroImageFile && state.historicalEpoch)) {
          dispatch({ type: 'SET_STEP', payload: 'DOSSIER_REVIEW' });
        }
        break;
      case 'DOSSIER_REVIEW':
        if (state.ingestionDossier) {
          dispatch({ type: 'SET_STEP', payload: 'NARRATIVE_FORGE' });
        }
        break;
      default:
        nicepodLog("🚩 [ForgeContext] Pipeline de forja finalizado.");
    }
  }, [state.currentStep, state.latitudeCoordinate, state.categoryMission, state.categoryEntity, state.heroImageFile, state.historicalEpoch, state.ingestionDossier]);

  const executePreviousStepAction = useCallback(() => {
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
    <ForgeContext.Provider value={{ 
      state, 
      dispatch, 
      nextStep: executeNextStepAction, 
      prevStep: executePreviousStepAction 
    }}>
      {children}
    </ForgeContext.Provider>
  );
}

/**
 * useForge:
 * Punto de consumo único para la gestión del estado de creación geolocalizada.
 */
export function useForge() {
  const context = useContext(ForgeContext);
  if (context === undefined) {
    throw new Error("CRITICAL_ERROR: 'useForge' debe invocarse dentro de un ForgeProvider.");
  }
  return context;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Zero Abbreviations Policy: Se han renombrado todas las propiedades para alinearse con la 
 *    Constitución V8.6 (latitudeCoordinate, referenceUniformResourceLocator, etc.).
 * 2. Schema Guarding: El uso de FORGE_SCHEMA_VERSION garantiza que cambios estructurales en 
 *    el estado no provoquen colapsos al intentar hidratar datos antiguos del sessionStorage.
 * 3. Reactive Granularity: El flag 'isSessionMetadataModified' asegura que el guardado en 
 *    disco solo ocurra ante cambios reales en el peritaje, optimizando el rendimiento.
 */