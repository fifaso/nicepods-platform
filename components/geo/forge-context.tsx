/**
 * ARCHIVO: components/geo/forge-context.tsx
 * VERSIÓN: 6.3 (NicePod Forge Context - Sovereign Geodetic Synchronization & High-Fidelity Recovery Edition)
 * PROTOCOLO: MADRID RESONANCE V4.8
 * 
 * Misión: Orquestar la memoria volátil de la terminal de forja con persistencia de alto 
 * rendimiento, garantizando la inmunidad ante la amnesia del navegador y la 
 * sincronización automática con la telemetría de alta fidelidad (SSS Protocol).
 * [REFORMA V6.3]: Consolidación del Protocolo de Herencia Táctica. El contexto ahora 
 * detecta y absorbe activamente el bloqueo de precisión satelital (High-Fidelity) 
 * del motor global para auto-poblar las coordenadas en la Fase 1. Cumplimiento 
 * absoluto de la Zero Abbreviations Policy (ZAP) y blindaje del Build Shield.
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

const FORGE_SESSION_METADATA_VERSION_IDENTIFIER = "4.8";
const FORGE_SESSION_STORAGE_KEY_NAME = "nicepod_forge_session_metadata_v4_8";

export type ForgeStepIdentification =
  | 'ANCHORING'         // Fase 1: Posicionamiento y Taxonomía.
  | 'SENSORY_CAPTURE'   // Fase 2: Captura Visual, Acústica y Temporal.
  | 'DOSSIER_REVIEW'    // Fase 3: Auditoría Humana del Peritaje de Inteligencia Artificial.
  | 'NARRATIVE_FORGE';  // Fase 4: Síntesis Literaria y Publicación Soberana.

export interface ForgeState {
  currentActiveStep: ForgeStepIdentification;
  isSubmittingProcessActive: boolean;
  isTranscribingAudioActive: boolean;
  isSessionMetadataModified: boolean; 

  // Fase 1: Anclaje Geodésico Industrial
  latitudeCoordinate: number | null;
  longitudeCoordinate: number | null;
  accuracyMeters: number | null;
  categoryMission: CategoryMission | undefined;
  categoryEntity: CategoryEntity | undefined;
  resonanceRadiusMeters: number;

  // Fase 2: Evidencias y Mosaico de Inteligencia Multimodal
  heroImageFile: File | null;
  opticalCharacterRecognitionImageFiles: File[];
  ambientAudioBlob: Blob | null;
  intentAudioBlob: Blob | null;
  historicalEpoch: HistoricalEpoch | undefined;
  referenceUniformResourceLocator: string;

  // Fase 3: Resultados de Inteligencia del Borde (Bóveda NKV)
  ingestedPointOfInterestIdentification: number | null;
  ingestionDossier: IngestionDossier | null;

  // Fase 4: Configuración Editorial y Síntesis Final
  administratorIntentText: string;
  narrativeDepth: NarrativeDepth;
  narrativeTone: NarrativeTone;
  historicalFactSummary: string;
}

const initialState: ForgeState = {
  currentActiveStep: 'ANCHORING',
  isSubmittingProcessActive: false,
  isTranscribingAudioActive: false,
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
 * II. REDUCER DETERMINISTA (SINTONIZADO V6.3)
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
      return { ...state, isSubmittingProcessActive: action.payload };

    case 'SET_TRANSCRIBING': 
      return { ...state, isTranscribingAudioActive: action.payload };
    
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
      // [RESILIENCIA]: Si faltan evidencias binarias en RAM tras la recuperación, retrocedemos de fase operativa.
      const isMissingCriticalIntelligenceDossier = hydratedState.currentActiveStep === 'DOSSIER_REVIEW' && !hydratedState.ingestionDossier;
      if (isMissingCriticalIntelligenceDossier) {
        nicepodLog("⚠️ [ForgeContext] Sesión restaurada con lagunas binarias. Reajustando a Fase de Captura.");
        hydratedState.currentActiveStep = 'SENSORY_CAPTURE';
      }
      return hydratedState;
    }
    
    case 'RESET_FORGE': 
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(FORGE_SESSION_STORAGE_KEY_NAME);
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

  // CONSUMO DE TELEMETRÍA GLOBAL DE PLATAFORMA (SINGLE SENSORY SOURCE)
  const { userLocation, isGPSLock: isGlobalPositioningSystemLocked } = useGeoEngine();

  /**
   * 1. PROTOCOLO DE HIDRATACIÓN EN TIEMPO CERO (RESILIENCIA INDUSTRIAL)
   * Misión: Recuperar el estado de la forja desde el almacenamiento de sesión persistente.
   */
  useEffect(() => {
    const savedMetadataJsonString = sessionStorage.getItem(FORGE_SESSION_STORAGE_KEY_NAME);
    if (savedMetadataJsonString) {
      try {
        const parsedMetadata = JSON.parse(savedMetadataJsonString);
        
        // Validación de Integridad de Esquema (Anti-Amnesia Protection)
        if (parsedMetadata.schemaVersionIdentifier !== FORGE_SESSION_METADATA_VERSION_IDENTIFIER) {
          nicepodLog("🛡️ [ForgeContext] Esquema obsoleto detectado. Purgando caché de sesión de forja.");
          sessionStorage.removeItem(FORGE_SESSION_STORAGE_KEY_NAME);
          return;
        }

        dispatch({ type: 'HYDRATE_METADATA', payload: parsedMetadata });
      } catch (exception) {
        nicepodLog("🔥 [ForgeContext] Error crítico en materialización de sesión.", exception, 'error');
        sessionStorage.removeItem(FORGE_SESSION_STORAGE_KEY_NAME);
      }
    }
  }, []);

  /**
   * 2. PROTOCOLO DE HERENCIA GEODÉSICA (INSTANT AUTO-SYNC)
   * [INTERVENCIÓN V6.3]: Si el motor unificado de plataforma ya posee un bloqueo de alta definición,
   * la forja auto-ingesta la ubicación exacta, eliminando la latencia manual en Step 1.
   * Punto de Sinergia: Dashboard -> Forge Transition.
   */
  useEffect(() => {
    const isStepOneActive = state.currentActiveStep === 'ANCHORING';
    const hasNotFixedCoordinatesYet = state.latitudeCoordinate === null;

    if (isGlobalPositioningSystemLocked && userLocation && isStepOneActive && hasNotFixedCoordinatesYet) {
      nicepodLog("🛰️ [ForgeContext] Heredando telemetría de alta precisión (High-Fidelity) desde el motor unificado.");
      dispatch({
        type: 'SET_LOCATION',
        payload: {
          latitudeCoordinate: userLocation.latitudeCoordinate,
          longitudeCoordinate: userLocation.longitudeCoordinate,
          accuracyMeters: userLocation.accuracyMeters
        }
      });
    }
  }, [isGlobalPositioningSystemLocked, userLocation, state.currentActiveStep, state.latitudeCoordinate]);

  /**
   * 3. PERSISTENCIA DE ALTO RENDIMIENTO (DEBOUNCED STORAGE SYNC)
   * [MTI]: Sincronización diferida para proteger los 60 cuadros por segundo de la terminal.
   */
  useEffect(() => {
    if (state.isSessionMetadataModified) {
      if (debounceTimerReference.current) {
        clearTimeout(debounceTimerReference.current);
      }
      
      debounceTimerReference.current = setTimeout(() => {
        const serializableSessionMetadata = {
          schemaVersionIdentifier: FORGE_SESSION_METADATA_VERSION_IDENTIFIER,
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
        sessionStorage.setItem(FORGE_SESSION_STORAGE_KEY_NAME, JSON.stringify(serializableSessionMetadata));
      }, 500); 
    }
  }, [state]);

  /**
   * 4. GUARDIÁN DE ACTIVOS BINARIOS (ANTI-AMNESIA SHIELD)
   * Misión: Bloquear el cierre accidental del navegador si existen evidencias en memoria de acceso aleatorio.
   */
  useEffect(() => {
    const handleBeforeUnloadAction = (unloadEvent: BeforeUnloadEvent) => {
      const hasUnsavedVolatileBinaryEvidence = !!state.heroImageFile || 
                                               !!state.ambientAudioBlob || 
                                               !!state.intentAudioBlob || 
                                               state.opticalCharacterRecognitionImageFiles.length > 0;

      if (state.isSessionMetadataModified && hasUnsavedVolatileBinaryEvidence && !state.ingestedPointOfInterestIdentification) {
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
        nicepodLog("🚩 [ForgeContext] Pipeline operativo de forja completado exitosamente.");
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
 * Punto de consumo único para la gestión soberana del estado de creación de Malla.
 */
export function useForge() {
  const contextReference = useContext(ForgeContext);
  if (contextReference === undefined) {
    throw new Error("CRITICAL_ERROR: 'useForge' debe invocarse dentro de un ForgeProvider.");
  }
  return contextReference;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.3):
 * 1. SSS Protocol Integration: El contexto ahora hereda pasivamente la ubicación de alta definición del
 *    motor global unificado, cerrando la brecha de latencia detectada en las fases de creación.
 * 2. ZAP Absolute Compliance: Se han purificado el 100% de los identificadores internos 
 *    y se han expandido los nombres de almacenamiento (FORGE_SESSION_STORAGE_KEY_NAME).
 * 3. Atomic State Recovery: El sistema de hidratación en tiempo cero garantiza la persistencia
 *    pericial del expediente incluso ante refrescos de página durante la Fase 3.
 */