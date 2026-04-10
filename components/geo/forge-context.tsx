/**
 * ARCHIVO: components/geo/forge-context.tsx
 * VERSIÓN: 6.1 (NicePod Forge Context - Industrial Recovery & Global Telemetry Inheritance)
 * PROTOCOLO: MADRID RESONANCE V4.5
 * 
 * Misión: Orquestar la memoria volátil de la terminal de forja con persistencia de alto 
 * rendimiento, garantizando la inmunidad ante la amnesia del navegador y la 
 * sincronización automática con la telemetría global de la plataforma.
 * [REFORMA V6.1]: Implementación del Protocolo de Herencia Geodésica. El contexto 
 * ahora auto-ingesta la ubicación precisa del Voyager si el motor global posee 
 * un bloqueo satelital activo (HD), eliminando latencias manuales. Refuerzo de 
 * la Zero Abbreviations Policy (ZAP) y control de versiones de esquema.
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
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { nicepodLog } from "@/lib/utils";

/**
 * ---------------------------------------------------------------------------
 * I. CONTRATOS DE DATOS Y MÁQUINA DE ESTADOS FINITA (FSM)
 * ---------------------------------------------------------------------------
 */

const FORGE_SESSION_SCHEMA_VERSION = "4.5";

export type ForgeStepIdentification =
  | 'ANCHORING'         // Fase 1: Posicionamiento y Taxonomía.
  | 'SENSORY_CAPTURE'   // Fase 2: Captura Visual, Acústica y Temporal.
  | 'DOSSIER_REVIEW'    // Fase 3: Auditoría Humana del Peritaje de IA.
  | 'NARRATIVE_FORGE';  // Fase 4: Síntesis Literaria y Publicación.

export interface ForgeState {
  currentActiveStep: ForgeStepIdentification;
  isSubmittingProcess: boolean;
  isTranscribingAudio: boolean;
  isSessionMetadataModified: boolean; 

  // Fase 1: Anclaje Geodésico
  latitudeCoordinate: number | null;
  longitudeCoordinate: number | null;
  accuracyMeters: number | null;
  categoryMission: CategoryMission | undefined;
  categoryEntity: CategoryEntity | undefined;
  resonanceRadiusMeters: number;

  // Fase 2: Evidencias y Mosaico Visual
  heroImageFile: File | null;
  opticalCharacterRecognitionImageFiles: File[];
  ambientAudioBlob: Blob | null;
  intentAudioBlob: Blob | null;
  historicalEpoch: HistoricalEpoch | undefined;
  referenceUniformResourceLocator: string;

  // Fase 3: Resultados de Inteligencia del Borde
  ingestedPointOfInterestIdentification: number | null;
  ingestionDossier: IngestionDossier | null;

  // Fase 4: Configuración Editorial
  administratorIntentText: string;
  narrativeDepth: NarrativeDepth;
  narrativeTone: NarrativeTone;
  historicalFactSummary: string;
}

const initialState: ForgeState = {
  currentActiveStep: 'ANCHORING',
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
 * II. REDUCER DETERMINISTA (SINTONIZADO V6.1)
 * ---------------------------------------------------------------------------
 */

type ForgeAction =
  | { type: 'SET_STEP'; payload: ForgeStepIdentification }
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
      return { ...state, currentActiveStep: action.payload };

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
      // [RESILIENCIA]: Si el paso es avanzado pero faltan evidencias binarias en RAM, reajustamos la fase operativa.
      const isMissingCriticalIntelligenceDossier = hydratedState.currentActiveStep === 'DOSSIER_REVIEW' && !hydratedState.ingestionDossier;
      if (isMissingCriticalIntelligenceDossier) {
        nicepodLog("⚠️ [ForgeContext] Sesión recuperada con lagunas binarias. Reajustando a Fase de Captura.");
        hydratedState.currentActiveStep = 'SENSORY_CAPTURE';
      }
      return hydratedState;
    }
    
    case 'RESET_FORGE': 
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('nicepod_forge_metadata_v6_1');
      }
      return initialState;
      
    default: return state;
  }
}

