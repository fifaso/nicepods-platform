// hooks/use-persistent-form.ts
// VERSIÓN: 3.0 (Madrid Resonance - Pure Integrity & High-Performance Persistence)
// Misión: Garantizar la recuperación de borradores locales evitando colisiones con esquemas obsoletos.

"use client";

import { useDebounce } from "@/hooks/use-debounce";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useCallback, useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";

const STORAGE_KEY = "nicepod_draft_v7"; // Incrementamos versión por cambio de esquema
const SCHEMA_VERSION = "7.0";

interface PersistenceState {
  version: string;
  timestamp: number;
  step: string;
  history: string[];
  formData: Partial<PodcastCreationData>;
}

/**
 * hasSignificantData
 * [FIX]: Eliminación de 'archetype_topic' y 'archetype_goal' para resolver errores ts(2339).
 * Determina si el borrador tiene suficiente peso intelectual para ser restaurado.
 */
function hasSignificantData(data: Partial<PodcastCreationData>): boolean {
  if (!data) return false;

  const hasTopic = !!(
    data.solo_topic?.trim() ||
    data.link_topicA?.trim() ||
    data.link_topicB?.trim() ||
    data.question_to_answer?.trim()
  );

  const hasMotivation = !!(
    data.solo_motivation?.trim() ||
    data.legacy_lesson?.trim()
  );

  const isAdvancedStep = !!data.final_script; // Si ya hay un guion generado, es crítico salvarlo.

  return hasTopic || hasMotivation || isAdvancedStep;
}

/**
 * HOOK: usePersistentForm
 * Orquestador de la "Caja Negra" local de NicePod.
 */
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
  const hasUserStartedTyping = useRef(false);

  // Debounce de 1 segundo para no saturar el localStorage en cada pulsación de tecla
  const debouncedFormData = useDebounce(formData, 1000);

  /**
   * Monitor de Actividad Humana
   * Detecta si el usuario empieza a escribir en un formulario limpio.
   */
  useEffect(() => {
    if (!isRestoring.current && hasSignificantData(formData)) {
      hasUserStartedTyping.current = true;
    }
  }, [formData]);

  /**
   * 1. LECTURA INICIAL (Mount)
   * Verifica si existe una sesión previa al cargar el componente.
   */
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const parsed: PersistenceState = JSON.parse(stored);

      // Validaciones de integridad y frescura (24 horas)
      const isOutdated = parsed.version !== SCHEMA_VERSION;
      const isExpired = (Date.now() - parsed.timestamp) > 24 * 60 * 60 * 1000;

      if (isOutdated || isExpired || !hasSignificantData(parsed.formData)) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      setPendingData(parsed);
      if (onDataFound) onDataFound();

    } catch (error) {
      console.warn("[NicePod-Persistence] Error al leer sesión previa:", error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [onDataFound]);

  /**
   * 2. ACCIÓN: Restaurar Sesión
   * Rehidrata el estado del formulario y la posición en el flujo.
   */
  const restoreSession = useCallback(() => {
    if (!pendingData) return;

    isRestoring.current = true;

    // Inyectamos los datos en el store de React Hook Form
    reset(pendingData.formData);

    // Sincronizamos la posición del stepper
    if (pendingData.step && pendingData.history) {
      onHydrate(pendingData.step, pendingData.history);
    }

    setPendingData(null);
    hasUserStartedTyping.current = false;

    // Pequeño delay para liberar el bloqueo de guardado
    setTimeout(() => {
      isRestoring.current = false;
    }, 500);

  }, [pendingData, reset, onHydrate]);

  /**
   * 3. ACCIÓN: Descartar Sesión
   * Limpieza manual de la memoria local.
   */
  const discardSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPendingData(null);
  }, []);

  /**
   * 4. LÓGICA DE AUTOSAVE (Side Effect)
   * Se dispara cada vez que los datos del formulario cambian.
   */
  useEffect(() => {
    if (isRestoring.current) return;

    // Si el usuario ya está escribiendo algo nuevo, priorizamos lo nuevo sobre lo viejo guardado
    if (pendingData !== null && hasUserStartedTyping.current) {
      setPendingData(null);
    }

    // No guardamos formularios vacíos
    if (!hasSignificantData(debouncedFormData)) return;

    // Si hay datos pendientes de restaurar y el usuario no ha tocado nada, no sobrescribimos aún
    if (pendingData !== null && !hasUserStartedTyping.current) return;

    const dataToSave: PersistenceState = {
      version: SCHEMA_VERSION,
      timestamp: Date.now(),
      step: currentStep,
      history: history,
      formData: debouncedFormData,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error("[NicePod-Persistence] Error en cuota de almacenamiento local.");
    }

  }, [debouncedFormData, currentStep, history, pendingData]);

  /**
   * clearDraft
   * Expone un método de limpieza total para llamar tras una publicación exitosa.
   */
  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPendingData(null);
  }, []);

  return { restoreSession, discardSession, clearDraft, pendingData };
}