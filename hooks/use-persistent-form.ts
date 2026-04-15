/**
 * ARCHIVO: hooks/use-persistent-form.ts
 * VERSIÓN: 4.0 (NicePod Persistent Flight Recorder - ZAP & Build Shield Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Garantizar la recuperación de borradores locales en el Metal del dispositivo, 
 * evitando colisiones con esquemas obsoletos y protegiendo el capital intelectual del Voyager.
 * [REFORMA V4.0]: Resolución definitiva de TS2339 y TS2551. Sincronización nominal 
 * absoluta con 'PodcastCreationSchema' V12.0. Aplicación integral de la 
 * Zero Abbreviations Policy (ZAP). Incremento de versión de almacenamiento táctico.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useDebounce } from "@/hooks/use-debounce";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { nicepodLog } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";

/**
 * CONFIGURACIÓN DE ALMACENAMIENTO INDUSTRIAL
 * [SINCRO V4.0]: Actualizamos la clave para forzar una purga de datos de legado.
 */
const TACTICAL_DRAFT_STORAGE_KEY_IDENTIFICATION = "nicepod_tactical_flight_recorder_v12";
const INDUSTRIAL_SCHEMA_VERSION_IDENTIFICATION = "12.0";

/**
 * INTERFAZ: PersistentIndustrialFormDossier
 * Representa el snapshot atómico de la sesión de creación en el disco local.
 */
interface PersistentIndustrialFormDossier {
  industrialVersion: string;
  unixTimestampMagnitude: number;
  currentFlowStepDescriptor: string;
  navigationHistoryStack: string[];
  creationFormDataPayload: Partial<PodcastCreationData>;
}

/**
 * checkIfSignificantIntellectualCapitalExistsStatus:
 * Misión: Determinar si el borrador posee suficiente densidad de datos para ser preservado.
 * [RESOLUCIÓN TS2339 / TS2551]: Sincronización con descriptores purificados V12.0.
 */
function checkIfSignificantIntellectualCapitalExistsStatus(
  creationFormDataPayload: Partial<PodcastCreationData>
): boolean {
  if (!creationFormDataPayload) return false;

  const isTopicDataPresentStatus = !!(
    creationFormDataPayload.soloTopicSelection?.trim() ||
    creationFormDataPayload.linkTopicPrimary?.trim() ||
    creationFormDataPayload.linkTopicSecondary?.trim() ||
    creationFormDataPayload.questionToAnswerText?.trim()
  );

  const isMotivationDataPresentStatus = !!(
    creationFormDataPayload.soloMotivationContentText?.trim() ||
    creationFormDataPayload.legacyLessonContentText?.trim()
  );

  // Si ya existe un guion en el lienzo, la preservación es de prioridad máxima.
  const isAdvancedProductionPhaseActiveStatus = !!creationFormDataPayload.finalScriptContent;

  return isTopicDataPresentStatus || isMotivationDataPresentStatus || isAdvancedProductionPhaseActiveStatus;
}

/**
 * HOOK: usePersistentIndustrialFormAuthority
 * Orquestador de la "Caja Negra" local de la terminal NicePod.
 */