/**
 * ---------------------------------------------------------------------------
 * III. PROVEEDOR SOBERANO (TERMINAL ORCHESTRATOR)
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

  // CONSUMO DE TELEMETRÍA UNIFICADA DE PLATAFORMA
  const { userLocation, isGPSLock } = useGeoEngine();

  /**
   * 1. PROTOCOLO DE HIDRATACIÓN T0 (SESSION RECOVERY)
   */
  useEffect(() => {
    const savedMetadataJsonString = sessionStorage.getItem('nicepod_forge_metadata_v6_1');
    if (savedMetadataJsonString) {
      try {
        const parsedMetadata = JSON.parse(savedMetadataJsonString);
        
        // Validación de Integridad de Versión de Esquema
        if (parsedMetadata.schema_version !== FORGE_SESSION_SCHEMA_VERSION) {
          nicepodLog("🛡️ [ForgeContext] Esquema de sesión obsoleto. Purgando caché de forja.");
          sessionStorage.removeItem('nicepod_forge_metadata_v6_1');
          return;
        }

        dispatch({ type: 'HYDRATE_METADATA', payload: parsedMetadata });
      } catch (exception) {
        nicepodLog("🔥 [ForgeContext] Error crítico en materialización de sesión.", exception, 'error');
        sessionStorage.removeItem('nicepod_forge_metadata_v6_1');
      }
    }
  }, []);

  /**
   * 2. PROTOCOLO DE HERENCIA GEODÉSICA (INSTANT AUTO-SYNC)
   * Misión: Capturar automáticamente la ubicación si el motor unificado ya tiene precisión HD.
   * [SINCRO V4.5]: Elimina la necesidad de triangulación manual en el Step 1.
   */
  useEffect(() => {
    const hasExistingLocation = state.latitudeCoordinate !== null;
    const isStepOneActive = state.currentActiveStep === 'ANCHORING';

    if (isGPSLock && userLocation && !hasExistingLocation && isStepOneActive) {
      nicepodLog("🛰️ [ForgeContext] Heredando telemetría de alta precisión desde el motor global.");
      dispatch({
        type: 'SET_LOCATION',
        payload: {
          latitudeCoordinate: userLocation.latitudeCoordinate,
          longitudeCoordinate: userLocation.longitudeCoordinate,
          accuracyMeters: userLocation.accuracyMeters
        }
      });
    }
  }, [isGPSLock, userLocation, state.latitudeCoordinate, state.currentActiveStep]);

  /**
   * 3. PERSISTENCIA DE ALTO RENDIMIENTO (DEBOUNCED STORAGE SYNC)
   */
  useEffect(() => {
    if (state.isSessionMetadataModified) {
      if (debounceTimerReference.current) {
        clearTimeout(debounceTimerReference.current);
      }
      
      debounceTimerReference.current = setTimeout(() => {
        const serializableSessionState = {
          schema_version: FORGE_SESSION_SCHEMA_VERSION,
          currentActiveStep: state.currentActiveStep,
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
        sessionStorage.setItem('nicepod_forge_metadata_v6_1', JSON.stringify(serializableSessionState));
      }, 500); 
    }
  }, [state]);

  /**
   * 4. GUARDIÁN DE ACTIVOS BINARIOS (ANTI-AMNESIA SHIELD)
   */
  useEffect(() => {
    const handleBeforeUnloadAction = (unloadEvent: BeforeUnloadEvent) => {
      const hasUnsavedVolatileBinaries = !!state.heroImageFile || 
                                         !!state.ambientAudioBlob || 
                                         !!state.intentAudioBlob || 
                                         state.opticalCharacterRecognitionImageFiles.length > 0;

      if (state.isSessionMetadataModified && hasUnsavedVolatileBinaries && !state.ingestedPointOfInterestIdentification) {
        unloadEvent.preventDefault();
        unloadEvent.returnValue = ''; 
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnloadAction);
    return () => window.removeEventListener('beforeunload', handleBeforeUnloadAction);
  }, [state.isSessionMetadataModified, state.heroImageFile, state.ambientAudioBlob, state.intentAudioBlob, state.opticalCharacterRecognitionImageFiles, state.ingestedPointOfInterestIdentification]);

  /**
   * 5. CONTROL DE TRANSICIÓN DETERMINISTA (FINITE STATE MACHINE)
   */
  const executeNextStepTransitionAction = useCallback(() => {
    switch (state.currentActiveStep) {
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
        nicepodLog("🚩 [ForgeContext] Pipeline operativo de forja completado.");
    }
  }, [state.currentActiveStep, state.latitudeCoordinate, state.categoryMission, state.categoryEntity, state.heroImageFile, state.historicalEpoch, state.ingestionDossier]);

  const executePreviousStepTransitionAction = useCallback(() => {
    switch (state.currentActiveStep) {
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
  }, [state.currentActiveStep]);

  return (
    <ForgeContext.Provider value={{ 
      state, 
      dispatch, 
      nextStep: executeNextStepTransitionAction, 
      prevStep: executePreviousStepTransitionAction 
    }}>
      {children}
    </ForgeContext.Provider>
  );
}

/**
 * useForge:
 * Punto de consumo único para la gestión soberana del estado de creación.
 */
export function useForge() {
  const context = useContext(ForgeContext);
  if (context === undefined) {
    throw new Error("CRITICAL_ERROR: 'useForge' debe invocarse dentro de un ForgeProvider.");
  }
  return context;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.1):
 * 1. Global Geodetic Inheritance: Se ha integrado el consumo del motor global para heredar 
 *    la ubicación con precisión HD (isGPSLock). Esto permite que el Step 1 se auto-complete 
 *    instantáneamente si el Voyager ya fue localizado en el Dashboard.
 * 2. Zero Abbreviations Policy (ZAP): Refactorización nominal de todas las acciones 
 *    (executeNextStepTransitionAction) y propiedades de sesión.
 * 3. Atomic Recovery: La introducción de FORGE_SESSION_SCHEMA_VERSION previene colisiones 
 *    de datos tras actualizaciones estructurales del sistema de persistencia.
 */