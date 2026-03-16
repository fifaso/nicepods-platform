// components/geo/forge-context.tsx
// VERSIÓN: 2.6 (NicePod Sovereign Memory Manager - OOM Prevention Edition)
// Misión: Orquestar el ciclo de vida de captura física sin degradar la RAM del dispositivo.
// [ESTABILIZACIÓN]: Migración de Base64 a File Objects y soporte para Cerebro Dual (Ingesta/Síntesis).

"use client";

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useReducer
} from "react";

// --- IMPORTACIÓN DE SOBERANÍA DE TIPOS ---
import { IngestionDossier } from "@/types/geo-sovereignty";

/**
 * ---------------------------------------------------------------------------
 * I. CONTRATOS DE DATOS (EL ADN DE LA FORJA V2.6)
 * ---------------------------------------------------------------------------
 */

/**
 * ForgeStep: Fases del ciclo de vida de creación (Arquitectura de Cerebro Dual).
 * 1. ANCHORING: Posicionamiento GPS o Manual en el Mapa.
 * 2. SENSORY_CAPTURE: Captura de hardware (Cámaras y Micrófono).
 * 3. INGESTING: Estado de transición asíncrona (Subida a Storage + OCR AI).
 * 4. DOSSIER_REVIEW: El Admin valida la verdad extraída por la IA.
 * 5. NARRATIVE_FORGE: Configuración de tono, profundidad e intención.
 * 6. FORGING: Síntesis final mediante el Agente 38.
 */
export type ForgeStep =
  | 'ANCHORING'
  | 'SENSORY_CAPTURE'
  | 'INGESTING'
  | 'DOSSIER_REVIEW'
  | 'NARRATIVE_FORGE'
  | 'FORGING';

/**
 * ForgeState: Estructura de memoria volátil. 
 * Diseñada para máxima eficiencia de RAM en dispositivos táctiles.
 */
export interface ForgeState {
  // Metadatos de Control de Flujo
  currentStep: ForgeStep;
  isSubmitting: boolean;

  // Fase 1: Anclaje Geográfico
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  categoryId: string;
  resonanceRadius: number;     // Standard V2.6: 35 metros

  // Fase 2: Evidencia Física (RAM Optimization: File objects en lugar de Base64)
  heroImageFile: File | null;  // Activo binario puro
  ocrImageFile: File | null;   // Activo binario puro
  ambientAudioBlob: Blob | null;

  // Fase 3: Inteligencia Retornada (El resultado de la Ingesta)
  ingestedPoiId: number | null; // El ID de la tabla points_of_interest (status: ingested)
  ingestionDossier: IngestionDossier | null; // Lo que la IA detectó (Clima, OCR, etc.)

  // Fase 4: Semilla Narrativa e Intención (Instrucciones para Agente 38)
  intentText: string;
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
  | { type: 'SET_LOCATION'; payload: { lat: number; lng: number; acc: number } }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'SET_RADIUS'; payload: number }
  | { type: 'SET_HERO_IMAGE'; payload: File | null }
  | { type: 'SET_OCR_IMAGE'; payload: File | null }
  | { type: 'SET_AMBIENT_AUDIO'; payload: Blob | null }
  | { type: 'SET_INGESTION_RESULT'; payload: { poiId: number; dossier: IngestionDossier } }
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
  resonanceRadius: 35, // Actualizado al estándar industrial V2.6
  heroImageFile: null,
  ocrImageFile: null,
  ambientAudioBlob: null,
  ingestedPoiId: null,
  ingestionDossier: null,
  intentText: "",
  depth: 'cronica',
  tone: 'academico',
  historicalFact: ""
};

/**
 * forgeReducer: Transmutación determinista del estado de la misión.
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
    case 'SET_HERO_IMAGE': return { ...state, heroImageFile: action.payload };
    case 'SET_OCR_IMAGE': return { ...state, ocrImageFile: action.payload };
    case 'SET_AMBIENT_AUDIO': return { ...state, ambientAudioBlob: action.payload };
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

export function ForgeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(forgeReducer, initialState);

  /**
   * nextStep: Navegación UI Síncrona.
   * Actúa como Firewall Táctico. Las transiciones que requieren red (ej. Ingesting)
   * son orquestadas directamente desde el componente llamando a dispatch('SET_STEP').
   */
  const nextStep = useCallback(() => {
    // Barrera de Anclaje
    if (state.currentStep === 'ANCHORING') {
      if (!state.latitude || !state.longitude) {
        console.warn("⚠️ [Forge] Bloqueo: Coordenadas no detectadas. Verifique el Spatial Engine.");
        return;
      }
      dispatch({ type: 'SET_STEP', payload: 'SENSORY_CAPTURE' });
    }
    // Barrera de Evidencia Visual
    else if (state.currentStep === 'SENSORY_CAPTURE') {
      if (!state.heroImageFile) {
        console.warn("⚠️ [Forge] Bloqueo: Se requiere confirmación visual del objetivo.");
        return;
      }
      // Avanzamos al estado de procesamiento asíncrono
      dispatch({ type: 'SET_STEP', payload: 'INGESTING' });
    }
    // Barrera de Revisión de Dossier
    else if (state.currentStep === 'DOSSIER_REVIEW') {
      dispatch({ type: 'SET_STEP', payload: 'NARRATIVE_FORGE' });
    }
  }, [state.currentStep, state.latitude, state.longitude, state.heroImageFile]);

  /**
   * prevStep: Retroceso Táctico.
   * Permite al Admin corregir errores de captura sin perder el Dossier.
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
    throw new Error("useForge fue invocado fuera de un ForgeProvider autorizado.");
  }
  return context;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Aniquilación de Memory Leaks: Al reemplazar los strings Base64 por objetos `File`,
 *    el recolector de basura (Garbage Collector) de V8/WebKit puede operar eficientemente.
 *    La generación de previas visuales se hará en el componente usando URL.createObjectURL().
 * 2. Transición de Responsabilidad: El estado ahora incluye `ingestedPoiId`. Esto significa 
 *    que en la fase final de creación, ya no necesitamos subir las fotos; simplemente 
 *    le diremos a la IA: "Crea un guion para el POI #X".
 * 3. Expansibilidad: La estructura soporta la interrupción del flujo. Si la app se cierra 
 *    en 'DOSSIER_REVIEW', el registro ya existe en el Metal (PostgreSQL) como 'ingested',
 *    listo para ser retomado en el futuro.
 */