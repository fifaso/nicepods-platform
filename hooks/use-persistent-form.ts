/**
 * ARCHIVO: hooks/use-persistent-form.ts
 * VERSIÓN: 5.0 (NicePod Persistent Flight Recorder - BSS Final Seal Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Garantizar la recuperación de borradores locales en el Metal del dispositivo, 
 * evitando colisiones con esquemas obsoletos y protegiendo el capital intelectual 
 * del Voyager ante fallos de red o cierres inesperados.
 * [REFORMA V5.0]: Resolución definitiva de TS2339 y TS2551. Sincronización nominal 
 * absoluta con 'PodcastCreationSchema' V12.0. Aplicación integral de la Zero 
 * Abbreviations Policy (ZAP). Elevación de la versión de esquema industrial.
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
 * Misión: Asegurar la segregación de datos para evitar la corrupción por versiones previas.
 */
const TACTICAL_DRAFT_STORAGE_KEY_IDENTIFICATION = "nicepod_tactical_flight_recorder_v12";
const INDUSTRIAL_SCHEMA_VERSION_IDENTIFICATION = "12.0";

/**
 * INTERFAZ: PersistentIndustrialFormDossier
 * Representa el snapshot atómico de la sesión de creación persistido físicamente.
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

  // I. Auditoría de Tópicos y Ejes de Investigación
  const isTopicDataPresentStatus = !!(
    creationFormDataPayload.soloTopicSelection?.trim() ||
    creationFormDataPayload.linkTopicPrimary?.trim() ||
    creationFormDataPayload.linkTopicSecondary?.trim() ||
    creationFormDataPayload.questionToAnswerText?.trim()
  );

  // II. Auditoría de Motivación y ADN Cognitivo
  const isMotivationDataPresentStatus = !!(
    creationFormDataPayload.soloMotivationContentText?.trim() ||
    creationFormDataPayload.legacyLessonContentText?.trim()
  );

  // III. Auditoría de Producción Avanzada
  const isAdvancedProductionPhaseActiveStatus = !!creationFormDataPayload.finalScriptContent;

  return (
    isTopicDataPresentStatus || 
    isMotivationDataPresentStatus || 
    isAdvancedProductionPhaseActiveStatus
  );
}

/**
 * HOOK: usePersistentIndustrialFormAuthority
 * Orquestador de la "Caja Negra" local de la terminal de forja NicePod.
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

  // Estados de control soberano con nomenclatura purificada (ZAP)
  const [pendingDossierToRestore, setPendingDossierToRestore] = useState<PersistentIndustrialFormDossier | null>(null);
  const isRestorationProcessActiveReference = useRef<boolean>(false);
  const hasUserStartedManualTypingReference = useRef<boolean>(false);

  /** 
   * [MTI SAFETY]: Debounce de 1500ms para minimizar el impacto de I/O síncrono 
   * en el Hilo Principal (Main Thread) durante la escritura en LocalStorage.
   */
  const debouncedFormDataPayload = useDebounce(currentFormDataSnapshot, 1500);

  /**
   * EFECTO: Monitor de Actividad Humana
   * Misión: Detectar si el Voyager inicia una nueva forja para invalidar restauraciones.
   */
  useEffect(() => {
    if (!isRestorationProcessActiveReference.current && checkIfSignificantIntellectualCapitalExistsStatus(currentFormDataSnapshot)) {
      hasUserStartedManualTypingReference.current = true;
    }
  }, [currentFormDataSnapshot]);

  /**
   * 1. PROTOCOLO DE LECTURA INICIAL (HANDSHAKE)
   * Misión: Verificar la existencia de sesiones previas en el Metal al arrancar.
   */
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      const serializedStoredDossier = localStorage.getItem(TACTICAL_DRAFT_STORAGE_KEY_IDENTIFICATION);
      if (!serializedStoredDossier) return;

      const parsedPersistentDossier: PersistentIndustrialFormDossier = JSON.parse(serializedStoredDossier);

      // Auditoría de Integridad Contractual y Frescura Temporal (TTL 24h).
      const isSchemaOutdatedStatus = parsedPersistentDossier.industrialVersion !== INDUSTRIAL_SCHEMA_VERSION_IDENTIFICATION;
      const isDossierExpiredStatus = (Date.now() - parsedPersistentDossier.unixTimestampMagnitude) > 24 * 60 * 60 * 1000;

      if (
        isSchemaOutdatedStatus || 
        isDossierExpiredStatus || 
        !checkIfSignificantIntellectualCapitalExistsStatus(parsedPersistentDossier.creationFormDataPayload)
      ) {
        nicepodLog("🧹 [Persistence] Purgando snapshot incompatible o caducado.");
        localStorage.removeItem(TACTICAL_DRAFT_STORAGE_KEY_IDENTIFICATION);
        return;
      }

      setPendingDossierToRestore(parsedPersistentDossier);
      if (onPersistentDataDiscoveredCallback) onPersistentDataDiscoveredCallback();

    } catch (hardwareException: unknown) {
      nicepodLog("⚠️ [Persistence] Error crítico en lectura de Caja Negra.", hardwareException, "warn");
      localStorage.removeItem(TACTICAL_DRAFT_STORAGE_KEY_IDENTIFICATION);
    }
  }, [onPersistentDataDiscoveredCallback]);

  /**
   * restorePersistentSessionAction:
   * Misión: Rehidratar el estado del formulario y la posición cinemática en la malla.
   */
  const restorePersistentSessionAction = useCallback(() => {
    if (!pendingDossierToRestore) return;

    isRestorationProcessActiveReference.current = true;

    // Inyección de datos en el almacén de React Hook Form (Build Shield Protection).
    reset(pendingDossierToRestore.creationFormDataPayload as PodcastCreationData);

    // Sincronización del Voyager en la trayectoria maestra de la forja.
    if (pendingDossierToRestore.currentFlowStepDescriptor && pendingDossierToRestore.navigationHistoryStack) {
      onExecuteHydrationAction(
        pendingDossierToRestore.currentFlowStepDescriptor, 
        pendingDossierToRestore.navigationHistoryStack
      );
    }

    setPendingDossierToRestore(null);
    hasUserStartedManualTypingReference.current = false;

    // Delay táctico para liberar el semáforo de persistencia y evitar sobrescrituras.
    setTimeout(() => {
      isRestorationProcessActiveReference.current = false;
    }, 1000);

    nicepodLog("💾 [Persistence] Registro de vuelo restaurado con éxito.");
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
   * 4. LÓGICA DE AUTOSAVE ASÍNCRONO (FLIGHT RECORDER)
   * Misión: Persistir cambios en el Metal protegiendo el Hilo Principal.
   */
  useEffect(() => {
    if (isRestorationProcessActiveReference.current) return;

    // Si el Voyager inicia una nueva trayectoria, invalidamos el dossier pendiente.
    if (pendingDossierToRestore !== null && hasUserStartedManualTypingReference.current) {
      setPendingDossierToRestore(null);
    }

    // No persistimos estados vacíos o carentes de valor intelectual significativo.
    if (!checkIfSignificantIntellectualCapitalExistsStatus(debouncedFormDataPayload)) return;

    // Si existe una restauración pendiente no aceptada, bloqueamos la sobrescritura.
    if (pendingDossierToRestore !== null && !hasUserStartedManualTypingReference.current) return;

    const dossierToSavePayload: PersistentIndustrialFormDossier = {
      industrialVersion: INDUSTRIAL_SCHEMA_VERSION_IDENTIFICATION,
      unixTimestampMagnitude: Date.now(),
      currentFlowStepDescriptor: currentFlowStepDescriptor,
      navigationHistoryStack: navigationHistoryStack,
      creationFormDataPayload: debouncedFormDataPayload,
    };

    try {
      localStorage.setItem(
        TACTICAL_DRAFT_STORAGE_KEY_IDENTIFICATION, 
        JSON.stringify(dossierToSavePayload)
      );
    } catch (storageException: unknown) {
      nicepodLog("🔥 [Persistence] Cuota de disco local saturada.", storageException, "error");
    }

  }, [debouncedFormDataPayload, currentFlowStepDescriptor, navigationHistoryStack, pendingDossierToRestore]);

  /**
   * terminateTacticalDraftPersistenceAction:
   * Misión: Purga total tras una materialización de activo exitosa en el Metal.
   */
  const terminateTacticalDraftPersistenceAction = useCallback(() => {
    localStorage.removeItem(TACTICAL_DRAFT_STORAGE_KEY_IDENTIFICATION);
    setPendingDossierToRestore(null);
    nicepodLog("✅ [Persistence] Capital intelectual publicado. Registro de vuelo cerrado.");
  }, []);

  return { 
    restorePersistentSessionAction, 
    discardPersistentSessionAction, 
    terminateTacticalDraftPersistenceAction, 
    pendingDossierToRestore 
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Build Shield Final Seal: Resolución definitiva de TS2339 y TS2551 mediante la 
 *    sincronización con descriptores purificados V12.0 (soloTopicSelection, etc.).
 * 2. Zero Abbreviations Policy (ZAP): Purificación total de la interfaz. 'data' -> 'payload', 
 *    'res' -> 'restoration', 'id' -> 'identification', 'err' -> 'hardwareException'.
 * 3. MTI Isolation: El incremento del debounce a 1500ms y el diferimiento de logs 
 *    aseguran que la persistencia no degrade la fluidez cinemática de 60 FPS.
 * 4. Hardware Hygiene: El protocolo de versiones de almacenamiento garantiza que 
 *    la terminal nunca nazca con estados corruptos de arquitecturas de legado.
 */