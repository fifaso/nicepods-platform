// hooks/use-persistent-form.ts
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

export function usePersistentForm(
  form: UseFormReturn<PodcastCreationData>,
  currentStep: string,
  history: string[],
  onHydrate: (step: string, history: string[]) => void,
  onDataFound?: () => void // Nuevo callback para avisar que hay datos
) {
  const { watch, reset, getValues } = form;
  const formData = watch();
  
  // Estado para retener los datos encontrados pero no aplicados aún
  const [pendingData, setPendingData] = useState<PersistenceState | null>(null);
  const isRestoring = useRef(false); // Flag para evitar autosave durante la restauración

  // 1. Debounce para Autosave
  const debouncedFormData = useDebounce(formData, 1000);

  // 2. Detección al montar (Solo lectura, NO aplica)
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const parsed: PersistenceState = JSON.parse(stored);
      const isOutdated = parsed.version !== SCHEMA_VERSION;
      // Caducidad de 24 horas
      const isExpired = (Date.now() - parsed.timestamp) > 24 * 60 * 60 * 1000;

      if (isOutdated || isExpired) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      // Si encontramos datos válidos, los guardamos en memoria y avisamos
      if (parsed.formData && Object.keys(parsed.formData).length > 0) {
        setPendingData(parsed);
        if (onDataFound) onDataFound();
      }

    } catch (e) {
      console.error("Error leyendo persistencia:", e);
      localStorage.removeItem(STORAGE_KEY);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo al montar

  // 3. Función para APLICAR la restauración (Usuario dijo "SÍ")
  const restoreSession = useCallback(() => {
    if (!pendingData) return;
    
    isRestoring.current = true;
    console.log("💧 Restaurando sesión aprobada por usuario");
    
    reset(pendingData.formData);
    
    if (pendingData.step && pendingData.history) {
      onHydrate(pendingData.step, pendingData.history);
    }
    
    setPendingData(null); // Limpiamos el pendiente
    
    // Liberamos el lock de restauración después de un breve delay
    setTimeout(() => {
        isRestoring.current = false;
    }, 1000);

  }, [pendingData, reset, onHydrate]);

  // 4. Función para DESCARTAR (Usuario dijo "NO")
  const discardSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPendingData(null);
    console.log("🗑️ Sesión anterior descartada");
  }, []);

  // 5. Autosave (Con protección)
  useEffect(() => {
    // Si estamos en proceso de restauración o decidiendo, no guardamos nada
    if (isRestoring.current || pendingData !== null) return;

    // Si el formulario está vacío (estado inicial), no sobrescribimos el storage
    // (A menos que explícitamente queramos guardar un borrador vacío, lo cual es raro)
    if (!debouncedFormData.purpose) return;

    const dataToSave: PersistenceState = {
      version: SCHEMA_VERSION,
      timestamp: Date.now(),
      step: currentStep,
      history: history,
      formData: debouncedFormData, 
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    
  }, [debouncedFormData, currentStep, history, pendingData]);

  // Limpieza manual (para cuando se completa el proceso exitosamente)
  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPendingData(null);
  }, []);

  return { restoreSession, discardSession, clearDraft };
}