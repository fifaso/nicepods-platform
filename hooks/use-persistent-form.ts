// hooks/use-persistent-form.ts
"use client";

import { useEffect, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { useDebounce } from "@/hooks/use-debounce"; // Ahora sí existe y funciona
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

export function usePersistentForm(
  form: UseFormReturn<PodcastCreationData>,
  currentStep: string,
  history: string[],
  onHydrate: (step: string, history: string[]) => void
) {
  const { watch, reset, getValues } = form;
  const formData = watch();

  // 1. Aplicamos Debounce al objeto completo del formulario.
  // El valor 'debouncedFormData' solo cambiará 1000ms después de que el usuario deje de escribir.
  const debouncedFormData = useDebounce(formData, 1000);

  // 2. Cargar datos al montar (Hidratación) - Esto se mantiene igual
  useEffect(() => {
    try {
      if (typeof window === "undefined") return; // Safety check para SSR
      
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const parsed: PersistenceState = JSON.parse(stored);
      const isOutdated = parsed.version !== SCHEMA_VERSION;
      const isExpired = (Date.now() - parsed.timestamp) > 24 * 60 * 60 * 1000;

      if (isOutdated || isExpired) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      console.log("💧 Hidratando borrador:", parsed.step);
      reset(parsed.formData);
      
      if (parsed.step && parsed.history) {
        onHydrate(parsed.step, parsed.history);
      }
    } catch (e) {
      console.error("Error hidratando persistencia:", e);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [reset, onHydrate]);

  // 3. Guardar datos automáticamente (Autosave)
  // Ahora dependemos de 'debouncedFormData', por lo que no necesitamos setTimeout aquí.
  useEffect(() => {
    // Evitamos guardar si el formulario está vacío
    if (!debouncedFormData.purpose) return;

    const dataToSave: PersistenceState = {
      version: SCHEMA_VERSION,
      timestamp: Date.now(),
      step: currentStep,
      history: history,
      // Usamos debouncedFormData que es la versión estable de los datos
      formData: debouncedFormData, 
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    
    // Opcional: console.log("💾 Autosave ejecutado"); 
  }, [debouncedFormData, currentStep, history]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { clearDraft };
}