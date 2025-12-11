// hooks/use-persistent-form.ts
// VERSIÓN: 2.0 (Smart Hydration: Significance Check & Non-Blocking)

"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { useDebounce } from "@/hooks/use-debounce";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";

const STORAGE_KEY = "nicepod_draft_v1";
const SCHEMA_VERSION = "1.0"; 

interface PersistenceState {
  version: string;
  timestamp: number;
  step: string;
  history: string[];
  formData: Partial<PodcastCreationData>;
}

// Helper para determinar si vale la pena restaurar
function hasSignificantData(data: Partial<PodcastCreationData>): boolean {
  // Verificamos si hay texto real en los campos clave
  const hasTopic = !!(data.solo_topic?.trim() || data.archetype_topic?.trim() || data.link_topicA?.trim() || data.question_to_answer?.trim());
  const hasMotivation = !!(data.solo_motivation?.trim() || data.archetype_goal?.trim() || data.legacy_lesson?.trim());
  const isAdvancedStep = !!data.final_script; // Si ya hay un guion, es muy valioso

  return hasTopic || hasMotivation || isAdvancedStep;
}

export function usePersistentForm(
  form: UseFormReturn<PodcastCreationData>,
  currentStep: string,
  history: string[],
  onHydrate: (step: string, history: string[]) => void,
  onDataFound?: () => void 
) {
  const { watch, reset } = form;
  const formData = watch();
  
  const [pendingData, setPendingData] = useState<PersistenceState | null>(null);
  const isRestoring = useRef(false); 
  const hasUserStartedTyping = useRef(false); // Nuevo flag

  const debouncedFormData = useDebounce(formData, 1000);

  // Detectar si el usuario ya empezó a escribir "encima" del borrador
  useEffect(() => {
    // Si hay cambios en el formulario y NO estamos restaurando, el usuario está activo.
    if (!isRestoring.current && hasSignificantData(formData)) {
        hasUserStartedTyping.current = true;
    }
  }, [formData]);

  // 1. Lectura Inicial Inteligente
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const parsed: PersistenceState = JSON.parse(stored);
      const isOutdated = parsed.version !== SCHEMA_VERSION;
      const isExpired = (Date.now() - parsed.timestamp) > 24 * 60 * 60 * 1000;

      // Si es viejo, incompatible o NO TIENE DATOS SIGNIFICATIVOS, lo borramos silenciosamente.
      if (isOutdated || isExpired || !hasSignificantData(parsed.formData)) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      // Si llegamos aquí, hay oro. Avisamos.
      setPendingData(parsed);
      if (onDataFound) onDataFound();

    } catch (e) {
      localStorage.removeItem(STORAGE_KEY);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // 2. Restauración
  const restoreSession = useCallback(() => {
    if (!pendingData) return;
    
    // Si el usuario ya escribió algo nuevo significativo, confirmamos antes de sobrescribir?
    // Por simplicidad UX: Si pulsa "Continuar", sobrescribimos.
    
    isRestoring.current = true;
    reset(pendingData.formData);
    
    if (pendingData.step && pendingData.history) {
      onHydrate(pendingData.step, pendingData.history);
    }
    
    setPendingData(null); 
    hasUserStartedTyping.current = false; // Resetamos flag
    
    setTimeout(() => { isRestoring.current = false; }, 1000);
  }, [pendingData, reset, onHydrate]);

  // 3. Descarte
  const discardSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPendingData(null);
  }, []);

  // 4. Autosave Robusto
  useEffect(() => {
    if (isRestoring.current) return;

    // Si hay un borrador pendiente (el usuario no ha decidido), 
    // PERO el usuario ya empezó a escribir algo nuevo significativo...
    // Estrategia: El nuevo input gana. Sobrescribimos el storage viejo con lo nuevo.
    if (pendingData !== null && hasUserStartedTyping.current) {
        setPendingData(null); // Dejamos de ofrecer la restauración, el usuario ya eligió "Nuevo" implícitamente
    }

    // Solo guardamos si hay datos significativos
    if (!hasSignificantData(debouncedFormData)) return;

    // Si todavía hay datos pendientes y el usuario no ha escrito, NO sobrescribimos (esperamos su decisión)
    if (pendingData !== null && !hasUserStartedTyping.current) return;

    const dataToSave: PersistenceState = {
      version: SCHEMA_VERSION,
      timestamp: Date.now(),
      step: currentStep,
      history: history,
      formData: debouncedFormData, 
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    
  }, [debouncedFormData, currentStep, history, pendingData]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPendingData(null);
  }, []);

  return { restoreSession, discardSession, clearDraft };
}