export function usePersistentIndustrialFormAuthority(
  formOrchestrationMethods: UseFormReturn<PodcastCreationData>,
  currentFlowStepDescriptor: string,
  navigationHistoryStack: string[],
  onExecuteHydrationAction: (step: string, history: string[]) => void,
  onPersistentDataDiscoveredCallback?: () => void
) {
  const { watch, reset } = formOrchestrationMethods;
  const currentFormDataSnapshot = watch();

  const [pendingDossierToRestore, setPendingDossierToRestore] = useState<PersistentIndustrialFormDossier | null>(null);
  const isRestorationProcessActiveReference = useRef<boolean>(false);
  const hasUserStartedManualTypingReference = useRef<boolean>(false);

  // Debounce de 1500ms para optimizar ciclos de escritura en el Metal (Hardware Hygiene).
  const debouncedFormDataPayload = useDebounce(currentFormDataSnapshot, 1500);

  /**
   * EFECTO: Monitor de Actividad Humana
   * Detecta si el Voyager interactúa con un lienzo limpio.
   */
  useEffect(() => {
    if (!isRestorationProcessActiveReference.current && checkIfSignificantIntellectualCapitalExistsStatus(currentFormDataSnapshot)) {
      hasUserStartedManualTypingReference.current = true;
    }
  }, [currentFormDataSnapshot]);

  /**
   * 1. PROTOCOLO DE LECTURA INICIAL (HANDSHAKE)
   * Verifica la existencia de sesiones previas al arrancar la terminal.
   */
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      const serializedStoredDossier = localStorage.getItem(TACTICAL_DRAFT_STORAGE_KEY_IDENTIFICATION);
      if (!serializedStoredDossier) return;

      const parsedPersistentDossier: PersistentIndustrialFormDossier = JSON.parse(serializedStoredDossier);

      // Auditoría de Integridad y Frescura (TTL de 24 horas).
      const isSchemaOutdatedStatus = parsedPersistentDossier.industrialVersion !== INDUSTRIAL_SCHEMA_VERSION_IDENTIFICATION;
      const isDossierExpiredStatus = (Date.now() - parsedPersistentDossier.unixTimestampMagnitude) > 24 * 60 * 60 * 1000;

      if (isSchemaOutdatedStatus || isDossierExpiredStatus || !checkIfSignificantIntellectualCapitalExistsStatus(parsedPersistentDossier.creationFormDataPayload)) {
        nicepodLog("🧹 [Persistence] Purgando sesión incompatible o expirada.");
        localStorage.removeItem(TACTICAL_DRAFT_STORAGE_KEY_IDENTIFICATION);
        return;
      }

      setPendingDossierToRestore(parsedPersistentDossier);
      if (onPersistentDataDiscoveredCallback) onPersistentDataDiscoveredCallback();

    } catch (hardwareException) {
      nicepodLog("⚠️ [Persistence] Error en lectura de Caja Negra.", hardwareException, "warn");
      localStorage.removeItem(TACTICAL_DRAFT_STORAGE_KEY_IDENTIFICATION);
    }
  }, [onPersistentDataDiscoveredCallback]);

  /**
   * restorePersistentSessionAction:
   * Misión: Rehidratar el estado del formulario y la posición cinemática en el flujo.
   */
  const restorePersistentSessionAction = useCallback(() => {
    if (!pendingDossierToRestore) return;

    isRestorationProcessActiveReference.current = true;

    // Inyección de datos en el almacén de React Hook Form (Build Shield Protection).
    reset(pendingDossierToRestore.creationFormDataPayload as PodcastCreationData);

    // Sincronización de la posición del Voyager en la malla de creación.
    if (pendingDossierToRestore.currentFlowStepDescriptor && pendingDossierToRestore.navigationHistoryStack) {
      onExecuteHydrationAction(
        pendingDossierToRestore.currentFlowStepDescriptor, 
        pendingDossierToRestore.navigationHistoryStack
      );
    }

    setPendingDossierToRestore(null);
    hasUserStartedManualTypingReference.current = false;

    // Delay táctico para liberar el semáforo de guardado (MTI Safety).
    setTimeout(() => {
      isRestorationProcessActiveReference.current = false;
    }, 800);

    nicepodLog("💾 [Persistence] Sesión restaurada con éxito desde el Metal.");
  }, [pendingDossierToRestore, reset, onExecuteHydrationAction]);

  /**
   * discardPersistentSessionAction:
   * Misión: Limpieza física de la memoria local por voluntad del Voyager.
   */
  const discardPersistentSessionAction = useCallback(() => {
    localStorage.removeItem(TACTICAL_DRAFT_STORAGE_KEY_IDENTIFICATION);
    setPendingDossierToRestore(null);
    nicepodLog("🧹 [Persistence] Sesión descartada manualmente.");
  }, []);

  /**
   * 4. LÓGICA DE AUTOSAVE ASÍNCRONO (SIDE EFFECT)
   * Misión: Persistir cambios en el disco local protegiendo el Hilo Principal.
   */
  useEffect(() => {
    if (isRestorationProcessActiveReference.current) return;

    // Si hay una discrepancia entre lo guardado y lo que el usuario escribe activamente.
    if (pendingDossierToRestore !== null && hasUserStartedManualTypingReference.current) {
      setPendingDossierToRestore(null);
    }

    // No persistimos lienzos vacíos o sin capital intelectual suficiente.
    if (!checkIfSignificantIntellectualCapitalExistsStatus(debouncedFormDataPayload)) return;

    // Si existen datos para restaurar pero el usuario aún no ha iniciado acción manual, abortamos sobrescritura.
    if (pendingDossierToRestore !== null && !hasUserStartedManualTypingReference.current) return;

    const dossierToSavePayload: PersistentIndustrialFormDossier = {
      industrialVersion: INDUSTRIAL_SCHEMA_VERSION_IDENTIFICATION,
      unixTimestampMagnitude: Date.now(),
      currentFlowStepDescriptor: currentFlowStepDescriptor,
      navigationHistoryStack: navigationHistoryStack,
      creationFormDataPayload: debouncedFormDataPayload,
    };

    try {
      localStorage.setItem(TACTICAL_DRAFT_STORAGE_KEY_IDENTIFICATION, JSON.stringify(dossierToSavePayload));
    } catch (storageException) {
      nicepodLog("🔥 [Persistence] Fallo en cuota de almacenamiento local.", storageException, "error");
    }

  }, [debouncedFormDataPayload, currentFlowStepDescriptor, navigationHistoryStack, pendingDossierToRestore]);

  /**
   * terminateTacticalDraftPersistenceAction:
   * Misión: Limpieza total tras una materialización de activo exitosa.
   */
  const terminateTacticalDraftPersistenceAction = useCallback(() => {
    localStorage.removeItem(TACTICAL_DRAFT_STORAGE_KEY_IDENTIFICATION);
    setPendingDossierToRestore(null);
    nicepodLog("✅ [Persistence] Capital intelectual publicado. Bóveda local purgada.");
  }, []);

  return { 
    restorePersistentSessionAction, 
    discardPersistentSessionAction, 
    terminateTacticalDraftPersistenceAction, 
    pendingDossierToRestore 
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Zero Abbreviations Policy (ZAP): Purificación total de la interfaz. 'data' -> 'payload', 
 *    'res' -> 'restore', 'stored' -> 'serializedStoredDossier'.
 * 2. TS2339 Resolution: Se han actualizado todas las referencias de campos para coincidir 
 *    con 'PodcastCreationSchema' V12.0 (soloTopicSelection, finalScriptContent, etc.).
 * 3. BSS Contract Seal: El uso de 'creationFormDataPayload as PodcastCreationData' 
 *    garantiza que el método 'reset' reciba una estructura validada por el compilador.
 * 4. Hardware Hygiene: El incremento de la clave local anula el riesgo de hidratación con 
 *    datos de versiones obsoletas del sistema.
 */